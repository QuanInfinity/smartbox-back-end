-- Migration: Add delivery fields to rents table
-- Date: 2025-08-21
-- Description: Add rental_type and receiver_phone fields to support delivery functionality

-- Add rental_type column
ALTER TABLE rents 
ADD COLUMN rental_type VARCHAR(50) NULL 
COMMENT 'Type of rental: short_term, long_term, delivery';

-- Add receiver_phone column for delivery rentals
ALTER TABLE rents 
ADD COLUMN receiver_phone VARCHAR(15) NULL 
COMMENT 'Phone number of the receiver for delivery rentals';

-- Update existing records to have rental_type
-- Assume existing records are short_term by default
UPDATE rents 
SET rental_type = 'short_term' 
WHERE rental_type IS NULL;

-- Add index for better query performance
CREATE INDEX idx_rents_rental_type ON rents(rental_type);
CREATE INDEX idx_rents_receiver_phone ON rents(receiver_phone);
CREATE INDEX idx_rents_delivery_lookup ON rents(receiver_phone, rental_type, status, end_time);

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'rents' 
AND COLUMN_NAME IN ('rental_type', 'receiver_phone');
