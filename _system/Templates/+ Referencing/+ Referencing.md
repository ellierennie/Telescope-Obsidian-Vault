<%*
// Configuration
const CONFIG = {
    folders: {
        ROOT: "_system/Templates/+ Referencing",
        STOP: ["_system/Templates"]  
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

async function executeTemplate(template, selectedText = '') {
    try {
        const file = tp.file.find_tfile(template.path);
        if (!file) throw new Error("Template file not found");

        // Create destination folder if needed
        if (template.destinationFolder) {
            const folderExists = app.vault.getAbstractFileByPath(template.destinationFolder);
            if (!folderExists) {
                await app.vault.createFolder(template.destinationFolder);
            }
        }
        
        // Execute the template and get its result
        const result = await tp.file.include(`[[${template.path}]]`);
        
        // If the template returned a wikilink (indicating it handled selected text)
        if (result && typeof result === 'string' && result.startsWith('[[')) {
            return result;
        }
        
        // If we got a success result, handle according to template type
        if (result && result.success) {
            const message = template.type === CONFIG.templateTypes.CREATE ? 
                CONFIG.notices.SUCCESS(template.name) :
                CONFIG.notices.SUCCESS_OTHER(template.name);
            new Notice(message);
            
            // Return any content from the template
            return result.content || '';
        }
        
        return '';
    } catch (error) {
        console.error("Error executing template:", error);
        new Notice(CONFIG.notices.TEMPLATE_ERROR + error.message);
        return '';
    }
}

async function main() {
    try {
        let currentPath = CONFIG.folders.ROOT;
        let previousPaths = [];
        const selectedText = tp.file.selection();
        
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
                "Select operation"
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

            // Execute the selected template
            const result = await executeTemplate(selected, selectedText);
            return result;
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