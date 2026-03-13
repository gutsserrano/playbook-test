# Create Playbook database in PostgreSQL (requires psql)
# Usage: .\create-database.ps1

$env:PGPASSWORD = "postgres"
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE playbook;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database 'playbook' created successfully."
} else {
    Write-Host "Database may already exist or psql not found. Run migrations with:"
    Write-Host "  cd backend/Playbook.Api"
    Write-Host "  dotnet ef database update"
}
