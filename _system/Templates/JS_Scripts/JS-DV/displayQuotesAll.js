async function displayQuotesAll(dv, input) {
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

    const sourceEntries = {};
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, text, bodyContent } = await getFullQuoteContent(page.file);
        const source = parseYamlField(yaml, 'source');
        const sourceKey = formatSourceLink(source);
        const authors = parseYamlField(yaml, 'author', true); // Note the true flag for array parsing
        const quoteCreated = parseYamlField(yaml, 'quote_created');
        
        // Extract tags from both frontmatter and body content
        const bodyTags = extractBodyTags(bodyContent);
        const formattedTags = formatTags(page.tags, bodyTags);
        
        if (!sourceEntries[sourceKey]) {
            sourceEntries[sourceKey] = [];
        }
        
        sourceEntries[sourceKey].push({
            title: page.file.name,
            text: text,
            authors: formatAuthorLinks(authors),
            created: quoteCreated,
            folder: page.file.folder,
            tags: formattedTags
        });
    }));

    let output = `### Curated Quotes\n\n`;
    if (fromFolders.length > 0) {
        output += `Displaying quotes from folders: ${fromFolders.join(', ')}\n\n`;
    }

    const sortedSources = Object.keys(sourceEntries).sort();

    for (const source of sortedSources) {
        const sourceQuotes = sourceEntries[source];
        sourceQuotes.sort((a, b) => b.created.localeCompare(a.created));
        
        // Get the first entry to display authors at the source level
        // Only if there are quotes for this source
        if (sourceQuotes.length > 0) {
            const firstEntry = sourceQuotes[0];
            output += `#### Source: ${source}\n#### By: ${firstEntry.authors}\n`;
            output += '| Quote | Text |\n|---|---|\n';
            
            sourceQuotes.forEach(entry => {
                const leftCell = escapeTableCell(`[[${entry.title}|📖]]`);
                const textContent = entry.text || 'No content available';
                const tagDisplay = entry.tags ? `<br><br>${entry.tags}` : '';
                output += `| ${leftCell} | ${escapeTableCell(textContent)}${tagDisplay} |\n`;
            });
            
            output += '\n';
        }
    }

    if (sortedSources.length === 0) {
        output += `No quotes found${fromFolders.length > 0 ? ` in specified folders` : ''}\n`;
    }

    return output;
}

// Execute
(async () => {
    const input = {
        fromFolders: [], // Add folders here to filter
        excludeFolders: [] // Add folders to exclude here
    };
    const output = await displayQuotesAll(dv, input);
    dv.paragraph(output);
})();