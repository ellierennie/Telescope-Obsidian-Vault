<%*

const CONFIG = {
    folders: {
        ROOT: "_system/Templates/+Metadata Adjustments",
        STOP: ["_system/Templates", "telescope", "authorNotes/sources"]  // Protected folders where only create operations are allowed
    },
    templateTypes: {
        CREATE: "create",
        BLOCK: "block"
    },
    excludePatterns: ['+', '.excalidraw'],
    notices: {
        NO_TEMPLATES: "No templates found",
        TEMPLATE_ERROR: "Error running template: ",
        SELECTION_CANCELED: "Template selection canceled",
        PROTECTED_FOLDER: "Cannot modify templates in protected folders",
        SUCCESS: (name) => `Created new note: ${name}`,
        SUCCESS_OTHER: (name) => `Applied template: ${name}`
    }
};

// Helper Functions
const getFilesAndFolders = async (path) => {
    const folder = app.vault.getAbstractFileByPath(path);
    if (!folder || !folder.children) return { files: [], folders: [] };
    
    const files = [];
    const folders = [];
    
    for (const file of folder.children) {
        if (file.path === tp.file.path) continue;
        
        if (file instanceof tp.obsidian.TFolder) {
            folders.push({
                name: file.name,
                path: file.path,
                isFolder: true
            });
        } else if (file.extension === 'md' && 
                  !CONFIG.excludePatterns.some(pattern => file.name.includes(pattern))) {
            const content = await app.vault.read(file);
            
            const descriptionMatch = content.match(/const\s+(DESCRIPTION|description)\s*=\s*["'](.+?)["']/);
            const typeMatch = content.match(/const\s+templateType\s*=\s*["'](.+?)["']/);
            const destinationMatch = content.match(/const\s+destinationFolder\s*=\s*["'](.+?)["']/);
            
            const templateType = typeMatch?.[1];
            
            files.push({
                name: file.basename,
                description: descriptionMatch?.[2] || '',
                path: file.path,
                type: templateType || 'insert',
                destinationFolder: destinationMatch?.[1] || '',
                isFolder: false
            });
        }
    }
    
    return { 
        files: files.sort((a, b) => a.name.localeCompare(b.name)),
        folders: folders.sort((a, b) => a.name.localeCompare(b.name))
    };
};

async function createNewNote(template) {
    try {
        if (template.destinationFolder) {
            const folderExists = app.vault.getAbstractFileByPath(template.destinationFolder);
            if (!folderExists) {
                await app.vault.createFolder(template.destinationFolder);
            }
        }
        
        const newFile = await tp.file.create_new(
            tp.file.find_tfile(template.path),
            "Untitled",
            false,
            app.vault.getAbstractFileByPath(template.destinationFolder)
        );
        
        await app.workspace.openLinkText(newFile.path, '', true);
        return { success: true };
    } catch (error) {
        console.error("Error in createNewNote:", error);
        return { success: false, error };
    }
}

async function insertTemplate(templatePath, type) {
    try {
        const file = tp.file.find_tfile(tp.file.title);
        if (!file) throw new Error("No active file found");
        
        const currentFilePath = file.path;
        if (CONFIG.folders.STOP.some(folder => currentFilePath.startsWith(folder))) {
            new Notice(CONFIG.notices.PROTECTED_FOLDER);
            return { success: false };
        }
        
        // If it's a block type template, return the content after execution
        if (type === CONFIG.templateTypes.BLOCK) {
            const content = await tp.file.include(`[[${templatePath}]]`);
            return { success: true, content };
        }
        
        // Otherwise, just execute the template
        await tp.file.include(`[[${templatePath}]]`);
        return { success: true };
    } catch (error) {
        console.error("Error inserting template:", error);
        new Notice(CONFIG.notices.TEMPLATE_ERROR + error.message);
        return { success: false, error };
    }
}

async function main() {
    try {
        let currentPath = CONFIG.folders.ROOT;
        let previousPaths = [];
        
        while (true) {
            const { files, folders } = await getFilesAndFolders(currentPath);
            
            if (files.length === 0 && folders.length === 0) {
                new Notice(CONFIG.notices.NO_TEMPLATES);
                return '';
            }

            const menuItems = [];
            
            menuItems.push({ 
                name: `📁 ${currentPath === CONFIG.folders.ROOT ? tp.file.folder() : currentPath.split('/').pop()}`, 
                isHeader: true 
            });
            
            folders.forEach(folder => {
                menuItems.push({
                    ...folder,
                    displayName: `📁 ${folder.name}`
                });
            });
            
            files.forEach(file => {
                const icon = file.type === CONFIG.templateTypes.CREATE ? '📝' : '📄';
                menuItems.push({
                    ...file,
                    displayName: file.description ? 
                        `${icon} ${file.name}\n└────── ${file.description}` : 
                        `${icon} ${file.name}`
                });
            });

            const selected = await tp.system.suggester(
                (item) => item.isHeader ? item.name : item.displayName,
                menuItems.filter(item => !item.isHeader),
                false,
                "Select template or folder (ESC to go back)"
            );

            if (!selected) {
                if (previousPaths.length > 0) {
                    currentPath = previousPaths.pop();
                    continue;
                }
                new Notice(CONFIG.notices.SELECTION_CANCELED);
                return '';
            }

            if (selected.isFolder) {
                previousPaths.push(currentPath);
                currentPath = selected.path;
                continue;
            }

            let result;
            if (selected.type === CONFIG.templateTypes.CREATE) {
                result = await createNewNote(selected);
            } else {
                result = await insertTemplate(selected.path, selected.type);
            }
                
            if (result.success) {
                const message = selected.type === CONFIG.templateTypes.CREATE ? 
                    CONFIG.notices.SUCCESS(selected.name) :
                    CONFIG.notices.SUCCESS_OTHER(selected.name);
                new Notice(message);
            }
            return result.content || '';
        }
    } catch (error) {
        console.error("Error in main function:", error);
        new Notice(`An error occurred: ${error.message}`);
        return '';
    }
}

// Run the main function
tR += await main();
%>