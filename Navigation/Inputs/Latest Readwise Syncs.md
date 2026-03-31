---
type: dashboard
class: Navigation
category: Navigation
title: Latest Readwise Syncs
created: 26.03.31
tags:
  - dashboard
  - readwise
note: Dashboard showing most recent Readwise imports with newest first
noteAuthor: [[Ellie Rennie]]
---

# 📖 Latest Readwise Syncs

> **About:** Shows your most recent Readwise imports with newest at the top. This dashboard queries your `Inputs/Readwise/` folder dynamically.

---

## 🆕 Recent Imports (Last 20)

Your most recently imported highlights and articles:

```dataview
TABLE 
  author as "Author/Source",
  sourceTitle as "Title",
  itemType as "Type",
  date_saved as "Imported"
FROM "Inputs/Readwise"
WHERE file.name != "Readwise Syncs"
  AND class = "Sources"
SORT date_saved DESC
LIMIT 20
```

---

## 📊 Imports by Date

Overview of sync activity:

```dataview
TABLE WITHOUT ID
  date_saved as "Date",
  length(rows) as "Items Imported"
FROM "Inputs/Readwise"
WHERE file.name != "Readwise Syncs"
  AND class = "Sources"
GROUP BY date_saved
SORT date_saved DESC
LIMIT 10
```

---

## 🏷️ Recently Tagged

Sources with document tags from the last month:

```dataview
TABLE 
  author as "Author",
  sourceTitle as "Title",
  tags as "Tags",
  date_saved as "Imported"
FROM "Inputs/Readwise"
WHERE file.name != "Readwise Syncs"
  AND class = "Sources"
  AND tags
SORT date_saved DESC
LIMIT 15
```

---

## 🔗 Quick Links

- [[Sources]] - All imported sources
- [[Inputs/Readwise/Readwise Syncs|Full Sync History]] - Complete chronological log
- Settings → Readwise Official → **Sync now** to import latest highlights

---

## 💡 Tips

**To see a specific import:**
- Click any title to open the full article with highlights

**To find related content:**
- Use the author or title in global search (Cmd+Shift+F)
- Check if you've created a Reference Note for deeper analysis

**To organize imports:**
- Tag articles in Readwise Reader (syncs to `tags:` field)
- Create Reference Notes for important sources
- Add to relevant MOCs for research themes

---

*Dashboard updates automatically as you sync new content from Readwise*
