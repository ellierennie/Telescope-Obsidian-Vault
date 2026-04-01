# Telescope Vault Workshop Guide

## Welcome!

This guide will help you set up and use the Telescope Obsidian vault for ethnographic research. The vault is designed to help you:
- Import sources from Zotero and Readwise
- Create field notes and synthesis notes
- Track quotes and connections between ideas
- Organize people, themes, and projects

## Part 1: Getting Started - Two Installation Options

### Option A: Clone for Independent Use
**Use this if:** You want a starting point to customize for your own needs, independent of future updates.

1. **Install Obsidian** from [obsidian.md](https://obsidian.md)

2. **Clone the repository:**
   ```bash
   # In Terminal (Mac) or Command Prompt (Windows)
   cd ~/Documents  # or wherever you want the vault
   git clone https://github.com/ellierennie/Telescope-Obsidian-Vault.git My-Research-Vault
   ```

3. **Open in Obsidian:**
   - Launch Obsidian
   - Click "Open folder as vault"
   - Navigate to `My-Research-Vault`
   - Click "Open"

4. **Trust and enable plugins:**
   - Obsidian will ask if you trust the vault
   - Click "Trust author and enable plugins"
   - Wait for community plugins to install

5. **You're done!** This vault is now independent. You can customize it freely without affecting the original.

---

### Option B: Fork for Ongoing Updates
**Use this if:** You're part of the research team and want to receive updates as the vault evolves.

1. **Fork the repository** (if you want your own copy on GitHub):
   - Go to https://github.com/ellierennie/Telescope-Obsidian-Vault
   - Click "Fork" in the top right
   - This creates your own copy

2. **Clone YOUR fork:**
   ```bash
   cd ~/Documents
   git clone https://github.com/YOUR-USERNAME/Telescope-Obsidian-Vault.git
   cd Telescope-Obsidian-Vault
   ```

3. **Set up to receive updates:**
   ```bash
   # Add the original repo as "upstream"
   git remote add upstream https://github.com/ellierennie/Telescope-Obsidian-Vault.git
   ```

4. **Open in Obsidian** (same as Option A, step 3)

5. **To get updates later:**
   ```bash
   # Pull latest changes from the main vault
   git fetch upstream
   git merge upstream/main
   
   # Push to your fork
   git push
   ```

**Note:** Your personal notes (in `Notes/`, `Inputs/`, `People/`, `Synthesis/` folders) won't be synced to GitHub - they stay private on your computer.

---

## Part 2: Essential Setup

### Set Yourself as Vault Author 

When you create Reference Notes or import sources, the vault needs to know who you are so it can add your name as the note author. 

**How to set up:** 
1. **Create your People note:** - Use the 'Production' hotkey (Cmd+Shift+P) and select 5. Profile. Enter name. Go to your Profile note. 
2. **In source mode (via top right '...'), manually add vaultAuthor to the frontmatter.** 
   - Switch to source mode by clicking the '...' menu in the top right
   - In the YAML frontmatter, type a new line: `vaultAuthor: true`
   - Your frontmatter should look like this: 
````
yaml 
--- 
class: People
category: People
type: moc
title: [name you entered will appear here]
vaultAuthor: true 
created: 26.02.11
tags: 
flag: false
note: 
aliases: 
--- 
````

**Important:** Only ONE note should have `vaultAuthor: true` - this tells the vault which person is you 
**Test it:** - Import a Zotero note or create a Reference Note - Check the `noteAuthor` field - It should show your name as a clickable link: `noteAuthor: "[[Your Name]]"` 
**Note:** If you don't set this up, notes will show `noteAuthor: "[[Unknown Author]]"` instead.


### Configure Zotero Integration

**Prerequisites:** 
- Zotero Desktop installed
- Better BibTeX plugin for Zotero (optional but recommended)
 - Literature notes will appear in folder `Inputs/Zotero`

**Setup:**

1. In Obsidian: **Settings → Community plugins → Zotero Integration**

2. Configure these settings:

**Download PDF Utility:**
   - In the same settings panel, click "Download PDF Utility"
   - This enables PDF highlight extraction
   - Leave 'PDF Utility Override' empty

**Database:** Zotero
Note Import Location: Inputs/Zotero
Open the created or updated note(s) after import - ON
Which notes to open after import - First imported note
Enable Annotation Concatenation - OFF

**Citation Formats**

**Name:** Cite
**Output Format:** Formatted Citation
**Citation Style:** American Psychological Association 7th edition (or your preferred style)

**Import Formats**
Name: Zotero import
Output path: Inputs/Zotero/{{citekey}}.md
Image Output path: Inputs/Zotero/{{citekey}}.md

**Image Output Path:** Inputs/Zotero/{{citekey}}/Images

**Template File:**
_system/Templates/_Plugin Templates/Zotero Template.md

**Bibliography Stye:** American Psychological Association 7th edition

Import Image settings
Image format: jpg
Image Quality (jpg only) 90
Image DPI: 120
Image OCR: OFF
Tesseract Path: [empty]
Image OCR Language: [empty]
Tesseract data directory: [empty]

4. **Optional test**
   - In Zotero, right-click a paper
   - Select "Send to Obsidian"
   - A note should appear in `Inputs/Zotero/`

---

### Configure Readwise Integration

**Prerequisites:** Readwise account with highlights

**Setup:**
In Obsidian: **Settings → Community plugins → Readwise Official**

1. Setting page
- Customise base folder: Inputs/Readwise
- **Sync on startup:** Toggle ON
- Click "Sync now"

2. **Configure Readwise export settings** (IMPORTANT - this customizes how notes are formatted):
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
    - URL: [{{title|replace('#', '')|replace('@', '')}}]({{ url }}){% endif %}{% if source_url %}
    - Source: [View original]({{ source_url }}){% endif %} {% if summary %}
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
   - Your highlights will appear in `Inputs/Readwise/` with the custom formatting

**Note:** The custom template includes:
- A "Create Reference Note" button (just like Zotero notes)
- Proper formatting for highlights with colors
- Dataview queries for tracking mentions
- Clean author/title formatting (removes @ and # symbols)
- Direct links to source material (including specific tweets)

---

### Mobile Workflow for Readwise

**Saving content from mobile devices (especially tweets):**

The Readwise Official plugin syncs highlights, so you need to highlight content for it to appear in Obsidian.

**Best method - Use Readwise Reader app:**

1. **From X (Twitter) mobile app:**
   - Tap the share icon on a tweet
   - Select "Copy Link"

2. **In Readwise Reader app:**
   - Tap "+" to add new item
   - Paste the tweet URL
   - Reader imports the tweet

3. **Highlight in Reader:**
   - Open the tweet in Reader
   - Highlight the tweet text (or any part you want to save)
   - Your highlight syncs to Obsidian with the custom template

4. **In Obsidian:**
   - Settings → Readwise Official → Sync now
   - The tweet appears in `Inputs/Readwise/` with a direct link to the original tweet

**Alternative - Browser extension on desktop:**
- Install Readwise browser extension
- Open tweet on desktop
- Click extension → Save
- More reliable than mobile app for tweets

**Why highlighting is required:** Readwise only syncs highlighted content to Obsidian. Just saving an item keeps it in Reader but doesn't send it to your vault. This helps you be intentional about what you save.


---

## Part 3: How the Vault Works

### The Folder Structure

```
📁 Inputs/               ← Sources come in here
  📁 Zotero/            ← Academic papers & books
  📁 Readwise/          ← Articles, tweets, highlights

📁 Notes/               ← Your field notes, memos, writing

📁 People/              ← Person profiles

📁 Synthesis/           ← Where you make sense of sources
  📁 Reference Notes/   ← Deep dives on important sources
  📁 (other notes)      ← Themes, analyses, outputs

📁 Navigation/          ← Hub pages and documentation

📁 _system/             ← Templates and scripts (don't touch)
```

---

### Core Workflow

#### 1. Sources Come In

**From Zotero:**
- Import a paper → Creates a note in `Inputs/Zotero/`
- Includes: metadata, abstract, your PDF highlights
- Has a "Create Reference Note" button

**From Readwise:**
- Syncs automatically
- Creates notes in `Inputs/Readwise/`
- Includes: highlights, tags, source links

---

#### 2. Create Reference Notes (The Important Part!)

**Why Reference Notes matter:**

When you sync Zotero or Readwise again, those source files get **overwritten** with new content. Any notes you added directly to them will be lost!

**Solution:** Create a Reference Note

**How:**

1. Open a Zotero or Readwise source note
2. Click the **"Create Reference Note"** button at the top
3. Add a brief comment when prompted
4. A new note appears in `Synthesis/Reference Notes/`

**What you get:**
- A permanent copy of the source content
- Space for your notes and analysis
- Automatic display of quotes you create from this source
- Links to related notes
- Safe from sync overwrites!

**Example:**

```
Zotero Note: andrejevicValueDigitalTwins2025.md
  ↓ (click "Create Reference Note" button)
Reference Note: REF_andrejevicValueDigitalTwins2025.md
  → Your notes stay here forever
  → Source can sync/update without losing your work
```

---

#### 3. Create Field Notes and Writing

**Create a new note:**

Press **Cmd+Shift+N** (Mac) or **Ctrl+Shift+N** (Windows)

Options:
- **Custom Input** - Blank note for field notes, memos
- **Session Notes** - Structured template for field sessions
- **Meetings** - Meeting notes with attendees
- **Assignments** - Task tracking

**Link to sources:**

In your note, reference sources:
```markdown
As Andrejevic argues [[andrejevicValueDigitalTwins2025]], 
digital twins create new forms of enclosure...
```

This creates a connection that appears in "Related Notes"

---

#### 4. Capture Quotes

**Method 1: Using the Referencing Hotkey**

1. Select text from any note
2. Press **Cmd+Shift+R** (Referencing menu)
3. Choose "Capture Quote"
4. A quote note is created and linked

**Method 2: Manual Quote Note**

Create a note with:
```yaml
---
type: Synthesis
class: Quotes
source: "[[source-note-name]]"
---

The quoted text here...
```

**Why quotes matter:**
- They appear automatically in the source's Reference Note
- You can tag and comment on them
- Easy to find all quotes from a source
- Preserves attribution

---

#### 5. Track People

**Create a person profile:**

1. In any note, create a link: `[[People/Jane Doe]]`
2. Click the link to create the note
3. Apply the Person template (or add manually):

```yaml
---
type: People
class: People
---

# Jane Doe

## Bio
- Role: 
- Organization:
- Contact:

## Related Notes
[Dataview query shows all mentions automatically]
```

**Benefits:**
- Click any person's name → see all related notes
- Track connections between people
- Build a network map of your research

---

#### 6. Maps of Content (MOCs)

**What they are:**
MOCs are hub pages that organize notes around a theme or project.

**Create an MOC:**

1. Create or open a note
2. Press **Cmd+Shift+N** → "Make this a Map of Content"
3. Add links to related notes:

```markdown
# Digital Twins Research MOC

## Key Sources
- [[REF_andrejevicValueDigitalTwins2025]]
- [[REF_baradQuantumEntanglements]]

## Field Notes
- [[2024-01-15 Interview with Factory Manager]]
- [[2024-01-20 Warehouse Observation]]

## People
- [[People/Mark Andrejevic]]
- [[People/Karen Barad]]

## Themes
- Surveillance and prediction
- Virtual replicas
- Environmental control
```

**Use MOCs for:**
- Project overviews
- Thematic collections
- Literature reviews
- Chapter planning

---

## Part 4: Logs and Reminders

### The Log Tool (Ctrl+Cmd+L)

**What it does:**
Quickly capture tasks and reminders from anywhere in your vault.

**How to use:**

1. Press **Ctrl+Cmd+L** (or Cmd+P → "Log Tool")
2. Choose where to log:
   - **Active Note** - Add to current note
   - **Daily Note** - Add to today's daily note
   - **Comments Log** - Central log file
   - **Obsidian Log** - System-wide log

3. Type your reminder:
```
- [ ] Follow up with Jane about interview
- [ ] Review Chapter 3 draft
- [ ] Code field notes from March
```

---

### The Reminders Page

**Location:** `Navigation/Notes/2. Reminders`

**What it shows:**
All incomplete tasks from across your vault, organized by note type:
- Notes
- Reference Notes
- Meetings
- Assignments
- Sessions

**How it works:**
- Uses Dataview to automatically find all `- [ ]` tasks
- Updates in real-time as you complete tasks
- Click any task to jump to its note

**Example view:**

```
## Notes
From [[2024-02-08 Field Notes]]:
- [ ] Transcribe audio
- [ ] Follow up on observation

## Reference Notes  
From [[REF_andrejevicDigitalTwins]]:
- [ ] Compare with Barad's framework
- [ ] Find examples in field data
```

**To complete a task:**
- Change `- [ ]` to `- [x]` 
- It disappears from Reminders automatically

---

## Part 5: Key Hotkeys

| Hotkey | Action |
|--------|--------|
| **Cmd+P** | Command Palette (find anything) |
| **Cmd+Shift+N** | New Notes menu |
| **Cmd+Shift+R** | Referencing menu (quotes, references) |
| **Cmd+Shift+O** | Open Notes menu |
| **Ctrl+Cmd+L** | Log Tool |
| **Ctrl+Cmd+Z** | Import from Zotero |
| **Cmd+O** | Quick switcher (find notes) |
| **Cmd+Shift+F** | Search in all notes |

**View all hotkeys:** Open `Navigation/Documentation/All Hotkeys`

---

## Part 6: Best Practices

### Daily Workflow

**Morning:**
1. Open Reminders page - review tasks
2. Sync Readwise (if enabled)
3. Check what needs attention

**During research:**
1. Import sources → Create Reference Notes immediately
2. Capture quotes as you read
3. Link people when you mention them
4. Use Log Tool for quick captures

**End of day:**
1. Review new sources
2. Update MOCs
3. Check Reminders page

---

### Organizing Tips

**Naming conventions:**
- **Sources:** Auto-named by plugins (don't rename)
- **Reference Notes:** `REF_SourceName` (automatic)
- **Field Notes:** `YYYY-MM-DD Topic` 
- **People:** `Last, First` or `Full Name`
- **MOCs:** `Topic Name MOC`

**Tags vs Links:**
- **Links** (`[[Note Name]]`): For specific connections
- **Tags** (`#theme`): For broad categorization
- Use both! They serve different purposes

**Folder structure:**
- Don't overthink it
- Sources go in `Inputs/`
- Everything else in `Notes/` or `Synthesis/`
- Use MOCs instead of deep folder hierarchies

---

## Part 7: Troubleshooting

### Plugins not working

**Check:**
1. Settings → Community plugins → Make sure they're enabled
2. Try disabling and re-enabling
3. Restart Obsidian

### Zotero import not working

**Check:**
1. Zotero Desktop is running
2. PDF Utility is downloaded (Settings → Zotero)
3. Template path is correct
4. Try right-clicking item → "Send to Obsidian"

### Readwise not syncing

**Check:**
1. API token is entered correctly
2. Export folder is set to `Inputs/Readwise`
3. Click "Sync now" manually
4. Check Readwise account has highlights

### Hotkeys not working

**Check:**
1. Settings → Hotkeys → Search for the command
2. Make sure no conflicts with other apps
3. Try reassigning the hotkey

### Dataview queries not showing results

**Check:**
1. Dataview plugin is enabled
2. Wait 10 seconds after creating notes (indexing delay)
3. Check frontmatter has correct `class:` field
4. Close and reopen the note

---

## Part 8: Advanced Features

### Custom Templates

Templates are in `_system/Templates/`

**To modify:**
1. Find the template you want to change
2. Edit the frontmatter or content
3. Changes apply to all new notes using that template

**Don't modify:**
- Plugin templates (Zotero, Readwise) - these get overwritten
- JavaScript files unless you know what you're doing

---

### Dataview Queries

Many pages use Dataview to automatically display related content.

**Common query patterns:**

**Show all notes of a type:**
```dataview
LIST
FROM "Notes"
WHERE class = "Notes"
SORT file.mtime DESC
```

**Show tasks:**
```dataview
TASK
WHERE !completed
GROUP BY file.link
```

**Show related people:**
```dataview
LIST
FROM [[#]]
WHERE class = "People"
```

Learn more: https://blacksmithgu.github.io/obsidian-dataview/

---

### Exporting and Sharing

**To share a note:**
1. Use Obsidian's "Share" feature
2. Or copy/paste as markdown
3. Or use export plugins (Pandoc, etc.)

**To backup:**
1. The vault is just a folder of markdown files
2. Use any backup service (Dropbox, OneDrive, Time Machine) but ensure they do not interfere with Obsidian Sync 
3. Or commit to Git regularly

**To collaborate:**
1. Use Git (see Option B above)
2. Or use Obsidian Sync ($8/month)
3. Or share via Dropbox (be careful with conflicts)

---

## Part 9: Advanced Features

### Using Local AI with Ollama (Privacy-Safe Vault Analysis)

**What is Ollama?**
Ollama lets you run AI models **completely locally** on your computer - nothing leaves your machine. This is safe for sensitive research data.

**Why use it?**
- ✅ Analyze themes across all your notes
- ✅ Generate research summaries
- ✅ Find patterns in field notes
- ✅ 100% private - no data sent to external servers
- ✅ Free (after downloading models)


**System Requirements:**
- **Apple Silicon (M1/M2/M3):** Works well even on MacBook Air 8GB
- **Intel Mac:** Possible but slow
- **Recommended:** 8GB+ RAM for 3B models, 16GB+ for 7B models

---

#### Setup and Use with Obsidian Plugins

**1. Install Ollama:**
```bash
# Using Homebrew
brew install ollama

# Start the service (auto-start on login)
brew services start ollama

# Download a model
ollama pull llama3.2:3b
```

**2. Install an Obsidian plugin:**

Choose one of these plugins to use Ollama with your vault:

**Smart Connections** (Recommended - you may already have this)
- Settings → Community Plugins → Smart Connections
- Settings → Smart Connections → Chat Model
- Provider: Ollama
- Model: `llama3.2:3b`
- Base URL: `http://localhost:11434`

**Obsidian Copilot**
- Settings → Community Plugins → Browse → "Copilot"
- Install and Enable
- Settings → Copilot → API Provider
- Select Ollama or OpenAI-compatible
- Model: `llama3.2:3b`
- Base URL: `http://localhost:11434`

**3. Start querying:**

Once configured, use the plugin's chat interface to ask questions about your vault:
- "Summarize all my notes about contribution systems"
- "What are the main themes in my stablecoins research?"
- "Find connections between water management and property notes"


---

#### Privacy & Ethics

**Why Ollama is safe for research data:**
- ✅ Everything runs on your local machine
- ✅ No internet connection required (after model download)
- ✅ No data sent to external servers
- ✅ Complies with research ethics requirements
- ✅ Works with IRB-protected data

**Compare to cloud AI (Claude Code, ChatGPT, Copilot with API keys):**
- ❌ Sends data to external servers
- ❌ Violates most research confidentiality agreements
- ❌ Not suitable for participant data

**Always use local Ollama for sensitive research data and still seek permission from your Ethics committee if required.**

---

#### Troubleshooting

**"Connection refused" or plugin can't connect:**
- Make sure Ollama is running: `brew services list | grep ollama`
- Should say "started"
- If not: `brew services start ollama`

**"Model not found":**
- Check installed models: `ollama list`
- Model name must match exactly: `llama3.2:3b`

**Very slow responses:**
- Normal on M1 8GB - first response can take 1-2 minutes
- Subsequent responses are faster (model stays in memory)
- Close other applications to free up RAM

**For more help:**
- Ollama documentation: https://ollama.com/
- Plugin-specific settings in Obsidian

---

## Part 10: Getting Help

### Resources

**Obsidian Help:**
- Press F1 in Obsidian
- https://help.obsidian.md

**Community:**
- Obsidian Discord: https://obsidian.md/community
- Forum: https://forum.obsidian.md

**This Vault:**
- Check `Navigation/Documentation/` for specific features
- GitHub issues: https://github.com/ellierennie/Telescope-Obsidian-Vault/issues

---

## Part 11: Workshop Exercises

### Exercise 1: Import and Reference (15 mins)

1. Import a paper from Zotero
2. Create a Reference Note
3. Capture a quote from the paper
4. Verify the quote appears in the Reference Note

### Exercise 2: Field Notes (10 mins)

1. Create a new field note (Cmd+Shift+N)
2. Write a brief observation
3. Link to a source: `[[source-name]]`
4. Add a task: `- [ ] Follow up on this`
5. Check it appears in Reminders

### Exercise 3: People and Connections (10 mins)

1. Create a person profile
2. Link to them from a field note
3. Check the backlinks panel
4. View all notes mentioning this person

### Exercise 4: Maps of Content (15 mins)

1. Create a new note for a theme/project
2. Make it an MOC (Cmd+Shift+N → MOC)
3. Link to 3-5 related notes
4. Add sections for different types of content
5. Use it as a navigation hub

---

## Quick Reference Card

### The Telescope Workflow in 5 Steps

1. **Import** sources (Zotero/Readwise) → `Inputs/`
2. **Create Reference Notes** → `Synthesis/Reference Notes/`
3. **Write** field notes → `Notes/`
4. **Capture quotes** → Appear automatically in Reference Notes
5. **Organize** with MOCs and People profiles

### Essential Commands

- **Cmd+P:** Find any command
- **Cmd+O:** Find any note
- **Cmd+Shift+N:** Create new note
- **Cmd+Shift+R:** Referencing tools
- **Ctrl+Cmd+L:** Quick log/reminder

### Key Concept

**Always create Reference Notes from imported sources!**

Your notes in Reference Notes are permanent. Source files can sync/update without losing your work.

---

## Appendix: What's NOT Included

This workshop covers the core Telescope features. The following are available but not covered:

- **KOI-Sync:** Knowledge network protocol (in development)
- **Telescope:** Ethical bot for qualitative data from online forums (requires setup)
- **Advanced Templater:** Custom JavaScript functions


Ask if you're interested in any of these!

---

## Thank You!

You're now ready to use the Telescope vault for your research!

**Remember:**
- Start small - don't try to set up everything at once
- The vault adapts to your workflow, not vice versa
- Ask questions - there's always a better way to do things
- Share what you learn with others
- Try Claude for troubleshooting. It will get you 90% where you need to be.

**Happy researching!** 🔭

---

*Last updated: February 2026*  
*Vault version: 1.0*  
*Created by: Ellie Rennie & Matthew Green*
