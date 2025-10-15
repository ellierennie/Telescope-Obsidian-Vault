function withClass(dv) {
    const currentClass = dv.current().file.name;
    
    // Configure exclusions
    const EXCLUDED_FOLDERS = "-";
    const EXCLUDED_TYPE = "moc";
    
    // Configure status mapping
    const STATUS_MAP = {
        0: "New",
        1: "Draft",
        2: "Revise and update",
        3: "Seeking feedback",
        4: "Publish ready",
        5: "Published"
    };

    // Helper function to process category
    function processCategory(category) {
        if (!category) return "Uncategorized";
        return Array.isArray(category) ? category[0] : category;
    }

    // Get all pages with matching class, excluding specified folders and types
    let pages = dv.pages()
        .where(p => 
            p.class === currentClass && 
            !p.file.path.startsWith(EXCLUDED_FOLDERS) && 
            p.type !== EXCLUDED_TYPE
        )
        .sort(p => p.file.ctime, 'desc');

    if (pages.length === 0) {
        dv.paragraph("No notes found for this class.");
        return;
    }

    // CSS for table formatting
    dv.container.addClass("class-notes-view");
    const css = `
        .class-notes-view .table-view-table {
            width: 100%;
            margin-bottom: 2em;
        }
        .class-notes-view th {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 2px solid var(--background-modifier-border);
            font-weight: 600;
        }
        .class-notes-view td {
            padding: 4px 8px;
            border-bottom: 1px solid var(--background-modifier-border);
            vertical-align: top;
        }
        .class-notes-view td:nth-child(1) { width: 500px; }  /* Title */
        .class-notes-view td:nth-child(2) { width: 150px; }  /* Status */
        .class-notes-view td:nth-child(3) { width: 200px; }  /* Note */
        .class-notes-view h2 {
            margin: 1.5em 0 1em 0;
            color: var(--text-accent);
        }
        .class-notes-view h2:first-child {
            margin-top: 0;
        }
    `;
    
    // Add CSS to document
    dv.container.createEl("style", { text: css });

    // Group pages by category
    const categoryGroups = {};
    pages.forEach(page => {
        const category = processCategory(page.category);
        if (!categoryGroups[category]) {
            categoryGroups[category] = [];
        }
        
        categoryGroups[category].push([
            dv.fileLink(page.file.path),
            STATUS_MAP[page.status] || "Draft",
            page.note || ""
        ]);
    });

    // Sort categories alphabetically
    const sortedCategories = Object.entries(categoryGroups).sort((a, b) => 
        a[0].localeCompare(b[0], undefined, {sensitivity: 'base'})
    );

    // Display grouped content
    sortedCategories.forEach(([category, categoryPages]) => {
        dv.header(2, `[[${category}]]`);
        
        dv.table(
            ["Title", "Status", "Note"],
            categoryPages
        );
    });
}

withClass(dv);