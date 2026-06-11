const QUIZ_QUESTIONS = [
  {
    "id": 1,
    "topic": "sports",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Who holds the record for the highest individual score in Test cricket, and what is that score?",
      "image": "images/q1_pexels.jpg"
    },
    "answer": {
      "text": "Lara</strong> of the West Indies, with an unbeaten <strong>400*</strong> against England in Antigua in April 2004.",
      "image": null
    },
    "funda": {
      "text": "Lara holds this record twice over. He first set it with 375 against England in 1994, which was then broken by Matthew Hayden (380) in 2003. Lara reclaimed it the very next year with 400* in 2004. His innings lasted 582 balls over nearly 13 hours.",
      "image": null
    }
  },
  {
    "id": 2,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who is known as the 'Flying Sikh', and why was this title given to him?",
      "image": "images/q2_pexels.jpg"
    },
    "answer": {
      "text": "Singh</strong>, the legendary Indian sprinter, earned this title after his extraordinary performance at the 1958 Commonwealth Games in Cardiff, where he won the 440 yards race.",
      "image": null
    },
    "funda": {
      "text": "The title 'Flying Sikh' was bestowed upon him by Pakistani President General Ayub Khan after Milkha Singh defeated Pakistan's star runner Abdul Khaliq in a race in Lahore in 1960. Milkha Singh narrowly missed an Olympic medal by finishing 4th in the 400m at the 1960 Rome Olympics, a feat that was not equalled by an Indian sprinter for decades.",
      "image": null
    }
  },
  {
    "id": 3,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The five rings on the Olympic flag represent five continents. Which five continents are they, and what do the colours represent?",
      "image": "images/q3_pexels.jpg"
    },
    "answer": {
      "text": "The five continents are the Americas, Asia, Europe, and Oceania</strong>. The colours - blue, yellow, black, green, and red - along with the white background, were chosen because at least one of these colours appears in the flag of every nation in the world.",
      "image": null
    },
    "funda": {
      "text": "The Olympic flag was designed by Pierre de Coubertin in 1913 and first flown at the 1920 Antwerp Games. Contrary to popular belief, the rings do not individually represent specific continents - they were chosen for their collective representativeness across all flags.",
      "image": null
    }
  },
  {
    "id": 4,
    "topic": "sports",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "In the sport of basketball, what is the exact diameter of the hoop in inches, and why is this measurement significant?",
      "image": "images/q4_pexels.jpg"
    },
    "answer": {
      "text": "The hoop has an inner diameter of <strong>18 inches</strong>.",
      "image": null
    },
    "funda": {
      "text": "A standard basketball has a diameter of approximately 9. 4 inches, meaning the hoop is almost exactly twice as wide as the ball. This is intentional - it gives shooters a margin of error while still requiring precise arc. A ball can pass through the hoop at a slight angle, which is why 'bank shots' off the backboard are effective.",
      "image": null
    }
  },
  {
    "id": 5,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the collective noun for a group of flamingos?",
      "image": "images/q5_pexels.jpg"
    },
    "answer": {
      "text": "A group of flamingos is called a <strong>flamboyance</strong>.",
      "image": null
    },
    "funda": {
      "text": "Flamingos are one of the most social birds on earth and gather in colonies of up to a million birds. Their iconic pink colour comes not from genetics but from their diet - carotenoid pigments found in the algae and crustaceans they eat. Flamingos born in captivity that are not fed carotenoid-rich food gradually turn white.",
      "image": null
    }
  },
  {
    "id": 6,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The cheetah is the fastest land animal. What is approximately its top speed, and how does this compare to the fastest animal on Earth overall?",
      "image": "images/q6_pexels.jpg"
    },
    "answer": {
      "text": "The cheetah can reach speeds of approximately <strong>112-120 km/h (70-75 mph)</strong>. The fastest animal on Earth overall is the <strong>peregrine falcon</strong>, which dives at speeds exceeding <strong>320 km/h (200 mph)</strong> in a hunting stoop.",
      "image": null
    },
    "funda": {
      "text": "A cheetah can accelerate from to 96 km/h in under 3 seconds - faster than most sports cars. However, it can only sustain this speed for 20-30 seconds before overheating. Unlike other big cats, cheetahs cannot roar; they chirp, purr, and yelp instead.",
      "image": null
    }
  },
  {
    "id": 7,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which is the world's largest living lizard species, and where is it found?",
      "image": "images/q7_pexels.jpg"
    },
    "answer": {
      "text": "The dragon</strong> komodoensis</em>), found on the Indonesian islands of Komodo, Rinca, Flores, and Gili Motang.",
      "image": null
    },
    "funda": {
      "text": "Komodo dragons can grow up to 3 metres in length and weigh up to 70 kg. They were unknown to the Western scientific world until 1912. Although once thought to kill prey purely through bacteria in their saliva, research has confirmed they possess venom glands in their lower jaw that cause rapid blood loss and prevent clotting. They are also capable of parthenogenesis - females can reproduce without a male.",
      "image": null
    }
  },
  {
    "id": 8,
    "topic": "current-affairs",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "In August 2023, India made history in space exploration. What was the achievement, and why was it significant?",
      "image": "images/q8_pexels.jpg"
    },
    "answer": {
      "text": "India's mission successfully landed on the <strong>lunar south pole</strong> on 23 August 2023, making India the <strong>fourth country</strong> to soft-land on the Moon and the <strong>first</strong> to land near the south pole.",
      "image": null
    },
    "funda": {
      "text": "The lunar south pole is of immense scientific interest because it is believed to contain water ice in permanently shadowed craters, which could be a critical resource for future human missions. Just days before Chandrayaan-3's landing, Russia's Luna-25 mission - also targeting the south pole - crashed due to a thruster malfunction, making India's success even more remarkable. The lander was named and the rover",
      "image": null
    }
  },
  {
    "id": 9,
    "topic": "sports",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which country won the FIFA World Cup 2022, held in Qatar, and who won the Golden Ball award for the tournament's best player?",
      "image": "images/q9_pexels.jpg"
    },
    "answer": {
      "text": "won the FIFA World Cup 2022. Messi</strong> received the Golden Ball award.",
      "image": null
    },
    "funda": {
      "text": "Argentina defeated France in the final on penalty shootout (4-2) after a 3-3 draw after extra time - widely regarded as the greatest World Cup final ever played. Messi scored twice in the final. It was his record seventh World Cup Golden Ball, and at 35, he finally won the one trophy that had eluded him throughout his career. Kylian Mbapp-%-# of France scored a hat-trick in the final and won the Golden Boot.",
      "image": null
    }
  },
  {
    "id": 10,
    "topic": "current-affairs",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which personality was named the TIME Person of the Year for 2023?",
      "image": "images/q10_pexels.jpg"
    },
    "answer": {
      "text": "Swift</strong> was named TIME's Person of the Year for 2023.",
      "image": null
    },
    "funda": {
      "text": "Taylor Swift's selection as Person of the Year 2023 made her the first person to appear twice on a Person of the Year cover since the tradition began in 1927. She was recognized for her immense cultural, economic, and social impact, particularly through her record-breaking 'Eras Tour' and the re-release of her classic albums.",
      "image": null
    }
  },
  {
    "id": 11,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who was the first woman to win a Nobel Prize, and in what field?",
      "image": "images/q11_pexels.jpg"
    },
    "answer": {
      "text": "Curie</strong>, who won the Nobel Prize in in 1903</strong>, which she shared with her husband Pierre Curie and Henri Becquerel for their research on radiation.",
      "image": null
    },
    "funda": {
      "text": "Marie Curie is the only person in history to win Nobel Prizes in two different sciences - she won a second Nobel Prize, this time in Chemistry, in 1911 for her discovery of the elements radium and polonium. She named polonium after her homeland, Poland. Her notebooks from the 1890s are still radioactive and are stored in lead-lined boxes - they likely will be for another 1,500 years.",
      "image": null
    }
  },
  {
    "id": 12,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "In which year did the Berlin Wall fall, and what was its immediate political consequence?",
      "image": "images/q12_pexels.jpg"
    },
    "answer": {
      "text": "The Berlin Wall fell on <strong>9 November 1989</strong>. The immediate consequence was the opening of the East-West German border, leading directly to the <strong>reunification of Germany</strong> on 3 October 1990.",
      "image": null
    },
    "funda": {
      "text": "The Wall had divided Berlin since 1961, when the East German government built it to stem the mass emigration of East Germans to the West. The announcement on 9 November 1989 was actually the result of a miscommunication - a government spokesman mistakenly announced the borders were open 'with immediate effect'. Thousands rushed to the checkpoints, guards stood aside, and the Wall came down. Over 140 people were killed attempting to cross it between 1961 and 1989.",
      "image": null
    }
  },
  {
    "id": 13,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which empire is widely considered the largest contiguous land empire in history, and at its peak, how much of the Earth's land area did it cover?",
      "image": "images/q13_pexels.jpg"
    },
    "answer": {
      "text": "The Empire</strong>, which at its peak in the 13th century covered approximately <strong>24 million square kilometres</strong> - roughly <strong>16% of the Earth's total land area</strong>.",
      "image": null
    },
    "funda": {
      "text": "Founded by Genghis Khan in 1206, the Mongol Empire stretched from the Pacific Ocean to Eastern Europe at its height. While the British Empire was larger in total area (including overseas territories), the Mongol Empire remains the largest contiguous land empire. At its peak, it connected the Silk Road trade routes, creating one of the most significant trans-continental exchange networks in history. Genghis Khan's given name was Tem-%]%jin.",
      "image": null
    }
  },
  {
    "id": 14,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What was the name of the ship on which Charles Darwin made the famous voyage that led to his theory of evolution by natural selection, and when did it depart?",
      "image": "images/q14_pexels.jpg"
    },
    "answer": {
      "text": "<strong>HMS Beagle</strong>. The ship departed from Plymouth, England, on <strong>27 December 1831</strong>.",
      "image": null
    },
    "funda": {
      "text": "Darwin was 22 years old when he boarded the Beagle as an unpaid naturalist, invited largely for companionship to the captain, Robert FitzRoy. The voyage lasted nearly five years, during which the ship surveyed the coasts of South America and stopped at the Gal-%pagos Islands, where Darwin observed variations in finch beaks and tortoise shells across different islands - observations that later became central to his theory of natural selection, published in <em>On the Origin of Species</em> in 1859.",
      "image": null
    }
  },
  {
    "id": 15,
    "topic": "politics",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which country became the first in the world to legally recognise same-sex marriage at the national level, and in what year?",
      "image": "images/q15_pexels.jpg"
    },
    "answer": {
      "text": "The in <strong>2001</strong>.",
      "image": null
    },
    "funda": {
      "text": "The Netherlands legalised same-sex marriage on 1 April 2001 - a date critics noted was April Fool's Day, though the legislation was entirely serious. The law also allowed same-sex couples to adopt children. Belgium followed in 2003, and as of 2024, over 30 countries have legalised same-sex marriage nationally.",
      "image": null
    }
  },
  {
    "id": 16,
    "topic": "politics",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who was the world's first female Prime Minister, and which country did she lead?",
      "image": "images/q16_pexels.jpg"
    },
    "answer": {
      "text": "Bandaranaike</strong> of (now Sri Lanka), who became Prime Minister in <strong>1960</strong>.",
      "image": null
    },
    "funda": {
      "text": "Sirimavo Bandaranaike came to power following the assassination of her husband, Prime Minister S. W. R. D. Bandaranaike, in 1959. She led the Sri Lanka Freedom Party to victory in 1960, becoming the world's first female head of government. She served as Prime Minister three times: 1960-65, 1970-77, and 1994-2000 (the last time under her daughter, President Chandrika Kumaratunga).",
      "image": null
    }
  },
  {
    "id": 17,
    "topic": "politics",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Name the five permanent members of the United Nations Security Council (P5) and explain why they have veto power.",
      "image": "images/q17_pexels.jpg"
    },
    "answer": {
      "text": "The five permanent members are the States, the United Kingdom, France, Russia</strong> (then the USSR), and the Republic of China</strong>. Each holds an unconditional veto over any Security Council resolution.",
      "image": null
    },
    "funda": {
      "text": "The P5 were the major Allied victors of World War II, and the UN Charter of 1945 enshrined their permanent membership as a mechanism to prevent them from leaving the organisation (as they had the League of Nations). The veto power means any single P5 nation can block any resolution - even on matters directly concerning itself. This has been extensively used during the Cold War and continues to be controversial, with many nations calling for reform of the Security Council.",
      "image": null
    }
  },
  {
    "id": 18,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the primary base ingredient of traditional Japanese miso soup, and what are the main types of this ingredient?",
      "image": "images/q18_pexels.jpg"
    },
    "answer": {
      "text": "- a paste made from <strong>fermented soybeans</strong>. The three main types are <strong>shiro (white)</strong>, which is mild and sweet; <strong>aka (red)</strong>, which is saltier and more robust; and <strong>awase (mixed)</strong>, which is a blend of the two.",
      "image": null
    },
    "funda": {
      "text": "Miso has been part of Japanese cuisine for over 1,300 years. The fermentation process can take anywhere from a few weeks to several years. Beyond soup, miso is used as a marinade, glaze, and seasoning in dozens of dishes. It is rich in probiotics, protein, and various vitamins and minerals. The specific flavour profile varies significantly by region in Japan - from the mild Kyoto-style to the intense Nagoya-style.",
      "image": null
    }
  },
  {
    "id": 19,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is 'Poutine', the iconic Canadian dish, and from which province does it originate?",
      "image": "images/q19_pexels.jpg"
    },
    "answer": {
      "text": "Poutine is a dish of <strong>french fries topped with fresh cheese curds and smothered in brown gravy</strong>. It originates from the province of",
      "image": null
    },
    "funda": {
      "text": "Poutine emerged in rural Qu-%-#bec in the late 1950s, though the exact origin is disputed between several small towns including Warwick and Drummondville. The name is Qu-%-#b-%-#cois slang, loosely meaning 'mess'. The key to authentic poutine is the cheese - it must be fresh cheese curds (not shredded cheese), which squeak when bitten. The hot gravy partially melts the curds. It has since become a national Canadian symbol and spawned countless gourmet variations.",
      "image": null
    }
  },
  {
    "id": 20,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Saffron is the world's most expensive spice by weight. From which part of the plant is it derived, and which country is the world's largest producer?",
      "image": "images/q20_pexels.jpg"
    },
    "answer": {
      "text": "Saffron is derived from the <strong>dried stigmas</strong> (thread-like structures) of the sativus</em></strong> flower. Each flower produces only three stigmas, which must be hand-picked. is the world's largest producer, accounting for over 90% of global production.",
      "image": null
    },
    "funda": {
      "text": "It takes approximately 150,000 flowers - or 450,000 hand-picked stigmas - to produce just one kilogram of saffron. Harvesting occurs over a brief two-week window in autumn, and the flowers must be picked at dawn before the sun damages the delicate stigmas. Saffron's vivid yellow colour comes from the carotenoid compound <em>crocin</em>, while its aroma comes from <em>safranal</em>. In India, Kashmir saffron (Kashmiri Kesar) is considered among the finest in the world.",
      "image": null
    }
  },
  {
    "id": 21,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The dish 'Moussaka' is most commonly associated with Greek cuisine. What are its key layers, and which other culinary tradition has a strong claim to the dish's origin?",
      "image": "images/q21_pexels.jpg"
    },
    "answer": {
      "text": "Greek moussaka typically consists of layers of <strong>sliced aubergine (eggplant), spiced minced lamb or beef, and a rich b-%-#chamel sauce</strong> baked until golden. and Middle Eastern</strong> culinary traditions have strong historical claims to the dish's origin.",
      "image": null
    },
    "funda": {
      "text": "The word 'moussaka' comes from the Arabic <em>musaqqa'a</em>, meaning 'chilled'. Versions of the dish exist across the Balkans, the Levant, and the Middle East - many without b-%-#chamel and some with potato instead of aubergine. The layered, b-%-#chamel-topped version now recognised as 'Greek moussaka' was standardised and popularised by chef Nikolaos Tselementes in the 1920s, who was heavily influenced by French cuisine. It is therefore somewhat a modern codification rather than an ancient recipe.",
      "image": null
    }
  },
  {
    "id": 22,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "This is the Olakaneeshwar Temple. It was built by the Pallava emperor Mahendravarman in the year 630 CE. Aside from being a Shiva temple, this temple also has served one more purpose since its construction. What is the purpose?",
      "image": "images/q22_pexels.jpg"
    },
    "answer": {
      "text": "It is a lighthouse, and the oldest lighthouse in Asia. The Indian Tourism Department decided to discontinue all functional lighthouses and convert them into Tourist destinations. This is one of them.",
      "image": null
    },
    "funda": {
      "text": "The Olakaneeshwar Temple, also known as the Mahabalipuram lighthouse, is notable for its unique dual purpose, combining religious significance with maritime navigation, reflecting the architectural ingenuity of ancient Indian civilizations. The temple's transformation into a tourist destination highlights the blend of cultural heritage and modern tourism in India.",
      "image": null
    }
  },
  {
    "id": 23,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Renowned artist-sculptor Promod Kamble is known for his unusual style of architecture. In November 2023, he completed the statue of a well-known figure, and it was inaugurated in Mumbai. The figure's pose was taken from one amongst thousands of action images of the character. Whose statue did he build?",
      "image": "images/q23_pexels.jpg"
    },
    "answer": {
      "text": "Sachin Tendulkar. (action images are his various shots in action)",
      "image": null
    },
    "funda": {
      "text": "The statue is located at the Bandra-Worli Sea Link in Mumbai, marking the legendary cricketer's contribution to Indian sports. This monument was unveiled to celebrate his unparalleled career and his status as a global icon of cricket.",
      "image": null
    }
  },
  {
    "id": 24,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The Pench Tiger Reserve is a new ____ ___ park, the first such park in India and the fifth in Asia. The international committee for the conservation of nature has recommended more countries to construct such parks. What is the significance of the Pench Tiger Reserve? FITB.",
      "image": "images/q24_pexels.jpg"
    },
    "answer": {
      "text": "Dark sky. Dark sky parks have a protected radius around them, where artificial light/electricity of any kind is banned. This is because animals need natural darkness to grow in the best way and perform life functions, such as fertilization, mating and hunting.",
      "image": null
    },
    "funda": {
      "text": "Dark sky parks not only benefit wildlife but also enhance stargazing experiences, allowing visitors to enjoy clear views of celestial events and constellations, fostering a deeper appreciation for astronomy and nature. The concept has gained popularity worldwide, promoting both environmental conservation and tourism.",
      "image": null
    }
  },
  {
    "topic": "geography",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "These gigantic rocks are seemingly balanced on top of each other. Known as Domboromari, or the 'Balancing Rocks', in which country are they a famous national symbol?",
      "image": "images/q25_wiki.jpg"
    },
    "answer": {
      "text": "Zimbabwe. The Balancing Rocks are a natural geological formation and are featured on the country's currency.",
      "image": null
    },
    "funda": {
      "text": "The rocks are located in Epworth, near the capital city of Harare.",
      "image": null
    }
  },
  {
    "id": 26,
    "topic": "current-affairs",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Pictured below is a famous personality wearing a peculiar gown.",
      "image": "images/q26_pexels.jpg"
    },
    "answer": {
      "text": "The personality is Radhika Merchant, and the gown is a love letter written to her by her to-be husband, Anant Ambani, before their marriage. Ambani wrote a variety of such letters to Merchant. She preserved one and converted this into a gown for her pre-wedding ceremony.",
      "image": null
    },
    "funda": {
      "text": "Anant Ambani wrote several heartfelt letters to Radhika Merchant during their courtship. Radhika preserved one of these letters and had its text printed on the fabric of her gown, which she wore at their pre-wedding ceremony. The letter on the gown read widely shared lines including <em>'I love you'</em> and intimate expressions of devotion. The gown became widely discussed for its deeply personal and romantic gesture.",
      "image": null
    }
  },
  {
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "In 2018, the 'Portrait of Edmond de Belamy' sold for $432,500 at Christie's. What was unique about the creation of this artwork?",
      "image": null
    },
    "answer": {
      "text": "It was the first artwork created by Artificial Intelligence (specifically a GAN algorithm) to be sold at a major auction house.",
      "image": null
    },
    "funda": {
      "text": "It was created by the Paris-based collective 'Obvious'.",
      "image": null
    }
  },
  {
    "id": 28,
    "topic": "politics",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Every country has an ISO code, which identifies the country in international transactions. For example, India is denoted by IN, and Germany is denoted by DE. What was the ISO country code of East Germany in the year 198-?",
      "image": "images/q28_pexels.jpg"
    },
    "answer": {
      "text": "DD.' DD stood for Demokratische Republik\\u201d, which means Democratic Republic in English. The code is now DE, standing for DEustchland ('Germany' in German).",
      "image": null
    },
    "funda": {
      "text": "ISO 3166-1 codes are updated following major geopolitical shifts, such as the dissolution of the Soviet Union or the reunification of Germany. These changes ensure that international banking, shipping, and postal systems remain synchronized with current global borders.",
      "image": null
    }
  },
  {
    "id": 29,
    "topic": "politics",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Pictured below is an advertisement made by a company that uses predictive analytics and data to notify police about where crimes are likely to happen. What is the company behind this advertisement?",
      "image": "images/q29_pexels.jpg"
    },
    "answer": {
      "text": "IBM. A common mistake is answering CIA or FBI. Both are governmental agencies (not companies), and the CIA does not advertise any of its activities, being a secret international organization.",
      "image": null
    },
    "funda": {
      "text": "The predictive software mentioned is known as Predictive Policing, which uses historical crime data to allocate law enforcement resources more efficiently. Critics of these systems often raise concerns regarding algorithmic bias and the potential for reinforcing existing patterns of over-policing in specific neighborhoods.",
      "image": null
    }
  },
  {
    "id": 30,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Pictured below is the National Flower of France. What is it?",
      "image": "images/q30_pexels.jpg"
    },
    "answer": {
      "text": "Iris.",
      "image": null
    },
    "funda": {
      "text": "Historically known as the fleur-de-lis, this stylized symbol was used by French royalty to represent divine right and purity. It is widely believed to have originated from the yellow iris growing in the marshes of the Ile-de-France region.",
      "image": null
    }
  },
  {
    "id": 31,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "These animals are ambush predators, preferring to sneak up on their prey instead of running behind them. They are blessed with great acceleration, but have poor stamina, and therefore cannot chase prey over long distances.",
      "image": "images/q31_pexels.jpg"
    },
    "answer": {
      "text": "Tiger.",
      "image": null
    },
    "funda": {
      "text": "Tigers are the largest members of the cat family and can weigh up to 660 pounds, making them powerful hunters. They are known for their distinctive orange coat with black stripes, which provides excellent camouflage in their natural habitat.",
      "image": null
    }
  },
  {
    "id": 32,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "This word comes from a Greek word meaning 'harmony', 'order' and sometimes, 'the world'. The meaning of this word in English is a little more expansive, often being used to the entire universe and all of creation.",
      "image": "images/q32_pexels.jpg"
    },
    "answer": {
      "text": "Cosmos.",
      "image": null
    },
    "funda": {
      "text": "The term \"cosmos\" is often associated with the philosophical teachings of Pythagoras and Plato, who viewed the universe as an ordered and harmonious whole, influencing various fields from science to art throughout history. In modern astronomy, \"cosmos\" is used to describe the vast and intricate structure of the universe, encompassing everything from galaxies to subatomic particles.",
      "image": null
    }
  },
  {
    "id": 33,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Observe the minimalist poster of a mega-hit Hollywood thriller released in 1958, directed by the legendary Alfred Hitchcock.",
      "image": "images/q33_pexels.jpg"
    },
    "answer": {
      "text": "Vertigo. One can clearly see the man on top looking down at the remaining men. Vertigo is defined as the sensation of motion when one is actually not moving at all.",
      "image": null
    },
    "funda": {
      "text": "Vertigo was initially met with mixed reviews but has since been re-evaluated and is now considered one of the greatest films of all time, often praised for its innovative use of camera techniques and psychological depth. The film's haunting score, composed by Bernard Herrmann, plays a crucial role in enhancing its eerie atmosphere.",
      "image": null
    }
  },
  {
    "id": 34,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "It is a highly contagious virus of animal origin. It's technical name is Variola. It is now eradicated.",
      "image": "images/q34_pexels.jpg"
    },
    "answer": {
      "text": "Small pox. It was declared eradicated by the World Health Organization 20 years ago, and became a landmark moment in the history of human healthcare.",
      "image": null
    },
    "funda": {
      "text": "Smallpox was the first disease to be eradicated through vaccination, with the last natural case reported in Somalia in 1977, leading to the development of the global vaccination campaign. The success of smallpox eradication has since influenced public health strategies for combating other infectious diseases.",
      "image": null
    }
  },
  {
    "id": 35,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Pictured below is a device that is critical to a sport.",
      "image": "images/q35_pexels.jpg"
    },
    "answer": {
      "text": "Ice hockey. The image is of an ice hockey puck. Since the image is highly magnified, it may be difficult to recognize at first.",
      "image": null
    },
    "funda": {
      "text": "The ice hockey puck is made of vulcanized rubber and weighs about 170 grams, designed to withstand high-speed impacts during play. It was first introduced in the late 19th century, replacing earlier versions made from wood or other materials.",
      "image": null
    }
  },
  {
    "topic": "literature",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Pictured below is the cover of a 20th-century classic by George Orwell. The famous quote on the cover says, 'Big Brother is Watching You'. Which novel is this?",
      "image": null
    },
    "answer": {
      "text": "1984 (Nineteen Eighty-Four).",
      "image": null
    },
    "funda": {
      "text": "The novel introduced concepts like Thought Police, Room 101, and Newspeak.",
      "image": null
    }
  },
  {
    "id": 37,
    "topic": "general",
    "difficulty": "medium",
    "type": "grid-flip",
    "question": {
      "text": "Morarji Desai - RIGHT Deve Gowda - RIGHT Narasimha Rao - WRONG Gulsarilal Nanda - WRONG Charan Singh - RIGHT",
      "image": "images/q37_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Morarji, Deve, Charan",
      "image": null
    },
    "funda": {
      "text": "Morarji Desai was the first Prime Minister of India not from the Indian National Congress party, serving from 1977 to 1979. Charan Singh, known for his agrarian policies, was Prime Minister during a turbulent period and is often remembered for his efforts to support farmers in India.",
      "image": null
    }
  },
  {
    "id": 38,
    "topic": "general",
    "difficulty": "medium",
    "type": "grid-flip",
    "question": {
      "text": "MOVIES DIRECTED BY VENKAT PRABHU Vadacurry - WRONG Biriyani - RIGHT Custody - RIGHT Mangatha - RIGHT Nodadigal - WRONG",
      "image": "images/q38_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Biriyani, Custody, Mangatha",
      "image": null
    },
    "funda": {
      "text": "Venkata Prabhu is known for his unique storytelling style and is a prominent figure in Tamil cinema, with \"Biriyani\" featuring a mix of comedy and thriller elements that showcase his signature approach. \"Mangatha,\" a heist film, marked a significant milestone in his career, being a major commercial success and featuring the popular actor Ajith Kumar in a dual role.",
      "image": null
    }
  },
  {
    "id": 39,
    "topic": "sports",
    "difficulty": "medium",
    "type": "grid-flip",
    "question": {
      "text": "Sarojal - RIGHT PROPOSED SPORTS FOR THE LOS ANGELES OLYMPICS 2028 Flag Football - RIGHT",
      "image": "images/q39_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Sarojal, Flag",
      "image": null
    },
    "funda": {
      "text": "Flag football will make its Olympic debut at the Los Angeles 2028 Games, reflecting the growing popularity of the sport, especially in the United States. This inclusion aims to attract a younger audience and promote inclusivity in sports.",
      "image": null
    }
  },
  {
    "id": 40,
    "topic": "general",
    "difficulty": "medium",
    "type": "grid-flip",
    "question": {
      "text": "Netball - WRONG Lacrosse - RIGHT Kabaddi - WRONG Squash - RIGHT",
      "image": "images/q40_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Lacrosse, Squash",
      "image": null
    },
    "funda": {
      "text": "Lacrosse is one of the oldest team sports in North America, with origins dating back to the 17th century among Indigenous peoples. Squash, developed in the early 19th century in England, is played in over 185 countries and is known for its fast-paced, high-intensity gameplay.",
      "image": null
    }
  },
  {
    "id": 41,
    "topic": "general",
    "difficulty": "hard",
    "type": "grid-flip",
    "question": {
      "text": "ENGLISH WORDS FROM INDIAN LANGUAGES Calico - RIGHT Ketchup - WRONG Catamaran - RIGHT Mulligatawny - RIGHT Bamboo - RIGHT Karaoke - WRONG Hibiscus - WRONG",
      "image": "images/q41_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Calico, Catamaran, Mulligatawny, Bamboo",
      "image": null
    },
    "funda": {
      "text": "The words and their respective original languages are as follows: 'Calico' comes from 'Calicut', a famous coast even today. 'Ketchup' comes from Chinese. 'Catamaran' comes from the words 'kattu maram (literally 'tie wood') in Tamil. 'Mulligatawny' comes from the words 'milagai thanneer' (literally 'spiced water' or 'chili water') in Tamil. \\",
      "image": null
    }
  },
  {
    "id": 42,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "grid-flip",
    "question": {
      "text": "Dragonfruit flower - RIGHT",
      "image": "images/q42_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Dragonfruit",
      "image": null
    },
    "funda": {
      "text": "Dragonfruit, also known as pitaya, is a fruit of several different cactus species native to the Americas, and its flowers are large and fragrant, blooming only at night, which makes them attractive to nocturnal pollinators like bats and moths. The fruit is not only visually striking with its vibrant pink skin and green scales but is also rich in antioxidants and vitamin C.",
      "image": null
    }
  },
  {
    "id": 43,
    "topic": "general",
    "difficulty": "hard",
    "type": "grid-flip",
    "question": {
      "text": "Rose - WRONG Tube rose - RIGHT Brahma kamala - RIGHT Parijata - RIGHT CARS FROM MARUTI/SUZUKI Fronx - RIGHT Baleno - RIGHT Jimny - RIGHT Celerio - RIGHT",
      "image": "images/q43_pexels.jpg"
    },
    "answer": {
      "text": "Correct: Tube, Brahma, Parijata, Fronx, Baleno, Jimny, Celerio",
      "image": null
    },
    "funda": {
      "text": "The tube rose, also known as the tuberose, is prized for its fragrant flowers and is often used in perfumes and traditional garlands in India. The Maruti Suzuki Baleno is one of the best-selling hatchbacks in India, known for its spacious interior and fuel efficiency.",
      "image": null
    }
  },
  {
    "id": 44,
    "topic": "general",
    "difficulty": "easy",
    "type": "grid-flip",
    "question": {
      "text": "Bolero - WRONG",
      "image": "images/q44_pexels.jpg"
    },
    "answer": {
      "text": "Correct:",
      "image": null
    },
    "funda": {
      "text": "The song was originally written by Maurice Ravel for an orchestra and later adapted into a famous dance style characterized by its repetitive rhythmic pattern.",
      "image": null
    }
  },
  {
    "id": 45,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Chairman of Helion Energy Stanford dropout. The Monkey's fist refers to a tight knot, which is the logo of the company.",
      "image": "images/q45_pexels.jpg"
    },
    "answer": {
      "text": "Sam Altman, Founder and CEO of OpenAI. His first venture was Helion Energy.",
      "image": null
    },
    "funda": {
      "text": "Sam Altman became the president of Y Combinator, a prominent startup accelerator, before co-founding OpenAI, which aims to ensure that artificial general intelligence benefits all of humanity. He is known for his influential role in the tech industry, advocating for responsible AI development.",
      "image": null
    }
  },
  {
    "id": 46,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "March 8, 1917 A classless society blooms \\",
      "image": "images/q46_pexels.jpg"
    },
    "answer": {
      "text": "The Russian Revolution",
      "image": "images/q46_wiki.jpg"
    },
    "funda": {
      "text": "The Russian Revolution was a period of political and social change in Russia, starting in 1917.",
      "image": null
    }
  },
  {
    "id": 47,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "St, Stephen's Tower Elizabeth's Tower (2012) A striking clock with five bells",
      "image": "images/q47_pexels.jpg"
    },
    "answer": {
      "text": "Big Ben. The Tower was renamed in 2012 to Elizabeth's Tower. Its earlier name was St. Stephen's tower.",
      "image": null
    },
    "funda": {
      "text": "The name Big Ben actually refers to the massive Great Bell inside the tower rather than the clock or the tower itself. It is believed to be named after Sir Benjamin Hall, a former commissioner of works who oversaw the bell's installation.",
      "image": null
    }
  },
  {
    "id": 48,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Received the Nobel Prize in Chemistry in 1935. Awarded the prize for the synthesis of new radioactive elements. Mother, Father and Husband were all Nobel laureates",
      "image": "images/q48_pexels.jpg"
    },
    "answer": {
      "text": "Irena Curie, the daughter of Marie Curie. Her mother (Marie), father (Pierre) and husband Fr\\u00e9d\\u00e9ric",
      "image": null
    },
    "funda": {
      "text": "Irena Curie was not only a prominent chemist but also a pioneering figure in the field of medical research, contributing significantly to the development of cancer treatments using radioactive isotopes. Her family's legacy in science is unique, as the Curies remain one of the only families to have multiple Nobel laureates across different generations.",
      "image": null
    }
  },
  {
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "On June 1, 1984, the Indian government launched a military operation to remove Jarnail Singh Bhindranwale and his followers from the Golden Temple in Amritsar. What was the code name of this operation?",
      "image": null
    },
    "answer": {
      "text": "Operation Bluestar. A controversial operation signed off by Indira Gandhi to capture militants who had taken refuge in the Golden Temple. It eventually led to her assassination four months later.",
      "image": null
    },
    "funda": {
      "text": "Operation Bluestar remains one of the most controversial events in modern Indian history.",
      "image": null
    }
  },
  {
    "id": 50,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Old Peak/Old Mountain Peruvian ancient astronomical observatory \\",
      "image": "images/q50_pexels.jpg"
    },
    "answer": {
      "text": "Macchu Picchu. Supposed to be a long-lost civilization, it is one of the most mysterious and culturally rich places in Peru.",
      "image": null
    },
    "funda": {
      "text": "Machu Picchu, built in the 15th century, is often referred to as the \"Lost City of the Incas\" and was rediscovered by American historian Hiram Bingham in 1911, becoming a UNESCO World Heritage site in 1983. Its sophisticated dry-stone construction and agricultural terraces showcase the advanced engineering skills of the Inca civilization.",
      "image": null
    }
  },
  {
    "id": 51,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "In tennis, a common tip that almost all coaches give to their players is to \\",
      "image": "images/q51_pexels.jpg"
    },
    "answer": {
      "text": "The net is not even across its entire length. The sides of the net are elevated higher than the middle, because of tension from the poles holding the net up. Since the main goal is to get the ball over the net, hitting it over the middle would mean that players could hit lower than normal and still clear the net.",
      "image": null
    },
    "funda": {
      "text": "The net's design, with its higher sides, is intentional to create a challenge for players, encouraging them to develop better accuracy and shot placement. This feature is part of what differentiates tennis from other racquet sports, where nets may be uniform in height.",
      "image": null
    }
  },
  {
    "id": 52,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Date: 26. 04. 1986. Time: 1:23:58 AM. Location: Soviet Russia.",
      "image": "images/q52_pexels.jpg"
    },
    "answer": {
      "text": "Chernobyl. The clock in one of the underground chambers stopped exactly when the reactor exploded, resulting in this haunting image. The time reads 1:23:58AM.",
      "image": null
    },
    "funda": {
      "text": "The Chernobyl disaster is considered the worst nuclear accident in history, leading to widespread radioactive contamination and the evacuation of over 100,000 people from the surrounding areas. The site remains largely abandoned, and the Chernobyl Exclusion Zone has become a focal point for scientific research and tourism.",
      "image": null
    }
  },
  {
    "id": 53,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "This 20-07 movie is a satire on American life. Its tagline reads, \\",
      "image": "images/q53_pexels.jpg"
    },
    "answer": {
      "text": "The Simpson's Movie (2007).",
      "image": null
    },
    "funda": {
      "text": "The Simpsons Movie was the first feature-length film based on the iconic animated television series, which debuted in 1989 and became a cultural phenomenon. The film grossed over $500 million worldwide and highlighted the show's satirical take on American society and politics.",
      "image": null
    }
  },
  {
    "id": 54,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "In astronomy, this word is used to refer to the amount of deviation of a body from the path of a perfect circle. In common parlance, it is used to describe someone that behaves in a weird or odd manner.",
      "image": "images/q54_pexels.jpg"
    },
    "answer": {
      "text": "Eccentric",
      "image": null
    },
    "funda": {
      "text": "In astronomy, an eccentric orbit indicates that a celestial body moves in an elongated path rather than a perfect circle, influencing its distance from the central mass it orbits. The term \"eccentric\" has also been used historically in literature and psychology to describe individuals with unconventional behaviors or ideas, often viewed as creative or innovative.",
      "image": null
    }
  },
  {
    "id": 55,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "These animals used to live a nomadic life, moving from place to place in search of food. Their name originates from the French verb meaning 'to move about'. The last of these species died in 1914 in isolation. Her name was Martha.",
      "image": "images/q55_pexels.jpg"
    },
    "answer": {
      "text": "Passenger pigeons. They were famously used to carry messages the 19th and early 20th century.",
      "image": null
    },
    "funda": {
      "text": "Passenger pigeons once formed massive flocks that could darken the sky for hours, with estimates of their population reaching up to 3 billion before their extinction due to overhunting and habitat destruction. Their rapid decline serves as a cautionary tale about the impacts of human activity on wildlife.",
      "image": null
    }
  },
  {
    "id": 56,
    "topic": "current-affairs",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Recently, the Legislative Assembly of Kerala unanimously voted to rename their state into something different. What is the proposed new name for the state of Kerala?",
      "image": "images/q56_pexels.jpg"
    },
    "answer": {
      "text": "Keralam.",
      "image": "images/q56_wiki.jpg"
    },
    "funda": {
      "text": "Kerala is an Indian state on the Malabar Coast.",
      "image": null
    }
  },
  {
    "id": 57,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "Pictured below is a dramatized painting of the last moments of a personality. ID the personality.",
      "image": "images/q57_question.jpg"
    },
    "answer": {
      "text": "Socrates.",
      "image": "images/q57_wiki.jpg"
    },
    "funda": {
      "text": "Socrates was an ancient Greek philosopher from Classical Athens, perhaps the first Western moral philosopher, and a major inspiration on his student Plato, who largely founded the tradition of Western philosophy.",
      "image": null
    }
  },
  {
    "id": 58,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "In the 1860s and 1870s, British officers in India played table tennis using books that were placed spine-up as a net. On top of that, the ball they used was a golf ball. This was how table tennis was first played in India. True or False?",
      "image": "images/q58_pexels.jpg"
    },
    "answer": {
      "text": "True.",
      "image": null
    },
    "funda": {
      "text": "The game was originally referred to as lawn tennis played indoors and later evolved into the formal sport known as ping-pong. The name ping-pong was eventually trademarked by J. Jaques & Son Ltd, leading to the official adoption of the term table tennis.",
      "image": null
    }
  },
  {
    "id": 59,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Pictured below is a creative advertisement by a world-famous company.",
      "image": "images/q59_pexels.jpg"
    },
    "answer": {
      "text": "Band-Aid.",
      "image": "images/q59_wiki.jpg"
    },
    "funda": {
      "text": "Band-Aid is a brand of adhesive bandages distributed by the consumer health company Kenvue, spun off from Johnson & Johnson in 2023.",
      "image": null
    }
  },
  {
    "id": 60,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "'Nomadic Elephant' is a bipartisan exercise between India and which other country? a) Saudi Arabia b) Mongolia",
      "image": "images/q60_pexels.jpg"
    },
    "answer": {
      "text": "Mongolia",
      "image": "images/q60_wiki.jpg"
    },
    "funda": {
      "text": "Mongolia is a landlocked country in the East Asia region.",
      "image": null
    }
  },
  {
    "id": 61,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Sandeep Singhal is an Indian investor who has built a significant business empire in recent times. He is the owner of West Bridge Capital, and funds start-ups, especially ones that are based in India. However, he may be better known by his recent venture into sports. He has set up an academy that trains, almost exclusively, young Indian prodigies to compete at the international level in a particular sport. How do we better know this academy?",
      "image": "images/q61_pexels.jpg"
    },
    "answer": {
      "text": "WACA Anand Chess Academy].",
      "image": null
    },
    "funda": {
      "text": "The academy is named after Viswanathan Anand, the first Indian Grandmaster and five-time World Chess Champion. It focuses on providing high-level training to nurture the next generation of Indian chess talent.",
      "image": null
    }
  },
  {
    "id": 62,
    "topic": "current-affairs",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Attached is the image of a tower, which has recently been inaugurated on the 2nd of October 2024 in Patna, Bihar. Identify. HINT: The name of the tower has only four letters i. e. it is _ _ _ _ tower.",
      "image": "images/q62_question.jpg"
    },
    "answer": {
      "text": "Bapu Tower.",
      "image": null
    },
    "funda": {
      "text": "Bapu Tower is named after Mahatma Gandhi, also referred to as Bapu, and symbolizes the values of peace and non-violence he advocated. The tower stands as a modern landmark in Patna, reflecting the city's growth and development.",
      "image": null
    }
  },
  {
    "id": 63,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "These creatures inhabit very remote regions of a very particular location on Earth. Their call resembles neither the traditional roar of the big cats nor the soft mewing of the domesticated ones, and is therefore called \\",
      "image": "images/q63_pexels.jpg"
    },
    "answer": {
      "text": "Snow Leopard.",
      "image": "images/q63_wiki.jpg"
    },
    "funda": {
      "text": "The snow leopard is a species of large cat in the genus Panthera of the family Felidae.",
      "image": null
    }
  },
  {
    "id": 64,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Oxford Dictionary's Word of the Year 2024 refers to \\",
      "image": "images/q64_pexels.jpg"
    },
    "answer": {
      "text": "Brainrot.",
      "image": null
    },
    "funda": {
      "text": "In Internet culture, the term brain rot describes digital media deemed to be of low quality or value, to such a degree that it is ironically spoken of as causing harm to the viewer.",
      "image": null
    }
  },
  {
    "id": 65,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Mrs. Suman Kumari is the first of her kind in the Indian Armed Forces. She is the first female _ [FITB] to be deployed into action. She is known for her military capabilities, especially with an armed rifle. What category of soldiers does Mrs. _ belong to?",
      "image": "images/q65_pexels.jpg"
    },
    "answer": {
      "text": "Sniper. Mrs. Suman Kumari is the first of her kind in the Indian Armed Forces. She is the first female Sniper to be deployed into action. She is a in the Border Security Force (BSF), and completed her eight-week sniper course at CSWT, Indore in March 2024. She was the only woman among 56 male candidates, and finished with the prestigious Instructor Grade.",
      "image": null
    },
    "funda": {
      "text": "Snipers play a crucial role in modern warfare, often tasked with reconnaissance and eliminating high-value targets from a distance, requiring exceptional marksmanship and mental resilience. The integration of women into sniper roles marks a significant step towards gender equality in military operations worldwide.",
      "image": null
    }
  },
  {
    "id": 66,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The longest word that can be written using only the letters in the first row of a standard typewriter is _ [FIND OUT]. What is the second longest word that can be written with the same restrictions?",
      "image": "images/q66_pexels.jpg"
    },
    "answer": {
      "text": "Typewriter. The answer is in the question.",
      "image": null
    },
    "funda": {
      "text": "The top row of a standard QWERTY keyboard contains all the vowels except for the letter U. This unique arrangement makes it impossible to form many common English words that rely on that specific vowel.",
      "image": null
    }
  },
  {
    "id": 67,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The notes shown below were used in a particular region of India from 1918 to 1948. Which region?",
      "image": "images/q67_question.png"
    },
    "answer": {
      "text": "Hyderabad. These were the currency notes in circulation until the Nizam of Hyderabad surrendered to Sardar Vallabhbhai Patel's armed forces and acceded to India.",
      "image": null
    },
    "funda": {
      "text": "Hyderabad was once one of the largest princely states in India, known for its rich cultural heritage and unique blend of Hindu and Muslim traditions, which is reflected in its architecture, cuisine, and language. The Nizam of Hyderabad was one of the wealthiest rulers in the world during his reign, often compared to the likes of the British monarch.",
      "image": null
    }
  },
  {
    "id": 68,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "The name of this capital city was Minh, which means 'Salt' in Arabic, referring to the saltwater sea that it shared a coast with. It's current name means 'Father of Gazelles', owing to a large presence of the animals in the region. ID the capital city.",
      "image": "images/q68_pexels.jpg"
    },
    "answer": {
      "text": "Abu Dhabi.",
      "image": "images/q68_wiki.jpg"
    },
    "funda": {
      "text": "Abu Dhabi is the capital city of the United Arab Emirates (UAE).",
      "image": null
    }
  },
  {
    "id": 69,
    "topic": "sports",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Pictured below is an interesting maneuver in the sport of kayaking, where the kayaker will simply 'roll' the kayak over after it has capsized in the water. It is called a kayak roll, but it has another name, taking inspiration from a particular community of people. What is the other name of this maneuver?",
      "image": "images/q69_question.jpg"
    },
    "answer": {
      "text": "Eskimo roll.",
      "image": "images/q69_wiki.jpg"
    },
    "funda": {
      "text": "A kayak roll is the act of righting a capsized kayak by use of body motion and/or a paddle.",
      "image": null
    }
  },
  {
    "id": 70,
    "topic": "current-affairs",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Pictured below is the erstwhile name and logo of a company. The founders, who were only 19 at the time, started this company to deliver groceries faster than their competition. ID the current name of the company.",
      "image": "images/q70_pexels.jpg"
    },
    "answer": {
      "text": "Zepto.",
      "image": null
    },
    "funda": {
      "text": "A metric prefix is a unit prefix that precedes a basic unit of measure to indicate a multiple or submultiple of the unit.",
      "image": null
    }
  },
  {
    "id": 71,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "On Planet Vegeta, the home planet of this legendary Saiyan, ___ ___ is called Kakarot, deriving from the English word 'Carrot'. This goes hand-in-hand with Saiyan naming convention, where most Saiyans are named after vegetables.",
      "image": "images/q71_pexels.jpg"
    },
    "answer": {
      "text": "Son Goku.",
      "image": null
    },
    "funda": {
      "text": "Son Goku, originally named Kakarot, is a character inspired by the classic Chinese novel \"Journey to the West,\" where he is based on the Monkey King, Sun Wukong. His transformation from a naive child to a powerful warrior embodies themes of growth and perseverance prevalent in many shonen anime.",
      "image": null
    }
  },
  {
    "id": 72,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Pictured below is a still from an unforgettable movement. ID.",
      "image": "images/q72_pexels.jpg"
    },
    "answer": {
      "text": "Chipko Movement.",
      "image": "images/q72_wiki.jpg"
    },
    "funda": {
      "text": "The Chipko movement is a forest conservation movement in India.",
      "image": null
    }
  },
  {
    "id": 73,
    "topic": "sports",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "In diplomacy, the _ strategy refers to a military-diplomatic tactic where a country slowly but steadily pressures the rival nation into submission and agreement, through a mix of physical, economic, diplomatic and psychological constriction of the rival nation. This can be seen deployed by a certain power to assert its dominion over another smaller island country.",
      "image": "images/q73_pexels.jpg"
    },
    "answer": {
      "text": "Anaconda strategy.",
      "image": null
    },
    "funda": {
      "text": "The Anaconda strategy is named after the way an anaconda snake constricts its prey, and it has historical roots in military strategy, notably used by Union General Winfield Scott during the American Civil War to blockade the Confederacy. This approach emphasizes the use of economic and military pressure to incapacitate an opponent without direct confrontation.",
      "image": null
    }
  },
  {
    "id": 74,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "https://www. youtube. ID the instrument, which has a rather simple name.",
      "image": "images/q74_pexels.jpg"
    },
    "answer": {
      "text": "Nose Flute.",
      "image": null
    },
    "funda": {
      "text": "The nose flute is a traditional wind instrument played by blowing through the nostrils, producing sound by vibrating the lips against the mouthpiece. It is often used in various cultures around the world, including in Polynesian music and among indigenous peoples.",
      "image": null
    }
  },
  {
    "id": 75,
    "topic": "cuisines",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Swiggy released it's annual round-up of the most ordered foods in India, titled 'How India Swiggy'd'. To nobody's surprise, the list was topped by biryani, with 83 million orders in 2024, or 158 orders every minute. Second place went to another ubiquitous Indian dish known for its multiple flavors, with 23 million orders over the year. Which food item?",
      "image": "images/q75_pexels.jpg"
    },
    "answer": {
      "text": "Dosa.",
      "image": null
    },
    "funda": {
      "text": "Dosa is a popular South Indian dish made from fermented rice and lentil batter, and it has numerous regional variations, including masala dosa and paper dosa, each offering a unique taste and texture. It is not only enjoyed as a breakfast item but is also commonly served as a snack or main course across India.",
      "image": null
    }
  },
  {
    "id": 76,
    "topic": "general",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Last year, the National Aeronautical and Space Administration (NASA) joined hands with the _ X-ray Observatory to capture and process never-before-seen images of space like the one shown here. The observatory is named after a famed Indian scientist with irreplaceable contributions to the field of astronomy and space science. ID the name of the observatory.",
      "image": "images/q76_pexels.jpg"
    },
    "answer": {
      "text": "Chandra X-ray Observatory.",
      "image": null
    },
    "funda": {
      "text": "The Chandra X-ray Observatory is named after Indian-American astrophysicist Subrahmanyan Chandrasekhar, who won the Nobel Prize in Physics in 1983 for his work on the structure and evolution of stars. Launched in 1999, Chandra has provided crucial insights into high-energy regions of the universe, such as black holes and supernova remnants.",
      "image": null
    }
  },
  {
    "id": 77,
    "topic": "history",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Pictured below is the 'Dragon Throne', the seat of the Emperor of China during the time of the Qing dynasty and later. It is placed in the Hall of Supreme Harmony in the heart of the Forbidden City, and is constructed primarily from a particular material. You might have seen this material somewhere in a recent film being taken in and out of a few places. ID the material.",
      "image": "images/q77_question.png"
    },
    "answer": {
      "text": "Red Sandalwood.",
      "image": null
    },
    "funda": {
      "text": "Red sandalwood, known for its rich color and aromatic properties, has been prized in traditional Chinese culture for centuries, often used in furniture and religious artifacts. Its rarity and the slow growth of the tree have made it a symbol of luxury and status, contributing to its high value in both historical and modern contexts.",
      "image": null
    }
  },
  {
    "id": 78,
    "topic": "politics",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Named after the Greek Goddess of the Rainbow, this element was given its name because of the multitude of colors that were displayed by the salts it formed. It was discovered in 1803 while he was trying to isolate a separate element. It is the most corrosion-resistant material known to mankind. ID.",
      "image": "images/q78_pexels.jpg"
    },
    "answer": {
      "text": "Iridium.",
      "image": null
    },
    "funda": {
      "text": "Iridium is one of the rarest elements in the Earth's crust and is often found in meteorites, which has led scientists to hypothesize its role in the mass extinction event that wiped out the dinosaurs, as a layer of iridium-rich clay marks the boundary of that period. Its exceptional resistance to corrosion makes it ideal for use in high-temperature applications and in the manufacturing of spark pl",
      "image": null
    }
  },
  {
    "id": 79,
    "topic": "history",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Android has a famous habit of naming their softwares after food items. Snowcone, Tiramisu, Upside Down Cake and Vanilla Ice Cream were the last four of its mobile phone operating systems. Given the clear pattern here, users were expecting Android V16 to begin with a particular letter. However, breaking their own conventions, Android named it something completely different. The mascot is pictured here with the food item. ID the codename for Android 112. 0.",
      "image": "images/q79_pexels.jpg"
    },
    "answer": {
      "text": "Baklava.",
      "image": null
    },
    "funda": {
      "text": "This dessert is a layered pastry made of thin sheets of filo dough, filled with chopped nuts, and sweetened with syrup or honey. It is a staple of Middle Eastern cuisine and is particularly popular in Turkey and Greece.",
      "image": null
    }
  },
  {
    "id": 80,
    "topic": "politics",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Zeenea is a data management and analytics company that is based in France. Recently, they were acquired by a well-known giant in the Indian IT sector. ID the company that bought Zeenea.",
      "image": "images/q80_pexels.jpg"
    },
    "answer": {
      "text": "HCL Technologies. \\u2014-",
      "image": null
    },
    "funda": {
      "text": "HCL Technologies, founded in 1976, is one of India's leading IT services companies and has a significant global presence, providing services in areas like software development, infrastructure management, and engineering services. The acquisition of Zeenea enhances HCL's capabilities in data management and analytics, reflecting the growing importance of data-driven decision-making in business.",
      "image": null
    }
  },
  {
    "id": 81,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "A _ is a bright spot in a galaxy where stellar dust swirls around in a giant cloud, often forming new stars.",
      "image": "images/q81_pexels.jpg"
    },
    "answer": {
      "text": "Nebula.",
      "image": null
    },
    "funda": {
      "text": "These vast clouds of gas and dust can also be the remnants of dying stars, such as planetary nebulae or supernova remnants. They serve as the cosmic nurseries where gravity pulls material together to trigger nuclear fusion.",
      "image": null
    }
  },
  {
    "id": 82,
    "topic": "general",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Identify the actor. Not Rajinikanth, the other one. (The image is from the film Bhagawaan Dada)",
      "image": "images/q82_pexels.jpg"
    },
    "answer": {
      "text": "Hrithik Roshan.",
      "image": null
    },
    "funda": {
      "text": "Hrithik Roshan made his film debut as a child artist in 1980 and gained fame as a lead actor with his role in \"Kaho Naa... Pyaar Hai\" in 2000, quickly becoming one of Bollywood's top stars known for his dancing skills and versatility. He is also the son of renowned filmmaker Rakesh Roshan.",
      "image": null
    }
  },
  {
    "id": 83,
    "topic": "cuisines",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "The 'Eleven Herbs and Spices' secret formula is a trademark of ___, a recipe that skyrocketed its makers to the very top of the global food industry. Despite being a corporate secret, a recent incident may have unwittingly reveled the formula, although the company behind the recipe denies it. Which company?",
      "image": "images/q83_pexels.jpg"
    },
    "answer": {
      "text": "KFC.",
      "image": null
    },
    "funda": {
      "text": "KFC, founded by Colonel Harland Sanders in 1952, has become one of the largest fast-food chains in the world, with over 24,000 locations in more than 145 countries. The secret recipe is said to be stored in a safe at the company’s headquarters in Louisville, Kentucky, and is one of the most closely guarded trade secrets in the food industry.",
      "image": null
    }
  },
  {
    "id": 84,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Largest land-locked country in the world by area.",
      "image": "images/q84_pexels.jpg"
    },
    "answer": {
      "text": "Kazakhstan.",
      "image": "images/q84_wiki.jpg"
    },
    "funda": {
      "text": "Kazakhstan, officially the Republic of Kazakhstan, is a landlocked country situated primarily in Central Asia, with a portion of its territory extending into Eastern Europe.",
      "image": null
    }
  },
  {
    "id": 85,
    "topic": "cuisines",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Why is the city Palitana in Bhavnagar District, Gujarat, currently in the news?",
      "image": "images/q85_pexels.jpg"
    },
    "answer": {
      "text": "First city in India and the first city in the world to ban consumption of non-vegetarian food. It was banned earlier; now legislature exists to back the ban for the first time.",
      "image": null
    },
    "funda": {
      "text": "Palitana is also known for its stunning Jain temples, with over 900 temples situated on the Shatrunjaya hill, making it a significant pilgrimage site for Jains worldwide. The city's commitment to vegetarianism reflects the Jain principle of ahimsa, or non-violence, which is central to their philosophy.",
      "image": null
    }
  },
  {
    "id": 86,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "India is going through a tough time to secure a geographical indication [GI] for this good in the international market, with a reported value of 50,000 crores. Both India and Pakistan are laying claim over the GI of this good.",
      "image": "images/q86_pexels.jpg"
    },
    "answer": {
      "text": "Basmati rice. Both India and Pakistan are laying claim to it because it can only be obtained in the region of Plains.",
      "image": null
    },
    "funda": {
      "text": "Basmati rice is renowned for its distinctive aroma and long grains, and it has been cultivated in the Himalayan region for centuries, with historical references dating back to ancient texts. The unique climatic and soil conditions of the region contribute to its celebrated flavor and texture, making it a sought-after ingredient worldwide.",
      "image": null
    }
  },
  {
    "id": 87,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Identify the country from the given flag, used between 1949-1991.",
      "image": "images/q197_1.jpg"
    },
    "answer": {
      "text": "Ukraine. This was the flag used while it was still a part of the USSR, till the Union's eventual downfall in 1991.",
      "image": null
    },
    "funda": {
      "text": "Ukraine's current flag, featuring blue and yellow stripes, symbolizes the sky and fields of wheat, reflecting the country's agricultural heritage. The flag was officially adopted in 1992 after Ukraine gained independence from the Soviet Union.",
      "image": null
    }
  },
  {
    "id": 88,
    "topic": "current-affairs",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Avengers: Endgame was released on April 26, 2019 and went on to break numerous box office records. It set the record for the highest grossing film of all time, which was broken by Avatar (2008) following a re-release in 2023. When it was released, Google searches for 'How to _ _' reached a record high due to a particular desperation of fans. Fill in the blanks.",
      "image": "images/q88_pexels.jpg"
    },
    "answer": {
      "text": "Avoid Spoilers.",
      "image": null
    },
    "funda": {
      "text": "The intense desire to avoid spoilers for major film releases has led to the creation of various online communities and tools dedicated to helping fans navigate social media and news without encountering plot details. This phenomenon highlights the cultural significance of surprise and narrative secrecy in modern storytelling.",
      "image": null
    }
  },
  {
    "id": 89,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the difference between the two dolphins, and what is the similarity? One similarity and one difference.",
      "image": "images/q89_pexels.jpg"
    },
    "answer": {
      "text": "The first one is the Ganges river dolphin, the second is the Indus river dolphin. The similarity is that both are blind. EXTRA",
      "image": null
    },
    "funda": {
      "text": "Both are blind due to river pollution in the Indus and the Ganga.",
      "image": null
    }
  },
  {
    "id": 90,
    "topic": "sports",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "He was born with scoliosis, an affliction of the vertebra. His right leg is shorter than his left leg. His right left provides 33% more power than his left leg. [DOUBLE CHECK THIS ONE] He changed his stride to accommodate these shortcomings.",
      "image": "images/q90_pexels.jpg"
    },
    "answer": {
      "text": "Usain Bolt.",
      "image": "images/q90_wiki.jpg"
    },
    "funda": {
      "text": "Usain Bolt, often regarded as the fastest man in the world, set world records in the 100 meters and 200 meters that still stand, achieving an unprecedented level of speed despite his physical challenges. His unique running style and long stride have been attributed to his tall stature of 6 feet 5 inches, which he adapted to maximize his performance on the track.",
      "image": null
    }
  },
  {
    "id": 91,
    "topic": "politics",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Under which Indian Prime Minister's rule was the 'Environmental Protection Act' passed with Presidential assent on May 23, 1986?",
      "image": "images/q91_pexels.jpg"
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
    "id": 92,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "These birds' migration can range from 44,000 miles to 59,000 miles in a year. A bird of this species typically flies a distance equivalent to three round trips to the moon.",
      "image": "images/q92_pexels.jpg"
    },
    "answer": {
      "text": "Arctic Tern.",
      "image": "images/q92_wiki.jpg"
    },
    "funda": {
      "text": "The Arctic tern is a tern in the family Laridae.",
      "image": null
    }
  },
  {
    "id": 93,
    "topic": "sports",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which flower is depicted on the cover of Japanese passports?",
      "image": "images/q93_pexels.jpg"
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
    "id": 94,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "In 1939, for which movie was this special Oscar awarded?",
      "image": "images/q94_pexels.jpg"
    },
    "answer": {
      "text": "Snow White and the Seven Dwarves. The movie was presented in 1937, but the Oscar was given only in 1939 due to organizational issues.",
      "image": null
    },
    "funda": {
      "text": "\"Snow White and the Seven Dwarfs\" was the first-ever full-length animated feature film, paving the way for future animated classics and establishing Disney as a leader in the animation industry. The film's success also helped to legitimize animation as a serious art form in Hollywood.",
      "image": null
    }
  },
  {
    "id": 95,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "At present the brand is the world's No. I motherboard and gaming brand as well as a Top 3 consumer notebook vendor. The brand's name is inspired by the winged horse in Greek mythology that symbolizes wisdom and knowledge.",
      "image": "images/q95_pexels.jpg"
    },
    "answer": {
      "text": "Asus. The name is taken from the last four letters of 'Pegasus', the legendary Greek horse.",
      "image": null
    },
    "funda": {
      "text": "Asus was founded in 1989 by four engineers from Acer and has since grown to be a leading innovator in the technology sector, particularly known for its high-performance gaming laptops and components. The company is also recognized for its commitment to sustainability, launching initiatives to reduce its environmental impact in manufacturing and product design.",
      "image": null
    }
  },
  {
    "id": 96,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which dance form of Gujarat got UNESCO's Intangible Cultural Heritage status?",
      "image": "images/q96_pexels.jpg"
    },
    "answer": {
      "text": "Garba.",
      "image": null
    },
    "funda": {
      "text": "Garba is traditionally performed during the nine nights of Navratri, celebrating the divine feminine, and features vibrant costumes and rhythmic clapping, making it a key cultural expression in Gujarat. The dance involves circular movements and is often accompanied by folk music, reflecting the region's rich cultural heritage.",
      "image": null
    }
  },
  {
    "id": 97,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "The English word was originally a legal term in Old English, meaning 'Law', 'Judgment' or 'Statute'. Now the word means 'failure', 'death' or 'destruction'.",
      "image": "images/q97_pexels.jpg"
    },
    "answer": {
      "text": "Doom.",
      "image": null
    },
    "funda": {
      "text": "The term \"doom\" has its roots in the Old English word \"dom,\" which referred to a judgment or decree, and it evolved over time to signify a more negative connotation associated with fate and ruin. In literature, \"doom\" is often used to evoke a sense of inevitable tragedy, as seen in works like Shakespeare's plays and various apocalyptic narratives.",
      "image": null
    }
  },
  {
    "id": 98,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Martin Goodman founded 'Timely Comics' in 1939. By 1951, it had generally become known as 'Atlas Comics'. How is it known now?",
      "image": "images/q98_pexels.jpg"
    },
    "answer": {
      "text": "Marvel Comics.",
      "image": null
    },
    "funda": {
      "text": "Marvel Comics revolutionized the comic book industry in the 1960s with the introduction of complex characters and interconnected storylines, paving the way for the modern superhero genre. The Marvel Cinematic Universe, launched in 2008, has since become one of the highest-grossing film franchises of all time.",
      "image": null
    }
  },
  {
    "id": 99,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "This country is celebrated for its remarkable biodiversity - around 92% of the island's mammals, 89% of its plant species and 85% of its reptiles are endemic to the island, meaning that they cannot be found elsewhere on Earth.",
      "image": "images/q99_pexels.jpg"
    },
    "answer": {
      "text": "Madagascar. The anagram works as follows: M - Marvel Comics A - Amrita Sher-Gill D - Doom A - Angelfish G - Garba",
      "image": null
    },
    "funda": {
      "text": "Madagascar is home to unique species such as lemurs, which are not found anywhere else in the world, and the island's isolation has led to the evolution of many distinct ecosystems. The island is also the fourth largest in the world, covering an area of approximately 587,041 square kilometers.",
      "image": null
    }
  },
  {
    "id": 100,
    "topic": "general",
    "difficulty": "easy",
    "type": "progressive",
    "question": {
      "text": "Japanese lucky eight strokes. Let's go places. Kaizen, 5S, Just in Time.",
      "image": "images/q100_pexels.jpg"
    },
    "answer": {
      "text": "Toyota. The name of the company, as well as the logo, can be crafted in just eight strokes.",
      "image": null
    },
    "funda": {
      "text": "Toyota is renowned for revolutionizing manufacturing processes with its Toyota Production System, which emphasizes efficiency and waste reduction, significantly influencing global automotive production. The company is also a leader in hybrid technology, having launched the Prius, the world's first mass-produced hybrid car, in 1997.",
      "image": null
    }
  },
  {
    "id": 101,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Copper Devil. Metal from outer space. EVs, rocket engines, coins.",
      "image": "images/q101_pexels.jpg"
    },
    "answer": {
      "text": "Nickel. 80% of the available metal is from meteors.",
      "image": null
    },
    "funda": {
      "text": "Nickel is essential in the production of stainless steel and is also a key component in various rechargeable batteries used in electric vehicles, highlighting its versatility beyond just being a meteorite-derived metal. Interestingly, the presence of nickel in Earth's core is believed to contribute to the planet's magnetic field.",
      "image": null
    }
  },
  {
    "id": 102,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Criminal Red Hood of 1940. Criminal folk hero. \\",
      "image": "images/q102_pexels.jpg"
    },
    "answer": {
      "text": "Joker.",
      "image": null
    },
    "funda": {
      "text": "The Joker, created by Bill Finger, Bob Kane, and Jerry Robinson, first appeared in Batman #1 in 1940 and has since become one of the most iconic villains in comic book history, symbolizing chaos and anarchy. His character has been adapted into various media, including films, television shows, and video games, captivating audiences for decades.",
      "image": null
    }
  },
  {
    "id": 103,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Second Director of NASA. Director of Apollo Mission. JWST.",
      "image": "images/q103_pexels.jpg"
    },
    "answer": {
      "text": "Janes Webb.",
      "image": null
    },
    "funda": {
      "text": "James Webb served as NASA's administrator from 1961 to 1968 and played a crucial role in the Apollo program, which aimed to land humans on the Moon. The James Webb Space Telescope, named in his honor, is designed to observe the universe's first galaxies and study the formation of stars and planets.",
      "image": null
    }
  },
  {
    "id": 104,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Law to ban Spanking of kids. Capital is made of 14 islands. Medicine, Chemistry, Physics and Literature, except peace.",
      "image": "images/q104_pexels.jpg"
    },
    "answer": {
      "text": "Sweden.",
      "image": null
    },
    "funda": {
      "text": "Sweden was the first country to ban corporal punishment in 1979, setting a precedent that influenced child protection laws worldwide. The capital, Stockholm, is renowned for its stunning archipelago and is often referred to as the \"Venice of the North.\"",
      "image": null
    }
  },
  {
    "id": 105,
    "topic": "sports",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "In Basketball, once a team gains control of the ball it has __ seconds to put up a legal shot.",
      "image": "images/q105_pexels.jpg"
    },
    "answer": {
      "text": "24.",
      "image": null
    },
    "funda": {
      "text": "The 24-second shot clock was introduced in the NBA in 1954 to increase the pace of the game and prevent teams from stalling, revolutionizing basketball strategy and gameplay. This rule has since been adopted in various professional and international leagues worldwide.",
      "image": null
    }
  },
  {
    "id": 106,
    "topic": "politics",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "] This is a special art installation that is displayed for a very special purpose, created by Badsheer Mohammad at Qatar. What purpose?",
      "image": "images/q106_pexels.jpg"
    },
    "answer": {
      "text": "Memorial for children who have died in Gaza. It is exactly 15,000 dolls, a tribute to the 16,400 children who lost their lives in the conflict.",
      "image": null
    },
    "funda": {
      "text": "The installation, known as \"The Dolls of Gaza,\" serves as a poignant reminder of the human cost of conflict and aims to raise awareness and foster dialogue about the impact of war on innocent lives, particularly children. Art installations like this often blend creativity with activism, pushing societal boundaries and encouraging empathy through visual storytelling.",
      "image": null
    }
  },
  {
    "id": 107,
    "topic": "general",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "The Norwegian Erik the Red, who was then in exile for murder, discovered this country/land and named it in an attractive way to make it sound like a great place to live and attract settlers. How is this land known as now?",
      "image": "images/q107_pexels.jpg"
    },
    "answer": {
      "text": "Greenland.",
      "image": "images/q107_wiki.jpg"
    },
    "funda": {
      "text": "Greenland is an autonomous territory of the Kingdom of Denmark and is the largest of the kingdom's three constituent parts by land area, the others being Denmark proper and the Faroe Islands.",
      "image": null
    }
  },
  {
    "id": 108,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The Bheel and Bhilala tribal people are excellent archers, they belong to the Alirajpur district of Madhya Pradesh. They practice archery from the age of 6-7. What is famous about their archery technique?",
      "image": "images/q108_pexels.jpg"
    },
    "answer": {
      "text": "They do not use their thumbs in archery, because they believe that they are descendants of Ekalavya, the legendary outcast who sacrificed his thumb for his guru, Dronacharya.",
      "image": null
    },
    "funda": {
      "text": "Ekalavya's story is a significant part of the Mahabharata, symbolizing dedication and the lengths one might go to for mastery and respect in the face of societal obstacles. The Bheel and Bhilala tribes' thumb-free archery technique not only reflects their cultural heritage but also serves as a living tribute to Ekalavya's sacrifice and skill.",
      "image": null
    }
  },
  {
    "id": 109,
    "topic": "politics",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "On October 5, 1988, the import of this novel was banned. The novel was not available for sale in India. 38 years and I month later, in November 5, 2024, the ban was lifted by an order of the Delhi High Court.",
      "image": "images/q109_pexels.jpg"
    },
    "answer": {
      "text": "The novel is 'Satanic Verses' by Salman Rushdie, and the ban was lifted because the High Court could not find any notification of the initial ban!",
      "image": null
    },
    "funda": {
      "text": "'Satanic Verses' sparked widespread controversy and protests upon its release, leading to a fatwa calling for Rushdie's death issued by Iran's Ayatollah Khomeini, which significantly impacted freedom of expression debates worldwide. The novel's themes of identity, religion, and cultural conflict continue to resonate in discussions about literature and censorship today.",
      "image": null
    }
  },
  {
    "id": 110,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "As you can clearly see here, both rowers have achieved the same time. However, one rower is given gold while the other is given silver. With reference to rowing in particular, why is this so?",
      "image": "images/q110_pexels.jpg"
    },
    "answer": {
      "text": "A bowball is a ball at the tip of the boat. The race was decided by Omega's photo finish system, deciding that Drisdale had won by half a bowball.",
      "image": null
    },
    "funda": {
      "text": "In rowing, the bowball is crucial for determining the winner in close races, as it is the part of the boat that crosses the finish line first, emphasizing the importance of precision in timing and measurement technology. The use of advanced photo finish systems has revolutionized how races are judged, allowing for accurate results even in the tightest competitions.",
      "image": null
    }
  },
  {
    "id": 111,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Combat-18 is a neo-Nazi terrorist organization that was founded in 1992. It originated in the United Kingdom and it spread to the US, Canada and Germany. They killed numerous immigrants and nonwhites. Why is the organization called Combat-18?",
      "image": "images/q111_pexels.jpg"
    },
    "answer": {
      "text": "Adolf Hitler. A is the 1st letter of the alphabet (1), and H is the eighth letter (8). Combining the initials gives 18.",
      "image": null
    },
    "funda": {
      "text": "The number 18 is often used by white supremacist groups as a symbol of Adolf Hitler's initials, and this numerical representation is part of a broader practice of using coded language and symbols to communicate their ideology. This practice is common among extremist groups to evade law enforcement and mainstream scrutiny while promoting their beliefs.",
      "image": null
    }
  },
  {
    "id": 112,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "https://www. youtube. The dog is easy.",
      "image": "images/q112_pexels.jpg"
    },
    "answer": {
      "text": "Electric Eel.",
      "image": "images/q112_wiki.jpg"
    },
    "funda": {
      "text": "The electric eels are a genus, Electrophorus, of neotropical freshwater fish from South America in the family Gymnotidae, of which they are the only members of the subfamily Electrophorinae.",
      "image": null
    }
  },
  {
    "id": 113,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Codename: Phoenix Spiritual successor to Netscape navigator. Mozilla Community browser. ID.",
      "image": "images/q113_pexels.jpg"
    },
    "answer": {
      "text": "Mozilla Firefox.",
      "image": "images/q113_wiki.jpg"
    },
    "funda": {
      "text": "Mozilla Firefox, or simply Firefox, is a free and open-source web browser developed by the Mozilla Foundation and its subsidiary, the Mozilla Corporation.",
      "image": null
    }
  },
  {
    "id": 114,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "ID the character.",
      "image": "images/q114_pexels.jpg"
    },
    "answer": {
      "text": "KING COBRA",
      "image": null
    },
    "funda": {
      "text": "King Cobra is the world's longest venomous snake, capable of reaching lengths of up to 18 feet. It primarily inhabits forests and grasslands in Southeast Asia and is known for its potent neurotoxic venom, which can cause respiratory failure in humans.",
      "image": null
    }
  },
  {
    "id": 115,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "ID the largest mammal at the tallest altitude.",
      "image": "images/q115_pexels.jpg"
    },
    "answer": {
      "text": "Alaskan Mountain Goat.",
      "image": null
    },
    "funda": {
      "text": "The Alaskan Mountain Goat, known for its impressive climbing abilities, can thrive at altitudes exceeding 13,000 feet in the rugged terrains of North America's coastal mountains. These goats have specialized hooves that provide excellent traction on steep, rocky surfaces.",
      "image": null
    }
  },
  {
    "id": 116,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "This is an American investment gold coin, named after an American animal. ID the name of the coin.",
      "image": "images/q116_pexels.jpg"
    },
    "answer": {
      "text": "American Buffalo.",
      "image": "images/q116_wiki.jpg"
    },
    "funda": {
      "text": "The American bison, commonly known as the American buffalo, or simply buffalo, is a species of bison that is endemic to North America.",
      "image": null
    }
  },
  {
    "id": 117,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "ID this animal.",
      "image": "images/q117_pexels.jpg"
    },
    "answer": {
      "text": "Horned toad.",
      "image": "images/q117_wiki.jpg"
    },
    "funda": {
      "text": "Phrynosoma, whose members are known as the horned lizards, horny toads, or horntoads, is a genus of North American lizards and the type genus of the family Phrynosomatidae.",
      "image": null
    }
  },
  {
    "id": 118,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Why are these species popularly called 'killer whales'?",
      "image": "images/q118_pexels.jpg"
    },
    "answer": {
      "text": "There was a common misconception that they killed whales, hence earning them the name 'Whale Killers'. Over time, 'whale killer' became 'killer whale'.",
      "image": null
    },
    "funda": {
      "text": "Killer whales, or orcas, are actually the largest members of the dolphin family and are known for their complex social structures and intelligence. They are apex predators, capable of hunting a variety of marine animals, including seals, sharks, and even whales, which contributes to their fearsome reputation.",
      "image": null
    }
  },
  {
    "id": 119,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "If this tree were to become extinct, the entire species of the koala bear would be wiped out because their diet consists exclusively of this plant.",
      "image": "images/q119_pexels.jpg"
    },
    "answer": {
      "text": "Eucalyptus.",
      "image": "images/q119_wiki.jpg"
    },
    "funda": {
      "text": "Eucalyptus is a genus of more than 700 species of flowering plants in the family Myrtaceae.",
      "image": null
    }
  },
  {
    "id": 120,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "THEME: Misnomers. Identify the correct animal/species for the following: a. Electric Eel, b. Firefox, c. King Cobra, d. Alaskan Mountain Goat, e. American Buffalo, f. Horned Toad, g. Orca, h. Koala bear.",
      "image": "images/q120_pexels.jpg"
    },
    "answer": {
      "text": "a. Fish, b. Red Panda (neither panda nor fox), c. Mamba family (Nadja reptiles), d. Antelope, e. Bison, f. Lizard, g. Dolphin, h. Marsupial.",
      "image": null
    },
    "funda": {
      "text": "The electric eel is actually a knifefish and can generate electric shocks of up to 600 volts for hunting and self-defense. The red panda is more closely related to raccoons than to giant pandas, despite sharing part of its name. The king cobra is the longest venomous snake in the world and can reach lengths of over 18 feet.",
      "image": null
    }
  },
  {
    "id": 121,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "The term 'tank' was first used in the military in 1915 to describe armored vehicles that were being developed during World War I. Why are these vehicles called 'tanks'?",
      "image": "images/q121_pexels.jpg"
    },
    "answer": {
      "text": "The term 'tank' was a code word to refer to the vehicles; a soldier once called it a 'tank' because it looked like a water tank, and British officials decided it was a good choice for a codename.",
      "image": null
    },
    "funda": {
      "text": "The use of the term 'tank' as a codename was part of a broader strategy to maintain secrecy about the development of these new armored vehicles, which were intended to break the stalemate of trench warfare. This clever naming helped to obscure the true purpose of the vehicles from enemy spies during World War I.",
      "image": null
    }
  },
  {
    "id": 122,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "Sake Dean Mohammed, a British Indian traveler, surgeon, soldier and entrepreneur introduced which 'beauty concept' in England in 1814?",
      "image": "images/q122_pexels.jpg"
    },
    "answer": {
      "text": "Shampoo.",
      "image": "images/q122_wiki.jpg"
    },
    "funda": {
      "text": "Shampoo is a hair care product, typically in the form of a viscous liquid, that is formulated to be used for cleaning (scalp) hair.",
      "image": null
    }
  },
  {
    "id": 123,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What significant contribution did David Attenborough have to the world of tennis?",
      "image": "images/q123_pexels.jpg"
    },
    "answer": {
      "text": "He is responsible for the yellow color of the tennis ball. When he introduced the shift to color television in the 1960s, the color of the ball was difficult to see clearly against the background. He suggested to Wimbledon that the balls should be colored yellow; they ignored the suggestion until decades later, but other tournament organizers had adopted the yellow ball by then.",
      "image": null
    },
    "funda": {
      "text": "The introduction of the yellow tennis ball not only improved visibility for players and viewers but also became a standard across the sport, influencing the design of sports equipment in various other disciplines. This change coincided with the rise of televised sports, which transformed how audiences engaged with athletic events.",
      "image": null
    }
  },
  {
    "id": 124,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Connect the two visuals.",
      "image": "images/q124_pexels.jpg"
    },
    "answer": {
      "text": "The picture on the left is Morse code, while the picture on the right is a painting by Samuel Morse. Samuel Morse is the connection.",
      "image": null
    },
    "funda": {
      "text": "Samuel Morse was not only a pioneer in developing the Morse code communication system but also a notable painter, known for his historical works and as one of the founders of the National Academy of Design in the United States. His dual contributions to art and communication have left a lasting legacy in both fields.",
      "image": null
    }
  },
  {
    "id": 125,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "https://www. youtube.",
      "image": "images/q125_pexels.jpg"
    },
    "answer": {
      "text": "OpenAI's Sora.",
      "image": null
    },
    "funda": {
      "text": "OpenAI's Sora is a conversational AI designed to assist with various tasks and provide information, showcasing advancements in natural language processing and machine learning. It reflects the growing trend of integrating AI into everyday applications to enhance user experience and productivity.",
      "image": null
    }
  },
  {
    "id": 126,
    "topic": "current-affairs",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Europa clipper is a space probe by NASA to study Europa, a Galilean moon of Jupiter. It was launched on October 14, 2024. Why is the mission patch showing a sail ship?",
      "image": "images/q126_pexels.jpg"
    },
    "answer": {
      "text": "These sail ships, in olden-day America, were called Clippers.",
      "image": null
    },
    "funda": {
      "text": "The term \"clipper\" originally referred to fast sailing ships from the mid-19th century, designed for speed and efficiency, which played a significant role in transatlantic trade. The name evokes the spirit of exploration and discovery, mirroring the mission's aim to explore the icy moon Europa for signs of potential life.",
      "image": null
    }
  },
  {
    "id": 127,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "This character first appeared in the 1940 Disney animated feature film Fantasia. He is the powerful sorcerer who was the mentor of Mickey Mouse. What is special about his name?",
      "image": "images/q127_pexels.jpg"
    },
    "answer": {
      "text": "His name is Yen Sid, which is Disney spelled backwards. He is also popularly called Merlin.",
      "image": null
    },
    "funda": {
      "text": "Yen Sid's character design was influenced by the traditional depiction of wizards in Western folklore, and he is often associated with the archetype of the wise old mentor in fantasy narratives. The name Yen Sid also reflects Walt Disney's playful approach to creativity, often embedding clever wordplay in his works.",
      "image": null
    }
  },
  {
    "id": 128,
    "topic": "current-affairs",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "India's GSAT N2, a communication satellite was successfully launched by which organization recently?",
      "image": "images/q128_pexels.jpg"
    },
    "answer": {
      "text": "SpaceX.",
      "image": "images/q128_wiki.jpg"
    },
    "funda": {
      "text": "Space Exploration Technologies Corporation, doing business as SpaceX, is a private American aerospace and artificial intelligence company headquartered at the Starbase development site in Starbase, Texas.",
      "image": null
    }
  },
  {
    "id": 129,
    "topic": "sports",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "This is a different kind of appeal that is recently gaining popularity in cricket. Identify.",
      "image": "images/q129_pexels.jpg"
    },
    "answer": {
      "text": "Celebrappeal.",
      "image": null
    },
    "funda": {
      "text": "Celebrappeal is a term that combines \"celebration\" and \"appeal,\" referring to players appealing for a decision based on their own enthusiastic celebration rather than solely on the actual play. This trend reflects a growing influence of social media and entertainment culture in sports, where player expressions can sway umpires and fans alike.",
      "image": null
    }
  },
  {
    "id": 130,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "99% Fun and 1% land is the Tourism tagline of which Indian Union Territory?",
      "image": "images/q130_pexels.jpg"
    },
    "answer": {
      "text": "Lakshadweep.",
      "image": "images/q130_wiki.jpg"
    },
    "funda": {
      "text": "Lakshadweep is a union territory of India.",
      "image": null
    }
  },
  {
    "id": 131,
    "topic": "sports",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "He studied Computer Engineering at SSN Chennai. Later he joined India Cements as Senior Manager, Costs Department. 500 test wickets - record achieved in 2024.",
      "image": "images/q131_pexels.jpg"
    },
    "answer": {
      "text": "Ravichandran Ashwin.",
      "image": "images/q131_wiki.jpg"
    },
    "funda": {
      "text": "Ravichandran Ashwin is an Indian cricketer.",
      "image": null
    }
  },
  {
    "id": 132,
    "topic": "politics",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Atishi Marlena, the AAP member with communist leanings, has recently become the Chief Minister of Delhi, replacing Arvind Kejriwal after his arrest. However, her name was changed from Atishi Singh to Atishi Marlena Singh. The surname 'Marlena' is derived from the names of two \\",
      "image": "images/q132_pexels.jpg"
    },
    "answer": {
      "text": "Karl MARx and Vladimir LENin, the founding fathers of communism.",
      "image": null
    },
    "funda": {
      "text": "Karl Marx and Vladimir Lenin are pivotal figures in the development of communist theory, with Marx's \"The Communist Manifesto\" and Lenin's adaptation of Marxism significantly influencing political movements worldwide. Their ideologies have shaped various governments and revolutions, making them central to 20th-century history.",
      "image": null
    }
  },
  {
    "id": 133,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "In volleyball, the ball is hit back and forth between the two teams until it touches the ground. What is the maximum number of touches that a team may touch the ball before it has to cross the net to the other team?",
      "image": "images/q133_pexels.jpg"
    },
    "answer": {
      "text": "Three.",
      "image": null
    },
    "funda": {
      "text": "3 (three) is a number, numeral and digit.",
      "image": null
    }
  },
  {
    "id": 134,
    "topic": "sports",
    "difficulty": "easy",
    "type": "progressive",
    "question": {
      "text": "Largest man-made object in history. Size: I football field. 'Man's Greatest Achievement'. ID.",
      "image": "images/q134_pexels.jpg"
    },
    "answer": {
      "text": "The International Space Station. \\u2014-",
      "image": "images/q134_wiki.jpg"
    },
    "funda": {
      "text": "The International Space Station (ISS) is a space station in low Earth orbit (LEO).",
      "image": null
    }
  },
  {
    "id": 135,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "At Lake Natron in Tanzania, an interesting phenomenon occurs that is unique to its location. Due to the high presence of sodium carbonate and calcium bicarbonate, the birds that plunge into the lake become famous attractions, like something out of Harry Potter movies. What happens to the birds?",
      "image": "images/q135_pexels.jpg"
    },
    "answer": {
      "text": "They are <strong>calcified</strong> â€” their bodies are perfectly preserved and hardened into stone-like statues by the sodium carbonate. (Often compared to the Basilisk from Harry Potter).",
      "image": null
    },
    "funda": {
      "text": "Lake Natron has a pH level as high as 12, making it one of the most inhospitable environments for wildlife, yet it is also a breeding ground for flamingos that thrive in its extreme conditions. The calcification process preserves the birds in a way that highlights the stark contrast between life and the harshness of their environment.",
      "image": null
    }
  },
  {
    "id": 136,
    "topic": "history",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Follow-up: This phenomenon (at Lake Natron) involves a chemical that was known to Ancient Egyptians. They used it to create a very special kind of artifact that has much folklore today. Which kind of artifact?",
      "image": "images/q136_pexels.jpg"
    },
    "answer": {
      "text": "(Mummification).",
      "image": "images/q136_wiki.jpg"
    },
    "funda": {
      "text": "The ancient Egyptians used natron (sodium carbonate), the same chemical found in Lake Natron, to dry out and preserve bodies. The lake is actually named after this chemical.",
      "image": null
    }
  },
  {
    "id": 137,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Adventures of Alice Laselles by Alexandrina Victoria aged 10 \\u00be\\u2019 is a book published in 2015 by the RCT. As noted in a review of the book, \\u201cit\\u2019s not quite earth-shattering stuff.\\u201d If it wasn\\u2019t earth shattering stuff, then why was this book published in the first place?",
      "image": "images/q137_pexels.jpg"
    },
    "answer": {
      "text": "X - Sambu, Y - Shikari Shambu. India Book House is the distributor of Tinkle.",
      "image": null
    },
    "funda": {
      "text": "Tinkle is a popular Indian comic magazine launched in 1980, known for its engaging stories and characters like Shikari Shambu and Suppandi, aiming to entertain and educate young readers. The magazine has become a cultural staple in India, fostering a love for reading among children for decades.",
      "image": null
    }
  },
  {
    "id": 138,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "While in the US, this day holds a rich culture and history of protest (with figures like Coretta Scott King using traditionalist rhetoric to appeal to the masses for radical and liberationist policies), other countries have had an openly conservative view around the occasion: France began honouring the day after noticing alarmingly low birth rates, and Germany declared it a national holiday under the Nazis with their rhetoric revolving around the production of more Aryans. What celebration is this?",
      "image": "images/q138_pexels.jpg"
    },
    "answer": {
      "text": "MOTHER'S DAY",
      "image": null
    },
    "funda": {
      "text": "Mother's Day has roots in ancient festivals, such as the Greek spring celebration honoring Rhea, the mother of the gods, and the Roman festival of Hilaria, which celebrated Cybele, the mother of the gods. The modern version was popularized in the early 20th century by Anna Jarvis, who campaigned for a dedicated day to honor mothers after her own mother's death.",
      "image": null
    }
  },
  {
    "id": 139,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "This gentleman's most famous work from 1915 was initially meant as a cold joke about his friend: Both were fond of hiking together but his friend often got confused and couldn't make up his mind while on the walk: Later, when some college students came to know of the 2 work they found some serious meaning that has since made all the difference. What oft-quoted piece of work is this?",
      "image": "images/q139_pexels.jpg"
    },
    "answer": {
      "text": "Robert Frost (1874-1963)",
      "image": null
    },
    "funda": {
      "text": "Robert Frost is often regarded as one of America's greatest poets, and his work frequently reflects themes of nature, rural life, and human emotion, making him a prominent figure in 20th-century literature. His poem \"The Road Not Taken\" has been widely interpreted and analyzed, often serving as a metaphor for choices and individuality in life.",
      "image": null
    }
  },
  {
    "id": 141,
    "topic": "politics",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "In early 2019 when they made their debut on Instagram, which caused a huge controversy when it was revealed they had been reassigned the handle of a fan of Reading FC from Sussex: However around a year later this duo exited from the 4 platform, among other things",
      "image": "images/q141_pexels.jpg"
    },
    "answer": {
      "text": "The DUKE and DUCHESS of SUSSEX",
      "image": null
    },
    "funda": {
      "text": "The Duke and Duchess of Sussex, Prince Harry and Meghan Markle, stepped back from royal duties in early 2020, which marked a significant shift in the British monarchy's modern approach to royal roles and public engagement. Their departure also sparked discussions about mental health, media scrutiny, and the balance between personal freedom and royal expectations.",
      "image": null
    }
  },
  {
    "id": 142,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "In 2009 the largest machine on earth, then newly launched, shut down abruptly during testing because of overheating: On inspection the staff found the cause was a bird finding itself a good spot for lunch while interfering with the power supply. 5 What food item did it stick behind, probably apt if we look at stereotypes of the general geography?",
      "image": "images/q142_pexels.jpg"
    },
    "answer": {
      "text": "A bit of a baquette",
      "image": null
    },
    "funda": {
      "text": "The incident occurred at the Large Hadron Collider (LHC) in Switzerland, where the bird's choice of a baguette humorously highlighted the local culture, as France and Switzerland are known for their rich culinary traditions, particularly their bread. The LHC is designed to explore fundamental questions about the universe, making this unexpected lunch break a quirky footnote in scientific history.",
      "image": null
    }
  },
  {
    "id": 143,
    "topic": "general",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "The Pirates of Penzance is a comic opera by Sullivan & Gilbert: It depicts the trials of a young orphan pirate apprentice: In the opera, he gets freed after serving the pirates for 21 years, but later, on getting info about his childhood, he jumps to the conclusion that more than six decades of the indenture period still remain contractually. 0. 6 What specific information about himself does he get to know?",
      "image": "images/q143_pexels.jpg"
    },
    "answer": {
      "text": "fout, ohpour thepirate sherr;",
      "image": null
    },
    "funda": {
      "text": "The young pirate apprentice, Frederic, discovers that he was born on February 29, making him technically only five years old in terms of actual birthdays, despite having served 21 years, which leads to his misunderstanding of his indenture. This clever twist plays on the theme of time and its perception, a common motif in Gilbert and Sullivan's works.",
      "image": null
    }
  },
  {
    "id": 144,
    "topic": "general",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "When 3 scientists from Birmingham decided to look into the life of a suave gentleman, they calculated an average weekly intake of 92. 5 units, from 14 primary sources of information: Q. According to their study in the BMJ, this level of intake should have had an impact on his physical and sexual life, including a 7 case of intention tremor due to lesions in the brain: Thus, a specific request made by this individual might have originated due to the inability to move his hands properly: What preference was this study trying to explain?",
      "image": "images/q144_pexels.jpg"
    },
    "answer": {
      "text": "Shaken, not stirred",
      "image": "images/q144_wiki.jpg"
    },
    "funda": {
      "text": "\"Shaken, not stirred\" is how Ian Fleming's fictional British Secret Service agent James Bond prefers his martini cocktail.",
      "image": null
    }
  },
  {
    "id": 145,
    "topic": "history",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "This work remains its creator's most popular verse, resurrected by a club of rebel school-goers almost one-and-a-quarter century later in the late 1980s. Q. Interestingly, the creator had never gotten a direct taste of the exemplary leadership of the subject, instead relying on 8 an eyewitness account of the fateful night's events by their homosexual partner to evoke the required emotional response. Which work is this question about?",
      "image": "images/q145_pexels.jpg"
    },
    "answer": {
      "text": "Hedetnhsokeht",
      "image": null
    },
    "funda": {
      "text": "The work in question is \"Hedda Gabler\" by Henrik Ibsen, a play that explores themes of individuality and societal constraints, and is often regarded as a precursor to modern feminist literature. Ibsen's portrayal of complex female characters has influenced countless writers and sparked discussions on gender roles since its debut in 1891.",
      "image": null
    }
  },
  {
    "id": 146,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "A large number of doctors and scientists have joined together under the UN to counter misinformation on social media and illuminate people on the safety and effectiveness of vaccines: Q. According to them, the 4-letter name of the program represents the divine ring of connected science around the globe. 9 Name this program:",
      "image": "images/q146_pexels.jpg"
    },
    "answer": {
      "text": "HALO",
      "image": null
    },
    "funda": {
      "text": "The HALO program aims to create a unified front against vaccine misinformation by leveraging the expertise of health professionals worldwide, emphasizing the importance of accurate information in public health. The name \"HALO\" symbolizes a protective barrier of knowledge and trust surrounding the global health community.",
      "image": null
    }
  },
  {
    "id": 147,
    "topic": "politics",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "Recent years have seen the emergence of a far-right anti-democratic group named the Bolsonaristas, who have disrupted healthcare and targeted Congress proceedings in their country: Their appropriation of an iconic national symbol of pride has led to massive outcry in the general public What item is this, one of the few worldwide to carry affectionate sobriquets instead of formal titles?",
      "image": "images/q147_pexels.jpg"
    },
    "answer": {
      "text": "QHMST)",
      "image": null
    },
    "funda": {
      "text": "The QHMST, or the Queen's House, is a historic building in Greenwich, London, known for its stunning architecture and role in maritime history, serving as a royal residence and a museum. It is often affectionately referred to simply as \"the Queen's House,\" highlighting its significance in British culture and heritage.",
      "image": null
    }
  },
  {
    "id": 148,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "The nazm Zulmat ko turns around the meaning of the subject's name and makes him a symbol of darkness and ignorance. Which personality, whose \\",
      "image": "images/q148_pexels.jpg"
    },
    "answer": {
      "text": "AZ QUOTES",
      "image": null
    },
    "funda": {
      "text": "AZ Quotes is a popular online database that compiles quotes from various authors, celebrities, and public figures, offering insights into their thoughts and philosophies. The site is widely used for inspiration and reference in writing and speeches.",
      "image": null
    }
  },
  {
    "id": 149,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "In One Night in Miami, Malcolm X plays a song he heard on the radio a few months ag0, to confront Sam Cooke. Referring to the beginning of the song, he says, \\",
      "image": "images/q149_pexels.jpg"
    },
    "answer": {
      "text": "BLOWIN' IN THE WIND BOB DYLAN",
      "image": null
    },
    "funda": {
      "text": "\"Blowin' in the Wind,\" written by Bob Dylan in 1962, became an anthem for the civil rights movement, posing rhetorical questions about peace, freedom, and justice. The song's poignant lyrics have made it one of the most covered songs in music history, resonating across generations.",
      "image": null
    }
  },
  {
    "id": 150,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "This particular piece of art is one of the oldest known depictions of a heavenly body from mythology and has its place of prominence for all to see. However, it is probably a misnomer as the place of origin, evident in the full name, denotes that the actual name used should have been of an analogous lovely entity. Explain the misnomer associated with this work.",
      "image": "images/q150_pexels.jpg"
    },
    "answer": {
      "text": "Venus de Milo should have been named Aphrodite due to its Greek origins",
      "image": null
    },
    "funda": {
      "text": "The Venus de Milo, discovered in 1820 on the island of Milos, is celebrated for its exquisite representation of the goddess of love, yet its name reflects the Roman equivalent, Venus, rather than the Greek origin, Aphrodite, highlighting the cultural blending of ancient civilizations. This iconic statue is also notable for its missing arms, which have sparked much speculation and artistic interpre",
      "image": null
    }
  },
  {
    "id": 151,
    "topic": "politics",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "In an article on the West Bengal assembly elections titled The The Telegraph talks about the state's long-running tryst with election violence, exploring crude bombs wrapped in jute rope being used since as far back as the late 60s. Q. What was the title of the article, a pun a single letter away from a 15 health fad often used by weight reduction enthusiasts?",
      "image": "images/q151_pexels.jpg"
    },
    "answer": {
      "text": "Epaper",
      "image": null
    },
    "funda": {
      "text": "E-paper refers to digital versions of newspapers, allowing readers to access news online, which has become increasingly popular as print media declines. The transition to e-paper has also contributed to the environmental movement by reducing paper waste.",
      "image": null
    }
  },
  {
    "id": 152,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Endemic to Japan, what is the fiendish name given to this variant of a national symbol from across the ocean, due to the curly horn-like stigmas of the flower?",
      "image": "images/q152_pexels.jpg"
    },
    "answer": {
      "text": "Devil Maple",
      "image": null
    },
    "funda": {
      "text": "The Devil Maple, known scientifically as Acer palmatum, is a popular ornamental tree in Japanese gardens, celebrated for its stunning fall foliage and unique leaf shapes. Its distinctive curly stigmas give it a mythical appearance, contributing to its intriguing name.",
      "image": null
    }
  },
  {
    "id": 153,
    "topic": "general",
    "difficulty": "easy",
    "type": "grid-flip",
    "question": {
      "text": "THREE CLUES QUIZ VAULT GRID: MISC \\n - WRONG - RIGHT",
      "image": "images/q153_pexels.jpg"
    },
    "answer": {
      "text": "Correct: QUIZ",
      "image": null
    },
    "funda": {
      "text": "'Nodadigal' (Nomads) is likely a distractor in this context.",
      "image": null
    }
  },
  {
    "id": 154,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "PROPOSED SPORTS FOR THE LOS ANGELES OLYMPICS 2028 \\n \\n1. Flag Football - RIGHT \\n2. Netball - WRONG \\n3. Lacrosse - RIGHT \\n4. Kabaddi - WRONG \\n5. Squash - RIGHT \\n6. Baseball - RIGHT",
      "image": "images/q154_pexels.jpg"
    },
    "answer": {
      "text": "Correct: PROPOSED",
      "image": null
    },
    "funda": {
      "text": "Kabaddi was only played as a demonstration match in the 1936 Berlin Olympics under Hitler.",
      "image": null
    }
  },
  {
    "id": 155,
    "topic": "history",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "ENGLISH WORDS FROM INDIAN LANGUAGES \\n \\n1. Calico - RIGHT \\n2. Ketchup - WRONG \\n3. Catamaran - RIGHT \\n4. Mulligatawny - RIGHT \\n5. Bamboo - RIGHT \\n6. Karaoke - WRONG",
      "image": "images/q155_pexels.jpg"
    },
    "answer": {
      "text": "Correct: ENGLISH",
      "image": null
    },
    "funda": {
      "text": "Calico (Calicut), Catamaran (kattu maram), Mulligatawny (milagai thanneer). Ketchup is Chinese, Karaoke is Japanese.",
      "image": null
    }
  },
  {
    "id": 156,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "FLOWERS THAT BLOOM AT NIGHT \\n \\n1. Hibiscus - WRONG \\n2. Dragonfruit flower - RIGHT \\n3. Rose - WRONG \\n4. Tube rose - RIGHT \\n5. Brahma kamala - RIGHT \\n6. Parijata - RIGHT",
      "image": "images/q156_pexels.jpg"
    },
    "answer": {
      "text": "Correct: FLOWERS",
      "image": null
    },
    "funda": {
      "text": "Hibiscus and Roses are typical day-blooming flowers.",
      "image": null
    }
  },
  {
    "id": 157,
    "topic": "general",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "CARS FROM MARUTI/SUZUKI \\n \\n1. Fronx - RIGHT \\n2. Baleno - RIGHT \\n3. Jimny - RIGHT \\n4. Celerio - RIGHT \\n5. Bolero - WRONG \\n6. Elevate - WRONG",
      "image": "images/q157_pexels.jpg"
    },
    "answer": {
      "text": "Correct: CARS",
      "image": null
    },
    "funda": {
      "text": "Bolero is by Mahindra Motors, Elevate is by Honda.",
      "image": null
    }
  },
  {
    "id": 158,
    "topic": "general",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "This 20-07 movie is a satire on American life. Its tagline reads, 'See our family, and feel better about yours!' \\n \\nIdentify the movie.",
      "image": "images/q158_pexels.jpg"
    },
    "answer": {
      "text": "<strong>The Simpsons Movie</strong> (2007).",
      "image": null
    },
    "funda": {
      "text": "The movie brought the long-running TV family to the big screen for the first time.",
      "image": null
    }
  },
  {
    "id": 159,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "In astronomy, this word is used to refer to the amount of deviation of a body from a perfect circle. In common parlance, it describes someone weird or odd. \\n \\nIdentify the word.",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "Orbit eccentricity measures how much an orbit deviates from being circular.",
      "image": null
    }
  },
  {
    "id": 160,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "These nomadic animals' name originates from the French verb meaning 'to move about'. The last of these species, named Martha, died in 1914. \\n \\nIdentify the extinct species.",
      "image": "images/q160_pexels.jpg"
    },
    "answer": {
      "text": "pigeons</strong>.",
      "image": "images/q160_wiki.jpg"
    },
    "funda": {
      "text": "They were once the most abundant bird in North America, but were hunted to extinction.",
      "image": null
    }
  },
  {
    "id": 161,
    "topic": "politics",
    "difficulty": "easy",
    "type": "progressive",
    "question": {
      "text": "The Legislative Assembly of Kerala recently voted to rename their state. What is the proposed new name?",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "The name reflects the language and cultural heritage of the region (Malayalam).",
      "image": null
    }
  },
  {
    "id": 162,
    "topic": "sports",
    "difficulty": "medium",
    "type": "progressive",
    "question": {
      "text": "Mrs. Suman Kumari is the first of her kind in the Indian Armed Forces. She is the first female Sniper to be deployed into action. What category of soldiers does Mrs. Suman Kumari belong to?",
      "image": null
    },
    "answer": {
      "text": "",
      "image": null
    },
    "funda": {
      "text": "She is a in the Border Security Force (BSF) and completed her sniper course in March 2024.",
      "image": null
    }
  },
  {
    "id": 140,
    "topic": "wildlife",
    "difficulty": "hard",
    "type": "progressive",
    "question": {
      "text": "Scientists have researched strategies to enable humans to survive long-range space missions. One key involves 'gene silencers' that regulate gene expression. By studying how some species use these genetic switches for reversible metabolic depression, researchers hope to eventually induce a similar state in humans for deep space travel. What biological phenomenon is being discussed?",
      "image": "images/q140_pexels.jpg"
    },
    "answer": {
      "text": "(or Torpor</strong>).",
      "image": null
    },
    "funda": {
      "text": "Hibernation in mammals is regulated by microRNAs that suppress metabolic activity while protecting tissues from atrophy. Space agencies like NASA and ESA are investigating 'synthetic torpor' to reduce resource consumption and protect astronauts from radiation and muscle loss during multi-month journeys to planets like Mars.",
      "image": null
    }
  },
  {
    "id": 163,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the capital of Japan?",
      "image": "images/q163_pexels.jpg"
    },
    "answer": {
      "text": "Tokyo",
      "image": "images/q163_wiki.jpg"
    },
    "funda": {
      "text": "Tokyo is the world's most populous metropolitan area and the seat of the Emperor of Japan.",
      "image": null
    }
  },
  {
    "id": 164,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the closest planet to the Sun?",
      "image": "images/q164_pexels.jpg"
    },
    "answer": {
      "text": "Mercury",
      "image": null
    },
    "funda": {
      "text": "Mercury is the smallest planet in the solar system and has no atmosphere to retain heat, leading to extreme temperature swings.",
      "image": null
    }
  },
  {
    "id": 165,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "In which year did the French Revolution begin?",
      "image": "images/q165_pexels.jpg"
    },
    "answer": {
      "text": "1789",
      "image": "images/q165_wiki.jpg"
    },
    "funda": {
      "text": "The revolution began with the Storming of the Bastille on July 14, 1789.",
      "image": null
    }
  },
  {
    "id": 166,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the largest mammal in the world?",
      "image": "images/q166_pexels.jpg"
    },
    "answer": {
      "text": "Blue Whale",
      "image": "images/q166_wiki.jpg"
    },
    "funda": {
      "text": "Blue whales can grow up to 30 meters long and weigh as much as 190 tons.",
      "image": null
    }
  },
  {
    "id": 167,
    "topic": "politics",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Who was the first woman Prime Minister of the United Kingdom?",
      "image": "images/q167_pexels.jpg"
    },
    "answer": {
      "text": "Margaret Thatcher",
      "image": "images/q167_wiki.jpg"
    },
    "funda": {
      "text": "Thatcher served from 1979 to 1990 and was known as the 'Iron Lady'.",
      "image": null
    }
  },
  {
    "id": 168,
    "topic": "cuisines",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which country is famous for the dish 'Paella'?",
      "image": "images/q168_pexels.jpg"
    },
    "answer": {
      "text": "Spain",
      "image": "images/q168_wiki.jpg"
    },
    "funda": {
      "text": "Paella originated in the Valencia region of Spain and is usually made with rice, saffron, and various proteins.",
      "image": null
    }
  },
  {
    "id": 169,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the largest desert in the world?",
      "image": "images/q169_pexels.jpg"
    },
    "answer": {
      "text": "Antarctic Desert",
      "image": null
    },
    "funda": {
      "text": "While most people think of sand, Antarctica is technically a desert because it receives very little precipitation.",
      "image": null
    }
  },
  {
    "id": 170,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the chemical symbol for Gold?",
      "image": "images/q170_pexels.jpg"
    },
    "answer": {
      "text": "Au",
      "image": null
    },
    "funda": {
      "text": "The symbol Au comes from the Latin word 'aurum', meaning 'shining dawn'.",
      "image": null
    }
  },
  {
    "id": 171,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who was the primary author of the United States Declaration of Independence?",
      "image": "images/q171_pexels.jpg"
    },
    "answer": {
      "text": "Thomas Jefferson",
      "image": "images/q171_wiki.jpg"
    },
    "funda": {
      "text": "Jefferson was a polymath who later served as the third President of the United States.",
      "image": null
    }
  },
  {
    "id": 172,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which bird is the only bird capable of flying backwards?",
      "image": "images/q172_pexels.jpg"
    },
    "answer": {
      "text": "Hummingbird",
      "image": "images/q172_wiki.jpg"
    },
    "funda": {
      "text": "Hummingbirds have a unique wing structure that allows them to hover and maneuver in all directions.",
      "image": null
    }
  },
  {
    "id": 173,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "In which sport is the term 'Love' used to represent a score of zero?",
      "image": "images/q173_pexels.jpg"
    },
    "answer": {
      "text": "Tennis",
      "image": null
    },
    "funda": {
      "text": "The term is thought to come from the French word 'l'oeuf', meaning 'the egg', which looks like a zero.",
      "image": null
    }
  },
  {
    "id": 174,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which is the smallest country in the world by land area?",
      "image": "images/q174_pexels.jpg"
    },
    "answer": {
      "text": "Vatican City",
      "image": null
    },
    "funda": {
      "text": "Vatican City is an independent city-state enclaved within Rome, Italy.",
      "image": null
    }
  },
  {
    "id": 175,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "How many bones are there in an adult human body?",
      "image": "images/q175_pexels.jpg"
    },
    "answer": {
      "text": "206",
      "image": null
    },
    "funda": {
      "text": "Infants are born with about 270 bones, some of which fuse together as they grow.",
      "image": null
    }
  },
  {
    "id": 176,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "The Magna Carta was signed by which English King in 1215?",
      "image": "images/q176_pexels.jpg"
    },
    "answer": {
      "text": "King John",
      "image": null
    },
    "funda": {
      "text": "The document established the principle that everyone, including the king, was subject to the law.",
      "image": null
    }
  },
  {
    "id": 177,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is a group of crows called?",
      "image": "images/q177_pexels.jpg"
    },
    "answer": {
      "text": "A murder",
      "image": null
    },
    "funda": {
      "text": "This poetic term dates back to the 15th century and is part of a tradition of unique collective nouns.",
      "image": null
    }
  },
  {
    "id": 178,
    "topic": "politics",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who is the longest-serving monarch in British history?",
      "image": "images/q178_pexels.jpg"
    },
    "answer": {
      "text": "Queen Elizabeth II",
      "image": null
    },
    "funda": {
      "text": "She reigned for 70 years and 214 days, from 1952 until her death in 2022.",
      "image": null
    }
  },
  {
    "id": 179,
    "topic": "cuisines",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "From which country does the 'Banh Mi' sandwich originate?",
      "image": "images/q179_pexels.jpg"
    },
    "answer": {
      "text": "Vietnam",
      "image": "images/q179_wiki.jpg"
    },
    "funda": {
      "text": "It is a fusion of Vietnamese ingredients and French baguette, introduced during the colonial period.",
      "image": null
    }
  },
  {
    "id": 180,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Which river is the longest in the world?",
      "image": "images/q180_pexels.jpg"
    },
    "answer": {
      "text": "Nile",
      "image": "images/q180_wiki.jpg"
    },
    "funda": {
      "text": "The Nile flows through 11 countries in Africa and is historically crucial for the development of Egypt.",
      "image": null
    }
  },
  {
    "id": 181,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What gas do plants absorb from the atmosphere for photosynthesis?",
      "image": "images/q181_pexels.jpg"
    },
    "answer": {
      "text": "Carbon Dioxide (CO2)",
      "image": null
    },
    "funda": {
      "text": "Plants use sunlight to convert CO2 and water into glucose and oxygen.",
      "image": null
    }
  },
  {
    "id": 182,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who was the first person to step on the Moon?",
      "image": "images/q182_pexels.jpg"
    },
    "answer": {
      "text": "Neil Armstrong",
      "image": null
    },
    "funda": {
      "text": "Armstrong famously said, 'That's one small step for [a] man, one giant leap for mankind'.",
      "image": null
    }
  },
  {
    "id": 183,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which land animal has the largest brain?",
      "image": "images/q183_pexels.jpg"
    },
    "answer": {
      "text": "Elephant",
      "image": "images/q183_wiki.jpg"
    },
    "funda": {
      "text": "Elephants are known for their high intelligence and long-term memory.",
      "image": null
    }
  },
  {
    "id": 184,
    "topic": "sports",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which country has won the most FIFA World Cups?",
      "image": "images/q184_pexels.jpg"
    },
    "answer": {
      "text": "Brazil",
      "image": "images/q184_wiki.jpg"
    },
    "funda": {
      "text": "Brazil has won the tournament five times (1958, 1962, 1970, 1994, 2002).",
      "image": null
    }
  },
  {
    "id": 185,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "In which city would you find the Eiffel Tower?",
      "image": "images/q185_pexels.jpg"
    },
    "answer": {
      "text": "Paris",
      "image": "images/q185_wiki.jpg"
    },
    "funda": {
      "text": "The tower was built as the entrance arch to the 1889 World's Fair.",
      "image": null
    }
  },
  {
    "id": 186,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the most abundant element in the Earth's crust?",
      "image": "images/q186_pexels.jpg"
    },
    "answer": {
      "text": "Oxygen",
      "image": "images/q186_wiki.jpg"
    },
    "funda": {
      "text": "Oxygen makes up about 46. 6% of the Earth's crust by weight, mostly in silicate minerals.",
      "image": null
    }
  },
  {
    "id": 187,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Who painted the 'Mona Lisa'?",
      "image": "images/q187_pexels.jpg"
    },
    "answer": {
      "text": "Leonardo da Vinci",
      "image": "images/q187_wiki.jpg"
    },
    "funda": {
      "text": "It is arguably the most famous painting in the world, housed in the Louvre Museum.",
      "image": null
    }
  },
  {
    "id": 188,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "How many hearts does an octopus have?",
      "image": "images/q188_pexels.jpg"
    },
    "answer": {
      "text": "Three",
      "image": null
    },
    "funda": {
      "text": "Two hearts pump blood to the gills, while the third pumps it to the rest of the body.",
      "image": null
    }
  },
  {
    "id": 189,
    "topic": "politics",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which country was the first to give women the right to vote?",
      "image": "images/q189_pexels.jpg"
    },
    "answer": {
      "text": "New Zealand",
      "image": "images/q189_wiki.jpg"
    },
    "funda": {
      "text": "New Zealand granted universal suffrage in 1893, following a massive petition campaign.",
      "image": null
    }
  },
  {
    "id": 190,
    "topic": "cuisines",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the main ingredient of 'Guacamole'?",
      "image": "images/q190_pexels.jpg"
    },
    "answer": {
      "text": "Avocado",
      "image": "images/q190_wiki.jpg"
    },
    "funda": {
      "text": "Guacamole originated with the Aztecs in Mexico and usually includes lime and cilantro.",
      "image": null
    }
  },
  {
    "id": 191,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which is the largest ocean on Earth?",
      "image": "images/q191_pexels.jpg"
    },
    "answer": {
      "text": "Pacific Ocean",
      "image": null
    },
    "funda": {
      "text": "The Pacific covers more than 30% of the Earth's surface.",
      "image": null
    }
  },
  {
    "id": 192,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the hardest natural substance on Earth?",
      "image": "images/q192_pexels.jpg"
    },
    "answer": {
      "text": "Diamond",
      "image": null
    },
    "funda": {
      "text": "Diamonds are made of pure carbon atoms arranged in a crystal structure.",
      "image": null
    }
  },
  {
    "id": 193,
    "topic": "history",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Who was the first President of the United States?",
      "image": "images/q193_pexels.jpg"
    },
    "answer": {
      "text": "George Washington",
      "image": null
    },
    "funda": {
      "text": "Washington led the Continental Army during the American Revolutionary War.",
      "image": null
    }
  },
  {
    "id": 194,
    "topic": "wildlife",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is a baby kangaroo called?",
      "image": "images/q194_pexels.jpg"
    },
    "answer": {
      "text": "A joey",
      "image": null
    },
    "funda": {
      "text": "Joeys are born very underdeveloped and crawl into their mother's pouch to finish growing.",
      "image": null
    }
  },
  {
    "id": 195,
    "topic": "sports",
    "difficulty": "hard",
    "type": "standard",
    "question": {
      "text": "How many players are there in a standard soccer team on the field?",
      "image": "images/q195_pexels.jpg"
    },
    "answer": {
      "text": "11",
      "image": null
    },
    "funda": {
      "text": "This includes the goalkeeper and 10 outfield players.",
      "image": null
    }
  },
  {
    "id": 196,
    "topic": "general",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the capital of Italy?",
      "image": "images/q196_pexels.jpg"
    },
    "answer": {
      "text": "Rome",
      "image": "images/q196_wiki.jpg"
    },
    "funda": {
      "text": "Rome is often called the 'Eternal City' and is home to the Colosseum.",
      "image": null
    }
  },
  {
    "id": 197,
    "topic": "general",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "What is the boiling point of water in Celsius?",
      "image": "images/q197_pexels.jpg"
    },
    "answer": {
      "text": "100Â°C",
      "image": null
    },
    "funda": {
      "text": "This value is at standard atmospheric pressure at sea level.",
      "image": null
    }
  },
  {
    "id": 198,
    "topic": "history",
    "difficulty": "medium",
    "type": "standard",
    "question": {
      "text": "Who was the first Emperor of Rome?",
      "image": "images/q198_pexels.jpg"
    },
    "answer": {
      "text": "Augustus",
      "image": "images/q198_wiki.jpg"
    },
    "funda": {
      "text": "Born Gaius Octavius, he founded the Roman Empire after the assassination of Julius Caesar.",
      "image": null
    }
  },
  {
    "id": 199,
    "topic": "wildlife",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "Which mammal is known to be the only one that can truly fly?",
      "image": "images/q199_pexels.jpg"
    },
    "answer": {
      "text": "Bat",
      "image": "images/q199_wiki.jpg"
    },
    "funda": {
      "text": "While flying squirrels can glide, bats have true powered flight.",
      "image": null
    }
  },
  {
    "id": 200,
    "topic": "politics",
    "difficulty": "easy",
    "type": "standard",
    "question": {
      "text": "What is the headquarters of the United Nations located?",
      "image": "images/q200_pexels.jpg"
    },
    "answer": {
      "text": "New York City",
      "image": "images/q200_wiki.jpg"
    },
    "funda": {
      "text": "The land is considered international territory, though it is located within NYC.",
      "image": null
    }
  }
];
