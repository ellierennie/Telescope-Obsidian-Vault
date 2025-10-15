<%* const CATEGORY = await tp.user.custom_inputs(tp) %>---
type: Input 
class: Sources
category: <% CATEGORY %>
created: <% moment().format('YY.MM.DD') %>
title: <% tp.file.title %>
tags: 
note: 
flag: false
author: "<% await tp.user.vaultAuthor(tp) %>"
URL: 
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