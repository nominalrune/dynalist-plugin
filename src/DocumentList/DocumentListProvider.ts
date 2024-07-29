import * as vscode from 'vscode';
import DocumentItem from './DocumentItem';

export default class DynalistDocumentProvider implements vscode.TreeDataProvider<DocumentItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DocumentItem | undefined | void> = new vscode.EventEmitter<DocumentItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private documentTree: any) { }

	getTreeItem(element: DocumentItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DocumentItem): Thenable<DocumentItem[]> {
		if (element) {
			// Return the children of the given element
			return Promise.resolve(element.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		} else {
			// Return the top-level nodes (the root folder in this case)
			return Promise.resolve(this.documentTree.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		}
	}
}