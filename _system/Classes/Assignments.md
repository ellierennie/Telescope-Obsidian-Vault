---
fields:
  - name: priority
    type: Select
    options:
      sourceType: ValuesListNotePath
      valuesList: {}
      valuesListNotePath: _system/Templates/class_lists/Priority.md
    path: ""
    id: SzT0n0
  - name: status
    type: Select
    options:
      sourceType: ValuesListNotePath
      valuesList: {}
      valuesListNotePath: _system/Templates/class_lists/Status.md
    path: ""
    id: qxnNrN
  - name: collaborators
    type: MultiFile
    options:
      dvQueryString: dv.pages('"People"')
    path: ""
    id: zNtdWL
version: "2.12"
limit: 50
mapWithTag: false
icon: triangle
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: 
favoriteView: 
fieldsOrder:
  - zNtdWL
  - qxnNrN
  - SzT0n0
obsidianUIMode: preview
---
See [[_system/Classes/Assignments#Archived|archived assignments.]] 

```dataview
TABLE priority AS Priority, note AS Note
FROM !"_system"
WHERE class = "Assignments" AND complete = false
SORT c.time DESC
```


# Tasks in Assignments
```dataview
TASK
FROM !"_system"
WHERE !completed  AND class = "Assignments" 
GROUP BY file.link
```







# Archived  
```dataview
TABLE note AS Note
FROM !"_system"
WHERE class = "Assignments" AND type = "archive"
SORT c.time DESC
```


