#!/bin/bash
# Create Playbook database in PostgreSQL
# Usage: ./create-database.sh

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE playbook;" 2>/dev/null || true
echo "Run migrations: cd backend/Playbook.Api && dotnet ef database update"
