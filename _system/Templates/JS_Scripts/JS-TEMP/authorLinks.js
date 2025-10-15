async function authorLinks(tp) {
    const author = tp.frontmatter.author;
    
    if (!author) return '';
    let authorArray = (Array.isArray(author) ? author : [author])
        .join(',')
        .replace(/,?\s+and\s+/g, ', ')
        .split(/,\s*/)
        .filter(a => a.length > 0);
    
    return '\n' + authorArray.map(a => {
        const formattedName = a.trim().replace(/_/g, ', ');
        return `- "[[People/${formattedName}|${formattedName}]]"`;
    }).join('\n');
}

module.exports = authorLinks;