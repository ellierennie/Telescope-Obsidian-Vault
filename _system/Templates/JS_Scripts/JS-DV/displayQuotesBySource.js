async function displayQuotesBySource(dv) {
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

    // Get the current note's source
    const currentSource = dv.current().source?.toString() || '';
    const normalizedCurrentSource = currentSource.replace(/\[\[(.*?)\]\]/g, '$1').replace(/\|.*?\]/g, '');

    // Filter for pages with class "Quotes" and matching source
    const quotePages = dv.pages()
        .where(p => p.class === "Quotes");

    const quotes = {};
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, content, bodyContent } = await getFullQuoteContent(page.file);
        
        // Get the quote's source
        const sourceStr = page.source?.toString() || '';
        const source = sourceStr
            .replace(/\[\[(.*?)\]\]/g, '$1')
            .replace(/\|.*?\]/g, '');
            
        // Check if the quote's source matches the current note's source
        if (source === normalizedCurrentSource && normalizedCurrentSource !== '') {
            if (!quotes[source]) {
                quotes[source] = [];
            }
            
            const bodyTags = extractBodyTags(bodyContent);
            const authors = parseAuthorsFromYaml(yaml);
            
            quotes[source].push({
                title: page.file.name,
                content: content,
                tags: formatTags(page.tags, bodyTags),
                authors: authors
            });
        }
    }));

    let output = `### Quotes from this Source\n\n`;

    for (const [source, sourceQuotes] of Object.entries(quotes)) {
        // Collect all unique authors across quotes from this source
        const allAuthors = new Set();
        sourceQuotes.forEach(quote => {
            quote.authors.forEach(author => allAuthors.add(author));
        });
        
        // Format authors as wiki links
        const authorLinks = Array.from(allAuthors).map(author => `[[${author}]]`).join(', ');
        
    
        
        output += '| Link | Quote |\n|---|---|\n';
        
        sourceQuotes.forEach(quote => {
            const leftCell = `[[${escapeTableCell(quote.title)}\\| 🔗]]`;
            const rightCell = `${escapeTableCell(quote.content)}<br><br>${quote.tags}`;
            output += `| ${leftCell} | ${rightCell} |\n`;
        });
        
        output += '\n';
    }

    if (Object.keys(quotes).length === 0) {
        output += 'No quotes found for this source\n';
    }

    return output;
}

// Execute
(async () => {
    const output = await displayQuotesBySource(dv);
    dv.paragraph(output);
})();