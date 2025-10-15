async function displayQuotesByAuthor(dv) {
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

    // Filter for pages with class "Quotes" only - removed the category filter
    const quotePages = dv.pages()
        .where(p => p.class === "Quotes");
    const currentFilePath = dv.current().file.path;
    const currentFileName = dv.current().file.name;

    const quotes = {};
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, content, bodyContent } = await getFullQuoteContent(page.file);
        const authors = parseAuthorsFromYaml(yaml);
        
        // Check if the current file name appears in any of the author paths
        const isAuthor = authors.some(author => {
            const authorParts = author.split('/');
            const authorName = authorParts[authorParts.length - 1];
            return authorName === currentFileName;
        });
        
        if (isAuthor) {
            const sourceStr = page.source?.toString() || '';
            const source = sourceStr
                .replace(/\[\[(.*?)\]\]/g, '$1')
                .replace(/\|.*?\]/g, '');
                
            if (!quotes[source]) {
                quotes[source] = [];
            }
            
            const bodyTags = extractBodyTags(bodyContent);
            
            quotes[source].push({
                title: page.file.name,
                content: content,
                tags: formatTags(page.tags, bodyTags)
            });
        }
    }));

    let output = `### Quotes by [[${currentFileName}]]\n\n`;

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
        output += 'No quotes found\n';
    }

    return output;
}

// Execute
(async () => {
    const output = await displayQuotesByAuthor(dv);
    dv.paragraph(output);
})();