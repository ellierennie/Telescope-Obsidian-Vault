---
menu: true
note: All session notes
flag: true
---
```dataviewjs
dv.view("classNotes", {
    fields: [
        "note",
        "category",
        "created"
    ],
    exclude_folder: ["_system"],
})
```


## Tasks in Session Notes
```dataview
TASK
FROM !"_system"
WHERE !completed  AND class = "Sessions" 
GROUP BY file.link
```

 

 