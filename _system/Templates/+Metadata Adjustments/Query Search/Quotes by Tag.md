<%*
// QUOTE DISPLAY CREATION TEMPLATE
// Configuration
const FOLDER = "Synthesis/Searches";
const NOTE_TEMPLATE = "_system/Templates/_Primary/_QuotesByTag.md";
// Helper function to format the title
const formatTitle = (title) => title.trim().replace(/[.]/g, ' ').replace(/\s+/g, ' ');
// Create new note function
async function createNewNote(wasSelectedText = false) {
    try {
        // Create folder if it doesn't exist
        if (!app.vault.getAbstractFileByPath(FOLDER)) {
            await app.vault.createFolder(FOLDER);
        }
        
        // Get template
        const templateFile = tp.file.find_tfile(NOTE_TEMPLATE);
        if (!templateFile) {
            throw new Error(`Template file not found: ${NOTE_TEMPLATE}`);
        }
        
        // Create new file with date and time as the name
        const now = new Date();
        const formattedDate = `${now.getFullYear().toString().substring(2)}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}`;
        const tempTitle = `${formattedDate} - ${formattedTime}`;
        
        const newFilePath = `${FOLDER}/${tempTitle}.md`;
        const templateContent = await app.vault.read(templateFile);
        const newFile = await app.vault.create(newFilePath, templateContent);
        
        // Get the current active leaf
        const activeLeaf = app.workspace.activeLeaf;
        
        // Open the new file in a new tab
        await app.workspace.openLinkText(newFile.path, '', true);
        
        // If there was selected text, switch focus back to the original note
        if (wasSelectedText) {
            await app.workspace.setActiveLeaf(activeLeaf);
            // Return wikilink to insert at the cursor position
            return `[[${tempTitle}]] `;
        }
        
        return '';
    } catch (error) {
        console.error("Error creating note:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}
// Main function
async function main() {
    try {
        const selectedText = tp.file.selection();
        return await createNewNote(selectedText ? true : false);
    } catch (error) {
        console.error("Error in main function:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}
// Run the main function and use its return value
tR += await main();
%>