<%*
let filename = tp.file.title
if ( filename.startsWith("Untitled") ) {
  filename = await tp.system.prompt("Enter name")
  await tp.file.rename(filename)
}
-%>---
class: People
category: <% tp.file.folder(false) %>
type: moc
created: <% moment().format('YY.MM.DD') %>
tags:
- '<% tp.file.title.trim().replace(/[ ,\.;:!?]/g, "_") %>'
flag: false
note: 
aliases: <% await tp.user.authorAliases(tp) %>
---
- M [[_system/Classes/People|People]] 
 
# About
<% tp.file.cursor(0) %>





# Projects 


# Feedback


# Reference Notes 



