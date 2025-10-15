# Telescope / KOI — Ethnographic Research Vault (Template)

A clean Obsidian vault for qualitative/ethnographic research workflows (fieldnotes, memos, coding, synthesis).  
This repo is a **template** — no private data, caches, or embeddings.

---

## What’s included
- Core folder structure and example templates
- Frontmatter conventions for sessions/participants/memos
- Minimal CSS/Dataview/Templater snippets (where useful)

## What’s intentionally excluded
- **Smart Connections embeddings** (`.smart-env/`)
- Obsidian cache/layout files (workspace, graph, appearance)
- Installed plugin code (use the plugin list below)

> If you see references to files that aren’t present, they’re likely generated locally by plugins or intentionally ignored.

---

## Setup (3 steps)
1. **Clone or “Use this template”** to create your own copy.
2. Open in **Obsidian**, then enable the listed plugins below.
3. Review/duplicate the templates you need and adjust frontmatter keys to your project.

---

## Plugins to enable (from Community Plugins)
- Dataview
- Templater
- Calendar  
*(Plus any others you prefer; check `.obsidian/community-plugins.json` for the full list.)*

---

## Conventions (quick start)
- **Frontmatter keys:** `type`, `date`, `location`, `participants`, `tags`
- **Note types:** `fieldnote`, `memo`, `codebook`, `meeting`, `reading`
- **Suggested folders:** `00_inbox/`, `10_fieldnotes/`, `20_memos/`, `30_analysis/`, `90_admin/`

---

## License
- **Vault content & templates:** [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)  
  *Use, adapt, and share non-commercially with attribution.*
- **Custom code/snippets (e.g., DataviewJS, CSS):** MIT  
- **Third-party plugins:** Licensed by their respective authors (not included here).

**Attribution:**  
> “Based on the *Telescope / KOI Ethnographic Research Vault* by Elinor Rennie (CC BY-NC 4.0).”

---

## Notes
- This repo excludes `.smart-env/` (Smart Connections embeddings) by design.
- If you add sensitive data, keep your repo private and ensure your `.gitignore` remains up to date.

- **Optional plugin:** Readwise Official — sync highlights into your vault (install + add your own Readwise token locally).
## Configure in Obsidian: Readwise & Zotero

This repo tracks only **neutral** config and **content**. Live plugin settings (and any API tokens) are **not** tracked by Git:
- Ignored: `.obsidian/plugins/`, `.obsidian/text-generator.json`, `.smart-env/`, and `Inputs/Zotero/Attachments/`.

### Readwise Official (highlights → `Inputs/Readwise`)
1. In Obsidian: **Settings → Community plugins → Browse → “Readwise Official” → Install → Enable**.
2. **Readwise settings**:
   - **Export folder / path:** `Inputs/Readwise`
   - (Optional) Title prefix: `Readwise - {{title}}`
   - **Sync on startup:** On (optional)
   - **API token:** add your own token locally in the plugin (not tracked by Git).
3. Click **Sync now** once to pull your highlights.
4. Verify: you should see notes under `Inputs/Readwise/...`.

*Troubleshoot:* Check `.obsidian/plugins/readwise-official/data.json` (local only) for `exportPath` and ensure it’s `Inputs/Readwise`.

### Zotero Desktop Connector (literature notes → `Inputs/Zotero/Notes`)
1. In Obsidian: **Settings → Community plugins → Installed → Zotero Desktop Connector → Enable**.
2. **Zotero settings**:
   - **Literature notes folder:** `Inputs/Zotero/Notes`
   - **Attachments folder (optional):** `Inputs/Zotero/Attachments`
     - This path is **ignored by Git** to avoid huge binaries. Leave blank if you prefer attachments only in Zotero.
   - (Optional) **Template file:** `_system/Templates/Zotero/LitNote.md`
   - (Optional) Enable “Create/Update literature notes”, “Embed PDF annotations”.
3. In Zotero: consider installing **Better BibTeX** for stable `@citekeys`.
4. Send a test item to Obsidian (right-click in Zotero → *Send to Obsidian*) and verify a note appears in `Inputs/Zotero/Notes`.

### Safety checks
- Git ignores: `.obsidian/plugins/`, `.obsidian/text-generator.json`, `.smart-env/`, `Inputs/Zotero/Attachments/`.
- To confirm locally:
  - `git status --ignored` → these paths should show as **ignored**.
- To scan current files for secrets (optional):
  - Search for `api`, `token`, `secret`, `openai` in your editor, or run a grep.


### Zotero PDF Utility (required for highlights)
To extract and embed PDF highlights, install the **PDF Utility** from the Zotero Desktop Connector plugin:

1. Obsidian → **Settings → Community plugins → Zotero Desktop Connector → Settings**  
2. Click **Download PDF Utility** (or **Update PDF Utility** if prompted).
3. Restart Obsidian or reload the plugin.
4. Ensure your **Literature notes folder** is set to `Inputs/Zotero/Notes`.

Without the PDF Utility, highlight extraction will not work.
