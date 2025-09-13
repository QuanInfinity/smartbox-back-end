-- Rollback Migration: Remove delivery fields from rents table
-- Date: 2025-08-21
-- Description: Remove rental_type and receiver_phone fields if needed

-- WARNING: This will permanently delete data in these columns!
-- Make sure to backup your data before running this rollback.

-- Drop indexes first
DROP INDEX IF EXISTS idx_rents_delivery_lookup ON rents;
DROP INDEX IF EXISTS idx_rents_receiver_phone ON rents;
DROP INDEX IF EXISTS idx_rents_rental_type ON rents;

-- Remove the columns
ALTER TABLE rents DROP COLUMN IF EXISTS receiver_phone;
ALTER TABLE rents DROP COLUMN IF EXISTS rental_type;

-- Verify the rollback
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'rents' 
AND COLUMN_NAME IN ('rental_type', 'receiver_phone');
