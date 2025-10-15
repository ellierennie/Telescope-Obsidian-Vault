/*
 * Enhanced Task Management Script for Obsidian
 * 
 * This script provides various task management functionalities within Obsidian:
 * - Inserting new tasks into the active note
 * - Toggling task attributes (someday, priority, system)
 * - Archiving completed tasks
 * 
 * Use cases:
 * - Quickly add multiple tasks to your current note
 * - Organize tasks by priority or future planning (someday)
 * - Keep your task lists clean by archiving completed tasks
 * 
 * To use: Call this script from a Templater template using:
 * <%*
 * const tasks = new tp.user.TemplaterTasks()
 * return await tasks.openMenu()
 * %>
 */

class tasks {
  constructor() {
    this.tp = app.plugins.plugins['templater-obsidian'].templater.current_functions_object;
    
    // Configurable parameters
    this.COMPLETED_TASKS_NOTE = 'Logs/_Tasks/Completed 🗄️.md';
    this.DATE_FORMAT = 'YY.MM.DD';
    this.COMPLETION_DATE_FORMAT = 'YY.MM.DD';
  }

  async openMenu() {
    const options = [
      { label: 'Insert task(s)', value: 'insert' },
      { label: 'Insert waiting on task', value: 'waiting' },
      { label: 'Toggle Matthew', value: 'Matthew' },
      { label: 'Toggle priority 🔼', value: 'priority' },
      { label: 'Toggle system 🗄️', value: 'system' },
      { label: 'Archive/Remove completed tasks', value: 'archive' }
    ];

    const chosen = await this.tp.system.suggester(options.map(x => x.label), options);
    if (chosen) {
      switch (chosen.value) {
        case 'insert': return this.insertNewTask();
        case 'waiting': return this.insertNewTask({ type: 'waiting-on' });
        case 'Matthew': return this.toggleMatthew();
        case 'priority': return this.togglePriority();
        case 'system': return this.toggleSystem();
        case 'archive': return this.removeCompletedTasks();
      }
    }
  }

  async insertNewTask(params) {
    const activeView = app.workspace.activeLeaf.view;
    if (!activeView || !activeView.editor) return '';

    let content = '';
    const currentDate = moment().format(this.DATE_FORMAT);

    // Task entry loop
    let isAddingTasks = true;
    while (isAddingTasks) {
      const task = await this.tp.system.prompt("Enter tasks (ESC to end)");
      if (task) {
        let taskContent = `- [ ] ${task} -- [[${currentDate}]]`;
        if (params && params.type === 'waiting-on') {
          taskContent = `- [ ] ${task} #waiting-on -- [[${currentDate}]]`;
        }
        content += taskContent + '\n';
      } else {
        isAddingTasks = false;
      }
    }

    if (content) {
      const currentContent = activeView.editor.getValue();
      const cursorPosition = activeView.editor.getCursor();
      
      // Insert the new content at the cursor position
      const beforeCursor = currentContent.slice(0, activeView.editor.posToOffset(cursorPosition));
      const afterCursor = currentContent.slice(activeView.editor.posToOffset(cursorPosition));
      
      const newContent = beforeCursor + (beforeCursor.endsWith('\n') ? '' : '\n') + content + (afterCursor.startsWith('\n') ? '' : '\n') + afterCursor;
      
      activeView.editor.setValue(newContent);
      
      // Move the cursor to the end of the inserted content
      const newCursorPosition = activeView.editor.offsetToPos(beforeCursor.length + content.length);
      activeView.editor.setCursor(newCursorPosition);
    }

    return '';
  }

  toggleMatthew() {
    return this.toggleIndicator('Matthew');
  }

  togglePriority() {
    return this.toggleIndicator('🔼');
  }

  toggleSystem() {
    return this.toggleIndicator('🗄️');
  }

  toggleIndicator(indicator) {
    const activeView = app.workspace.activeLeaf.view;
    if (!activeView || !activeView.editor) return '';

    const cursor = activeView.editor.getCursor();
    const line = activeView.editor.getLine(cursor.line);

    if (!this.isLineATask(line)) return '';

    const indicatorWithWhitespacePattern = new RegExp(` *${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} *`, 'g');

    let newLine;
    if (line.match(indicator)) {
      newLine = line.replace(indicatorWithWhitespacePattern, ' ').trim();
    } else {
      newLine = `${line} ${indicator}`;
    }

    activeView.editor.setLine(cursor.line, newLine);
    return '';
  }

  async removeCompletedTasks() {
    const currentFile = this.tp.file.find_tfile(this.tp.file.path(true));
    if (!currentFile || currentFile.path === this.COMPLETED_TASKS_NOTE) return '';

    const currentNoteContents = await this.tp.file.content;
    const taskRegex = /(?<=(^|\n))[ \t]*- \[x\].*?(\n|$)/sg;
    const completedTasks = currentNoteContents.match(taskRegex);

    if (!completedTasks) return '';

    const completedTasksFile = this.tp.file.find_tfile(this.COMPLETED_TASKS_NOTE);
    if (!completedTasksFile) return '';

    let completedNoteContent = await app.vault.read(completedTasksFile);
    completedNoteContent += completedTasks
      .map(task => {
        task = task.trimEnd();
        if (!task.match(/✅\s?\d{4}-\d{2}-\d{2}/)) {
          task += ' ✅' + moment().format(this.COMPLETION_DATE_FORMAT);
        }
        return task + '\n';
      })
      .join('');

    await app.vault.modify(completedTasksFile, completedNoteContent);

    const newContent = currentNoteContents.replace(taskRegex, '');
    await app.vault.modify(currentFile, newContent);

    return '';
  }

  isLineATask(line) {
    const taskLinePattern = /^[ \t]*- \[[ x]\]/;
    return line.match(taskLinePattern) !== null;
  }
}

module.exports = tasks;