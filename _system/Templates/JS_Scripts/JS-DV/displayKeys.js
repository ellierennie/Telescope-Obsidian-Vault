
// Create a cache object in the global scope
window.hotkeysCache = window.hotkeysCache || {};

function displayKeys(input) {
    const cacheKey = JSON.stringify(input);
    
    // Check if we have a cached result
    if (window.hotkeysCache[cacheKey]) {
        dv.paragraph(window.hotkeysCache[cacheKey]);
        return;
    }

    // Configuration
    const desiredHotkeys = input?.desiredHotkeys || [];
    const footnote = input?.footnote || '';
    const heading = input?.heading || '';

    const getNestedObject = (nestedObj, pathArr) => {
        return pathArr.reduce((obj, key) =>
            (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
    }

    function joinModifiers(modifiers, symbols=true) {
        return modifiers.join(' ')
            .replace(/Mod/g, '⌘')
            .replace(/Alt/g, '⌥')
            .replace(/Ctrl/g, '⌃')
            .replace(/Shift/g, '⇧');
    }

    function hilite(keys, symbols=true) {
        if (keys && keys[1][0] !== undefined) {
            return '**' + joinModifiers(keys[0], symbols) + ' ' + keys[1][0] + '**';
        } else {
            return '**-**';
        }
    }

    function getHotkey(arr, symbols=true) {
        let defkeys = arr.hotkeys ? [[getNestedObject(arr.hotkeys, [0, 'modifiers'])],
            [getNestedObject(arr.hotkeys, [0, 'key'])]] : undefined;
        let ck = app.hotkeyManager.customKeys[arr.id];
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

    let cmds = desiredHotkeys
        .map(([id, description]) => {
            const cmd = app.commands.commands[id];
            if (cmd) {
                return [id, cmd, description];
            } else {
                // This is a custom text entry
                return [id, null, description];
            }
        });

    // Generate output
    let output = "";
    if (heading) {
        output += `${heading}\n\n`;
    }
    
    output += "|   Hotkey  |    Name  |  Description  |\n";
    output += "| :------------- | :------------------------ | :------------------------ |\n";
    for (const cmd of cmds) {
        if (cmd[1] === null) {
            // Custom text entry
            output += `| ${cmd[0]} | ${cmd[2]} | |\n`;
        } else {
            const actionName = simplifyFunctionTitle(cmd[1].name);
            const description = cmd[2] || '';
            const hotkey = getHotkey(cmd[1], true);
            output += `| ${hotkey} | ${actionName} | ${description} |\n`;
        }
    }
    
    if (footnote) {
        output += `\n${footnote}`;
    }

    // Cache the generated output
    window.hotkeysCache[cacheKey] = output;

    // Display the output
    dv.paragraph(output);
}

// Call the function
displayKeys(input);