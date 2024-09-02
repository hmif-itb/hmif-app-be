CREATE INDEX IF NOT EXISTS "title_search_idx" ON "calendar_event" USING gin ((
        setweight(to_tsvector('indonesian', "title"), 'A') ||
        setweight(to_tsvector('indonesian', "description"), 'B')
      ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_search_idx" ON "infos" USING gin ((
        setweight(to_tsvector('indonesian', "title"), 'A') ||
        setweight(to_tsvector('indonesian', "content"), 'B')
      ));