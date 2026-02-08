# Telescope Obsidian Vault

A comprehensive Obsidian vault for ethnographic and qualitative research, designed to integrate sources from Zotero and Readwise with field notes, synthesis, and analysis.

---

## Overview

This vault provides a complete workflow for research:
- **Import sources** from Zotero (academic papers) and Readwise (articles, highlights)
- **Create permanent Reference Notes** to preserve your analysis when sources sync
- **Write field notes** and link them to sources and people
- **Capture quotes** that automatically appear in Reference Notes
- **Track people** and their connections across your research
- **Organize themes** with Maps of Content (MOCs)
- **Manage tasks** with integrated logs and reminders

---

## Quick Start

### For Workshop Participants

**New to this vault?** See the [Workshop Guide](Navigation/Documentation/Workshop%20Guide.md) for:
- Detailed installation instructions
- Complete workflow tutorial
- Hands-on exercises
- Troubleshooting tips

### Two Setup Options

**Option A: Independent Copy** (customize freely)
```bash
git clone https://github.com/ellierennie/Telescope-Obsidian-Vault.git My-Research-Vault
cd My-Research-Vault
```

**Option B: Team Use** (receive updates)
```bash
# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR-USERNAME/Telescope-Obsidian-Vault.git
cd Telescope-Obsidian-Vault
git remote add upstream https://github.com/ellierennie/Telescope-Obsidian-Vault.git
```

Then open the folder in Obsidian and trust the vault to enable plugins.

---

## What's Included

### Folder Structure

```
📁 Inputs/               ← Sources (gitignored - stays local)
  📁 Zotero/            ← Academic papers & books
  📁 Readwise/          ← Web articles, highlights

📁 Notes/               ← Field notes, memos (gitignored)

📁 People/              ← Person profiles (gitignored)

📁 Synthesis/           ← Analysis & Reference Notes (gitignored)
  📁 Reference Notes/   ← Permanent deep-dives on sources

📁 Navigation/          ← Hub pages and documentation
  📁 Documentation/     ← Guides and hotkey references
  📁 Notes/            ← Reminders, logs, dashboards

📁 _system/             ← Templates, scripts, styling
  📁 Templates/        ← Note templates
  📁 JS_Scripts/       ← Dataview and Templater functions
```

### Pre-configured Plugins

**Essential:**
- **Dataview** - Dynamic queries and dashboards
- **Templater** - Template automation
- **Zotero Desktop Connector** - Import academic sources
- **Readwise Official** - Sync web highlights
- **Buttons** - One-click actions in notes

**Supporting:**
- Recent Files, Quick Switcher++, Calendar, and more

All plugin settings are included (except API keys - see Security below).

### Templates

- **Zotero Template** - Auto-formats imported papers
- **Readwise Template** - Structures web highlights  
- **Reference Note** - Permanent analysis of sources
- **Person Template** - People profiles
- **Field Notes** - Session notes, meetings, memos
- **Maps of Content** - Theme/project hubs

---

## Plugin Configuration

### Zotero Desktop Connector

**Setup:**
1. Install Zotero Desktop with Better BibTeX (recommended)
2. In Obsidian: Settings → Zotero Desktop Connector
3. Settings are pre-configured:
   - Literature notes folder: `Inputs/Zotero`
   - Template: `_system/Templates/_Plugin Templates/Zotero Template.md`
4. Download PDF Utility (in plugin settings) for highlight extraction
5. Test: Right-click item in Zotero → "Send to Obsidian"

### Readwise Official

**Setup:**
1. Get your API token from https://readwise.io/access_token
2. In Obsidian: Settings → Readwise Official
3. Add your API token (this stays local, not synced to git)
4. Pre-configured export folder: `Inputs/Readwise`
5. Click "Sync now"

### Smart Connections (Optional)

If using Smart Connections for AI-powered research:
1. Add your API key in plugin settings (stays local)
2. Embeddings are stored in `.smart-env/` (gitignored)
3. Re-index after cloning to a new machine

---

## Security & Privacy

### What's Synced to GitHub

✅ **Included:**
- Vault structure and templates
- Plugin configurations (without API keys)
- Hotkeys and settings
- Documentation and guides
- Scripts and automations

❌ **Excluded (gitignored):**
- Your personal notes (`Notes/`, `Inputs/`, `People/`, `Synthesis/`)
- API keys and tokens
- Smart Connections embeddings (`.smart-env/`)
- Zotero attachments
- Obsidian workspace/cache files

### Verify Security

After setup, check that sensitive files are ignored:
```bash
git check-ignore .obsidian/plugins/readwise-official/data.json
git check-ignore .obsidian/plugins/koi-sync/data.json
git check-ignore .smart-env/
```

All three should output their filepath (meaning they're ignored).

---

## Core Workflow

1. **Import sources** 
   - Zotero: Right-click → Send to Obsidian
   - Readwise: Auto-syncs highlights

2. **Create Reference Notes**
   - Open source note → Click "Create Reference Note" button
   - Your analysis stays permanent even when source syncs update

3. **Write field notes**
   - Cmd+Shift+N → Choose note type
   - Link to sources: `[[source-name]]`
   - Link to people: `[[People/Person Name]]`

4. **Capture quotes**
   - Select text → Cmd+Shift+P → Capture Quote
   - Quotes auto-appear in source's Reference Note

5. **Organize with MOCs**
   - Create hub pages for themes/projects
   - Link related notes together
   - Navigate research visually

6. **Track tasks**
   - Add tasks anywhere: `- [ ] Task description`
   - View all tasks in `Navigation/Notes/2. Reminders`

---

## Key Hotkeys

| Hotkey | Action |
|--------|--------|
| **Cmd+P** | Command Palette |
| **Cmd+O** | Quick switcher (find notes) |
| **Cmd+Shift+N** | New Notes menu |
| **Cmd+Shift+P** | Referencing menu (quotes, references) |
| **Ctrl+Cmd+L** | Log Tool (quick capture) |
| **Ctrl+Cmd+Z** | Import from Zotero |

Full list: See `Navigation/Documentation/All Hotkeys`

---

## Documentation

- **Workshop Guide** - Complete tutorial for new users
- **All Hotkeys** - Interactive list of all shortcuts
- **Feature Guides** - In `Navigation/Documentation/`

Press **Cmd+P** → Type "Documentation" to find guides.

---

## Getting Updates

**If you forked the repo (Option B):**

```bash
# Pull latest changes from main vault
git fetch upstream
git merge upstream/main

# Push to your fork
git push
```

Your personal notes (in gitignored folders) won't be affected.

---

## Customization

### Modify Templates

Templates are in `_system/Templates/`:
- Edit templates to change default structure
- Changes apply to all new notes using that template

### Adjust Hotkeys

Settings → Hotkeys → Search for command → Reassign

### Add New Dataview Queries

Custom queries go in `_system/Templates/JS_Scripts/JS-DV/`

---

## Requirements

- **Obsidian** 1.4.0 or later
- **Zotero Desktop** (for academic source import)
- **Readwise account** (for web highlight sync) - optional
- **Git** (for version control and updates)

---

## Troubleshooting

**Plugins not working?**
- Settings → Community plugins → Enable them
- Restart Obsidian

**Zotero import failing?**
- Ensure Zotero Desktop is running
- Download PDF Utility in plugin settings
- Check template path is correct

**Hotkeys not working?**
- Check for conflicts in Settings → Hotkeys
- macOS/Windows use different modifier keys

**More help:** See [Workshop Guide](Navigation/Documentation/Workshop%20Guide.md) troubleshooting section

---

## Contributing

This vault is designed for ethnographic research workflows. Suggestions and improvements welcome:
- Open an issue on GitHub
- Submit a pull request
- Share your customizations

---

## License

**Vault structure, templates, and documentation:**  
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

**Custom code and scripts (JavaScript, CSS):**  
MIT License

**Third-party plugins:**  
Included for convenience. Each plugin retains its original license (see individual plugin repositories on GitHub).

### Attribution

When using or adapting this vault:
> "Based on the *Telescope Obsidian Vault* by Ellie Rennie (CC BY-NC 4.0)"

---

## About

Created for ethnographic and qualitative research workflows by Ellie Rennie and Matthew Green.

**For questions or support:**
- Workshop Guide: [Navigation/Documentation/Workshop Guide.md](Navigation/Documentation/Workshop%20Guide.md)
- GitHub Issues: https://github.com/ellierennie/Telescope-Obsidian-Vault/issues

---

*Last updated: February 2026*
