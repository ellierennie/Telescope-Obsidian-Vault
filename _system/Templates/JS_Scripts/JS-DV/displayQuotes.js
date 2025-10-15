async function displayQuotes(dv) {
    async function getFullQuoteContent(file) {
        const content = await dv.io.load(file.path);
        
        // Split the content by '---' markers
        const sections = content.split(/---\s*/);
        
        // The quote content will be in sections[1]
        // sections[0] is empty (before first ---)
        // sections[1] is YAML (between first and second ---)
        // sections[2] is the quote content (between second and third ---)
        // sections[3] and beyond is everything after
        
        if (sections.length >= 4) {  // Ensure we have at least 3 '---' markers
            return sections[2].trim();  // Return content between second and third '---'
        }
        return '';
    }

    function escapeTableCell(text) {
        // Escape pipe characters and handle newlines
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, '<br>');
    }

    function formatTags(tags) {
        if (!tags) return '';
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        return tagArray
            .map(tag => tag.trim())
            .filter(tag => tag)
            .map(tag => `#${tag.replace(/^#/, '')}`)
            .join(' ');
    }

// Get quotes that link to current file
const quotePages = dv.pages()
    .where(p => (p.class === "Quotes") 
    && p.file.outlinks.includes(dv.current().file.link));

    // Group quotes by source
    const quotes = {};
    await Promise.all(quotePages.map(async (page) => {
        const source = page.source.toString()
            .replace(/\[\[(.*?)\]\]/g, '$1')
            .replace(/\|.*?\]/g, '');
            
        if (!quotes[source]) {
            quotes[source] = [];
        }
        
        // Get the full quote content
        const content = await getFullQuoteContent(page.file);
        
        quotes[source].push({
            title: page.file.name,
            content: content,
            tags: formatTags(page.tags)
        });
    }));

    let output = `### Quotes referencing [[${dv.current().file.name}]]\n\n`;

    // Generate output with separate tables for each source
    for (const [source, sourceQuotes] of Object.entries(quotes)) {
        output += `#### From: [[${escapeTableCell(source)}]]\n\n`;
        output += '| Quote | Content |\n|---|---|\n';
        
        sourceQuotes.forEach(quote => {
            const leftCell = `[[${escapeTableCell(quote.title)}\\| 🔗]]`;
            // Handle multi-paragraph content by converting newlines to <br> tags
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
    const output = await displayQuotes(dv);
    dv.paragraph(output);
})();