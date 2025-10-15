---
class: Untitled
type: class
---

```dataview
TABLE without id link(file.link, title) AS Title, author AS By
FROM "Synthesis" AND !"Synthesis/Quotes"
SORT file.ctime desc
LIMIT 11
```



```dataview
TASK
WHERE !completed AND class = "Reference_Notes"
GROUP BY file.link
```