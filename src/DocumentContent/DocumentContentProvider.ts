import * as vscode from 'vscode';
import ContentItem from './ContentItem';
export default class DocumentContentProvider implements vscode.TreeDataProvider<ContentItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<ContentItem | undefined | void> = new vscode.EventEmitter<ContentItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<ContentItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private content: any) { }

	getTreeItem(element: ContentItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ContentItem): Thenable<ContentItem[]> {
		if (element) {
			const node = this.content.find((node: any) => node.id === element.id);
			if (node && node.children) {
				return Promise.resolve(
					node.children.map((childId: string) => {
						const childNode = this.content.find((n: any) => n.id === childId);
						return new ContentItem(childNode.content, childNode.id, childNode.note, childNode.collapsed);
					})
				);
			}
			return Promise.resolve([]);
		} else {
			const rootNode = this.content[0];
			if (rootNode && rootNode.children) {
				return Promise.resolve(
					rootNode.children.map((childId: string) => {
						const childNode = this.content.find((n: any) => n.id === childId);
						return new ContentItem(childNode.content, childNode.id, childNode.note, childNode.collapsed);
					})
				);
			}
			return Promise.resolve([]);
		}
	}
}