async function displayQuotesTelescopesAll(dv, input) {
    const fromFolders = input?.fromFolders || [];
    const excludeFolders = input?.excludeFolders || [];

    async function getFullQuoteContent(file) {
        try {
            const content = await dv.io.load(file.path);
            const sections = content.split(/---\s*/);
            
            if (sections.length >= 3) {
                const yaml = sections[1].trim();
                const bodyText = sections[2].split(/^##\s+/m)[0].trim();
                return {
                    yaml: yaml,
                    text: bodyText || ''
                };
            }
            return { yaml: '', text: content || '' };
        } catch (error) {
            console.error(`Error loading file ${file.path}:`, error);
            return { yaml: '', text: '' };
        }
    }

    function parseYamlField(yamlString, field) {
        // First try array format
        const arrayRegex = new RegExp(`${field}:\\s*\\n(?:\\s*-\\s*(.*)\\s*\\n)*`);
        const arrayMatch = yamlString.match(arrayRegex);
        
        if (arrayMatch) {
            const lines = yamlString.split('\n');
            const values = [];
            let found = false;
            
            for (const line of lines) {
                if (line.trim().startsWith(`${field}:`)) {
                    found = true;
                    continue;
                }
                if (found && line.trim().startsWith('-')) {
                    values.push(line.replace(/^\s*-\s*/, '').trim());
                }
            }
            
            if (values.length > 0) {
                return values;
            }
        }
        
        // Try single value format
        const singleRegex = new RegExp(`${field}:\\s*([^\\n]+)`);
        const singleMatch = yamlString.match(singleRegex);
        
        if (singleMatch) {
            return [singleMatch[1].trim()];
        }
        
        return [];
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

    function formatSourceLink(source) {
        if (!source) return 'Unknown Source';
        const titleMatch = source.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
        return titleMatch ? `[[${titleMatch[1]}]]` : source;
    }

    const quotePages = dv.pages()
        .where(p => p.class === "Quotes" && 
                   p.category === "KOI" &&
                   !excludeFolders.some(folder => p.file.path.startsWith(folder)) &&
                   (fromFolders.length === 0 || fromFolders.some(folder => p.file.path.startsWith(folder))));

    const sourceEntries = {};
    await Promise.all(quotePages.map(async (page) => {
        const { yaml, text } = await getFullQuoteContent(page.file);
        const source = parseYamlField(yaml, 'source')[0] || '';
        const sourceKey = formatSourceLink(source);
        const authors = parseYamlField(yaml, 'author');
        const quoteCreated = parseYamlField(yaml, 'quote_created')[0] || '';
        
        if (!sourceEntries[sourceKey]) {
            sourceEntries[sourceKey] = [];
        }
        
        sourceEntries[sourceKey].push({
            title: page.file.name,
            text: text,
            authors: formatAuthorLinks(authors),
            created: quoteCreated,
            folder: page.file.folder
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
        
        output += `#### Source: ${source}\n\n`;
        output += '| Quote | Author | Text |\n|---|---|---|\n';
        
        sourceQuotes.forEach(entry => {
            const leftCell = escapeTableCell(`[[${entry.title}|📖]]`);
            const textContent = entry.text || 'No content available';
            output += `| ${leftCell} | ${entry.authors} | ${escapeTableCell(textContent)} |\n`;
        });
        
        output += '\n';
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
    const output = await displayQuotesTelescopesAll(dv, input);
    dv.paragraph(output);
})();