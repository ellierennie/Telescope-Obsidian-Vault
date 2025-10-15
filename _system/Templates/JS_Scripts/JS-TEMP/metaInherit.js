// metaInherit.js - Final version with no extra line breaks

async function metaInherit(tp) {
    try {
        const activeFile = app.workspace.getActiveFile();
        if (!activeFile) {
            console.log("No active file found");
            return {};
        }

        // Get the file content
        const fileContent = await app.vault.read(activeFile);
        
        // Extract YAML frontmatter
        const yamlMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
        if (!yamlMatch) {
            console.log("No frontmatter found");
            return {};
        }
        
        const frontmatter = yamlMatch[1];
        
        // Extract each field as a raw string
        const fieldsContent = {};
        
        // Use regex to find the start of each field
        const fieldStarts = [];
        const fieldRegex = /^([a-zA-Z0-9_-]+):/gm;
        let match;
        
        while ((match = fieldRegex.exec(frontmatter)) !== null) {
            fieldStarts.push({
                field: match[1],
                position: match.index,
                nameLength: match[0].length
            });
        }
        
        // Sort by position
        fieldStarts.sort((a, b) => a.position - b.position);
        
        // For each field, extract everything from its start to the next field
        for (let i = 0; i < fieldStarts.length; i++) {
            const field = fieldStarts[i].field;
            const startPos = fieldStarts[i].position + fieldStarts[i].nameLength; // Skip the field name
            const endPos = (i < fieldStarts.length - 1) 
                ? fieldStarts[i+1].position 
                : frontmatter.length;
            
            // Get raw content and remove any trailing newline
            let rawContent = frontmatter.substring(startPos, endPos);
            if (rawContent.endsWith('\n')) {
                rawContent = rawContent.slice(0, -1);
            }
            
            fieldsContent[field] = rawContent;
        }
        
        // Create a getValue function that returns the raw value for YAML without trailing newline
        window.getValue = function(key) {
            // Special cases
            if (key === 'YAMLparent') {
                return ` "[[${activeFile.path}|${activeFile.basename}]]"`;
            }
            if (key === 'NOTEparent') {
                return ` [[${activeFile.path}|${activeFile.basename}]]`;
            }
            
            // Return the raw field content if available, without any trailing newline
            if (fieldsContent[key]) {
                return fieldsContent[key];
            }
            
            return '';
        };
        
        // Create a getValueBody function that returns the value without quotes
        window.getValueBody = function(key) {
            const rawValue = window.getValue(key);
            if (!rawValue) return '';
            
            return rawValue
                // Handle title with quotes
                .replace(/^[ \t]*"(.+?)"[ \t]*$/, '$1') // Handle simple quoted strings
                // Handle list items with quotes
                .replace(/^\s*-\s*"(.+?)"[ \t]*$/gm, '$1')
                // Handle list items without quotes
                .replace(/^\s*-\s*/gm, '')
                // Remove quotes at beginning or end with possible whitespace
                .replace(/^[ \t]*"|"[ \t]*$/g, '')
                .trim();
        };
        
        return fieldsContent;
    } catch (error) {
        console.error("Error in metaInherit:", error.message);
        return {};
    }
}

module.exports = metaInherit;