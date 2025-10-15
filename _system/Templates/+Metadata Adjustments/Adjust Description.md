<%*
// METADJUST - ADJUST DESCRIPTION
const description = "adjust note description"; 

// CONFIGURATION
const CONFIG = {
    fieldName: "note",
    prompt: "Enter short description of file"
};

const file = tp.file.find_tfile(tp.file.title);

// Prompt the user for input
const userInput = await tp.system.prompt(CONFIG.prompt);

if (userInput) {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter[CONFIG.fieldName] = userInput;
    });
    new Notice(`Updated ${CONFIG.fieldName}! 🥳`);
} else {
    // If no input is provided, remove the field if it exists
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (CONFIG.fieldName in frontmatter) {
            delete frontmatter[CONFIG.fieldName];
            new Notice(`Removed ${CONFIG.fieldName} field as no description was entered`);
        } else {
            new Notice(`No description entered. ${CONFIG.fieldName} field was not created.`);
        }
    });
}
-%>