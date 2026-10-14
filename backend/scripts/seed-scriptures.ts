import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Pre-curated Krishna Charitra episodes (Mahabharata / Bhagavata Purana)
const KRISHNA_EPISODES = [
  {
    title: 'The Peace Embassy to Hastinapur (Shanti Parva / Udyoga Parva)',
    parva_or_canto: 'Mahabharata, Udyoga Parva',
    dilemma_context: 'War seemed inevitable, but peace had not been given its final, exhaustive effort. Pandavas were ready to fight, yet duty demanded exhausting diplomatic reconciliation first.',
    krishna_action: 'Krishna travelled as an envoy of peace to the court of Dhritarashtra. Even when Duryodhana attempted to arrest Him, Krishna revealed His Vishwaroopa, demonstrating patience without weakness.',
    philosophical_lesson: 'Exhaust all peaceful and dharmic avenues before turning to conflict. When doing so, act from absolute conviction and strength, not from cowardice or desperation.',
  },
  {
    title: 'Arjuna Despondency on Kurukshetra (Visada Yoga)',
    parva_or_canto: 'Bhagavad Gita, Chapter 1 & 2',
    dilemma_context: 'Arjuna threw down his Gandiva bow, overwhelmed by sentimental grief, refusing to fight elders like Bhishma and Drona out of attachment.',
    krishna_action: 'Krishna smiled gently, addressed him as Sakha, dismantled his false compassion, and reminded him that the soul is eternal (Na hanyate hanyamane sarire) and action is his sole prerogative.',
    philosophical_lesson: 'Duty (Svadharma) transcends personal sentiment. Running from necessary conflict out of attachment or grief is not renunciation—it is subtle cowardice.',
  },
  {
    title: 'The Lifting of Govardhan Hill',
    parva_or_canto: 'Srimad Bhagavatam, Canto 10',
    dilemma_context: 'Indra unleashed torrential rains to drown Vrindavan after villagers stopped ritual sacrifices in fear of his wrath.',
    krishna_action: 'Krishna lifted the entire Govardhan hill upon the little finger of His left hand, providing shelter to all living beings without strain.',
    philosophical_lesson: 'Surrender all fear of cosmic or worldly power to the Supreme Guide. When standing under divine shelter, no external tempest can shake your inner serenity.',
  },
  {
    title: 'Counsel to Draupadi during Vastraharan',
    parva_or_canto: 'Mahabharata, Sabha Parva',
    dilemma_context: 'In the gambling assembly, elders and husbands sat paralyzed by legal technicalities while Draupadi was being dishonored.',
    krishna_action: 'When Draupadi let go of her own desperate grip on her garments and raised both arms in unreserved surrender, Krishna supplied an endless stream of cloth.',
    philosophical_lesson: 'When human power, institutions, and worldly protectors fail, unreserved surrender (Sharanagati) to Truth sustains the soul through total humiliation.',
  },
  {
    title: 'Leaving Mathura (Ranchodrai Lila)',
    parva_or_canto: 'Srimad Bhagavatam, Canto 10',
    dilemma_context: 'Jarasandha attacked Mathura for the 18th time with overwhelming armies, which would have resulted in collateral carnage for innocent citizens.',
    krishna_action: 'Krishna deliberately withdrew from the battlefield with Balarama, leading the enemy away and relocating the Yadavas to the fortified seaside city of Dwarka.',
    philosophical_lesson: 'Strategic withdrawal is not cowardice when it preserves life and serves the broader Dharma. Never let false pride or ego dictate reckless martyrdom.',
  },
  {
    title: 'Sudama Humble Offering',
    parva_or_canto: 'Srimad Bhagavatam, Canto 10',
    dilemma_context: 'Impoverished childhood friend Sudama arrived at Dwarka with only a torn rag containing a few handfuls of chipped rice, embarrassed by his poverty.',
    krishna_action: 'Krishna ran barefoot to welcome him, washed his feet with His own tears, and joyously consumed the chipped rice with boundless reverence.',
    philosophical_lesson: 'The Divine values inner love (Bhava) over worldly wealth or grandeur. A leaf, a flower, a fruit, or water offered with genuine love is accepted wholeheartedly.',
  },
  {
    title: 'The Disarming of Karna Wheel',
    parva_or_canto: 'Mahabharata, Karna Parva',
    dilemma_context: 'Karna chariot wheel was stuck in the mud, and he pleaded for the code of chivalry (Dharma) to halt the combat.',
    krishna_action: 'Krishna reminded Karna sharply: Where was your code when Draupadi was insulted? Where was it when young Abhimanyu was butchered by seven warriors? Strike now, Arjuna!',
    philosophical_lesson: 'Those who abuse righteousness for their convenience cannot hide behind it when consequences arrive. Real Dharma is active accountability, not legal loopholes.',
  },
];

async function main() {
  console.log('🚀 Starting Sarathi Sakha Scripture Seeder...');

  // 1. Connect to PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/sarathi_sakha',
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database: sarathi_sakha');

    // 2. Initialize Schema
    const schemaPath = path.join(__dirname, '../../data/init_schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📜 Applying database schema (init_schema.sql)...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Schema and search_spiritual_wisdom() RPC function created successfully.');
    }

    // 3. Import Xenova Transformers for in-process local embeddings (0 tokens, 100% free)
    console.log('🧠 Initializing local embedding pipeline (Xenova/all-MiniLM-L6-v2)...');
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
    console.log('✅ Local embedding model ready (384-dimensional ONNX).');

    async function computeEmbedding(text: string): Promise<string> {
      const clean = text.replace(/\n+/g, ' ').slice(0, 512);
      const res = await embedder(clean, { pooling: 'mean', normalize: true });
      return `[${Array.from(res.data).join(',')}]`;
    }

    // 4. Seed Krishna Episodes
    console.log('📖 Seeding Krishna Charitra episodes...');
    for (const ep of KRISHNA_EPISODES) {
      const contextText = `${ep.title} ${ep.dilemma_context} ${ep.krishna_action} ${ep.philosophical_lesson}`;
      const emb = await computeEmbedding(contextText);

      await client.query(
        `INSERT INTO krishna_episodes (title, parva_or_canto, dilemma_context, krishna_action, philosophical_lesson, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)
         ON CONFLICT DO NOTHING`,
        [ep.title, ep.parva_or_canto, ep.dilemma_context, ep.krishna_action, ep.philosophical_lesson, emb]
      );
    }
    console.log(`✅ Seeded ${KRISHNA_EPISODES.length} Krishna Charitra episodes.`);

    // 5. Fetch Bhagavad Gita Verses Dataset
    console.log('🌐 Fetching full 700 Bhagavad Gita verses dataset...');
    const versesRes = await fetch('https://raw.githubusercontent.com/praneshp1org/Bhagavad-Gita-JSON-data/main/verse.json');
    const transRes = await fetch('https://raw.githubusercontent.com/praneshp1org/Bhagavad-Gita-JSON-data/main/translation.json');
    const commRes = await fetch('https://raw.githubusercontent.com/praneshp1org/Bhagavad-Gita-JSON-data/main/commentary.json');

    const verses = await versesRes.json() as any[];
    const translations = await transRes.json() as any[];
    const commentaries = await commRes.json() as any[];

    console.log(`📥 Loaded ${verses.length} verses from open source archive.`);

    // Build lookup maps for translation and commentary
    const transMap = new Map<number, { english: string; hindi: string }>();
    for (const t of translations) {
      if (!transMap.has(t.verse_id)) {
        transMap.set(t.verse_id, { english: '', hindi: '' });
      }
      const item = transMap.get(t.verse_id)!;
      if (t.lang === 'english' && (!item.english || t.authorName.includes('Sivananda') || t.authorName.includes('Adidevananda'))) {
        item.english = t.description?.trim() || '';
      }
      if (t.lang === 'hindi' && (!item.hindi || t.authorName.includes('Ramsukhdas'))) {
        item.hindi = t.description?.trim() || '';
      }
    }

    const commMap = new Map<number, string>();
    for (const c of commentaries) {
      if (!commMap.has(c.verse_id) || c.authorName?.includes('Chinmayananda') || c.authorName?.includes('Sivananda')) {
        commMap.set(c.verse_id, c.description?.trim() || '');
      }
    }

    // Theme categorizer
    function getTheme(chapter: number): string {
      switch (chapter) {
        case 1: return 'Grief & Moral Turmoil';
        case 2: return 'Eternal Soul & Nishkama Karma';
        case 3: return 'Karma Yoga & Selfless Action';
        case 4: return 'Jnana Yoga & Divine Wisdom';
        case 5: return 'Renunciation & Inner Peace';
        case 6: return 'Dhyana Yoga & Meditation';
        case 7: return 'Supreme Knowledge';
        case 8: return 'The Eternal Brahman';
        case 9: return 'Royal Secret & Devotion';
        case 10: return 'Divine Opulence';
        case 11: return 'The Cosmic Vision';
        case 12: return 'Bhakti Yoga & Loving Surrender';
        case 13: return 'The Knower and the Known';
        case 14: return 'The Three Gunas';
        case 15: return 'The Supreme Being';
        case 16: return 'Divine and Demonic Qualities';
        case 17: return 'The Divisions of Faith';
        case 18: return 'Liberation & Ultimate Surrender';
        default: return 'Spiritual Wisdom';
      }
    }

    let insertedCount = 0;
    for (let i = 0; i < verses.length; i++) {
      const v = verses[i];
      const trans = transMap.get(v.id) || { english: '', hindi: '' };
      const comm = commMap.get(v.id) || trans.english;
      const theme = getTheme(v.chapter_number);

      const embeddingInput = `${trans.english} ${comm} Theme: ${theme}`.trim();
      const emb = await computeEmbedding(embeddingInput);

      await client.query(
        `INSERT INTO gita_verses (
           chapter, verse, sanskrit, transliteration, word_meanings, english_translation, hindi_translation, commentary, theme, embedding
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
         ON CONFLICT (chapter, verse) DO UPDATE SET
           sanskrit = EXCLUDED.sanskrit,
           transliteration = EXCLUDED.transliteration,
           english_translation = EXCLUDED.english_translation,
           commentary = EXCLUDED.commentary,
           embedding = EXCLUDED.embedding`,
        [
          v.chapter_number,
          v.verse_number,
          v.text?.trim() || '',
          v.transliteration?.trim() || '',
          v.word_meanings?.trim() || '',
          trans.english || 'Translation pending.',
          trans.hindi || '',
          comm || 'Commentary pending.',
          theme,
          emb,
        ]
      );

      insertedCount++;
      if (insertedCount % 50 === 0 || insertedCount === verses.length) {
        console.log(`✨ Progress: [${insertedCount}/${verses.length}] verses embedded and stored in PostgreSQL.`);
      }
    }

    console.log(`\n🎉 SUCCESS! All ${insertedCount} Bhagavad Gita verses and Krishna Charitra episodes have been seeded with 384-dim vector embeddings.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.end();
  }
}

main();
