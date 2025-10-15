<%*
const CONFIG = {
    fieldName: "Priority",          // Can be changed to "Importance", "Urgency", etc.
    priorities: [
        { value: 4, label: "Critical", emoji: "🔴" },  // Time-sensitive, must do immediately
        { value: 3, label: "High", emoji: "🟡" },      // Important, should do soon
        { value: 2, label: "Medium", emoji: "🟢" },    // Regular priority, do when possible
        { value: 1, label: "Low", emoji: "⚪" },       // Nice to have, no time pressure
        { value: 0, label: "None", emoji: "⚫" }       // No priority set/not applicable
    ]
};

// Function to get existing priority from the note
async function getExistingPriority() {
    const file = tp.file.find_tfile(tp.file.title);
    if (!file) return null;
    
    const content = await app.vault.read(file);
    const regex = new RegExp(`^${CONFIG.fieldName}:: (\\d+)$`, 'm');
    const match = content.match(regex);
    
    return match ? parseInt(match[1]) : null;
}

// Create formatted options for the suggester
function createPriorityOptions() {
    return CONFIG.priorities.map(p => ({
        display: `${p.emoji} ${p.label} (${p.value})`,
        value: p.value
    }));
}

// Get existing priority
const currentPriority = await getExistingPriority();

// Create options for suggester
const options = createPriorityOptions();

// Show suggester with current priority highlighted
const selected = await tp.system.suggester(
    options.map(opt => currentPriority === opt.value ? `✓ ${opt.display}` : opt.display),
    options.map(opt => opt.value),
    false,
    `Set ${CONFIG.fieldName}`
);

const file = tp.file.find_tfile(tp.file.title);
if (selected !== null) {
    // Get the file content
    const content = await app.vault.read(file);
    
    // Create the new field line
    const newFieldLine = `${CONFIG.fieldName}:: ${selected}`;
    
    // Check if the field already exists
    const regex = new RegExp(`^${CONFIG.fieldName}::.*$`, 'm');
    const updatedContent = content.match(regex) 
        ? content.replace(regex, newFieldLine)
        : content + '\n' + newFieldLine;
    
    // Write the updated content back to the file
    await app.vault.modify(file, updatedContent);
    
    const selectedPriority = CONFIG.priorities.find(p => p.value === selected);
    new Notice(`Updated ${CONFIG.fieldName} to ${selectedPriority.emoji} ${selectedPriority.label}`);
} else {
    // If no selection made, optionally remove the field
    const content = await app.vault.read(file);
    const regex = new RegExp(`^${CONFIG.fieldName}::.*\n?`, 'm');
    const updatedContent = content.replace(regex, '');
    await app.vault.modify(file, updatedContent);
    new Notice(`Removed ${CONFIG.fieldName} field`);
}

tR += '';


/*
TEMPLATE INSTRUCTIONS

1. Basic Configuration:
   - fieldName: Can be changed to any priority-like field ("Priority", "Importance", "Urgency", etc.)
   - priorities: Array of priority levels with values, labels, and emojis

2. Priority Scale (Default):
   🔴 Critical (4) - Immediate attention required
   🟡 High (3)     - Important, time-sensitive
   🟢 Medium (2)   - Normal importance
   ⚪ Low (1)      - No time pressure
   ⚫ None (0)     - No priority/Not applicable

3. Example Configurations:

// For task priority
const CONFIG = {
    fieldName: "Priority",
    priorities: [
        { value: 4, label: "Critical", emoji: "🔴" },
        { value: 3, label: "High", emoji: "🟡" },
        { value: 2, label: "Medium", emoji: "🟢" },
        { value: 1, label: "Low", emoji: "⚪" },
        { value: 0, label: "None", emoji: "⚫" }
    ]
}

// For importance levels
const CONFIG = {
    fieldName: "Importance",
    priorities: [
        { value: 4, label: "Essential", emoji: "🔴" },
        { value: 3, label: "Important", emoji: "🟡" },
        { value: 2, label: "Helpful", emoji: "🟢" },
        { value: 1, label: "Optional", emoji: "⚪" },
        { value: 0, label: "Skippable", emoji: "⚫" }
    ]
}

// For urgency levels
const CONFIG = {
    fieldName: "Urgency",
    priorities: [
        { value: 4, label: "Immediate", emoji: "🔴" },
        { value: 3, label: "Urgent", emoji: "🟡" },
        { value: 2, label: "Soon", emoji: "🟢" },
        { value: 1, label: "Later", emoji: "⚪" },
        { value: 0, label: "Whenever", emoji: "⚫" }
    ]
}

4. Usage:
   - Run template
   - Select priority level from the menu
   - Current priority (if set) will be marked with ✓
   - Press ESC to remove priority

5. Tips:
   - Numerical values (0-4) allow for easy sorting in dataview queries
   - Emojis provide visual priority indicators
   - Labels can be customized while keeping numerical values consistent
   - Consistent scale across different types of prioritization
*/
-%>