const DESTINATION_FOLDER = "People";
const AUTHOR_TEMPLATE = "_system/Templates/_Primary/+SourceAuthor"; // without .md

async function processAuthorLinks(tp, authorString) {
    if (!authorString) return '';

    // Check if this is a Zotero-style string (contains underscores)
    const isZoteroFormat = authorString.includes('_');
    
    const authorLinks = [];
    
    for (const a of authorString.split(',').map(a => a.trim()).filter(a => a.length > 0)) {
        let fileName, displayName;
        
        if (isZoteroFormat) {
            // Handle Zotero format (lastName_firstName)
            const [lastName, firstName] = a.split('_');
            if (!firstName) continue;
            
            fileName = `${lastName}, ${firstName}`;
            displayName = fileName;
        } else {
            // Handle Readwise format (single name string)
            // Clean the name from any remaining special characters
            fileName = a.replace(/[#@]/g, '').trim();
            displayName = fileName;
        }
        
        // Full path to the new note
        const fullPath = `${DESTINATION_FOLDER}/${fileName}`;
        
        // Check if the file already exists
        const fileExists = await tp.file.exists(`${fullPath}.md`);
        
        if (!fileExists) {
            try {
                // Step 1: Create the file with template content
                const templateFile = tp.file.find_tfile(`${AUTHOR_TEMPLATE}.md`);
                if (!templateFile) {
                    console.error(`Template file not found: ${AUTHOR_TEMPLATE}`);
                    continue;
                }
                
                // Read the raw template content
                const templateContent = await app.vault.read(templateFile);
                
                // Create the new file with the raw template content
                await app.vault.create(`${fullPath}.md`, templateContent);
                
                // Step 2: Get a reference to the newly created file
                const newFile = app.vault.getAbstractFileByPath(`${fullPath}.md`);
                if (!newFile) {
                    console.error(`Failed to get reference to newly created file: ${fullPath}`);
                    continue;
                }
                
                // Step 3: Open the file (this is necessary for the command to work)
                await app.workspace.openLinkText(newFile.path, "", false);
                
                // Step 4: Process the template in the file
                await app.commands.executeCommandById("templater-obsidian:replace-in-file-templater");
                
                // Step 5: Close the file (optional, but good for cleanup)
                app.workspace.detachLeavesOfType("markdown");
                
                console.log(`Created and processed new author note: ${fullPath}`);
            } catch (error) {
                console.error(`Error with file ${fullPath}: ${error}`);
            }
        }
        
        // Add the link to our list
        authorLinks.push(`- "[[${fullPath}|${displayName}]]"`);
    }
    
    // Return the authors as a YAML list with each item on a new line
    return '\n' + authorLinks.join('\n');
}

module.exports = processAuthorLinks;