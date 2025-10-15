<%* 
const description = "any notes mentioning this note will be displayed"; 
const templateType = "block"
-%>
# Mentions
```dataviewjs
dv.view("mentions", {
  fields: ["note"],
  excludeClass: ["Quotes", "Telescopes"]
})
```
