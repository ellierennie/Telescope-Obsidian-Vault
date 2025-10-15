---
fields:
  - name: author
    type: Input
    options: {}
    path: ""
    id: SCujOU
  - name: channel_name
    type: Input
    options: {}
    path: ""
    id: ivq4rK
  - name: tagger_name
    type: Input
    options: {}
    path: ""
    id: Din1LK
  - name: searchTitle
    type: Input
    options: {}
    path: ""
    id: LGkiUb
  - name: note
    type: Input
    options: {}
    path: ""
    id: L5uChx
  - name: priority
    type: Input
    options: {}
    path: ""
    id: 7kbiSi
  - name: text
    type: Input
    options: {}
    path: ""
    id: Hxh366
version: "2.16"
limit: 20
mapWithTag: false
icon: stars
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews:
  - name: "50"
    children: []
    sorters: []
    filters:
      - id: Telescope____file
        name: file
        query: ""
        customFilter: ""
      - id: Telescope____note
        name: note
        query: ""
        customFilter: ""
      - id: Telescope____searchTitle
        name: searchTitle
        query: ""
        customFilter: ""
      - id: Telescope____tagger_name
        name: tagger_name
        query: ""
        customFilter: ""
      - id: Telescope____channel_name
        name: channel_name
        query: ""
        customFilter: ""
      - id: Telescope____author
        name: author
        query: ""
        customFilter: ""
    columns:
      - id: Telescope____file
        name: file
        hidden: false
        position: 0
      - id: Telescope____note
        name: note
        hidden: false
        position: 1
      - id: Telescope____searchTitle
        name: searchTitle
        hidden: false
        position: 2
      - id: Telescope____tagger_name
        name: tagger_name
        hidden: false
        position: 3
      - id: Telescope____channel_name
        name: channel_name
        hidden: false
        position: 4
      - id: Telescope____author
        name: author
        hidden: false
        position: 5
  - name: SearchTitles
    children: []
    sorters:
      - id: Telescope____searchTitle
        name: searchTitle
        direction: desc
        priority: 1
        customOrder: []
    filters:
      - id: Telescope____file
        name: file
        query: ""
        customFilter: ""
      - id: Telescope____note
        name: note
        query: ""
        customFilter: ""
      - id: Telescope____searchTitle
        name: searchTitle
        query: ""
        customFilter: ""
      - id: Telescope____tagger_name
        name: tagger_name
        query: ""
        customFilter: ""
      - id: Telescope____channel_name
        name: channel_name
        query: ""
        customFilter: ""
      - id: Telescope____author
        name: author
        query: ""
        customFilter: ""
    columns:
      - id: Telescope____file
        name: file
        hidden: false
        position: 0
      - id: Telescope____note
        name: note
        hidden: false
        position: 1
      - id: Telescope____searchTitle
        name: searchTitle
        hidden: false
        position: 2
      - id: Telescope____tagger_name
        name: tagger_name
        hidden: false
        position: 3
      - id: Telescope____channel_name
        name: channel_name
        hidden: false
        position: 4
      - id: Telescope____author
        name: author
        hidden: false
        position: 5
  - name: priority
    children: []
    sorters:
      - id: Telescope____priority
        name: priority
        direction: desc
        priority: 1
        customOrder: []
    filters:
      - id: Telescope____file
        name: file
        query: ""
      - id: Telescope____priority
        name: priority
        query: ""
      - id: Telescope____note
        name: note
        query: ""
      - id: Telescope____searchTitle
        name: searchTitle
        query: ""
      - id: Telescope____tagger_name
        name: tagger_name
        query: ""
      - id: Telescope____channel_name
        name: channel_name
        query: ""
      - id: Telescope____author
        name: author
        query: ""
    columns:
      - id: Telescope____file
        name: file
        hidden: true
        position: 0
      - id: Telescope____priority
        name: priority
        hidden: false
        position: 1
      - id: Telescope____note
        name: note
        hidden: false
        position: 2
      - id: Telescope____searchTitle
        name: searchTitle
        hidden: false
        position: 3
      - id: Telescope____tagger_name
        name: tagger_name
        hidden: false
        position: 4
      - id: Telescope____channel_name
        name: channel_name
        hidden: false
        position: 5
      - id: Telescope____author
        name: author
        hidden: false
        position: 6
favoriteView: 
fieldsOrder:
  - Hxh366
  - 7kbiSi
  - L5uChx
  - LGkiUb
  - Din1LK
  - ivq4rK
  - SCujOU
---

```dataviewjs
dv.view("displayTelescopesAll")
```
