async function scopeORTags(tp) {
  const dv = app.plugins.plugins.dataview.api;
  const allTags = Object.entries(app.metadataCache.getTags())
      .sort((a, b) => a[0].localeCompare(b[0])); // Sorted alphabetically
  
  const selectedTags = new Set();
  
  // Create choices array with selection status
  function createChoices() {
      return allTags.map(tag => ({
          name: `${selectedTags.has(tag[0]) ? '✓' : ' '} ${tag[0]} (${tag[1]})`,
          value: tag[0]
      }));
  }

  let isSelecting = true;
  while (isSelecting) {
      const choices = createChoices();
      const selected = await tp.system.suggester(
          choices.map(c => c.name),
          choices.map(c => c.value),
          false,
          `Select tags (${selectedTags.size} selected) - ESC when done`
      );

      if (selected === null) {
          isSelecting = false;
      } else {
          if (selectedTags.has(selected)) {
              selectedTags.delete(selected);
          } else {
              selectedTags.add(selected);
          }
      }
  }

  const selectedArray = Array.from(selectedTags);

  // Return an object with different format options
  return {
      // For dataview query - each tag gets its own contains() check
      queryTags: selectedArray
          .map(tag => `contains(file.tags, "${tag}")`)
          .join(" or "),
      // For display list
      showTags: selectedArray.map(tag => `## ${tag}`).join("\n"),
      // Raw array of selected tags
      selectedTags: selectedArray
  };
}

module.exports = scopeORTags;