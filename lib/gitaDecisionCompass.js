// lib/gitaDecisionCompass.js

// 1. Starter verse library (now richer: Sanskrit, transliteration, translations)
export const allVerses = [
  {
    ref: "BG 2.47",
    chapter: 2,
    verse: 47,
    devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    transliteration: "karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
    hiTranslation: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। कर्मफल का कारण मत बनो और अकर्मण्यता में भी आसक्त मत हो।",
    enTranslation: "You have a right only to your actions, never to their fruits. Let not the results be your motive, nor let your attachment be to inaction.",
    shortMeaning: "Do the right action sincerely, without clinging to the result or becoming paralysed by fear.",
    // kept for backward compatibility
    text: "You have a right to action alone, never to its fruits. Do not let the fruits of action be your motive, nor let your attachment be to inaction.",
    summary: "Focus on doing the right action without clinging to what you will get from it.",
    themes: ["duty", "work", "non-attachment", "decision-making", "stress"]
  },
  {
    ref: "BG 2.48",
    chapter: 2,
    verse: 48,
    devanagari: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥",
    transliteration: "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate",
    hiTranslation: "हे धनंजय, आसक्ति त्यागकर सिद्धि और असिद्धि में समभाव रखकर योग में स्थित होकर कर्म करो। समत्व ही योग कहलाता है।",
    enTranslation: "Established in yoga, perform your actions, O Dhananjaya, abandoning attachment and remaining equal in success and failure. Such evenness is called yoga.",
    shortMeaning: "Act steadily and let your mind stay even in both success and failure.",
    text: "Perform your duty, O Arjuna, with an even mind, abandoning all attachment to success or failure. Such evenness of mind is called yoga.",
    summary: "Stay steady in both success and failure; this balance is true yoga.",
    themes: ["equanimity", "success", "failure", "work", "stress"]
  },
  {
    ref: "BG 3.19",
    chapter: 3,
    verse: 19,
    devanagari: "तस्मादसक्तः सततं कार्यं कर्म समाचर ।\nअसक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः ॥",
    transliteration: "tasmād asaktaḥ satataṁ kāryaṁ karma samācara\nasakto hy ācaran karma param āpnoti pūruṣaḥ",
    hiTranslation: "इसलिए, आसक्ति रहित होकर सदा कर्तव्य कर्म को भली भांति करो, क्योंकि आसक्ति रहित होकर कर्म करने वाला मनुष्य परम पद को प्राप्त होता है।",
    enTranslation: "Therefore, always perform your obligatory duty without attachment, for by working without attachment a person attains the highest.",
    shortMeaning: "Keep doing your duty with sincerity, but without inner clinging to how things must turn out.",
    text: "Therefore, always perform your duty without attachment, because by working without attachment one attains the Supreme.",
    summary: "Keep acting according to your duty, but without inner clinging.",
    themes: ["duty", "work", "non-attachment", "responsibility"]
  },
  {
    ref: "BG 4.20",
    chapter: 4,
    verse: 20,
    devanagari: "त्यक्त्वा कर्मफलासङ्गं नित्यतृप्तो निराश्रयः ।\nकर्मण्यभिप्रवृत्तोऽपि नैव किंचित्करोति सः ॥",
    transliteration: "tyaktvā karma-phalāsaṅgaṁ nitya-tṛpto nirāśrayaḥ\nkarmaṇy abhipravṛtto 'pi naiva kiñcit karoti saḥ",
    hiTranslation: "कर्मफल के आसक्ति को त्यागकर, सदा तृप्त और निर्भरता से रहित होकर, ऐसा व्यक्ति कर्म में प्रवृत्त होने पर भी वास्तव में कुछ नहीं करता।",
    enTranslation: "Having abandoned attachment to the fruits of actions, ever content and depending on nothing, such a person, though engaged in work, does nothing at all.",
    shortMeaning: "Offer your actions to something higher; when ego relaxes, work becomes lighter and purer.",
    text: "One who is free from attachment, whose mind is fixed in knowledge, acts for the sake of sacrifice and his actions are entirely dissolved.",
    summary: "Offer your actions to something higher; let go of ego-claiming.",
    themes: ["non-attachment", "surrender", "knowledge", "ego"]
  },
  {
    ref: "BG 6.5",
    chapter: 6,
    verse: 5,
    devanagari: "उद्धरेदात्मनाऽत्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
    transliteration: "uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ",
    hiTranslation: "मनुष्य को चाहिए कि अपने द्वारा अपने को उठाए, न कि अपने को गिराए, क्योंकि स्वयं ही अपना मित्र है और स्वयं ही अपना शत्रु है।",
    enTranslation: "One should lift oneself by oneself and not degrade oneself. For the self alone is the friend of oneself, and the self alone is the enemy of oneself.",
    shortMeaning: "Your own mind and attitude can lift you up or pull you down; learn to be your own friend.",
    text: "Let a man raise himself by his self; let him not lower himself. For this self alone is the friend of oneself, and this self alone is the enemy of oneself.",
    summary: "Your own mind can either lift you up or pull you down.",
    themes: ["self-mastery", "discipline", "inner-strength", "mental-health"]
  },
  {
    ref: "BG 6.26",
    chapter: 6,
    verse: 26,
    devanagari: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम् ।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत् ॥",
    transliteration: "yato yato niścarati manaś cañcalam asthiram\ntatas tato niyamyaitad ātmany eva vaśaṁ nayet",
    hiTranslation: "जहाँ-जहाँ चंचल और अस्थिर मन भागता है, वहाँ-वहाँ से उसे वश में करके आत्मा में ही लगाना चाहिए।",
    enTranslation: "Wherever the restless and unsteady mind wanders, one should bring it back under the control of the Self alone.",
    shortMeaning: "Whenever the mind runs away, gently bring it back again and again without harshness.",
    text: "Wherever the restless and unsteady mind wanders away, let him subdue it and bring it back under the control of the Self alone.",
    summary: "Whenever the mind runs away, gently bring it back again and again.",
    themes: ["mind", "restlessness", "meditation", "anxiety"]
  },
  {
    ref: "BG 12.13-14",
    chapter: 12,
    verse: 13.14,
    devanagari: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च ।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी ॥\nसन्तुष्टः सततं योगी यतात्मा दृढनिश्चयः ।\nमय्यर्पितमनोबुद्धिर्यो मद्भक्तः स मे प्रियः ॥",
    transliteration: "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca\nnirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī\nsantuṣṭaḥ satataṁ yogī yatātmā dṛḍha-niścayaḥ\nmayy arpitamano-buddhir yo mad-bhaktaḥ sa me priyaḥ",
    hiTranslation: "जो सभी प्राणियों से द्वेष रहित, सबका मित्र और करुणामय है, ममता और अहंकार से रहित, सुख-दुःख में सम, क्षमाशील, सदा संतुष्ट, योगी, इन्द्रियों को जीता हुआ, दृढ़ निश्चयी और जिसका मन और बुद्धि मुझमें लगे हैं – ऐसा मेरा भक्त मुझे प्रिय है।",
    enTranslation: "He who has no hatred for any being, who is friendly and compassionate, free from ‘mine’-ness and ego, equal in pleasure and pain, and patient, ever content, disciplined, firm in resolve, and whose mind and intellect are fixed on Me—such a devotee is dear to Me.",
    shortMeaning: "Relate to others with kindness, humility and forgiveness; such a heart is deeply loved by the Divine.",
    text: "He who hates no being, who is friendly and compassionate, free from ‘mine’-ness and ego, equal in pleasure and pain, and forgiving… such a devotee is dear to Me.",
    summary: "Relate to others with compassion, humility, and forgiveness.",
    themes: ["relationships", "compassion", "ego", "love", "forgiveness"]
  },
  {
    ref: "BG 18.66",
    chapter: 18,
    verse: 66,
    devanagari: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥",
    transliteration: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    hiTranslation: "सभी धर्मों (कर्तव्यों) को त्यागकर केवल मेरी शरण में आ जाओ; मैं तुम्हें सभी पापों से मुक्त कर दूँगा, शोक मत करो।",
    enTranslation: "Abandon all other dharmas and take refuge in Me alone. I will liberate you from all sin; do not grieve.",
    shortMeaning: "When the mind is overwhelmed, offer everything to the Divine and trust you are being held.",
    text: "Abandon all other dharmas and take refuge in Me alone. I will liberate you from all sin; do not grieve.",
    summary: "Offer your burden to the Divine and trust; you are not alone.",
    themes: ["surrender", "trust", "fear", "anxiety"]
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

// Helper: count overlap between two arrays
function countOverlap(a = [], b = []) {
  const setB = new Set(b);
  let count = 0;
  for (const item of a) {
    if (setB.has(item)) count++;
  }
  return count;
}
