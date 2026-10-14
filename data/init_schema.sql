-- ============================================================================
-- SARATHI SAKHA: DATABASE INITIALIZATION SCHEMA
-- Target Database: sarathi_sakha
-- Vector Dimensions: 384 (all-MiniLM-L6-v2 / bge-small-en-v1.5)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(100),
    is_pro BOOLEAN DEFAULT FALSE,
    daily_quota_limit INT DEFAULT 10,
    daily_quota_used INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bhagavad Gita Verses (All 700 Verses)
CREATE TABLE IF NOT EXISTS gita_verses (
    id SERIAL PRIMARY KEY,
    chapter INT NOT NULL,
    verse INT NOT NULL,
    sanskrit TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    word_meanings TEXT,
    english_translation TEXT NOT NULL,
    hindi_translation TEXT,
    commentary TEXT NOT NULL,
    theme VARCHAR(64) DEFAULT 'Dharma & Duty',
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_chapter_verse UNIQUE (chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_gita_verses_embedding 
ON gita_verses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_gita_verses_chapter_verse 
ON gita_verses (chapter, verse);

-- 3. Krishna Charitra (Episodes from Mahabharata / Bhagavata Purana)
CREATE TABLE IF NOT EXISTS krishna_episodes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    parva_or_canto VARCHAR(128) NOT NULL,
    dilemma_context TEXT NOT NULL,
    krishna_action TEXT NOT NULL,
    philosophical_lesson TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_krishna_episodes_embedding 
ON krishna_episodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- 4. Chat Messages History
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'krishna')),
    message TEXT NOT NULL,
    referenced_verse_id INT REFERENCES gita_verses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON chat_messages (user_id, created_at DESC);

-- 5. Unified Vector Search Function (Cosine Similarity across Verses & Episodes)
CREATE OR REPLACE FUNCTION search_spiritual_wisdom(
    query_vector VECTOR(384),
    match_threshold FLOAT,
    max_results INT
)
RETURNS TABLE (
    source_type TEXT,
    id INT,
    reference TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'gita'::TEXT AS source_type,
        gv.id,
        ('Chapter ' || gv.chapter || ', Verse ' || gv.verse)::TEXT AS reference,
        (gv.sanskrit || E'\n\n' || gv.transliteration || E'\n\nTranslation: ' || gv.english_translation || E'\n\nCommentary: ' || gv.commentary)::TEXT AS content,
        (1 - (gv.embedding <=> query_vector))::FLOAT AS similarity
    FROM gita_verses gv
    WHERE (1 - (gv.embedding <=> query_vector)) > match_threshold

    UNION ALL

    SELECT 
        'episode'::TEXT AS source_type,
        ke.id,
        ke.title::TEXT AS reference,
        ('Context: ' || ke.dilemma_context || E'\n\nAction: ' || ke.krishna_action || E'\n\nLesson: ' || ke.philosophical_lesson)::TEXT AS content,
        (1 - (ke.embedding <=> query_vector))::FLOAT AS similarity
    FROM krishna_episodes ke
    WHERE (1 - (ke.embedding <=> query_vector)) > match_threshold

    ORDER BY similarity DESC
    LIMIT max_results;
END;
$$;
