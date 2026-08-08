import { PrismaClient, DegreeLevel, Role, Prisma, LessonStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const img = (path: string) => `/images/${path}`;

async function main() {
  console.log("Seeding database…");

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
  const studentPassword = await hash("student123", 12);
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
  await prisma.user.upsert({
    where: { email: "student@itds.uenr.edu.gh" },
    update: {},
    create: {
      name: "Ama Owusu",
      email: "student@itds.uenr.edu.gh",
      passwordHash: studentPassword,
      role: Role.STUDENT,
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
          image: img("hero/slide-1.jpg"),
          cta: { label: "Explore Project Works", href: "/projects" },
        },
        {
          title: "Over 4,000 Students. One Community of Innovators.",
          subtitle:
            "From machine learning to mobile development, our students turn ideas into working systems.",
          image: img("hero/slide-2.jpg"),
          cta: { label: "Meet Our Lecturers", href: "/lecturers" },
        },
        {
          title: "The UENR Tech Fair — Our Flagship Event",
          subtitle:
            "An annual showcase of student innovation, industry partnerships and cutting-edge research.",
          image: img("hero/slide-3.jpg"),
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
        image: img("about/hod.jpg"),
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
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ------------------------------------------------------------------
  // Lecturers
  // ------------------------------------------------------------------
  const lecturers = [
    {
      slug: "peter-appiahene",
      name: "Prof. Peter Appiahene",
      title: "Associate Professor & Head of Department",
      photo: img("lecturers/peter-appiahene.jpg"),
      email: "peter.appiahene@uenr.edu.gh",
      researchInterests: "Machine Learning, Artificial Intelligence, Educational Data Mining",
      bio: "Prof. Peter Appiahene is an Associate Professor and the Head of the Department of Information Technology and Decision Sciences. He holds a PhD in Computer Science and has published extensively on the application of machine learning to education and agriculture. He leads the department's vision of technology-driven academic excellence.",
      order: 1,
    },
    {
      slug: "felicia-akoto-danso",
      name: "Dr. Felicia Akoto-Danso",
      title: "Senior Lecturer",
      photo: img("lecturers/emmanuel-boateng.jpg"),
      email: "felicia.akoto-danso@uenr.edu.gh",
      researchInterests: "Data Science, Business Intelligence, Decision Support Systems",
      bio: "Dr. Felicia Akoto-Danso is a Senior Lecturer whose research focuses on data-driven decision making, business intelligence and decision support systems for organisations in developing economies.",
      order: 2,
    },
    {
      slug: "michael-opoku",
      name: "Mr. Michael Opoku",
      title: "Lecturer",
      photo: img("lecturers/michael-opoku.jpg"),
      email: "michael.opoku@uenr.edu.gh",
      researchInterests: "Computer Networking, Network Security, IoT",
      bio: "Mr. Michael Opoku is a Lecturer with expertise in computer networking, network security and the Internet of Things. He coordinates the department's networking laboratory and mentors final-year networking projects.",
      order: 3,
    },
    {
      slug: "yaw-anokye-acheampong",
      name: "Dr. Yaw Anokye-Acheampong",
      title: "Lecturer",
      photo: img("lecturers/yaw-anokye-acheampong.jpg"),
      email: "yaw.anokye@uenr.edu.gh",
      researchInterests: "Web Engineering, Software Architecture, Cloud Computing",
      bio: "Dr. Yaw Anokye-Acheampong is a Lecturer specialising in web engineering and software architecture. He supervises a wide range of web application projects and is passionate about practical, industry-ready software development.",
      order: 4,
    },
    {
      slug: "ama-owusu-ansah",
      name: "Mrs. Ama Owusu-Ansah",
      title: "Lecturer",
      photo: img("lecturers/felicia-akoto-danso.jpg"),
      email: "ama.owusu-ansah@uenr.edu.gh",
      researchInterests: "Mobile Application Development, Human-Computer Interaction",
      bio: "Mrs. Ama Owusu-Ansah is a Lecturer focused on mobile application development and human-computer interaction. She leads the mobile development track and coordinates student innovation competitions.",
      order: 5,
    },
    {
      slug: "emmanuel-boateng",
      name: "Dr. Emmanuel Boateng",
      title: "Senior Lecturer",
      photo: img("lecturers/abena-mensah.jpg"),
      email: "emmanuel.boateng@uenr.edu.gh",
      researchInterests: "Deep Learning, Computer Vision, Health Informatics",
      bio: "Dr. Emmanuel Boateng is a Senior Lecturer whose research applies deep learning and computer vision to healthcare diagnostics and agriculture. He supervises MSc, MPhil and PhD candidates in these areas.",
      order: 6,
    },
  ];

  for (const l of lecturers) {
    await prisma.lecturer.upsert({
      where: { slug: l.slug },
      update: { ...l },
      create: { ...l },
    });
  }

  const bySlug = Object.fromEntries(
    (await prisma.lecturer.findMany()).map((l) => [l.slug, l.id])
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
    { src: img("gallery/graduation.jpg"), caption: "Graduation Day", order: 1 },
    { src: img("gallery/campus.jpg"), caption: "Main Campus", order: 2 },
    { src: img("gallery/lecture.jpg"), caption: "Lecture Session", order: 3 },
    { src: img("gallery/collaborative.jpg"), caption: "Collaborative Learning", order: 4 },
    { src: img("gallery/techfair.jpg"), caption: "UENR Tech Fair", order: 5 },
    { src: img("gallery/students.jpg"), caption: "Students at Work", order: 6 },
  ];

  for (const g of gallery) {
    const { src, ...rest } = g;
    const existing = await prisma.galleryImage.findFirst({ where: { src } });
    if (existing) {
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
      await prisma.program.update({ where: { id: existing.id }, data: program });
    } else {
      await prisma.program.create({ data: program });
    }
  }

  // ------------------------------------------------------------------
  // E-Learning platform (/learn)
  // ------------------------------------------------------------------
  const lecturerUser = await prisma.user.findUniqueOrThrow({
    where: { email: "lecturer@itds.uenr.edu.gh" },
  });

  type SeedLesson = {
    slug: string;
    title: string;
    objective: string;
    body: Array<{
      type: "heading" | "paragraph" | "code" | "list";
      [key: string]: unknown;
    }>;
    exercise?: string;
    quiz?: { question: string; options: string[]; answer: number }[];
    playground?: { lang: string; starter: string };
  };
  type SeedTopic = { title: string; slug: string; order: number; lessons: SeedLesson[] };
  type SeedSubject = {
    name: string;
    slug: string;
    description: string;
    topics: SeedTopic[];
  };

  const learnSubjects: SeedSubject[] = [
    {
      name: "Web Development",
      slug: "web-development",
      description:
        "Build modern websites and web applications with HTML, CSS and JavaScript.",
      topics: [
        {
          title: "HTML & CSS Basics",
          slug: "html-css-basics",
          order: 1,
          lessons: [
            {
              slug: "your-first-web-page",
              title: "Your First Web Page",
              objective:
                "By the end of this lesson you will be able to create a basic HTML page and view it in a browser.",
              body: [
                {
                  type: "paragraph",
                  text: "Every website you have visited is built from HTML — the HyperText Markup Language. HTML describes the structure of a page using tags.",
                },
                { type: "heading", text: "The anatomy of an HTML document", level: 2 },
                {
                  type: "code",
                  language: "html",
                  code: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, world!</h1>\n  </body>\n</html>`,
                },
                { type: "paragraph", text: "Let's break down each part:" },
                {
                  type: "list",
                  items: [
                    "<!DOCTYPE html> declares the document type",
                    "<html> wraps the whole page",
                    "<head> holds metadata and the page title",
                    "<body> holds everything visible on the page",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which tag wraps the visible content of a page?",
                  options: ["<head>", "<body>", "<title>", "<html>"],
                  answer: 1,
                },
                {
                  question: "What does HTML stand for?",
                  options: [
                    "HyperText Markup Language",
                    "HighText Machine Language",
                    "Hyperlink and Text Markup Language",
                    "Home Tool Markup Language",
                  ],
                  answer: 0,
                },
              ],
              exercise:
                "Create a page with a heading, one paragraph about yourself, and a list of three things you want to learn this semester.",
            },
            {
              slug: "text-links-images",
              title: "Text, Links & Images",
              objective:
                "By the end of this lesson you will be able to add headings, paragraphs, links and images to a web page.",
              body: [
                {
                  type: "paragraph",
                  text: "A useful web page is made of more than a single heading. This lesson covers the most common HTML elements: text containers, hyperlinks and images.",
                },
                { type: "heading", text: "Text elements", level: 2 },
                {
                  type: "code",
                  language: "html",
                  code: `<h1>About Me</h1>\n<h2>My Studies</h2>\n<p>I study Information Technology at UENR.</p>\n<p>I enjoy <strong>building</strong> things for the web and <em>learning</em> new tools.</p>`,
                },
                {
                  type: "paragraph",
                  text: "h1–h6 create headings, p creates a paragraph, strong makes text bold and em makes it italic.",
                },
                { type: "heading", text: "Links", level: 2 },
                {
                  type: "code",
                  language: "html",
                  code: `<a href="https://uenr.edu.gh">Visit UENR</a>`,
                },
                {
                  type: "paragraph",
                  text: "The a element creates a hyperlink. The href attribute tells the browser where the link goes.",
                },
                { type: "heading", text: "Images", level: 2 },
                {
                  type: "code",
                  language: "html",
                  code: `<img src="photos/me.jpg" alt="A photo of me" width="300">`,
                },
                {
                  type: "paragraph",
                  text: "img embeds a picture. The src attribute is the image location and alt provides a text description for screen readers and for when the image cannot load.",
                },
                {
                  type: "list",
                  items: [
                    "Use semantic tags (h1–h6, p, strong, em) instead of styling plain text",
                    "Always give images a descriptive alt attribute",
                    "Write link text that says where the link goes",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which element creates a hyperlink?",
                  options: ["<link>", "<a>", "<href>", "<url>"],
                  answer: 1,
                },
                {
                  question: "Which attribute provides alternative text for an image?",
                  options: ["src", "alt", "title", "href"],
                  answer: 1,
                },
              ],
              exercise:
                "Build an About Me page with your name as a heading, one paragraph, a link to your favourite website and an image.",
            },
            {
              slug: "styling-with-css",
              title: "Styling with CSS",
              objective:
                "By the end of this lesson you will be able to add CSS to an HTML page to control colours, fonts and spacing.",
              body: [
                {
                  type: "paragraph",
                  text: "HTML gives a page structure; CSS (Cascading Style Sheets) gives it style — colours, fonts, spacing and layout.",
                },
                { type: "heading", text: "Three ways to add CSS", level: 2 },
                {
                  type: "list",
                  items: [
                    "Inline — a style attribute on a single element",
                    "Internal — a <style> block in the page's <head>",
                    "External — a separate .css file linked with <link>",
                  ],
                },
                { type: "heading", text: "Selectors", level: 2 },
                {
                  type: "code",
                  language: "css",
                  code: `<style>\n  h1 { color: #3559ad; }\n  .highlight { background-color: #fdf0f4; }\n  #intro { font-size: 1.2rem; }\n</style>\n<h1 id="intro" class="highlight">Welcome</h1>`,
                },
                {
                  type: "paragraph",
                  text: "Selectors target elements: element names (h1), classes (.highlight) and ids (#intro). Classes are reusable; an id should appear once.",
                },
                { type: "heading", text: "Common properties", level: 2 },
                {
                  type: "list",
                  items: [
                    "color — text colour",
                    "background-color — element background",
                    "font-size — text size",
                    "margin — space outside the element",
                    "padding — space inside the element",
                  ],
                },
                {
                  type: "code",
                  language: "css",
                  code: `<style>\n  p { color: #0d2358; margin: 8px 0; padding: 4px; }\n  .card { border: 1px solid #d9e1f4; border-radius: 8px; padding: 16px; }\n</style>`,
                },
              ],
              quiz: [
                {
                  question: "Which CSS property changes the text colour?",
                  options: ["font-color", "text-color", "color", "background-color"],
                  answer: 2,
                },
                {
                  question: "How do you select an element with class=\"highlight\"?",
                  options: ["#highlight", "highlight", "*highlight", ".highlight"],
                  answer: 3,
                },
              ],
              exercise:
                "Take your About Me page and give the heading a colour, add a bordered card around the paragraph, and increase the font size.",
            },
          ],
        },
        {
          title: "JavaScript Fundamentals",
          slug: "javascript-fundamentals",
          order: 2,
          lessons: [
            {
              slug: "javascript-basics-variables",
              title: "JavaScript Basics & Variables",
              objective:
                "By the end of this lesson you will be able to store values in JavaScript variables and print messages to the console.",
              body: [
                {
                  type: "paragraph",
                  text: "JavaScript is the programming language of the web. It runs in every browser and lets you make pages interactive.",
                },
                { type: "heading", text: "Your first JavaScript", level: 2 },
                {
                  type: "code",
                  language: "javascript",
                  code: `console.log("Hello from JavaScript!");`,
                },
                {
                  type: "paragraph",
                  text: "console.log prints a message to the browser's developer console (press F12 to open it).",
                },
                { type: "heading", text: "Variables", level: 2 },
                {
                  type: "code",
                  language: "javascript",
                  code: `let name = "Ama";\nconst age = 21;\nconsole.log(name); // Ama\nconsole.log(age);  // 21`,
                },
                {
                  type: "paragraph",
                  text: "let declares a variable that can change later; const declares one that cannot be reassigned.",
                },
                { type: "heading", text: "Data types", level: 2 },
                {
                  type: "list",
                  items: [
                    "String — text, e.g. \"hello\"",
                    "Number — e.g. 42 or 3.14",
                    "Boolean — true or false",
                    "null — an intentionally empty value",
                    "undefined — a variable with no value yet",
                  ],
                },
                {
                  type: "code",
                  language: "javascript",
                  code: `let score = 87;\nconst passed = score >= 50;\nconsole.log("Score:", score, "Passed:", passed);`,
                },
              ],
              quiz: [
                {
                  question: "Which keyword declares a value that cannot be changed?",
                  options: ["let", "var", "const", "static"],
                  answer: 2,
                },
                {
                  question: "How do you print a message to the browser console?",
                  options: ["print()", "console.log()", "log()", "write()"],
                  answer: 1,
                },
              ],
              exercise: "Declare your name and your age, then print a sentence that uses both.",
              playground: {
                lang: "javascript",
                starter: `let name = "Ama";\nlet year = 2;\nconsole.log("Hello, " + name + " — Year " + year);`,
              },
            },
            {
              slug: "javascript-functions-events",
              title: "Functions & Events",
              objective:
                "By the end of this lesson you will be able to write JavaScript functions and respond to a button click.",
              body: [
                {
                  type: "paragraph",
                  text: "Functions let you package a piece of behaviour and reuse it. Events let your page react to what the user does.",
                },
                { type: "heading", text: "Defining a function", level: 2 },
                {
                  type: "code",
                  language: "javascript",
                  code: `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Kofi")); // Hello, Kofi!`,
                },
                {
                  type: "paragraph",
                  text: "function declares a function; return sends a value back to the caller.",
                },
                { type: "heading", text: "Responding to clicks", level: 2 },
                {
                  type: "code",
                  language: "html",
                  code: `<button id="btn">Click me</button>\n<script>\n  const btn = document.getElementById("btn");\n  btn.addEventListener("click", () => {\n    document.body.style.backgroundColor = "#d9e1f4";\n  });\n</script>`,
                },
                {
                  type: "paragraph",
                  text: "addEventListener listens for an event — here a click — and runs the given function when it happens.",
                },
                {
                  type: "list",
                  items: [
                    "Common events: click, submit, keydown, mouseover",
                    "getElementById finds an element by its id",
                    "Arrow functions (() => …) are a short way to write functions",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which method listens for a button click?",
                  options: ["onClick()", "addEventListener()", "attachEvent()", "listen()"],
                  answer: 1,
                },
                {
                  question: "What does return do inside a function?",
                  options: [
                    "Prints a value",
                    "Stops the browser",
                    "Sends a value back to the caller",
                    "Declares a variable",
                  ],
                  answer: 2,
                },
              ],
              exercise: "Write a function that converts Celsius to Fahrenheit and wire a button to run it.",
              playground: {
                lang: "javascript",
                starter: `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Ama"));`,
              },
            },
          ],
        },
      ],
    },
    {
      name: "Python Programming",
      slug: "python-programming",
      description:
        "Learn Python from first principles to writing real programs with confidence.",
      topics: [
        {
          title: "Getting Started with Python",
          slug: "getting-started-python",
          order: 1,
          lessons: [
            {
              slug: "your-first-python-program",
              title: "Your First Python Program",
              objective:
                "By the end of this lesson you will be able to write and run a Python program that prints output.",
              body: [
                {
                  type: "paragraph",
                  text: "Python is a general-purpose language known for its clear, readable syntax. It is a great first language and is used for web apps, data science and automation.",
                },
                { type: "heading", text: "Running Python", level: 2 },
                {
                  type: "list",
                  items: [
                    "Write code in a .py file, e.g. hello.py",
                    "Run it with: python hello.py (or python3 on some systems)",
                    "Or type code directly into the Python interpreter (the REPL)",
                  ],
                },
                { type: "heading", text: "Your first program", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `print("Hello, world!")`,
                },
                { type: "heading", text: "Comments", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `# This is a comment — Python ignores it\nprint("Hello, ITDS!")  # prints a message`,
                },
                { type: "heading", text: "Variables & f-strings", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `name = "Ama"\ncourse = "Information Technology"\nprint(f"{name} studies {course}.")`,
                },
                {
                  type: "paragraph",
                  text: "An f-string (the f before the quotes) lets you insert variable values directly into text.",
                },
              ],
              quiz: [
                {
                  question: "Which function prints output in Python?",
                  options: ["echo()", "write()", "print()", "log()"],
                  answer: 2,
                },
                {
                  question: "What symbol starts a comment in Python?",
                  options: ["//", "#", "<!--", "/*"],
                  answer: 1,
                },
              ],
              exercise: "Print your name, your programme and your favourite colour using three print statements.",
              playground: {
                lang: "python",
                starter: `print("Hello, world!")\nprint("I am learning Python.")`,
              },
            },
            {
              slug: "python-variables-data-types",
              title: "Variables & Data Types",
              objective:
                "By the end of this lesson you will be able to use numbers, strings and booleans in Python and check their types.",
              body: [
                {
                  type: "paragraph",
                  text: "Python figures out the type of a value automatically. You still need to know the types to write correct code.",
                },
                { type: "heading", text: "Numbers", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `age = 21            # int\nheight = 1.72       # float\nprint(age + 5)      # 26\nprint(height * 2)   # 3.44`,
                },
                { type: "heading", text: "Strings", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `greeting = "Hello"\nname = "Ama"\nprint(greeting + ", " + name)  # Hello, Ama\nprint(len(greeting))            # 5`,
                },
                { type: "heading", text: "Booleans & comparisons", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `is_student = True\nprint(21 > 18)      # True\nprint(21 == 18)     # False`,
                },
                { type: "heading", text: "Checking types", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `print(type(21))     # <class 'int'>\nprint(type(3.14))   # <class 'float'>\nprint(type("x"))    # <class 'str'>`,
                },
                {
                  type: "list",
                  items: [
                    "int — whole numbers",
                    "float — numbers with decimals",
                    "str — text",
                    "bool — True or False",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What does type(3.14) return?",
                  options: ["int", "float", "decimal", "number"],
                  answer: 1,
                },
                {
                  question: "Which operator checks if two values are equal?",
                  options: ["=", "==", "===", "!="],
                  answer: 1,
                },
              ],
              exercise:
                "Store your age, your height and your name. Print each value together with its type.",
              playground: {
                lang: "python",
                starter: `name = "Ama"\nage = 21\nheight = 1.72\nprint(type(name), type(age), type(height))`,
              },
            },
          ],
        },
        {
          title: "Control Flow & Functions",
          slug: "control-flow-functions",
          order: 2,
          lessons: [
            {
              slug: "python-decisions",
              title: "Making Decisions with if/elif/else",
              objective:
                "By the end of this lesson you will be able to write programs that choose between actions based on conditions.",
              body: [
                {
                  type: "paragraph",
                  text: "Programs make decisions all the time. Python's if statement runs a block of code only when a condition is true.",
                },
                { type: "heading", text: "The if statement", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `score = 75\nif score >= 50:\n    print("You passed!")`,
                },
                {
                  type: "paragraph",
                  text: "Indentation (4 spaces) tells Python which lines belong to the if block.",
                },
                { type: "heading", text: "elif and else", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `score = 85\nif score >= 90:\n    grade = "A"\nelif score >= 70:\n    grade = "B"\nelif score >= 50:\n    grade = "C"\nelse:\n    grade = "F"\nprint("Grade:", grade)`,
                },
                { type: "heading", text: "Combining conditions", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `age = 20\nhas_id = True\nif age >= 18 and has_id:\n    print("Entry allowed")`,
                },
                {
                  type: "list",
                  items: [
                    "==  equal",
                    "!=  not equal",
                    "> <  greater / less than",
                    "and / or — combine conditions",
                    "not — negate a condition",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which keyword handles every remaining case in a chain of conditions?",
                  options: ["if", "elif", "else", "case"],
                  answer: 2,
                },
                {
                  question: "How does Python know which lines belong to an if block?",
                  options: ["Curly braces {}", "Indentation", "Parentheses", "Semicolons"],
                  answer: 1,
                },
              ],
              exercise: "Write a program that reads a temperature and prints Hot, Warm, Cool or Cold.",
              playground: {
                lang: "python",
                starter: `score = 85\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C or lower")`,
              },
            },
            {
              slug: "python-loops",
              title: "Loops: for & while",
              objective:
                "By the end of this lesson you will be able to repeat actions with for and while loops.",
              body: [
                {
                  type: "paragraph",
                  text: "Loops repeat a block of code. Use for when you know how many times to repeat; use while when you repeat until a condition changes.",
                },
                { type: "heading", text: "for loops with range", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `for i in range(5):\n    print("Iteration", i)`,
                },
                {
                  type: "paragraph",
                  text: "range(5) produces 0, 1, 2, 3, 4. range(1, 6) produces 1 to 5.",
                },
                { type: "heading", text: "Looping over a list", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `courses = ["Python", "Databases", "Networks"]\nfor course in courses:\n    print("Studying", course)`,
                },
                { type: "heading", text: "while loops", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `count = 0\nwhile count < 3:\n    print("Count:", count)\n    count += 1`,
                },
                { type: "heading", text: "break and continue", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `for n in range(10):\n    if n == 3:\n        continue   # skip 3\n    if n == 6:\n        break      # stop at 6\n    print(n)`,
                },
                {
                  type: "list",
                  items: [
                    "for — iterate over a fixed sequence",
                    "while — repeat while a condition is true",
                    "break — exit the loop early",
                    "continue — skip to the next iteration",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What does range(3) produce?",
                  options: ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "(1, 2, 3)"],
                  answer: 1,
                },
                {
                  question: "Which statement ends a loop immediately?",
                  options: ["stop", "exit", "break", "continue"],
                  answer: 2,
                },
              ],
              exercise: "Print the multiplication table for 7 (7 × 1 to 7 × 12) using a loop.",
              playground: {
                lang: "python",
                starter: `for i in range(1, 13):\n    print("7 ×", i, "=", 7 * i)`,
              },
            },
            {
              slug: "python-functions",
              title: "Functions in Python",
              objective:
                "By the end of this lesson you will be able to define functions with parameters and return values.",
              body: [
                {
                  type: "paragraph",
                  text: "Functions bundle a piece of logic under a name so you can reuse it without copying code.",
                },
                { type: "heading", text: "Defining a function", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `def greet():\n    print("Hello!")\n\ngreet()   # Hello!`,
                },
                { type: "heading", text: "Parameters", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `def greet(name):\n    print("Hello,", name)\n\ngreet("Ama")   # Hello, Ama`,
                },
                { type: "heading", text: "Return values", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `def area(length, width):\n    return length * width\n\nresult = area(5, 3)\nprint(result)   # 15`,
                },
                { type: "heading", text: "Default arguments", level: 2 },
                {
                  type: "code",
                  language: "python",
                  code: `def greet(name, greeting="Hello"):\n    print(greeting + ", " + name)\n\ngreet("Kofi")              # Hello, Kofi\ngreet("Kofi", "Good day")   # Good day, Kofi`,
                },
                {
                  type: "list",
                  items: [
                    "def — declares a function",
                    "Parameters are the values passed in",
                    "return sends a value back to the caller",
                    "Call a function with name(args)",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which keyword defines a function in Python?",
                  options: ["function", "def", "fun", "lambda"],
                  answer: 1,
                },
                {
                  question: "What happens when a function reaches return?",
                  options: [
                    "It prints the value",
                    "It sends the value back and stops",
                    "It restarts",
                    "It deletes the function",
                  ],
                  answer: 1,
                },
              ],
              exercise:
                "Write a function rectangle_area(length, width) and use it to print the area of a 7 × 4 rectangle.",
              playground: {
                lang: "python",
                starter: `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Ama"))`,
              },
            },
          ],
        },
      ],
    },
    {
      name: "Networking & Security",
      slug: "networking-security",
      description:
        "Understand how computer networks work — and how to keep them secure.",
      topics: [
        {
          title: "Network Fundamentals",
          slug: "network-fundamentals",
          order: 1,
          lessons: [
            {
              slug: "what-is-a-computer-network",
              title: "What is a Computer Network?",
              objective:
                "By the end of this lesson you will be able to explain what a computer network is, its types and the devices that build one.",
              body: [
                {
                  type: "paragraph",
                  text: "A computer network is two or more devices connected so they can share data and resources. The internet is the largest network of all.",
                },
                { type: "heading", text: "Why networks matter", level: 2 },
                {
                  type: "list",
                  items: [
                    "Sharing files and printers",
                    "Communicating — email, chat and calls",
                    "Accessing the internet",
                    "Centralising data and backups",
                  ],
                },
                { type: "heading", text: "Types of networks", level: 2 },
                {
                  type: "list",
                  items: [
                    "PAN — Personal Area Network (Bluetooth devices)",
                    "LAN — Local Area Network (one building or campus)",
                    "MAN — Metropolitan Area Network (a city)",
                    "WAN — Wide Area Network (the internet is the biggest WAN)",
                  ],
                },
                { type: "heading", text: "Key devices", level: 2 },
                {
                  type: "list",
                  items: [
                    "Switch — connects devices within a LAN",
                    "Router — connects different networks and routes traffic between them",
                    "Modem — converts signals between your internet provider and your home",
                    "Access Point — provides wireless access",
                  ],
                },
                { type: "heading", text: "How data travels", level: 2 },
                {
                  type: "paragraph",
                  text: "Data is broken into small pieces called packets. Each packet carries the sender's and receiver's addresses, and routers forward packets hop by hop to their destination.",
                },
              ],
              quiz: [
                {
                  question: "What does LAN stand for?",
                  options: [
                    "Large Area Network",
                    "Local Area Network",
                    "Linked Area Network",
                    "Long Access Network",
                  ],
                  answer: 1,
                },
                {
                  question: "Which device connects different networks and routes traffic between them?",
                  options: ["Switch", "Router", "Repeater", "Hub"],
                  answer: 1,
                },
              ],
              exercise:
                "List every device connected to your home network and say which type of network it forms.",
            },
            {
              slug: "ip-addresses-dns",
              title: "IP Addresses & DNS",
              objective:
                "By the end of this lesson you will be able to explain IP addresses, how devices find each other and what DNS does.",
              body: [
                {
                  type: "paragraph",
                  text: "Every device on a network needs a unique identifier — its IP address — so data can be delivered to the right place.",
                },
                { type: "heading", text: "IP addresses", level: 2 },
                {
                  type: "list",
                  items: [
                    "IPv4 — four numbers, e.g. 192.168.1.10",
                    "IPv6 — longer addresses for the growing internet",
                    "Private addresses (192.168.x.x, 10.x.x.x) are used inside LANs",
                    "Public addresses identify a device on the internet",
                  ],
                },
                { type: "heading", text: "How devices find each other", level: 2 },
                {
                  type: "paragraph",
                  text: "When your phone talks to your laptop, packets are sent to the destination IP address on the same LAN. When traffic must leave the network, the router forwards it.",
                },
                { type: "heading", text: "DNS — the internet's phonebook", level: 2 },
                {
                  type: "paragraph",
                  text: "People remember names like uenr.edu.gh; computers need numbers. The Domain Name System (DNS) translates a domain name into an IP address.",
                },
                { type: "heading", text: "What happens when you visit a site", level: 2 },
                {
                  type: "list",
                  items: [
                    "You type www.uenr.edu.gh",
                    "Your device asks a DNS server for its IP address",
                    "The DNS server replies with the address",
                    "Your browser connects to that IP and loads the page",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What does DNS do?",
                  options: [
                    "Encrypts web traffic",
                    "Translates domain names into IP addresses",
                    "Blocks viruses",
                    "Speeds up Wi-Fi",
                  ],
                  answer: 1,
                },
                {
                  question: "Which of these is a private IPv4 address?",
                  options: ["8.8.8.8", "192.168.1.1", "172.217.14.196", "13.107.42.14"],
                  answer: 1,
                },
              ],
              exercise:
                "Run ipconfig (Windows) or ifconfig (Linux/macOS) and note your device's IP address.",
            },
          ],
        },
        {
          title: "Network Security Basics",
          slug: "network-security-basics",
          order: 2,
          lessons: [
            {
              slug: "common-cyber-threats",
              title: "Common Cyber Threats",
              objective:
                "By the end of this lesson you will be able to identify common cyber threats and the habits that protect against them.",
              body: [
                {
                  type: "paragraph",
                  text: "Understanding the threats is the first step to staying safe online. The most common ones are malware, phishing and weak passwords.",
                },
                { type: "heading", text: "Malware", level: 2 },
                {
                  type: "list",
                  items: [
                    "Virus — attaches to files and spreads",
                    "Worm — spreads across networks by itself",
                    "Ransomware — locks your files and demands payment",
                    "Spyware — secretly records your activity",
                  ],
                },
                { type: "heading", text: "Phishing", level: 2 },
                {
                  type: "paragraph",
                  text: "Phishing is a fake message that pretends to be a trusted organisation — a bank or the school — to trick you into revealing passwords or clicking a malicious link.",
                },
                { type: "heading", text: "Weak passwords & brute force", level: 2 },
                {
                  type: "paragraph",
                  text: "Attackers try many passwords automatically (brute force). Short, common passwords fall quickly; long, unique passphrases take far too long.",
                },
                { type: "heading", text: "Safe habits", level: 2 },
                {
                  type: "list",
                  items: [
                    "Use a different strong password for every account",
                    "Turn on two-factor authentication (2FA)",
                    "Update software and operating systems regularly",
                    "Think before clicking links or attachments",
                    "Back up important files off-device",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What is phishing?",
                  options: [
                    "A virus that spreads by email",
                    "A fake message that tricks you into revealing data",
                    "A firewall rule",
                    "A type of Wi-Fi attack",
                  ],
                  answer: 1,
                },
                {
                  question: "Which habit best protects your accounts?",
                  options: [
                    "Using the same password everywhere",
                    "Sharing passwords with friends",
                    "A unique password plus 2FA",
                    "Writing passwords on sticky notes",
                  ],
                  answer: 2,
                },
              ],
              exercise:
                "Review two of your accounts: how long are the passwords, and is 2FA enabled? Write down one improvement you will make.",
            },
            {
              slug: "passwords-authentication",
              title: "Passwords & Authentication",
              objective:
                "By the end of this lesson you will be able to explain password strength, password hashing and multi-factor authentication.",
              body: [
                {
                  type: "paragraph",
                  text: "Passwords are the first line of defence for almost every account. This lesson explains what makes them strong and how systems protect them.",
                },
                { type: "heading", text: "What makes a password strong", level: 2 },
                {
                  type: "list",
                  items: [
                    "Long — 12+ characters",
                    "Unique — never reused across sites",
                    "Random — avoid names, dates and dictionary words",
                    "A passphrase of several random words works well",
                  ],
                },
                { type: "heading", text: "How systems store passwords", level: 2 },
                {
                  type: "paragraph",
                  text: "Reputable systems never store the password itself. They store a hash — a one-way transformation. When you sign in, the system hashes what you type and compares the hashes.",
                },
                { type: "heading", text: "Multi-factor authentication (MFA)", level: 2 },
                {
                  type: "list",
                  items: [
                    "Something you know — a password",
                    "Something you have — a phone or security key",
                    "Something you are — a fingerprint or face",
                    "2FA uses two of these, so one stolen password is not enough",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Why do systems store password hashes instead of plain text?",
                  options: [
                    "Hashes take less space",
                    "If the database leaks, passwords are not exposed directly",
                    "Hashes are faster to check",
                    "Hashes can be reversed to recover passwords",
                  ],
                  answer: 1,
                },
                {
                  question: "Which is the strongest password?",
                  options: ["password123", "Ama1998", "CorrectHorseBatteryStaple!", "qwerty"],
                  answer: 2,
                },
              ],
              exercise:
                "Turn on 2FA for your email account and create a passphrase for a test account.",
            },
          ],
        },
      ],
    },
    {
      name: "Database Systems",
      slug: "database-systems",
      description:
        "Design databases, write SQL and build the data layer behind real applications.",
      topics: [
        {
          title: "Relational Databases & SQL",
          slug: "relational-databases-sql",
          order: 1,
          lessons: [
            {
              slug: "what-is-a-database",
              title: "What is a Database?",
              objective:
                "By the end of this lesson you will be able to explain what a database is, the table model and why it beats spreadsheets.",
              body: [
                {
                  type: "paragraph",
                  text: "A database is an organised collection of data that can be stored, queried and updated efficiently. Most web applications rely on one.",
                },
                { type: "heading", text: "Why not just a spreadsheet?", level: 2 },
                {
                  type: "list",
                  items: [
                    "Scale — databases handle millions of rows",
                    "Concurrency — many users at once without corruption",
                    "Integrity — rules prevent invalid data",
                    "Querying — powerful, fast searches",
                  ],
                },
                { type: "heading", text: "The relational model", level: 2 },
                {
                  type: "paragraph",
                  text: "Data is organised into tables. A table has columns (fields) and rows (records). Each row is one item — for example, one student.",
                },
                {
                  type: "code",
                  language: "sql",
                  code: `CREATE TABLE students (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  programme VARCHAR(100)\n);`,
                },
                { type: "heading", text: "Primary keys", level: 2 },
                {
                  type: "paragraph",
                  text: "A primary key uniquely identifies each row — in the example above, id. No two rows may share the same key.",
                },
                { type: "heading", text: "DBMS examples", level: 2 },
                {
                  type: "list",
                  items: [
                    "PostgreSQL — open source, used by this department site",
                    "MySQL — very popular on the web",
                    "SQLite — a lightweight file-based database",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What is a primary key?",
                  options: [
                    "A column that can be empty",
                    "A column that uniquely identifies each row",
                    "A password for the database",
                    "A foreign table",
                  ],
                  answer: 1,
                },
                {
                  question: "Which of these is a database management system?",
                  options: ["HTML", "PostgreSQL", "Python", "Linux"],
                  answer: 1,
                },
              ],
              exercise: "Design a courses table with columns for id, title and credits. State which column is the primary key.",
            },
            {
              slug: "sql-select-queries",
              title: "Querying with SQL: SELECT",
              objective:
                "By the end of this lesson you will be able to retrieve data with SELECT, WHERE, ORDER BY and LIMIT.",
              body: [
                {
                  type: "paragraph",
                  text: "SQL (Structured Query Language) is how you talk to a relational database. The SELECT statement retrieves data.",
                },
                { type: "heading", text: "Selecting columns", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `SELECT name, programme FROM students;`,
                },
                {
                  type: "paragraph",
                  text: "SELECT chooses which columns to return and FROM says which table to read from.",
                },
                { type: "heading", text: "Filtering with WHERE", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `SELECT name FROM students\nWHERE programme = 'Information Technology';`,
                },
                {
                  type: "list",
                  items: [
                    "= equal",
                    "<> not equal",
                    "> < greater / less than",
                    "LIKE '%Ama%' — pattern match",
                    "AND / OR — combine conditions",
                  ],
                },
                { type: "heading", text: "Sorting & limiting", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `SELECT name, score FROM results\nWHERE score >= 50\nORDER BY score DESC\nLIMIT 5;`,
                },
                {
                  type: "paragraph",
                  text: "ORDER BY sorts the results (ASC ascending, DESC descending); LIMIT caps how many rows are returned.",
                },
              ],
              quiz: [
                {
                  question: "Which clause filters rows before returning them?",
                  options: ["SELECT", "FROM", "WHERE", "ORDER BY"],
                  answer: 2,
                },
                {
                  question: "How would you return the 10 highest scores?",
                  options: [
                    "SELECT score FROM results LIMIT 10",
                    "SELECT score FROM results ORDER BY score DESC LIMIT 10",
                    "SELECT TOP 10 score FROM results",
                    "SELECT score FROM results SORT BY score",
                  ],
                  answer: 1,
                },
              ],
              exercise:
                "Write a query that returns the names of students with a score of at least 70, sorted alphabetically.",
            },
            {
              slug: "sql-insert-update-delete",
              title: "Creating Tables & Managing Data",
              objective:
                "By the end of this lesson you will be able to create tables and add, update and delete rows with SQL.",
              body: [
                {
                  type: "paragraph",
                  text: "Beyond reading data, SQL lets you build tables and keep them up to date.",
                },
                { type: "heading", text: "Creating a table", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `CREATE TABLE courses (\n  id INT PRIMARY KEY,\n  title VARCHAR(100),\n  credits INT\n);`,
                },
                { type: "heading", text: "Inserting rows", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `INSERT INTO courses (id, title, credits)\nVALUES (1, 'Database Systems', 3),\n       (2, 'Web Development', 3);`,
                },
                { type: "heading", text: "Updating rows", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `UPDATE courses\nSET credits = 4\nWHERE id = 1;`,
                },
                {
                  type: "paragraph",
                  text: "UPDATE changes existing rows; the WHERE clause limits which ones.",
                },
                { type: "heading", text: "Deleting rows", level: 2 },
                {
                  type: "code",
                  language: "sql",
                  code: `DELETE FROM courses WHERE id = 2;`,
                },
                {
                  type: "list",
                  items: [
                    "CREATE TABLE — define a new table",
                    "INSERT INTO — add rows",
                    "UPDATE … SET — change rows",
                    "DELETE FROM — remove rows",
                    "Always use WHERE with UPDATE/DELETE unless you really mean every row",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which command adds a new row to a table?",
                  options: ["ADD ROW", "INSERT INTO", "NEW ROW", "APPEND"],
                  answer: 1,
                },
                {
                  question: "What happens if you run DELETE FROM courses without WHERE?",
                  options: [
                    "Nothing",
                    "It deletes one random row",
                    "It deletes every row in the table",
                    "It deletes the table itself",
                  ],
                  answer: 2,
                },
              ],
              exercise: "Create a table for books (id, title, author, year) and insert three books of your choice.",
            },
          ],
        },
        {
          title: "Database Design",
          slug: "database-design",
          order: 2,
          lessons: [
            {
              slug: "designing-a-good-schema",
              title: "Designing a Good Schema",
              objective:
                "By the end of this lesson you will be able to design tables with relationships that avoid duplication.",
              body: [
                {
                  type: "paragraph",
                  text: "A good database design stores each fact once and links related facts together. This lesson covers the key ideas.",
                },
                { type: "heading", text: "The problem with duplication", level: 2 },
                {
                  type: "paragraph",
                  text: "Storing the same information in many places causes inconsistency — update one copy and the others go stale. Good design stores each fact once.",
                },
                { type: "heading", text: "Relationships", level: 2 },
                {
                  type: "list",
                  items: [
                    "One-to-one — one row relates to at most one other row",
                    "One-to-many — one row relates to many rows (a subject has many topics)",
                    "Many-to-many — many rows relate to many rows (students ↔ courses)",
                  ],
                },
                { type: "heading", text: "Example: students, enrollments, courses", level: 2 },
                {
                  type: "paragraph",
                  text: "A student takes many courses and a course has many students — a many-to-many relationship. SQL handles it with a join table called enrollments.",
                },
                {
                  type: "code",
                  language: "sql",
                  code: `CREATE TABLE enrollments (\n  student_id INT,\n  course_id INT,\n  PRIMARY KEY (student_id, course_id)\n);`,
                },
                { type: "heading", text: "Foreign keys", level: 2 },
                {
                  type: "paragraph",
                  text: "A foreign key is a column that points at a primary key in another table. It is what turns separate tables into a related database.",
                },
              ],
              quiz: [
                {
                  question: "What does a foreign key do?",
                  options: [
                    "Encrypts a column",
                    "Links a column to a primary key in another table",
                    "Makes a column unique",
                    "Speeds up sorting",
                  ],
                  answer: 1,
                },
                {
                  question: "Students and courses form which relationship?",
                  options: ["One-to-one", "One-to-many", "Many-to-many", "No relationship"],
                  answer: 2,
                },
              ],
              exercise:
                "Sketch tables for a library: books, members and loans. Where do you put the foreign keys?",
            },
          ],
        },
      ],
    },
    {
      name: "Data Structures & Algorithms",
      slug: "data-structures-algorithms",
      description:
        "Learn the building blocks of efficient programs — arrays, stacks, sorting and searching.",
      topics: [
        {
          title: "Arrays, Lists & Stacks",
          slug: "arrays-lists-stacks",
          order: 1,
          lessons: [
            {
              slug: "arrays-and-lists",
              title: "Arrays & Lists",
              objective:
                "By the end of this lesson you will be able to use lists, understand indexing and know the cost of common operations.",
              body: [
                {
                  type: "paragraph",
                  text: "An array is a collection of items stored one after another. Python's list is a flexible version of an array.",
                },
                { type: "heading", text: "Indexing", level: 2 },
                {
                  type: "paragraph",
                  text: "Positions are counted from 0. In a Python list, courses[0] is the first item.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `courses = ["Python", "Databases", "Networks"]\nprint(courses[0])   # Python\nprint(courses[-1])  # Networks (last item)\ncourses.append("Web Dev")\nprint(len(courses)) # 4`,
                },
                { type: "heading", text: "Common operations & their cost", level: 2 },
                {
                  type: "list",
                  items: [
                    "Access by index — fast, O(1)",
                    "Append at the end — fast, O(1) on average",
                    "Search for a value — slow, O(n)",
                    "Insert or remove in the middle — O(n) because items shift",
                  ],
                },
                {
                  type: "paragraph",
                  text: "Big O describes how work grows with input size n. O(1) is constant time; O(n) grows linearly.",
                },
              ],
              quiz: [
                {
                  question: "What is the index of the first element of a list?",
                  options: ["1", "0", "-1", "undefined"],
                  answer: 1,
                },
                {
                  question: "How long does finding a value in an unsorted list take on average?",
                  options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
                  answer: 1,
                },
              ],
              exercise:
                "Create a list of five courses. Print the second one, add a sixth, and print the total count.",
              playground: {
                lang: "python",
                starter: `courses = ["Python", "Databases", "Networks"]\nprint(courses[1])\ncourses.append("Web Dev")\nprint(len(courses))`,
              },
            },
            {
              slug: "stacks-and-queues",
              title: "Stacks & Queues",
              objective:
                "By the end of this lesson you will be able to explain LIFO stacks and FIFO queues and use them in Python.",
              body: [
                {
                  type: "paragraph",
                  text: "Stacks and queues are simple structures with strict rules about order — and they appear everywhere in real software.",
                },
                { type: "heading", text: "Stack — last in, first out (LIFO)", level: 2 },
                {
                  type: "paragraph",
                  text: "Think of a stack of plates: you take the top plate first. The last item pushed is the first item popped.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `stack = []\nstack.append("open tab 1")\nstack.append("open tab 2")\nprint(stack.pop())   # open tab 2\nprint(stack.pop())   # open tab 1`,
                },
                { type: "heading", text: "Queue — first in, first out (FIFO)", level: 2 },
                {
                  type: "paragraph",
                  text: "Like a queue at a counter: the first person in is served first.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `from collections import deque\nqueue = deque(["Ama", "Kofi", "Esi"])\nprint(queue.popleft())  # Ama served\nprint(queue.popleft())  # Kofi served`,
                },
                { type: "heading", text: "Where they appear", level: 2 },
                {
                  type: "list",
                  items: [
                    "Browser back button — a stack of pages",
                    "Undo / redo — a stack of actions",
                    "Print jobs — a queue",
                    "Task scheduling — a queue",
                  ],
                },
              ],
              quiz: [
                {
                  question: "A stack removes items in which order?",
                  options: ["First in, first out", "Last in, first out", "Random order", "By size"],
                  answer: 1,
                },
                {
                  question: "Which data structure fits a print queue best?",
                  options: ["Stack", "Queue", "Tree", "Hash table"],
                  answer: 1,
                },
              ],
              exercise:
                "Simulate a browser back button with a stack: push three pages, then pop twice and print the current page.",
              playground: {
                lang: "python",
                starter: `stack = []\nstack.append("A")\nstack.append("B")\nstack.append("C")\nprint(stack.pop())\nprint(stack.pop())\nprint(stack.pop())`,
              },
            },
          ],
        },
        {
          title: "Sorting & Searching",
          slug: "sorting-searching",
          order: 2,
          lessons: [
            {
              slug: "searching-linear-binary",
              title: "Searching: Linear & Binary",
              objective:
                "By the end of this lesson you will be able to implement linear and binary search and explain when each is faster.",
              body: [
                {
                  type: "paragraph",
                  text: "Finding an item in a collection is one of the most common operations in computing. Two classic approaches are linear and binary search.",
                },
                { type: "heading", text: "Linear search", level: 2 },
                {
                  type: "paragraph",
                  text: "Check every item from the start until the value is found — or the list ends. Works on any list, sorted or not.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `def linear_search(items, target):\n    for i, item in enumerate(items):\n        if item == target:\n            return i\n    return -1\n\nprint(linear_search([4, 9, 2, 7], 7))   # 3`,
                },
                { type: "heading", text: "Binary search", level: 2 },
                {
                  type: "paragraph",
                  text: "On a sorted list, compare the middle item: if the target is smaller, search the left half; if larger, search the right half. Each step halves the remaining items.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `def binary_search(sorted_items, target):\n    low, high = 0, len(sorted_items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if sorted_items[mid] == target:\n            return mid\n        elif sorted_items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16], 12))   # 3`,
                },
                { type: "heading", text: "Which to use?", level: 2 },
                {
                  type: "list",
                  items: [
                    "Linear search — O(n), works on any list",
                    "Binary search — O(log n), requires a sorted list",
                    "For one-off lookups in small lists, linear is perfectly fine",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What must be true for binary search to work?",
                  options: ["The list is sorted", "The list has even length", "The list has no duplicates", "The list is stored in a file"],
                  answer: 0,
                },
                {
                  question: "Linear search on a list of n items has complexity:",
                  options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                  answer: 2,
                },
              ],
              exercise:
                "Run binary search by hand on [3, 7, 9, 14, 21] looking for 14 — list the midpoints you check.",
              playground: {
                lang: "python",
                starter: `def binary_search(sorted_items, target):\n    low, high = 0, len(sorted_items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if sorted_items[mid] == target:\n            return mid\n        elif sorted_items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16], 12))`,
              },
            },
            {
              slug: "sorting-bubble-selection",
              title: "Sorting: Bubble & Selection",
              objective:
                "By the end of this lesson you will be able to implement bubble and selection sort and compare their complexity.",
              body: [
                {
                  type: "paragraph",
                  text: "Sorted data makes searching, merging and reporting easier — and enables fast algorithms like binary search.",
                },
                { type: "heading", text: "Bubble sort", level: 2 },
                {
                  type: "paragraph",
                  text: "Repeatedly compare neighbouring items and swap them if they are out of order. The largest value bubbles to the end on each pass.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `def bubble_sort(items):\n    n = len(items)\n    for i in range(n):\n        for j in range(n - 1 - i):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]\n    return items\n\nprint(bubble_sort([5, 2, 9, 1]))   # [1, 2, 5, 9]`,
                },
                { type: "heading", text: "Selection sort", level: 2 },
                {
                  type: "paragraph",
                  text: "Find the smallest remaining item and swap it into place, one position at a time.",
                },
                {
                  type: "code",
                  language: "python",
                  code: `def selection_sort(items):\n    for i in range(len(items)):\n        small = i\n        for j in range(i + 1, len(items)):\n            if items[j] < items[small]:\n                small = j\n        items[i], items[small] = items[small], items[i]\n    return items\n\nprint(selection_sort([5, 2, 9, 1]))   # [1, 2, 5, 9]`,
                },
                { type: "heading", text: "Complexity", level: 2 },
                {
                  type: "list",
                  items: [
                    "Both run in O(n²) worst case — fine for small lists",
                    "Larger datasets use faster sorts such as merge sort (O(n log n))",
                    "Simple sorts are easy to write and debug",
                  ],
                },
              ],
              quiz: [
                {
                  question: "What is the worst-case complexity of bubble sort?",
                  options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
                  answer: 2,
                },
                {
                  question: "Which sort repeatedly finds the smallest item and places it?",
                  options: ["Bubble sort", "Selection sort", "Merge sort", "Quick sort"],
                  answer: 1,
                },
              ],
              exercise:
                "Trace bubble sort on [4, 1, 3, 2] — write the list after each full pass.",
              playground: {
                lang: "python",
                starter: `def bubble_sort(items):\n    n = len(items)\n    for i in range(n):\n        for j in range(n - 1 - i):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]\n    return items\n\nprint(bubble_sort([4, 1, 3, 2]))`,
              },
            },
          ],
        },
      ],
    },
    {
      name: "Operating Systems",
      slug: "operating-systems",
      description:
        "Understand how operating systems manage processes, memory and hardware.",
      topics: [
        {
          title: "OS Fundamentals",
          slug: "os-fundamentals",
          order: 1,
          lessons: [
            {
              slug: "what-is-an-operating-system",
              title: "What is an Operating System?",
              objective:
                "By the end of this lesson you will be able to explain the role of an operating system and name its core components.",
              body: [
                {
                  type: "paragraph",
                  text: "An operating system (OS) is the software that manages a computer's hardware and provides services to applications. Without one, every program would have to talk to the hardware directly.",
                },
                { type: "heading", text: "What the OS does", level: 2 },
                {
                  type: "list",
                  items: [
                    "Process management — run and schedule programs",
                    "Memory management — allocate RAM to programs",
                    "File system — organise data on disks",
                    "Device management — drivers for keyboards, printers and more",
                    "Security — protect users and their data",
                  ],
                },
                { type: "heading", text: "Kernel and user space", level: 2 },
                {
                  type: "paragraph",
                  text: "The kernel is the core of the OS, running with full hardware access. Applications run in user space and ask the kernel for services through system calls.",
                },
                { type: "heading", text: "Examples", level: 2 },
                {
                  type: "list",
                  items: [
                    "Windows — desktops and laptops",
                    "Linux — servers, phones (Android) and supercomputers",
                    "macOS — Apple desktops and laptops",
                    "Android / iOS — mobile devices",
                  ],
                },
              ],
              quiz: [
                {
                  question: "Which of these is NOT an operating system?",
                  options: ["Windows", "Linux", "Chrome (the browser)", "Android"],
                  answer: 2,
                },
                {
                  question: "What decides how much RAM each program may use?",
                  options: ["The compiler", "The operating system", "The router", "The browser"],
                  answer: 1,
                },
              ],
              exercise:
                "List every device you used today that runs an operating system — include the type of OS.",
            },
            {
              slug: "processes-and-threads",
              title: "Processes & Threads",
              objective:
                "By the end of this lesson you will be able to explain processes, threads and how the CPU switches between them.",
              body: [
                {
                  type: "paragraph",
                  text: "Everything your computer runs — an editor, a browser, a game — is organised by the operating system into processes and threads.",
                },
                { type: "heading", text: "Processes", level: 2 },
                {
                  type: "paragraph",
                  text: "A process is a program in execution with its own memory, files and state. Running two apps means running two processes.",
                },
                { type: "heading", text: "Process states", level: 2 },
                {
                  type: "list",
                  items: [
                    "New — being created",
                    "Ready — waiting for the CPU",
                    "Running — executing instructions",
                    "Waiting — blocked on input/output",
                    "Terminated — finished",
                  ],
                },
                { type: "heading", text: "Threads", level: 2 },
                {
                  type: "paragraph",
                  text: "A thread is a unit of execution inside a process. One process can have several threads sharing its memory — a browser has one thread per tab plus background threads.",
                },
                { type: "heading", text: "Why threads?", level: 2 },
                {
                  type: "list",
                  items: [
                    "Share memory easily (unlike separate processes)",
                    "Keep a core busy while another thread waits on I/O",
                    "Do parallel work on multi-core CPUs",
                  ],
                },
                {
                  type: "paragraph",
                  text: "The scheduler decides which process or thread runs next, switching between them so quickly that everything seems to run at once.",
                },
              ],
              quiz: [
                {
                  question: "Which is a unit of execution inside a process?",
                  options: ["A file", "A thread", "A driver", "A kernel"],
                  answer: 1,
                },
                {
                  question: "A process waiting for input/output is in which state?",
                  options: ["Ready", "Running", "Waiting", "Terminated"],
                  answer: 2,
                },
              ],
              exercise:
                "Open your task manager (Windows) or activity monitor (macOS) and list five running processes.",
            },
          ],
        },
        {
          title: "Memory & Storage",
          slug: "memory-storage",
          order: 2,
          lessons: [
            {
              slug: "memory-management-basics",
              title: "Memory Management Basics",
              objective:
                "By the end of this lesson you will be able to explain RAM, virtual memory and the difference between stack and heap.",
              body: [
                {
                  type: "paragraph",
                  text: "Memory is where running programs live. Understanding how it is managed explains why devices slow down and why some programs crash.",
                },
                { type: "heading", text: "RAM vs storage", level: 2 },
                {
                  type: "list",
                  items: [
                    "RAM — fast and volatile; programs load here to run",
                    "Storage (disk/SSD) — slower and persistent; holds files",
                    "A program must be copied from storage into RAM before it can execute",
                  ],
                },
                { type: "heading", text: "Virtual memory & paging", level: 2 },
                {
                  type: "paragraph",
                  text: "When programs need more memory than the physical RAM, the OS uses virtual memory: parts of the address space live on disk in pages and are swapped in when needed.",
                },
                { type: "heading", text: "Stack and heap", level: 2 },
                {
                  type: "list",
                  items: [
                    "Stack — function calls and local variables; fast, LIFO, fixed-size frames",
                    "Heap — dynamic data such as objects and big structures; grows and shrinks as needed",
                    "The OS and the runtime divide memory between them",
                  ],
                },
                {
                  type: "paragraph",
                  text: "Poor memory handling causes crashes (running out) and leaks (memory never released) — one reason languages with automatic memory management are popular.",
                },
              ],
              quiz: [
                {
                  question: "What is virtual memory?",
                  options: [
                    "A backup of RAM on the internet",
                    "Using disk space as extra memory via paging",
                    "A type of SSD",
                    "A cache inside the CPU",
                  ],
                  answer: 1,
                },
                {
                  question: "Where do dynamically created objects usually live?",
                  options: ["The stack", "The heap", "The register", "The cache"],
                  answer: 1,
                },
              ],
              exercise:
                "Check your computer's RAM and storage sizes. Why does a phone slow down when many apps are open?",
            },
          ],
        },
      ],
    },
  ];

  for (const s of learnSubjects) {
    await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, description: s.description },
      create: { name: s.name, slug: s.slug, description: s.description },
    });
  }

  for (const s of learnSubjects) {
    const subject = await prisma.subject.findUniqueOrThrow({ where: { slug: s.slug } });
    for (const t of s.topics) {
      await prisma.topic.upsert({
        where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
        update: { title: t.title, order: t.order },
        create: { subjectId: subject.id, title: t.title, slug: t.slug, order: t.order },
      });
    }
  }

  for (const s of learnSubjects) {
    const subject = await prisma.subject.findUniqueOrThrow({ where: { slug: s.slug } });
    for (const t of s.topics) {
      const topic = await prisma.topic.findUniqueOrThrow({
        where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
      });
      for (const [i, l] of t.lessons.entries()) {
        const data = {
          title: l.title,
          objective: l.objective,
          contentBody: l.body as unknown as Prisma.InputJsonValue,
          hasPlayground: Boolean(l.playground),
          playgroundLang: l.playground?.lang ?? null,
          starterCode: l.playground?.starter ?? null,
          exercisePrompt: l.exercise ?? null,
          quiz: (l.quiz ?? null) as unknown as Prisma.InputJsonValue,
          status: LessonStatus.PUBLISHED,
          authorId: lecturerUser.id,
          order: i + 1,
        };
        const existing = await prisma.lesson.findFirst({
          where: { topicId: topic.id, slug: l.slug },
        });
        if (existing) {
          await prisma.lesson.update({ where: { id: existing.id }, data });
        } else {
          await prisma.lesson.create({ data: { ...data, topicId: topic.id, slug: l.slug } });
        }
      }
    }
  }


  console.log("Seed complete ✅");
  console.log("Admin login:   admin@itds.uenr.edu.gh / itds-admin123");
  console.log("Editor login:  editor@itds.uenr.edu.gh / editor123");
  console.log("Lecturer login: lecturer@itds.uenr.edu.gh / lecturer123");
  console.log("Student login:  student@itds.uenr.edu.gh / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
