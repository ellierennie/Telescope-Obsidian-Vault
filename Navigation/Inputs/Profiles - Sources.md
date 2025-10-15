---
obsidianUIMode:
---

# Zotero 
```dataview
TABLE WITHOUT ID author AS "Author", rows.file.link AS "Sources"
FROM "Inputs/Zotero"
GROUP BY author
SORT file DESC
```

# Readwise
```dataview
TABLE WITHOUT ID author AS "Author", rows.file.link AS "Sources"
FROM "Inputs/Readwise"
GROUP BY author
SORT file DESC
```



