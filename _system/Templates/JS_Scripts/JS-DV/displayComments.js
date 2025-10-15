async function displayComments(dv) {
    // Comment pattern to search for, capturing author and date if present
    const commentPattern = /```COMMENT(?:\s+(?:\[\[(.*?)\]\])?\s*([0-9\.]+)?)?\n([\s\S]*?)```/g;
    
    function escapeTableCell(text) {
        // Escape pipe characters and handle newlines
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, '<br>');
    }

    // Escape text specifically for wikilinks to prevent table breakage
    function escapeLinkText(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\]/g, '\\]');
    }
    
    // Create a properly escaped wiki link
    function createWikiLink(path, displayText) {
        const safePath = escapeLinkText(path);
        const safeDisplay = escapeLinkText(displayText);
        return `[[${safePath}\\|${safeDisplay}]]`;
    }

    // Function to extract comments from a file
    async function extractCommentsFromFile(file) {
        const content = await dv.io.load(file.path);
        const comments = [];
        let match;
        
        // Reset lastIndex to ensure we start from the beginning
        commentPattern.lastIndex = 0;
        
        while ((match = commentPattern.exec(content)) !== null) {
            // Extract author, date, and comment text
            const author = match[1] || "";  // Author (inside [[]])
            const date = match[2] || "";    // Date
            const commentText = match[3].trim();  // The actual comment text
            
            comments.push({
                text: commentText,
                author: author,
                date: date,
                path: file.path,
                filename: file.name
            });
        }
        
        return comments;
    }

    // Get all files that might contain comments
    const excludeFolders = ["Templates", ".obsidian", "_system/Templates"];
    let allFiles = dv.pages()
        .filter(file => !excludeFolders.some(folder => file.file.path.startsWith(folder)));
    
    // Filter by class if specified
    if (input?.class) {
        allFiles = allFiles.where(p => p.class === input.class);
    }

    // Get all comments from all matching files
    let allComments = [];
    await Promise.all(allFiles.map(async (file) => {
        try {
            const comments = await extractCommentsFromFile(file.file);
            comments.forEach(comment => {
                // Add file metadata to each comment
                comment.class = file.class || '';
                comment.category = file.category || '';
            });
            allComments = allComments.concat(comments);
        } catch (error) {
            console.error(`Error processing file ${file.file.path}:`, error);
        }
    }));
    
    // Apply additional filters
    if (input?.author) {
        allComments = allComments.filter(comment => 
            comment.author.toLowerCase().includes(input.author.toLowerCase()));
    }
    
    if (input?.text) {
        allComments = allComments.filter(comment => 
            comment.text.toLowerCase().includes(input.text.toLowerCase()));
    }
    
    // Sort comments - default by date (newest first)
    const sortBy = input?.sort || "date";
    switch(sortBy) {
        case "date":
            allComments.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return b.date.localeCompare(a.date);
            });
            break;
        case "author":
            allComments.sort((a, b) => {
                if (!a.author) return 1;
                if (!b.author) return -1;
                return a.author.localeCompare(b.author);
            });
            break;
        case "file":
            allComments.sort((a, b) => a.filename.localeCompare(b.filename));
            break;
    }

    // Group comments by author if requested
    let output = "";
    
    if (input?.groupBy === "author") {
        // Group comments by author
        const authorGroups = {};
        allComments.forEach(comment => {
            const author = comment.author || "Anonymous";
            if (!authorGroups[author]) {
                authorGroups[author] = [];
            }
            authorGroups[author].push(comment);
        });
        
        // Generate output with separate tables for each author
        output += `### Comments`;
        if (input?.class) output += ` for Class: ${input.class}`;
        output += `\n\n`;
        
        for (const [author, authorComments] of Object.entries(authorGroups)) {
            const authorDisplay = author === "Anonymous" ? "Anonymous" : createWikiLink(author, author);
            output += `#### Signed by: ${authorDisplay}\n\n`;
            output += '| Source Info | Comment Text |\n|:---|:---|\n';
            
            authorComments.forEach(comment => {
                // Format the metadata column
                let metadataCell = "";
                if (comment.date) {
                    metadataCell += `**Date:** ${comment.date}<br>`;
                }
                metadataCell += `**File:** ${createWikiLink(comment.path, comment.filename)}`;
                
                // Format the comment text
                const commentText = escapeTableCell(comment.text);
                
                output += `| ${metadataCell} | ${commentText} |\n`;
            });
            
            output += '\n';
        }
        
        if (Object.keys(authorGroups).length === 0) {
            output += 'No comments found\n';
        }
    }
    else if (input?.groupBy === "file") {
        // Group comments by file
        const fileGroups = {};
        allComments.forEach(comment => {
            if (!fileGroups[comment.filename]) {
                fileGroups[comment.filename] = [];
            }
            fileGroups[comment.filename].push(comment);
        });
        
        // Generate output with separate tables for each file
        output += `### Comments`;
        if (input?.class) output += ` for Class: ${input.class}`;
        if (input?.author) output += ` by ${input.author}`;
        output += `\n\n`;
        
        for (const [filename, fileComments] of Object.entries(fileGroups)) {
            const fileLink = createWikiLink(fileComments[0].path, filename);
            output += `#### From: ${fileLink}\n\n`;
            output += '| Commenter Info | Comment Text |\n|:---|:---|\n';
            
            fileComments.forEach(comment => {
                // Format the metadata column
                let metadataCell = "";
                if (comment.author) {
                    metadataCell += `**Author:** ${createWikiLink(comment.author, comment.author)}<br>`;
                }
                if (comment.date) {
                    metadataCell += `**Date:** ${comment.date}`;
                }
                
                // Format the comment text
                const commentText = escapeTableCell(comment.text);
                
                output += `| ${metadataCell} | ${commentText} |\n`;
            });
            
            output += '\n';
        }
        
        if (Object.keys(fileGroups).length === 0) {
            output += 'No comments found\n';
        }
    }
    else {
        // Default view - single table with all comments
        output += ``;
        if (input?.class) output += ` for Class: ${input.class}`;
        if (input?.author) output += ` by ${input.author}`;
        output += `\n\n`;
        
        output += '| Source & Author | Comment Text |\n';
        output += '|:---|:---|\n';
        
        allComments.forEach(comment => {
            // Format the metadata column with properly escaped links
            let metadataCell = "";
            if (comment.author) {
                metadataCell += `${createWikiLink(comment.author, comment.author)}<br>`;
            }
            if (comment.date) {
                metadataCell += `${comment.date}<br>`;
            }
            metadataCell += `${createWikiLink(comment.path, comment.filename)}`;
            
            // Format the comment text
            const commentText = escapeTableCell(comment.text);
            
            output += `| ${metadataCell} | ${commentText} |\n`;
        });
        
        if (allComments.length === 0) {
            output += '| | No comments found |\n';
        }
    }
    
    return output;
}

// Execute
(async () => {
    const output = await displayComments(dv);
    dv.paragraph(output);
})();