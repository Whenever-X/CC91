-- Widen reports.status column to accommodate all enum values (DISMISSED = 9 chars)
ALTER TABLE reports MODIFY COLUMN status VARCHAR(20) NOT NULL;
