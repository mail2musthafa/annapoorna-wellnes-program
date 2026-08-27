# 🤝 Contributing & Deployment Guide

This document defines the branch workflow, testing requirements, and deployment approval process for Annapoorna contributors.

---

## 🌳 Branching Model

| Branch | Purpose | Environment | Protection Rules |
| :--- | :--- | :--- | :--- |
| **`main`** | Production release | `https://annapoornawellness.org` | 🔒 Locked: Direct push forbidden. Requires PR review + CI passing. |
| **`dev`** | Integration / Staging | Development testing | Working branch for new features & fixes. |
| **`feature/*`** | New features | Local developer machine | Created from `dev`, merged into `dev` via PR. |
| **`fix/*`** | Bug fixes | Local developer machine | Created from `dev`, merged into `dev` via PR. |

---

## 🛠️ Contributor Workflow (Step-by-Step)

### 1. Create a Working Branch
Always branch off the `dev` branch:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Run Local Development Environment
Run the local containers with hot-reload enabled:
```bash
docker compose up -d
```
- Web: `http://localhost:3000`
- API: `http://localhost:8000/docs`

### 3. Test & Lint Your Changes
Before pushing, ensure all automated tests pass:
```bash
# Backend checks
cd apps/api
uv run ruff check .
uv run mypy app
uv run pytest tests

# Frontend checks
cd ../web
npm run lint
npm run build
```

### 4. Push and Open a Pull Request to `dev`
```bash
git add .
git commit -m "feat: describe your change clearly"
git push origin feature/your-feature-name
```
- Open a Pull Request: `feature/your-feature-name` ➡️ `dev`.
- GitHub Actions CI will automatically run all tests and type checks.
- Once reviewed and merged into `dev`, changes are verified in staging.

---

## 🚀 Production Release & Approval Process

When changes in `dev` are tested and ready for production:

1. **Create Release PR**: Open a PR from `dev` ➡️ `main`.
2. **Review & Approval Required**:
   - The repository owner / lead reviewer inspects the changes.
   - All CI tests must pass (green checkmarks).
3. **Merge & Automatic Deployment**:
   - Once approved and merged into `main`, GitHub Actions automatically triggers the deployment to the VPS via SSH and restarts containers without downtime.
