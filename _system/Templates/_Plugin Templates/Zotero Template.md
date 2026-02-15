---
type: Input
class: Sources
category: Zotero
source: "[[<% tp.file.title %>]]"
author: <% await tp.user.processAuthorLinks(tp, "{% for creator in creators %} {{creator.lastName}}_{{creator.firstName}}, {% endfor %}") %>
title: "{{ title }}"
citeKey: {{citekey}}
date_saved: <% moment().format('YY.MM.DD') %>
aliases: 
tags: 
note: 
noteAuthor: "[[<% await tp.user.vaultAuthor(tp) %>]]"
---
```button
name Create Reference Note
type cursor template
action Buttons/Reference Note
```

# {{title}}
## By {% for creator in creators %}{{creator.lastName}}_{{creator.firstName}}, {% endfor %}

{% if abstractNote %}
## Abstract
{{abstractNote}}
{% endif %}
## Publication Details 
> [!info]- Info
> {% if date %}Year:: {{date | format("YYYY")}}{%- endif %}{% if citekey %}
> Citekey:: {{citekey}}{%- endif %}{% if itemType %}
> itemType:: {{itemType}}{%- endif %}{% if publicationTitle and itemType == "journalArticle" %}
> Journal:: {{publicationTitle}}{%- endif %}{% if volume %}
> Volume:: {{volume}}{%- endif %}{% if issue %}
> Issue:: {{issue}}{%- endif %}{% if publicationTitle and itemType == "bookSection" %}
> Book:: {{publicationTitle}}{%- endif %}{% if publisher %}
> Publisher:: {{publisher}}{%- endif %}{% if place %}
> Location:: {{place}}{%- endif %}{% if pages %}
> Pages:: {{pages}}{%- endif %}{% if DOI %}
> DOI:: {{DOI}}{%- endif %}{% if ISBN %}
> ISBN:: {{ISBN}}{%- endif %}

# Highlights
---
{% for annotation in annotations -%}{% if annotation.annotatedText -%}
## <mark style="background-color: {{annotation.color}}">{{ annotation.annotatedText|truncate(64) }}</mark>
[Page {{ annotation.page | default(1) }}](zotero://open-pdf/library/items/{{ annotation.attachment.itemKey }}?page={{ annotation.page }}&annotation={{ annotation.id }})  

{{annotation.annotatedText}} {% if annotation.allTags %} {% set tags = annotation.allTags.split(', ') %} {% for tag in tags -%} 
#{{tag}} {% endfor %} {% endif %}

{% if annotation.comment -%}
```COMMENT <% await tp.user.vaultAuthor(tp) %> <% moment().format('YY.MM.DD') %>
{{annotation.comment}} {% if annotation.allTags %} {% set tags = annotation.allTags.split(', ') %} {% for tag in tags -%} #{{tag}} {% endfor %} {% endif %}
```

{% endif %}{% if annotation.imageRelativePath and annotation.imageRelativePath != "" -%}
![[{{annotation.imageRelativePath | safe}}]]
{% endif %}{% endif %} 
{% endfor -%}


