async function displayTelescopesByChannel(dv) {
    // Get current file's name to use as search field
    const currentFileName = dv.current().file.name;

    async function getFullTelescopeContent(file) {
        try {
            const content = await dv.io.load(file.path);
            const sections = content.split(/---\s*/);
            
            if (sections.length >= 3) {
                const yaml = sections[1].trim();
                const bodyText = sections.slice(2).join('---').trim();
                return {
                    yaml: yaml,
                    text: parseYamlField(yaml, 'text') || bodyText || ''
                };
            }
            return { yaml: '', text: content || '' };
        } catch (error) {
            console.error(`Error loading file ${file.path}:`, error);
            return { yaml: '', text: '' };
        }
    }

    function parseYamlField(yamlString, field) {
        const fieldRegex = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`);
        const match = yamlString.match(fieldRegex);
        if (match) {
            return match[1].replace(/^\s*["']|["']\s*$/g, '').trim();
        }
        return '';
    }

    function escapeTableCell(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .trim();
    }

    function formatAuthorLink(name, folder) {
        if (!name) return 'Unknown Author';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        return escapeTableCell(`[[${folder}/Authors/${name}|${name}]]`);
    }

    // Filter pages by class, category, and channel_name matching the current file's title
    const telescopePages = dv.pages()
        .where(p => p.class === "KOI" && 
               p.category === "Telescope" &&
               p.channel_name === currentFileName);

    let entries = [];
    
    await Promise.all(telescopePages.map(async (page) => {
        const { yaml, text } = await getFullTelescopeContent(page.file);
        const author = parseYamlField(yaml, 'author_name'); // Using author_name for consistency
        const folder = page.file.folder;
        const createdAt = parseYamlField(yaml, 'created_at') || '1970-01-01';
        
        entries.push({
            title: page.file.name,
            author: formatAuthorLink(author, folder),
            text: text,
            createdAt: createdAt,
            folder: folder
        });
    }));

    // Sort entries by creation date (newest first)
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let output = `### Telescope entries for [[${currentFileName}]]\n\n`;

    if (entries.length > 0) {
        output += '| Entry | Author | Text |\n|---|---|---|\n';
        
        entries.forEach(entry => {
            const leftCell = escapeTableCell(`[[${entry.title}|🔍]]`);
            const textContent = entry.text || 'No content available';
            output += `| ${leftCell} | ${entry.author} | ${escapeTableCell(textContent)} |\n`;
        });
        
        output += '\n';
    } else {
        output += `No telescope entries found for channel "${currentFileName}"\n`;
    }

    return output;
}

// Execute
(async () => {
    const output = await displayTelescopesByChannel(dv);
    dv.paragraph(output);
})();