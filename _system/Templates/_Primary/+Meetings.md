<%* const CATEGORY = await tp.user.custom_meeting(tp) %>---
type: note
class: Meetings
category: <% CATEGORY %> 
created: <% moment().format('YY.MM.DD') %>
title: <% tp.file.title %>
author: "<% await tp.user.vaultAuthor(tp) %>"
tags: 
flag: false
note:
attending:
noteAuthor: "<% await tp.user.vaultAuthor(tp) %>"
---
- M [[_system/Classes/Meetings|Meetings]] 
# <% tp.file.title %>
Date: <% moment().format('dddd, MMMM D YYYY') %>
Time: <%moment().format('HH:mm') %>
## Notes
<% tp.file.cursor(1) %>


## Discussion Points
1. 


## Tasks





# Mentions  
```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["KOI", "Quotes"]
})
```

