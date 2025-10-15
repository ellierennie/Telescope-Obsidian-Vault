---
type: note
class: Assignments
category: 
created: <% moment().format('YY.MM.DD') %>
due_date: 
status: New
title: <% tp.file.title %>
priority: 
tags: 
note: 
collaborators: 
noteAuthor: <% await tp.user.vaultAuthor(tp) %>
complete: false
---
- M [[_system/Classes/Assignments|Assignments]]
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

