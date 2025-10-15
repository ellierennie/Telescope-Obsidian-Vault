async function displayQuotesByTags(dv) {
    async function getFullQuoteContent(file) {
        const content = await dv.io.load(file.path);
        const sections = content.split(/---\s*/);
        
        if (sections.length >= 4) {
            const quoteContent = sections[2].trim();
            const bodyContent = sections.slice(3).join('---').trim();
            
            return {
                yaml: sections[1].trim(),
                content: quoteContent,
                bodyContent: bodyContent
            };
        }
        return { yaml: '', content: '', bodyContent: '' };
    }

    function parseAuthorsFromYaml(yamlString) {
        const authors = new Set();
        
        // Extract all wiki-links from the YAML content
        const wikiLinkPattern = /\[\[([^\]]+?)\]\]/g;
        const matches = yamlString.matchAll(wikiLinkPattern);
        
        for (const match of matches) {
            if (match[1]) {
                // Split on pipe to get the full path
                const parts = match[1].split('|');
                const authorPath = parts[0].trim();
                authors.add(authorPath);
            }
        }

        return Array.from(authors);
    }

    function extractBodyTags(bodyContent) {
        const tagMatches = bodyContent.match(/(?:^|\s)#[\w-]+/g) || [];
        return tagMatches.map(tag => tag.trim());
    }

    function escapeTableCell(text) {
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, '<br>');
    }

    function formatTags(frontmatterTags, bodyTags) {
        const allTags = new Set();
        
        if (frontmatterTags) {
            const tagArray = Array.isArray(frontmatterTags) ? frontmatterTags : frontmatterTags.split(',');
            tagArray
                .map(tag => tag.trim())
                .filter(tag => tag)
                .forEach(tag => allTags.add(`#${tag.replace(/^#/, '')}`));
        }
        
        bodyTags.forEach(tag => allTags.add(tag));
        
        return Array.from(allTags).join(' ');
    }

    // Get the current file's tags from frontmatter
    const currentFileTags = dv.current().tags || [];
    // Normalize the tags (remove # if present)
    const selectedTags = Array.isArray(currentFileTags) 
        ? currentFileTags.map(tag => tag.replace(/^#/, '')) 
        : [];

    // If no tags are selected, return early
    if (selectedTags.length === 0) {
        return "### No tags selected\n\nPlease add tags to the frontmatter to filter quotes.";
    }

    // Filter for pages with specific class and category
    const quotePages = dv.pages()
        .where(p => p.category === "Quotes" && p.type === "Synthesis");
    
    // Function to check if quote has any of the selected tags
    function hasSelectedTag(quoteTags, bodyTags) {
        // Format frontmatter tags
        const formattedQuoteTags = Array.isArray(quoteTags) 
            ? quoteTags.map(tag => tag.replace(/^#/, ''))
            : quoteTags ? quoteTags.split(',').map(tag => tag.trim().replace(/^#/, '')) : [];
            
        // Format body tags
        const formattedBodyTags = bodyTags.map(tag => tag.replace(/^#/, ''));
        
        // Combine all tags
        const allQuoteTags = [...formattedQuoteTags, ...formattedBodyTags];
        
        // Check if any selected tag is in the quote's tags
        return selectedTags.some(tag => allQuoteTags.includes(tag));
    }

    const quotes = {};
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, content, bodyContent } = await getFullQuoteContent(page.file);
        const bodyTags = extractBodyTags(bodyContent);
        
        // Check if the quote has any of the selected tags
        if (hasSelectedTag(page.tags, bodyTags)) {
            const sourceStr = page.source?.toString() || '';
            const source = sourceStr
                .replace(/\[\[(.*?)\]\]/g, '$1')
                .replace(/\|.*?\]/g, '');
                
            if (!quotes[source]) {
                quotes[source] = [];
            }
            
            quotes[source].push({
                title: page.file.name,
                content: content,
                tags: formatTags(page.tags, bodyTags)
            });
        }
    }));

    // Format the selected tags for display
    const tagsDisplay = selectedTags.map(tag => `#${tag}`).join(', ');
    let output = `### Quotes containing ${tagsDisplay}\n\n`;

    for (const [source, sourceQuotes] of Object.entries(quotes)) {
        output += `#### From: [[${escapeTableCell(source)}]]\n\n`;
        output += '| Quote | Content |\n|---|---|\n';
        
        sourceQuotes.forEach(quote => {
            const leftCell = `[[${escapeTableCell(quote.title)}\\| 🔗]]`;
            const rightCell = `${escapeTableCell(quote.content)}<br><br>${quote.tags}`;
            output += `| ${leftCell} | ${rightCell} |\n`;
        });
        
        output += '\n';
    }

    if (Object.keys(quotes).length === 0) {
        output += 'No quotes found with the selected tags\n';
    }

    return output;
}

// Execute
(async () => {
    const output = await displayQuotesByTags(dv);
    dv.paragraph(output);
})();