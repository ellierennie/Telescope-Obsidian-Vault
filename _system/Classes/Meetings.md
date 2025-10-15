---
limit: 20
mapWithTag: false
icon: hand
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: 
favoriteView: 
fieldsOrder:
  - wbisNK
version: "2.2"
menu: true
note: All past meeting notes
fields:
  - name: attending
    type: MultiFile
    options:
      dvQueryString: dv.pages('"People"')
    path: ""
    id: wbisNK
obsidianUIMode: preview
---

```dataview
TABLE attending AS Attending, note as Note
FROM !"_system"
WHERE class = "Meetings"
SORT c.time DESC
```



## Tasks in Meeting Notes
```dataview
TASK
WHERE class = "Meetings"
 
GROUP BY file.link
```

 

 