
async function scopeORTags(tp) {
  const dv = app.plugins.plugins.dataview.api;
  const allTags = Object.entries(app.metadataCache.getTags())
    .sort((a, b) => a[0].localeCompare(b[0])); // Sorted alphabetically

  let selectMore = true;
  let selectedTags = [];

  while (selectMore) {
    let choice = await tp.system.suggester(
      (t) => t[0] + "(" + t[1] + ")",
      allTags,
      false,
      "[Select tags - hit ESC when finished] - " + selectedTags.join(", ")
    );

    if (!choice) {
      selectMore = false;
    } else {
      selectedTags.push(choice[0]);
    }
  }

  // Join the selected tags with ' OR '
  return selectedTags.join(" OR ");
}

module.exports = scopeORTags;