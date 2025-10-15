async function scopeLINKs(tp, excludedFolders = []) {
    const dv = app.plugins.plugins.dataview.api;

    // Emoji mappings
    const TYPE_EMOJI = {
        'moc': '🗺️',
        'note': '🗒️',
        'ppl': '👤',
        'meeting': '👋'
    };
    
    const CLASS_EMOJI = {
        'Sources': '📖',
        'Quotes': '💬'
    };

    // Function to get all flagged notes
    function getFlaggedNotes() {
        const files = app.vault.getMarkdownFiles();
        const flaggedNotes = [];
        
        for (const file of files) {
            if (isExcluded(file.path)) continue;
            
            try {
                const page = app.plugins.plugins.dataview.api.page(file.path);
                if (page.flag === true) {
                    flaggedNotes.push({
                        name: file.name.replace(/\.md$/, ''),
                        path: file.path,
                        isFolder: false,
                        emoji: getEmoji(page)
                    });
                }
            } catch (e) {
                // Skip if file doesn't have required metadata
            }
        }
        
        return flaggedNotes.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Function to check if path should be excluded
    function isExcluded(path) {
        return excludedFolders.some(folder => {
            const normFolder = folder.startsWith('/') ? folder : '/' + folder;
            const normPath = path.startsWith('/') ? path : '/' + path;
            return normPath.startsWith(normFolder) || normPath === normFolder;
        });
    }

    // Function to get emoji for file
    function getEmoji(page) {
        if (!page) return '📄';
        if (page.type && TYPE_EMOJI[page.type]) return TYPE_EMOJI[page.type];
        if (page.class && CLASS_EMOJI[page.class]) return CLASS_EMOJI[page.class];
        return '📄';
    }

    // Function to recursively get all files
    function getAllFiles(path) {
        const folderObj = app.vault.getAbstractFileByPath(path);
        if (!folderObj || !folderObj.children) return [];
        
        let allFiles = [];
        
        folderObj.children.forEach(file => {
            if (isExcluded(file.path)) return;
            
            if (file instanceof tp.obsidian.TFolder) {
                allFiles = allFiles.concat(getAllFiles(file.path));
            } else if (file.extension === 'md') {
                try {
                    const page = app.plugins.plugins.dataview.api.page(file.path);
                    allFiles.push({
                        name: file.name.replace(/\.md$/, ''),
                        path: file.path,
                        isFolder: false,
                        emoji: getEmoji(page)
                    });
                } catch (e) {
                    // Skip if file doesn't have required metadata
                }
            }
        });
        
        return allFiles;
    }

    // Function to get files and folders in current path
    function getFilesAndFolders(path) {
        const folderObj = app.vault.getAbstractFileByPath(path);
        if (!folderObj || !folderObj.children) return [];
        
        const items = folderObj.children
            .filter(file => !isExcluded(file.path))
            .map(file => {
                if (file instanceof tp.obsidian.TFolder) {
                    return {
                        name: file.name,
                        path: file.path,
                        isFolder: true
                    };
                } else if (file.extension === 'md') {
                    try {
                        const page = app.plugins.plugins.dataview.api.page(file.path);
                        return {
                            name: file.name.replace(/\.md$/, ''),
                            path: file.path,
                            isFolder: false,
                            emoji: getEmoji(page)
                        };
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            })
            .filter(item => item !== null);
        
        return items.sort((a, b) => {
            if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
            return a.isFolder ? -1 : 1;
        });
    }

    // Main selection function
    async function selectItems(currentPath = "/", selectedItems = new Set()) {
        let items = [];
        let choices = [];
        
        // At root level, show initial options
        if (currentPath === "/") {
            const rootFiles = getFilesAndFolders("/");
            items = [
                { name: "Search All", isSearchAll: true },
                { name: "Flagged Notes", isFlagged: true },
                ...rootFiles
            ];
            choices = [
                "🔍 Search All",
                "🚩 Flagged Notes",
                ...rootFiles.map(item => 
                    item.isFolder ? 
                        `📁 ${item.name}` : 
                        `${item.emoji || '📄'} ${selectedItems.has(item.name) ? '✓ ' : ''}${item.name}`
                )
            ];
        } else {
            items = getFilesAndFolders(currentPath);
            choices = items.map(item => 
                item.isFolder ? 
                    `📁 ${item.name}` : 
                    `${item.emoji || '📄'} ${selectedItems.has(item.name) ? '✓ ' : ''}${item.name}`
            );
        }
        
        if (items.length <= 1 && currentPath !== "/") {
            new Notice("No items found in this location");
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || "/";
            return selectItems(parentPath, selectedItems);
        }

        const selected = await tp.system.suggester(
            choices,
            items,
            false,
            `Select items (${selectedItems.size} selected) - ESC to go back`
        );
        
        if (selected === null) {
            if (currentPath === "/") {
                return selectedItems;
            } else {
                const parentPath = currentPath.split('/').slice(0, -1).join('/') || "/";
                return selectItems(parentPath, selectedItems);
            }
        }
        
        if (selected.isSearchAll) {
            const allFiles = getAllFiles(currentPath);
            let searching = true;
            
            while (searching) {
                const fileChoices = allFiles.map(file => ({
                    name: `${selectedItems.has(file.name) ? '✓ ' : ''}${file.emoji || '📄'} ${file.name}`,
                    value: file
                }));
                
                if (fileChoices.length === 0) {
                    new Notice("No files found in this location");
                    searching = false;
                } else {
                    const selectedFile = await tp.system.suggester(
                        fileChoices.map(c => c.name),
                        fileChoices.map(c => c.value),
                        false,
                        `Search all files (${selectedItems.size} selected) - ESC when done`
                    );
                    
                    if (selectedFile === null) {
                        searching = false;
                    } else {
                        if (selectedItems.has(selectedFile.name)) {
                            selectedItems.delete(selectedFile.name);
                        } else {
                            selectedItems.add(selectedFile.name);
                        }
                    }
                }
            }
            return selectItems(currentPath, selectedItems);
        }

        if (selected.isFlagged) {
            const flaggedNotes = getFlaggedNotes();
            let searching = true;
            
            while (searching) {
                if (flaggedNotes.length === 0) {
                    new Notice("No flagged notes found");
                    searching = false;
                } else {
                    const fileChoices = flaggedNotes.map(file => ({
                        name: `${selectedItems.has(file.name) ? '✓ ' : ''}${file.emoji || '📄'} ${file.name}`,
                        value: file
                    }));
                    
                    const selectedFile = await tp.system.suggester(
                        fileChoices.map(c => c.name),
                        fileChoices.map(c => c.value),
                        false,
                        `Select flagged notes (${selectedItems.size} selected) - ESC when done`
                    );
                    
                    if (selectedFile === null) {
                        searching = false;
                    } else {
                        if (selectedItems.has(selectedFile.name)) {
                            selectedItems.delete(selectedFile.name);
                        } else {
                            selectedItems.add(selectedFile.name);
                        }
                    }
                }
            }
            return selectItems(currentPath, selectedItems);
        }
        
        if (selected.isFolder) {
            return selectItems(selected.path, selectedItems);
        } else {
            if (selectedItems.has(selected.name)) {
                selectedItems.delete(selected.name);
            } else {
                selectedItems.add(selected.name);
            }
            return selectItems(currentPath, selectedItems);
        }
    }

    // Start selection process
    const selectedItems = await selectItems();
    const selectedArray = Array.from(selectedItems);

    return {
        scopedLinks: selectedArray
            .map(link => `[[${link}]]`)
            .join(" OR "),
        showLinks: selectedArray.map(link => `- [[${link}]]`).join("\n"),
        selectedLinks: selectedArray
    };
}

module.exports = scopeLINKs;