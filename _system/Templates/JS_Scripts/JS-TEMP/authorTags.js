async function authorTags(tp) {
    const author = tp.frontmatter.author; // Get author from tp parameter
    
    if (!author) return '';
    let authorArray = (Array.isArray(author) ? author : [author])
        .join(',')
        .replace(/,?\s+and\s+/g, ', ')
        .split(/,\s*/)
        .filter(a => a.length > 0);
    
    return authorArray.map(author => author
            .trim()
            .replace(/\s+/g, '_')  // Replace spaces with underscore
            .replace(/\./g, '')    // Remove periods
            .replace(/@/g, '')     // Remove @ symbols
            .replace(/,/g, '')     // Remove commas
        ).join(' ');
    }

module.exports = authorTags;

 
    


 