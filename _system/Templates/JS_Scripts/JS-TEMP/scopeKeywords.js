async function scopeKeywords(tp) {
    try {
        // Configuration
        const CONFIG = {
            excludedFolder: "-",
            maxParagraphLength: 200,
            minKeywordLength: 1
        };

        // Helper Functions
        function highlightKeywords(text, keywords) {
            let highlightedText = text;
            keywords.forEach(keyword => {
                const regex = new RegExp(`(${keyword})`, 'gi');
                highlightedText = highlightedText.replace(regex, '==$1==');
            });
            return highlightedText;
        }

        function extractMainContent(content) {
            const contentStart = content.indexOf('\n\n');
            return contentStart !== -1 ? content.substring(contentStart).trim() : content;
        }

        function isDataviewQuery(text) {
            return text.includes('dv.table(') || text.includes('dv.pages(');
        }

        function truncateParagraph(text, maxLength) {
            return text.length > maxLength 
                ? text.substring(0, maxLength) + "..." 
                : text;
        }

        // Get user input
        const keywordInput = await tp.system.prompt("Enter keywords (space-separated)");
        if (!keywordInput) {
            return "No keywords entered. Search cancelled.";
        }

        // Process keywords
        const keywords = keywordInput
            .split(' ')
            .filter(k => k.trim().length >= CONFIG.minKeywordLength)
            .map(k => k.trim());

        if (keywords.length === 0) {
            return "No valid keywords found after processing input.";
        }

        // Generate Dataview query
        const dataviewQuery = `### Keywords: ${keywords.join(', ')}
\`\`\`dataviewjs
const keywords = ${JSON.stringify(keywords)};
const excludedFolder = "${CONFIG.excludedFolder}";
 
let pages = dv.pages().where(p => !p.file.path.startsWith(excludedFolder));
let rows = [];

${highlightKeywords.toString()}
${extractMainContent.toString()}
${isDataviewQuery.toString()}

for (let [index, p] of Object.entries(pages.values)) {
    var fullContent = await dv.io.load(p.file.path);
    var content = extractMainContent(fullContent);
    
    if (keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))) {
        let paragraphs = content.split('\\n\\n');
        let matchingParagraph = paragraphs.find(para => 
            keywords.some(keyword => para.toLowerCase().includes(keyword.toLowerCase())) &&
            !isDataviewQuery(para)
        );
        
        if (matchingParagraph) {
            let truncatedParagraph = matchingParagraph.length > ${CONFIG.maxParagraphLength}
                ? matchingParagraph.substring(0, ${CONFIG.maxParagraphLength}) + "..." 
                : matchingParagraph;
            
            let highlightedParagraph = highlightKeywords(truncatedParagraph, keywords);
            
            if (highlightedParagraph.trim() !== '') {
                rows.push([p.file.link, highlightedParagraph]);
            }
        }
    }
}

dv.table(["Note", "Matching Paragraph"],
    rows.map(v => v));
\`\`\``;

        return dataviewQuery;

    } catch (error) {
        console.error("Error in scopeKeywords:", error);
        return `Error occurred while processing keywords: ${error.message}`;
    }
}

module.exports = scopeKeywords;