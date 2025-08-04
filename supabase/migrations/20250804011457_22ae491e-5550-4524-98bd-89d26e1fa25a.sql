-- Remove TishaBav related content and tables
-- First, let's check if there are any TishaBav related tables and drop them
DROP TABLE IF EXISTS tishbav_content CASCADE;
DROP TABLE IF EXISTS tisha_bav_content CASCADE;
DROP TABLE IF EXISTS tishav_content CASCADE;

-- Remove any TishaBav related columns from existing tables if they exist
-- (This is a safety measure in case there were any references)