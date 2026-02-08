<%*

// metaInherit

const templateType = "create";

const description = "create or open for the active note";

const BASE_FOLDER = "Synthesis/Reference Notes";

await tp.user.metaInherit(tp);

  

// Get the source file

const sourceFile = app.workspace.getActiveFile();

if (!sourceFile) {

    // Silently exit instead of showing error

    return '';

}

  

// Check if the current note is in the Synthesis folder or subfolder

const isInSynthesisFolder = sourceFile.path.startsWith('Synthesis/');

  

// Default to the current file as source

let actualSourceFile = sourceFile;

let sourceFileName = sourceFile.basename;

let sourcePath = sourceFile.path;

  

// If we're in the Synthesis folder, get the actual source from YAML

if (isInSynthesisFolder) {

    // Get source file content and extract source link

    let sourceFileContent = '';

    try {

        sourceFileContent = await app.vault.read(sourceFile);

    } catch (e) {

        // Silently continue with defaults if we can't read the file

    }

    const sourceMatch = sourceFileContent.match(/source:\s*"?\[\[(.*?)\]\]"?/);

    if (sourceMatch && sourceMatch[1]) {

        // Extract the source file name

        sourceFileName = sourceMatch[1].trim();

        // Try to find the actual source file in the vault

        const sourceFiles = app.vault.getMarkdownFiles().filter(file => 

            file.basename === sourceFileName);

        if (sourceFiles.length > 0) {

            // Use the first matching file

            actualSourceFile = sourceFiles[0];

            sourcePath = actualSourceFile.path;

            // First check if a reference note already exists for this source

            const allFiles = app.vault.getMarkdownFiles();

            const refPattern = `REF_${sourceFileName}`;

            for (const file of allFiles) {

                if (file.basename === refPattern) {

                    // If reference note exists, just open it silently

                    try {

                        await app.workspace.openLinkText(file.path, '', true);

                        return '';

                    } catch (e) {

                        // If we can't open it, continue with creation

                    }

                }

            }

        }

    }

}

  

// Get source file content and YAML frontmatter

let actualFileContent = '';

try {

    actualFileContent = await app.vault.read(actualSourceFile);

} catch (e) {

    // Silently continue if we can't read the file

}

  

const yaml = actualFileContent.match(/^---\n([\s\S]*?)\n---/);

  

// Extract title from metadata or use filename

let searchTitle = '';

if (yaml) {

    const frontMatter = yaml[1];

    const searchTitleMatch = frontMatter.match(/searchTitle:\s*(.+)/);

    if (searchTitleMatch) {

        searchTitle = searchTitleMatch[1].trim();

    }

}

  

if (!searchTitle) {

    searchTitle = sourceFileName;

}

  

// Get class value from metadata or use default

let currentClass = '';

let isKOITelescope = false;

  

// Try to get class and category from the actual source file

try {

    const sourceContent = await app.vault.read(actualSourceFile);

    const sourceYaml = sourceContent.match(/^---\n([\s\S]*?)\n---/);

    if (sourceYaml) {

        const yamlContent = sourceYaml[1];

        const sourceClassMatch = yamlContent.match(/class:\s*(.+?)($|\n)/);

        const sourceCategoryMatch = yamlContent.match(/category:\s*(.+?)($|\n)/);

        // Set current class if found

        if (sourceClassMatch) {

            currentClass = sourceClassMatch[1].trim();

        }

        // Check if this is a KOI Telescope source

        if (sourceClassMatch && sourceCategoryMatch) {

            const classValue = sourceClassMatch[1].trim();

            const categoryValue = sourceCategoryMatch[1].trim();

            if (classValue === 'KOI' && categoryValue === 'Telescope') {

                isKOITelescope = true;

            }

        }

    }

} catch (e) {

    // Silently continue if there's an error

}

  

// Fallback to current file's class if needed

if (!currentClass) {

    currentClass = getValue('class')?.trim() || 'Uncategorized';

}

  

// Create subfolder based on class from the metadata

const DESTINATION_FOLDER = `${BASE_FOLDER}/${currentClass}`;

  

// Create the destination folder structure if it doesn't exist

const folderExists = app.vault.getAbstractFileByPath(DESTINATION_FOLDER);

if (!folderExists) {

    try {

        // Create parent folder if needed

        const baseFolder = app.vault.getAbstractFileByPath(BASE_FOLDER);

        if (!baseFolder) {

            await app.vault.createFolder(BASE_FOLDER);

        }

        // Create class subfolder

        await app.vault.createFolder(DESTINATION_FOLDER);

    } catch (e) {

        // Silently continue if folder creation fails

    }

}

  

// Search for existing reference notes with this source filename pattern

let existingFile = null;

const refPattern = `REF_${searchTitle}.md`;

  

// First try to find an exact match in the Reference Notes folder structure

const existingInDestination = app.vault.getAbstractFileByPath(`${DESTINATION_FOLDER}/REF_${searchTitle}.md`);

if (existingInDestination) {

    existingFile = existingInDestination;

} else {

    // If not found in destination, search all markdown files for matching pattern

    const allFiles = app.vault.getMarkdownFiles();

    for (const file of allFiles) {

        if (file.name === refPattern || file.basename === `REF_${searchTitle}`) {

            existingFile = file;

            break;

        }

    }

}

  

// If we still haven't found it, we'll create a new one

const newFilePath = existingFile ? existingFile.path : `${DESTINATION_FOLDER}/REF_${searchTitle}.md`;

  

if (existingFile) {

    // If file exists, open it directly

    try {

        await app.workspace.openLinkText(existingFile.path, '', true);

        return '';

    } catch (e) {

        // If opening fails, continue with creation

    }

}

  

// Only prompt for comment if we're creating a new file

const COMMENT = await tp.system.prompt("add brief comment");

  

// Get creation date
const sourceCreated = new Date(actualSourceFile.stat.ctime)
    .toLocaleDateString('en-US', {year: '2-digit', month: '2-digit', day: '2-digit'})
    .replace(/\//g, '.');

// Get vault author - call directly in template
const vaultAuthor = await tp.user.vaultAuthor(tp);

// Get the source note content (excluding YAML frontmatter)

let sourceNoteContent = '';

try {

    // Extract content without the YAML frontmatter

    if (actualFileContent) {

        // Remove frontmatter if it exists

        const contentWithoutYaml = actualFileContent.replace(/^---\n[\s\S]*?\n---\n?/, '');

        sourceNoteContent = contentWithoutYaml.trim();

    }

} catch (e) {

    // Silently continue if we can't extract the content

    console.error("Error extracting source content:", e);

}

  

// Create the related notes query

const relatedQuery = `\`\`\`dataviewjs

dv.view("relatedNotes")

\`\`\``;

  

// Create the mentions dataview query

const mentionsQuery = `\`\`\`dataviewjs

dv.view("mentions", {

  fields: ["note"],

  excludeClass: ["KOI", "Sources", "Quotes"]

})

\`\`\``;

  

// Create the quotes dataview query

const quotesQuery = `\`\`\`dataviewjs

dv.view("displayQuotesBySource")

\`\`\``;

  

// Determine which YAML frontmatter to use based on source file properties

let yamlFrontmatter = '';

  

if (isKOITelescope) {

    // Use KOI Telescope template

    yamlFrontmatter = `---

type: Synthesis

class: Reference_Notes

category: KOI

workspace: ${getValue('team_name')}

channel: ${getValue('channel')}

author: ${getValue('author')}

channel_name: ${getValue('channel_name')}

author_name: ${getValue('author_name')}

created_at: ${getValue('created_at')}

tagger_name: ${getValue('tagger_name')}

author_is_anonymous: ${getValue('author_is_anonymous')}

source: "[[${sourceFileName}]]"

title:${getValue('title')}

itemType:${getValue('itemType')}

noteAuthor: "${vaultAuthor}"

tags: ${getValue('tags')}

note: ${COMMENT || ''}

---

## [[${sourceFileName}|🔭 Source]] 

### ${getValueBody('author')} in${getValue('channel_name')}

  

# Related Notes

${relatedQuery}

  

  

  

  

# Notes

  

  

---

# Telescope Content 

  

${sourceNoteContent}

  

`;

} else {

// Use standard template

yamlFrontmatter = `---

type: Synthesis

class: Reference_Notes

category: ${currentClass}

source: "[[${sourceFileName}]]"

author:${getValue('author')}

title:${getValue('title')}

citeKey:${getValue('citeKey')}

itemType:${getValue('itemType')}

noteAuthor: "${vaultAuthor}"

tags: ${getValue('tags')}

note: ${COMMENT || ''}

---

## Title:${getValueBody('title')}

### Source: [[${sourceFileName}]]

### Author: ${getValueBody('author')}

  

# Related Notes

${relatedQuery}

  

# Notes

  

  

---

# Source Content (imported)

  

${sourceNoteContent}

  

`;

}

  

  

  

// Compile the full template content

const templateContent = `${yamlFrontmatter}

  

# Mentions and Quotes

${mentionsQuery}

${quotesQuery}

  

`;

// Create the new file with content only if we don't have an existing file

if (!existingFile) {

    try {

        await app.vault.create(newFilePath, templateContent);

        // Get the newly created file

        const newFile = app.vault.getAbstractFileByPath(newFilePath);

        if (newFile) {

            // Open the new file

            await app.workspace.openLinkText(newFilePath, '', true);

        }

    } catch (e) {

        // Silently continue if file creation fails

    }

}

-%>v