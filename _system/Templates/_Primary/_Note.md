---
class: Notes
type: note
category: <% tp.file.folder(false) %>
created: <% moment().format('YY.MM.DD') %>
title: <% tp.file.title %>
tags: 
- "<% tp.file.title.trim().toLowerCase().replace(/[ ,\.;:'!?]/g, "_") %>"
note: 
status: New
noteAuthor: "<% await tp.user.vaultAuthor(tp) %>"
---
## See [[<% tp.file.title %>#Connected Notes & Quotes|Connected Notes & Quotes]]

```dataviewjs
dv.view("relatedNotes")
```

# Notes
<% tp.file.cursor(0) %>





























# Connected Notes & Quotes

```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["KOI", "Quotes"]
})
```

```dataviewjs
dv.view("displayQuotes")
```