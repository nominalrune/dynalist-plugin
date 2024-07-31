import * as vscode from 'vscode';
import DocumentItem from './DocumentItem';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import getToken from '../Token/getToken';

export default class DynalistDocumentProvider implements vscode.TreeDataProvider<DocumentItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DocumentItem | undefined | void> = new vscode.EventEmitter<DocumentItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | void> = (event) => {
		console.log(event);
		return this._onDidChangeTreeData.event(event);
	};
	private documentTree: any = null;

	constructor(private context: vscode.ExtensionContext) {
		console.log('DocumentListProvider created');
		(async () => {
			const token = await getToken(context.secrets);
			if (!token) {
				vscode.window.showErrorMessage('API Token not set. Please save your token first.');
				return;
			}
			console.log('DocumentListProvider token:', token);
			const api = await this.createApi();
			if (!api) { return; }
			api.fetchDocuments().then(
				(tree) => {
					console.log('DocumentListProvider tree:', tree);
					this.documentTree = tree;
					this._onDidChangeTreeData.fire();
				}
			);
		})();
	}

	async createApi(): Promise<DynalistAPI> {
		const token = await getToken(this.context.secrets);
		if (!token) {
			vscode.window.showErrorMessage('API Token not set. Please save your token first.');
			return vscode.commands.executeCommand('dynalist-plugin.save-token').then(() => {
				return this.createApi();
			});
		}
		return new DynalistAPI(token);
	}

	async reload() {
		const api = await this.createApi();
		api.fetchDocuments().then(
			(tree) => {
				this.documentTree = tree;
				this._onDidChangeTreeData.fire();
			}
		);
	}

	getTreeItem(element: DocumentItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DocumentItem): Thenable<DocumentItem[]> {
		if (element) {
			// Return the children of the given element
			return Promise.resolve(element.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		} else {
			// Return the top-level nodes (the root folder in this case)
			return Promise.resolve(this.documentTree?.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		}
	}
}