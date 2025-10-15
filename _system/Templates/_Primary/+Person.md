---
class: People
category: <% tp.file.folder(false) %>
type: moc
title: <% tp.file.title %>
created: <% moment().format('YY.MM.DD') %>
tags: 
flag: false
note: 
aliases: <% await tp.user.authorAliases(tp) %>
---
- M [[_system/Classes/People|People]] 
# About









# Mentions  
```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["KOI", "Quotes"]
})
```

# Quotes
```dataviewjs
dv.view("displayQuotesByAuthor")
```