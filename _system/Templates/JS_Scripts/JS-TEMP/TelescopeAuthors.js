const DESTINATION_FOLDER = "Inputs/KOI/Telescope";
const AUTHOR_TEMPLATE = "_system/Templates/_Telescope Templates/+TelescopeAuthor.md";

/**
 * Process author links with support for multiple template variables
 * @param {Object} tp - Templater object
 * @param {String} templatePath - Path template with variables like "{{team_name}}/Authors/{{author_name}}"
 * @returns {String} - Formatted author links for YAML
 */
async function Authors(tp, templatePath) {
    if (!templatePath) return '';
    
    console.log("Processing author links with path template:", templatePath);
    
    // Extract supported variable names for explicit handling
    const supportedVars = ['author_name', 'channel_name', 'team_name'];
    
    // Get the current note's frontmatter to extract variables
    const currentFile = tp.file.find_tfile(tp.file.path(true));
    let frontmatter = {};
    let varValues = {};
    
    try {
        // Get frontmatter from current file if available
        const fileContents = await app.vault.read(currentFile);
        const fmMatch = fileContents.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch && fmMatch[1]) {
            // Parse YAML frontmatter
            const fmLines = fmMatch[1].split('\n');
            for (const line of fmLines) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    frontmatter[key] = value;
                    
                    // Store supported variables specifically
                    if (supportedVars.includes(key)) {
                        varValues[key] = value;
                    }
                }
            }
        }
        
        console.log("Variables found in frontmatter:", 
            Object.keys(varValues).length > 0 ? 
            varValues : "None of the supported variables found");
            
    } catch (error) {
        console.error("Error reading frontmatter:", error);
    }
    
    /**
     * Sanitizes a filename or path segment to be safe for file system use
     * @param {String} input - The string to sanitize
     * @return {String} - Sanitized string safe for filesystem use
     */
    function sanitizeFileName(input) {
        if (!input) return '';
        
        // Replace illegal characters with safe alternatives
        // This addresses common file system restrictions
        return input
            .replace(/\//g, '-')   // Forward slash
            .replace(/\\/g, '-')   // Backslash
            .replace(/:/g, '-')    // Colon
            .replace(/\*/g, '')    // Asterisk
            .replace(/\?/g, '')    // Question mark
            .replace(/"/g, "'")    // Double quote
            .replace(/</g, '')     // Less than
            .replace(/>/g, '')     // Greater than
            .replace(/\|/g, '-')   // Pipe
            .replace(/\r\n|\n|\r/g, ' ') // Newlines
            .trim();
    }
    
    /**
     * Sanitizes a file path, preserving the directory separators between path segments
     * @param {String} path - The file path to sanitize
     * @return {String} - Sanitized file path
     */
    function sanitizeFilePath(path) {
        if (!path) return '';
        
        // Split by path separator, sanitize each segment, then rejoin
        return path.split('/')
            .map(segment => sanitizeFileName(segment))
            .filter(segment => segment.length > 0) // Remove empty segments
            .join('/');
    }
    
    const authorLinks = [];
    
    for (const pathTemplate of templatePath.split(',').map(a => a.trim()).filter(a => a.length > 0)) {
        try {
            // First, extract all variable placeholders from the template
            const variablePlaceholders = [];
            let match;
            const regex = /\{\{([^}]+)\}\}/g;
            while ((match = regex.exec(pathTemplate)) !== null) {
                variablePlaceholders.push({
                    placeholder: match[0],
                    varName: match[1].trim()
                });
            }
            
            // Clone the template for processing
            let processedPath = pathTemplate;
            
            // Process each variable placeholder
            for (const placeholder of variablePlaceholders) {
                const varName = placeholder.varName;
                let varValue;
                
                // Get variable value from frontmatter or prompt user
                if (frontmatter[varName] !== undefined) {
                    varValue = frontmatter[varName];
                } else {
                    varValue = prompt(`Enter value for ${varName}:`, "");
                    if (varValue) {
                        varValues[varName] = varValue; // Store for reuse
                    }
                }
                
                // Store the original value for later display use
                if (varValue && !varValues[varName]) {
                    varValues[varName] = varValue;
                }
                
                // If this is an author_name or similar path component, sanitize it for the path
                // but keep the original for display
                const sanitizedValue = sanitizeFileName(varValue || "");
                
                // Replace in the processed path
                processedPath = processedPath.replace(placeholder.placeholder, sanitizedValue);
            }
            
            console.log("Processed path after variable replacement:", processedPath);
            
            // Sanitize the path structure (not needed since we already sanitized each variable)
            // const sanitizedPath = sanitizeFilePath(processedPath);
            // console.log("Sanitized path for file system:", sanitizedPath);
            
            // For simple templates that just contain {{author_name}}, extract the author name
            // directly from varValues
            let authorName = "";
            if (pathTemplate.includes("{{author_name}}") && varValues["author_name"]) {
                authorName = varValues["author_name"];
            } else {
                // For other templates, extract the last part of the path as author name
                const pathParts = processedPath.split('/');
                authorName = pathParts[pathParts.length - 1] || processedPath;
            }
            
            console.log("Author name for display:", authorName);
            
            // Combine with destination folder to get full path
            const fullPath = `${DESTINATION_FOLDER}/${processedPath}`;
            console.log("Full path for file:", fullPath);
            
            // Check if the file already exists
            const fileExists = await tp.file.exists(`${fullPath}.md`);
            console.log(`File exists at ${fullPath}.md: ${fileExists}`);
            
            if (!fileExists) {
                try {
                    // Create folders if they don't exist
                    const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
                    if (folderPath) {
                        console.log(`Creating folder structure: ${folderPath}`);
                        await app.vault.createFolder(folderPath).catch((error) => {
                            // Ignore error if folder already exists
                            console.log(`Note on folder creation: ${error.message}`);
                        });
                    }
                    
                    // Create the file with template content
                    const templateFile = tp.file.find_tfile(AUTHOR_TEMPLATE);
                    if (!templateFile) {
                        console.error(`Template file not found: ${AUTHOR_TEMPLATE}`);
                        continue;
                    }
                    
                    // Read the raw template content
                    const templateContent = await app.vault.read(templateFile);
                    
                    // Replace variables in the template content (using original unsanitized values)
                    let processedTemplateContent = templateContent.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
                        const trimmedName = varName.trim();
                        return varValues[trimmedName] || match;
                    });
                    
                    // Create the new file with the processed template content
                    console.log(`Creating author file at: ${fullPath}.md`);
                    await app.vault.create(`${fullPath}.md`, processedTemplateContent);
                    
                    // Get a reference to the newly created file
                    const newFile = app.vault.getAbstractFileByPath(`${fullPath}.md`);
                    if (!newFile) {
                        console.error(`Failed to get reference to newly created file: ${fullPath}`);
                        continue;
                    }
                    
                    // Process the template in the file using Templater's API
                    if (window.TemplaterPlugin) {
                        try {
                            // Get the templater plugin instance
                            const templater = window.TemplaterPlugin.templater;
                            
                            // Process templates in the file
                            await templater.append_templates_in_file(newFile);
                            
                            console.log(`Auto-processed templates in: ${fullPath}.md`);
                        } catch (templaterError) {
                            console.error(`Error auto-processing templates: ${templaterError}`);
                            
                            // Fallback to the command approach
                            try {
                                await app.workspace.openLinkText(newFile.path, "", false);
                                await app.commands.executeCommandById("templater-obsidian:replace-in-file-templater");
                                app.workspace.detachLeavesOfType("markdown");
                                
                                console.log(`Fallback template processing succeeded for: ${fullPath}.md`);
                            } catch (cmdError) {
                                console.error(`Fallback template processing failed: ${cmdError}`);
                            }
                        }
                    } else {
                        // Fallback to the command approach if Templater API isn't available
                        await app.workspace.openLinkText(newFile.path, "", false);
                        await app.commands.executeCommandById("templater-obsidian:replace-in-file-templater");
                        app.workspace.detachLeavesOfType("markdown");
                    }
                    
                    console.log(`Created and processed new author note: ${fullPath}`);
                } catch (error) {
                    console.error(`Error with file ${fullPath}: ${error.message}`);
                    console.error(error.stack);
                }
            }
            

            authorLinks.push(`- "[[${fullPath}|${authorName}]]"`);
            
        } catch (error) {
            console.error(`Error processing template ${pathTemplate}: ${error.message}`);
            console.error(error.stack);
        }
    }
    
    // Return the authors as a YAML list with each item on a new line
    const result = authorLinks.length > 0 ? '\n' + authorLinks.join('\n') : '';
    console.log("Final author links:", result);
    
    return result;
}

module.exports = Authors;