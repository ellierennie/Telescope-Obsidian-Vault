/**
 * Provides a category selector for custom notes with configurable filtering.
 * Also moves the note to a subfolder named after the selected category within the same parent directory.
 * 
 * @param {Object} tp - The Templater plugin object
 * @returns {Promise<string>} - The selected or created category
 */
async function custom_session(tp, {
    EXCLUDE_FOLDER = "_system",
    CLASS = "Sessions",
    TYPE = "note",
    CATEGORY_PROMPT = "Select a session category",
    NEW_CATEGORY_PROMPT = "Enter new session name"
} = {}) {
    // Validate Templater plugin object
    if (!tp || !tp.system) {
        console.error('Templater plugin object is invalid');
        return '';
    }

    try {
        // Get all files in the vault
        const files = app.vault.getMarkdownFiles();
        
        // Create a set to store unique categories
        const categories = new Set();
        
        // Loop through files and extract categories from custom input notes
        for (const file of files) {
            try {
                // Skip files in the excluded folder or its subfolders
                // Use path.normalize to handle different path separators
                const normalizedPath = file.path.replace(/\\/g, '/');
                const excludePath = `/${EXCLUDE_FOLDER}/`;
                
                if (normalizedPath.includes(excludePath)) {
                    continue;
                }

                // Get the file cache metadata
                const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
                
                // Check if this is a matching note type
                if (metadata && 
                    metadata.class === CLASS && 
                    metadata.type === TYPE && 
                    metadata.category) {
                    
                    // Sanitize and add category
                    const sanitizedCategory = metadata.category.trim();
                    if (sanitizedCategory) {
                        categories.add(sanitizedCategory);
                    }
                }
            } catch (fileProcessError) {
                console.warn(`Error processing file ${file.path}:`, fileProcessError);
            }
        }
        
        // Convert set to array and sort alphabetically
        const categoryOptions = Array.from(categories).sort((a, b) => a.localeCompare(b));
        
        // Add custom options
        const customOptions = [
            ...categoryOptions, 
            "other (enter new category)"
        ];
        
        // Present the options to the user
        const selectedOption = await tp.system.suggester(
            (option) => option, 
            customOptions, 
            false, 
            CATEGORY_PROMPT
        );
        
        let categoryName = '';
        
        // If user selects "other", prompt for a new category
        if (selectedOption === "other (enter new category)") {
            const newCategory = await tp.system.prompt(NEW_CATEGORY_PROMPT);
            
            // Validate and sanitize new category
            if (newCategory) {
                categoryName = newCategory.trim();
            }
        } else {
            // Use the selected category
            categoryName = selectedOption || '';
        }
        
        // If we have a valid category, ensure the folder exists and move the file
        if (categoryName) {
            // Schedule the folder creation and file movement for after template processing
            setTimeout(async () => {
                try {
                    // Get the current file
                    const file = tp.file.find_tfile(tp.file.path(true));
                    if (file) {
                        // Extract the parent folder path
                        const filePath = file.path;
                        const fileName = file.name;
                        const lastSlashIndex = filePath.lastIndexOf('/');
                        
                        // Determine parent folder path (empty string if file is in root)
                        const parentPath = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : '';
                        
                        // Create the category folder path (within the parent folder)
                        const categoryFolderPath = parentPath 
                            ? `${parentPath}/${categoryName}`
                            : categoryName;
                            
                        // Create the target file path
                        const newPath = `${categoryFolderPath}/${fileName}`;
                        
                        // Check if the category folder exists and create it if it doesn't
                        if (!(await app.vault.adapter.exists(categoryFolderPath))) {
                            await app.vault.createFolder(categoryFolderPath);
                            console.log(`Created folder: ${categoryFolderPath}`);
                        }
                        
                        // Move the file to the category subfolder
                        await app.fileManager.renameFile(file, newPath);
                        console.log(`Moved file to: ${newPath}`);
                    } else {
                        console.warn('Could not find current file to move');
                    }
                } catch (error) {
                    console.error(`Error handling folder/file operations:`, error);
                    await tp.system.notice(`Failed to place note in category folder. Check console for details.`);
                }
            }, 200); // Slight delay to ensure template is applied first
        }
        
        // Return the selected category (original function behavior)
        return categoryName;
    } catch (error) {
        console.error('Error in custom category selection:', error);
        await tp.system.notice('Failed to select category. Please try again.');
        return '';
    }
}

module.exports = custom_session;