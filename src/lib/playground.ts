import "server-only";

/**
 * Code execution for the E-Learning playground.
 *
 * Two providers are supported (selected with PLAYGROUND_PROVIDER):
 *   - "wandbox" (default): free public API at wandbox.org, no key required.
 *   - "piston": a self-hosted Piston instance (or whitelisted endpoint). The
 *     public emkc.org Piston API has been whitelist-only since 2026, so to use
 *     it you must self-host: `docker run -p 2000:2000 ghcr.io/piston-cli/piston`
 *     and set PLAYGROUND_URL to e.g. http://localhost:2000/api/v2/piston/execute
 */

export const PLAYGROUND_LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "php",
  "bash",
] as const;

export type PlaygroundLanguage = (typeof PLAYGROUND_LANGUAGES)[number];

export function isPlaygroundLanguage(value: string): value is PlaygroundLanguage {
  return (PLAYGROUND_LANGUAGES as readonly string[]).includes(value);
}

const WANDBOX_COMPILERS: Record<PlaygroundLanguage, string> = {
  python: "cpython-3.13.8",
  javascript: "nodejs-20.17.0",
  typescript: "typescript-5.6.2",
  java: "openjdk-jdk-21+35",
  c: "gcc-12.3.0-c",
  cpp: "gcc-13.2.0",
  php: "php-8.3.12",
  bash: "bash",
};

const DEFAULT_WANDBOX_URL = "https://wandbox.org/api/compile.json";
const DEFAULT_PISTON_URL = "https://emkc.org/api/v2/piston/execute";

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
};

function fallbackUrl(envName: string, fallback: string): string {
  return process.env[envName] || fallback;
}

async function wandboxRun(language: PlaygroundLanguage, code: string): Promise<RunResult> {
  const url = fallbackUrl("PLAYGROUND_URL", DEFAULT_WANDBOX_URL);
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, compiler: WANDBOX_COMPILERS[language], options: "" }),
    signal: AbortSignal.timeout(25000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Execution service returned HTTP ${res.status}.`);
  }
  const data = (await res.json()) as {
    status?: unknown;
    program_output?: unknown;
    program_error?: unknown;
    compiler_output?: unknown;
    compiler_error?: unknown;
    program_message?: unknown;
    compiler_message?: unknown;
  };
  // `program_message` echoes program_output on success, so only treat
  // compiler/program *errors* as stderr.
  const stderr = [data.compiler_error, data.compiler_message, data.program_error]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join("\n");
  return {
    ok: String(data.status) === "0",
    stdout: typeof data.program_output === "string" ? data.program_output : "",
    stderr,
  };
}

async function pistonRun(language: PlaygroundLanguage, code: string): Promise<RunResult> {
  const url = fallbackUrl("PLAYGROUND_URL", DEFAULT_PISTON_URL);
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ language, files: [{ content: code }] }),
    signal: AbortSignal.timeout(25000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Execution service returned HTTP ${res.status}.`);
  }
  const data = (await res.json()) as {
    run?: { stdout?: unknown; stderr?: unknown; code?: unknown };
  };
  const run = data.run ?? {};
  return {
    ok: Number(run.code) === 0,
    stdout: typeof run.stdout === "string" ? run.stdout : "",
    stderr: typeof run.stderr === "string" ? run.stderr : "",
  };
}

/** Run code in the configured provider. Throws when the service is unreachable. */
export async function runCode(language: PlaygroundLanguage, code: string): Promise<RunResult> {
  if (process.env.PLAYGROUND_PROVIDER === "piston") {
    return pistonRun(language, code);
  }
  return wandboxRun(language, code);
}
