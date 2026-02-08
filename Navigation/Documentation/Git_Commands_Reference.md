# Git Commands Quick Reference

Your personal guide for updating the Telescope Vault on GitHub.

---

## Basic Workflow (Most Common)

### After making changes in your vault:

```bash
# 1. Navigate to your vault
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git

# 2. Check what changed
git status

# 3. Add specific files
git add "path/to/file.md"

# OR add everything that changed
git add .

# 4. Commit with a message
git commit -m "Describe what you changed"

# 5. Push to GitHub
git push
```

---

## Common Commands

### Check Status

```bash
# See what files have changed
git status

# See detailed changes in files
git diff

# See which files would be ignored
git status --ignored
```

### Adding Files

```bash
# Add a specific file
git add "Navigation/Documentation/Workshop Guide.md"

# Add all files in a folder
git add "Navigation/Documentation/"

# Add everything (be careful!)
git add .

# Add multiple specific files
git add file1.md file2.md file3.md
```

### Committing

```bash
# Commit with a message
git commit -m "Your descriptive message here"

# Add and commit in one step (only works for already-tracked files)
git commit -am "Your message"
```

### Pushing & Pulling

```bash
# Push your changes to GitHub
git push

# Pull latest changes from GitHub
git pull

# Pull from the main branch specifically
git pull origin main
```

---

## Fixing Mistakes

### Undo Changes Before Committing

```bash
# Undo changes to a specific file (restore from last commit)
git checkout HEAD -- "path/to/file.md"

# Undo ALL uncommitted changes (CAREFUL!)
git reset --hard HEAD
```

### Undo After Committing (But Before Pushing)

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes
git reset --hard HEAD~1
```

### Fix Last Commit Message

```bash
# Change the message of your last commit
git commit --amend -m "New better message"
```

---

## Viewing History

```bash
# See commit history (short)
git log --oneline

# See commit history (detailed)
git log

# See what changed in last commit
git show

# See changes in a specific file over time
git log -p "path/to/file.md"
```

---

## Working with Branches (Advanced)

```bash
# Create a new branch
git branch new-feature

# Switch to a branch
git checkout new-feature

# Create and switch in one command
git checkout -b new-feature

# See all branches
git branch -a

# Merge a branch into current branch
git merge branch-name

# Delete a branch
git branch -d branch-name
```

---

## Checking What's Ignored

```bash
# See what files git is ignoring
git status --ignored

# Check if a specific file is ignored
git check-ignore -v "path/to/file"

# See what's in .gitignore
cat .gitignore
```

---

## Common Scenarios

### Scenario 1: Update a Single File

```bash
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git
git add "Navigation/Documentation/Workshop Guide.md"
git commit -m "Update workshop guide"
git push
```

### Scenario 2: Update Multiple Files

```bash
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git
git add "Navigation/Documentation/*.md"
git commit -m "Update all documentation files"
git push
```

### Scenario 3: Update Templates

```bash
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git
git add "_system/Templates/"
git commit -m "Update Zotero and Reference Note templates"
git push
```

### Scenario 4: Before Workshop - Get Latest

```bash
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git
git pull
# Now you have the latest version
```

### Scenario 5: Check What Will Be Pushed

```bash
cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git
git status
git diff
# Review changes, then:
git push
```

---

## Helpful Aliases (Optional)

Add these to make commands shorter:

```bash
# In Terminal, run once:
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# Now you can use:
git st    # instead of git status
git co    # instead of git checkout
git br    # instead of git branch
git ci    # instead of git commit
```

---

## Important Reminders

### What Gets Synced

✅ **SYNCED to GitHub:**
- Templates and vault structure
- Documentation and guides
- Plugin settings (except API keys)
- Hotkeys

❌ **NOT SYNCED (stays local):**
- Your personal notes (`Notes/`, `Inputs/`, `People/`, `Synthesis/`)
- API keys and tokens
- Smart Connections embeddings
- Obsidian workspace/cache

### Safety Tips

1. **Always check `git status` before `git add .`**
   - Make sure you're not accidentally adding personal notes

2. **Use descriptive commit messages**
   - Good: "Fix vaultAuthor in Reference Note template"
   - Bad: "updates" or "changes"

3. **Pull before you push** (if working on multiple computers)
   ```bash
   git pull
   git push
   ```

4. **Keep sensitive data out of git**
   - `.gitignore` protects your API keys and personal notes
   - Double-check with: `git check-ignore filename`

---

## Troubleshooting

### "Nothing to commit, working tree clean"
- You haven't made any changes since last commit
- Or your changes are in gitignored folders

### "Updates were rejected"
- Someone else pushed changes first
- Solution: `git pull` then `git push`

### "Your branch is ahead of origin/main"
- You've committed but haven't pushed
- Solution: `git push`

### "Merge conflict"
- Same file edited in two places
- Open the file, resolve conflicts, then:
  ```bash
  git add conflicted-file.md
  git commit -m "Resolve merge conflict"
  git push
  ```

### Accidentally added wrong file
```bash
# Before committing:
git reset HEAD file-to-unstage.md

# After committing but before pushing:
git reset --soft HEAD~1  # Undo commit, keep changes
# Then re-add only what you want
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Check status | `git status` |
| Add file | `git add "filename"` |
| Add all | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push` |
| Pull | `git pull` |
| See history | `git log --oneline` |
| Undo changes | `git checkout HEAD -- "filename"` |
| Check ignored | `git check-ignore "filename"` |

---

## Your Typical Workflow

```bash
# After editing files in Obsidian:

cd /Users/elinorrennie/Documents/Telescope-VAULT-OBS-Git

git status                    # See what changed
git add .                     # Add everything (or specific files)
git commit -m "Description"   # Commit with message
git push                      # Push to GitHub

# Done!
```

---

*Last updated: February 2026*  
*For Telescope Obsidian Vault*
