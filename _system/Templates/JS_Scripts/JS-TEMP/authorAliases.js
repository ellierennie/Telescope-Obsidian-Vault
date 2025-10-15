async function authorAliases(tp) {
    // Get author name from the title and remove .md extension
    const author = tp.file.title.replace('.md', '');
    
    if (!author) return '';
    
    // Check if the name contains a comma
    if (author.includes(',')) {
        // Case 1: "LastName, FirstName" format
        const [lastName, firstName] = author.split(',').map(part => part.trim());
        if (!firstName || !lastName) return '';
        
        // Create alias in "FirstName LastName" format
        const alias = `${firstName} ${lastName}`;
        return `\n  - "${alias}"`;
    } else {
        // Case 2: "FirstName LastName" format
        const nameParts = author.trim().split(' ');
        if (nameParts.length < 2) return '';
        
        // Get last word as lastName and rest as firstName
        const lastName = nameParts.pop();
        const firstName = nameParts.join(' ');
        
        // Create alias in "LastName, FirstName" format
        const alias = `${lastName}, ${firstName}`;
        return `\n  - "${alias}"`;
    }
}

module.exports = authorAliases;