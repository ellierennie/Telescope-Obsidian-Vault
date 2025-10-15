function relatedNotesView(dv) {
  // Get the current note
  const currentNote = dv.current();
  
  // Set a stable container to reduce flickering
  dv.container.setAttribute("id", "related-notes-table-container");
  
  // Get all related notes from the current note's YAML
  const relatedPaths = Array.isArray(currentNote.relatedNotes) 
    ? currentNote.relatedNotes 
    : (currentNote.relatedNotes ? [currentNote.relatedNotes] : []);
  
  // Get all the related notes as page objects
  const relatedNotes = relatedPaths
    .map(path => dv.page(path))
    .filter(note => note) // Filter out any undefined notes (in case of invalid paths)
    .filter(note => note.archive !== "archived"); // Filter out archived notes
  
  // Group notes by class
  const notesByClass = {};
  relatedNotes.forEach(note => {
    const noteClass = note.class || "Uncategorized";
    if (!notesByClass[noteClass]) {
      notesByClass[noteClass] = [];
    }
    
    // Use title field if available, otherwise use the file link
    if (note.title) {
      // Create a proper link with the title as display text
      notesByClass[noteClass].push({
        link: `[[${note.file.path}|${note.title}]]`,
        description: note.note || "—",
        note: note
      });
    } else {
      notesByClass[noteClass].push({
        link: note.file.link,
        description: note.note || "—",
        note: note
      });
    }
  });
  
  // Sort classes alphabetically, with "Uncategorized" at the end
  const sortedClasses = Object.keys(notesByClass).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });
  
  // Prepare table rows for each class
  const tableRows = [];
  
  sortedClasses.forEach(className => {
    // Sort notes alphabetically by title within each class
    const sortedNotes = notesByClass[className].sort((a, b) => {
      const titleA = a.note.title || a.note.file.name;
      const titleB = b.note.title || b.note.file.name;
      return titleA.localeCompare(titleB);
    });
    
    // Add rows for each note in this class
    sortedNotes.forEach(noteObj => {
      tableRows.push([noteObj.link, noteObj.description]);
    });
    
    // Add a spacer row between classes (but only if there are more classes to come)
    if (tableRows.length > 0) {
      tableRows.push(["", ""]);
    }
  });
  
  // Remove the last empty row if it exists
  if (tableRows.length > 0 && tableRows[tableRows.length - 1][0] === "" && tableRows[tableRows.length - 1][1] === "") {
    tableRows.pop();
  }
  
  // Add CSS to help with stability
  dv.container.innerHTML += `
    <style>
      #related-notes-table-container table {
        transition: height 0.3s ease;
        opacity: 1;
      }
      .table-container {
        margin-bottom: 20px;
      }
    </style>
  `;
  
  // Always display the table, even if empty
  dv.table(["Related Note", "Description"], tableRows);
}

// Call the function directly - simpler approach to avoid potential issues
relatedNotesView(dv);