"use client";

import { useEffect, useRef, useState } from "react";
import { Info, MonitorPlay, Play, RotateCcw, TriangleAlert } from "lucide-react";

const WEB_LANGS = new Set(["html", "css"]);

type RunOutput = { stdout: string; stderr: string };

const editorClass =
  "w-full resize-y rounded-lg border border-forest-800 bg-forest-950 p-4 font-mono text-[13px] leading-relaxed text-emerald-100 placeholder:text-emerald-100/40 outline-none focus:ring-2 focus:ring-gold-500/40";

export default function Playground({ lang, starterCode }: { lang: string; starterCode: string }) {
  if (WEB_LANGS.has(lang)) {
    return <WebPlayground mode={lang as "html" | "css"} starterCode={starterCode} />;
  }
  return <ConsolePlayground lang={lang} starterCode={starterCode} />;
}

/**
 * Run-your-code playground for Python, JavaScript, TypeScript, Java, C, C++,
 * PHP and Bash. Sends the code to the server execution API and shows stdout/stderr.
 */
function ConsolePlayground({ lang, starterCode }: { lang: string; starterCode: string }) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: lang, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Execution failed.");
        return;
      }
      setOutput({ stdout: data.stdout ?? "", stderr: data.stderr ?? "" });
    } catch {
      setError("Could not reach the execution service.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-100 bg-forest-50/50 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
          <MonitorPlay className="h-4 w-4 text-gold-600" />
          {lang} · runnable
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCode(starterCode);
              setOutput(null);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running || code.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-forest-950 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {running ? "Running…" : "Run"}
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={10}
        placeholder="Type or paste your code here…"
        className={editorClass}
      />

      <div className="border-t border-forest-100 bg-forest-950 px-4 py-3">
        {error ? (
          <p className="flex items-start gap-2 font-mono text-[13px] text-red-300">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : output ? (
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-emerald-100">
            {output.stdout}
            {output.stderr && (
              <span className="text-amber-300">
                {output.stdout ? "\n" : ""}
                {output.stderr}
              </span>
            )}
          </pre>
        ) : (
          <p className="font-mono text-[13px] text-forest-200/50">
            Output appears here when you press Run.
          </p>
        )}
      </div>
    </div>
  );
}

/** Sample page the CSS playground styles, so every selector has a target. */
function cssSampleDoc(css: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
${css}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Styled by your CSS</h1>
      <p>This fixed sample page lets you experiment with selectors. Edit the CSS on the left and watch the preview update.</p>
      <button class="primary">Primary button</button>
      <button class="ghost">Ghost button</button>
      <a href="#">A link</a>
      <ul>
        <li>Item one</li>
        <li>Item two</li>
        <li>Item three</li>
      </ul>
    </div>
  </body>
</html>`;
}

/**
 * Live HTML/CSS playground: an editor with a sandboxed preview iframe. No
 * server round-trip — the preview is rendered entirely in the browser.
 */
function WebPlayground({ mode, starterCode }: { mode: "html" | "css"; starterCode: string }) {
  const [html, setHtml] = useState(mode === "html" ? starterCode : "");
  const [css, setCss] = useState(mode === "css" ? starterCode : "");
  const [preview, setPreview] = useState(() => (mode === "html" ? html : cssSampleDoc(css)));
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setPreview(mode === "html" ? html : cssSampleDoc(css)),
      400
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-100 bg-forest-50/50 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
          <MonitorPlay className="h-4 w-4 text-gold-600" />
          {mode === "html" ? "HTML · live preview" : "CSS · live preview"}
        </span>
        <button
          type="button"
          onClick={() => {
            setHtml(mode === "html" ? starterCode : "");
            setCss(mode === "css" ? starterCode : "");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="grid gap-px bg-forest-100 lg:grid-cols-2">
        <textarea
          value={mode === "html" ? html : css}
          onChange={(e) => (mode === "html" ? setHtml(e.target.value) : setCss(e.target.value))}
          spellCheck={false}
          rows={12}
          placeholder={mode === "html" ? "<!-- Your HTML here -->" : "/* Your CSS here */"}
          className={editorClass}
        />
        <div className="bg-white">
          <p className="border-b border-forest-100 bg-forest-50/50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Preview
          </p>
          <iframe
            title="Playground preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={preview}
            className="h-[420px] w-full bg-white"
          />
        </div>
      </div>

      {mode === "css" && (
        <p className="flex items-start gap-2 border-t border-forest-100 bg-gold-50/60 px-4 py-2.5 text-xs text-ink-soft">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
          Your CSS styles a fixed sample page (heading, buttons, links and a list) so every
          selector has something to target.
        </p>
      )}
    </div>
  );
}
