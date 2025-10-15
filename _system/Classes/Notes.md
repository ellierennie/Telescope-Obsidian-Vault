---
fields:
  - name: category
    type: Input
    options: {}
    path: ""
    id: E3bXPz
  - name: status
    type: Select
    options:
      sourceType: ValuesListNotePath
      valuesList: {}
      valuesListNotePath: _system/Templates/class_lists/Status.md
    path: ""
    id: CW9wRz
version: "2.4"
limit: 20
mapWithTag: false
icon: pencil
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews:
  - name: Ideas
    children: []
    sorters: []
    filters:
      - id: Notes____file
        name: file
        query: ""
      - id: Notes____category
        name: category
        query: Ideas
    columns:
      - id: Notes____file
        name: file
        hidden: false
        position: 0
      - id: Notes____category
        name: category
        hidden: false
        position: 1
favoriteView: 
fieldsOrder:
  - CW9wRz
  - E3bXPz
---
## See [[_system/Classes/Notes#🗄️ Archived|archived notes.]]
## See [[Maps of Contents]]

# Notes
```dataview
	TABLE relatedNotes AS "Related Notes", relatedInputs AS "Related Sources", note AS Note
	 WHERE class = "Notes" AND type = "note"
```









# 🗄️ Archived
```dataview
	TABLE relatedNotes AS "Related Notes", note AS Note
	 WHERE class = "Notes" AND type = "archive"
```



