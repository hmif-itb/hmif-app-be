CREATE INDEX IF NOT EXISTS "search_idx" ON "courses" USING gin ((
        setweight(to_tsvector('indonesian', "name"), 'A') ||
        setweight(to_tsvector('indonesian', "code"), 'B')
      ));