# Git & GitHub Collaboration Guide

This guide teaches you how to push your code to GitHub and collaborate with teammates.

## Understanding Git Basics

**Git** = Version control system (tracks changes to your code)
**GitHub** = Cloud hosting for Git repositories (where your code lives online)

### Key Concepts:
- **Repository (repo)**: Your project folder with version control
- **Commit**: A snapshot of your code at a point in time
- **Push**: Upload your commits to GitHub
- **Pull**: Download changes from GitHub
- **Branch**: A separate line of development (like a parallel timeline)

---

## Step-by-Step: Pushing Your Code to GitHub

### Step 1: Check What Changed

First, see what files you've modified or created:

```bash
git status
```

This shows:
- **Modified files**: Files you changed
- **Untracked files**: New files not yet added to git
- **Staged files**: Files ready to be committed

### Step 2: Stage Your Changes

Before committing, you need to "stage" files (tell git which files to include):

**Option A: Add specific files**
```bash
git add README.md
git add backend/
git add frontend/
```

**Option B: Add all changes** (easier, but be careful!)
```bash
git add .
```

**What this does**: Moves files from "untracked/modified" to "staged" (ready to commit)

### Step 3: Commit Your Changes

Create a snapshot with a descriptive message:

```bash
git commit -m "Add backend and frontend framework with sidebar navigation"
```

**Good commit messages:**
- ✅ "Add user authentication API endpoints"
- ✅ "Fix sidebar active state highlighting"
- ✅ "Update README with setup instructions"
- ❌ "changes" (too vague)
- ❌ "asdf" (meaningless)

**What this does**: Creates a snapshot of your staged files with a message

### Step 4: Push to GitHub

Upload your commits to the remote repository:

```bash
git push origin main
```

**What this does**: 
- `origin` = Your GitHub repository (the remote)
- `main` = The branch you're pushing
- Uploads your commits to GitHub

**If it's your first push or branch changed:**
```bash
git push -u origin main
```
The `-u` flag sets up tracking so future pushes are simpler.

---

## Your Current Situation

Based on your git status, you have:
- ✅ Remote already configured: `origin` → `https://github.com/yifanliu0108/WIC-Project-team.git`
- 📝 Modified: `README.md`
- 🆕 New files: `backend/`, `frontend/`, `setup.sh`, `QUICKSTART.md`, `.gitignore`

### Commands You Need to Run:

```bash
# 1. Stage all your new files and changes
git add .

# 2. Commit with a descriptive message
git commit -m "Add complete backend and frontend framework for In Tune MVP"

# 3. Push to GitHub
git push origin main
```

---

## Collaboration Workflow for Your Team

### For Your Teammates (First Time Setup)

When teammates want to work on the project:

**1. Clone the repository:**
```bash
git clone https://github.com/yifanliu0108/WIC-Project-team.git
cd WIC-Project-team
```

**2. Set up the project:**
```bash
./setup.sh  # Run the setup script we created
```

**3. Create their own branch** (recommended for collaboration):
```bash
git checkout -b feature/their-name-or-feature
# Example: git checkout -b feature/emily-backend-api
```

### Daily Workflow (For Everyone)

**1. Before starting work, pull latest changes:**
```bash
git pull origin main
```

**2. Make your changes** (edit files, add features, etc.)

**3. Stage your changes:**
```bash
git add .
# Or: git add specific-file.js
```

**4. Commit:**
```bash
git commit -m "Description of what you changed"
```

**5. Push your branch:**
```bash
git push origin your-branch-name
```

**6. Create Pull Request on GitHub:**
- Go to GitHub website
- Click "Pull Requests" → "New Pull Request"
- Select your branch
- Add description
- Request review from teammates
- Merge after approval

---

## Branch Strategy (Recommended for Teams)

Instead of everyone working on `main`, use branches:

### Creating a Branch:
```bash
git checkout -b feature/your-feature-name
# Example: git checkout -b feature/add-spotify-integration
```

### Switching Branches:
```bash
git checkout main          # Switch to main
git checkout feature/xyz   # Switch to feature branch
```

### Pushing a Branch:
```bash
git push origin feature/your-feature-name
```

### Merging Back to Main:
- Use GitHub Pull Requests (recommended)
- Or merge locally: `git checkout main && git merge feature/xyz`

---

## Common Git Commands Cheat Sheet

```bash
# Check status
git status

# See what changed
git diff

# Add files
git add .                    # Add all
git add file.js              # Add specific file

# Commit
git commit -m "Message"

# Push
git push origin main

# Pull (get latest changes)
git pull origin main

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# See all branches
git branch

# See commit history
git log --oneline
```

---

## Important: What NOT to Commit

**Never commit these files** (they're in `.gitignore`):
- `.env` files (contain secrets/passwords)
- `node_modules/` (dependencies, too large)
- `__pycache__/` (Python cache files)
- `.DS_Store` (Mac system files)
- `venv/` or `env/` (Python virtual environments)

**Always commit:**
- Source code (`.py`, `.jsx`, `.js`, etc.)
- Configuration templates (`.env.example`)
- Documentation (`README.md`, etc.)
- Setup scripts

---

## Troubleshooting

### "Your branch is ahead of origin/main"
- You have local commits not pushed yet
- Solution: `git push origin main`

### "Your branch is behind origin/main"
- GitHub has changes you don't have
- Solution: `git pull origin main` (then resolve any conflicts)

### "Merge conflicts"
- Two people edited the same lines
- Git will mark conflicts with `<<<<<<<` markers
- Edit the file to resolve, then: `git add .` and `git commit`

### "Permission denied"
- You don't have write access to the repo
- Ask repository owner to add you as collaborator (Settings → Collaborators)

---

## Best Practices for Team Collaboration

1. **Always pull before starting work:**
   ```bash
   git pull origin main
   ```

2. **Use descriptive commit messages:**
   - What did you change?
   - Why did you change it?

3. **Commit often, push regularly:**
   - Small, frequent commits are better than huge ones
   - Push at least once per day

4. **Use branches for features:**
   - Keeps `main` stable
   - Easier to review changes

5. **Communicate with team:**
   - Let teammates know what you're working on
   - Discuss before making big changes

6. **Review Pull Requests:**
   - Check teammates' code before merging
   - Give constructive feedback

---

## Quick Reference: Your First Push

Here's exactly what to run right now:

```bash
# 1. See what changed
git status

# 2. Add everything
git add .

# 3. Commit
git commit -m "Add complete In Tune MVP framework with backend API and frontend React app"

# 4. Push
git push origin main
```

After this, your teammates can:
```bash
git pull origin main
```

To get all your changes!

---

## Next Steps After Pushing

1. **Share the repository link** with your team
2. **Add collaborators** (GitHub → Settings → Collaborators)
3. **Set up branch protection** (optional, for main branch)
4. **Create issues** for tasks/features
5. **Use Pull Requests** for code review

Happy collaborating! 🎵
