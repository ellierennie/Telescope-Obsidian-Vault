async function displayTelescopes(dv) {
    async function getFullTelescopeContent(file) {
        const content = await dv.io.load(file.path);
        const sections = content.split(/---\s*/);
        
        if (sections.length >= 3) {
            const yaml = sections[1].trim();
            const fullContent = sections[2].trim();
            
            // Extract content between markers
            const telescopeMatch = fullContent.match(/## 🔭\s*([\s\S]*?)## Researcher Comments/);
            const telescopeContent = telescopeMatch ? telescopeMatch[1].trim() : '';
            
            return {
                yaml: yaml,
                content: telescopeContent
            };
        }
        return { yaml: '', content: '' };
    }

    function parseYamlField(yamlString, field) {
        const match = yamlString.match(new RegExp(`${field}:\\s*(.*?)(?:\\n|$)`));
        return match ? match[1].trim() : '';
    }

    function escapeTableCell(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, '<br>');
    }

    const telescopePages = dv.pages()
        .where(p => {
            return p.class === "Telescope" && 
                   p.file.outlinks && 
                   p.file.outlinks.includes(dv.current().file.link);
        });

    let telescopes = [];
    await Promise.all(telescopePages.map(async (page) => {
        const { yaml, content } = await getFullTelescopeContent(page.file);
        const channel = parseYamlField(yaml, 'channel_name');
        const createdAt = parseYamlField(yaml, 'created_at');
        
        telescopes.push({
            title: page.file.name,
            content: content,
            channel: channel,
            createdAt: createdAt
        });
    }));

    // Sort by created_at in descending order (newest first)
    telescopes.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    let output = `### Referencing [[${dv.current().file.name}]]\n\n`;
    
    if (telescopes.length > 0) {
        output += '| Telescope | Content |\n|---|---|\n';
        
        telescopes.forEach(telescope => {
            const leftCell = `[[${escapeTableCell(telescope.title)}\\| 🔗]]`;
            const rightCell = escapeTableCell(telescope.content);
            output += `| ${leftCell} | ${rightCell} |\n`;
        });
        
        output += '\n';
    } else {
        output += '_No telescopes found referencing this note_\n';
    }

    return output;
}

// Execute the function
(async () => {
    try {
        const output = await displayTelescopes(dv);
        dv.paragraph(output);
    } catch (error) {
        console.error('Error in displayTelescopes:', error);
        dv.paragraph('Error: Failed to display telescopes. Check console for details.');
    }
})();