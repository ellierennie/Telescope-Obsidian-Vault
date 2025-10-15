async function vaultAuthor(tp) {
    // Get all markdown files in the vault
    const files = tp.app.vault.getMarkdownFiles();
    
    // Try to find the note with vaultAuthor: true
    for (const file of files) {
        try {
            // Read the file's cache data which contains the frontmatter
            const cache = tp.app.metadataCache.getFileCache(file);
            
            // Check if the file has frontmatter and the vaultAuthor property
            if (cache?.frontmatter && cache.frontmatter.vaultAuthor === true) {
                // Return the filename without extension, wrapped in wiki links
                const title = file.basename;
                return `[[${title}]]`;
            }
        } catch (error) {
            console.error(`Error processing file ${file.path}:`, error);
        }
    }
    
    // If no vaultAuthor is found, return a default value or error message
    console.warn('No note with vaultAuthor: true was found in the vault');
    return '[[Unknown Author]]';
}

module.exports = vaultAuthor;