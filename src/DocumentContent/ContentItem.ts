import * as vscode from 'vscode';
export default class ContentItem extends vscode.TreeItem {
	constructor(public readonly content: string, public readonly id: string, note: string, collapsed: boolean = false, checked: boolean = false) {
		super(content, collapsed ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
		this.id = id;
		this.tooltip = `${this.content}`;
		this.description = note;
		this.content = note;
		this.checkboxState = checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
	}
}
