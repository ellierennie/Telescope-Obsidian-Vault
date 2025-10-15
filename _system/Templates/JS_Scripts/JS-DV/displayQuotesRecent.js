async function displayQuotesRecent(dv, input) {
    const limit = input?.limit || 11; // Default to 11 quotes
    const fromFolders = input?.fromFolders || [];
    const excludeFolders = input?.excludeFolders || [];

    async function getFullQuoteContent(file) {
        try {
            const content = await dv.io.load(file.path);
            const sections = content.split(/---\s*/);
            
            if (sections.length >= 3) {
                const yaml = sections[1].trim();
                const bodyText = sections[2].split(/^##\s+/m)[0].trim();
                const bodyContent = sections.slice(2).join('---').trim(); // Get full content for tags
                return {
                    yaml: yaml,
                    text: bodyText || '',
                    bodyContent: bodyContent || ''
                };
            }
            return { yaml: '', text: content || '', bodyContent: content || '' };
        } catch (error) {
            console.error(`Error loading file ${file.path}:`, error);
            return { yaml: '', text: '', bodyContent: '' };
        }
    }

    function parseYamlField(yamlString, field, isArray = false) {
        if (isArray) {
            // Try array format first
            const arrayRegex = new RegExp(`${field}:\\s*\\n((?:\\s*-\\s*.*\\n)*)`);
            const arrayMatch = yamlString.match(arrayRegex);
            if (arrayMatch && arrayMatch[1].trim()) {
                return arrayMatch[1]
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace(/^\s*-\s*/, '').replace(/["']/g, '').trim());
            }
            
            // Try single value format as fallback
            const singleRegex = new RegExp(`${field}:\\s*([^\\n]+)`);
            const singleMatch = yamlString.match(singleRegex);
            if (singleMatch) {
                return [singleMatch[1].trim()];
            }
            
            return [];
        } else {
            // For non-array fields
            const fieldRegex = new RegExp(`${field}:\\s*([^\\n]+)`);
            const match = yamlString.match(fieldRegex);
            return match ? match[1].trim() : '';
        }
    }

    function formatAuthorLinks(authors) {
        if (!authors || authors.length === 0) return 'Unknown';
        return authors
            .map(author => {
                // Extract just the name from the full wiki link format
                const nameMatch = author.match(/\[\[.*?\|(.*?)\]\]/);
                if (nameMatch) {
                    return `[[${nameMatch[1]}]]`;
                }
                // If no pipe format, extract from simple wiki link
                const simpleLinkMatch = author.match(/\[\[(.*?)\]\]/);
                if (simpleLinkMatch) {
                    return `[[${simpleLinkMatch[1]}]]`;
                }
                return author;
            })
            .join(', ');
    }

    function escapeTableCell(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .trim();
    }
    
    function extractBodyTags(bodyContent) {
        const tagMatches = bodyContent.match(/(?:^|\s)#[\w-]+/g) || [];
        return tagMatches.map(tag => tag.trim());
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

    function formatSourceLink(source) {
        if (!source) return 'Unknown Source';
        const titleMatch = source.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
        return titleMatch ? `[[${titleMatch[1]}]]` : source;
    }

    const quotePages = dv.pages()
        .where(p => p.class === "Quotes" && 
                   p.category === "Sources" &&
                   !excludeFolders.some(folder => p.file.path.startsWith(folder)) &&
                   (fromFolders.length === 0 || fromFolders.some(folder => p.file.path.startsWith(folder))));

    // Collect all quotes with their metadata
    const allQuotes = [];
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, text, bodyContent } = await getFullQuoteContent(page.file);
        const source = parseYamlField(yaml, 'source');
        const sourceLink = formatSourceLink(source);
        const authors = parseYamlField(yaml, 'author', true);
        const quoteCreated = parseYamlField(yaml, 'quote_created');
        
        // Extract tags from both frontmatter and body content
        const bodyTags = extractBodyTags(bodyContent);
        const formattedTags = formatTags(page.tags, bodyTags);
        
        allQuotes.push({
            title: page.file.name,
            text: text,
            authors: formatAuthorLinks(authors),
            created: quoteCreated, // Still collect this for sorting
            folder: page.file.folder,
            tags: formattedTags,
            source: sourceLink
        });
    }));

    // Sort quotes by creation date (newest first)
    allQuotes.sort((a, b) => {
        // Handle missing dates by placing them at the end
        if (!a.created) return 1;
        if (!b.created) return -1;
        return b.created.localeCompare(a.created);
    });

    // Take only the limit number of quotes
    const recentQuotes = allQuotes.slice(0, limit);

    let output = ``;
    output += `${recentQuotes.length} recent quotes`;
    if (fromFolders.length > 0) {
        output += ` from folders: ${fromFolders.join(', ')}`;
    }
    output += '\n\n';

    // Removed the Date column from the table header
    output += '| Quote | Source | Text |\n|---|---|---|\n';
    
    recentQuotes.forEach(quote => {
        // Removed the dateCell
        const quoteCell = escapeTableCell(`[[${quote.title}|📖]]`);
        const sourceCell = escapeTableCell(`${quote.source} <br>By ${quote.authors}`);
        const textContent = quote.text || 'No content available';
        const tagDisplay = quote.tags ? `<br><br>${quote.tags}` : '';
        
        // Removed dateCell from the table row
        output += `| ${quoteCell} | ${sourceCell} | ${escapeTableCell(textContent)}${tagDisplay} |\n`;
    });

    if (recentQuotes.length === 0) {
        output += `No quotes found${fromFolders.length > 0 ? ` in specified folders` : ''}\n`;
    }

    return output;
}

// Execute
(async () => {
    const input = {
        limit: 11, // Display 11 most recent quotes
        fromFolders: [], // Add folders here to filter
        excludeFolders: [] // Add folders to exclude here
    };
    const output = await displayQuotesRecent(dv, input);
    dv.paragraph(output);
})();