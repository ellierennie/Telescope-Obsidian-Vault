function byStatus(dv) {
    const CONFIG = {
        folder: "authorNotes/_Notes",
        field: "status",
        priorityLevels: [
            { number: 0, label: "New" },
            { number: 1, label: "Draft" },
            { number: 2, label: "Revise and update" },
            { number: 3, label: "Seeking feedback" },
            { number: 4, label: "Publish ready" },
            { number: 5, label: "Published" }
        ],
        columnWidths: {
            title: "500px",
            status: "150px",
            note: "200px"
        }
    };

    // Create status map
    const statusMap = Object.fromEntries(CONFIG.priorityLevels.map(level => [level.number, level.label]));

    // Helper function to process category
    function processCategory(category) {
        if (!category) return "Uncategorized";
        return Array.isArray(category) ? category[0] : category;
    }

    // CSS for table formatting
    dv.container.addClass("project-status-view");
    const css = `
        .project-status-view .table-view-table {
            width: 100%;
            margin-bottom: 2em;
        }
        .project-status-view th {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 2px solid var(--background-modifier-border);
            font-weight: 600;
        }
        .project-status-view td {
            padding: 4px 8px;
            border-bottom: 1px solid var(--background-modifier-border);
            vertical-align: top;
        }
        .project-status-view td:first-child {
            width: ${CONFIG.columnWidths.title};
            word-wrap: break-word;
            white-space: normal;
        }
        .project-status-view td:nth-child(2) {
            width: ${CONFIG.columnWidths.status};
        }
        .project-status-view td:nth-child(3) {
            width: ${CONFIG.columnWidths.note};
        }
        .project-status-view h2 {
            margin: 1.5em 0 1em 0;
            color: var(--text-accent);
        }
        .project-status-view h2:first-child {
            margin-top: 0;
        }
    `;
    
    // Add CSS to document
    dv.container.createEl("style", { text: css });

    // Get all pages and process them
    let pages = dv.pages(`"${CONFIG.folder}"`)
        .where(p => true)  // Remove type filter to include all files
        .map(p => ({
            project: processCategory(p.category),
            title: dv.fileLink(p.file.path),
            status: p[CONFIG.field] !== undefined ? (statusMap[p[CONFIG.field]] || `${p[CONFIG.field]}`) : "Draft",
            note: p.note || ""
        }));

    // Group pages by project
    const projectGroups = {};
    pages.forEach(page => {
        if (!projectGroups[page.project]) {
            projectGroups[page.project] = [];
        }
        projectGroups[page.project].push(page);
    });

    // Sort projects alphabetically
    const sortedProjects = Object.entries(projectGroups).sort((a, b) => 
        a[0].localeCompare(b[0], undefined, {sensitivity: 'base'})
    );

    // Display all projects, including those with single files
    sortedProjects.forEach(([project, projectPages]) => {
        dv.header(2, `[[${project}]]`);
        
        dv.table(
            ["Title", "Status", "Note"],
            projectPages.map(p => [p.title, p.status, p.note])
        );
    });
}

// Call the function
byStatus(dv);