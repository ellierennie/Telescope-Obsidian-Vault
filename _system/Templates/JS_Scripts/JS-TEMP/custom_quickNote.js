/**
 * Provides a category selector for custom notes with configurable filtering.
 * Only selects the category without moving the file.
 * 
 * @param {Object} tp - The Templater plugin object
 * @returns {Promise<string>} - The selected or created category
 */
async function custom_quickNote(tp, {
    EXCLUDE_FOLDER = "_system",
    CLASS = "Quick",
    TYPE = "Note",
    CATEGORY_PROMPT = "Select a category",
    NEW_CATEGORY_PROMPT = "Enter new quick name"
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
        
        // Return the selected category
        return categoryName;
    } catch (error) {
        console.error('Error in custom category selection:', error);
        await tp.system.notice('Failed to select category. Please try again.');
        return '';
    }
}

module.exports = custom_quickNote;