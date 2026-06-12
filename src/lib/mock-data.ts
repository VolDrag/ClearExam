import type { TrackId } from "./tracks";

export interface ExamQuestion {
  id: string;
  subject: string;
  text: string;
  options: string[];
  answer: number; // index
  citation: string;
}

const POOL: Record<TrackId, ExamQuestion[]> = {
  engineering: [
    { id: "e1", subject: "Physics", text: "A body moves with constant acceleration of 2 m/s². If initial velocity is 3 m/s, what is its velocity after 5 s?", options: ["10 m/s", "13 m/s", "15 m/s", "8 m/s"], answer: 1, citation: "BUET 2021 – Physics Q.7" },
    { id: "e2", subject: "Math", text: "What is the derivative of sin(x)·cos(x)?", options: ["cos(2x)", "sin(2x)", "2cos²(x)", "1"], answer: 0, citation: "CUET 2020 – Math Q.12" },
    { id: "e3", subject: "Chemistry", text: "Which of the following is an example of an SN2 reaction?", options: ["t-butyl bromide + OH⁻", "Methyl bromide + OH⁻", "Phenol + Br₂", "Benzene + Cl₂"], answer: 1, citation: "BUET 2019 – Chemistry Q.5" },
    { id: "e4", subject: "Physics", text: "The unit of magnetic flux is:", options: ["Tesla", "Weber", "Henry", "Gauss"], answer: 1, citation: "RUET 2022 – Physics Q.3" },
    { id: "e5", subject: "Math", text: "Integral of 1/(1+x²) dx is:", options: ["ln(1+x²)", "arctan(x)", "1/(2x)", "x/(1+x²)"], answer: 1, citation: "KUET 2021 – Math Q.9" },
    { id: "e6", subject: "Chemistry", text: "pH of 0.01 M HCl is:", options: ["1", "2", "12", "0.01"], answer: 1, citation: "BUET 2020 – Chemistry Q.11" },
    { id: "e7", subject: "Physics", text: "Escape velocity from Earth's surface is approximately:", options: ["7.9 km/s", "11.2 km/s", "9.8 km/s", "5.0 km/s"], answer: 1, citation: "CUET 2018 – Physics Q.14" },
    { id: "e8", subject: "Math", text: "If A and B are 2x2 matrices, then (AB)ᵀ equals:", options: ["AᵀBᵀ", "BᵀAᵀ", "AB", "BA"], answer: 1, citation: "BUET 2022 – Math Q.6" },
    { id: "e9", subject: "Chemistry", text: "Number of moles in 22 g CO₂:", options: ["0.5", "1", "2", "0.25"], answer: 0, citation: "RUET 2020 – Chemistry Q.4" },
    { id: "e10", subject: "Physics", text: "Snell's law relates:", options: ["mass and force", "angle of incidence and refraction", "current and voltage", "pressure and volume"], answer: 1, citation: "KUET 2019 – Physics Q.10" },
  ],
  medical: [
    { id: "m1", subject: "Biology", text: "The functional unit of the kidney is:", options: ["Neuron", "Nephron", "Alveolus", "Hepatocyte"], answer: 1, citation: "MBBS 2021 – Biology Q.3" },
    { id: "m2", subject: "Biology", text: "Which blood group is the universal donor?", options: ["A+", "AB+", "O−", "B+"], answer: 2, citation: "MBBS 2020 – Biology Q.7" },
    { id: "m3", subject: "Chemistry", text: "Glucose belongs to which class of carbohydrates?", options: ["Disaccharide", "Monosaccharide", "Polysaccharide", "Oligosaccharide"], answer: 1, citation: "BDS 2019 – Chemistry Q.4" },
    { id: "m4", subject: "Biology", text: "Number of chambers in a human heart:", options: ["2", "3", "4", "5"], answer: 2, citation: "MBBS 2022 – Biology Q.1" },
    { id: "m5", subject: "Physics", text: "SI unit of pressure:", options: ["Pascal", "Newton", "Joule", "Watt"], answer: 0, citation: "MBBS 2021 – Physics Q.6" },
    { id: "m6", subject: "Biology", text: "Mitochondria are known as:", options: ["Brain of cell", "Powerhouse of cell", "Kitchen of cell", "Suicide bag"], answer: 1, citation: "MBBS 2018 – Biology Q.2" },
    { id: "m7", subject: "Chemistry", text: "Which vitamin is fat-soluble?", options: ["Vitamin C", "Vitamin B", "Vitamin D", "Vitamin B12"], answer: 2, citation: "BDS 2020 – Chemistry Q.9" },
    { id: "m8", subject: "Biology", text: "Insulin is produced by:", options: ["Liver", "Pancreas — beta cells", "Adrenal gland", "Thyroid"], answer: 1, citation: "MBBS 2019 – Biology Q.12" },
    { id: "m9", subject: "English", text: "Choose the synonym of 'benevolent':", options: ["Cruel", "Kind", "Lazy", "Rude"], answer: 1, citation: "MBBS 2021 – English Q.4" },
    { id: "m10", subject: "Biology", text: "DNA replication is:", options: ["Conservative", "Semi-conservative", "Dispersive", "Random"], answer: 1, citation: "MBBS 2022 – Biology Q.10" },
  ],
  varsity: [
    { id: "v1", subject: "Bangla", text: "'গীতাঞ্জলি'-র রচয়িতা কে?", options: ["কাজী নজরুল", "জীবনানন্দ দাশ", "রবীন্দ্রনাথ ঠাকুর", "সুকান্ত"], answer: 2, citation: "DU Ka 2020 – Bangla Q.2" },
    { id: "v2", subject: "English", text: "Choose the correct passive: 'He writes a letter.'", options: ["A letter was written by him", "A letter is written by him", "A letter has written by him", "A letter is being written"], answer: 1, citation: "DU Kha 2021 – English Q.5" },
    { id: "v3", subject: "General Knowledge", text: "Capital of Bhutan is:", options: ["Kathmandu", "Thimphu", "Dhaka", "Colombo"], answer: 1, citation: "JU 2020 – GK Q.4" },
    { id: "v4", subject: "Math", text: "log₁₀(1000) = ?", options: ["2", "3", "10", "100"], answer: 1, citation: "DU Ga 2019 – Math Q.7" },
    { id: "v5", subject: "ICT", text: "RAM stands for:", options: ["Random Access Memory", "Read Access Memory", "Random Active Memory", "Read Active Mode"], answer: 0, citation: "CU 2021 – ICT Q.3" },
    { id: "v6", subject: "Bangla", text: "'অগ্নিবীণা' কার রচনা?", options: ["রবীন্দ্রনাথ", "কাজী নজরুল ইসলাম", "জসীমউদ্দীন", "সুকান্ত"], answer: 1, citation: "DU Ka 2019 – Bangla Q.1" },
    { id: "v7", subject: "English", text: "Antonym of 'transparent':", options: ["Clear", "Opaque", "Bright", "Smooth"], answer: 1, citation: "DU Kha 2020 – English Q.8" },
    { id: "v8", subject: "GK", text: "First President of Bangladesh:", options: ["Sheikh Mujibur Rahman", "Tajuddin Ahmad", "Syed Nazrul Islam", "AHM Kamaruzzaman"], answer: 0, citation: "RU 2021 – GK Q.2" },
    { id: "v9", subject: "Math", text: "If x + 1/x = 2, then x² + 1/x² = ?", options: ["2", "3", "4", "1"], answer: 0, citation: "DU Ga 2022 – Math Q.10" },
    { id: "v10", subject: "ICT", text: "HTML stands for:", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink Text Mode Lang", "Home Tool Markup Lang"], answer: 0, citation: "JU 2022 – ICT Q.5" },
  ],
  iba: [
    { id: "i1", subject: "Math", text: "If 3x + 5 = 20, then x = ?", options: ["3", "5", "15", "7"], answer: 1, citation: "IBA-DU 2021 – Math Q.2" },
    { id: "i2", subject: "English", text: "Choose the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Accomodatte"], answer: 2, citation: "IBA-DU 2020 – English Q.6" },
    { id: "i3", subject: "Analytical", text: "If all roses are flowers and some flowers fade quickly, which is true?", options: ["All roses fade quickly", "Some roses may fade quickly", "No rose fades", "All flowers are roses"], answer: 1, citation: "IBA-DU 2022 – Analytical Q.3" },
    { id: "i4", subject: "Math", text: "20% of 250 is:", options: ["25", "50", "75", "100"], answer: 1, citation: "IBA-JU 2021 – Math Q.4" },
    { id: "i5", subject: "English", text: "Synonym of 'concise':", options: ["Brief", "Long", "Detailed", "Vague"], answer: 0, citation: "IBA-DU 2019 – English Q.7" },
    { id: "i6", subject: "Math", text: "A train travels 60 km in 40 min. Its speed in km/h is:", options: ["80", "90", "100", "120"], answer: 1, citation: "IBA-DU 2020 – Math Q.10" },
    { id: "i7", subject: "Analytical", text: "Next in series: 2, 6, 12, 20, ?", options: ["28", "30", "32", "36"], answer: 1, citation: "IBA-JU 2022 – Analytical Q.5" },
    { id: "i8", subject: "English", text: "Antonym of 'lucid':", options: ["Clear", "Obscure", "Bright", "Plain"], answer: 1, citation: "IBA-DU 2018 – English Q.4" },
    { id: "i9", subject: "Math", text: "Simple interest on 1000 BDT at 5% for 2 years:", options: ["50", "100", "150", "200"], answer: 1, citation: "IBA-DU 2022 – Math Q.6" },
    { id: "i10", subject: "Analytical", text: "If A > B and B > C, then:", options: ["C > A", "A > C", "A = C", "Cannot say"], answer: 1, citation: "IBA-JU 2020 – Analytical Q.2" },
  ],
};

export function getQuestions(track: TrackId, count: number, subject?: string): ExamQuestion[] {
  let pool = POOL[track];
  if (subject && subject !== "All") pool = pool.filter((q) => q.subject === subject);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out: ExamQuestion[] = [];
  while (out.length < count) out.push(...shuffled);
  return out.slice(0, count);
}

export interface SourceCard {
  institution: string;
  year: number;
  subject: string;
  excerpt: string;
  match: number;
}

export function mockSources(track: TrackId): SourceCard[] {
  const institutions: Record<TrackId, string[]> = {
    engineering: ["BUET", "CUET", "RUET", "KUET"],
    medical: ["MBBS", "BDS", "MBBS"],
    varsity: ["DU Ka", "JU", "CU", "RU"],
    iba: ["IBA-DU", "IBA-JU", "IBA-DU"],
  };
  const subjects: Record<TrackId, string[]> = {
    engineering: ["Physics", "Math", "Chemistry"],
    medical: ["Biology", "Chemistry", "Physics"],
    varsity: ["Bangla", "English", "GK"],
    iba: ["Math", "English", "Analytical"],
  };
  const insts = institutions[track];
  const subs = subjects[track];
  return Array.from({ length: 3 }).map((_, i) => ({
    institution: insts[i % insts.length],
    year: 2024 - i,
    subject: subs[i % subs.length],
    excerpt:
      "A particle of mass m moves under the influence of a central force directed toward a fixed point. Find the equation of motion…",
    match: 95 - i * 7,
  }));
}

// Dashboard seed
export function dashboardSeed() {
  const days = 84;
  const today = new Date();
  const heatmap = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 5) };
  });
  return {
    readiness: 72,
    exams: [
      { name: "Mock 1", score: 55 },
      { name: "Mock 2", score: 62 },
      { name: "Mock 3", score: 60 },
      { name: "Mock 4", score: 71 },
      { name: "Mock 5", score: 78 },
      { name: "Mock 6", score: 82 },
    ],
    subjects: [
      { subject: "Physics", accuracy: 82 },
      { subject: "Chemistry", accuracy: 65 },
      { subject: "Math", accuracy: 88 },
      { subject: "English", accuracy: 74 },
    ],
    weakAreas: [
      { topic: "Organic Chemistry · Reaction Mechanisms", accuracy: 48 },
      { topic: "Rotational Dynamics", accuracy: 54 },
      { topic: "Reading Comprehension", accuracy: 61 },
    ],
    heatmap,
    summary: {
      questions: 412,
      studyMinutes: 2730,
      examsCompleted: 6,
    },
  };
}
