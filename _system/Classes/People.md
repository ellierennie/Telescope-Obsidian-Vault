---
limit: 20
mapWithTag: false
icon: person-standing
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: 
favoriteView: 
fieldsOrder:
  - xliHIo
  - NczEMd
version: "2.2"
peopleCategories:
  - Researcher
  - Concets
menu: true
fields:
  - name: DAOs
    type: MultiFile
    options:
      dvQueryString: dv.pages('"DAO"').map(p=> p.file.name)
    path: ""
    id: NczEMd
  - name: note
    type: Input
    options: {}
    path: ""
    id: xliHIo
note: A profiles in vault
---

```dataviewjs
dv.view("classNotes", {
    fields: [
        "note"
    ],
    exclude_folder: ["_system", "telescope/templates"],
    where: { 
    type: "moc"
    },
    sortOrder: "desc"
})
```


