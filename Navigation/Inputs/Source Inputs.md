---
obsidianUIMode: 
note: All source data
---
# Zotero 
```dataview
TABLE without id link(file.link, title) AS Title, author AS Author
FROM "Inputs/Zotero"
SORT file.date_saved desc
```



# Readwise 
```dataview
TABLE without id link(file.link, title) AS Title, author AS Author
FROM "Inputs/Readwise"
SORT file.date_saved desc
```


