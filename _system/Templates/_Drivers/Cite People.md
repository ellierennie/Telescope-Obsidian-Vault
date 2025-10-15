<%*
// Configuration
const CLASS_NAME = "People";
const PERSON_EMOJI = "👤";
const FILTER_EMOJI = "🔍";
const MENU_TITLE = `${PERSON_EMOJI} Cite People`;
const EXCLUDE_FOLDER = "_system";

// Helper function to check if file should be excluded
const shouldExcludeFile = (filePath) => {
    return filePath.split('/').some(part => part.startsWith(EXCLUDE_FOLDER));
};

// Helper function to process categories
function processCategories(categoryString) {
    if (!categoryString) return ["Uncategorized"];
    // Split by comma and clean up each category
    return String(categoryString).split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);
}

// Get all people and organize by category
function getPeopleData() {
    let allPeople = [];
    let peopleByCategory = {};
    let allCategories = new Set();
    
    const files = app.vault.getMarkdownFiles();
    
    files.forEach(file => {
        try {
            if (shouldExcludeFile(file.path)) return;
            
            const page = app.plugins.plugins.dataview.api.page(file.path);
            if (page.class && 
                page.class.toString().toLowerCase() === CLASS_NAME.toLowerCase()) {
                
                const person = {
                    name: file.name.replace(/\.md$/, ''),
                    path: file.path
                };
                
                // Add to all people list
                allPeople.push(person);
                
                // Process categories and add to category lists
                const categories = processCategories(page.category);
                categories.forEach(category => {
                    // Add to our set of all categories
                    allCategories.add(category);
                    
                    // Initialize category array if it doesn't exist
                    if (!peopleByCategory[category]) {
                        peopleByCategory[category] = [];
                    }
                    
                    peopleByCategory[category].push(person);
                });
            }
        } catch (e) {
            console.error("Error processing file:", e);
        }
    });
    
    // Convert allCategories set to an array and sort
    const sortedCategories = Array.from(allCategories).sort();
    
    // Sort all lists
    allPeople.sort((a, b) => a.name.localeCompare(b.name));
    
    // Sort by category
    Object.keys(peopleByCategory).forEach(category => {
        peopleByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return { 
        allPeople: allPeople,
        peopleByCategory: peopleByCategory,
        categories: sortedCategories
    };
}

// Create the main menu items (filters at top, then all people)
function createMainMenuItems(allPeople, peopleByCategory, categories) {
    // Start with filter options
    const menuItems = categories.map(category => ({
        name: `${FILTER_EMOJI} ${category} (${peopleByCategory[category]?.length || 0})`,
        isFilter: true,
        category: category
    }));
    
    // Add all people items
    allPeople.forEach(person => {
        menuItems.push({
            name: `${PERSON_EMOJI} ${person.name}`,
            isPerson: true,
            person: person
        });
    });
    
    return menuItems;
}

// Main function
async function main() {
    try {
        const { allPeople, peopleByCategory, categories } = getPeopleData();
        
        if (allPeople.length === 0) {
            new Notice("No people found with class: " + CLASS_NAME);
            return '';
        }
        
        // Show main menu (filters + all people)
        const mainMenuItems = createMainMenuItems(allPeople, peopleByCategory, categories);
        const mainSelection = await tp.system.suggester(
            item => item.name,
            mainMenuItems,
            false,
            MENU_TITLE
        );
        
        if (!mainSelection) return ''; // User pressed ESC to exit
        
        if (mainSelection.isPerson) {
            // User selected a person from main menu
            return `[[${mainSelection.person.name}]] `;
        } else if (mainSelection.isFilter) {
            // User selected a filter - show filtered list
            const category = mainSelection.category;
            const filteredPeople = peopleByCategory[category] || [];
            
            if (filteredPeople.length === 0) {
                new Notice(`No people found in category: ${category}`);
                return await main(); // Go back to main menu
            }
            
            // Show filtered people menu
            const filteredMenuItems = filteredPeople.map(person => ({
                name: `${PERSON_EMOJI} ${person.name}`,
                person: person
            }));
            
            const personSelection = await tp.system.suggester(
                item => item.name,
                filteredMenuItems,
                false,
                `${FILTER_EMOJI} ${category} (${filteredPeople.length})`
            );
            
            if (!personSelection) {
                // User pressed ESC - go back to main menu
                return await main();
            }
            
            // User selected a person from filtered list
            return `[[${personSelection.person.name}]] `;
        }
        
        return ''; // Fallback
        
    } catch (error) {
        console.error("Error:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}

// Run the main function and return the result
tR = await main();
%>