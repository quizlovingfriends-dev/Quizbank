/**
 * six-pile.js — Data for the 6-pile / "ladder" question type.
 *
 * Each entry: a category prompt + exactly 6 tiles. Tiles can mix correct
 * and decoys. Game rule: click tiles one at a time; +1 per correct;
 * the first wrong click ends the round (score = correct picks before it).
 * If a round has fewer than 6 correct answers, the cap is the number
 * of correct tiles in the set.
 *
 * Schema:
 *   id      — number, unique across the whole vault (start at 1001 to avoid
 *             colliding with qa-type ids)
 *   type    — 'six-pile'
 *   topic   — same topic vocabulary used elsewhere ('movies', 'sports', ...)
 *   category— the prompt shown to the player (e.g., "Movies Directed by X")
 *   tiles   — array of 6 { label, correct }
 *   funda   — optional explanatory paragraph shown after the round
 */
const SIX_PILE_QUESTIONS = [
  {
    id: 1001,
    type: "six-pile",
    topic: "movies",
    category: "Movies Directed by Venkat Prabhu",
    tiles: [
      { label: "Vadacurry",  correct: false },
      { label: "Biriyani",   correct: true  },
      { label: "Custody",    correct: true  },
      { label: "Mangatha",   correct: true  },
      { label: "Nodadigal",  correct: false },
      { label: "Goa",        correct: true  }
    ],
    funda: "Venkat Prabhu is a Tamil filmmaker known for his ensemble-cast comedies and thrillers. His directed films include Chennai 600028, Saroja, Goa, Mankatha (often spelled Mangatha), Biriyani, Massu, and Custody. Vadacurry and Nodigal are by other directors."
  }
  // Add more 6-pile questions here as you build them.
];

if (typeof window !== 'undefined') window.SIX_PILE_QUESTIONS = SIX_PILE_QUESTIONS;
