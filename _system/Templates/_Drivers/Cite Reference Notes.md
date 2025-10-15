<%*
// Cite Reference Notes
const CLASS_NAME = "Reference_Notes";
const CLASS_EMOJI = "📚";
const AUTHOR_EMOJI = "👤";
const CATEGORY_EMOJI = "📂";
const KOI_EMOJI = "🔭";
const SEARCH_EMOJI = "🔍";
const INPUT_EMOJI = "📥";
const MENU_TITLE = `${CLASS_EMOJI} Sources`;

// Stop conditions
const EXCLUDE_PATH = "_system/Templates";

// Initial validation
function validateLocation() {
    const currentFile = tp.file.folder(true);
    if (currentFile.startsWith(EXCLUDE_PATH)) {
        new Notice("Can't run template here");
        return false;
    }
    return true;
}

// Function to extract author name from link format
function extractAuthorName(authorLink) {
    if (!authorLink) return '';
    
    // Check if it's a wiki link format with pipe
    const wikiLinkMatch = authorLink.match(/\[\[(?:.*?\|)([^\]]+?)(?:\.md)?\]\]/);
    if (wikiLinkMatch) {
        return wikiLinkMatch[1];
    }
    
    // Check if it's a simple wiki link format
    const simpleLinkMatch = authorLink.match(/\[\[([^\]]+?)(?:\.md)?\]\]/);
    if (simpleLinkMatch) {
        return simpleLinkMatch[1];
    }
    
    // Remove quotes if present
    return authorLink.replace(/"/g, '').trim();
}

// Function to extract all authors from a source
function extractAuthors(authorField) {
    if (!authorField) return [];
    
    // Handle array of authors
    if (Array.isArray(authorField)) {
        return authorField
            .map(author => extractAuthorName(author.toString()))
            .filter(author => author); // Remove empty entries
    }
    
    // Handle single string that might contain multiple authors
    const authorStr = authorField.toString();
    
    // Check if it contains multiple wiki links
    if (authorStr.includes('[[') && authorStr.split('[[').length > 2) {
        const matches = [...authorStr.matchAll(/\[\[(?:.*?\|)?([^\]]+?)(?:\.md)?\]\]/g)];
        if (matches.length > 0) {
            return matches.map(match => match[1]).filter(author => author);
        }
    }
    
    // Handle comma-separated string of authors
    if (authorStr.includes(',')) {
        return authorStr
            .split(',')
            .map(author => extractAuthorName(author.trim()))
            .filter(author => author);
    }
    
    // Single author
    const singleAuthor = extractAuthorName(authorStr);
    return singleAuthor ? [singleAuthor] : [];
}

// Function to process categories
function processCategories(categoryField) {
    if (!categoryField) return [];
    
    // Handle array of categories
    if (Array.isArray(categoryField)) {
        return categoryField
            .map(cat => cat.toString().trim())
            .filter(cat => cat);
    }
    
    // Handle comma-separated string
    const categoryStr = categoryField.toString();
    if (categoryStr.includes(',')) {
        return categoryStr
            .split(',')
            .map(cat => cat.trim())
            .filter(cat => cat);
    }
    
    // Single category
    return [categoryStr.trim()];
}

// Function to format authors for display
function formatAuthorsForDisplay(authors) {
    if (!authors || authors.length === 0) return 'Unknown Author';
    return authors.join(', ');
}

// Check if file should be excluded
function shouldExcludeFile(filePath) {
    return filePath.includes(EXCLUDE_PATH);
}

// Format source for simplified display in main menu
const formatSourceSimplified = (source) => {
    const lines = [
        `${source.isFlagged ? '🏷️' : '🏷️'}`,
        `${source.title || source.name}`,
        `${formatAuthorsForDisplay(source.authors)}`
    ];
    
    return lines.join('\n');
};

// Format KOI source for display
const formatKOISourceForDisplay = (source) => {
    // Use the dedicated author_name and channel_name fields
    const authorName = source.author_name || formatAuthorsForDisplay(source.authors) || "Unknown Author";
    const channelName = source.channel_name || source.channel || "Unknown Channel";
    const title = source.title || source.name;
    
    // New format as requested
    return `${title}\nauthor ${authorName}\nchannel ${channelName}`;
};

// Format Input source for display
const formatInputSourceForDisplay = (source) => {
    // Extract title and author from metadata if available
    const title = source.title || source.name;
    const authors = source.authors || [];
    
    const lines = [
        `${INPUT_EMOJI} ${title}`,
        `${formatAuthorsForDisplay(authors)}`,
        `${source.categories.length > 0 ? `${source.categories.join(', ')}` : 'No Category'}`
    ];
    
    return lines.join('\n');
};

// Format source for detailed display in filtered views
const formatSourceForDisplay = (source) => {
    const lines = [
        `${source.isFlagged ? '🏷️ ' : ''}${source.name}`
    ];
    
    if (source.title) {
        lines.push(`Title: ${source.title}`);
    }
    
    lines.push(`Author: ${formatAuthorsForDisplay(source.authors)}`);
    
    if (source.categories && source.categories.length > 0) {
        lines.push(`Category: ${source.categories.join(', ')}`);
    }
    
    return lines.join('\n');
};

// Format KOI citation with the specified format
const formatKOICitation = (source) => {
    // Use the dedicated author_name and channel_name fields from the YAML front matter
    const authorName = source.author_name || formatAuthorsForDisplay(source.authors) || "Unknown Author";
    const channelName = source.channel_name || source.channel || "Unknown Channel";
    return `[[${source.name}|${authorName} in ${channelName}]]`;
};

// Get all sources and build maps
const getSourceData = () => {
    let sources = [];
    let authorMap = new Map(); // Maps author names to lists of sources
    let categoryMap = new Map(); // Maps categories to lists of sources
    let koiSources = []; // List of KOI sources
    let inputSources = []; // List of Input sources
    let inputCategoryMap = new Map(); // Maps categories to lists of input sources
    
    const files = app.vault.getMarkdownFiles();
    
    files.forEach(file => {
        try {
            if (shouldExcludeFile(file.path)) return;
            
            const page = app.plugins.plugins.dataview.api.page(file.path);
            
            // Process Reference_Notes
            if (page.class && 
                page.class.toString().toLowerCase() === CLASS_NAME.toLowerCase()) {
                
                // Extract authors (excluding items from excluded path)
                const authorList = page.author ? extractAuthors(page.author) : [];
                
                // Extract categories
                const categoryList = page.category ? processCategories(page.category) : [];
                
                // Extract creation date (using ctime if created field is not available)
                const createdDate = page.created 
                    ? new Date(page.created.toString()) 
                    : (file.stat ? new Date(file.stat.ctime) : new Date(0));
                
                // Extract channel name for KOI items
                const channelName = page.channel ? page.channel.toString() : '';
                
                // Create source object
                const source = {
                    name: file.name.replace(/\.md$/, ''),
                    path: file.path,
                    file: file,
                    isFlagged: page.flag === true,
                    title: page.title ? page.title.toString() : '',
                    authors: authorList,
                    categories: categoryList,
                    created: createdDate,
                    channel: channelName,
                    isKOI: categoryList.some(cat => cat.toLowerCase() === 'koi'),
                    // Add direct access to author_name and channel_name fields for KOI items
                    author_name: page.author_name ? page.author_name.toString() : '',
                    channel_name: page.channel_name ? page.channel_name.toString() : ''
                };
                
                // Add to sources list
                sources.push(source);
                
                // Add to KOI sources if applicable
                if (source.isKOI) {
                    koiSources.push(source);
                }
                
                // Add to author map
                authorList.forEach(author => {
                    if (!authorMap.has(author)) {
                        authorMap.set(author, []);
                    }
                    authorMap.get(author).push(source);
                });
                
                // Add to category map
                categoryList.forEach(category => {
                    if (!categoryMap.has(category)) {
                        categoryMap.set(category, []);
                    }
                    categoryMap.get(category).push(source);
                });
            }
            
            // Process Input sources with class: Sources and type: Input
            if (page.class && 
                page.class.toString().toLowerCase() === "sources" &&
                page.type && 
                page.type.toString().toLowerCase() === "input") {
                
                // Extract categories
                const categoryList = page.category ? processCategories(page.category) : [];
                
                // Extract creation date (using ctime if created field is not available)
                const createdDate = page.created 
                    ? new Date(page.created.toString()) 
                    : (file.stat ? new Date(file.stat.ctime) : new Date(0));
                
                // Extract author information
                const authorList = page.author ? extractAuthors(page.author) : [];
                
                // Create input source object
                const inputSource = {
                    name: file.name.replace(/\.md$/, ''),
                    path: file.path,
                    file: file,
                    title: page.title ? page.title.toString() : '',
                    authors: authorList,
                    categories: categoryList,
                    created: createdDate
                };
                
                // Add to input sources list
                inputSources.push(inputSource);
                
                // Add to input category map
                categoryList.forEach(category => {
                    if (!inputCategoryMap.has(category)) {
                        inputCategoryMap.set(category, []);
                    }
                    inputCategoryMap.get(category).push(inputSource);
                });
            }
        } catch (e) {
            // Skip if file doesn't have required metadata
        }
    });
    
    // Sort sources by creation date (newest first)
    sources.sort((a, b) => b.created - a.created);
    
    // Sort KOI sources by creation date (newest first)
    koiSources.sort((a, b) => b.created - a.created);
    
    // Sort input sources by creation date (newest first)
    inputSources.sort((a, b) => b.created - a.created);
    
    // Sort each author's sources by creation date
    authorMap.forEach((sourceList, author) => {
        sourceList.sort((a, b) => b.created - a.created);
    });
    
    // Sort each category's sources by creation date
    categoryMap.forEach((sourceList, category) => {
        sourceList.sort((a, b) => b.created - a.created);
    });
    
    // Sort each input category's sources by creation date
    inputCategoryMap.forEach((sourceList, category) => {
        sourceList.sort((a, b) => b.created - a.created);
    });
    
    return { 
        sources, 
        authorMap, 
        categoryMap, 
        koiSources, 
        inputSources, 
        inputCategoryMap 
    };
};

// Function to display the author selection menu
async function showAuthorMenu(authorMap) {
    // Create sorted list of authors with source counts
    const authors = Array.from(authorMap.entries())
        .sort((a, b) => {
            // Sort by number of sources (descending) then by name (ascending)
            if (b[1].length !== a[1].length) {
                return b[1].length - a[1].length;
            }
            return a[0].localeCompare(b[0]);
        })
        .map(([author, authorSources]) => ({ 
            name: `${AUTHOR_EMOJI} ${author} (${authorSources.length})`,
            author: author,
            count: authorSources.length
        }));
    
    // Show author selection
    const authorSelection = await tp.system.suggester(
        item => item.name,
        authors,
        false,
        `${SEARCH_EMOJI} Select Author`
    );
    
    // ESC pressed in author selection - return null to go back
    if (!authorSelection) {
        return null;
    }
    
    // Get sources for selected author
    const authorSources = authorMap.get(authorSelection.author) || [];
    
    // Show sources by selected author
    const sourceSelection = await tp.system.suggester(
        source => formatSourceSimplified(source),
        authorSources,
        false,
        `${AUTHOR_EMOJI} Sources by ${authorSelection.author} (${authorSources.length})`
    );
    
    // ESC pressed in filtered view - return back signal
    if (!sourceSelection) {
        return { goBack: true };
    }
    
    // Return the selected source
    return { source: sourceSelection };
}

// Function to display the category selection menu
async function showCategoryMenu(categoryMap) {
    // Create sorted list of categories with source counts
    const categories = Array.from(categoryMap.entries())
        .sort((a, b) => {
            // Sort by number of sources (descending) then by name (ascending)
            if (b[1].length !== a[1].length) {
                return b[1].length - a[1].length;
            }
            return a[0].localeCompare(b[0]);
        })
        .map(([category, categorySources]) => ({ 
            name: `${CATEGORY_EMOJI} ${category} (${categorySources.length})`,
            category: category,
            count: categorySources.length
        }));
    
    // Show category selection
    const categorySelection = await tp.system.suggester(
        item => item.name,
        categories,
        false,
        `${SEARCH_EMOJI} Select Category`
    );
    
    // ESC pressed in category selection - return null to go back
    if (!categorySelection) {
        return null;
    }
    
    // Get sources for selected category
    const categorySources = categoryMap.get(categorySelection.category) || [];
    
    // Show sources by selected category
    const sourceSelection = await tp.system.suggester(
        source => formatSourceSimplified(source),
        categorySources,
        false,
        `${CATEGORY_EMOJI} Sources in ${categorySelection.category} (${categorySources.length})`
    );
    
    // ESC pressed in filtered view - return back signal
    if (!sourceSelection) {
        return { goBack: true };
    }
    
    // Return the selected source
    return { source: sourceSelection };
}

// Function to display the KOI selection menu
async function showKOIMenu(koiSources) {
    if (koiSources.length === 0) {
        new Notice("No KOI sources found");
        return { goBack: true };
    }
    
    // For KOI sources, we'll keep the specialized KOI format
    const sourceSelection = await tp.system.suggester(
        source => formatKOISourceForDisplay(source),
        koiSources,
        false,
        `${KOI_EMOJI} KOI Sources (${koiSources.length})`
    );
    
    // ESC pressed in KOI view - return back signal
    if (!sourceSelection) {
        return { goBack: true };
    }
    
    // Return the selected source with the new format for KOI items
    return { 
        source: sourceSelection,
        isKOI: true 
    };
}

// Function to display the Input category selection menu
async function showInputCategoryMenu(inputCategoryMap) {
    // Create sorted list of categories with source counts
    const categories = Array.from(inputCategoryMap.entries())
        .sort((a, b) => {
            // Sort by number of sources (descending) then by name (ascending)
            if (b[1].length !== a[1].length) {
                return b[1].length - a[1].length;
            }
            return a[0].localeCompare(b[0]);
        })
        .map(([category, categorySources]) => ({ 
            name: `${CATEGORY_EMOJI} ${category} (${categorySources.length})`,
            category: category,
            count: categorySources.length
        }));
    
    // Add "All Categories" option at the top
    categories.unshift({
        name: `${CATEGORY_EMOJI} All Categories`,
        category: "all",
        count: -1
    });
    
    // Show category selection
    const categorySelection = await tp.system.suggester(
        item => item.name,
        categories,
        false,
        `${SEARCH_EMOJI} Filter Input Sources by Category`
    );
    
    // ESC pressed in category selection - return null to go back
    if (!categorySelection) {
        return null;
    }
    
    return categorySelection;
}

// Function to display the Input selection menu
async function showInputMenu(inputSources, inputCategoryMap) {
    if (inputSources.length === 0) {
        new Notice("No Input sources found");
        return { goBack: true };
    }
    
    // First show the category filter menu
    const categorySelection = await showInputCategoryMenu(inputCategoryMap);
    
    // ESC pressed in category selection - return back signal
    if (!categorySelection) {
        return { goBack: true };
    }
    
    // Filter sources by selected category or show all
    let filteredSources = inputSources;
    let categoryTitle = "All Inputs";
    
    if (categorySelection.category !== "all") {
        filteredSources = inputCategoryMap.get(categorySelection.category) || [];
        categoryTitle = categorySelection.category;
    }
    
    if (filteredSources.length === 0) {
        new Notice(`No Input sources found in category: ${categorySelection.category}`);
        return { goBack: true };
    }
    
    // Show filtered input sources
    const sourceSelection = await tp.system.suggester(
        source => formatInputSourceForDisplay(source),
        filteredSources,
        false,
        `${INPUT_EMOJI} ${categoryTitle} (${filteredSources.length})`
    );
    
    // ESC pressed in input view - return back signal
    if (!sourceSelection) {
        return { goBack: true };
    }
    
    // Return the selected source 
    return { 
        source: sourceSelection,
        isInput: true 
    };
}

// Main function
async function main() {
    if (!validateLocation()) {
        return '';
    }
    
    try {
        // Get all data
        const { 
            sources, 
            authorMap, 
            categoryMap, 
            koiSources, 
            inputSources, 
            inputCategoryMap 
        } = getSourceData();
        
        // Filter out KOI sources from the main display
        const nonKOISources = sources.filter(source => !source.isKOI);
        
        // Main navigation loop
        while (true) {
            // Build menu with search options at the top
            const menuOptions = [
                // Search by author option
                {
                    name: `${AUTHOR_EMOJI} Search by Author`,
                    action: "authorSearch"
                },
                
                // Search by category option
                {
                    name: `${CATEGORY_EMOJI} Search by Category`,
                    action: "categorySearch"
                },
                
                // Search by KOI option
                {
                    name: `${KOI_EMOJI} Search by KOI`,
                    action: "koiSearch"
                },
                
                // Search all Inputs option
                {
                    name: `${INPUT_EMOJI} Search all Inputs`,
                    action: "inputSearch"
                },
                
                // All non-KOI sources with simplified display
                ...nonKOISources.map(source => ({
                    name: formatSourceSimplified(source),
                    action: "select",
                    source: source
                }))
            ];
            
            const selection = await tp.system.suggester(
                item => item.name,
                menuOptions,
                false,
                MENU_TITLE
            );
            
            // ESC pressed in main menu - exit script
            if (!selection) {
                return '';
            }
            
            if (selection.action === "authorSearch") {
                // Show author menu loop
                while (true) {
                    const result = await showAuthorMenu(authorMap);
                    
                    // Null result means ESC was pressed on first author menu - go back to main
                    if (result === null) {
                        break;
                    }
                    
                    // goBack means ESC was pressed on filtered view - show author menu again
                    if (result.goBack) {
                        continue;
                    }
                    
                    // We have a source selection - return it
                    if (result.source) {
                        if (result.source.isKOI) {
                            // UPDATED: Use the new formatKOICitation function
                            return formatKOICitation(result.source) + " ";
                        } else {
                            return `[[${result.source.name}]] `;
                        }
                    }
                }
            } else if (selection.action === "categorySearch") {
                // Show category menu loop
                while (true) {
                    const result = await showCategoryMenu(categoryMap);
                    
                    // Null result means ESC was pressed on first category menu - go back to main
                    if (result === null) {
                        break;
                    }
                    
                    // goBack means ESC was pressed on filtered view - show category menu again
                    if (result.goBack) {
                        continue;
                    }
                    
                    // We have a source selection - return it
                    if (result.source) {
                        if (result.source.isKOI) {
                            // UPDATED: Use the new formatKOICitation function
                            return formatKOICitation(result.source) + " ";
                        } else {
                            return `[[${result.source.name}]] `;
                        }
                    }
                }
            } else if (selection.action === "koiSearch") {
                // Show KOI menu loop
                while (true) {
                    const result = await showKOIMenu(koiSources);
                    
                    // goBack means ESC was pressed on KOI view - go back to main
                    if (result.goBack) {
                        break;
                    }
                    
                    // We have a source selection - return it with special KOI formatting
                    if (result.source) {
                        // UPDATED: Use the new formatKOICitation function
                        return formatKOICitation(result.source) + " ";
                    }
                }
            } else if (selection.action === "inputSearch") {
                // Show Input menu loop
                while (true) {
                    const result = await showInputMenu(inputSources, inputCategoryMap);
                    
                    // goBack means ESC was pressed on Input view - go back to main
                    if (result.goBack) {
                        break;
                    }
                    
                    // We have a source selection - return it
                    if (result.source) {
                        return `[[${result.source.name}]] `;
                    }
                }
            } else if (selection.action === "select") {
                // Handle direct selection from main menu
                if (selection.source.isKOI) {
                    // UPDATED: Use the new formatKOICitation function
                    return formatKOICitation(selection.source) + " ";
                } else {
                    return `[[${selection.source.name}]] `;
                }
            }
        }
        
    } catch (error) {
        console.error("Error in main function:", error);
        new Notice(`Error: ${error.message}`);
        return '';
    }
}

// Run the main function and set the result
tR += await main();
%>