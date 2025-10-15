<%*
// METADJUST - Add Aliases
const description = "add aliases to the current file"; 

// Configuration
const CONFIG = {
    fieldName: "aliases",
    prompt: "Enter aliases (esc to complete)",
    errorMsg: "No aliases were added",
    successMsg: "Updated aliases! 🎯"
};

// Helper function to update frontmatter
async function updateFrontmatter(file, aliases) {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (aliases.length > 0) {
            frontmatter[CONFIG.fieldName] = aliases;
            new Notice(CONFIG.successMsg);
        } else {
            if (CONFIG.fieldName in frontmatter) {
                delete frontmatter[CONFIG.fieldName];
            }
            new Notice(CONFIG.errorMsg);
        }
    });
}

// Main function to collect aliases
async function collectAliases() {
    const file = tp.file.find_tfile(tp.file.title);
    let aliases = [];
    let continueInput = true;

    while (continueInput) {
        const input = await tp.system.prompt(CONFIG.prompt);
        
        if (input === null) {
            // User pressed ESC
            continueInput = false;
        } else if (input.trim()) {
            // Add non-empty input to aliases
            aliases.push(input.trim());
        }
    }

    await updateFrontmatter(file, aliases);
    return aliases;
}

// Run the script
await collectAliases();
-%>