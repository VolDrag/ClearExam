export type TrackId = "engineering" | "medical" | "varsity" | "iba";

export interface Track {
  id: TrackId;
  name: string;
  short: string;
  institutions: string;
  description: string;
  subjects: string[];
  samples: string[];
  icon: string;
}

export const TRACKS: Track[] = [
  {
    id: "engineering",
    name: "Engineering",
    short: "ENG",
    institutions: "BUET · CUET · RUET · KUET",
    description: "Engineering university admission prep across all four BITs.",
    subjects: ["Physics", "Chemistry", "Math", "English"],
    samples: [
      "Explain Newton's second law with a BUET-style problem.",
      "Derive the formula for centripetal acceleration.",
      "Walk me through balancing a redox reaction.",
      "Tips for the CUET math section under time pressure?",
    ],
    icon: "⚙️",
  },
  {
    id: "medical",
    name: "Medical",
    short: "MED",
    institutions: "MBBS · BDS admission",
    description: "DGHS medical & dental admission, biology-heavy prep.",
    subjects: ["Biology", "Chemistry", "Physics", "English", "General Knowledge"],
    samples: [
      "Explain the structure of a nephron in detail.",
      "Common MBBS past question on Mendelian genetics?",
      "Difference between mitosis and meiosis with a diagram-style answer.",
      "How to revise biology in the last 30 days?",
    ],
    icon: "🩺",
  },
  {
    id: "varsity",
    name: "Varsity",
    short: "VAR",
    institutions: "DU · JU · CU · RU cluster",
    description: "General university (Ka/Kha/Ga unit) cluster preparation.",
    subjects: ["Bangla", "English", "General Knowledge", "Math", "ICT"],
    samples: [
      "Bangla literature MCQ tips for DU Ka unit.",
      "Important GK topics that repeat in DU Kha unit.",
      "Common English grammar traps in varsity exams.",
      "How to prepare for the cluster admission test?",
    ],
    icon: "🎓",
  },
  {
    id: "iba",
    name: "IBA",
    short: "IBA",
    institutions: "IBA-DU · IBA-JU business admission",
    description: "Business school admission — math, analytical, English.",
    subjects: ["Math", "English", "Analytical", "Writing"],
    samples: [
      "Tricks for IBA quantitative section under 30 minutes.",
      "Common analytical reasoning patterns in IBA-DU.",
      "How should I structure the written ability test?",
      "Recommended reading speed for IBA reading comp?",
    ],
    icon: "💼",
  },
];

export function getTrack(id: TrackId | null | undefined): Track {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0];
}
