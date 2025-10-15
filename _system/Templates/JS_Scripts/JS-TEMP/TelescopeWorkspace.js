const DESTINATION_FOLDER = "Inputs/KOI/Telescope";
const WORKSPACE_TEMPLATE = "_system/Templates/_Telescope Templates/+TelescopeWorkspace.md";

/**
 * Process workspace links with support for template variables
 * @param {Object} tp - Templater object
 * @param {String} templatePath - Path template with variables
 * @returns {String} - Formatted workspace links for YAML
 */
async function telescopeWorkspace(tp, templatePath) {
    if (!templatePath) return '';
    
    console.log("Processing workspace links with path template:", templatePath);
    
    // Supported variables for workspaces
    const supportedVars = ['team_name'];
    
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
    
    // Function to replace template variables with actual values
    function parseTemplate(template) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
            const trimmedName = varName.trim();
            
            // Check if it's one of our supported variables
            if (!supportedVars.includes(trimmedName)) {
                console.warn(`Warning: Variable {{${trimmedName}}} is not in the list of supported variables: ${supportedVars.join(', ')}`);
            }
            
            // Check if variable exists in frontmatter
            if (frontmatter[trimmedName] !== undefined) {
                return frontmatter[trimmedName];
            }
            
            // If not found in frontmatter, prompt the user
            const userInput = prompt(`Enter value for ${trimmedName}:`, "");
            
            // Store the value for potential reuse
            if (userInput) {
                varValues[trimmedName] = userInput;
            }
            
            return userInput || match; // Return original match if user cancels
        });
    }
    
    // Helper functions for path sanitization
    function sanitizeFileName(input) {
        if (!input) return '';
        
        return input
            .replace(/\//g, '-')
            .replace(/\\/g, '-')
            .replace(/:/g, '-')
            .replace(/\*/g, '')
            .replace(/\?/g, '')
            .replace(/"/g, "'")
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/\|/g, '-')
            .replace(/\r\n|\n|\r/g, ' ')
            .trim();
    }
    
    function sanitizeFilePath(path) {
        if (!path) return '';
        
        return path.split('/')
            .map(segment => sanitizeFileName(segment))
            .filter(segment => segment.length > 0)
            .join('/');
    }
    
    const workspaceLinks = [];
    
    for (const pathTemplate of templatePath.split(',').map(a => a.trim()).filter(a => a.length > 0)) {
        // Parse the template to get the actual path
        const parsedPath = parseTemplate(pathTemplate);
        console.log("Parsed path:", parsedPath);
        
        // Extract the display name from the path
        const pathParts = parsedPath.split('/');
        const displayName = pathParts[pathParts.length - 1] || parsedPath;
        console.log("Original display name:", displayName);
        
        // Clean the path from special characters while preserving directory structure
        const sanitizedRelativePath = sanitizeFilePath(parsedPath);
        console.log("Sanitized relative path:", sanitizedRelativePath);
        
        // Combine with destination folder to get full path
        const fullPath = `${DESTINATION_FOLDER}/${sanitizedRelativePath}`;
        console.log("Full path with destination folder:", fullPath);
        
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
                
                // Get the template file
                const templateFile = tp.file.find_tfile(WORKSPACE_TEMPLATE);
                if (!templateFile) {
                    console.error(`Template file not found: ${WORKSPACE_TEMPLATE}`);
                    continue;
                }
                
                // Read the raw template content
                const templateContent = await app.vault.read(templateFile);
                
                // Replace any variables in the template content too
                let processedTemplateContent = templateContent.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
                    const trimmedName = varName.trim();
                    return varValues[trimmedName] || match;
                });
                
                // Create the new file with the processed template content
                console.log(`Creating workspace file at: ${fullPath}.md`);
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
                        const templater = window.TemplaterPlugin.templater;
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
                
                console.log(`Created and processed new workspace note: ${fullPath}`);
            } catch (error) {
                console.error(`Error with file ${fullPath}: ${error.message}`);
                console.error(error.stack);
            }
        }
        
        // Add the link to our list
        workspaceLinks.push(`- "[[${fullPath}|${displayName}]]"`);
    }
    
    // Return the links as a YAML list with each item on a new line
    const result = workspaceLinks.length > 0 ? '\n' + workspaceLinks.join('\n') : '';
    console.log(`Final workspace links:`, result);
    
    return result;
}

// Export the function as a simple default export
module.exports = telescopeWorkspace;