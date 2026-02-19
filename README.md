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

## Plugin Configuration

### Zotero Integration

**Prerequisites:**
- Zotero Desktop installed
- Better BibTeX plugin for Zotero (recommended for stable citekeys)

**Setup:**

1. **In Obsidian:** Settings → Community plugins → Zotero Integration

2. **Configure settings:**

   **Download PDF Utility:**
   - Click "Download PDF Utility" in the settings panel
   - This enables PDF highlight extraction
   - Leave 'PDF Utility Override' empty

   **Database:** Zotero
   
   **Note Import Location:** `Inputs/Zotero`
   
   **Open the created or updated note(s) after import:** ON
   
   **Which notes to open after import:** First imported note
   
   **Enable Annotation Concatenation:** OFF

3. **Citation Formats:**
   - **Name:** Cite
   - **Output Format:** Formatted Citation
   - **Citation Style:** American Psychological Association 7th edition (or your preferred style)

4. **Import Formats:**
   - **Name:** Zotero import
   - **Template File:** `_system/Templates/_Plugin Templates/Zotero Template.md`
   - **Bibliography Style:** American Psychological Association 7th edition

5. **Image Settings:**
   - **Image format:** jpg
   - **Image Quality:** 90
   - **Image DPI:** 120
   - **Image OCR:** OFF

6. **Test:**
   - In Zotero, right-click a paper
   - Select "Send to Obsidian"
   - A note should appear in `Inputs/Zotero/`

---

### Readwise Integration

**Prerequisites:** Readwise account with highlights

**Setup:**

1. **Get your API token:**
   - Go to https://readwise.io/access_token
   - Copy your token

2. **In Obsidian:** Settings → Community plugins → Readwise Official
   - **API Token:** Paste your token
   - **Customize base folder:** `Inputs/Readwise`
   - **Sync on startup:** Toggle ON

3. **Configure Readwise export settings** (IMPORTANT - this customizes how notes are formatted):
   - Go to https://readwise.io/export/obsidian/preferences
   - Configure each section as follows:

**File Name:**
```
{{author|replace('#', '')|replace('@', '')|replace(' on Twitter', '')}}_{{title|replace('#', '')|replace('@', '')}}
```

**Page Title:** Leave blank

**Page Metadata:**
````markdown
```button
name Create Reference Note
type cursor template
action Buttons/Reference Note
```
- M [[Sources]]{% if url %}
    - URL: [{{title|replace('#', '')|replace('@', '')}}]({{ url }}){% endif %} {% if summary %}
## Summary
> {{ summary }} 
{% endif %}
**Mentions**
```dataviewjs
dv.view("mentions", {
  fields: ["note"]
})
```
````

**Highlights Header:**
```markdown
# Highlights 
---
```

**Highlight:**
```markdown
<mark style="background-color: #ffd440">{{ highlight_text }}</mark> {% if highlight_tags %}{% for tag in highlight_tags %} #{{tag}} {% endfor %}{% endif %}{% if highlight_note %}
### Comment
{{ highlight_note }}
{% endif %}
```

**YAML Frontmatter:**
```yaml
class: Sources
category: Readwise
author: <% await tp.user.processAuthorLinks(tp, "{{author|replace('#', '')|replace('@', '')|replace(' on Twitter', '')}}") %>
sourceTitle: {{title|replace('#', '')|replace('@', '')}}
type: input
itemType:  {{category}}
source: {{source}}
date_saved: {{last_highlighted_date|date('y.m.j')}}{% if source %}
site_name: {{ source }} {% endif %}{% if source_url %}
sourceLink: [🔗]({{ source_url }}){% endif %}{% if highlights_url %}
readwiseLink:[Readwise](https://readwise.io/bookreview/{{book_id}})
highlights_url: {{ highlights_url }}{% endif %}{% if num_highlights %}
num_highlights: {{ num_highlights }}{% endif %}
flag: null
tags: {% for tag in document_tags %}[[{{tag}}]] {% endfor %} 
note:
```

**Sync Notification:**
```markdown
## {{date|date('y.m.j')}}
**Synced {{num_highlights}} highlight{{num_highlights|pluralize}} from {{num_books}} document{{num_books|pluralize}}.**
{% for book in books %}    - {{ book.num_highlights_added}} highlights from [[{{ book.title }}]]
{% endfor %}
```

4. **Save settings** in Readwise

5. **Back in Obsidian:**
   - Settings → Readwise Official → Click "Sync now"
   - Your highlights will appear in `Inputs/Readwise/` with custom formatting

**Note:** The custom template includes:
- A "Create Reference Note" button (just like Zotero notes)
- Proper formatting for highlights with colors
- Dataview queries for tracking mentions
- Clean author/title formatting (removes @ and # symbols)

---

### Set Yourself as Vault Author

When you create Reference Notes or import sources, the vault needs to know who you are so it can add your name as the note author.

**How to set up:**

1. **Create your People note:**
   - Use the Production hotkey (Cmd+Ctrl+P) and select "5. Profile"
   - Enter your name

2. **Add vaultAuthor to frontmatter:**
   - Switch to source mode (click '...' in top right)
   - Add `vaultAuthor: true` to your YAML frontmatter:

```yaml
---
class: People
category: People
type: moc
title: Your Name
vaultAuthor: true
created: 26.02.11
tags: 
flag: false
note: 
aliases: 
---
```

3. **Important:** Only ONE note should have `vaultAuthor: true` - this tells the vault which person is you

**Test it:**
- Import a Zotero note or create a Reference Note
- Check the `noteAuthor` field
- It should show your name as a clickable link: `noteAuthor: "[[Your Name]]"`

**Note:** If you don't set this up, notes will show `noteAuthor: "[[Unknown Author]]"` instead.

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
- KOI-Sync cache (`rid_cache/`)

### Verify Security

After setup, check that sensitive files are ignored:
```bash
git check-ignore .obsidian/plugins/readwise-official/data.json
git check-ignore .obsidian/plugins/koi-sync/data.json
git check-ignore .smart-env/
git check-ignore rid_cache/
```

All should output their filepath (meaning they're ignored).

---

## Mobile Setup

If using Obsidian mobile with Obsidian Sync:

### Initial Setup

1. **Set your vault author** (see above for instructions)

2. **Update the mobile note template:**
   - Open `_system/Templates/+New Notes/Simple Note Mobile.md`
   - Change `noteAuthor: "[[Ellie Rennie]]"` to your name
   - Example: `noteAuthor: "[[Your Name]]"`

3. **Configure default note location:**
   - Settings → Files & Links → Default location for new notes: `Notes`

4. **Enable Obsidian Sync:**
   - Settings → Sync → Sign in
   - Choose what to sync: 
     - ✅ Settings
     - ✅ Themes and snippets  
     - ✅ Plugins
     - ✅ Hotkeys
     - ✅ Core plugin settings
     - ✅ Community plugin settings

5. **Configure excluded folders** (IMPORTANT):
   - Settings → Sync → Excluded folders → Add these:
   ```
   .git
   .obsidian/workspace.json
   .obsidian/workspace-mobile.json
   rid_cache
   ```

### Plugin Compatibility

**✅ Will work on mobile:**
- Dataview (for queries and MOCs)
- Templater (basic features)
- Readwise Official (syncs highlights)
- Quick Add
- Button Maker
- Most formatting/UI plugins

**❌ Won't work on mobile:**
- **Zotero Integration** (requires Zotero Desktop)
- **Smart Connections** (embeddings stay on desktop)
- Any plugin requiring desktop applications

**Workflow:** Import sources (Zotero/Readwise) on desktop. Read, annotate, and create notes on mobile!

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
   - Select text → Cmd+Shift+R → Capture Quote
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
| **Cmd+Shift+R** | Referencing menu (quotes, references) |
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

## About

Created for ethnographic and qualitative research workflows by Ellie Rennie.

**Development:**  
Ellie Rennie and Matthew Green (Research Assistant)

**For questions or support:**
- Workshop Guide: [Navigation/Documentation/Workshop Guide.md](Navigation/Documentation/Workshop%20Guide.md)
- GitHub Issues: https://github.com/ellierennie/Telescope-Obsidian-Vault/issues

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
> "Based on the *Telescope Obsidian Vault* by Ellie Rennie and Matthew Green (CC BY-NC 4.0)"

---

*Last updated: February 2026*
