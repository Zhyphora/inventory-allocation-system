# Setup GitHub Repository

This guide explains how to create and setup the public GitHub repository with backend/ and frontend/ folders.

## Steps to Create GitHub Repository

### 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in repository details:
   - Repository name: `inventory-allocation-system`
   - Description: `Full-stack Inventory Allocation System with Express.js backend and Next.js frontend`
   - Public ✓
   - Add README: No (we'll add it from local)
   - Add .gitignore: No
   - Add license: MIT (optional)
3. Click "Create repository"

### 2. Initialize Local Git Repository

```bash
cd /Volumes/project-danu/foom

# Initialize if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Setup Inventory Allocation System

- Backend: Express.js REST API with PostgreSQL
- Frontend: Next.js 14 with App Router
- Stock Dashboard with warehouse/product filters
- Purchase Request management (DRAFT→PENDING→COMPLETED)
- Webhook integration for stock receipt
- OpenAPI documentation
- Postman collection ready"

# Add remote
git remote add origin https://github.com/Zhyphora/inventory-allocation-system.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Repository Structure

After pushing, your repository will look like:

```
inventory-allocation-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── server.js
│   ├── config/
│   ├── .env.example
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── openapi.yaml
│   ├── WEBHOOK.md
│   ├── MVC_ARCHITECTURE.md
│   ├── Postman_Collection.json
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── .env.example
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .gitignore
├── README.md (main project README)
└── .gitignore (root level)
```

### 4. Create Root .gitignore

```
# Dependencies
node_modules/
.npm
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-*
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime
tmp/
temp/

# OS
.DS_Store
Thumbs.db
```

### 5. Verify GitHub Repository

1. Go to https://github.com/{YOUR_USERNAME}/inventory-allocation-system
2. Check that:
   - ✓ All folders are visible (backend/, frontend/)
   - ✓ README.md displays correctly
   - ✓ File structure is complete
   - ✓ .gitignore working (no node_modules, .env files)

## GitHub Best Practices

### Branch Strategy

```bash
# Create feature branches
git checkout -b feature/add-export-csv
git checkout -b feature/webhook-retry

# Create bug fix branches
git checkout -b bugfix/fix-pagination
git checkout -b bugfix/api-timeout

# Use PR for code review before merging to main
```

### Commit Messages

```
# Feature
git commit -m "feat: add stock export to CSV

- Added CSV download button to dashboard
- Implement ExportService utility
- Update StockDashboard component"

# Bug fix
git commit -m "fix: correct stock filter by product

- Fixed query parameter parsing
- Add test for edge cases"

# Documentation
git commit -m "docs: update API endpoint parameters"
```

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description

Brief description of changes

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Performance improvement

## Testing

- [ ] Unit tests added
- [ ] Manual testing done
- [ ] Tested on mobile

## Checklist

- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.logs left
```

### CI/CD Setup (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: inventory_db
          POSTGRES_USER: dev
          POSTGRES_PASSWORD: Testing1
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd backend && npm install
      - run: cd backend && npm run test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - run: cd frontend && npm run lint
```

## Collaboration Settings

### Protect Main Branch

1. Go to Settings → Branches
2. Add branch protection rule for `main`:
   - ✓ Require pull request reviews before merging
   - ✓ Require status checks to pass
   - ✓ Require branches to be up to date before merging
   - ✓ Include administrators

### Code Owners

Create `.github/CODEOWNERS`:

```
# Backend
/backend/ @yourname

# Frontend
/frontend/ @yourname

# Documentation
*.md @yourname
```

## Useful GitHub Features

### Issues

1. Create issue template in `.github/ISSUE_TEMPLATE/bug_report.md`
2. Use labels: `bug`, `enhancement`, `documentation`, `help-wanted`
3. Create milestones for versions

### Releases

```bash
# Tag a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create release on GitHub with changelog
```

### Documentation in Wiki

Create GitHub Wiki with:

- Setup guide
- Architecture overview
- API guide
- Troubleshooting
- Contributing guidelines

## Example Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes with meaningful commits
3. Push branch: `git push origin feature/new-feature`
4. Create Pull Request on GitHub
5. Request review
6. Make requested changes if any
7. Merge PR
8. Delete branch

## Commands Reference

```bash
# View git status
git status

# View commits
git log --oneline

# View branches
git branch -a

# Create and switch branch
git checkout -b feature/name

# Merge branch
git checkout main
git merge feature/name

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Repository Settings

After creating repository:

1. **Settings → General**

   - Set main branch default
   - Enable squash merging
   - Enable auto-delete head branches

2. **Settings → Collaborators**

   - Add team members as needed
   - Set appropriate permissions

3. **Settings → Actions**

   - Enable GitHub Actions for CI/CD

4. **Settings → Security**
   - Enable vulnerability scanning
   - Set up security policy (SECURITY.md)

## Documentation to Add to README

### Installation & Setup

- Link to backend/README.md
- Link to frontend/README.md
- Quick start commands

### Features

- List main features
- Link to detailed documentation

### Project Structure

- Explain folder organization
- Point to specific READMEs

### Contributing

- Code style guidelines
- Testing requirements
- Commit message format

### License

- Add MIT or appropriate license
- Include license file

## Next Steps

1. Create GitHub account if needed
2. Create repository following steps above
3. Push code using git commands
4. Configure branch protection
5. Add additional documentation
6. Enable GitHub Actions for CI/CD
7. Invite collaborators
8. Create issues for future work
