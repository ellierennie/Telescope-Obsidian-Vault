---
limit: 20
mapWithTag: false
icon: book
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews:
  - name: Nick Merrill
    children: []
    sorters: []
    filters:
      - id: Sources____file
        name: file
        query: ""
        customFilter: ""
      - id: Sources____type
        name: type
        query: ""
        customFilter: ""
      - id: Sources____saved
        name: saved
        query: ""
        customFilter: ""
      - id: Sources____author
        name: author
        query: Nick Merrill
        customFilter: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
      - id: Sources____type
        name: type
        hidden: false
        position: 1
      - id: Sources____saved
        name: saved
        hidden: false
        position: 2
      - id: Sources____author
        name: author
        hidden: false
        position: 3
  - name: Readwise
    children: []
    sorters: []
    filters:
      - id: Sources____file
        name: file
        query: ""
      - id: Sources____type
        name: type
        query: Readwise
      - id: Sources____saved
        name: saved
        query: ""
      - id: Sources____author
        name: author
        query: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
      - id: Sources____type
        name: type
        hidden: false
        position: 1
      - id: Sources____saved
        name: saved
        hidden: false
        position: 2
      - id: Sources____author
        name: author
        hidden: false
        position: 3
  - name: Recently Saved
    children: []
    sorters:
      - id: Sources____saved
        name: saved
        direction: desc
        priority: 1
        customOrder: []
    filters:
      - id: Sources____file
        name: file
        query: ""
      - id: Sources____type
        name: type
        query: ""
      - id: Sources____saved
        name: saved
        query: ""
      - id: Sources____author
        name: author
        query: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
      - id: Sources____type
        name: type
        hidden: false
        position: 1
      - id: Sources____saved
        name: saved
        hidden: false
        position: 2
      - id: Sources____author
        name: author
        hidden: false
        position: 3
  - name: Zotero
    children: []
    sorters: []
    filters:
      - id: Sources____file
        name: file
        query: ""
        customFilter: ""
      - id: Sources____type
        name: type
        query: Zotero
        customFilter: ""
      - id: Sources____saved
        name: saved
        query: ""
        customFilter: ""
      - id: Sources____author
        name: author
        query: ""
        customFilter: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
      - id: Sources____type
        name: type
        hidden: false
        position: 1
      - id: Sources____saved
        name: saved
        hidden: false
        position: 2
      - id: Sources____author
        name: author
        hidden: false
        position: 3
  - name: saved
    children: []
    sorters: []
    filters:
      - id: Sources____file
        name: file
        query: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
  - name: Omnivore
    children: []
    sorters:
      - id: Sources____date_saved
        name: date_saved
        direction: desc
        priority: 1
        customOrder: []
    filters:
      - id: Sources____file
        name: file
        query: ""
        customFilter: ""
      - id: Sources____date_saved
        name: date_saved
        query: ""
        customFilter: ""
      - id: Sources____type
        name: type
        query: Omnivore
        customFilter: ""
      - id: Sources____author
        name: author
        query: ""
        customFilter: ""
      - id: Sources____note
        name: note
        query: ""
        customFilter: ""
    columns:
      - id: Sources____file
        name: file
        hidden: false
        position: 0
      - id: Sources____date_saved
        name: date_saved
        hidden: false
        position: 1
      - id: Sources____type
        name: type
        hidden: true
        position: 1
      - id: Sources____author
        name: author
        hidden: false
        position: 3
      - id: Sources____note
        name: note
        hidden: false
        position: 3
favoriteView: 
fieldsOrder:
  - FJfLFT
  - GnlVMn
version: "2.39"
fields:
  - name: note
    type: Input
    options: {}
    path: ""
    id: GnlVMn
  - name: by
    type: Input
    options: {}
    path: ""
    id: FJfLFT
menu: false
note: All sources
inputs: false
---
# Inputs 
```dataview
TABLE without id link(file.link, title) AS Title, author AS "Author", category AS Category
FROM "Inputs" AND !"Inputs/KOI"
SORT file.ctime desc
```
