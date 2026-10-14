ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'MEDIA';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS activity_type text NOT NULL DEFAULT 'GERAL';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_valid CHECK (priority IN ('ALTA','MEDIA','BAIXA'));
ALTER TABLE tasks ADD CONSTRAINT tasks_progress_valid CHECK (progress BETWEEN 0 AND 100);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
