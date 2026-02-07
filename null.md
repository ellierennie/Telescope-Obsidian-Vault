---
class: Vault_Author
vaultAuthorName: null
created: 26.02.07
REF: 202602070222
vaultAuthor: true
note: "This is your author profile"
obsidianUIMode: preview
---
# Maps of Content
```dataview
	TABLE relatedNotes AS "Related Notes", note AS Note
	 WHERE class = "Notes" AND type = "moc"
```

# Notes
```dataview
TABLE without id link(file.link, title) AS Title, relatedNotes AS "Related Notes", note AS Note
FROM "Notes"
WHERE type = "note" AND category = "Notes"
SORT file.ctime desc
LIMIT 22
```

# ⛲ KOI Stream - Notes shared with KOI
```dataview
TABLE 
    note AS "Note", noteAuthor AS "Shared by", shareWith AS "Shared with"
FROM !"_system"
WHERE KOI_Stream = true
SORT class
```
