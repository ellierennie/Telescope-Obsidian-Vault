<%*
// METADJUST - RELATED TAGS
// Configuration
const CONFIG = {
    fieldName: "tags",
    includeFolder: "",
    excludeFolder: "_system",
    class: "",
    type: "",
    category: "",
};
const dv = this.app.plugins.plugins["dataview"].api;
// Function to get all unique tags in the vault based on context
function getContextualTags() {
    try {
        let pages = dv.pages();
        // Filter pages based on CONFIG
        if (CONFIG.includeFolder) {
            pages = pages.where(p => p.file.path.startsWith(CONFIG.includeFolder));
        }
        if (CONFIG.excludeFolder) {
            pages = pages.where(p => !p.file.path.startsWith(CONFIG.excludeFolder));
        }
        if (CONFIG.class) {
            pages = pages.where(p => p.class === CONFIG.class);
        }
        if (CONFIG.type) {
            pages = pages.where(p => p.type === CONFIG.type);
        }
        if (CONFIG.category) {
            pages = pages.where(p => p.category === CONFIG.category);
        }
        
        // Extract and process tags
        let tagsArray = pages
            .flatMap(p => p.file.tags || [])
            .distinct()
            .map(tag => tag.replace(/^#/, ''))
            .sort();
            
        // Ensure we return a proper JavaScript array
        return Array.from(tagsArray);
    } catch (e) {
        new Notice(`Error getting tags: ${e.message}`);
        return [];
    }
}

// Function to format new tag input
function formatNewTag(input) {
    if (!input || input.trim() === "") {
        return null;
    }
    // Replace spaces with underscores and remove any special characters
    return input.trim().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

try {
    // Get current file
    const file = tp.file.find_tfile(tp.file.title);
    if (!file) {
        new Notice("Could not find current file.");
        return;
    }
    
    // Extract existing tags from frontmatter
    let currentTags = [];
    try {
        currentTags = dv.page(file.path).tags || [];
        currentTags = currentTags.map(tag => tag.replace(/^#/, ''));
    } catch (e) {
        new Notice(`Error reading current tags: ${e.message}`);
    }
    
    let selectedTags = new Set(currentTags);
    // Ensure contextualTags is a proper array
    let contextualTags = getContextualTags();
    if (!Array.isArray(contextualTags)) {
        contextualTags = Array.from(contextualTags || []);
    }
    
    let isEditingTags = true;
    while (isEditingTags) {
        try {
            // Create the suggester arrays
            const updatedSuggestions = ["➕ Add new tag..."];
            const suggesterValues = ["__new_tag__"];
            
            // Add existing tags to the lists
            contextualTags.forEach(tag => {
                updatedSuggestions.push(selectedTags.has(tag) ? `✓ ${tag}` : tag);
                suggesterValues.push(tag);
            });
            
            // Show the suggester
            const selectedOption = await tp.system.suggester(
                updatedSuggestions, 
                suggesterValues, 
                false, 
                "Select tags (ESC when done)"
            );
            
            if (selectedOption === "__new_tag__") {
                // User wants to add a new tag
                const newTagInput = await tp.system.prompt("Enter new tag (spaces will be replaced with underscores):");
                const formattedTag = formatNewTag(newTagInput);
                
                if (formattedTag) {
                    selectedTags.add(formattedTag);
                    
                    try {
                        // Ensure contextualTags is an array before using array methods
                        if (!Array.isArray(contextualTags)) {
                            contextualTags = Array.from(contextualTags || []);
                        }
                        
                        // Add to contextual tags if not already there
                        if (!contextualTags.includes(formattedTag)) {
                            contextualTags.push(formattedTag);
                            contextualTags.sort();
                        }
                    } catch (tagError) {
                        new Notice(`Error adding tag to list: ${tagError.message}`);
                        // Create a new array if push failed
                        contextualTags = Array.from(selectedTags);
                    }
                }
            } else if (selectedOption) {
                // Toggle existing tag
                selectedTags.has(selectedOption) ? selectedTags.delete(selectedOption) : selectedTags.add(selectedOption);
            } else {
                // User pressed ESC
                isEditingTags = false;
            }
        } catch (e) {
            new Notice(`Error in tag selection: ${e.message}`);
            isEditingTags = false;
        }
    }
    
    // Only proceed if tags have been selected
    if (selectedTags.size > 0) {
        try {
            // Update YAML frontmatter
            await app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter[CONFIG.fieldName] = Array.from(selectedTags).sort();
            });
            
            // Notify user of update
            const updatedCount = selectedTags.size;
            new Notice(`Updated tags`);
        } catch (e) {
            new Notice(`Error updating frontmatter: ${e.message}`);
        }
    } else {
        new Notice("No tags selected. No changes made.");
    }
} catch (e) {
    new Notice(`Error in template: ${e.message}`);
}
-%>