/**
 * QUIZBANK DATA FILE
 * ==================
 * How to add a question:
 *
 * {
 *   id: <unique number>,
 *   topic: "sports" | "wildlife" | "current-affairs" | "history" | "politics" | "cuisines",
 *   question: {
 *     text: "Your question text here.",
 *     image: "images/q1_question.jpg"   // or null if no image
 *   },
 *   answer: {
 *     text: "The answer text.",
 *     image: "images/q1_answer.jpg"     // or null if no image
 *   },
 *   funda: {
 *     text: "Additional context / explanation.",
 *     image: "images/q1_funda.jpg"      // or null if no image
 *   }
 * }
 *
 * - All images should be placed in the /images/ folder.
 * - If a question, answer, or funda has no image, set image to null.
 * - The "text" field supports basic HTML like <strong>bold</strong> and <em>italic</em>.
 */

const QUIZ_QUESTIONS = [

  // ─── SPORTS ──────────────────────────────────────────────────────────────────

  {
    id: 1,
    topic: "sports",
    question: {
      text: "Who holds the record for the highest individual score in Test cricket, and what is that score?",
      image: null
    },
    answer: {
      text: "<strong>Brian Lara</strong> of the West Indies, with an unbeaten <strong>400*</strong> against England in Antigua in April 2004.",
      image: "images/brian_lara_400.png"
    },
    funda: {
      text: "Lara holds this record twice over. He first set it with 375 against England in 1994, which was then broken by Matthew Hayden (380) in 2003. Lara reclaimed it the very next year with 400* in 2004. His innings lasted 582 balls over nearly 13 hours.",
      image: null
    }
  },

  {
    id: 2,
    topic: "sports",
    question: {
      text: "Who is known as the 'Flying Sikh', and why was this title given to him?",
      image: null
    },
    answer: {
      text: "<strong>Milkha Singh</strong>, the legendary Indian sprinter, earned this title after his extraordinary performance at the 1958 Commonwealth Games in Cardiff, where he won the 440 yards race.",
      image: null
    },
    funda: {
      text: "The title 'Flying Sikh' was bestowed upon him by Pakistani President General Ayub Khan after Milkha Singh defeated Pakistan's star runner Abdul Khaliq in a race in Lahore in 1960. Milkha Singh narrowly missed an Olympic medal by finishing 4th in the 400m at the 1960 Rome Olympics, a feat that was not equalled by an Indian sprinter for decades.",
      image: null
    }
  },

  {
    id: 3,
    topic: "sports",
    question: {
      text: "The five rings on the Olympic flag represent five continents. Which five continents are they, and what do the colours represent?",
      image: null
    },
    answer: {
      text: "The five continents are <strong>Africa, the Americas, Asia, Europe, and Oceania</strong>. The colours — blue, yellow, black, green, and red — along with the white background, were chosen because at least one of these colours appears in the flag of every nation in the world.",
      image: null
    },
    funda: {
      text: "The Olympic flag was designed by Pierre de Coubertin in 1913 and first flown at the 1920 Antwerp Games. Contrary to popular belief, the rings do not individually represent specific continents — they were chosen for their collective representativeness across all flags.",
      image: null
    }
  },

  {
    id: 4,
    topic: "sports",
    question: {
      text: "In the sport of basketball, what is the exact diameter of the hoop in inches, and why is this measurement significant?",
      image: null
    },
    answer: {
      text: "The hoop has an inner diameter of <strong>18 inches</strong>.",
      image: null
    },
    funda: {
      text: "A standard basketball has a diameter of approximately 9.4 inches, meaning the hoop is almost exactly twice as wide as the ball. This is intentional — it gives shooters a margin of error while still requiring precise arc. A ball can pass through the hoop at a slight angle, which is why 'bank shots' off the backboard are effective.",
      image: null
    }
  },

  // ─── WILDLIFE ─────────────────────────────────────────────────────────────────

  {
    id: 5,
    topic: "wildlife",
    question: {
      text: "What is the collective noun for a group of flamingos?",
      image: null
    },
    answer: {
      text: "A group of flamingos is called a <strong>flamboyance</strong>.",
      image: null
    },
    funda: {
      text: "Flamingos are one of the most social birds on earth and gather in colonies of up to a million birds. Their iconic pink colour comes not from genetics but from their diet — carotenoid pigments found in the algae and crustaceans they eat. Flamingos born in captivity that are not fed carotenoid-rich food gradually turn white.",
      image: null
    }
  },

  {
    id: 6,
    topic: "wildlife",
    question: {
      text: "The cheetah is the fastest land animal. What is approximately its top speed, and how does this compare to the fastest animal on Earth overall?",
      image: null
    },
    answer: {
      text: "The cheetah can reach speeds of approximately <strong>112–120 km/h (70–75 mph)</strong>. The fastest animal on Earth overall is the <strong>peregrine falcon</strong>, which dives at speeds exceeding <strong>320 km/h (200 mph)</strong> in a hunting stoop.",
      image: null
    },
    funda: {
      text: "A cheetah can accelerate from 0 to 96 km/h in under 3 seconds — faster than most sports cars. However, it can only sustain this speed for 20–30 seconds before overheating. Unlike other big cats, cheetahs cannot roar; they chirp, purr, and yelp instead.",
      image: null
    }
  },

  {
    id: 7,
    topic: "wildlife",
    question: {
      text: "Which is the world's largest living lizard species, and where is it found?",
      image: null
    },
    answer: {
      text: "The <strong>Komodo dragon</strong> (<em>Varanus komodoensis</em>), found on the Indonesian islands of Komodo, Rinca, Flores, and Gili Motang.",
      image: null
    },
    funda: {
      text: "Komodo dragons can grow up to 3 metres in length and weigh up to 70 kg. They were unknown to the Western scientific world until 1912. Although once thought to kill prey purely through bacteria in their saliva, research has confirmed they possess venom glands in their lower jaw that cause rapid blood loss and prevent clotting. They are also capable of parthenogenesis — females can reproduce without a male.",
      image: null
    }
  },

  // ─── CURRENT AFFAIRS ──────────────────────────────────────────────────────────

  {
    id: 8,
    topic: "current-affairs",
    question: {
      text: "Pictured below is a famous personality wearing a peculiar gown. Identify the personality and explain what the gown is all about.",
      image: "images/radhika_merchant_gown.png"
    },
    answer: {
      text: "The personality is <strong>Radhika Merchant</strong>. The gown features a love letter written to her by her then fiancé, <strong>Anant Ambani</strong>, before their marriage.",
      image: null
    },
    funda: {
      text: "Anant Ambani wrote several heartfelt letters to Radhika Merchant during their courtship. Radhika preserved one of these letters and had its text printed on the fabric of her gown, which she wore at their pre-wedding ceremony. The letter on the gown read widely shared lines including <em>'I love you'</em> and intimate expressions of devotion. The gown became widely discussed for its deeply personal and romantic gesture.",
      image: null
    }
  },

  {
    id: 9,
    topic: "current-affairs",
    question: {
      text: "In August 2023, India made history in space exploration. What was the achievement, and why was it significant?",
      image: null
    },
    answer: {
      text: "India's <strong>Chandrayaan-3</strong> mission successfully landed on the <strong>lunar south pole</strong> on 23 August 2023, making India the <strong>fourth country</strong> to soft-land on the Moon and the <strong>first</strong> to land near the south pole.",
      image: "images/chandrayaan_3.png"
    },
    funda: {
      text: "The lunar south pole is of immense scientific interest because it is believed to contain water ice in permanently shadowed craters, which could be a critical resource for future human missions. Just days before Chandrayaan-3's landing, Russia's Luna-25 mission — also targeting the south pole — crashed due to a thruster malfunction, making India's success even more remarkable. The lander was named <em>Vikram</em> and the rover <em>Pragyan</em>.",
      image: null
    }
  },

  {
    id: 10,
    topic: "current-affairs",
    question: {
      text: "Which country won the FIFA World Cup 2022, held in Qatar, and who won the Golden Ball award for the tournament's best player?",
      image: null
    },
    answer: {
      text: "<strong>Argentina</strong> won the FIFA World Cup 2022. <strong>Lionel Messi</strong> received the Golden Ball award.",
      image: null
    },
    funda: {
      text: "Argentina defeated France in the final on penalty shootout (4–2) after a 3–3 draw after extra time — widely regarded as the greatest World Cup final ever played. Messi scored twice in the final. It was his record seventh World Cup Golden Ball, and at 35, he finally won the one trophy that had eluded him throughout his career. Kylian Mbappé of France scored a hat-trick in the final and won the Golden Boot.",
      image: null
    }
  },

  {
    id: 11,
    topic: "current-affairs",
    question: {
      text: "Which personality was named the TIME Person of the Year for 2023?",
      image: null
    },
    answer: {
      text: "<strong>Taylor Swift</strong> was named TIME's Person of the Year for 2023.",
      image: null
    },
    funda: {
      text: "Taylor Swift's selection as Person of the Year 2023 made her the first person to appear twice on a Person of the Year cover since the tradition began in 1927. She was recognized for her immense cultural, economic, and social impact, particularly through her record-breaking 'Eras Tour' and the re-release of her classic albums.",
      image: null
    }
  },

  // ─── HISTORY ──────────────────────────────────────────────────────────────────

  {
    id: 12,
    topic: "history",
    question: {
      text: "Who was the first woman to win a Nobel Prize, and in what field?",
      image: null
    },
    answer: {
      text: "<strong>Marie Curie</strong>, who won the Nobel Prize in <strong>Physics in 1903</strong>, which she shared with her husband Pierre Curie and Henri Becquerel for their research on radiation.",
      image: null
    },
    funda: {
      text: "Marie Curie is the only person in history to win Nobel Prizes in two different sciences — she won a second Nobel Prize, this time in Chemistry, in 1911 for her discovery of the elements radium and polonium. She named polonium after her homeland, Poland. Her notebooks from the 1890s are still radioactive and are stored in lead-lined boxes — they likely will be for another 1,500 years.",
      image: null
    }
  },

  {
    id: 13,
    topic: "history",
    question: {
      text: "In which year did the Berlin Wall fall, and what was its immediate political consequence?",
      image: null
    },
    answer: {
      text: "The Berlin Wall fell on <strong>9 November 1989</strong>. The immediate consequence was the opening of the East-West German border, leading directly to the <strong>reunification of Germany</strong> on 3 October 1990.",
      image: null
    },
    funda: {
      text: "The Wall had divided Berlin since 1961, when the East German government built it to stem the mass emigration of East Germans to the West. The announcement on 9 November 1989 was actually the result of a miscommunication — a government spokesman mistakenly announced the borders were open 'with immediate effect'. Thousands rushed to the checkpoints, guards stood aside, and the Wall came down. Over 140 people were killed attempting to cross it between 1961 and 1989.",
      image: null
    }
  },

  {
    id: 14,
    topic: "history",
    question: {
      text: "Which empire is widely considered the largest contiguous land empire in history, and at its peak, how much of the Earth's land area did it cover?",
      image: null
    },
    answer: {
      text: "The <strong>Mongol Empire</strong>, which at its peak in the 13th century covered approximately <strong>24 million square kilometres</strong> — roughly <strong>16% of the Earth's total land area</strong>.",
      image: null
    },
    funda: {
      text: "Founded by Genghis Khan in 1206, the Mongol Empire stretched from the Pacific Ocean to Eastern Europe at its height. While the British Empire was larger in total area (including overseas territories), the Mongol Empire remains the largest contiguous land empire. At its peak, it connected the Silk Road trade routes, creating one of the most significant trans-continental exchange networks in history. Genghis Khan's given name was Temüjin.",
      image: null
    }
  },

  {
    id: 15,
    topic: "history",
    question: {
      text: "What was the name of the ship on which Charles Darwin made the famous voyage that led to his theory of evolution by natural selection, and when did it depart?",
      image: null
    },
    answer: {
      text: "<strong>HMS Beagle</strong>. The ship departed from Plymouth, England, on <strong>27 December 1831</strong>.",
      image: null
    },
    funda: {
      text: "Darwin was 22 years old when he boarded the Beagle as an unpaid naturalist, invited largely for companionship to the captain, Robert FitzRoy. The voyage lasted nearly five years, during which the ship surveyed the coasts of South America and stopped at the Galápagos Islands, where Darwin observed variations in finch beaks and tortoise shells across different islands — observations that later became central to his theory of natural selection, published in <em>On the Origin of Species</em> in 1859.",
      image: null
    }
  },

  // ─── POLITICS ─────────────────────────────────────────────────────────────────

  {
    id: 16,
    topic: "politics",
    question: {
      text: "Which country became the first in the world to legally recognise same-sex marriage at the national level, and in what year?",
      image: null
    },
    answer: {
      text: "The <strong>Netherlands</strong>, in <strong>2001</strong>.",
      image: null
    },
    funda: {
      text: "The Netherlands legalised same-sex marriage on 1 April 2001 — a date critics noted was April Fool's Day, though the legislation was entirely serious. The law also allowed same-sex couples to adopt children. Belgium followed in 2003, and as of 2024, over 30 countries have legalised same-sex marriage nationally.",
      image: null
    }
  },

  {
    id: 17,
    topic: "politics",
    question: {
      text: "Who was the world's first female Prime Minister, and which country did she lead?",
      image: null
    },
    answer: {
      text: "<strong>Sirimavo Bandaranaike</strong> of <strong>Ceylon</strong> (now Sri Lanka), who became Prime Minister in <strong>1960</strong>.",
      image: null
    },
    funda: {
      text: "Sirimavo Bandaranaike came to power following the assassination of her husband, Prime Minister S.W.R.D. Bandaranaike, in 1959. She led the Sri Lanka Freedom Party to victory in 1960, becoming the world's first female head of government. She served as Prime Minister three times: 1960–65, 1970–77, and 1994–2000 (the last time under her daughter, President Chandrika Kumaratunga).",
      image: null
    }
  },

  {
    id: 18,
    topic: "politics",
    question: {
      text: "Name the five permanent members of the United Nations Security Council (P5) and explain why they have veto power.",
      image: null
    },
    answer: {
      text: "The five permanent members are the <strong>United States, the United Kingdom, France, Russia</strong> (then the USSR), and the <strong>People's Republic of China</strong>. Each holds an unconditional veto over any Security Council resolution.",
      image: null
    },
    funda: {
      text: "The P5 were the major Allied victors of World War II, and the UN Charter of 1945 enshrined their permanent membership as a mechanism to prevent them from leaving the organisation (as they had the League of Nations). The veto power means any single P5 nation can block any resolution — even on matters directly concerning itself. This has been extensively used during the Cold War and continues to be controversial, with many nations calling for reform of the Security Council.",
      image: null
    }
  },

  // ─── CUISINES ─────────────────────────────────────────────────────────────────

  {
    id: 19,
    topic: "cuisines",
    question: {
      text: "What is the primary base ingredient of traditional Japanese miso soup, and what are the main types of this ingredient?",
      image: null
    },
    answer: {
      text: "<strong>Miso</strong> — a paste made from <strong>fermented soybeans</strong>. The three main types are <strong>shiro (white)</strong>, which is mild and sweet; <strong>aka (red)</strong>, which is saltier and more robust; and <strong>awase (mixed)</strong>, which is a blend of the two.",
      image: null
    },
    funda: {
      text: "Miso has been part of Japanese cuisine for over 1,300 years. The fermentation process can take anywhere from a few weeks to several years. Beyond soup, miso is used as a marinade, glaze, and seasoning in dozens of dishes. It is rich in probiotics, protein, and various vitamins and minerals. The specific flavour profile varies significantly by region in Japan — from the mild Kyoto-style to the intense Nagoya-style.",
      image: null
    }
  },

  {
    id: 20,
    topic: "cuisines",
    question: {
      text: "What is 'Poutine', the iconic Canadian dish, and from which province does it originate?",
      image: null
    },
    answer: {
      text: "Poutine is a dish of <strong>french fries topped with fresh cheese curds and smothered in brown gravy</strong>. It originates from the province of <strong>Québec</strong>.",
      image: null
    },
    funda: {
      text: "Poutine emerged in rural Québec in the late 1950s, though the exact origin is disputed between several small towns including Warwick and Drummondville. The name is Québécois slang, loosely meaning 'mess'. The key to authentic poutine is the cheese — it must be fresh cheese curds (not shredded cheese), which squeak when bitten. The hot gravy partially melts the curds. It has since become a national Canadian symbol and spawned countless gourmet variations.",
      image: null
    }
  },

  {
    id: 21,
    topic: "cuisines",
    question: {
      text: "Saffron is the world's most expensive spice by weight. From which part of the plant is it derived, and which country is the world's largest producer?",
      image: null
    },
    answer: {
      text: "Saffron is derived from the <strong>dried stigmas</strong> (thread-like structures) of the <strong><em>Crocus sativus</em></strong> flower. Each flower produces only three stigmas, which must be hand-picked. <strong>Iran</strong> is the world's largest producer, accounting for over 90% of global production.",
      image: null
    },
    funda: {
      text: "It takes approximately 150,000 flowers — or 450,000 hand-picked stigmas — to produce just one kilogram of saffron. Harvesting occurs over a brief two-week window in autumn, and the flowers must be picked at dawn before the sun damages the delicate stigmas. Saffron's vivid yellow colour comes from the carotenoid compound <em>crocin</em>, while its aroma comes from <em>safranal</em>. In India, Kashmir saffron (Kashmiri Kesar) is considered among the finest in the world.",
      image: null
    }
  },

  {
    id: 22,
    topic: "cuisines",
    question: {
      text: "The dish 'Moussaka' is most commonly associated with Greek cuisine. What are its key layers, and which other culinary tradition has a strong claim to the dish's origin?",
      image: null
    },
    answer: {
      text: "Greek moussaka typically consists of layers of <strong>sliced aubergine (eggplant), spiced minced lamb or beef, and a rich béchamel sauce</strong> baked until golden. <strong>Turkish and Middle Eastern</strong> culinary traditions have strong historical claims to the dish's origin.",
      image: null
    },
    funda: {
      text: "The word 'moussaka' comes from the Arabic <em>musaqqa'a</em>, meaning 'chilled'. Versions of the dish exist across the Balkans, the Levant, and the Middle East — many without béchamel and some with potato instead of aubergine. The layered, béchamel-topped version now recognised as 'Greek moussaka' was standardised and popularised by chef Nikolaos Tselementes in the 1920s, who was heavily influenced by French cuisine. It is therefore somewhat a modern codification rather than an ancient recipe.",
      image: "images/moussaka.png"
    }
  },

{
    "id": 23,
    "topic": "history",
    "question": {
      "text": "This is the Olakaneeshwar Temple. [attach image] It was built by the Pallava emperor Mahendravarman in the year 630 CE. Aside from being a Shiva temple, this temple also has served one more purpose since its construction. What is the purpose?",
      "image": "images/q101_1.png"
    },
    "answer": {
      "text": "It is a lighthouse, and the oldest lighthouse in Asia. The Indian Tourism Department decided to discontinue all functional lighthouses and convert them into Tourist destinations. This is one of them.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 24,
    "topic": "current-affairs",
    "question": {
      "text": "Renowned artist-sculptor Promod Kamble is known for his unusual style of architecture. In November 2023, he completed the statue of a well-known figure, and it was inaugurated in Mumbai. The figure's pose was taken from one amongst thousands of action images of the character. Whose statue did he build?",
      "image": "images/q102_1.png"
    },
    "answer": {
      "text": "Sachin Tendulkar. (action images are his various shots in action)",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 25,
    "topic": "wildlife",
    "question": {
      "text": "The Pench Tiger Reserve is a new ____ ___ park, the first such park in India and the fifth in Asia. The international committee for the conservation of nature has recommended more countries to construct such parks. What is the significance of the Pench Tiger Reserve? FITB.",
      "image": "images/q103_1.png"
    },
    "answer": {
      "text": "Dark sky. Dark sky parks have a protected radius around them, where artificial light/electricity of any kind is banned. This is because animals need natural darkness to grow in the best way and perform life functions, such as fertilization, mating and hunting.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 26,
    "topic": "general",
    "question": {
      "text": "Given below is a picture of gigantic rocks that are seemingly balanced on top of each other. These are Domboromari, often called \"Money Rocks\" in their country. This is because they appear not only in the currency of the country (since 1981), but also in the logo of the Central Bank of the country. ID X.",
      "image": "images/q104_1.png"
    },
    "answer": {
      "text": "Zimbabwe.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 27,
    "topic": "current-affairs",
    "question": {
      "text": "Pictured below is a famous personality wearing a peculiar gown. Identify the personality and what the gown is all about.",
      "image": "images/q105_1.png"
    },
    "answer": {
      "text": "The personality is Radhika Merchant, and the gown is a love letter written to her by her to-be husband, Anant Ambani, before their marriage. Ambani wrote a variety of such letters to Merchant. She preserved one and converted this into a gown for her pre-wedding ceremony.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 28,
    "topic": "politics",
    "question": {
      "text": "Pictured below is the Portrait of Edmond de Belamy, a 2018 artwork that sold for more than 432,500 USD at a recent auction at Christie's auction house. Who is Edmund de Belamy, and why is his portrait so special?",
      "image": "images/q106_1.png"
    },
    "answer": {
      "text": "It is the first fully AI-generated portrait. It was \"drawn\" by --- AI, GAN Artwork,  an AI service that specializes in portraits. Edmund de Belamy does not exist - he was a fictional character created for the sake of the portrait.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 29,
    "topic": "general",
    "question": {
      "text": "\"The UVB radiation of the Sun breaks the B-ring of the cholesterol in the epidermis, which results in the production of X.\" This describes the process behind which important compound for the human body? ID X.",
      "image": null
    },
    "answer": {
      "text": "Vitamin D.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 30,
    "topic": "politics",
    "question": {
      "text": "Every country has an ISO code, which identifies the country in international transactions. For example, India is denoted by IN, and Germany is denoted by DE. What was the ISO country code of East Germany in the year 198-?",
      "image": null
    },
    "answer": {
      "text": "DD.' DD stood for \u201cDeutsche Demokratische Republik\u201d, which means \u201cGerman Democratic Republic (GDR)\u201d in English. The code is now DE, standing for DEustchland ('Germany' in German).",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 31,
    "topic": "politics",
    "question": {
      "text": "Pictured below is an advertisement made by a company that uses predictive analytics and data to notify police about where crimes are likely to happen. What is the company behind this advertisement? [ATTACH IMAGE]",
      "image": null
    },
    "answer": {
      "text": "IBM. A common mistake is answering CIA or FBI. Both are governmental agencies (not companies), and the CIA does not advertise any of its activities, being a secret international organization.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 32,
    "topic": "wildlife",
    "question": {
      "text": "Pictured below is the National Flower of France. What is it?",
      "image": "images/q110_1.png"
    },
    "answer": {
      "text": "Iris.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 33,
    "topic": "wildlife",
    "question": {
      "text": "These animals are ambush predators, preferring to sneak up on their prey instead of running behind them. They are blessed with great acceleration, but have poor stamina, and therefore cannot chase prey over long distances. Identify the predator being spoken about.",
      "image": null
    },
    "answer": {
      "text": "Tiger.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 34,
    "topic": "general",
    "question": {
      "text": "This word comes from a Greek word meaning 'harmony', 'order' and sometimes, 'the world'. The meaning of this word in English is a little more expansive, often being used to the entire universe and all of creation. Identify the word.",
      "image": null
    },
    "answer": {
      "text": "Cosmos.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 35,
    "topic": "general",
    "question": {
      "text": "Observe the minimalist poster of a mega-hit Hollywood thriller released in 1958, directed by the legendary Alfred Hitchcock. Identify the movie.",
      "image": "images/q113_1.png"
    },
    "answer": {
      "text": "Vertigo. One can clearly see the man on top looking down at the remaining men. Vertigo is defined as the sensation of motion when one is actually not moving at all.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 36,
    "topic": "wildlife",
    "question": {
      "text": "It is a highly contagious virus of animal origin. It's technical name is Variola. It is now eradicated. Identify the disease.",
      "image": null
    },
    "answer": {
      "text": "Small pox. It was declared eradicated by the World Health Organization 20 years ago, and became a landmark moment in the history of human healthcare.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 37,
    "topic": "sports",
    "question": {
      "text": "Pictured below is a device that is critical to a sport. Identify the sport.",
      "image": "images/q115_1.png"
    },
    "answer": {
      "text": "Ice hockey. The image is of an ice hockey puck. Since the image is highly magnified, it may be difficult to recognize at first.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 38,
    "topic": "wildlife",
    "question": {
      "text": "Pictured below is the cover page of a 20th Century classic by the world-renowned George Orwell. The famous quote on the cover says, \"All animals are equal. Some animals are more equal than others.\" Identify the title of the book.",
      "image": "images/q116_1.png"
    },
    "answer": {
      "text": "Animal Farm. The quote on the cover is one of several 'Animal Laws' in the book, used to subtly criticize modern society and government.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 39,
    "topic": "general",
    "question": {
      "text": "Morarji Desai - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 40,
    "topic": "general",
    "question": {
      "text": "Deve Gowda - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 41,
    "topic": "general",
    "question": {
      "text": "Narasimha Rao - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 42,
    "topic": "general",
    "question": {
      "text": "Gulsarilal Nanda - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 43,
    "topic": "general",
    "question": {
      "text": "Charan Singh - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 44,
    "topic": "general",
    "question": {
      "text": "Chandrasekhar - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "Morarji Desai was the first non-Congress PM, dethroning Indira Gandhi in 1977. MOVIES DIRECTED BY VENKAT PRABHU",
      "image": null
    }
  },
  {
    "id": 45,
    "topic": "general",
    "question": {
      "text": "Vadacurry - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 46,
    "topic": "general",
    "question": {
      "text": "Biriyani - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 47,
    "topic": "general",
    "question": {
      "text": "Custody - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 48,
    "topic": "general",
    "question": {
      "text": "Mangatha - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 49,
    "topic": "general",
    "question": {
      "text": "Nodadigal - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 50,
    "topic": "sports",
    "question": {
      "text": "Sarojal - RIGHT PROPOSED SPORTS FOR THE LOS ANGELES OLYMPICS 2028",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 51,
    "topic": "sports",
    "question": {
      "text": "Flag Football - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 52,
    "topic": "general",
    "question": {
      "text": "Netball - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 53,
    "topic": "general",
    "question": {
      "text": "Lacrosse - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 54,
    "topic": "general",
    "question": {
      "text": "Kabaddi - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 55,
    "topic": "general",
    "question": {
      "text": "Squash - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 56,
    "topic": "general",
    "question": {
      "text": "Baseball - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "Kabaddi was only played as a demonstration match in the 1936 Berlin Olympics under Hitler. The sport has never seen an Olympic stage since. ENGLISH WORDS FROM INDIAN LANGUAGES",
      "image": null
    }
  },
  {
    "id": 57,
    "topic": "general",
    "question": {
      "text": "Calico - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 58,
    "topic": "general",
    "question": {
      "text": "Ketchup - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 59,
    "topic": "general",
    "question": {
      "text": "Catamaran - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 60,
    "topic": "general",
    "question": {
      "text": "Mulligatawny - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 61,
    "topic": "general",
    "question": {
      "text": "Bamboo - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 62,
    "topic": "general",
    "question": {
      "text": "Karaoke - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "The words and their respective original languages are as follows: 'Calico' comes from 'Calicut', a famous coast even today. 'Ketchup' comes from Chinese. 'Catamaran' comes from the words 'kattu maram (literally 'tie wood') in Tamil. 'Mulligatawny' comes from the words 'milagai thanneer' (literally 'spiced water' or 'chili water') in Tamil. \"Mulligatawny\" is, in fact, just rasam! Bamboo' comes from the Malay word 'mambu'. 'Karaoke' comes from Japanese. FLOWERS THAT BLOOM AT NIGHT",
      "image": null
    }
  },
  {
    "id": 63,
    "topic": "general",
    "question": {
      "text": "Hibiscus - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 64,
    "topic": "wildlife",
    "question": {
      "text": "Dragonfruit flower - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 65,
    "topic": "general",
    "question": {
      "text": "Rose - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 66,
    "topic": "general",
    "question": {
      "text": "Tube rose - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 67,
    "topic": "general",
    "question": {
      "text": "Brahma kamala - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 68,
    "topic": "general",
    "question": {
      "text": "Parijata - RIGHT CARS FROM MARUTI/SUZUKI",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 69,
    "topic": "general",
    "question": {
      "text": "Fronx - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 70,
    "topic": "general",
    "question": {
      "text": "Baleno - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 71,
    "topic": "general",
    "question": {
      "text": "Jimny - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 72,
    "topic": "general",
    "question": {
      "text": "Celerio - RIGHT",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 73,
    "topic": "general",
    "question": {
      "text": "Bolero - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 74,
    "topic": "general",
    "question": {
      "text": "Elevate - WRONG",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "Bolero is by Mahindra Motors (M&M), while Elevate is by Honda THREE CLUES, 1 ANSWER MONUMENTS, PERSONALITIES OR EVENTS",
      "image": null
    }
  },
  {
    "id": 75,
    "topic": "wildlife",
    "question": {
      "text": "CLUE 1: Chairman of Helion Energy CLUE 2: Stanford dropout. CLUE 3: The Monkey's fist refers to a tight knot, which is the logo of the company. Identify the personality.",
      "image": null
    },
    "answer": {
      "text": "Sam Altman, Founder and CEO of OpenAI. His first venture was Helion Energy.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 76,
    "topic": "history",
    "question": {
      "text": "CLUE 1: March 8, 1917 CLUE 2: A classless society blooms CLUE 3: \"Workers of the world, unite!\" Identify the event.",
      "image": null
    },
    "answer": {
      "text": "The Russian Revolution",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 77,
    "topic": "general",
    "question": {
      "text": "CLUE 1: St, Stephen's Tower CLUE 2: Elizabeth's Tower (2012) CLUE 3: A striking clock with five bells Identify the monument.",
      "image": null
    },
    "answer": {
      "text": "Big Ben. The Tower was renamed in 2012 to Elizabeth's Tower. Its earlier name was St. Stephen's tower.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 78,
    "topic": "history",
    "question": {
      "text": "CLUE 1: Received the Nobel Prize in Chemistry in 1935. CLUE 2: Awarded the prize for the synthesis of new radioactive elements. CLUE 3: Mother, Father and Husband were all Nobel laureates Identify the personality.",
      "image": null
    },
    "answer": {
      "text": "Irena Curie, the daughter of Marie Curie. Her mother (Marie), father (Pierre) and husband Fr\u00e9d\u00e9ric Joliot-Curie",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 79,
    "topic": "history",
    "question": {
      "text": "CLUE 1: June 1, 1984 CLUE 2: Indira's Nemesis CLUE 3: Jarnali Singh Bhindranwale Identify the event.",
      "image": null
    },
    "answer": {
      "text": "Operation Bluestar. A controversial operation that was signed off by Indira Gandhi, Bluestar was a mission by the Indian government to capture Sikh terrorists from the Akali Dal, who, after years of terrorism, had taken refuge in the Golden Temple of Amritsar. Akali Dal had demanded a separate country for Sikhs, called Khalistan. The Golden Temple was a sanctum sanctorum for the Sikhs, but Indira Gandhi ordered armed men to storm the temple grounds. The terrorists were captured, and Bhindranwale was shot. But the Sikh resentment towards Indira Gandhi only grew, and a mere 4 months later, she was shot by one of her bodyguards - who was a Sikh.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 80,
    "topic": "history",
    "question": {
      "text": "CLUE 1: Old Peak/Old Mountain CLUE 2: Peruvian ancient astronomical observatory CLUE 3: \"Lost City of the Incas\" Identify the monument.",
      "image": null
    },
    "answer": {
      "text": "Macchu Picchu. Supposed to be a long-lost civilization, it is one of the most mysterious and culturally rich places in Peru.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 81,
    "topic": "sports",
    "question": {
      "text": "In tennis, a common tip that almost all coaches give to their players is to \"hit the ball over the middle of the net.\" Why do they ask the players to hit over the middle of the net, in particular? Give funda.",
      "image": "images/q159_1.png"
    },
    "answer": {
      "text": "The net is not even across its entire length. The sides of the net are elevated higher than the middle, because of tension from the poles holding the net up. Since the main goal is to get the ball over the net, hitting it over the middle would mean that players could hit lower than normal and still clear the net.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 82,
    "topic": "general",
    "question": {
      "text": "Date: 26.04.1986. Time: 1:23:58 AM. Location: Soviet Russia. Identify the event.",
      "image": "images/q160_1.png"
    },
    "answer": {
      "text": "Chernobyl. The clock in one of the underground chambers stopped exactly when the reactor exploded, resulting in this haunting image. The time reads 1:23:58AM.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 83,
    "topic": "general",
    "question": {
      "text": "\"I decided long ago to stop trying to grow up... So here I am, an old writer, without regrets.\" Identify the personality.",
      "image": "images/q161_1.png"
    },
    "answer": {
      "text": "Ruskin Bond. He famously advocated for all people to embrace the child within themselves, and is said to have read over 10,000 books in his lifetime.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 84,
    "topic": "general",
    "question": {
      "text": "This 2007 movie is a satire on American life. Its tagline reads, \"See our family, and feel better about yours!\" Identify the movie.",
      "image": "images/q162_1.png"
    },
    "answer": {
      "text": "The Simpson's Movie (2007).",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 85,
    "topic": "general",
    "question": {
      "text": "In astronomy, this word is used to refer to the amount of deviation of a body from the path of a perfect circle. In common parlance, it is used to describe someone that behaves in a weird or odd manner. Identify the English word.",
      "image": null
    },
    "answer": {
      "text": "Eccentric",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 86,
    "topic": "wildlife",
    "question": {
      "text": "These animals used to live a nomadic life, moving from place to place in search of food. Their name originates from the French verb meaning 'to move about'. The last of these species died in 1914 in isolation. Her name was Martha. Identify the extinct species of animal.",
      "image": null
    },
    "answer": {
      "text": "Passenger pigeons. They were famously used to carry messages the 19th and early 20th century.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 87,
    "topic": "current-affairs",
    "question": {
      "text": "Recently, the Legislative Assembly of Kerala unanimously voted to rename their state into something different. What is the proposed new name for the state of Kerala?",
      "image": null
    },
    "answer": {
      "text": "Keralam.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 88,
    "topic": "general",
    "question": {
      "text": "Pictured below is a dramatized painting of the last moments of a personality. ID the personality.",
      "image": "images/q166_1.png"
    },
    "answer": {
      "text": "Socrates.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 89,
    "topic": "general",
    "question": {
      "text": "In the 1860s and 1870s, British officers in India played table tennis using books that were placed spine-up as a net. On top of that, the ball they used was a golf ball. This was how table tennis was first played in India. True or False?",
      "image": null
    },
    "answer": {
      "text": "True.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 90,
    "topic": "general",
    "question": {
      "text": "Pictured below is a creative advertisement by a world-famous company. Identify the company.",
      "image": "images/q168_1.png"
    },
    "answer": {
      "text": "Band-Aid.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 91,
    "topic": "general",
    "question": {
      "text": "'Nomadic Elephant' is a bipartisan exercise between India and which other country? a) Saudi Arabia b) Mongolia",
      "image": null
    },
    "answer": {
      "text": "Mongolia",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 92,
    "topic": "general",
    "question": {
      "text": "Connect.",
      "image": "images/q170_1.png"
    },
    "answer": {
      "text": "24 September. The companies behind these advertisements are Honda and KFC respectively. Both these companies were incorporated on the 24th of September: Honda in 1948, and KFC in 1952. ------------------------------------------------------------------------------- END OF THE SNUC EDUQUEST '24 ------------------------------------------------------------------------------- ---------------------------------------------------------------------------- SNUC EDUQUEST CHENNAI REGIONALS -------------------------------------------------------------------------------",
      "image": "images/q170_2.png"
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 93,
    "topic": "sports",
    "question": {
      "text": "Sandeep Singhal is an Indian investor who has built a significant business empire in recent times. He is the owner of West Bridge Capital, and funds start-ups, especially ones that are based in India. However, he may be better known by his recent venture into sports. He has set up an academy that trains, almost exclusively, young Indian prodigies to compete at the international level in a particular sport. How do we better know this academy?",
      "image": null
    },
    "answer": {
      "text": "WACA [WestBridge Anand Chess Academy].",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 94,
    "topic": "current-affairs",
    "question": {
      "text": "Attached is the image of a tower, which has recently been inaugurated on the 2nd of October 2024 in Patna, Bihar. Identify. HINT: The name of the tower has only four letters i.e. it is _ _ _ _ tower.",
      "image": "images/q172_1.png"
    },
    "answer": {
      "text": "Bapu Tower.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 95,
    "topic": "general",
    "question": {
      "text": "These creatures inhabit very remote regions of a very particular location on Earth. Their call resembles neither the traditional roar of the big cats nor the soft mewing of the domesticated ones, and is therefore called \"chuffing\". What is this big cat, known for its unique call?",
      "image": null
    },
    "answer": {
      "text": "Snow Leopard.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 96,
    "topic": "history",
    "question": {
      "text": "Oxford Dictionary's Word of the Year 2024 refers to \"a condition wherein the mental capabilities of an individual degenerates over time. In a modern context, it refers to particular content that causes this to occur as well.\" Although it has gained traction only recently, it was first mentioned by Henry David Thoreau, a 19th-century philosopher in his book, in a very serious context. What is the word?",
      "image": "images/q174_1.png"
    },
    "answer": {
      "text": "Brainrot.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 97,
    "topic": "politics",
    "question": {
      "text": "Mrs. Suman Kumari is the first of her kind in the Indian Armed Forces. She is the first female _____ [FITB] to be deployed into action. She is known for her military capabilities, especially with an armed rifle. What category of soldiers does Mrs. _________ belong to?",
      "image": "images/q175_1.png"
    },
    "answer": {
      "text": "Sniper. Mrs. Suman Kumari is the first of her kind in the Indian Armed Forces. She is the first female Sniper to be deployed into action. She is a Sub-Inspector in the Border Security Force (BSF), and completed her eight-week sniper course at CSWT, Indore in March 2024. She was the only woman among 56 male candidates, and finished with the prestigious Instructor Grade.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 98,
    "topic": "general",
    "question": {
      "text": "The longest word that can be written using only the letters in the first row of a standard typewriter is ______ [FIND OUT]. What is the second longest word that can be written with the same restrictions?",
      "image": null
    },
    "answer": {
      "text": "Typewriter. The answer is in the question.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 99,
    "topic": "general",
    "question": {
      "text": "The notes shown below were used in a particular region of India from 1918 to 1948. Which region?",
      "image": "images/q177_1.png"
    },
    "answer": {
      "text": "Hyderabad. These were the currency notes in circulation until the Nizam of Hyderabad surrendered to Sardar Vallabhbhai Patel's armed forces and acceded to India.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 100,
    "topic": "wildlife",
    "question": {
      "text": "The name of this capital city was Minh, which means 'Salt' in Arabic, referring to the saltwater sea that it shared a coast with. It's current name means 'Father of Gazelles', owing to a large presence of the animals in the region. ID the capital city.",
      "image": null
    },
    "answer": {
      "text": "Abu Dhabi.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 101,
    "topic": "sports",
    "question": {
      "text": "Pictured below is an interesting maneuver in the sport of kayaking, where the kayaker will simply 'roll' the kayak over after it has capsized in the water. It is called a kayak roll, but it has another name, taking inspiration from a particular community of people. What is the other name of this maneuver?",
      "image": "images/q179_1.png"
    },
    "answer": {
      "text": "Eskimo roll.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 102,
    "topic": "current-affairs",
    "question": {
      "text": "Pictured below is the erstwhile name and logo of a company. The founders, who were only 19 at the time, started this company to deliver groceries faster than their competition. ID the current name of the company.",
      "image": "images/q180_1.png"
    },
    "answer": {
      "text": "Zepto.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 103,
    "topic": "general",
    "question": {
      "text": "On Planet Vegeta, the home planet of this legendary Saiyan, ___ ___ is called Kakarot, deriving from the English word 'Carrot'. This goes hand-in-hand with Saiyan naming convention, where most Saiyans are named after vegetables.",
      "image": "images/q181_1.png"
    },
    "answer": {
      "text": "Son Goku.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 104,
    "topic": "general",
    "question": {
      "text": "Pictured below is a still from an unforgettable movement. ID.",
      "image": "images/q182_1.png"
    },
    "answer": {
      "text": "Chipko Movement.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 105,
    "topic": "general",
    "question": {
      "text": "In diplomacy, the ______ strategy refers to a military-diplomatic tactic where a country slowly but steadily pressures the rival nation into submission and agreement, through a mix of physical, economic, diplomatic and psychological constriction of the rival nation. This can be seen deployed by a certain power to assert its dominion over another smaller island country.",
      "image": null
    },
    "answer": {
      "text": "Anaconda strategy.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 106,
    "topic": "general",
    "question": {
      "text": "https://www.youtube.com/watch?v=dSg7QnHbv4E ID the instrument, which has a rather simple name.",
      "image": null
    },
    "answer": {
      "text": "Nose Flute.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 107,
    "topic": "wildlife",
    "question": {
      "text": "Swiggy released it's annual round-up of the most ordered foods in India, titled 'How India Swiggy'd'. To nobody's surprise, the list was topped by biryani, with 83 million orders in 2024, or 158 orders every minute. Second place went to another ubiquitous Indian dish known for its multiple flavors, with 23 million orders over the year. Which food item?",
      "image": null
    },
    "answer": {
      "text": "Dosa.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 108,
    "topic": "general",
    "question": {
      "text": "Last year, the National Aeronautical and Space Administration (NASA) joined hands with the _____ X-ray Observatory to capture and process never-before-seen images of space like the one shown here. The observatory is named after a famed Indian scientist with irreplaceable contributions to the field of astronomy and space science. ID the name of the observatory.",
      "image": "images/q186_1.png"
    },
    "answer": {
      "text": "Chandra X-ray Observatory.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 109,
    "topic": "history",
    "question": {
      "text": "Pictured below is the 'Dragon Throne', the seat of the Emperor of China during the time of the Qing dynasty and later. It is placed in the Hall of Supreme Harmony in the heart of the Forbidden City, and is constructed primarily from a particular material. You might have seen this material somewhere in a recent film being taken in and out of a few places. ID the material.",
      "image": "images/q187_1.png"
    },
    "answer": {
      "text": "Red Sandalwood.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 110,
    "topic": "politics",
    "question": {
      "text": "Named after the Greek Goddess of the Rainbow, this element was given its name because of the multitude of colors that were displayed by the salts it formed. It was discovered in 1803 while he was trying to isolate a separate element. It is the most corrosion-resistant material known to mankind. ID.",
      "image": null
    },
    "answer": {
      "text": "Iridium.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 111,
    "topic": "history",
    "question": {
      "text": "Android has a famous habit of naming their softwares after food items. Snowcone, Tiramisu, Upside Down Cake and Vanilla Ice Cream were the last four of its mobile phone operating systems. Given the clear pattern here, users were expecting Android V16 to begin with a particular letter. However, breaking their own conventions, Android named it something completely different. The mascot is pictured here with the food item. ID the codename for Android 112.0.",
      "image": "images/q189_1.png"
    },
    "answer": {
      "text": "Baklava.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 113,
    "topic": "politics",
    "question": {
      "text": "Zeenea is a data management and analytics company that is based in France. Recently, they were acquired by a well-known giant in the Indian IT sector. ID the company that bought Zeenea.",
      "image": "images/q190_1.png"
    },
    "answer": {
      "text": "HCL Technologies. \u2014----------------------------------------------------------------------------------------------------------------------------",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 114,
    "topic": "general",
    "question": {
      "text": "A ______ is a bright spot in a galaxy where stellar dust swirls around in a giant cloud, often forming new stars.",
      "image": null
    },
    "answer": {
      "text": "Nebula.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 115,
    "topic": "general",
    "question": {
      "text": "ID the actor. Not Rajinikanth, the other one. The answer is Hrithik Roshan. The image is from the film Bhagawaan Dada.",
      "image": "images/q192_1.png"
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 116,
    "topic": "cuisines",
    "question": {
      "text": "The 'Eleven Herbs and Spices' secret formula is a trademark of ___, a recipe that skyrocketed its makers to the very top of the global food industry. Despite being a corporate secret, a recent incident may have unwittingly reveled the formula, although the company behind the recipe denies it. Which company?",
      "image": null
    },
    "answer": {
      "text": "KFC.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 117,
    "topic": "general",
    "question": {
      "text": "Largest land-locked country in the world by area.",
      "image": null
    },
    "answer": {
      "text": "Kazakhstan.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 118,
    "topic": "cuisines",
    "question": {
      "text": "Why is the city Palitana in Bhavnagar District, Gujarat, currently in the news?",
      "image": "images/q195_1.png"
    },
    "answer": {
      "text": "First city in India and the first city in the world to ban consumption of non-vegetarian food. It was banned earlier; now legislature exists to back the ban for the first time.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 119,
    "topic": "general",
    "question": {
      "text": "India is going through a tough time to secure a geographical indication [GI] for this good in the international market, with a reported value of 50,000 crores. Both India and Pakistan are laying claim over the GI of this good. Identify the good.",
      "image": null
    },
    "answer": {
      "text": "Basmati rice. Both India and Pakistan are laying claim to it because it can only be obtained in the region of Indo-Gangetic Plains.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 120,
    "topic": "general",
    "question": {
      "text": "Identify the country from the given flag, used between 1949-1991.",
      "image": "images/q197_1.png"
    },
    "answer": {
      "text": "Ukraine. This was the flag used while it was still a part of the USSR, till the Union's eventual downfall in 1991.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 121,
    "topic": "current-affairs",
    "question": {
      "text": "Avengers: Endgame was released on April 26, 2019 and went on to break numerous box office records. It set the record for the highest grossing film of all time, which was broken by Avatar (2008) following a re-release in 2023. When it was released, Google searches for 'How to _____ _______' reached a record high due to a particular desperation of fans. Fill in the blanks.",
      "image": null
    },
    "answer": {
      "text": "Avoid Spoilers.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 122,
    "topic": "general",
    "question": {
      "text": "Identify the dolphin. What is the difference between the two dolphins, and what is the similarity? One similarity and one difference.",
      "image": "images/q199_1.png"
    },
    "answer": {
      "text": "The first one is the Ganges river dolphin, the second is the Indus river dolphin. The similarity is that both are blind. EXTRA",
      "image": "images/q199_2.png"
    },
    "funda": {
      "text": "Both are blind due to river pollution in the Indus and the Ganga.",
      "image": null
    }
  },
  {
    "id": 123,
    "topic": "sports",
    "question": {
      "text": "He was born with scoliosis, an affliction of the vertebra. His right leg is shorter than his left leg. His right left provides 33% more power than his left leg. [DOUBLE CHECK THIS ONE] He changed his stride to accommodate these shortcomings. Identify the athlete.",
      "image": null
    },
    "answer": {
      "text": "Usain Bolt.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 124,
    "topic": "politics",
    "question": {
      "text": "Under which Indian Prime Minister's rule was the 'Environmental Protection Act' passed with Presidential assent on May 23, 1986?",
      "image": null
    },
    "answer": {
      "text": "Rajiv Gandhi. EXTRA",
      "image": null
    },
    "funda": {
      "text": "Almost 80% of the Act was drafted by T. N. Seshan of Tamil Nadu, who would go on to become the Election Commissioner of India.",
      "image": null
    }
  },
  {
    "id": 125,
    "topic": "wildlife",
    "question": {
      "text": "These birds' migration can range from 44,000 miles to 59,000 miles in a year. A bird of this species typically flies a distance equivalent to three round trips to the moon. Identify the bird.",
      "image": null
    },
    "answer": {
      "text": "Arctic Tern.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 126,
    "topic": "sports",
    "question": {
      "text": "Which flower is depicted on the cover of Japanese passports?",
      "image": "images/q203_1.png"
    },
    "answer": {
      "text": "Chrysanthemum. EXTRA",
      "image": null
    },
    "funda": {
      "text": "It is one of the national flowers of Japan. Its famous counterpart is the Sakura or cherry blossom.",
      "image": null
    }
  },
  {
    "id": 127,
    "topic": "history",
    "question": {
      "text": "In 1939, for which movie was this special Oscar awarded?",
      "image": "images/q204_1.png"
    },
    "answer": {
      "text": "Snow White and the Seven Dwarves. The movie was presented in 1937, but the Oscar was given only in 1939 due to organizational issues.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 128,
    "topic": "general",
    "question": {
      "text": "At present the brand is the world's No. 1 motherboard and gaming brand as well as a Top 3 consumer notebook vendor. The brand's name is inspired by the winged horse in Greek mythology that symbolizes wisdom and knowledge. Identify the brand.",
      "image": null
    },
    "answer": {
      "text": "Asus. The name is taken from the last four letters of 'Pegasus', the legendary Greek horse.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 129,
    "topic": "general",
    "question": {
      "text": "Which dance form of Gujarat got UNESCO's Intangible Cultural Heritage status?",
      "image": "images/q206_1.png"
    },
    "answer": {
      "text": "Garba.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 130,
    "topic": "general",
    "question": {
      "text": "Identify the fish, beautiful with its wings.",
      "image": "images/q207_1.png"
    },
    "answer": {
      "text": "Angelfish.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 131,
    "topic": "general",
    "question": {
      "text": "The English word was originally a legal term in Old English, meaning 'Law', 'Judgment' or 'Statute'. Now the word means 'failure', 'death' or 'destruction'. Identify the word.",
      "image": null
    },
    "answer": {
      "text": "Doom.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 132,
    "topic": "general",
    "question": {
      "text": "Identify the self-portrait.",
      "image": "images/q209_1.png"
    },
    "answer": {
      "text": "Amrita Sher-Gill. EXTRA",
      "image": null
    },
    "funda": {
      "text": "Her work, 'The Storyteller', has the record of fetching the highest price for an Indian artist ever.",
      "image": null
    }
  },
  {
    "id": 133,
    "topic": "general",
    "question": {
      "text": "Martin Goodman founded 'Timely Comics' in 1939. By 1951, it had generally become known as 'Atlas Comics'. How is it known now?",
      "image": null
    },
    "answer": {
      "text": "Marvel Comics.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 134,
    "topic": "wildlife",
    "question": {
      "text": "This country is celebrated for its remarkable biodiversity - around 92% of the island's mammals, 89% of its plant species and 85% of its reptiles are endemic to the island, meaning that they cannot be found elsewhere on Earth.",
      "image": null
    },
    "answer": {
      "text": "Madagascar. The anagram works as follows: M - Marvel Comics A - Amrita Sher-Gill D - Doom A - Angelfish G - Garba",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 135,
    "topic": "general",
    "question": {
      "text": "Japanese lucky eight strokes. Let's go places. Kaizen, 5S, Just in Time.",
      "image": null
    },
    "answer": {
      "text": "Toyota. The name of the company, as well as the logo, can be crafted in just eight strokes.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 136,
    "topic": "general",
    "question": {
      "text": "Copper Devil. Metal from outer space. EVs, rocket engines, coins.",
      "image": null
    },
    "answer": {
      "text": "Nickel. 80% of the available metal is from meteors.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 137,
    "topic": "general",
    "question": {
      "text": "Criminal Red Hood of 1940. Criminal folk hero. \"Now I am always smiling.\"",
      "image": null
    },
    "answer": {
      "text": "Joker.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 138,
    "topic": "history",
    "question": {
      "text": "\"War is peace. Freedom is slavery. Ignorance is strength.\" \"Who controls the past controls the future.\" \"Big Brother is watching you.\"",
      "image": null
    },
    "answer": {
      "text": "1984 (George Orwell). The novel was written in 1948, and the title is simply the inversion of the last two digits of the year of authorship. EXTRA",
      "image": null
    },
    "funda": {
      "text": "Big Boss, the super-famous Indian television serial, is inspired by this English classic. Big Boss evolved from Big Brother in English-speaking countries, which was inspired by the last of these famous lines.",
      "image": null
    }
  },
  {
    "id": 139,
    "topic": "general",
    "question": {
      "text": "Second Director of NASA. Director of Apollo Mission. JWST.",
      "image": null
    },
    "answer": {
      "text": "Janes Webb.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 140,
    "topic": "general",
    "question": {
      "text": "Law to ban Spanking of kids. Capital is made of 14 islands. Medicine, Chemistry, Physics and Literature, except peace.",
      "image": null
    },
    "answer": {
      "text": "Sweden.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 141,
    "topic": "general",
    "question": {
      "text": "In Basketball, once a team gains control of the ball it has __ seconds to put up a legal shot.",
      "image": null
    },
    "answer": {
      "text": "24.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 142,
    "topic": "politics",
    "question": {
      "text": " ] This is a special art installation that is displayed for a very special purpose, created by Badsheer Mohammad at Qatar. What purpose?",
      "image": "images/q219_1.png"
    },
    "answer": {
      "text": "Memorial for children who have died in Gaza. It is exactly 15,000 dolls, a tribute to the 16,400 children who lost their lives in the Israel-Palestine conflict.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 143,
    "topic": "general",
    "question": {
      "text": "The Norwegian Erik the Red, who was then in exile for murder, discovered this country/land and named it in an attractive way to make it sound like a great place to live and attract settlers. How is this land known as now?",
      "image": null
    },
    "answer": {
      "text": "Greenland.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 144,
    "topic": "general",
    "question": {
      "text": "The Bheel and Bhilala tribal people are excellent archers, they belong to the Alirajpur district of Madhya Pradesh. They practice archery from the age of 6-7. What is famous about their archery technique?",
      "image": "images/q221_1.png"
    },
    "answer": {
      "text": "They do not use their thumbs in archery, because they believe that they are descendants of Ekalavya, the legendary outcast who sacrificed his thumb for his guru, Dronacharya.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 145,
    "topic": "politics",
    "question": {
      "text": "On October 5, 1988, the import of this novel was banned. The novel was not available for sale in India. 38 years and 1 month later, in November 5, 2024, the ban was lifted by an order of the Delhi High Court. Identify the novel and why it was lifted.",
      "image": null
    },
    "answer": {
      "text": "The novel is 'Satanic Verses' by Salman Rushdie, and the ban was lifted because the High Court could not find any notification of the initial ban!",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 146,
    "topic": "general",
    "question": {
      "text": "[ATTACH IMAGE OF 1980s TIED-PLACE ROWING FINALS] As you can clearly see here, both rowers have achieved the same time. However, one rower is given gold while the other is given silver. With reference to rowing in particular, why is this so?",
      "image": null
    },
    "answer": {
      "text": "A bowball is a ball at the tip of the boat. The race was decided by Omega's photo finish system, deciding that Drisdale had won by half a bowball.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 147,
    "topic": "general",
    "question": {
      "text": "Combat-18 is a neo-Nazi terrorist organization that was founded in 1992. It originated in the United Kingdom and it spread to the US, Canada and Germany. They killed numerous immigrants and nonwhites. Why is the organization called Combat-18?",
      "image": null
    },
    "answer": {
      "text": "Adolf Hitler. A is the 1st letter of the alphabet (1), and H is the eighth letter (8). Combining the initials gives 18.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 148,
    "topic": "general",
    "question": {
      "text": "https://www.youtube.com/watch?v=Wu9O1BS_9ak The dog is easy. Identify the other creature.",
      "image": null
    },
    "answer": {
      "text": "Electric Eel.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 149,
    "topic": "general",
    "question": {
      "text": "Codename: Phoenix Spiritual successor to Netscape navigator. Mozilla Community browser. ID.",
      "image": null
    },
    "answer": {
      "text": "Mozilla Firefox.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 150,
    "topic": "general",
    "question": {
      "text": "ID the character.",
      "image": "images/q227_1.png"
    },
    "answer": {
      "text": "KING COBRA",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 151,
    "topic": "general",
    "question": {
      "text": "ID the largest mammal at the tallest altitude.",
      "image": "images/q228_1.png"
    },
    "answer": {
      "text": "Alaskan Mountain Goat.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 152,
    "topic": "wildlife",
    "question": {
      "text": "This is an American investment gold coin, named after an American animal. ID the name of the coin.",
      "image": "images/q229_1.png"
    },
    "answer": {
      "text": "American Buffalo.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 153,
    "topic": "wildlife",
    "question": {
      "text": "ID this animal.",
      "image": "images/q230_1.png"
    },
    "answer": {
      "text": "Horned toad.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 154,
    "topic": "wildlife",
    "question": {
      "text": "Why are these species popularly called 'killer whales'?",
      "image": "images/q231_1.png"
    },
    "answer": {
      "text": "There was a common misconception that they killed whales, hence earning them the name 'Whale Killers'. Over time, 'whale killer' became 'killer whale'.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 155,
    "topic": "wildlife",
    "question": {
      "text": "If this tree were to become extinct, the entire species of the koala bear would be wiped out because their diet consists exclusively of this plant. Identify the tree.",
      "image": "images/q232_1.png"
    },
    "answer": {
      "text": "Eucalyptus.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 156,
    "topic": "wildlife",
    "question": {
      "text": "THEME: Misnomers. a. The Electric Eel is not an eel; it is a fish. b. The firefox is called the Red Panda; it is neither a panda nor a fox. c. King Cobra is not a cobra; it belongs to the mamba family (which, in turn, belong to the Nadja family of reptiles). d. The Alaskan Mountain Goat is not a goat; it is an antelope. e. American Buffalo is not a buffalo; it is a bison. f. The Horned Toad is actually a lizard. g. An orca is not a whale; it is a dolphin. h. Koala bears are not bears; they are marsupials. QUESTION BOX",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 157,
    "topic": "history",
    "question": {
      "text": "The term 'tank' was first used in the military in 1915 to describe armored vehicles that were being developed during World War I. Why are these vehicles called 'tanks'?",
      "image": null
    },
    "answer": {
      "text": "The term 'tank' was a code word to refer to the vehicles; a soldier once called it a 'tank' because it looked like a water tank, and British officials decided it was a good choice for a codename.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 158,
    "topic": "general",
    "question": {
      "text": "Sake Dean Mohammed, a British Indian traveler, surgeon, soldier and entrepreneur introduced which 'beauty concept' in England in 1814?",
      "image": "images/q235_1.png"
    },
    "answer": {
      "text": "Shampoo.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 159,
    "topic": "general",
    "question": {
      "text": "What significant contribution did David Attenborough have to the world of tennis?",
      "image": "images/q236_1.png"
    },
    "answer": {
      "text": "He is responsible for the yellow color of the tennis ball. When he introduced the shift to color television in the 1960s, the color of the ball was difficult to see clearly against the background. He suggested to Wimbledon that the balls should be colored yellow; they ignored the suggestion until decades later, but other tournament organizers had adopted the yellow ball by then.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 160,
    "topic": "general",
    "question": {
      "text": "Connect the two visuals.",
      "image": "images/q237_1.png"
    },
    "answer": {
      "text": "The picture on the left is Morse code, while the picture on the right is a painting by Samuel Morse. Samuel Morse is the connection.",
      "image": "images/q237_2.png"
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 161,
    "topic": "general",
    "question": {
      "text": "https://www.youtube.com/watch?v=HK6y8DAPN_0 Identify the technology.",
      "image": null
    },
    "answer": {
      "text": "OpenAI's Sora.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 162,
    "topic": "current-affairs",
    "question": {
      "text": "Europa clipper is a space probe by NASA to study Europa, a Galilean moon of Jupiter. It was launched on October 14, 2024. Why is the mission patch showing a sail ship?",
      "image": "images/q239_1.png"
    },
    "answer": {
      "text": "These sail ships, in olden-day America, were called Clippers.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 163,
    "topic": "history",
    "question": {
      "text": "This character first appeared in the 1940 Disney animated feature film Fantasia. He is the powerful sorcerer who was the mentor of Mickey Mouse. What is special about his name?",
      "image": "images/q240_1.png"
    },
    "answer": {
      "text": "His name is Yen Sid, which is Disney spelled backwards. He is also popularly called Merlin.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 164,
    "topic": "general",
    "question": {
      "text": "\"Learning is never done without errors and defeat.\" Identify the young-age photograph of this famous personality.",
      "image": "images/q241_1.png"
    },
    "answer": {
      "text": "Vladimir Lenin, who passed away on January 21, 1924.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 165,
    "topic": "general",
    "question": {
      "text": "FITB.",
      "image": "images/q242_1.png"
    },
    "answer": {
      "text": "Shiv Nadar & Family.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 166,
    "topic": "current-affairs",
    "question": {
      "text": "India's GSAT N2, a communication satellite was successfully launched by which organization recently?",
      "image": null
    },
    "answer": {
      "text": "SpaceX.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 167,
    "topic": "general",
    "question": {
      "text": " ID.",
      "image": "images/q244_1.png"
    },
    "answer": {
      "text": "Magnus Carlsen.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 168,
    "topic": "sports",
    "question": {
      "text": " This is a different kind of appeal that is recently gaining popularity in cricket. Identify.",
      "image": "images/q245_1.png"
    },
    "answer": {
      "text": "Celebrappeal.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 169,
    "topic": "general",
    "question": {
      "text": "99% Fun and 1% land is the Tourism tagline of which Indian Union Territory?",
      "image": null
    },
    "answer": {
      "text": "Lakshadweep.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 170,
    "topic": "current-affairs",
    "question": {
      "text": "He studied Computer Engineering at SSN Chennai. Later he joined India Cements as Senior Manager, Costs Department. 500 test wickets - record achieved in 2024.",
      "image": null
    },
    "answer": {
      "text": "Ravichandran Ashwin. [ATTACH IMAGE OF R ASHWIN] -------------------------------------------------------------------------------",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 171,
    "topic": "politics",
    "question": {
      "text": "Atishi Marlena, the AAP member with communist leanings, has recently become the Chief Minister of Delhi, replacing Arvind Kejriwal after his arrest. However, her name was changed from Atishi Singh to Atishi Marlena Singh. The surname 'Marlena' is derived from the names of two \"role models\". Identify the role models.",
      "image": "images/q248_1.png"
    },
    "answer": {
      "text": "Karl MARx and Vladimir LENin, the founding fathers of communism.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 172,
    "topic": "general",
    "question": {
      "text": "In volleyball, the ball is hit back and forth between the two teams until it touches the ground. What is the maximum number of touches that a team may touch the ball before it has to cross the net to the other team?",
      "image": null
    },
    "answer": {
      "text": "Three.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 173,
    "topic": "sports",
    "question": {
      "text": "Largest man-made object in history. Size: 1 football field. 'Man's Greatest Achievement'. ID.",
      "image": null
    },
    "answer": {
      "text": "The International Space Station. \u2014----------------------------------------------------------------------------------------------------------------------------",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 174,
    "topic": "wildlife",
    "question": {
      "text": "At Lake Natron in Tanzania, an interesting phenomenon occurs that is unique to its location. Due to the high presence of sodium carbonate and calcium bicarbonate, the birds that plunge into the lake become famous attractions, like something out of Harry Potter movies. What happens to the birds? ANS: They are turned to stone (Harry Potter reference: Basilisk turns everything to stone with its gaze in the Chamber of Secrets). They are calcified \u2014 their bodies are perfectly preserved and hardened into stone-like statues by the sodium carbonate in the water. This is called calcification. The highly reflective surface of the lake causes migrating birds to crash into it, mistaking it for open sky. Their carcasses wash up on the shore, preserved like eerie stone sculptures. This was brought to world attention by photographer Nick Brandt in 2013.",
      "image": "images/q251_1.png"
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 175,
    "topic": "history",
    "question": {
      "text": "(follow-up to the previous one) This phenomenon was known to a group of human beings somewhere near this very continent, and they used it to create a very special kind of artifact that has much folklore today. Which kind of artifact? ANS: Mummification. Mummies are \u2018mummified' using sodium carbonate. The ancient Egyptians used natron (sodium carbonate) the very same chemical found in Lake Natron to preserve their dead during mummification. The lake is actually named after this chemical. The Egyptians packed bodies in natron to dry them out and prevent decomposition, creating mummies",
      "image": "images/q252_1.png"
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  },
  {
    "id": 176,
    "topic": "general",
    "question": {
      "text": "\u2018The Adventures of Alice Laselles by Alexandrina Victoria aged 10 \u00be\u2019 is a book published in 2015 by the RCT. As noted in a review of the book, \u201cit\u2019s not quite earth-shattering stuff.\u201d If it wasn\u2019t earth shattering stuff, then why was this book published in the first place? ANS: The author, \u2018Alexandrina Victoria\u2019, is Queen Victoria. Q1: Give X, Y The famous X Y are made using vegetable colours, and are washed in flowing water after the printing process. While Rajasthan, Uttar Pradesh and Punjab are also known to make Ys, X which is geographically placed out from the rest, has become a renowned hub for weaving these, due to the availability of cotton, which is grown by farmers in the area. The craft has never faced the shortage of materials at any point of time. Perhaps that is one reason why it is authentic enough to earn a GI tag. |",
      "image": "images/q253_1.png"
    },
    "answer": {
      "text": "X - Sambu, Y - Shikari Shambu. India Book House is the distributor of Tinkle.",
      "image": null
    },
    "funda": {
      "text": "",
      "image": null
    }
  }

];