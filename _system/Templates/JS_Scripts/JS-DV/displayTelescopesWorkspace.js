async function displayTelescopesWorkspace(dv, input) {
    // Get the current file's title to match against team_name
    const currentFileTitle = dv.current().file.name;

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

    function formatLink(type, name, folder) {
        if (!name) return 'Unknown';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        return escapeTableCell(`[[${folder}/${type}/${name}|${name}]]`);
    }

    function formatChannelLink(name, folder) {
        if (!name) return 'Unknown Channel';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        return escapeTableCell(`[[${folder}/Channels/${name}|${name}]]`);
    }

    // Filter pages by class, category, and team_name matching the current file's title
    const telescopePages = dv.pages()
        .where(p => p.class === "KOI" && 
               p.category === "Telescope" &&
               p.team_name === currentFileTitle);

    const telescopeEntries = {};
    await Promise.all(telescopePages.map(async (page) => {
        const { yaml, text } = await getFullTelescopeContent(page.file);
        const channel = parseYamlField(yaml, 'channel_name');
        const folder = page.file.folder;
        const channelName = formatChannelLink(channel, folder);
        
        const createdAt = parseYamlField(yaml, 'created_at') || '1970-01-01';
        const author = parseYamlField(yaml, 'author_name');
        
        if (!telescopeEntries[channelName]) {
            telescopeEntries[channelName] = [];
        }
        
        telescopeEntries[channelName].push({
            title: page.file.name,
            text: text,
            author: formatLink('users', author, folder),
            createdAt: createdAt,
            folder: folder
        });
    }));

    let output = `### Telescope Notes for ${currentFileTitle}\n\n`;

    const sortedChannels = Object.keys(telescopeEntries).sort();

    for (const channel of sortedChannels) {
        const channelEntries = telescopeEntries[channel];
        channelEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        output += `#### Channel: ${channel}\n\n`;
        output += '| Entry | Author | Text |\n|---|---|---|\n';
        
        channelEntries.forEach(entry => {
            const leftCell = escapeTableCell(`[[${entry.title}|🔍]]`);
            const textContent = entry.text || 'No content available';
            output += `| ${leftCell} | ${entry.author} | ${escapeTableCell(textContent)} |\n`;
        });
        
        output += '\n';
    }

    if (sortedChannels.length === 0) {
        output += `No telescope entries found for team "${currentFileTitle}"\n`;
    }

    return output;
}

// Execute
(async () => {
    const output = await displayTelescopesWorkspace(dv, {});
    dv.paragraph(output);
})();