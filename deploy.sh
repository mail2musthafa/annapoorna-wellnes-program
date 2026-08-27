#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🚀 Annapoorna Production Deployment Script"
echo "===================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.production.example..."
    cp .env.production.example .env
    
    # Auto-generate secure random keys
    RAND_DB_PASS=$(openssl rand -hex 12)
    RAND_APP_SECRET=$(openssl rand -hex 32)
    RAND_JWT_SECRET=$(openssl rand -hex 32)
    
    sed -i "s/POSTGRES_PASSWORD=generate_a_strong_password_here_min_16_chars/POSTGRES_PASSWORD=${RAND_DB_PASS}/" .env
    sed -i "s/APP_SECRET_KEY=replace_with_a_random_64_character_hex_string/APP_SECRET_KEY=${RAND_APP_SECRET}/" .env
    sed -i "s/JWT_SECRET_KEY=replace_with_another_random_64_character_hex_string/JWT_SECRET_KEY=${RAND_JWT_SECRET}/" .env
    
    echo "✅ Generated fresh .env with strong secrets."
fi

echo "📦 1. Building and pulling docker containers..."
docker compose -f compose.prod.yaml build

echo "🗄️  2. Starting database and redis..."
docker compose -f compose.prod.yaml up -d postgres redis
echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔄 3. Running database migrations..."
docker compose -f compose.prod.yaml run --rm api alembic upgrade head

echo "🚀 4. Starting all application services and Caddy SSL proxy..."
docker compose -f compose.prod.yaml up -d --remove-orphans

echo "===================================================="
echo "🎉 Deployment complete!"
echo "🌐 Your app will be live at: https://annapoornawellness.org"
echo "===================================================="
