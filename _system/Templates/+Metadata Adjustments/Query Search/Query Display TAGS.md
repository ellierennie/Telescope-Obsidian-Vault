<%*
const description = "displays notes containing select tags";
const templateType = "block";
const tags = await tp.user.scopeORTags(tp);
-%>


## Notes containing any of the following tags:
<% tags.showTags %>

```dataview
TABLE 
    note as "Note"
FROM !"_system"
WHERE <% tags.queryTags %> 
    AND file.path != this.file.path
SORT file.ctime DESC
```


