function displayPeopleAuthors(dv) {
    console.log("Script starting...");

    // Get all people who are sources
    const peoplePages = dv.pages()
        .where(p => p.class === "People" && p.category === "Sources");
    
    console.log(`Found ${peoplePages.length} matching pages`);

    // Generate table header
    let output = `| Author | Authored Sources |\n`;
    output += `| --- | --- |\n`;

    // Add each matching page and its mentions to the table
    peoplePages.forEach(page => {
        // Find all pages that mention this author
        const mentioningPages = dv.pages(`[[${page.file.name}]]`)
            .where(p => p.class === "Sources");

        console.log(`Found ${mentioningPages.length} mentions for ${page.file.name}`);

        const mentionLinks = mentioningPages.length > 0 
            ? mentioningPages.map(p => `[[${p.file.name}\\|${p.title}]]`).join("<br>")
            : "-";

        output += `| [[${page.file.name}]] | ${mentionLinks} |\n`;
    });

    // Display the output
    dv.paragraph(output);
}

// Execute
displayPeopleAuthors(dv);