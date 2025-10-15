---
menu: true
note: All notes shared with KOI
obsidianUIMode: preview
---

**To share notes into the KOI Stream use hotkey [[⌥ ⌘ ⇧ K - KOI Stream|⌥ ⌘ ⇧ K]]**


```dataview
TABLE 
    note AS "Note", noteAuthor AS "Shared by", shareWith AS "Shared with"
FROM !"_system"
WHERE KOI_Stream = true
SORT class
```


