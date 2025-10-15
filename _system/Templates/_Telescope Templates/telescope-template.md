---
type: Input
class: KOI
category: Telescope
author: <% await tp.user.TelescopeAuthors(tp, "Authors/{{author_name}}") %>
channel: <% await tp.user.TelescopeChannels(tp, "{{team_name}}/Channels/{{channel_name}}") %>
workspace: <% await tp.user.TelescopeWorkspace(tp, "{{team_name}}/{{team_name}}") %>
source: "[[{{obsidian_filename}}]]"
title: {{{stringPrefix 90 text}}}
aliases:
- {{{message_rid}}}
- {{{stringPrefix 50 text}}}
{{{yaml this}}}
---

{{{parseUsers "[[Inputs/KOI/Telescope/Authors/$userName|@$userName]]" text}}}

---
created: {{created_at}}
[link to slack]({{message_rid}})

## Imported researcher comments
{{#each comments}}
{{this}}

---
{{/each}}




