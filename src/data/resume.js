export const personal = {
  name: "Sumeet Suryawanshi",
  title: "Software Engineer",
  company: "Microsoft",
  location: "United States",
  email: "s.l.suryawanshi4@gmail.com",
  linkedin: "https://www.linkedin.com/in/sumeetsuryawanshi/",
  github: "https://github.com/IMSUMEET",
  resumePdf: `${import.meta.env.BASE_URL}Resume.pdf`,
  tagline:
    "I design and ship backend systems, operational workflows, and automations that keep products running reliably at scale.",
};

export const education = [
  {
    degree: "Master of Science - Computer Science",
    focus: "Software Engineering",
    school: "Arizona State University",
    location: "USA",
    year: "May 2025",
  },
  {
    degree: "Bachelor of Engineering - Computer Science",
    school: "Savitribai Phule Pune University",
    location: "India",
    year: "June 2023",
  },
];

export const experience = [
  {
    company: "Microsoft",
    role: "Software Engineer",
    location: "Redmond, USA",
    period: "Oct 2025 - Present",
    current: true,
    highlights: [
      "Built VmStateLogger for Azure Resource Notifications capturing VM lifecycle events from Event Grid pipelines, improving visibility across 100B+ publisher and 500B+ subscriber notifications per day.",
      "Led CapacityFlow - a Durable Task Framework orchestration service that automated capacity reviews with authored TSGs, increasing review frequency by 7× and enabling proactive capacity planning.",
      "Developed StateGuard, a C#/.NET validation service detecting configuration drift across Azure messaging infrastructure, reducing 4+ hours of weekly on-call effort.",
    ],
  },
  {
    company: "Dawgzonline",
    role: "Software Development Engineer",
    location: "Mumbai, India",
    period: "Jan 2022 - Feb 2023",
    current: false,
    highlights: [
      "Spearheaded a self-serve onboarding service to provision vendor-specific Lambda APIs, DynamoDB tables, and CloudWatch alarms using declarative CDK - reducing partner integration from ~3 days to under 1 hour.",
      "Built NotifyNow, an SNS + SQS restock alert system for high-demand SKUs - reclaimed $18K+/month in previously lost orders and increased returning user engagement.",
      "Engineered SwiftStock, a real-time inventory microservice using DynamoDB Streams and Lambda across 3 warehouses and 10K+ SKUs, reducing delayed shipments by 20%.",
    ],
  },
];

export const skills = [
  {
    category: "Languages",
    items: ["Java", "Python", "TypeScript", "JavaScript", "C#", "C++", "SQL", "KQL"],
  },
  {
    category: "Backend & Architecture",
    items: ["Spring Boot", ".NET", "Node.js", "Next.js", "Express.js", "Microservices", "REST APIs", "Kafka", "WebSockets", "Event-Driven Architecture", "System Design", "Distributed Systems"],
  },
  {
    category: "Cloud & Infrastructure",
    items: ["AWS CDK", "Lambda", "ECS", "S3", "DynamoDB", "API Gateway", "Azure SDK", "Event Hub", "Event Grid", "Cosmos DB", "Service Fabric", "Kubernetes", "Docker"],
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MySQL", "MongoDB", "CosmosDB", "Redis", "Elasticsearch"],
  },
  {
    category: "Frontend",
    items: ["React", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Practices & Tools",
    items: ["Git", "GitHub Actions", "CI/CD", "Agile", "Monitoring", "Observability", "SDLC"],
  },
];

export const projects = [
  {
    name: "VeloCity",
    tagline: "Delivery Optimization Platform",
    description:
      "Full-stack delivery marketplace control plane with real-time dispatch, fleet, queue, incident, and trace workflows. Dijkstra-based routing with weighted driver matching across Balanced, Fastest ETA, and Lowest Cost strategies.",
    tech: ["Spring Boot", "React", "TypeScript", "Kafka", "Redis", "PostgreSQL", "WebSockets"],
    github: "https://github.com/IMSUMEET/velocity",
    period: "Mar – May 2026",
  },
  {
    name: "LeetDesign",
    tagline: "System Design Reimagined",
    description:
      "Interactive system design platform enabling users to visually design scalable architectures. Real-time architecture analysis engine that simulates production workloads, detects bottlenecks, and evaluates scalability trade-offs.",
    tech: ["Kafka", "Neo4j", "Redis Pub/Sub", "WebSockets", "React"],
    github: "https://github.com/Oblivion-Labs-Dev/astra",
    period: "Nov 2025 – Apr 2026",
  },
  {
    name: "Optica",
    tagline: "Interactive Algorithm Visualizer",
    description:
      "Reusable algorithm simulation framework across sorting, pathfinding, trees, and graphs. Users build scenarios, compare algorithms, and inspect step-level decision states through animated visuals.",
    tech: ["React", "TypeScript", "Algorithms", "Canvas API"],
    github: "https://github.com/IMSUMEET/optika",
    live: "https://imsumeet.github.io/optika",
    period: "Feb – Apr 2026",
  },
  {
    name: "Framewise",
    tagline: "Serverless Video Analytics",
    description:
      "Serverless video-recognition pipeline using S3-triggered AWS Lambda, ffmpeg/OpenCV, and dockerized ResNet-34 inference from ECR - reducing inference latency to under 2 seconds across 100+ videos.",
    tech: ["AWS Lambda", "S3", "Docker", "ECR", "OpenCV", "ResNet-34"],
    github: "https://github.com/IMSUMEET/face-recognition-aws",
    period: "Feb – Apr 2026",
  },
];
