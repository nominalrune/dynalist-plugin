import * as vscode from 'vscode';

export default class DocumentItem extends vscode.TreeItem {
	children: DocumentItem[];
	constructor(public readonly title: string, public readonly id: string, private type: string, children: any[], collapsed: boolean = false) {
		super(
			title,
			collapsed ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		);
		this.tooltip = `${this.title}`;
		this.description = '';
		this.children = children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [], child?.collapsed));
		this.contextValue = this.type;
		this.command = this.type === 'document' ? {
			command: 'dynalist-plugin.show-content',
			title: 'Show Content',
			arguments: [this.id]
		  } : undefined;
	}
}