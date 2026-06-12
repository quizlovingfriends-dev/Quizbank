/**
 * extras.js — Seed data for new question types built ahead of OCR results.
 *
 * Each type has its own array. The engines (js/connect.js, js/odd-one-out.js,
 * etc.) read these arrays AND any matching types added later to QUIZ_QUESTIONS.
 *
 * IDs start at 2000 to avoid colliding with anything in questions.js.
 */

// ===== CONNECT — 3-4 clues, find the common link =====
const CONNECT_QUESTIONS = [
  {
    id: 2001, type: "connect", topic: "history",
    clues: [
      "He was born in Mumbai in 1869.",
      "He famously led the Salt March in 1930.",
      "He was assassinated on 30 January 1948."
    ],
    answer: "Mahatma Gandhi",
    funda: "Mohandas Karamchand Gandhi led India's nonviolent independence movement against British rule and is honoured worldwide as the Father of the Nation."
  },
  {
    id: 2002, type: "connect", topic: "geography",
    clues: [
      "Its longest river is the Nile.",
      "It is divided by the equator.",
      "It contains the Sahara Desert."
    ],
    answer: "Africa",
    funda: "Africa is the world's second-largest continent by both area and population, home to 54 countries."
  },
  {
    id: 2003, type: "connect", topic: "sports",
    clues: [
      "He played for the West Indies.",
      "He scored an unbeaten 400 in a Test innings.",
      "He held the record for highest individual Test score."
    ],
    answer: "Brian Lara",
    funda: "Brian Charles Lara scored 400* against England in 2004, the highest individual score in Test cricket."
  },
  {
    id: 2004, type: "connect", topic: "literature",
    clues: [
      "He was born in Stratford-upon-Avon.",
      "He wrote 'A Midsummer Night's Dream'.",
      "His birthday is also his death-day: 23 April."
    ],
    answer: "William Shakespeare",
    funda: "Shakespeare wrote 39 plays and 154 sonnets, profoundly influencing the English language."
  }
];

// ===== ODD-ONE-OUT — N items, identify the one that doesn't fit =====
const ODD_ONE_OUT_QUESTIONS = [
  {
    id: 2101, type: "odd-one-out", topic: "geography",
    prompt: "Which of these is NOT a capital city?",
    items: ["Paris", "Berlin", "Sydney", "Tokyo"],
    odd: "Sydney",
    funda: "Sydney is Australia's largest city but the capital is Canberra. Paris, Berlin and Tokyo are capitals of France, Germany and Japan."
  },
  {
    id: 2102, type: "odd-one-out", topic: "science",
    prompt: "Which of these is NOT a noble gas?",
    items: ["Helium", "Neon", "Hydrogen", "Argon", "Krypton"],
    odd: "Hydrogen",
    funda: "Hydrogen is a non-metal in group 1 of the periodic table, not a noble gas. Helium, Neon, Argon and Krypton are all in group 18."
  },
  {
    id: 2103, type: "odd-one-out", topic: "sports",
    prompt: "Which of these is NOT a Grand Slam tennis tournament?",
    items: ["Wimbledon", "French Open", "Indian Wells", "US Open", "Australian Open"],
    odd: "Indian Wells",
    funda: "Indian Wells is a Masters 1000 event but not a Grand Slam. The four Slams are Wimbledon, Roland-Garros (French), the US Open and the Australian Open."
  },
  {
    id: 2104, type: "odd-one-out", topic: "history",
    prompt: "Which of these did NOT serve as Prime Minister of India?",
    items: ["Indira Gandhi", "Atal Bihari Vajpayee", "S. Radhakrishnan", "Manmohan Singh"],
    odd: "S. Radhakrishnan",
    funda: "Sarvepalli Radhakrishnan was India's second President (1962-67), not a Prime Minister."
  }
];

// ===== MCQ — multiple choice, pick 1 =====
const MCQ_QUESTIONS = [
  {
    id: 2201, type: "mcq", topic: "history",
    question: "In which year did India gain independence from British rule?",
    options: ["1942", "1945", "1947", "1950"],
    correctIndex: 2,
    funda: "India gained independence on 15 August 1947, after nearly 200 years of British rule. The Constitution was adopted on 26 January 1950."
  },
  {
    id: 2202, type: "mcq", topic: "science",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctIndex: 2,
    funda: "Au comes from the Latin 'aurum'. Ag is silver, Gd is gadolinium, Go is not an element symbol."
  },
  {
    id: 2203, type: "mcq", topic: "geography",
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctIndex: 3,
    funda: "The Pacific Ocean covers about 63 million square miles — larger than all of Earth's landmass combined."
  },
  {
    id: 2204, type: "mcq", topic: "literature",
    question: "Who wrote 'Pride and Prejudice'?",
    options: ["Charlotte Brontë", "Jane Austen", "Mary Shelley", "Virginia Woolf"],
    correctIndex: 1,
    funda: "Jane Austen published Pride and Prejudice anonymously in 1813. The first line is one of literature's most famous openings."
  },
  {
    id: 2205, type: "mcq", topic: "sports",
    question: "How many players are on a standard cricket team?",
    options: ["9", "10", "11", "12"],
    correctIndex: 2,
    funda: "A cricket team has 11 players on the field. The 12th man is a substitute who can field but not bat or bowl."
  }
];

// ===== SEQUENCE — arrange in correct order =====
const SEQUENCE_QUESTIONS = [
  {
    id: 2301, type: "sequence", topic: "history",
    prompt: "Arrange these Indian PMs in chronological order (earliest first):",
    items: [
      { label: "Indira Gandhi", order: 2 },
      { label: "Jawaharlal Nehru", order: 1 },
      { label: "Rajiv Gandhi", order: 3 },
      { label: "Narendra Modi", order: 4 }
    ],
    funda: "Nehru (1947-64), Indira Gandhi (first term 1966), Rajiv Gandhi (1984), Modi (2014-present). Note: Gulzarilal Nanda served as acting PM twice between Nehru and Indira."
  },
  {
    id: 2302, type: "sequence", topic: "science",
    prompt: "Arrange these planets by distance from the Sun (closest first):",
    items: [
      { label: "Mars", order: 4 },
      { label: "Venus", order: 2 },
      { label: "Mercury", order: 1 },
      { label: "Earth", order: 3 }
    ],
    funda: "Order from Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Mnemonic: 'My Very Easy Method Just Speeds Up Naming'."
  },
  {
    id: 2303, type: "sequence", topic: "sports",
    prompt: "Arrange these Cricket World Cup winners in chronological order:",
    items: [
      { label: "India 2011", order: 3 },
      { label: "West Indies 1975", order: 1 },
      { label: "Australia 2023", order: 4 },
      { label: "India 1983", order: 2 }
    ],
    funda: "West Indies won the first two CWCs (1975, 1979). India won in 1983 (Kapil's Devils), 2011 (Dhoni). Australia has won 6 titles, the most of any nation."
  },
  {
    id: 2304, type: "sequence", topic: "geography",
    prompt: "Arrange these mountains by height (tallest first):",
    items: [
      { label: "K2", order: 2 },
      { label: "Mount Everest", order: 1 },
      { label: "Kangchenjunga", order: 3 },
      { label: "Mont Blanc", order: 4 }
    ],
    funda: "Everest 8849m, K2 8611m, Kangchenjunga 8586m, Mont Blanc 4806m (highest in the Alps). The top 14 peaks in the world are all in Asia."
  }
];

if (typeof window !== 'undefined') {
    window.CONNECT_QUESTIONS = CONNECT_QUESTIONS;
    window.ODD_ONE_OUT_QUESTIONS = ODD_ONE_OUT_QUESTIONS;
    window.MCQ_QUESTIONS = MCQ_QUESTIONS;
    window.SEQUENCE_QUESTIONS = SEQUENCE_QUESTIONS;
}
