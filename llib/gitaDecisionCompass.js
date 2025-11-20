// lib/gitaDecisionCompass.js

// 1. Starter verse library (we can expand later)
export const allVerses = [
  {
    ref: "BG 2.47",
    text: "You have a right to action alone, never to its fruits. Do not let the fruits of action be your motive, nor let your attachment be to inaction.",
    themes: ["duty", "work", "non-attachment", "decision-making", "stress"],
    summary: "Do the right action sincerely, without clinging to the result."
  },
  {
    ref: "BG 2.48",
    text: "Perform your duty, O Arjuna, with an even mind, abandoning all attachment to success or failure. Such evenness of mind is called yoga.",
    themes: ["equanimity", "success", "failure", "work", "stress"],
    summary: "Stay steady in both success and failure; this balance is true yoga."
  },
  {
    ref: "BG 3.19",
    text: "Therefore, always perform your duty without attachment, because by working without attachment one attains the Supreme.",
    themes: ["duty", "work", "non-attachment", "responsibility"],
    summary: "Keep acting according to your duty, but without inner clinging."
  },
  {
    ref: "BG 4.20",
    text: "One who is free from attachment, whose mind is fixed in knowledge, acts for the sake of sacrifice and his actions are entirely dissolved.",
    themes: ["non-attachment", "surrender", "knowledge", "ego"],
    summary: "Offer your actions to something higher; let go of ego-claiming."
  },
  {
    ref: "BG 6.5",
    text: "Let a man raise himself by his self; let him not lower himself. For this self alone is the friend of oneself, and this self alone is the enemy of oneself.",
    themes: ["self-mastery", "discipline", "inner-strength", "mental-health"],
    summary: "Your own mind can either lift you up or pull you down."
  },
  {
    ref: "BG 6.26",
    text: "Wherever the restless and unsteady mind wanders away, let him subdue it and bring it back under the control of the Self alone.",
    themes: ["mind", "restlessness", "meditation", "anxiety"],
    summary: "Whenever the mind runs away, gently bring it back again and again."
  },
  {
    ref: "BG 12.13-14",
    text: "He who hates no being, who is friendly and compassionate, free from ‘mine’-ness and ego, equal in pleasure and pain, and forgiving… such a devotee is dear to Me.",
    themes: ["relationships", "compassion", "ego", "love", "forgiveness"],
    summary: "Relate to others with compassion, humility, and forgiveness."
  },
  {
    ref: "BG 18.66",
    text: "Abandon all other dharmas and take refuge in Me alone. I will liberate you from all sin; do not grieve.",
    themes: ["surrender", "trust", "fear", "anxiety"],
    summary: "Offer your burden to the Divine and trust; you are not alone."
  }
];

// 2. Extract themes from user input (lifeArea, emotion, text)
export function extractThemesFromInput({
  lifeArea = "general",
  emotion = "other",
  situation = "",
  desiredOutcome = "",
  constraints = ""
}) {
  const themes = [];

  // Emotion-based themes
  const e = (emotion || "").toLowerCase();
  if (e === "anxious" || e === "anxiety" || e === "worried") {
    themes.push("anxiety", "fear", "overthinking", "trust", "stress");
  }
  if (e === "angry" || e === "frustrated") {
    themes.push("anger", "control", "ego");
  }
  if (e === "guilty") {
    themes.push("guilt", "duty", "responsibility", "forgiveness");
  }
  if (e === "sad" || e === "depressed") {
    themes.push("sadness", "loss", "hope", "trust");
  }
  if (e === "confused") {
    themes.push("confusion", "decision-making", "clarity");
  }
  if (e === "hopeful") {
    themes.push("hope", "faith", "trust");
  }

  // Life area themes
  const la = (lifeArea || "").toLowerCase();
  if (la === "career" || la === "work") {
    themes.push("duty", "work", "purpose", "decision-making");
  }
  if (la === "relationships") {
    themes.push("attachment", "love", "communication", "forgiveness");
  }
  if (la === "family") {
    themes.push("responsibility", "care", "dharma");
  }
  if (la === "health") {
    themes.push("health", "self-care", "discipline");
  }
  if (la === "finance" || la === "money") {
    themes.push("wealth", "security", "non-attachment");
  }
  if (la === "spiritual") {
    themes.push("surrender", "devotion", "knowledge", "self-mastery");
  }

  // Simple keyword scan in the free-text fields
  const combinedText = (
    (situation || "") +
    " " +
    (desiredOutcome || "") +
    " " +
    (constraints || "")
  ).toLowerCase();

  if (combinedText.includes("money") || combinedText.includes("salary") || combinedText.includes("income")) {
    themes.push("wealth", "security", "non-attachment");
  }
  if (combinedText.includes("health") || combinedText.includes("disease") || combinedText.includes("illness")) {
    themes.push("health", "self-care", "discipline");
  }
  if (
    combinedText.includes("choice") ||
    combinedText.includes("decide") ||
    combinedText.includes("decision") ||
    combinedText.includes("confused")
  ) {
    themes.push("decision-making", "clarity");
  }
  if (
    combinedText.includes("wife") ||
    combinedText.includes("husband") ||
    combinedText.includes("marriage") ||
    combinedText.includes("child") ||
    combinedText.includes("son") ||
    combinedText.includes("daughter") ||
    combinedText.includes("parents") ||
    combinedText.includes("family")
  ) {
    themes.push("relationships", "family", "responsibility", "love");
  }

  // Deduplicate themes
  const uniqueThemes = Array.from(new Set(themes));
  return uniqueThemes;
}

// 3. Retrieve best-matching verses based on themes
export function retrieveGitaVerses({ themes = [], lifeArea = "general", emotion = "other", situation = "" }) {
  if (!themes || themes.length === 0) {
    // If no themes found, fall back to a generic “core” verse or two
    return allVerses.slice(0, 2);
  }

  const candidates = [];

  for (const verse of allVerses) {
    const overlapCount = countOverlap(themes, verse.themes);
    if (overlapCount > 0) {
      candidates.push({ verse, score: overlapCount });
    }
  }

  // If nothing matched at all, again fall back to first 2–3 core verses
  if (candidates.length === 0) {
    return allVerses.slice(0, 3);
  }

  // Sort best matches first
  candidates.sort((a, b) => b.score - a.score);

  // Take top 1–3 verses
  const top = candidates.slice(0, 3).map((c) => c.verse);
  return top;
}

// Helper: count
