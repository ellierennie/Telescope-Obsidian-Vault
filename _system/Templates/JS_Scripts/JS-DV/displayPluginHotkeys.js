// Obsidian Plugin Hotkeys Script for Dataview

const footnote = Array.isArray(input?.footnote) ? input.footnote[0] : input?.footnote || '';
const selectedPlugin = Array.isArray(input?.Plugin) ? input.Plugin[0] : input?.Plugin || '';
const excludeNonAssigned = input?.exclude === true;

const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}

function joinModifiers(modifiers, symbols=true) {
    if (symbols) {
        return modifiers.join(' ')
            .replace(/Mod/g, '⌘')
            .replace(/Alt/g, '⌥')
            .replace(/Ctrl/g, '⌃')
            .replace(/Shift/g, '⇧');
    }
    return modifiers.join('+');
}

function hilite(keys, symbols=true) {
    if (keys && keys[1][0] !== undefined) {
        return '**' + joinModifiers(keys[0], symbols) + ' ' + keys[1][0] + '**';
    } else {
        return '**-**';
    }
}

function getHotkey(cmd, symbols=true) {
    let defkeys = cmd.hotkeys ? [[getNestedObject(cmd.hotkeys, [0, 'modifiers'])],
        [getNestedObject(cmd.hotkeys, [0, 'key'])]] : undefined;
    let ck = app.hotkeyManager.customKeys[cmd.id];
    var hotkeys = ck ? [[getNestedObject(ck, [0, 'modifiers'])], [getNestedObject(ck, [0, 'key'])]] : undefined;
    return hotkeys ? hilite(hotkeys, symbols) : hilite(defkeys, symbols);
}

function simplifyFunctionTitle(name) {
    name = name.endsWith('.md') ? name.slice(0, -3) : name;
    if (name.includes('/')) {
        name = name.split('/').pop();
    }
    if (name.includes(':')) {
        name = name.split(':').pop().trim();
    }
    return name;
}

// Generate output
let output = `###### ${selectedPlugin} Hotkeys\n`;
output += "| .......................   Action   ....................... | .......................   Hotkey   ....................... |\n";
output += "| --- | --- |\n";

// Get all commands for the selected plugin
const pluginCommands = Object.values(app.commands.commands)
    .filter(cmd => cmd.id.toLowerCase().includes(selectedPlugin.toLowerCase()));

// Separate assigned and non-assigned hotkeys
let assignedHotkeys = [];
let nonAssignedHotkeys = [];

for (const cmd of pluginCommands) {
    const actionName = simplifyFunctionTitle(cmd.name);
    const hotkey = getHotkey(cmd, true);
    
    if (hotkey !== '**-**') {
        assignedHotkeys.push(`| ${actionName} | ${hotkey} |\n`);
    } else {
        nonAssignedHotkeys.push(`| ${actionName} | ${hotkey} |\n`);
    }
}

// Add assigned hotkeys to output
output += assignedHotkeys.join('');

// Add non-assigned hotkeys if not excluded
if (!excludeNonAssigned && nonAssignedHotkeys.length > 0) {
    output += nonAssignedHotkeys.join('');
}

output += `\n${footnote}`;

// Display the output
dv.paragraph(output);