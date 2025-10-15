function mentions(dv, input) {
    const customFields = input?.fields || [];
    const excludeClasses = input?.excludeClass || [];
    const excludeCategory = input?.excludeCategory || [];
    const activeNote = dv.current().file.name;
    
    // Get current note's source from YAML if it exists
    const currentPage = dv.page(activeNote);
    let sourceNote = null;
    
    if (currentPage.source) {
        // Extract the filename from the source link
        const sourceMatch = String(currentPage.source).match(/\[\[(.*?)\]\]/);
        if (sourceMatch && sourceMatch[1]) {
            sourceNote = sourceMatch[1].trim();
        }
    }
    
    // Query for pages that mention the active note and exclude Templates folder
    let pagesQuery = `[[${activeNote}]] and -"_system/Templates"`;
    
    // Add source note to query if it exists
    if (sourceNote) {
        pagesQuery = `(${pagesQuery}) OR ([[${sourceNote}]] and -"_system/Templates")`;
    }
    
    // Execute the query
    let pages = dv.pages(pagesQuery)
        .sort(p => p.file.ctime, 'desc')
        // Filter out the active note and source note from display
        .filter(page => 
            page.file.name !== activeNote && 
            (sourceNote ? page.file.name !== sourceNote : true)
        );
    
    // Filter out excluded classes and categories
    pages = pages.filter(page => {
        const pageClass = getMetadataValue(page, 'class');
        const pageCategory = getMetadataValue(page, 'category');
        return !excludeClasses.includes(pageClass) &&
               !excludeCategory.includes(pageCategory);
    });
    
    if (pages.length === 0) {
        dv.paragraph("No mentions found for this note.");
        return;
    }
    
    function getMetadataValue(page, field) {
        const value = page[field.toLowerCase()];
        if (value && typeof value === 'object' && value.path) {
            // It's likely a link object
            return `[[${value.path.split('/').pop().replace('.md', '')}]]`;
        }
        return value || '—';
    }
    
    // Group notes by class
    const notesByClass = {};
    pages.forEach(page => {
        // Extract class without [[ ]] if present
        let noteClass = getMetadataValue(page, 'class');
        if (typeof noteClass === 'string') {
            noteClass = noteClass.replace(/\[\[|\]\]/g, '');
        }
        noteClass = noteClass || "Uncategorized";
        
        if (!notesByClass[noteClass]) {
            notesByClass[noteClass] = [];
        }
        
        // Create note object with the primary data we need
        const noteObj = {
            link: `[[${page.file.path}|${page.file.name}]]`,
            note: page
        };
        
        // Add description (first custom field or empty)
        noteObj.description = customFields.length > 0 ? getMetadataValue(page, customFields[0]) : "—";
        
        // Add to class group
        notesByClass[noteClass].push(noteObj);
    });
    
    // Sort classes alphabetically, with "Uncategorized" at the end
    const sortedClasses = Object.keys(notesByClass).sort((a, b) => {
        if (a === "Uncategorized") return 1;
        if (b === "Uncategorized") return -1;
        return a.localeCompare(b);
    });
    
    // Prepare table rows for each class
    const tableRows = [];
    
    sortedClasses.forEach(className => {
        // Sort notes alphabetically by title within each class
        const sortedNotes = notesByClass[className].sort((a, b) => {
            const titleA = a.note.title || a.note.file.name;
            const titleB = b.note.title || b.note.file.name;
            return titleA.localeCompare(titleB);
        });
        
        // Class header row
        const classDisplay = className === "Uncategorized" 
            ? "**Uncategorized**" 
            : `**Class: [[${className}]]**`;
        
        tableRows.push([classDisplay, ""]);
        
        // Add rows for each note in this class
        sortedNotes.forEach(noteObj => {
            tableRows.push([noteObj.link, noteObj.description]);
        });
        
        // Add a spacer row between classes
        tableRows.push(["", ""]);
    });
    
    // Determine column headers
    let columnHeaders = ["Mentions of this Note"];
    
    // If there are custom fields, use the first one as the description column header
    if (customFields.length > 0) {
        columnHeaders.push(customFields[0].charAt(0).toUpperCase() + customFields[0].slice(1));
    } else {
        columnHeaders.push("Description");
    }
    
    // Display the table
    dv.table(columnHeaders, tableRows);
}

mentions(dv, input);