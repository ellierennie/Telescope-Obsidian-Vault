const MAX_LENGTH = 124;  // Made this a constant at the top for easy modification

async function highlight_title(tp, text) {
    if (!text) return '';

    // Clean the text regardless of source
    const cleanText = text
        .trim()
        // Remove any newlines
        .replace(/\n/g, ' ')
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ')
        // Remove any stray quotes that might cause issues
        .replace(/["']/g, '')
        // Trim to max length, trying to break at a word boundary
        .substring(0, MAX_LENGTH);

    // If we cut in the middle of a word, try to find the last complete word
    if (cleanText.length === MAX_LENGTH) {
        const lastSpace = cleanText.lastIndexOf(' ');
        if (lastSpace > 0) {
            return cleanText.substring(0, lastSpace) + '...';
        }
    }

    // Add ellipsis if we truncated
    return text.length > MAX_LENGTH ? cleanText + '...' : cleanText;
}

module.exports = highlight_title;