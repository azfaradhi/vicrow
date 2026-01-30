-- Initialize Vicrow Database
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vicrow TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Vicrow database initialized successfully!';
END $$;
