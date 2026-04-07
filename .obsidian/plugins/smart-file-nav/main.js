var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
for (var name in all)
__defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
if (from && typeof from === "object" || typeof from === "function") {
for (let key of __getOwnPropNames(from))
if (!__hasOwnProp.call(to, key) && key !== except)
__defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
}
return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var main_exports = {};
__export(main_exports, {
SmartFileNavPlugin: () => SmartFileNavPlugin,
apply_styles_to_all: () => apply_styles_to_all,
apply_styles_to_paths: () => apply_styles_to_paths,
default: () => main_default,
evaluate_rule: () => evaluate_rule,
generate_css_for_rule: () => generate_css_for_rule,
remove_smart_styles: () => remove_smart_styles
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
function get_or_create_style_el(style_id) {
let style_el = document.querySelector(`style[data-style-id="${style_id}"]`);
if (!style_el) {
style_el = document.createElement("style");
style_el.setAttribute("data-style-id", style_id);
style_el.setAttribute("type", "text/css");
document.head.appendChild(style_el);
}
return style_el;
}
function apply_styles_to_all(styles_css_str, style_id = "smart-styles") {
const style_el = get_or_create_style_el(style_id);
style_el.appendChild(document.createTextNode(`
${styles_css_str}
`));
}
function apply_styles_to_paths(paths, styles_css_str, style_id = "smart-styles") {
if (!paths || paths.length === 0)
return;
const style_el = get_or_create_style_el(style_id);
const selectors = paths.map((path) => `.tree-item.nav-file:has(.tree-item-self[data-path="${CSS.escape(path)}"])`).join(", ");
const final_css = `${selectors} {
${styles_css_str}
}
`;
style_el.appendChild(document.createTextNode(final_css));
}
function remove_smart_styles(style_id = "smart-styles") {
const style_el = document.querySelector(`style[data-style-id="${style_id}"]`);
style_el?.remove();
}
function evaluate_rule(source, rule) {
const rule_folders = rule.folders || ["all"];
if (!rule_folders.includes("all")) {
const path_matches_some_folder = rule_folders.some((folder_path) => {
if (!folder_path.trim())
return false;
return source.key.startsWith(folder_path + "/") || source.key === folder_path;
});
if (!path_matches_some_folder)
return false;
}
if (rule.scope_type === "all")
return true;
const { property, required_value, comparison } = rule;
const source_value = source.metadata?.[property];
switch (comparison) {
case "not_exists":
return !(property in (source.metadata || {}));
case "exists":
return property in (source.metadata || {});
case "greater_than":
if (source_value === void 0)
return false;
return parseFloat(source_value) > parseFloat(required_value);
case "less_than":
if (source_value === void 0)
return false;
return parseFloat(source_value) < parseFloat(required_value);
case "contains":
if (source_value === void 0)
return false;
if (Array.isArray(source_value))
return source_value.includes(required_value);
return String(source_value).includes(required_value);
case "equals":
default:
if (source_value === void 0)
return false;
return source_value == required_value;
}
}
function generate_css_for_rule(rule) {
const { style_preset, style_custom } = rule;
switch (style_preset) {
case "hide":
return "display: none !important;";
case "show":
return "display: block !important;";
case "bold":
return "font-weight: bold;";
case "italicize":
return "font-style: italic;";
case "highlight":
return "background-color: var(--text-highlight-bg);";
case "dim":
return "opacity: 0.5;";
case "custom":
return style_custom || "";
default:
return "";
}
}
function get_all_sources(app) {
const results = { files: [], folders: [] };
const files = app.vault.getAllLoadedFiles();
for (const file of files) {
if (file instanceof import_obsidian.TFile) {
const cache = app.metadataCache.getFileCache(file);
results.files.push({
key: file.path,
metadata: cache?.frontmatter || {}
});
} else if (file instanceof import_obsidian.TFolder) {
results.folders.push({ key: file.path, metadata: {} });
}
}
return results;
}
var SmartFileNavPlugin = class extends import_obsidian.Plugin {
async onload() {
await this.load_settings();
this.addSettingTab(new SmartFileNavSettingTab(this.app, this));
this.app.workspace.onLayoutReady(this.initialize.bind(this));
}
onunload() {
remove_smart_styles();
clearInterval(this.buttons_interval);
this.remove_buttons();
}
/* ------------------------------ lifecycle ------------------------------ */
initialize() {
console.log("Loading Smart File Nav plugin...");
this.register_commands();
this.inject_buttons_at_top();
}
/* ----------------------------- commands -------------------------------- */
register_commands() {
this.addCommand({
id: "apply-styles",
name: "Apply Styles (Smart File Nav)",
callback: () => this.apply_styles()
});
this.addCommand({
id: "remove-smart-styles",
name: "Remove Smart Styles",
callback: () => {
this.show_all();
new import_obsidian.Notice("Smart styles removed.");
}
});
}
/* --------------------------- apply / remove --------------------------- */
apply_styles() {
remove_smart_styles();
const { folders, files: all_sources } = get_all_sources(this.app);
this.folders = folders;
const selected_set_name = this.settings.selected_rule_set;
const active_rules = this.settings.smart_rule_sets[selected_set_name] || [];
for (const rule of active_rules) {
const matched_paths = [];
for (const source of all_sources) {
if (evaluate_rule(source, rule))
matched_paths.push(source.key);
}
if (matched_paths.length > 0) {
const css_snippet = generate_css_for_rule(rule);
if (css_snippet.trim()) {
apply_styles_to_paths(matched_paths, css_snippet);
}
}
}
apply_styles_to_all(
".smart-file-nav-apply{display:none;}.smart-file-nav-showall{display:block !important;}"
);
new import_obsidian.Notice(`File Nav Rules applied from set: ${selected_set_name}.`);
this.app.workspace.getLeavesOfType("file-explorer")[0]?.view?.rebuildView?.();
}
show_all() {
remove_smart_styles();
}
/* ------------------------------ ui stuff ------------------------------ */
inject_buttons_at_top() {
const leaf = this.app.workspace.getLeavesOfType("file-explorer")[0];
if (!leaf)
return;
const nav_header = leaf.view?.containerEl?.querySelector(".nav-buttons-container");
if (!nav_header)
return;
nav_header.querySelectorAll(".smart-file-nav-buttons").forEach((e) => e.remove());
const wrapper = nav_header.createEl("div", { cls: "smart-file-nav-buttons" });
wrapper.createEl("button", { text: "Apply Rules", cls: "smart-file-nav-apply" }).addEventListener("click", () => this.apply_styles());
wrapper.createEl("button", { text: "Remove Rules", cls: "smart-file-nav-showall" }).addEventListener("click", () => this.show_all());
this.buttons_interval = setInterval(() => {
const hdr = this.app.workspace.getLeavesOfType("file-explorer")[0]?.view?.containerEl?.querySelector(".nav-buttons-container");
if (!hdr?.querySelector(".smart-file-nav-buttons"))
this.inject_buttons_at_top();
}, 5e3);
}
remove_buttons() {
this.app.workspace.getLeavesOfType("file-explorer")[0]?.view?.containerEl?.querySelector(".smart-file-nav-buttons")?.remove();
}
/* ----------------------------- settings ----------------------------- */
async load_settings() {
const saved = await this.loadData();
this.settings = Object.assign(
{ smart_rule_sets: {}, selected_rule_set: "Default" },
saved
);
if (Object.keys(this.settings.smart_rule_sets).length === 0) {
this.settings.smart_rule_sets.Default = [];
}
Object.values(this.settings.smart_rule_sets).forEach((rule_array) => {
rule_array.forEach((rule) => {
if (!rule.folders && rule.folder !== void 0) {
rule.folders = rule.folder === "all" ? ["all"] : [rule.folder];
delete rule.folder;
}
if (!rule.folders)
rule.folders = ["all"];
});
});
if (!this.settings.smart_rule_sets[this.settings.selected_rule_set]) {
this.settings.selected_rule_set = Object.keys(this.settings.smart_rule_sets)[0];
}
await this.saveData(this.settings);
}
async save_settings() {
await this.saveData(this.settings);
}
};
var SmartFileNavSettingTab = class extends import_obsidian.PluginSettingTab {
constructor(app, plugin) {
super(app, plugin);
this.plugin = plugin;
}
display() {
const { containerEl } = this;
containerEl.empty();
containerEl.addClass("smart-file-nav-settings");
containerEl.createEl("h2", { text: "Smart File Nav Settings" });
containerEl.createEl("p", {
text: "Manage rule sets and define rules to style or hide files."
});
new import_obsidian.Setting(containerEl).setName("Active Rule Set").setDesc("Select which rule set is active.").addDropdown((drop) => {
Object.keys(this.plugin.settings.smart_rule_sets).forEach(
(set) => drop.addOption(set, set)
);
drop.setValue(this.plugin.settings.selected_rule_set);
drop.onChange(async (v) => {
this.plugin.settings.selected_rule_set = v;
await this.plugin.save_settings();
this.display();
});
});
const actions = containerEl.createEl("div", { cls: "rule-set-actions" });
actions.style.display = "flex";
actions.style.gap = "10px";
const add_set = actions.createEl("button", { text: "Add New Set" });
add_set.onclick = async () => {
const name = prompt("Enter name for new rule set:");
if (!name)
return;
if (this.plugin.settings.smart_rule_sets[name]) {
new import_obsidian.Notice("Set already exists with that name.");
return;
}
this.plugin.settings.smart_rule_sets[name] = [];
this.plugin.settings.selected_rule_set = name;
await this.plugin.save_settings();
this.display();
};
const rename_set = actions.createEl("button", { text: "Rename Set" });
rename_set.onclick = async () => {
const old = this.plugin.settings.selected_rule_set;
const name = prompt("Enter new name for current rule set:", old);
if (!name || name === old)
return;
if (this.plugin.settings.smart_rule_sets[name]) {
new import_obsidian.Notice("A set with that name already exists.");
return;
}
this.plugin.settings.smart_rule_sets[name] = this.plugin.settings.smart_rule_sets[old];
delete this.plugin.settings.smart_rule_sets[old];
this.plugin.settings.selected_rule_set = name;
await this.plugin.save_settings();
this.display();
};
const del_set = actions.createEl("button", { text: "Delete Set" });
del_set.onclick = async () => {
const target = this.plugin.settings.selected_rule_set;
if (target === "Default") {
new import_obsidian.Notice('Cannot delete the "Default" set.');
return;
}
if (!confirm(`Really delete rule set "${target}"?`))
return;
delete this.plugin.settings.smart_rule_sets[target];
const remaining = Object.keys(this.plugin.settings.smart_rule_sets);
this.plugin.settings.selected_rule_set = remaining.length > 0 ? remaining[0] : "Default";
if (remaining.length === 0)
this.plugin.settings.smart_rule_sets.Default = [];
await this.plugin.save_settings();
this.display();
};
containerEl.createEl("hr");
const set_name = this.plugin.settings.selected_rule_set;
const active_rules = this.plugin.settings.smart_rule_sets[set_name] || [];
const { folders } = get_all_sources(this.app);
active_rules.forEach((rule, i) => {
this.render_rule(containerEl, rule, i, folders, active_rules);
});
new import_obsidian.Setting(containerEl).setName("Add Rule").addButton((btn) => {
btn.setButtonText("Add").onClick(() => {
active_rules.push({
scope_type: "frontmatter",
folders: ["all"],
property: "",
required_value: "",
comparison: "equals",
style_preset: "hide",
style_custom: ""
});
this.plugin.save_settings().then(() => this.display());
});
});
}
/**
* Render a single rule block with grouping wrapper.
* @param {HTMLElement} parent_el
* @param {object} rule
* @param {number} index
* @param {Array} vault_folders
* @param {Array} active_rules
*/
render_rule(parent_el, rule, index, vault_folders, active_rules) {
const wrapper = parent_el.createEl("div", { cls: "smart-rule-block" });
const rule_setting = new import_obsidian.Setting(wrapper).setName(`Rule #${index + 1}`).setDesc("Folder scope, property checks, and styling.");
rule_setting.addDropdown((dd) => {
dd.addOption("all", "All items").addOption("frontmatter", "Frontmatter property").setValue(rule.scope_type || "frontmatter").onChange(async (v) => {
rule.scope_type = v;
await this.plugin.save_settings();
this.display();
});
});
this.render_folders_selector(wrapper, rule, vault_folders);
if (rule.scope_type === "frontmatter") {
rule_setting.addText(
(t) => t.setPlaceholder("Property").setValue(rule.property).onChange(async (v) => {
rule.property = v.trim();
await this.plugin.save_settings();
})
);
rule_setting.addDropdown((dd) => {
dd.addOption("equals", "Equals").addOption("greater_than", "Greater than").addOption("less_than", "Less than").addOption("contains", "Contains").addOption("exists", "Exists").addOption("not_exists", "Not exists").setValue(rule.comparison || "equals").onChange(async (v) => {
rule.comparison = v;
await this.plugin.save_settings();
this.display();
});
});
if (rule.comparison !== "not_exists" && rule.comparison !== "exists") {
rule_setting.addText(
(t) => t.setPlaceholder("Required value").setValue(rule.required_value).onChange(async (v) => {
rule.required_value = v;
await this.plugin.save_settings();
})
);
}
}
rule_setting.addDropdown((dd) => {
dd.addOption("highlight", "Highlight").addOption("bold", "Bold").addOption("italicize", "Italicize").addOption("dim", "Dim").addOption("show", "Show").addOption("hide", "Hide").addOption("custom", "Custom").setValue(rule.style_preset || "hide").onChange(async (v) => {
rule.style_preset = v;
await this.plugin.save_settings();
this.display();
});
});
if (rule.style_preset === "custom") {
new import_obsidian.Setting(wrapper).setName("Custom Style").setDesc("Enter valid CSS (e.g. 'color:red;')").addTextArea(
(a) => a.setValue(rule.style_custom || "").onChange(async (v) => {
rule.style_custom = v;
await this.plugin.save_settings();
})
);
}
rule_setting.addButton(
(btn) => btn.setButtonText("Remove").onClick(async () => {
active_rules.splice(index, 1);
await this.plugin.save_settings();
this.display();
})
);
}
/**
* Render folder selector allowing multiple folder tags per rule.
* @param {HTMLElement} container_el
* @param {object} rule
* @param {Array} vault_folders
*/
render_folders_selector(container_el, rule, vault_folders) {
const setting = new import_obsidian.Setting(container_el).setName("Folders").setDesc("Select one or more folders (or 'all').");
setting.addDropdown((dd) => {
dd.addOption("", "-- add folder --");
dd.addOption("all", "all");
vault_folders.forEach((f) => dd.addOption(f.key, f.key));
dd.setValue("");
dd.onChange(async (v) => {
if (!v)
return;
if (v === "all") {
rule.folders = ["all"];
} else {
if (rule.folders.includes("all"))
rule.folders = [];
if (!rule.folders.includes(v))
rule.folders.push(v);
}
await this.plugin.save_settings();
this.display();
});
});
const tags = setting.controlEl.createEl("div", { cls: "folder-tags-container" });
rule.folders.forEach((path) => {
const tag = tags.createEl("span", { text: path, cls: "folder-tag" });
tag.createEl("button", { text: "\u2715", cls: "folder-tag-remove" }).addEventListener("click", async () => {
rule.folders = rule.folders.filter((p) => p !== path);
if (rule.folders.length === 0)
rule.folders = ["all"];
await this.plugin.save_settings();
this.display();
});
});
}
};
var main_default = SmartFileNavPlugin;
0 && (module.exports = {
SmartFileNavPlugin,
apply_styles_to_all,
apply_styles_to_paths,
evaluate_rule,
generate_css_for_rule,
remove_smart_styles
});

const smart_hash_id='bdd6183153ac0062cfb848ae5a1b6b0fe58717cb2883660a0d3430a20499f509';