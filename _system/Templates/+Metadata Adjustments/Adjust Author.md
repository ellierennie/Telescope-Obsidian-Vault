<%*
// METADJUST - ENHANCED AUTHOR FIELD MANAGER

const description = "adjust the author title"; 

// Configuration
const CONFIG = {
    peopleFolder: "authorNotes/sources/_authors",
    type: "" // Filter for specific types of people notes
};

// Helper Functions
const formatFileMenuItem = (file) => {
    return file.isMoc ? `🗺️ ${file.name}` : `📄 ${file.name}`;
};

// Function to create properly formatted wikilink
function createWikilink(name) {
    return `[[Folders/People/Sources/${name}|${name}]]`;
}

// Function to recursively get all files from a folder and its subfolders
function getAllFiles(path) {
    const folderObj = app.vault.getAbstractFileByPath(path);
    if (!folderObj || !folderObj.children) return [];
    
    let allFiles = [];
    
    folderObj.children.forEach(file => {
        if (file instanceof tp.obsidian.TFolder) {
            allFiles = allFiles.concat(getAllFiles(file.path));
        } else {
            try {
                const page = app.plugins.plugins.dataview.api.page(file.path);
                if (CONFIG.type === "" || page.type === CONFIG.type) {
                    allFiles.push({
                        name: file.name.replace(/\.md$/, ''),
                        path: file.path,
                        isFolder: false,
                        isMoc: file.name === `${file.parent.name}.md`
                    });
                }
            } catch (e) {
                // Skip if file doesn't have required metadata
            }
        }
    });
    
    return allFiles;
}

// Function to get files and folders in a given path
function getFilesAndFolders(path) {
    const folderObj = app.vault.getAbstractFileByPath(path);
    if (!folderObj || !folderObj.children) return [];
    
    const items = folderObj.children.map(file => ({
        name: file.name.replace(/\.md$/, ''),
        path: file.path,
        isFolder: file instanceof tp.obsidian.TFolder,
        isMoc: file instanceof tp.obsidian.TFile && file.name === `${file.parent.name}.md`
    }));
    
    const filteredItems = items.filter(item => {
        if (item.isFolder) return true;
        if (!item.isFolder) {
            try {
                const page = app.plugins.plugins.dataview.api.page(item.path);
                return CONFIG.type === "" || page.type === CONFIG.type;
            } catch (e) {
                return false;
            }
        }
        return true;
    });
    
    return filteredItems.sort((a, b) => {
        if (a.isMoc && !b.isMoc) return -1;
        if (!a.isMoc && b.isMoc) return 1;
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
    });
}

// Function to select existing author with navigation
async function selectExistingAuthor(currentPath = CONFIG.peopleFolder) {
    let items = [];
    let choices = [];
    
    if (currentPath === CONFIG.peopleFolder) {
        const allFiles = getAllFiles(CONFIG.peopleFolder);
        items = [
            { name: "Search all", isFolder: false, isSearchAll: true },
            ...getFilesAndFolders(currentPath)
        ];
        choices = [
            "🔍 Search all",
            ...items.slice(1).map(item => {
                if (item.isFolder) return `📁 ${item.name}`;
                return formatFileMenuItem(item);
            })
        ];
    } else {
        items = getFilesAndFolders(currentPath);
        choices = items.map(item => {
            if (item.isFolder) return `📁 ${item.name}`;
            return formatFileMenuItem(item);
        });
    }
    
    if (items.length === 0) {
        new Notice("No authors found in the selected folder.");
        return null;
    }
    
    const selected = await tp.system.suggester(choices, items, false, `Select Author`);
    
    if (selected === null) {
        if (currentPath === CONFIG.peopleFolder) {
            return await mainMenu(); // Return to main menu instead of exiting
        } else {
            const parentPath = currentPath.split('/').slice(0, -1).join('/');
            return await selectExistingAuthor(parentPath);
        }
    }
    
    if (selected.isSearchAll) {
        const allFiles = getAllFiles(CONFIG.peopleFolder);
        const allChoices = allFiles.map(file => formatFileMenuItem(file));
        const selectedFile = await tp.system.suggester(allChoices, allFiles, false, "Search all authors");
        
        if (selectedFile) {
            return selectedFile.name;
        }
        return await selectExistingAuthor(CONFIG.peopleFolder);
    }
    
    if (selected.isFolder) {
        return await selectExistingAuthor(selected.path);
    } else {
        return selected.name;
    }
}

// Function to update author fields
async function updateAuthorFields(file, authorName, isAdditional = false) {
    if (!authorName) return;
    
    try {
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            // Reset fields if this is the first author (not additional)
            if (!isAdditional) {
                frontmatter.author = authorName;
                frontmatter.by = [createWikilink(authorName)];
            } else {
                // Add to existing authors
                if (!frontmatter.author) {
                    frontmatter.author = authorName;
                } else {
                    frontmatter.author = `${frontmatter.author}, ${authorName}`;
                }
                
                // Handle the by field (array of wikilinks)
                const wikilink = createWikilink(authorName);
                if (!frontmatter.by) {
                    frontmatter.by = [wikilink];
                } else {
                    // Ensure by is always an array
                    if (!Array.isArray(frontmatter.by)) {
                        frontmatter.by = [frontmatter.by];
                    }
                    frontmatter.by.push(wikilink);
                }
            }
        });
        
        // Only show notice after successful update
        new Notice(`${isAdditional ? 'Added' : 'Updated'} author "${authorName}" 🎉`);
        return true;
    } catch (error) {
        new Notice(`Error updating frontmatter: ${error.message}`);
        return false;
    }
}

// Function to handle main menu options
async function mainMenu(isAdditional = false, selectedText = '') {
    const options = ["Select existing author", "Enter manually", ...(isAdditional ? ["Finish adding authors"] : [])];
    const choice = await tp.system.suggester(options, options);
    
    if (choice === null || choice === "Finish adding authors") {
        return null;
    }
    
    let author = null;
    if (choice === "Select existing author") {
        author = await selectExistingAuthor();
    } else {
        author = await tp.system.prompt("Enter author name", selectedText);
        if (author === null) {
            return await mainMenu(isAdditional, selectedText);
        }
    }
    
    return author;
}

// Main function
async function main() {
    const file = tp.file.find_tfile(tp.file.title);
    const sourceLeaf = app.workspace.activeLeaf;
    const editor = sourceLeaf.view.editor;
    
    // Store the selection information
    const selection = {
        text: editor.getSelection(),
        from: editor.getCursor('from'),
        to: editor.getCursor('to')
    };
    
    let author = null;
    
    // If there's selected text, use it as initial value in the first author prompt
    if (selection.text) {
        author = await tp.system.prompt("Enter author name", selection.text.trim());
    } else {
        // If no selection, show options menu for first author
        author = await mainMenu();
    }
    
    if (author) {
        const success = await updateAuthorFields(file, author);
        
        if (success) {
            // After adding the first author, enter a loop for additional authors
            let continueAdding = true;
            while (continueAdding) {
                const additionalAuthor = await mainMenu(true);
                if (additionalAuthor) {
                    await updateAuthorFields(file, additionalAuthor, true);
                } else {
                    continueAdding = false;
                }
            }
        }
    }
    
    // Ensure focus remains on the source file
    app.workspace.setActiveLeaf(sourceLeaf);
    
    // Restore the text, maintain selection, and place cursor at end of selected text
    if (selection.text) {
        editor.replaceRange(selection.text, selection.from, selection.to);
        editor.setCursor(selection.to); // Place cursor at end of selection
    }
}

// Run the main function
await main();
-%>
