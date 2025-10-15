<%*
const CONFIG = {
    fieldName: "Attending",          // Field to update in the note
    excludeFolder: "-",             // Folder to exclude from search
    class: "People",                // Class type to filter by
    filters: {                      // Custom filters - add or remove as needed
        "team": true                // Example filter: any property and value
        //"status": "active",       // Uncomment to add more filters
        //"department": "IT"        // Add as many as needed
    }
};
const dv = this.app.plugins.plugins["dataview"].api;

// Function to get existing selections from the current note
async function getExistingSelections() {
    const file = tp.file.find_tfile(tp.file.title);
    if (!file) return new Set();
    
    const content = await app.vault.read(file);
    const regex = new RegExp(`^${CONFIG.fieldName}:: (.*)$`, 'm');
    const match = content.match(regex);
    
    if (!match) return new Set();
    
    const selections = match[1].split(',')
        .map(item => item.trim())
        .map(item => item.replace(/\[\[(.*?)\]\]/, '$1'))
        .filter(item => item.length > 0);
    
    return new Set(selections);
}

function isTemplate(page) {
    return page.file.name.startsWith('+') ||
           page.file.path.includes('/templates/') ||
           page.file.path.toLowerCase().includes('template') ||
           page.template === true ||
           page.type === 'template';
}

function applyBaseFilters(items) {
    // Apply folder exclusion
    if (CONFIG.excludeFolder !== "-") {
        items = items.where(p => !p.file.path.startsWith(CONFIG.excludeFolder + "/"));
    } else {
        items = items.where(p => !p.file.path.includes("/-/"));
    }
    
    // Apply class filter and template exclusion
    if (CONFIG.class) {
        items = items.where(p => p.class === CONFIG.class && !isTemplate(p));
    }
    
    return items;
}

function getAllItems() {
    let items = dv.pages();
    return applyBaseFilters(items).sort(n => n.file.name);
}

function getFilteredItems() {
    // Start with base filtered items
    let items = applyBaseFilters(dv.pages());
    
    // Then apply custom filters
    if (CONFIG.filters) {
        Object.entries(CONFIG.filters).forEach(([property, value]) => {
            items = items.where(p => {
                if (p[property] === undefined) return value === false;
                return p[property] === value;
            });
        });
    }
    
    return items.sort(n => n.file.name);
}

let allItems = getAllItems();
let filteredItems = getFilteredItems();
let selectedItems = await getExistingSelections();

// Create combined suggestions list with Search All option
let suggestions = ["🔎 Search All", ...filteredItems.map(item => item.file.name)];

function updateSuggesterList() {
    return suggestions.map(item => {
        if (item === "🔎 Search All") return item;
        return selectedItems.has(item) ? `✓ ${item}` : item;
    });
}

let isEditingItems = true;
while (isEditingItems) {
    const updatedSuggestions = updateSuggesterList();
    const selectedItem = await tp.system.suggester(
        updatedSuggestions,
        suggestions,
        false,
        `Select ${CONFIG.fieldName} + ESC to end`
    );
    
    if (selectedItem === "🔎 Search All") {
        // Use the already filtered allItems list for Search All
        const allItemsList = allItems.map(item => item.file.name);
        const searchAllItem = await tp.system.suggester(
            allItemsList.map(item => selectedItems.has(item) ? `✓ ${item}` : item),
            allItemsList,
            false,
            "Select from all items"
        );
        
        if (searchAllItem) {
            const cleanItem = searchAllItem.replace(/^✓ /, '');
            selectedItems.has(cleanItem) ? selectedItems.delete(cleanItem) : selectedItems.add(cleanItem);
        }
    } else if (selectedItem) {
        const cleanItem = selectedItem.replace(/^✓ /, '');
        selectedItems.has(cleanItem) ? selectedItems.delete(cleanItem) : selectedItems.add(cleanItem);
    } else {
        isEditingItems = false;
    }
}

let selectedContent = '';
if (selectedItems.size > 0) {
    if (selectedItems.size === 1) {
        selectedContent = `[[${Array.from(selectedItems)[0]}]]`;
    } else {
        selectedContent = Array.from(selectedItems)
            .sort()
            .map(item => `[[${item}]]`)
            .join(', ');
    }
}

const file = tp.file.find_tfile(tp.file.title);
if (selectedItems.size > 0) {
    const content = await app.vault.read(file);
    const newFieldLine = `${CONFIG.fieldName}:: ${selectedContent}`;
    const regex = new RegExp(`^${CONFIG.fieldName}::.*$`, 'm');
    const updatedContent = content.match(regex) 
        ? content.replace(regex, newFieldLine)
        : content + '\n' + newFieldLine;
    
    await app.vault.modify(file, updatedContent);
    
    const updatedCount = selectedItems.size;
    new Notice(`Updated ${CONFIG.fieldName} with ${updatedCount} item${updatedCount > 1 ? 's' : ''}`);
} else {
    const content = await app.vault.read(file);
    const regex = new RegExp(`^${CONFIG.fieldName}::.*\n?`, 'm');
    const updatedContent = content.replace(regex, '');
    await app.vault.modify(file, updatedContent);
    new Notice(`Removed ${CONFIG.fieldName} field as no items were selected`);
}

tR += '';
-%>