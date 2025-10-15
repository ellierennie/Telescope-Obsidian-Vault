async function vaultAuthor_password(tp) {
    // Get all markdown files in the vault
    const files = tp.app.vault.getMarkdownFiles();
    
    // Try to find the note with vaultAuthor: true
    for (const file of files) {
        try {
            // Read the file's cache data which contains the frontmatter
            const cache = tp.app.metadataCache.getFileCache(file);
            
            // Check if the file has frontmatter and the vaultAuthor property
            if (cache?.frontmatter && cache.frontmatter.vaultAuthor === true) {
                // Get the stored password from the frontmatter
                const storedPassword = cache.frontmatter.vaultPassWord;
                
                if (!storedPassword) {
                    console.warn('vaultPassWord not found in file with vaultAuthor: true');
                    return false;
                }
                
                // Prompt the user for password
                const userPassword = await tp.system.prompt('Please enter the vault password:');
                
                // If user cancels the prompt
                if (userPassword === null) {
                    return false;
                }
                
                // Compare the passwords
                return userPassword === storedPassword;
            }
        } catch (error) {
            console.error(`Error processing file ${file.path}:`, error);
            return false;
        }
    }
    
    // If no vaultAuthor is found, log warning and return false
    console.warn('No note with vaultAuthor: true was found in the vault');
    return false;
}

module.exports = vaultAuthor_password;