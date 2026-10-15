const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CHAPTER_INFO = [
  { chapter: 1, name: "Arjuna Vishada Yoga", meaning: "The Yoga of Arjuna's Despondency", verses: 47, theme: "Overwhelmed by attachment and grief, Arjuna collapses on the battlefield." },
  { chapter: 2, name: "Sankhya Yoga", meaning: "The Yoga of Analytical Knowledge", verses: 72, theme: "The eternal nature of the soul, Svadharma, and the state of the tranquil sage (Sthitaprajna)." },
  { chapter: 3, name: "Karma Yoga", meaning: "The Yoga of Selfless Action", verses: 43, theme: "Acting without selfish attachment as a sacred offering to the Divine." },
  { chapter: 4, name: "Jnana Karma Sanyasa Yoga", meaning: "The Yoga of Knowledge & Renunciation of Action", verses: 42, theme: "Divine descent (Avatara), the sacred fire of wisdom consuming all binding karma." },
  { chapter: 5, name: "Karma Sanyasa Yoga", meaning: "The Yoga of Renunciation", verses: 29, theme: "True renunciation is inner freedom from attachment, not physical inaction." },
  { chapter: 6, name: "Dhyana Yoga", meaning: "The Yoga of Meditation", verses: 47, theme: "Mastering the mind through practice (Abhyasa) and dispassion (Vairagya)." },
  { chapter: 7, name: "Jnana Vijnana Yoga", meaning: "The Yoga of Knowledge & Realization", verses: 30, theme: "Understanding the material and spiritual energies of the Supreme." },
  { chapter: 8, name: "Aksara Brahma Yoga", meaning: "The Yoga of the Imperishable Brahman", verses: 28, theme: "Remembrance of the Divine at the moment of departure." },
  { chapter: 9, name: "Raja Vidya Raja Guhya Yoga", meaning: "The Yoga of Sovereign Science & Secret", verses: 34, theme: "The supreme mystery of pure love and unreserved surrender." },
  { chapter: 10, name: "Vibhuti Yoga", meaning: "The Yoga of Divine Glories", verses: 42, theme: "Seeing the radiant presence of the Divine in all cosmic phenomena." },
  { chapter: 11, name: "Vishwaroopa Darshana Yoga", meaning: "The Yoga of the Cosmic Form", verses: 55, theme: "The all-devouring cosmic revelation of Time (Kala) and Transcendence." },
  { chapter: 12, name: "Bhakti Yoga", meaning: "The Yoga of Devotion", verses: 20, theme: "The highest qualities of a pure devotee beloved by the Lord." },
  { chapter: 13, name: "Kshetra Kshetragnya Vibhaga Yoga", meaning: "The Yoga of Field & Knower", verses: 35, theme: "Discriminating the temporary body from the eternal soul." },
  { chapter: 14, name: "Gunatraya Vibhaga Yoga", meaning: "The Yoga of the Three Modes of Nature", verses: 27, theme: "Transcending Sattva (goodness), Rajas (passion), and Tamas (ignorance)." },
  { chapter: 15, name: "Purushottama Yoga", meaning: "The Yoga of the Supreme Person", verses: 20, theme: "The inverted Ashvattha tree of existence and the Supreme Lord beyond all." },
  { chapter: 16, name: "Daivasura Sampad Vibhaga Yoga", meaning: "The Yoga of Divine & Demonic Natures", verses: 24, theme: "The virtues leading to liberation vs vices leading to bondage." },
  { chapter: 17, name: "Shraddhatraya Vibhaga Yoga", meaning: "The Yoga of the Threefold Faith", verses: 28, theme: "How faith, food, sacrifice, and penance are shaped by the gunas." },
  { chapter: 18, name: "Moksha Sanyasa Yoga", meaning: "The Yoga of Liberation through Renunciation", verses: 78, theme: "The ultimate synthesis of Dharma, final surrender (Charama Shloka), and victory." },
];

async function run() {
  const client = new Client({ connectionString: "postgres://postgres@localhost:5432/sarathi_sakha" });
  await client.connect();

  const curatedQuery = `
    SELECT chapter, verse, sanskrit, transliteration, english_translation, commentary
    FROM gita_verses
    WHERE (chapter = 2 AND verse IN (14, 20, 40, 47, 48, 62, 63, 65, 70))
       OR (chapter = 3 AND verse IN (9, 19, 21, 35, 43))
       OR (chapter = 4 AND verse IN (7, 8, 38))
       OR (chapter = 6 AND verse IN (5, 6, 26, 30))
       OR (chapter = 9 AND verse IN (22, 26, 27, 34))
       OR (chapter = 11 AND verse IN (32, 33))
       OR (chapter = 12 AND verse IN (13, 14, 15))
       OR (chapter = 18 AND verse IN (46, 58, 65, 66, 78))
    ORDER BY chapter, verse;
  `;

  const { rows } = await client.query(curatedQuery);
  console.log("Loaded " + rows.length + " iconic verses from database.");

  const outputCode = `// Auto-generated Gita Treasury offline knowledge base
export interface ChapterInfo {
  chapter: number;
  name: string;
  meaning: string;
  verses: number;
  theme: string;
}

export interface TreasuryVerse {
  chapter: number;
  verse: number;
  reference: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  commentary: string;
  tags: string[];
}

export const GITA_CHAPTERS: ChapterInfo[] = ${JSON.stringify(CHAPTER_INFO, null, 2)};

export const MASTERPIECE_VERSES: TreasuryVerse[] = ${JSON.stringify(
    rows.map((r) => {
      const tags = [];
      const code = r.chapter + r.verse / 100;
      if ([2.14, 2.20, 2.65, 6.5, 6.26].includes(code)) tags.push("Peace & Stillness");
      if ([2.47, 2.48, 3.9, 3.35, 18.46].includes(code)) tags.push("Duty & Karma");
      if ([4.7, 4.8, 9.22, 9.26, 18.66].includes(code)) tags.push("Devotion & Grace");
      if ([2.40, 11.32, 11.33, 18.58].includes(code)) tags.push("Courage & Fearlessness");
      if ([2.62, 2.63, 6.6, 12.13].includes(code)) tags.push("Mind Mastery");
      if (tags.length === 0) tags.push("Spiritual Wisdom");

      return {
        chapter: r.chapter,
        verse: r.verse,
        reference: "Chapter " + r.chapter + ", Verse " + r.verse,
        sanskrit: r.sanskrit,
        transliteration: r.transliteration || "",
        translation: r.english_translation || "",
        commentary: r.commentary || "",
        tags,
      };
    }),
    null,
    2
  )};
`;

  const outDir = path.join(__dirname, '../../mobile/src/data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'gitaTreasury.ts'), outputCode);
  console.log("Written mobile/src/data/gitaTreasury.ts successfully!");
  await client.end();
}

run().catch(console.error);
