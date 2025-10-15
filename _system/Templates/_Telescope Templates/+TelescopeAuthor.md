---
type: moc
class: People
category: Telescope_Author
created: <% moment().format('YY.MM.DD') %>
tags: 
note:
---
See all [[🔭 People]]
# Notes



```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["Quotes", "KOI"]
})
```

# Telescopes by this profile
```dataviewjs
dv.view("displayTelescopesByAuthor")
```