const notes = dv.pages().where(p => p.class);

// Group notes by class
const groupedNotes = notes.groupBy(p => p.class);

for (let group of groupedNotes) {
    dv.header(2, group.key); // Display class name as header
    dv.list(group.rows.map(p => p.file.name)); // List notes under each class
}
