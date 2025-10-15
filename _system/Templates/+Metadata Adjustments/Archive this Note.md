<%*
// Get current file
const file = tp.file.find_tfile(tp.file.title);
if (file) {
    // Get current type value if it exists
    let currentType = "";
    
    try {
        const dv = this.app.plugins.plugins["dataview"].api;
        const currentPage = dv.page(file.path);
        currentType = (currentPage.archive || "").toLowerCase();
    } catch {
        // Silently continue if dataview isn't available or type isn't set
    }
    
    // If current type is not 'archive', set it to 'archive'
    if (currentType !== "archive") {
        // Update YAML frontmatter to moc
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            frontmatter.archive = "archive";
        });
        
        // Optional: Console log instead of Notice
        console.log("Note archived");
    } else {
        // If it's already 'archive', ask for confirmation before changing to 'note'
        const confirmOptions = ["Unarchive this Note", "Keep archived"];
        const confirmResult = await tp.system.suggester(
            confirmOptions,
            [true, false],
            false,
            "This is already a archived. Would you like to unarchive this note?"
        );
        
        // If user confirms, change to 'note'
        if (confirmResult === true) {
            await app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter.archive = "unarchived";
            });
            
            console.log("Note unarchived");
        } else {
            console.log("Note remains archived");
        }
    }
}
-%>