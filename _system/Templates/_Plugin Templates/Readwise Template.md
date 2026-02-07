---
type: docs
class: Documentation
category: Plugin Templates
created: 24.09.24
tags: Readwise
related: 
note: Readwise template to cut and paste into the template settings
flag: false
---
```button
name Create Reference note
type cursor template
action Reference Note shortcut
```
^button-myfq

Readwise template to cut and paste into the template settings

## Actions
```
button 
name Create Reference Note type template 
action _system/Templates/+ Referencing/1. Reference Note.md 
templater true 
```
# Folder Path 

```
Inputs/Readwise
```

# File name
```
{{last_highlighted_date|date('y.m.d')}}_{{title|replace('#', '')|replace('@', '')}}_({{author|replace('#', '')|replace('@', '')}}) 
```

# Page metadata
````
{% if url %}
[Go to Source]({{ url }}){% endif %}

# {{ full_title }}

{% if image_url -%}
![rw-book-cover]({{image_url}})
{% endif -%}

{% if summary %}
## Summary
> {{ summary }} 
{% endif %}

````


# Highlights header

```
{% if is_new_page %}
# Highlights
{% elif has_new_highlights -%}
## New highlights added {{date|date('F j, Y')}} at {{time}}
{% endif -%}
```

# Highlight

```
## {{ highlight_text|truncate(128) }}

{{ highlight_text }}{% if highlight_note %}{% if highlight_tags %}{% for tag in highlight_tags %} #{{tag}} {% endfor %}{% endif %}

```COMMENT <% await tp.user.vaultAuthor(tp) %> <% moment().format('YY.MM.DD') %>
{{ highlight_note }} 
``` {% endif %}

```

# YAML

```
type: Input
class: Sources
category: Readwise
source: "[[<% tp.file.title %>]]"
author: <% await tp.user.processAuthorLinks(tp, "{{author|replace('#', '')|replace('@', '')|replace(' on Twitter', '')}}") %>
title: {{title|replace('#', '')|replace('@', '')}}
itemType:  {{category}}
source: "[[{{last_highlighted_date|date('y.m.d')}}_{{title|replace('#', '')|replace('@', '')}}_({{author|replace('#', '')|replace('@', '')}}) ]]"
date_saved: {{last_highlighted_date|date('y.m.j')}}{% if source %}
site_name: {{ source }} {% endif %}{% if source_url %}
sourceLink: [🔗]({{ source_url }}){% endif %}{% if highlights_url %}
readwiseLink:[Readwise](https://readwise.io/bookreview/{{book_id}})
highlights_url: {{ highlights_url }}{% endif %}{% if num_highlights %}
num_highlights: {{ num_highlights }}{% endif %}
flag: null
tags: {% if document_tags -%}{% for tag in document_tags %}[[{{tag}}]] {% endfor %}
{% endif -%}
related:
note: {% if document_note -%}{{document_note}}{% endif -%}
```


# Sync

```
## {{date|date('y.m.j')}}
**Synced {{num_highlights}} highlight{{num_highlights|pluralize}} from {{num_books}} document{{num_books|pluralize}}.**
{% for book in books %}    - {{ book.num_highlights_added}} highlights from [[{{ book.title }}]]
{% endfor %}
```



