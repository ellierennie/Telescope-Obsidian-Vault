<%*
const description = "displays notes containing select links";
const templateType = "block";
const excludedFolders = ["_system", "_Classes"];
const links = await tp.user.scopeLINKs(tp, excludedFolders);
-%>

## QUERY Linked Notes
Notes that reference any of the following:
<% links.showLinks %>

```dataview
TABLE 
    note as "Note"
FROM <% links.scopedLinks %>
SORT file.ctime DESC
```

