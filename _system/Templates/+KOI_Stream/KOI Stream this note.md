<%*
// Get current file
const date = moment().format('YY.MM.DD');
const file = tp.file.find_tfile(tp.file.title);
if (file) {
    // Get current KOI_Stream value if it exists
    let currentKOIStream = false;
    
    try {
        const dv = this.app.plugins.plugins["dataview"].api;
        const currentPage = dv.page(file.path);
        currentKOIStream = currentPage.KOI_Stream === true;
    } catch {
        // Silently continue if dataview isn't available or KOI_Stream isn't set
    }
    
    // If current KOI_Stream is not true, set it to true
    if (!currentKOIStream) {
        // Update YAML frontmatter to set KOI_Stream to true
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            frontmatter.KOI_Stream = true;
        });
        
        // Get the file content and append the callout at the bottom
        const fileContent = await app.vault.read(file);
        const updatedContent = fileContent + "\n\n> [!INFO] KOI Stream\n> Shared: " + date;
        await app.vault.modify(file, updatedContent);
        
        // Optional: Console log instead of Notice
        console.log("Note added to KOI Stream");
    } else {
        // If it's already shared, ask for confirmation before un-sharing
        const confirmOptions = ["Unshare from KOI", "Continue sharing with KOI Stream"];
        const confirmResult = await tp.system.suggester(
            confirmOptions,
            [true, false],
            false,
            "This note is already shared with KOI Stream. Unshare?"
        );
        
        // If user confirms, change KOI_Stream to false
        if (confirmResult === true) {
            await app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter.KOI_Stream = false;
            });
            
            // Remove the callout from the end of the file
            const fileContent = await app.vault.read(file);
            const calloutPattern = /\n\n> \[!INFO\] [[⛲ KOI Stream]]\n> Shared: \d{2}\.\d{2}\.\d{2}$/;
            const updatedContent = fileContent.replace(calloutPattern, "");
            await app.vault.modify(file, updatedContent);
            
            console.log("Note removed from KOI Stream");
        } else {
            console.log("Note remains shared with KOI Stream");
        }
    }
}
-%>