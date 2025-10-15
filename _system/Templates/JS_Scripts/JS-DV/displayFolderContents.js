function displayFolderContents(dv, input) {
    const folderPath = input?.folder || dv.current().file.folder;
    const customFields = input?.fields || [];

    // Add CSS styling
    dv.container.addClass("folder-contents-view");
    const css = `
        .folder-contents-view .table-view-table {
            width: 100%;
            margin-bottom: 2em;
        }
        .folder-contents-view th {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 2px solid var(--background-modifier-border);
            font-weight: 600;
        }
        .folder-contents-view td {
            padding: 4px 8px;
            border-bottom: 1px solid var(--background-modifier-border);
            vertical-align: top;
        }
        .folder-contents-view td:nth-child(1) { width: 300px; }  /* Title */
        .folder-contents-view td:nth-child(2) { width: 400px; }  /* Notes */
        .folder-contents-view h2 {
            margin: 1.5em 0 1em 0;
            color: var(--text-accent);
        }
        .folder-contents-view h2:first-child {
            margin-top: 0;
        }
    `;
    
    // Add CSS to document
    dv.container.createEl("style", { text: css });

    function getImmediateChildren(folderPath) {
        return dv.pages(`"${folderPath}"`)
            .filter(p => p.file && p.file.folder === folderPath);
    }

    function getMetadataValue(page, field) {
        if (!page || !field) return '';
        const value = page[field];
        return value ? value.toString() : '';
    }

    function processFolder(folderPath, depth = 0) {
        let output = "";
        const folderFiles = getImmediateChildren(folderPath);
        
        // Separate MOCs and regular files
        const mocFiles = folderFiles.filter(file => file.type === 'moc');
        const regularFiles = folderFiles.filter(file => file.type !== 'moc');
        
        const sortedFiles = [...mocFiles, ...regularFiles];

        const subFolders = dv.pages(`"${folderPath}"`)
            .filter(p => p.file && p.file.folder.startsWith(folderPath) && p.file.folder !== folderPath)
            .groupBy(p => p.file.folder)
            .map(group => group.key);

        const prefix = '  '.repeat(depth);
        
        if (depth > 0) {
            output += `| ${prefix}📁 Folder Contents | **${sortedFiles.length}** `;
            customFields.forEach(() => {
                output += `| `;
            });
            output += "|\n";
        }

        // Display MOCs first
        mocFiles.forEach(file => {
            if (!file.file) return;
            const note = file.note ? file.note : '';
            output += `| ${prefix}🗺️ [[${file.file.name.replace('.md', '')}]] | ${note} `;
            customFields.forEach(field => {
                const value = getMetadataValue(file, field);
                output += `| ${value.charAt(0).toUpperCase() + value.slice(1)}`;
            });
            output += "|\n";
        });

        // Display regular files
        regularFiles.forEach(file => {
            if (!file.file) return;
            const note = file.note ? file.note : '';
            output += `| ${prefix}[[${file.file.name.replace('.md', '')}]] | ${note} `;
            customFields.forEach(field => {
                const value = getMetadataValue(file, field);
                output += `| ${value.charAt(0).toUpperCase() + value.slice(1)}`;
            });
            output += "|\n";
        });

        subFolders.forEach(subFolder => {
            output += processFolder(subFolder, depth + 1);
        });

        return output;
    }

    const mainFolderFiles = getImmediateChildren(folderPath);
    let output = `| 📁 Folder Contents | Notes (**${mainFolderFiles.length}**)`;
    customFields.forEach(field => {
        output += ` | ${field.charAt(0).toUpperCase() + field.slice(1)}`;
    });
    output += " |\n| --- | ---";
    customFields.forEach(() => {
        output += " | ---";
    });
    output += " |\n";
    
    output += processFolder(folderPath, 0);

    dv.paragraph(output);
}

displayFolderContents(dv, input);