function daysToday(dv) {
  // Get all notes excluding system folder, and only from Notes and Synthesis folders
  const allNotes = dv.pages().where(p => 
    !p.file.path.startsWith("_system") &&
    (p.file.path.startsWith("Notes/") || p.file.path.startsWith("Synthesis/"))
  );
  
  // Get the current note (the one this query is embedded in)
  const thisNote = dv.current();
  
  // Extract date from the file name (format: YY.MM.DD)
  const filenameMatch = thisNote.file.name.match(/(\d{2})\.(\d{2})\.(\d{2})/);
  let dateObj;
  let formattedDate;
  
  if (filenameMatch) {
    // Extract year, month, and day from the filename
    const year = parseInt('20' + filenameMatch[1]); // Assuming 20xx for the year
    const month = parseInt(filenameMatch[2]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(filenameMatch[3]);
    
    // Create a Date object from the extracted components
    dateObj = new Date(year, month, day);
    
    // Get the day of the week (0-6, where 0 is Sunday)
    const dayOfWeek = dateObj.getDay();
    
    // Format the date
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];
    
    formattedDate = `${dayNames[dayOfWeek]}, ${day} ${monthNames[month]} ${year}`;
    
    // Extract the date string in YYYY-MM-DD format for comparison
    const thisNoteDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find notes created on the same day based on their filename (not creation time)
    const sameDayNotes = allNotes.where(p => {
      if (p.file.path === thisNote.file.path || p.class === "PeriodicNotes") {
        return false;
      }
      
      // Try to extract date from other filenames too
      const otherFileMatch = p.file.name.match(/(\d{2})\.(\d{2})\.(\d{2})/);
      if (otherFileMatch) {
        const otherYear = '20' + otherFileMatch[1];
        const otherMonth = String(parseInt(otherFileMatch[2])).padStart(2, '0');
        const otherDay = String(parseInt(otherFileMatch[3])).padStart(2, '0');
        const otherDate = `${otherYear}-${otherMonth}-${otherDay}`;
        return otherDate === thisNoteDate;
      }
      
      // For files without a date pattern, fall back to creation time
      return p.file.ctime && p.file.ctime.toFormat && 
             p.file.ctime.toFormat("yyyy-MM-dd") === thisNoteDate;
    });
    
    // Display a header with the formatted date
    dv.header(2, `${formattedDate}`);
    
    // Group notes by class
    const notesByClass = {};
    sameDayNotes.forEach(p => {
      const noteClass = p.class || "Uncategorized";
      if (!notesByClass[noteClass]) {
        notesByClass[noteClass] = [];
      }
      
      // Use title field if available, otherwise use the file link
      if (p.title) {
        notesByClass[noteClass].push(`[[${p.file.path}|${p.title}]]`);
      } else {
        notesByClass[noteClass].push(p.file.link);
      }
    });
    
    // Create table rows
    const tableRows = [];
    for (const [className, notes] of Object.entries(notesByClass)) {
      if (notes.length > 0) {
        // Use wikilink for class name if it's not "Uncategorized"
        const classDisplay = className === "Uncategorized" 
          ? "Uncategorized" 
          : `[[${className}]]`;
        
        tableRows.push([classDisplay, notes.join("<br>")]);
      }
    }
    
    // If there are notes, display them in a table
    if (tableRows.length > 0) {
      dv.table(["Class", "Notes created on this date"], tableRows);
    } else {
      dv.paragraph("*No other notes were created on this date.*");
    }
  } else {
    // If the file name doesn't contain a date pattern, fall back to the original behavior
    dv.paragraph("*Could not extract date from the filename. Please ensure your file follows the YY.MM.DD format.*");
  }
}

// Call the function
daysToday(dv);