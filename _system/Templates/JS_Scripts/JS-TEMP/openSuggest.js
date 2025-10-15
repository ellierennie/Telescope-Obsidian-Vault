// openSuggest.js

async function openSuggest(params = {}) {
    const excludedFolders = ["0000", "Inbox"];
    const excludedClasses = [];

    const { folder, class: fileClass } = params;

    function getFiles() {
        const dv = app.plugins.plugins.dataview.api;
        let pages = dv.pages();

        // Filter by folder if specified
        if (folder) {
            pages = pages.where(p => p.file.path.startsWith(folder));
        }

        // Exclude specified folders
        pages = pages.where(p => !excludedFolders.some(ef => p.file.path.startsWith(ef)));

        // Filter by class if specified
        if (fileClass) {
            pages = pages.where(p => p.file.classes && p.file.classes.includes(fileClass));
        }

        // Exclude specified classes
        if (excludedClasses.length > 0) {
            pages = pages.where(p => !p.file.classes || !excludedClasses.some(ec => p.file.classes.includes(ec)));
        }

        // Sort by filename
        return pages.sort(p => p.file.name, 'asc').file.path;
    }

    const files = getFiles();

    if (files.length === 0) {
        new Notice("No matching files found.");
        return;
    }

    const fileNames = files.map(f => f.split('/').pop());
    const selectedFileName = await tp.system.suggester(fileNames, fileNames);

    if (selectedFileName) {
        const selectedFilePath = files[fileNames.indexOf(selectedFileName)];
        const file = app.vault.getAbstractFileByPath(selectedFilePath);
        if (file) {
            await app.workspace.activeLeaf.openFile(file);
        } else {
            new Notice(`File not found: ${selectedFilePath}`);
        }
    } else {
        new Notice("No file selected.");
    }
}

module.exports = openSuggest;