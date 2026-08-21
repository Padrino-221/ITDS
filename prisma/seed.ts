import { PrismaClient, DegreeLevel, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { seedLearn } from "./seed-learn";

const prisma = new PrismaClient();

const img = (path: string) => `/images/${path}`;

async function main() {
  // Bootstrap mode (set by prisma/bootstrap.ts for deployments) fills in only
  // rows that don't exist yet, so re-running the seed against a live database
  // never overwrites curated content. The plain `npm run db:seed` keeps the
  // full reset/resync behaviour for local development.
  const bootstrap = process.env.SEED_BOOTSTRAP === "true";

  // Safety guard: the full (overwriting) seed is meant for local development
  // only. Deployment pipelines must use the bootstrap seed (missing rows
  // only) via prisma/bootstrap.ts — otherwise a push-triggered deploy could
  // silently overwrite curated production content (settings, news, projects,
  // lessons…) with the seed defaults. Refuse to run the overwriting seed
  // against a production database unless explicitly allowed.
  if (
    !bootstrap &&
    process.env.NODE_ENV === "production" &&
    process.env.SEED_ALLOW_PRODUCTION !== "true"
  ) {
    console.error(
      "Refusing to run the full seed in production — it would overwrite curated content.\n" +
        "Use `npm run db:bootstrap` (missing rows only), or set SEED_ALLOW_PRODUCTION=true to override."
    );
    process.exit(1);
  }

  console.log(bootstrap ? "Bootstrapping database (missing rows only)…" : "Seeding database…");

  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  const adminPassword = await hash("itds-admin123", 12);
  const editorPassword = await hash("editor123", 12);

  await prisma.user.upsert({
    where: { email: "admin@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "ITDS Administrator",
      email: "admin@itds.uenr.edu.gh",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: "editor@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "Content Editor",
      email: "editor@itds.uenr.edu.gh",
      passwordHash: editorPassword,
      role: Role.EDITOR,
    },
  });
  const lecturerPassword = await hash("lecturer123", 12);
  await prisma.user.upsert({
    where: { email: "lecturer@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "Dr. Yaw Anokye-Acheampong",
      email: "lecturer@itds.uenr.edu.gh",
      passwordHash: lecturerPassword,
      role: Role.LECTURER,
    },
  });

  // Learner account for the E-Learning Hub — separate table/session from the
  // staff accounts above (see src/lib/learn-auth.ts).
  const studentPassword = await hash("student123", 12);
  await prisma.learner.upsert({
    where: { email: "student@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "Ama Owusu",
      email: "student@itds.uenr.edu.gh",
      passwordHash: studentPassword,
    },
  });

  // ------------------------------------------------------------------
  // SPMS Supervisor accounts (Student Project Management System)
  // ------------------------------------------------------------------
  const spmsAdminPassword = await hash("spms-admin123", 12);
  await prisma.supervisor.upsert({
    where: { email: "spms-admin@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "SPMS Administrator",
      email: "spms-admin@itds.uenr.edu.gh",
      passwordHash: spmsAdminPassword,
      role: "ADMIN",
      slug: "spms-administrator",
    },
  });

  const spmsLecturerPassword = await hash("spms-lecturer123", 12);
  await prisma.supervisor.upsert({
    where: { email: "spms-lecturer@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "Dr. Yaw Anokye-Acheampong",
      email: "spms-lecturer@itds.uenr.edu.gh",
      passwordHash: spmsLecturerPassword,
      role: "LECTURER",
      slug: "yaw-anokye-acheampong",
      userTitle: "Dr.",
      jobRank: "Lecturer",
      profilePhoto: img("lecturers/yaw-anokye-acheampong.jpg"),
      researchArea1: "Web Engineering",
      researchArea2: "Software Architecture",
      about:
        "Dr. Yaw Anokye-Acheampong is a Lecturer specialising in web engineering and software architecture. He supervises a wide range of web application projects and is passionate about practical, industry-ready software development.",
    },
  });

  // ------------------------------------------------------------------
  // Settings
  // ------------------------------------------------------------------
  const settings: Array<[string, string]> = [
    [
      "site_name",
      "ITDS | UENR",
    ],
    [
      "site_tagline",
      "Department of Information Technology & Decision Sciences",
    ],
    [
      "announcement",
      "Applications for the 2026/2027 academic year are now open. Visit the UENR admissions portal for details.",
    ],
    [
      "hero_slides",
      JSON.stringify([
        {
          title: "Where Technology Meets Decision Science",
          subtitle:
            "The Department of Information Technology & Decision Sciences prepares students to design, build, and lead the digital future.",
image: img("hero/slide.jpg"),
              cta: { label: "Explore Project Works", href: "/projects" },
        },
        {
          title: "Over 4,000 Students. One Community of Innovators.",
          subtitle:
            "From machine learning to mobile development, our students turn ideas into working systems.",
image: img("hero/slide2.jpg"),
              cta: { label: "Meet Our Lecturers", href: "/lecturers" },
        },
        {
          title: "The UENR Tech Fair — Our Flagship Event",
          subtitle:
            "An annual showcase of student innovation, industry partnerships and cutting-edge research.",
image: img("hero/slide3.jpg"),
              cta: { label: "Latest News", href: "/news" },
        },
      ]),
    ],
    [
      "stats",
      JSON.stringify([
        { value: "4000+", label: "Registered Students" },
        { value: "30+", label: "Skilled Lecturers" },
        { value: "1200+", label: "Project Works" },
        { value: "5", label: "Research Areas" },
      ]),
    ],
    [
      "welcome",
      JSON.stringify({
        heading: "Welcome Message From HOD",
        name: "Prof. Peter Appiahene",
        title: "Associate Professor & Head of Department",
        image: img("about/students.jpg"),
        message:
          "Welcome to the Department of Information Technology and Decision Sciences at the University of Energy and Natural Resources. We are a young and rapidly growing department, committed to academic excellence, innovation and service to society. Our Student Project Management System (SPMS) keeps a comprehensive record of every final-year project, making our students' research visible to the world. I invite you to explore our website, learn about our programmes, and join us on this exciting journey.",
      }),
    ],
    [
      "featured_links",
      JSON.stringify([
        { title: "Project Works", description: "Browse all student project works uploaded on the platform.", href: "/projects", icon: "folder" },
        { title: "News & Events", description: "Get the latest updates on News & Events in the ITDS Department.", href: "/news", icon: "newspaper" },
        { title: "ITDS Alumni Survey", description: "Alumni survey for academic quality enhancement.", href: "/contact", icon: "clipboard" },
        { title: "UENR Tech Fair Gallery", description: "Click to view UENR TECH FAIR 2026 images.", href: "/news", icon: "image" },
      ]),
    ],
    [
      "contact",
      JSON.stringify({
        email: "itds@uenr.edu.gh",
        phone: "+233 3520 90004",
        address: "Department of ITDS, School of Physical & Mathematical Sciences, UENR, P.O. Box 214, Sunyani, Ghana",
        hours: "Monday – Friday, 8:00am – 5:00pm",
      }),
    ],
    [
      "socials",
      JSON.stringify({
        facebook: "https://facebook.com",
        twitter: "https://x.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
      }),
    ],
    [
      "about_story",
      "Established in 2023, the Department of Information Technology and Decision Sciences (ITDS) is one of the fastest-growing departments at the University of Energy and Natural Resources (UENR). Under the School of Physical and Mathematical Sciences (SPMS), the department has grown to serve over 4,000 registered students across undergraduate, postgraduate and diploma programmes. Our mission is to produce graduates who are not only technically skilled but also capable of making data-informed decisions that transform organisations and communities.",
    ],
    [
      "about_vision",
      "To be a leading centre of excellence in Information Technology and Decision Sciences education, research and innovation in Africa.",
    ],
    [
      "about_mission",
      "To equip students with the knowledge, skills and ethical values required to design, build and manage information systems that solve real-world problems.",
    ],
    [
      "core_values",
      JSON.stringify([
        { title: "Integrity", description: "We act with honesty and uphold the highest ethical standards in teaching, research and service." },
        { title: "Innovation", description: "We embrace creativity and emerging technologies to stay ahead of the curve." },
        { title: "Teamwork", description: "We collaborate across disciplines to achieve shared goals." },
        { title: "Excellence", description: "We pursue the highest quality in everything we do." },
      ]),
    ],
    [
      "acronym_values",
      JSON.stringify([
        { letter: "I", word: "Innovation", description: "Championing new ideas and emerging technologies." },
        { letter: "T", word: "Teamwork", description: "Working together to achieve outstanding results." },
        { letter: "D", word: "Discipline", description: "Commitment, consistency and professional conduct." },
        { letter: "S", word: "Service", description: "Using technology to serve humanity and society." },
      ]),
    ],
    [
      "spms_highlights",
      JSON.stringify([
        { title: "Comprehensive Project Repository", description: "Every undergraduate, postgraduate and diploma project, archived and searchable." },
        { title: "Supervisor Matching", description: "Projects are linked to their supervising lecturers for full traceability." },
        { title: "Progress Tracking", description: "Students and supervisors can track project milestones across the academic year." },
        { title: "Digital Archive", description: "A lasting academic legacy for the department, accessible to the world." },
      ]),
    ],
    [
      "its_story",
      "The Information Technology Society (ITS) is the official student association of the ITDS Department. The society organises the annual UENR Tech Fair, orientation programmes, industry talks, hackathons and community outreach initiatives. It serves as a bridge between students, the department and industry partners.",
    ],
    [
      "its_objectives",
      JSON.stringify([
        "To promote academic excellence and peer learning among ITDS students.",
        "To organise the annual UENR Tech Fair and other innovation showcases.",
        "To connect students with industry mentors, internships and career opportunities.",
        "To foster a vibrant community of innovators and future tech leaders.",
      ]),
    ],
  ];

  for (const [key, value] of settings) {
    if (bootstrap) {
      const existing = await prisma.setting.findUnique({ where: { key } });
      if (existing) continue;
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ------------------------------------------------------------------
  // Supervisors (public lecturer profiles via SPMS)
  // ------------------------------------------------------------------
  const supervisors = [
    {
      slug: "peter-appiahene",
      name: "Peter Appiahene",
      userTitle: "Prof.",
      jobRank: "Associate Professor",
      profilePhoto: img("lecturers/peter-appiahene.jpg"),
      email: "peter.appiahene@uenr.edu.gh",
      researchArea1: "Machine Learning",
      researchArea2: "Artificial Intelligence",
      about:
        "Prof. Peter Appiahene is an Associate Professor and the Head of the Department of Information Technology and Decision Sciences. He holds a PhD in Computer Science and has published extensively on the application of machine learning to education and agriculture. He leads the department's vision of technology-driven academic excellence.",
    },
    {
      slug: "felicia-akoto-danso",
      name: "Felicia Akoto-Danso",
      userTitle: "Dr.",
      jobRank: "Senior Lecturer",
      profilePhoto: img("lecturers/emmanuel-boateng.jpg"),
      email: "felicia.akoto-danso@uenr.edu.gh",
      researchArea1: "Data Science",
      researchArea2: "Business Intelligence",
      about:
        "Dr. Felicia Akoto-Danso is a Senior Lecturer whose research focuses on data-driven decision making, business intelligence and decision support systems for organisations in developing economies.",
    },
    {
      slug: "michael-opoku",
      name: "Michael Opoku",
      userTitle: "Mr.",
      jobRank: "Lecturer",
      profilePhoto: img("lecturers/michael-opoku.jpg"),
      email: "michael.opoku@uenr.edu.gh",
      researchArea1: "Computer Networking",
      researchArea2: "Network Security",
      about:
        "Mr. Michael Opoku is a Lecturer with expertise in computer networking, network security and the Internet of Things. He coordinates the department's networking laboratory and mentors final-year networking projects.",
    },
    {
      slug: "ama-owusu-ansah",
      name: "Ama Owusu-Ansah",
      userTitle: "Mrs.",
      jobRank: "Lecturer",
      profilePhoto: img("lecturers/felicia-akoto-danso.jpg"),
      email: "ama.owusu-ansah@uenr.edu.gh",
      researchArea1: "Mobile Application Development",
      researchArea2: "Human-Computer Interaction",
      about:
        "Mrs. Ama Owusu-Ansah is a Lecturer focused on mobile application development and human-computer interaction. She leads the mobile development track and coordinates student innovation competitions.",
    },
    {
      slug: "emmanuel-boateng",
      name: "Emmanuel Boateng",
      userTitle: "Dr.",
      jobRank: "Senior Lecturer",
      profilePhoto: img("lecturers/abena-mensah.jpg"),
      email: "emmanuel.boateng@uenr.edu.gh",
      researchArea1: "Deep Learning",
      researchArea2: "Computer Vision",
      about:
        "Dr. Emmanuel Boateng is a Senior Lecturer whose research applies deep learning and computer vision to healthcare diagnostics and agriculture. He supervises MSc, MPhil and PhD candidates in these areas.",
    },
  ];

  for (const s of supervisors) {
    if (bootstrap) {
      const existing = await prisma.supervisor.findUnique({ where: { slug: s.slug } });
      if (existing) continue;
    }
    await prisma.supervisor.upsert({
      where: { slug: s.slug },
      update: { ...s },
      create: { ...s, passwordHash: spmsLecturerPassword, role: "LECTURER" },
    });
  }

  const bySlug = Object.fromEntries(
    (await prisma.supervisor.findMany()).map((s) => [s.slug, s.id])
  );

  // ------------------------------------------------------------------
  // News
  // ------------------------------------------------------------------
  const news = [
    {
      slug: "uenr-tech-fair-2026-held-successfully",
      title: "The 5th Edition of the UENR Tech Fair 2026 Held Successfully",
      category: "Events",
      image: img("news/event.jpg"),
      excerpt:
        "The 5th Edition of the UENR Tech Fair 2026 was successfully held, bringing together students, industry partners and innovators.",
      publishedAt: new Date("2026-06-20"),
      content:
        "The 5th Edition of the UENR Tech Fair 2026 was successfully held, drawing hundreds of students, faculty members and industry partners to the university campus.\n\nThe fair showcased more than 150 student projects spanning machine learning, web and mobile development, IoT and cybersecurity. Industry judges awarded prizes for the most innovative projects, and several students received internship offers from participating companies.\n\nThe Head of Department, Prof. Peter Appiahene, congratulated the Information Technology Society for organising yet another successful edition and encouraged students to turn their projects into startups.",
    },
    {
      slug: "tech-fair-2026-media-engagement",
      title: "UENR Tech Fair 2026 Media Engagement",
      category: "Events",
      image: img("news/workshop.jpg"),
      excerpt:
        "The UENR Tech Fair 2026 Media Engagement was held on Friday, 19th June, with representatives of the press and partner organisations in attendance.",
      publishedAt: new Date("2026-06-10"),
      content:
        "The UENR Tech Fair 2026 Media Engagement was held on Friday, 19th June at the department's conference hall.\n\nThe event briefed journalists and partner organisations on the activities lined up for the Tech Fair, including the project exhibition, industry panel discussions and the awards night. Media partners were taken on a tour of the department's laboratories and shown a preview of selected student projects.\n\nThe department expressed gratitude to the media for their continued support in projecting the work of ITDS students to the world.",
    },
    {
      slug: "itds-orientation-program-2026",
      title: "ITDS Orientation Program Welcomes New Students",
      category: "General",
      image: img("news/conference.jpg"),
      excerpt:
        "Fresh students were welcomed to the department with a comprehensive orientation covering programmes, facilities and student life.",
      publishedAt: new Date("2026-02-02"),
      content:
        "The ITDS Department welcomed its new cohort of students with an orientation programme held on the main campus.\n\nStudents were introduced to the department's programmes, laboratory facilities, the Student Project Management System (SPMS), and the activities of the Information Technology Society. Senior students shared tips on succeeding academically and making the most of university life.\n\nThe department wishes all new students a fulfilling academic journey.",
    },
    {
      slug: "alumni-survey-academic-quality",
      title: "ITDS Alumni Survey for Academic Quality Enhancement",
      category: "Announcements",
      image: img("about/students.jpg"),
      excerpt:
        "The department invites all alumni to participate in a survey aimed at enhancing the quality of our academic programmes.",
      publishedAt: new Date("2026-05-15"),
      content:
        "The ITDS Department is conducting an alumni survey as part of its continuous academic quality enhancement efforts.\n\nAll graduates of the department are invited to share feedback on how their training has served them in the workplace. The responses will inform curriculum reviews and improvements to teaching and learning.\n\nThe survey takes less than ten minutes to complete and can be accessed via the department's official communication channels.",
    },
    {
      slug: "spms-platform-launched",
      title: "Department Launches the Student Project Management System (SPMS)",
      category: "Announcements",
      image: img("research/ai.jpg"),
      excerpt:
        "The new SPMS platform gives students, supervisors and the public access to a comprehensive repository of project works.",
      publishedAt: new Date("2026-04-12"),
      content:
        "The department has officially launched the Student Project Management System (SPMS), a platform that archives every final-year project from undergraduate, postgraduate and diploma programmes.\n\nStudents can now upload their projects, supervisors can track progress, and the public can browse the repository by programme, academic year and degree level. The system positions the department as a leader in open academic research in the region.",
    },
    {
      slug: "industry-internship-partnerships",
      title: "ITDS Strengthens Industry Partnerships for Student Internships",
      category: "General",
      image: img("gallery/techfair.jpg"),
      excerpt:
        "New partnerships with technology firms will open more internship and mentorship opportunities for ITDS students.",
      publishedAt: new Date("2026-03-08"),
      content:
        "The ITDS Department has signed new partnership agreements with several technology firms to expand internship and mentorship opportunities for its students.\n\nUnder the agreements, students in their final years will be placed with partner companies for industrial attachments, while the firms will also contribute guest lectures and project supervision. The department believes these partnerships will bridge the gap between academia and industry.",
    },
  ];

  for (const n of news) {
    if (bootstrap) {
      const existing = await prisma.newsPost.findUnique({ where: { slug: n.slug } });
      if (existing) continue;
    }
    await prisma.newsPost.upsert({
      where: { slug: n.slug },
      update: { ...n },
      create: { ...n },
    });
  }

  // ------------------------------------------------------------------
  // Research areas
  // ------------------------------------------------------------------
  const researchAreas = [
    {
      slug: "machine-learning-ai",
      title: "Machine Learning & Artificial Intelligence",
      icon: "brain",
      image: img("research/security.jpg"),
      description:
        "Machine Learning research in Computer Science and Information Technology focuses on building intelligent systems that learn from data. Our students and staff apply ML to agriculture, healthcare, education and finance, developing models that improve decision making across Ghana and beyond.",
      order: 1,
    },
    {
      slug: "web-application-development",
      title: "Web Application Development",
      icon: "globe",
      image: img("research/ai.jpg"),
      description:
        "Web Development research focuses on the design, architecture and deployment of modern web applications. From responsive front-end experiences to scalable back-end services, our work explores the technologies that power today's digital economy.",
      order: 2,
    },
    {
      slug: "mobile-application-development",
      title: "Mobile Application Development",
      icon: "smartphone",
      image: img("research/mobile.jpg"),
      description:
        "Mobile Development research explores native and cross-platform application development, mobile UX and the use of mobile technologies to solve pressing problems in agriculture, health and education.",
      order: 3,
    },
    {
      slug: "networking-cybersecurity",
      title: "Networking & Cybersecurity",
      icon: "shield",
      image: img("research/networking.jpg"),
      description:
        "Networking research delves into the fundamentals of computer networks, network security, cloud infrastructure and the Internet of Things. Our researchers study how secure, resilient networks can support national digital transformation.",
      order: 4,
    },
    {
      slug: "data-science-analytics",
      title: "Data Science & Decision Analytics",
      icon: "chart",
      image: img("research/data.jpg"),
      description:
        "Data Science research combines statistics, computing and domain knowledge to extract insight from data. We apply these techniques to support evidence-based decision making in organisations, government and academia.",
      order: 5,
    },
  ];

  for (const r of researchAreas) {
    if (bootstrap) {
      const existing = await prisma.researchArea.findUnique({ where: { slug: r.slug } });
      if (existing) continue;
    }
    await prisma.researchArea.upsert({
      where: { slug: r.slug },
      update: { ...r },
      create: { ...r },
    });
  }

  // ------------------------------------------------------------------
  // Projects
  // ------------------------------------------------------------------
  const projects = [
    {
      slug: "crop-disease-detection-ml",
      title: "Crop Disease Detection Using Convolutional Neural Networks",
      studentName: "Ama Serwaa Mensah",
      program: "BSc. Information Technology",
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      academicYear: "2025/2026",
      image: img("projects/crop-disease.jpg"),
      supervisor: "emmanuel-boateng",
      abstract:
        "This project develops a deep learning system that detects and classifies crop diseases from leaf images using convolutional neural networks. The system achieved over 94% classification accuracy on a dataset of common Ghanaian staple crops and provides farmers with a low-cost diagnostic tool accessible via mobile phones.",
    },
    {
      slug: "ai-health-chatbot",
      title: "An AI-Powered Chatbot for Primary Health Information",
      studentName: "Kwabena Osei",
      program: "BSc. Information Technology",
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      academicYear: "2025/2026",
      image: img("projects/health-chatbot.jpg"),
      supervisor: "peter-appiahene",
      abstract:
        "This work builds a rule-based and machine-learning hybrid chatbot that provides reliable primary health information in local languages. The chatbot was evaluated by community health workers and shown to reduce the time patients spend seeking routine health information.",
    },
    {
      slug: "iot-smart-farm",
      title: "An IoT-Based Smart Farm Monitoring System",
      studentName: "Efua Nyarko",
      program: "BSc. Information Technology",
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      academicYear: "2024/2025",
      image: img("projects/smart-farm.jpg"),
      supervisor: "michael-opoku",
      abstract:
        "This project implements a wireless sensor network that monitors soil moisture, temperature and humidity on a farm, sending alerts to a farmer's mobile phone. The system demonstrated measurable water savings during a pilot on a tomato farm in the Bono Region.",
    },
    {
      slug: "face-recognition-attendance",
      title: "Face Recognition System for Lecture Attendance Tracking",
      studentName: "Nana Kofi Adjei",
      program: "BSc. Information Technology",
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      academicYear: "2025/2026",
      image: img("projects/face-recognition.jpg"),
      supervisor: "emmanuel-boateng",
      abstract:
        "This system uses computer vision and face recognition to automate lecture attendance. Students are identified as they enter the lecture hall and attendance is recorded in real time, eliminating manual roll calls and proxy attendance.",
    },
    {
      slug: "pharmacy-inventory-system",
      title: "Pharmacy Inventory Management System",
      studentName: "Akosua Frimpong",
      program: "Diploma in Information Technology",
      degreeLevel: DegreeLevel.DIPLOMA,
      academicYear: "2024/2025",
      image: img("projects/ecommerce.jpg"),
      supervisor: "yaw-anokye-acheampong",
      abstract:
        "A web-based inventory management system for community pharmacies, featuring stock tracking, expiry alerts and sales reporting. The system reduces stock-outs and waste through automated reorder notifications.",
    },
    {
      slug: "library-management-diploma",
      title: "Digital Library Management System for Basic Schools",
      studentName: "Yaw Boateng",
      program: "Diploma in Information Technology",
      degreeLevel: DegreeLevel.DIPLOMA,
      academicYear: "2025/2026",
      image: img("projects/student-performance.jpg"),
      supervisor: "felicia-akoto-danso",
      abstract:
        "This project digitises the operations of a basic school library, enabling electronic cataloguing, borrowing and returns. It was deployed at a pilot school and significantly reduced the time taken to process book loans.",
    },
    {
      slug: "social-media-sentiment-analysis",
      title: "Sentiment Analysis of Political Discourse on Social Media",
      studentName: "Esi Amoah",
      program: "MSc. Information Technology",
      degreeLevel: DegreeLevel.MSC,
      academicYear: "2025/2026",
      image: img("projects/social-media.jpg"),
      supervisor: "felicia-akoto-danso",
      abstract:
        "The rapid development of social media networks has increased the number of online discussions, particularly with regard to political events and elections. This study applies natural language processing and machine learning to analyse sentiment in political discourse on Ghanaian social media, providing insights for political analysts and researchers.",
    },
    {
      slug: "blockchain-land-registry",
      title: "A Blockchain-Based Land Registry Prototype",
      studentName: "Kofi Asante",
      program: "MSc. Information Technology",
      degreeLevel: DegreeLevel.MSC,
      academicYear: "2024/2025",
      image: img("projects/real-estate.jpg"),
      supervisor: "michael-opoku",
      abstract:
        "This research designs and implements a prototype blockchain system for land registration, addressing issues of fraud and disputes. The prototype demonstrates how distributed ledger technology can provide transparent, tamper-evident records of land ownership.",
    },
    {
      slug: "deep-learning-cardiac-diagnosis",
      title: "Deep Learning for ECG-Based Cardiac Abnormality Detection",
      studentName: "Abena Serwaah",
      program: "MPhil. Computer Science",
      degreeLevel: DegreeLevel.MPHIL,
      academicYear: "2025/2026",
      image: img("projects/health-chatbot.jpg"),
      supervisor: "emmanuel-boateng",
      abstract:
        "This thesis develops deep learning models for the automated detection of cardiac abnormalities from electrocardiogram (ECG) signals. The models were trained on publicly available ECG datasets and demonstrate high sensitivity, offering a promising tool for low-resource clinical settings.",
    },
    {
      slug: "ml-student-performance-prediction",
      title: "Predicting Student Academic Performance with Machine Learning",
      studentName: "Daniel Owusu",
      program: "MPhil. Information Technology",
      degreeLevel: DegreeLevel.MPHIL,
      academicYear: "2024/2025",
      image: img("projects/student-performance.jpg"),
      supervisor: "peter-appiahene",
      abstract:
        "Drawing on educational data mining techniques, this study predicts student academic performance using demographic, behavioural and assessment data. The resulting early-warning model helps universities identify at-risk students and intervene promptly.",
    },
    {
      slug: "federated-learning-healthcare",
      title: "Federated Learning for Privacy-Preserving Healthcare Analytics",
      studentName: "Sena Kpodo",
      program: "PhD. Computer Science",
      degreeLevel: DegreeLevel.PHD,
      academicYear: "2025/2026",
      image: img("research/data.jpg"),
      supervisor: "emmanuel-boateng",
      abstract:
        "This PhD research investigates federated learning frameworks that allow multiple health institutions to train machine learning models collaboratively without sharing raw patient data. The work addresses data privacy, communication efficiency and model fairness in distributed healthcare settings.",
    },
    {
      slug: "nlp-african-languages",
      title: "Natural Language Processing for Low-Resource African Languages",
      studentName: "Adwoa Manu",
      program: "PhD. Information Technology",
      degreeLevel: DegreeLevel.PHD,
      academicYear: "2024/2025",
      image: img("research/networking.jpg"),
      supervisor: "peter-appiahene",
      abstract:
        "This research advances natural language processing for low-resource African languages, creating annotated corpora and machine translation and speech systems for languages including Twi and Dagbani. The work aims to make digital services accessible to millions of speakers.",
    },
  ];

  for (const p of projects) {
    const { supervisor, ...data } = p;
    if (bootstrap) {
      const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
      if (existing) continue;
    }
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...data, supervisorId: bySlug[supervisor] },
      create: { ...data, supervisorId: bySlug[supervisor] },
    });
  }

  // ------------------------------------------------------------------
  // Gallery
  // ------------------------------------------------------------------
  const gallery = [
    { src: img("gallery/campus.jpg"), caption: "Main Campus", order: 1 },
    { src: img("gallery/lecture.jpg"), caption: "Lecture Session", order: 2 },
    { src: img("gallery/collaborative.jpg"), caption: "Collaborative Learning", order: 3 },
    { src: img("gallery/techfair.jpg"), caption: "UENR Tech Fair", order: 4 },
    { src: img("gallery/students.jpg"), caption: "Students at Work", order: 5 },
  ];

  for (const g of gallery) {
    const { src, ...rest } = g;
    const existing = await prisma.galleryImage.findFirst({ where: { src } });
    if (existing) {
      if (bootstrap) continue;
      await prisma.galleryImage.update({ where: { id: existing.id }, data: { ...rest } });
    } else {
      await prisma.galleryImage.create({ data: { ...g } });
    }
  }

  // ------------------------------------------------------------------
  // Programs
  // ------------------------------------------------------------------
  const programs = [
    {
      slug: "undergraduate",
      title: "Undergraduate Programmes",
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      overview: `The Department of Information Technology & Decision Sciences offers comprehensive undergraduate programmes that equip students with the knowledge and skills needed for careers in information technology, data science, and digital innovation. Our curriculum blends theoretical foundations with practical experience through project-based learning, industry partnerships, and state-of-the-art facilities.

Students gain exposure to programming, database management, networking, web development, and emerging technologies. The programme prepares graduates for roles in software development, IT consulting, systems analysis, and digital transformation across various sectors.`,
      learningObjectives: `Upon completion of the undergraduate programme, students will be able to:

- Design and develop software solutions to solve real-world problems
- Manage and analyze data using modern tools and techniques
- Understand computer networks, security, and infrastructure
- Apply IT principles to improve business processes and decision-making
- Communicate technical concepts effectively to diverse audiences
- Work collaboratively in multidisciplinary teams
- Demonstrate professional ethics and lifelong learning skills`,
      curriculumStructure: `**Year 1 — Foundation**
Introduction to Computer Science, Mathematics for IT, Introduction to Programming, Academic Writing, Physics for IT

**Year 2 — Core IT Skills**
Data Structures & Algorithms, Database Systems, Web Development, Operating Systems, Computer Networks, Software Engineering

**Year 3 — Advanced Topics**
Artificial Intelligence & Machine Learning, Data Analytics, Cloud Computing, Cybersecurity, IT Project Management, Decision Support Systems

**Year 4 — Specialization & Research**
Final Year Project, IT Internship/Industrial Attachment, Elective Courses (Mobile Development, IoT, Blockchain), Research Methods`,
      programmeContact: `**Head of Department:** Prof. [HOD Name]
**Email:** itds@uenr.edu.gh
**Phone:** +233-XXX-XXX-XXXX
**Office:** Department of IT & Decision Sciences, UENR`,
    },
    {
      slug: "diploma",
      title: "Diploma Programmes",
      degreeLevel: DegreeLevel.DIPLOMA,
      overview: `The Diploma programme in Information Technology provides a practical, hands-on introduction to the world of technology. Designed for students seeking entry-level IT skills, this programme covers essential areas including computer applications, basic programming, networking fundamentals, and IT support.

Graduates of the diploma programme are prepared for roles in IT support, helpdesk administration, basic web development, and computer system management. The programme also serves as a pathway to further studies at the undergraduate level.`,
      learningObjectives: `Upon completion of the diploma programme, students will be able to:

- Install, configure, and maintain computer systems and software
- Provide technical support and troubleshoot common IT issues
- Build basic websites using HTML, CSS, and JavaScript
- Understand networking fundamentals and basic database operations
- Apply computer literacy skills in professional environments
- Pursue further studies in information technology`,
      curriculumStructure: `**Semester 1**
Introduction to Computing, Computer Applications, Basic Programming, Mathematics for IT, Communication Skills

**Semester 2**
Web Development Fundamentals, Database Management, Computer Networking, IT Support & Maintenance, Operating Systems Basics

**Semester 3**
Systems Administration, Project Work, Industrial Attachment, Elective: Mobile App Development`,
      programmeContact: `**Head of Department:** Prof. [HOD Name]
**Email:** itds@uenr.edu.gh
**Phone:** +233-XXX-XXX-XXXX
**Office:** Department of IT & Decision Sciences, UENR`,
    },
    {
      slug: "msc",
      title: "MSc Programmes",
      degreeLevel: DegreeLevel.MSC,
      overview: `The Master of Science programmes at the Department of Information Technology & Decision Sciences offer advanced study in specialized areas of IT and data science. These programmes are designed for professionals seeking to deepen their expertise and for graduates preparing for leadership roles in technology-driven organizations.

Students engage in rigorous academic research, advanced practical projects, and industry-relevant coursework. The MSc programmes emphasize innovation, critical thinking, and the application of cutting-edge technologies to solve complex problems.`,
      learningObjectives: `Upon completion of the MSc programme, students will be able to:

- Conduct independent research in their chosen specialization
- Apply advanced analytical and computational methods to complex problems
- Design and evaluate sophisticated IT systems and architectures
- Lead technology projects and manage teams effectively
- Contribute to the body of knowledge through publications and innovation
- Evaluate emerging technologies for organizational impact`,
      curriculumStructure: `**Year 1 — Coursework**
Research Methods in IT, Advanced Database Systems, Advanced Networking & Security, Data Science & Analytics, Cloud Architecture, Elective 1

**Year 2 — Research**
Elective 2, Seminar Presentations, Thesis/Dissertation Research, Thesis Defense`,
      programmeContact: `**Head of Department:** Prof. [HOD Name]
**Email:** itds@uenr.edu.gh
**Phone:** +233-XXX-XXX-XXXX
**Office:** Department of IT & Decision Sciences, UENR`,
    },
    {
      slug: "mphil",
      title: "MPhil Programmes",
      degreeLevel: DegreeLevel.MPHIL,
      overview: `The Master of Philosophy programme is a research-intensive degree that prepares students for doctoral studies and advanced research careers. Students work closely with faculty supervisors to produce original research that contributes to the fields of information technology and decision sciences.

The MPhil programme emphasizes research methodology, critical analysis, and scholarly writing. Graduates are prepared for roles in academia, research institutions, and senior technical positions in industry.`,
      learningObjectives: `Upon completion of the MPhil programme, students will be able to:

- Formulate and test hypotheses through rigorous research methodologies
- Conduct original research that contributes to IT knowledge
- Write and present research findings at academic conferences and in journals
- Critically evaluate existing literature and identify research gaps
- Apply advanced statistical and analytical methods
- Demonstrate expertise in their chosen research area`,
      curriculumStructure: `**Year 1 — Coursework & Proposal**
Advanced Research Methods, Literature Review & Seminars, Advanced Topics in IT, Research Proposal Development, Elective Course

**Year 2 — Research & Thesis**
Thesis Research, Supervisor Meetings, Conference Presentations, Thesis Writing & Submission, Thesis Defense`,
      programmeContact: `**Head of Department:** Prof. [HOD Name]
**Email:** itds@uenr.edu.gh
**Phone:** +233-XXX-XXX-XXXX
**Office:** Department of IT & Decision Sciences, UENR`,
    },
    {
      slug: "phd",
      title: "PhD Programmes",
      degreeLevel: DegreeLevel.PHD,
      overview: `The Doctor of Philosophy programme is the highest academic qualification offered by the Department of Information Technology & Decision Sciences. It is designed for individuals committed to advancing the frontiers of knowledge through original, independent research.

PhD candidates work on cutting-edge problems in areas such as artificial intelligence, data science, cybersecurity, and information systems. The programme produces scholars who contribute to academia, industry innovation, and policy development in the technology sector.`,
      learningObjectives: `Upon completion of the PhD programme, students will be able to:

- Conduct independent, original research at the highest academic level
- Make significant contributions to the body of knowledge in IT
- Publish research in high-impact journals and present at international conferences
- Teach and mentor students at the university level
- Lead research teams and manage large-scale research projects
- Influence technology policy and practice through evidence-based recommendations`,
      curriculumStructure: `**Year 1 — Coursework**
Advanced Research Methodology, Philosophy of Science, Advanced seminars in specialization area, Qualifying Examination

**Year 2 — Research**
Thesis research, Supervisor meetings, Conference participation, Journal publication preparation

**Year 3 — Thesis**
Thesis writing, Internal review, External examination, Thesis defense & viva voce`,
      programmeContact: `**Head of Department:** Prof. [HOD Name]
**Email:** itds@uenr.edu.gh
**Phone:** +233-XXX-XXX-XXXX
**Office:** Department of IT & Decision Sciences, UENR`,
    },
  ];

  for (const program of programs) {
    const existing = await prisma.program.findUnique({ where: { slug: program.slug } });
    if (existing) {
      if (bootstrap) continue;
      await prisma.program.update({ where: { id: existing.id }, data: program });
    } else {
      await prisma.program.create({ data: program });
    }
  }

  // ------------------------------------------------------------------
  // E-Learning platform (/learn) — subjects, topics and lessons live in
  // prisma/seed-learn.ts
  await seedLearn(prisma, bootstrap);

  console.log("Seed complete ✅");
  console.log("Admin login:   admin@itds.uenr.edu.gh / itds-admin123");
  console.log("Editor login:  editor@itds.uenr.edu.gh / editor123");
  console.log("Lecturer login: lecturer@itds.uenr.edu.gh / lecturer123");
  console.log("Student login:  student@itds.uenr.edu.gh / student123");
  console.log("SPMS Admin:    spms-admin@itds.uenr.edu.gh / spms-admin123");
  console.log("SPMS Lecturer: spms-lecturer@itds.uenr.edu.gh / spms-lecturer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
