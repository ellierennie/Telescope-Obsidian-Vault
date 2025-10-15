---
class: People
category: Author
type: moc
created: <% moment().format('YY.MM.DD') %>
tags: 
flag: false
note: 
aliases:
  - <% await tp.user.authorAliases(tp) %>
---
- M [[_system/Classes/People|People]] 
 
# About









# Mentions  
```dataviewjs
dv.view("mentions", {
	fields: ["note"],
	excludeClass: ["Telescope"],
	excludeCategory: ['Quotes'],
})
```

# Quotes
```dataviewjs
dv.view("displayQuotesByAuthor")
```