async function displayTelescopesAll(dv) {
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

    function extractNameFromWikilink(text) {
        if (!text) return '';
        const wikilinkMatch = text.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
        if (wikilinkMatch) {
            const fullPath = wikilinkMatch[1];
            return fullPath.split('/').pop();
        }
        return text;
    }

    function escapeTableCell(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .trim();
    }

    function formatChannelLink(name, folder) {
        if (!name) return 'Unknown Channel';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        // Just use the name itself, not the full path
        return escapeTableCell(`[[${folder}/Channels/${name}|${name}]]`);
    }
    
    function formatAuthorLink(name, folder) {
        if (!name) return 'Unknown Author';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        // Just use the name itself, not the full path
        return escapeTableCell(`[[${folder}/Authors/${name}|${name}]]`);
    }
    
    function formatWorkspaceLink(name, folder) {
        if (!name) return 'Unknown Workspace';
        name = name.replace(/\[\[(.*?)\]\]/, '$1').split('|')[0].trim();
        // Just use the name itself for display
        const displayName = name.split('/').pop(); // Get just the last part of the path
        return escapeTableCell(`[[${folder}/Workspaces/${name}|${displayName}]]`);
    }

    // Query all telescope pages
    const telescopePages = dv.pages().where(p => p.class === "KOI" && p.category === "Telescope");

    // Group by workspace and channel
    const workspaceEntries = {};
    
    await Promise.all(telescopePages.map(async (page) => {
        const { yaml, text } = await getFullTelescopeContent(page.file);
        const author = parseYamlField(yaml, 'author_name');
        const folder = page.file.folder;
        const authorLink = formatAuthorLink(author, folder);
        
        const channel = parseYamlField(yaml, 'channel_name');
        const channelName = formatChannelLink(channel, folder);
        
        const workspace = parseYamlField(yaml, 'workspace') || 'Uncategorized';
        const workspaceLink = formatWorkspaceLink(workspace, folder);
        
        const createdAt = parseYamlField(yaml, 'created_at') || '1970-01-01';
        
        if (!workspaceEntries[workspaceLink]) {
            workspaceEntries[workspaceLink] = {};
        }
        
        if (!workspaceEntries[workspaceLink][channelName]) {
            workspaceEntries[workspaceLink][channelName] = [];
        }
        
        workspaceEntries[workspaceLink][channelName].push({
            title: page.file.name,
            text: text,
            author: authorLink,
            createdAt: createdAt,
            folder: folder
        });
    }));

    let output = ``;

    // Sort workspaces alphabetically
    const sortedWorkspaces = Object.keys(workspaceEntries).sort();

    for (const workspace of sortedWorkspaces) {
        // Extract just the workspace name from the link for display
        const workspaceName = extractNameFromWikilink(workspace) || workspace;
        output += `### Workspace: ${workspace}\n\n`;
        
        // Sort channels alphabetically within this workspace
        const channelsInWorkspace = workspaceEntries[workspace];
        const sortedChannels = Object.keys(channelsInWorkspace).sort();
        
        for (const channel of sortedChannels) {
            // Extract just the channel name from the link for display
            const channelName = extractNameFromWikilink(channel) || channel;
            const channelEntries = channelsInWorkspace[channel];
            // Sort entries by date (newest first)
            channelEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            output += `#### Channel: ${channel}\n\n`;
            // Add author column to the table
            output += '| Entry | Author | Text |\n|---|---|---|\n';
            
            channelEntries.forEach(entry => {
                // Create telescope link with just the name showing
                const leftCell = escapeTableCell(`[[${entry.folder}/${entry.title}|🔍]]`);
                const textContent = entry.text || 'No content available';
                output += `| ${leftCell} | ${entry.author} | ${escapeTableCell(textContent)} |\n`;
            });
            
            output += '\n';
        }
    }

    if (sortedWorkspaces.length === 0) {
        output += 'No telescope entries found\n';
    }

    return output;
}

// Execute
(async () => {
    const output = await displayTelescopesAll(dv);
    dv.paragraph(output);
})();