function daysAll(dv) {
  // Get all notes excluding system folder, and only from Notes and Synthesis folders
  const allNotes = dv.pages().where(p => 
    !p.file.path.startsWith("_system") && 
    (p.file.path.startsWith("Notes/") || p.file.path.startsWith("Synthesis/"))
  );

  // Filter for notes of class "PeriodicNotes"
  const periodicNotes = allNotes.where(p => p.class === "PeriodicNotes");

  // Helper function to extract date from filename
  function extractDateFromFilename(filename) {
    const match = filename.match(/(\d{2})\.(\d{2})\.(\d{2})/);
    if (match) {
      const year = parseInt('20' + match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const day = parseInt(match[3]);
      return { 
        date: new Date(year, month, day),
        formatted: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      };
    }
    return null;
  }

  // Process periodic notes, adding date information
  const processedNotes = periodicNotes.map(note => {
    // Extract date from filename first
    const extractedDate = extractDateFromFilename(note.file.name);
    
    // If we have a date from the filename, use it; otherwise fall back to creation time
    if (extractedDate) {
      return {
        note: note,
        dateObj: extractedDate.date,
        formattedDate: extractedDate.formatted
      };
    } else {
      // Fall back to creation time
      return {
        note: note,
        dateObj: note.file.ctime,
        formattedDate: note.file.ctime.toFormat("yyyy-MM-dd")
      };
    }
  });

  // Sort the periodic notes in reverse chronological order (newest first)
  const sortedNotes = processedNotes.sort((a, b) => b.dateObj - a.dateObj);

  dv.table(
    ["Day", "Note", "Notes Created on This Date"],
    sortedNotes.map(processedNote => {
      const note = processedNote.note;
      const dateObj = processedNote.dateObj;
      const noteDate = processedNote.formattedDate;
      
      // Format the date to "Day DD Month" format with full month name (e.g., "Tues 6 May")
      const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"];
      
      // Get day of week (0-6, where 0 is Sunday)
      const dayOfWeek = dateObj instanceof Date ? dateObj.getDay() : dateObj.weekday % 7;
      const day = dateObj instanceof Date ? dateObj.getDate() : dateObj.day;
      const month = dateObj instanceof Date ? dateObj.getMonth() : dateObj.month - 1;
      const year = dateObj instanceof Date ? dateObj.getFullYear() : dateObj.year;
      
      const formattedDate = `${dayNames[dayOfWeek]} ${day} ${monthNames[month]}`;
      
      // Get notes created on the same day, excluding ones with class "PeriodicNotes"
      const sameDayNotes = allNotes
        .where(p => {
          if (p.file.name === note.file.name || p.class === "PeriodicNotes") {
            return false;
          }
          
          // Try to extract date from other filenames too
          const otherExtractedDate = extractDateFromFilename(p.file.name);
          if (otherExtractedDate) {
            return otherExtractedDate.formatted === noteDate;
          }
          
          // For files without a date pattern, fall back to creation time
          return p.file.ctime && p.file.ctime.toFormat && 
                p.file.ctime.toFormat("yyyy-MM-dd") === noteDate;
        });
      
      // Group notes by class
      const notesByClass = {};
      sameDayNotes.forEach(p => {
        const noteClass = p.class || "Uncategorized";
        if (!notesByClass[noteClass]) {
          notesByClass[noteClass] = [];
        }
        
        // Use title field if available, otherwise use the file link
        if (p.title) {
          // Create a proper link with the title as display text
          notesByClass[noteClass].push(`[[${p.file.path}|${p.title}]]`);
        } else {
          notesByClass[noteClass].push(p.file.link);
        }
      });
      
      // Format grouped notes with class names as wikilinks
      let formattedNotes = "";
      for (const [className, notes] of Object.entries(notesByClass)) {
        if (notes.length > 0) {
          // Use wikilink for class name if it's not "Uncategorized"
          const classDisplay = className === "Uncategorized" 
            ? "**Uncategorized**" 
            : `**[[${className}]]**`;
          
          formattedNotes += `${classDisplay}<br>${notes.join("<br>")}<br><br>`;
        }
      }
      
      // Create an Obsidian-style internal link with the formatted date text
      const obsidianLink = `[[${note.file.path}|${formattedDate}]]`;
      
      // Get the note field or display a default message if not present
      const noteField = note.note || "—";
      
      return [obsidianLink, noteField, formattedNotes || "—"];
    })
  );
}

function daysLastWeek(dv) {
  // Get all notes excluding system folder, and only from Notes and Synthesis folders
  const allNotes = dv.pages().where(p => 
    !p.file.path.startsWith("_system") && 
    (p.file.path.startsWith("Notes/") || p.file.path.startsWith("Synthesis/"))
  );

  // Helper function to extract date from filename
  function extractDateFromFilename(filename) {
    const match = filename.match(/(\d{2})\.(\d{2})\.(\d{2})/);
    if (match) {
      const year = parseInt('20' + match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const day = parseInt(match[3]);
      return { 
        date: new Date(year, month, day),
        formatted: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      };
    }
    return null;
  }

  // Calculate the date one week ago
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  
  // Process all periodic notes, adding date information
  const processedNotes = allNotes.where(p => p.class === "PeriodicNotes").map(note => {
    // Extract date from filename first
    const extractedDate = extractDateFromFilename(note.file.name);
    
    // If we have a date from the filename, use it; otherwise fall back to creation time
    if (extractedDate) {
      return {
        note: note,
        dateObj: extractedDate.date,
        formattedDate: extractedDate.formatted
      };
    } else {
      // Fall back to creation time
      return {
        note: note,
        dateObj: note.file.ctime,
        formattedDate: note.file.ctime.toFormat("yyyy-MM-dd")
      };
    }
  });
  
  // Filter for notes of class "PeriodicNotes" from the last week
  // Now using the extracted/processed date
  const lastWeekNotes = processedNotes.filter(p => p.dateObj >= oneWeekAgo);

  // Sort the periodic notes in reverse chronological order (newest first)
  const sortedNotes = lastWeekNotes.sort((a, b) => b.dateObj - a.dateObj);

  dv.table(
    ["Day", "Note", "Notes Created on This Date"],
    sortedNotes.map(processedNote => {
      const note = processedNote.note;
      const dateObj = processedNote.dateObj;
      const noteDate = processedNote.formattedDate;
      
      // Format the date to "Day DD Month" format with full month name (e.g., "Tues 6 May")
      const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"];
      
      // Get day of week (0-6, where 0 is Sunday)
      const dayOfWeek = dateObj instanceof Date ? dateObj.getDay() : dateObj.weekday % 7;
      const day = dateObj instanceof Date ? dateObj.getDate() : dateObj.day;
      const month = dateObj instanceof Date ? dateObj.getMonth() : dateObj.month - 1;
      const year = dateObj instanceof Date ? dateObj.getFullYear() : dateObj.year;
      
      const formattedDate = `${dayNames[dayOfWeek]} ${day} ${monthNames[month]}`;
      
      // Get notes created on the same day, excluding ones with class "PeriodicNotes"
      const sameDayNotes = allNotes
        .where(p => {
          if (p.file.name === note.file.name || p.class === "PeriodicNotes") {
            return false;
          }
          
          // Try to extract date from other filenames too
          const otherExtractedDate = extractDateFromFilename(p.file.name);
          if (otherExtractedDate) {
            return otherExtractedDate.formatted === noteDate;
          }
          
          // For files without a date pattern, fall back to creation time
          return p.file.ctime && p.file.ctime.toFormat && 
                p.file.ctime.toFormat("yyyy-MM-dd") === noteDate;
        });
      
      // Group notes by class
      const notesByClass = {};
      sameDayNotes.forEach(p => {
        const noteClass = p.class || "Uncategorized";
        if (!notesByClass[noteClass]) {
          notesByClass[noteClass] = [];
        }
        
        // Use title field if available, otherwise use the file link
        if (p.title) {
          // Create a proper link with the title as display text
          notesByClass[noteClass].push(`[[${p.file.path}|${p.title}]]`);
        } else {
          notesByClass[noteClass].push(p.file.link);
        }
      });
      
      // Format grouped notes with class names as wikilinks
      let formattedNotes = "";
      for (const [className, notes] of Object.entries(notesByClass)) {
        if (notes.length > 0) {
          // Use wikilink for class name if it's not "Uncategorized"
          const classDisplay = className === "Uncategorized" 
            ? "**Uncategorized**" 
            : `**[[${className}]]**`;
          
          formattedNotes += `${classDisplay}<br>${notes.join("<br>")}<br><br>`;
        }
      }
      
      // Create an Obsidian-style internal link with the formatted date text
      const obsidianLink = `[[${note.file.path}|${formattedDate}]]`;
      
      // Get the note field or display a default message if not present
      const noteField = note.note || "—";
      
      return [obsidianLink, noteField, formattedNotes || "—"];
    })
  );
}

// Call one of the functions - uncomment the one you want to use
// daysAll(dv);
daysLastWeek(dv);