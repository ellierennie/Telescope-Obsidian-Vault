---
type: temporial
class: PeriodicNotes
category: Days
created: <% tp.file.title %>
tags: 
note: 
source: <% tp.file.title %>
---
## See all [[PeriodicNotes|Daily Notes]]
```dataviewjs
dv.view("daysToday")
```
# Notes









## Outstanding Daily Note Reminders
```dataview
TASK
WHERE !completed  AND class = "PeriodicNotes" 
GROUP BY file.link
```







## Last Week 
```dataviewjs
dv.view("daysLastWeek")
```



 
