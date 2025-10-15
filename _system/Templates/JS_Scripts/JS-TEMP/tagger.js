/*
 * Enhanced Tag Management Script for Obsidian
 * 
 * This script provides various tag management functionalities within Obsidian:
 * - Searches existing tags while offering the ability to create new tags
 * - Inserting tags into the active note in the 'tags' metadata field
 * - Inserting tags at the cursor location
 * - Archiving completed tasks
 * 
 * Use cases:
 * - Quickly add multiple tags to your current note or writing position
 * 
 * To use: Call this script from a Templater template using:
 * <%*
 * const tags = new tp.user.tagger()
 * return await tasks.openMenu()
 * %>
 */

class Tagger {
    constructor(params = {}) {
      this.tp = app.plugins.plugins['templater-obsidian'].templater.current_functions_object;
      this.dv = app.plugins.plugins.dataview.api;
      
      this.folder = params.folder || '';
      this.class = params.class || '';
      this.type = params.type || '';
      this.category = params.category || '';
    }
  
    async openMenu() {
      const options = [
        { label: 'Insert tags', value: 'insert' },
        { label: 'Create new tag', value: 'create' }
      ];
  
      const chosen = await this.tp.system.suggester(options.map(x => x.label), options);
      if (chosen) {
        switch (chosen.value) {
          case 'insert': return this.insertTags();
          case 'create': return this.createNewTag();
        }
      }
    }
  
    async insertTags() {
      const tags = await this.getTags();
      let selectedTags = [];
      
      while (true) {
        const tag = await this.tp.system.suggester(
          (t) => t.replace('#', ''), 
          ['<New Tag>', ...tags], 
          false, 
          "Select a tag (or ESC to finish)"
        );
        
        if (tag === null) break;
        if (tag === '<New Tag>') {
          const newTag = await this.createNewTag();
          if (newTag) selectedTags.push(newTag);
        } else {
          selectedTags.push(tag);
        }
      }
  
      if (selectedTags.length > 0) {
        const activeView = app.workspace.activeLeaf.view;
        if (activeView && activeView.editor) {
          const cursor = activeView.editor.getCursor();
          activeView.editor.replaceRange(selectedTags.join(' '), cursor);
        }
      }
  
      return '';
    }
  
    async createNewTag() {
      const newTag = await this.tp.system.prompt("Enter new tag (without #):");
      return newTag ? `#${newTag}` : null;
    }
  
    async getTags() {
      let pages = this.dv.pages();
      
      if (this.folder) pages = pages.where(p => p.file.path.startsWith(this.folder));
      if (this.class) pages = pages.where(p => p.class === this.class);
      if (this.type) pages = pages.where(p => p.type === this.type);
      if (this.category) pages = pages.where(p => p.category === this.category);
  
      const tags = pages.flatMap(p => p.file.tags).distinct().array();
      return tags;
    }
  }
  
  module.exports = Tagger;