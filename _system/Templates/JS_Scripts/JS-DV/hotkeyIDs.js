function displayAllHotkeys(input) {
    // Check if cached data exists and is less than 5 minutes old
    const cachedData = dv.current().cachedHotkeys;
    const cacheTime = dv.current().cacheTime;
    const now = Date.now();
    if (cachedData && cacheTime && (now - cacheTime < 300000)) {
        dv.paragraph(cachedData);
        return;
    }

    function getNestedObject(nestedObj, pathArr) {
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
            return '' + joinModifiers(keys[0], symbols) + ' ' + keys[1][0] + '';
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
  
    let cmds = Object.entries(app.commands.commands)
        .filter(v => getHotkey(v[1]) != '**-**')
        .sort((a, b) => a[1].id.localeCompare(b[1].id))
        .sort((a, b) => getHotkey(a[1], false).localeCompare(getHotkey(b[1], false)));
  
    // Group commands by plugin
    const groupedCmds = cmds.reduce((acc, cmd) => {
        const pluginName = cmd[1].id.split(':')[0];
        if (!acc[pluginName]) {
            acc[pluginName] = [];
        }
        acc[pluginName].push(cmd);
        return acc;
    }, {});
  
    // Generate output
    let output = "";
    if (input?.heading !== false) {
        output += "# All Obsidian Hotkeys\n\n";
    }

    for (const [pluginName, pluginCmds] of Object.entries(groupedCmds)) {
        const formattedPluginName = pluginName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        output += `### ${formattedPluginName}\n\n`;
        output += "| Action | Hotkey |  ID |\n";
        output += "|:-------------------|:-----|:---------------------------|\n";
        for (const cmd of pluginCmds) {
            const actionName = simplifyFunctionTitle(cmd[1].name);
            const hotkey = getHotkey(cmd[1], true);
            const fullHotkeyId = cmd[1].id;
            output += `| ${actionName} | ${hotkey} | \`${fullHotkeyId}\` |\n`;
        }
        output += "\n";
    }

    output += `${cmds.length} displayed hotkeys`;

    // Cache the output and timestamp
    dv.current().cachedHotkeys = output;
    dv.current().cacheTime = now;

    // Display the output
    dv.paragraph(output);
}

// Call the function
displayAllHotkeys(input);