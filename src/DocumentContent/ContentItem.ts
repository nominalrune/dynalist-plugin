import * as vscode from 'vscode';
export default class ContentItem extends vscode.TreeItem {
	constructor(public readonly content: string, public readonly id: string, note: string, hasChildren: boolean, collapsed: boolean = false, checked: boolean = false) {
		super(content, hasChildren ? (collapsed ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded) : vscode.TreeItemCollapsibleState.None);
		this.id = id;
		console.log(content,{id})
		this.tooltip = `${this.content}`;
		this.description = note;
		this.content = note;
		this.checkboxState = checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
	}
}
