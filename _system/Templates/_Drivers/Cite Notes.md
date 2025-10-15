<%*
// Configuration
const CLASS_NAME = "Notes";  // Change this to filter by different classes
const FOLDER_EMOJI = "🗺️";  // Emoji for categories
const MOC_EMOJI = "🗺️";     // Emoji for MOC items
const NOTE_EMOJI = "📍";    // Emoji for regular notes
const MENU_TITLE = `${FOLDER_EMOJI} Cite ${CLASS_NAME}`;
const NOTES_FOLDER = "Notes";  

// Stop conditions
const STOP = "_system/Templates";

// Initial validation
function validateLocation() {
    const currentFile = tp.file.folder(true);
    if (currentFile.startsWith(STOP)) {
        new Notice("Can't run template here");
        return false;
    }
    return true;
}

// Helper function to check if file should be included
const shouldIncludeFile = (filePath) => {
    // Normalize paths for comparison by removing any leading/trailing slashes
    const normalizedFilePath = filePath.replace(/^\/+|\/+$/g, '');
    const normalizedNotesFolder = NOTES_FOLDER.replace(/^\/+|\/+$/g, '');
    
    // Check if the file path starts with or is within the notes folder path
    return normalizedFilePath.startsWith(normalizedNotesFolder) || 
           normalizedFilePath.includes('/' + normalizedNotesFolder + '/');
};

// Get all notes organized by category - simplified version
const getAllNotesData = () => {
    let mocItems = [];
    let regularItems = [];
    
    const files = app.vault.getMarkdownFiles()
        .filter(file => shouldIncludeFile(file.path));
    
    files.forEach(file => {
        try {
            const page = app.plugins.plugins.dataview.api.page(file.path);
            if (page.class && 
                page.class.toString().toLowerCase() === CLASS_NAME.toLowerCase()) {
                
                const isMOC = page.type && page.type.toString().toLowerCase() === 'moc';
                const category = page.category ? page.category.toString() : 'Uncategorized';
                const fileName = file.name.replace(/\.md$/, '');
                
                const fileInfo = {
                    name: fileName,
                    path: file.path,
                    file: file,
                    isMOC: isMOC,
                    category: category
                };
                
                if (isMOC) {
                    mocItems.push(fileInfo);
                } else {
                    regularItems.push(fileInfo);
                }
            }
        } catch (e) {
            // Skip if file doesn't have required metadata
        }
    });
    
    // Sort MOC items alphabetically by name
    mocItems.sort((a, b) => a.name.localeCompare(b.name));
    
    // Sort regular items alphabetically
    regularItems.sort((a, b) => a.name.localeCompare(b.name));
    
    return {
        mocItems,
        regularItems
    };
};

// Show single menu with MOCs at top and all notes below
async function showMenu() {
    const { mocItems, regularItems } = getAllNotesData();
    
    const menuOptions = [
        // MOC items at the top without note count
        ...mocItems.map(item => ({
            name: `${MOC_EMOJI} ${item.name}`,
            file: item.file,
            isMOC: true,
            category: item.category
        })),
        // Regular note items below
        ...regularItems.map(item => ({
            name: `${NOTE_EMOJI} ${item.name}`,
            file: item.file,
            isMOC: false,
            category: item.category
        }))
    ];
    
    return await tp.system.suggester(
        menuOptions.map(opt => opt.name),
        menuOptions,
        false,
        MENU_TITLE
    );
}

// Simplified main function with single menu selection
async function main() {
    if (!validateLocation()) {
        return '';
    }
    
    try {
        // Show single menu and get selection
        const selection = await showMenu();
        if (!selection) return ''; // User pressed ESC to exit
        
        // User selected an item, return it as a link
        const fileName = selection.file.name.replace(/\.md$/, '');
        return `[[${fileName}]] `;
    } catch (error) {
        console.error("Error in main function:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}

// Run the main function and set the result
tR += await main();
%>