-- Playbook PostgreSQL Initialization Script
-- Run this to create the database and user (optional, if not using default postgres user)

-- Create database (run as superuser)
-- CREATE DATABASE playbook;

-- Create user (optional)
-- CREATE USER playbook_user WITH PASSWORD 'playbook_secret';
-- GRANT ALL PRIVILEGES ON DATABASE playbook TO playbook_user;

-- Connect to playbook database and run migrations via EF Core:
-- dotnet ef database update --project backend/Playbook.Api --startup-project backend/Playbook.Api
--
-- Or use the connection string in appsettings.json:
-- Host=localhost;Port=5432;Database=playbook;Username=postgres;Password=postgres
