.PHONY: help dev up down restart logs ps clean migrate seed test lint format typecheck

help:
	@echo "Annapoorna Portal - Command Menu"
	@echo "--------------------------------------------------------"
	@echo "make dev          Start full stack with Docker Compose"
	@echo "make up           Start background services (Postgres, Redis)"
	@echo "make down         Stop all Docker Compose services"
	@echo "make logs         Follow logs of all services"
	@echo "make migrate      Run Alembic database migrations"
	@echo "make seed         Run idempotent database seeder"
	@echo "make test         Run backend pytest suite"
	@echo "make lint         Run Ruff linter and Next.js linter"
	@echo "make format       Format code using Ruff and Prettier"
	@echo "make typecheck    Run MyPy and TypeScript type checkers"
	@echo "make clean        Remove temporary cache and build files"

dev:
	docker compose up --build

up:
	docker compose up -d postgres redis

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

migrate:
	cd apps/api && uv run alembic upgrade head

seed:
	cd apps/api && uv run python -m scripts.seed

test:
	cd apps/api && uv run pytest tests -v --tb=short

lint:
	cd apps/api && uv run ruff check .
	cd apps/web && npm run lint

format:
	cd apps/api && uv run ruff format .

typecheck:
	cd apps/api && uv run mypy app
	cd apps/web && npm run typecheck

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
