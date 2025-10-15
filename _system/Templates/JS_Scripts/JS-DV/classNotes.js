function classNotes(dv, input) {
    const currentClass = dv.current().file.name;
    const customFields = input?.fields || [];
    const excludeFolders = ["_system"];
    const fromFolders = input?.fromFolders || []; // Added fromFolders support
    const whereConditions = input?.where || {};
    const sortBy = input?.sortBy;
    const sortOrder = input?.sortOrder || 'asc';
    
    function cleanWikiLink(value) {
        if (!value) return '';
        
        try {
            const name = value.includes('|') 
                ? value.split('|')[1].replace(']]', '') 
                : value.split('/').pop().replace('.md', '').replace('[[', '').replace(']]', '');
            return `[[${name.trim()}]]`;
        } catch (e) {
            console.error('Error cleaning wikilink:', e);
            return value;
        }
    }

    function safeLink(value, fieldName = '') {
        if (value === null || value === undefined) {
            return '';
        }

        if (fieldName === 'note') {
            return String(value);
        }

        if (typeof value === 'string') {
            let cleanValue = value.replace(/^["'](.*)["']$/, '$1')
                                .replace(/^- /, '')
                                .trim();
            
            if (cleanValue.includes('/') || cleanValue.includes('[[')) {
                return cleanWikiLink(cleanValue);
            }
            return `${cleanValue}`;
        }

        if (Array.isArray(value)) {
            const cleanedItems = value
                .map(item => safeLink(item, fieldName))
                .filter(Boolean);
            
            return cleanedItems.join('<br/>');
        }

        return String(value);
    }
    
    function formatValue(value, fieldConfig, fieldName) {
        if (typeof fieldConfig === 'string' && fieldConfig.includes('=')) {
            try {
                const conditions = fieldConfig.match(/\((.*?)\)/)[1].split(',').map(s => s.trim());
                for (let i = 0; i < conditions.length; i += 2) {
                    const [condKey, condValue] = conditions[i].split('=').map(s => s.trim());
                    if (String(value) === condValue) {
                        return conditions[i + 1].replace(/["']/g, '');
                    }
                }
            } catch (e) {
                console.error('Error parsing field configuration:', e);
            }
            return value;
        }

        const formattedValue = safeLink(value, fieldName);
        if (typeof formattedValue === 'string' && formattedValue.includes(',') && fieldName !== 'note') {
            return formattedValue.split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => item.startsWith('[[') ? item : `[[${item}]]`)
                .join('<br/>');
        }
        return formattedValue;
    }
    
    function escapeCellContent(content) {
        return String(content).replace(/\|/g, '\\|')
                            .replace(/\n/g, '<br/>');
    }
    
    let pages = dv.pages()
        .where(p => p.class === currentClass &&
                    !excludeFolders.some(folder => p.file.path.startsWith(folder)) &&
                    // Added fromFolders filtering
                    (fromFolders.length === 0 || fromFolders.some(folder => p.file.path.startsWith(folder))));
    
    Object.entries(whereConditions).forEach(([key, condition]) => {
        if (typeof condition === 'object' && condition !== null) {
            if ('$gt' in condition) {
                pages = pages.where(p => p[key] > condition.$gt);
            } else if ('$lt' in condition) {
                pages = pages.where(p => p[key] < condition.$lt);
            }
        } else {
            pages = pages.where(p => p[key] === condition);
        }
    });
    
    if (sortBy) {
        pages = pages.sort(p => {
            const value = p[sortBy];
            return typeof value === 'string' ? value.toLowerCase() : value;
        }, sortOrder);
    }

    if (pages.length === 0) {
        dv.paragraph("No notes found for this class.");
        return;
    }

    let tableHeader = "| File";
    let fieldMap = new Map();
    customFields.forEach(field => {
        let [fieldName, displayName] = field.split(' AS ').map(s => s.trim());
        if (displayName && displayName.includes('=')) {
            const lastAS = field.lastIndexOf(' AS ');
            displayName = lastAS !== -1 ? field.substring(lastAS + 4).trim() : fieldName;
        }
        fieldMap.set(fieldName, displayName || fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
        tableHeader += ` | ${fieldMap.get(fieldName)}`;
    });
    tableHeader += " |\n|---";
    customFields.forEach(() => tableHeader += "|---");
    tableHeader += "|\n";

    const tableRows = pages.map(page => {
        const fileLink = escapeCellContent(cleanWikiLink(page.file.name));
        
        let row = `|${fileLink}`;
        customFields.forEach(field => {
            let [fieldName, fieldConfig] = field.split(' AS ').map(s => s.trim());
            let value = formatValue(page[fieldName], fieldConfig || fieldName, fieldName);
            row += `|${escapeCellContent(value)}`;
        });
        return row + "|";
    }).join('\n');

    dv.paragraph(tableHeader + tableRows);
}

classNotes(dv, input);