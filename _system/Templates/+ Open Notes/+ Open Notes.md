<%*
const CONFIG = {
    folders: {
        ROOT: "_system/Templates/+ Open Notes"
    },
    excludePatterns: ['+'],
    notices: {
        NO_TEMPLATES: "No templates found",
        TEMPLATE_ERROR: "Error running template: "
    }
};

const FOLDER_EMOJI = "📁";
const FILE_EMOJI = "📄";
const BACK_OPTION = "← Back";

// Get folder contents including templates with descriptions
async function getFolderContents(folderPath) {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (!folder || !folder.children) return { files: [], folders: [] };
    
    const contents = {
        files: [],
        folders: []
    };
    
    for (const item of folder.children) {
        if (item.children) {
            contents.folders.push({
                name: item.name,
                path: item.path
            });
        } else if (item.extension === 'md' && 
                   !CONFIG.excludePatterns.some(pattern => item.name.includes(pattern))) {
            const content = await app.vault.read(item);
            const descriptionMatch = content.match(/const\s+(DESCRIPTION|description)\s*=\s*["'](.+?)["']/);
            
            contents.files.push({
                name: item.basename,
                path: item.path,
                description: descriptionMatch?.[2] || ''
            });
        }
    }
    
    // Sort alphabetically
    contents.folders.sort((a, b) => a.name.localeCompare(b.name));
    contents.files.sort((a, b) => a.name.localeCompare(b.name));
    
    return contents;
}

// Create menu items for folder contents
function createMenuItems(contents, currentPath) {
    let menuItems = [];
    
    // Add back option if not in root folder
    if (currentPath !== CONFIG.folders.ROOT) {
        menuItems.push({
            name: BACK_OPTION,
            isBack: true
        });
        menuItems.push({
            name: "───────────────",
            isSeparator: true
        });
    }
    
    // Add folders
    contents.folders.forEach(folder => {
        menuItems.push({
            name: `${FOLDER_EMOJI} ${folder.name}`,
            path: folder.path,
            isFolder: true
        });
    });
    
    // Add separator if we have both folders and files
    if (contents.folders.length > 0 && contents.files.length > 0) {
        menuItems.push({
            name: "───────────────",
            isSeparator: true
        });
    }
    
    // Add files with descriptions
    contents.files.forEach(file => {
        menuItems.push({
            name: file.description ? 
                `${FILE_EMOJI} ${file.name}\n└────── ${file.description}` : 
                `${FILE_EMOJI} ${file.name}`,
            path: file.path,
            isFile: true
        });
    });
    
    return menuItems;
}

// Execute selected template
async function executeTemplate(templatePath) {
    try {
        await tp.file.include(`[[${templatePath}]]`);
        return { success: true };
    } catch (error) {
        console.error("Error executing template:", error);
        new Notice(CONFIG.notices.TEMPLATE_ERROR + error.message);
        return { success: false, error };
    }
}

// Go up one level in the path
function goUpOneLevel(currentPath) {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    // Check if we would go above root
    if (newPath.split('/').length < CONFIG.folders.ROOT.split('/').length) {
        return null; // Signal that we can't go up further
    }
    return newPath;
}

// Main function
async function main() {
    try {
        let currentPath = CONFIG.folders.ROOT;
        
        while (true) {
            const contents = await getFolderContents(currentPath);
            const menuItems = createMenuItems(contents, currentPath);
            
            if (menuItems.length === 0) {
                new Notice(CONFIG.notices.NO_TEMPLATES);
                return '';
            }
            
            const selection = await tp.system.suggester(
                item => item.name,
                menuItems,
                false,
                `📂 ${currentPath}`
            );
            
            // Handle ESC or Back selection
            if (!selection || selection.isBack) {
                const newPath = goUpOneLevel(currentPath);
                if (newPath === null) {
                    return ''; // Exit only if we're at root
                }
                currentPath = newPath;
                continue;
            }
            
            // Handle separator
            if (selection.isSeparator) {
                continue;
            }
            
            // Handle folder or file selection
            if (selection.isFolder) {
                currentPath = selection.path;
            } else if (selection.isFile) {
                await executeTemplate(selection.path);
                return '';
            }
        }
        
    } catch (error) {
        console.error("Error in main function:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}

// Run the main function
tR += await main();
%>