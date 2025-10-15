async function displayTelescopesByAuthor(dv) {
    async function getFullTelescopeContent(file) {
        try {
            const content = await dv.io.load(file.path);
            const sections = content.split(/---\s*/);
            
            if (sections.length >= 3) {
                const yaml = sections[1].trim();
                // Get both YAML text field and body content
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
        // Enhanced YAML field parsing with multiline support
        const fieldRegex = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`);
        const match = yamlString.match(fieldRegex);
        if (match) {
            // Clean up the extracted text
            return match[1].replace(/^\s*["']|["']\s*$/g, '').trim();
        }
        return '';
    }

    function extractNameFromWikilink(text) {
        if (!text) return '';
        // Check for [[path/name]] or [[path/name|alias]] formats
        const wikilinkMatch = text.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
        if (wikilinkMatch) {
            // Extract just the filename part without the path
            const fullPath = wikilinkMatch[1];
            return fullPath.split('/').pop();
        }
        return text; // Return original if not a wikilink
    }

    function escapeTableCell(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ') // Replace newlines with spaces for better table formatting
            .replace(/\r/g, '')
            .trim();
    }

    // Added formatChannelLink function similar to the first script
    function formatChannelLink(name, folder) {
        if (!name) return 'Unknown Channel';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        return escapeTableCell(`[[${folder}/Channels/${name}|${name}]]`);
    }

    // Updated query to match the new classification
    const telescopePages = dv.pages().where(p => p.class === "KOI" && p.category === "Telescope");
    const currentFilePath = dv.current().file.path;
    const currentFileName = dv.current().file.name;

    const telescopeEntries = {};
    await Promise.all(telescopePages.map(async (page) => {
        const { yaml, text } = await getFullTelescopeContent(page.file);
        const author = parseYamlField(yaml, 'author');
        const folder = page.file.folder;
        
        // Enhanced author matching to handle both plain text and wikilinks
        const extractedAuthorName = extractNameFromWikilink(author);
        const isAuthor = extractedAuthorName === currentFileName;
        
        if (isAuthor) {
            const channel = parseYamlField(yaml, 'channel_name');
            // Use formatChannelLink function to handle the channel link
            const channelName = formatChannelLink(channel, folder);
            const rawChannelName = channel.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
            
            const createdAt = parseYamlField(yaml, 'created_at') || '1970-01-01';
            
            if (!telescopeEntries[channelName]) {
                telescopeEntries[channelName] = [];
            }
            
            telescopeEntries[channelName].push({
                title: page.file.name,
                text: text,
                createdAt: createdAt,
                folder: folder
            });
        }
    }));

    let output = `### Telescope by [[${currentFileName}]]\n\n`;

    // Sort channels alphabetically
    const sortedChannels = Object.keys(telescopeEntries).sort();

    for (const channel of sortedChannels) {
        const channelEntries = telescopeEntries[channel];
        // Sort entries by date (newest first)
        channelEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Use the channel name as is, it's already properly formatted by formatChannelLink
        output += `#### Channel: ${channel}\n\n`;
        output += '| Entry | Text |\n|---|---|\n';
        
        channelEntries.forEach(entry => {
            // Fix link format for table cells - escape the link properly
            const leftCell = escapeTableCell(`[[${entry.title}|🔍]]`);
            const textContent = entry.text || 'No content available';
            output += `| ${leftCell} | ${escapeTableCell(textContent)} |\n`;
        });
        
        output += '\n';
    }

    if (sortedChannels.length === 0) {
        output += 'No telescope entries found\n';
    }

    return output;
}

// Execute
(async () => {
    const output = await displayTelescopesByAuthor(dv);
    dv.paragraph(output);
})();