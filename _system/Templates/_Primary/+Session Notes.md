<%* const CATEGORY = await tp.user.custom_session(tp) %>---
type: note
class: Sessions
category: <% CATEGORY %>
created: <% moment().format('YY.MM.DD') %>
title: <% tp.file.title %>
status: New
tags:
note:
noteAuthor: "<% await tp.user.vaultAuthor(tp) %>"
---
- M [[Sessions|Sessions]]
# <% tp.file.title %>
Created: <% moment().format('dddd, MMMM D YYYY') %>
## Notes
<% tp.file.cursor(1) %>





# Mentions  
```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["KOI", "Quotes"]
})
```

