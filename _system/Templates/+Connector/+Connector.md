<%*
const CONFIG = {
    folders: {
        ROOT: "_system/Templates/+Connector",
        STOP: ["_system/Templates", "telescope"]  // Protected folders where only create operations are allowed
    },
    templateTypes: {
        CREATE: "create",
        BLOCK: "block"
    },
    excludePatterns: ['+', '.excalidraw']
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
            let content = "";
            try {
                content = await app.vault.read(file);
            } catch {
                // Silently continue if we can't read the file
            }
            
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
    } catch {
        // Silent error handling
        return { success: false };
    }
}

async function insertTemplate(templatePath, type) {
    try {
        const file = tp.file.find_tfile(tp.file.title);
        if (!file) return { success: false };
        
        const currentFilePath = file.path;
        if (CONFIG.folders.STOP.some(folder => currentFilePath.startsWith(folder))) {
            // Silently handle protected folders
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
    } catch {
        // Silent error handling
        return { success: false };
    }
}

async function main() {
    let currentPath = CONFIG.folders.ROOT;
    let previousPaths = [];
    
    while (true) {
        const { files, folders } = await getFilesAndFolders(currentPath);
        
        if (files.length === 0 && folders.length === 0) {
            // No templates but don't show Notice
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
            // Selection canceled but don't show Notice
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
            
        // No success notice, just return content if any
        return result.content || '';
    }
}

// Run the main function
tR += await main();
%>