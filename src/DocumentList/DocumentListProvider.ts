import * as vscode from 'vscode';
import DocumentItem from './DocumentItem';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import getToken from '../Token/getToken';
import File from '../DynalistAPI/File';
export default class DynalistDocumentProvider implements vscode.TreeDataProvider<DocumentItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DocumentItem | undefined | void> = new vscode.EventEmitter<DocumentItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | void> = this._onDidChangeTreeData.event;
	private documentTree: File | null = null;

	constructor(private context: vscode.ExtensionContext) {
		this.getApi()
			.then(api => api.fetchDocuments())
			.then((tree) => {
				this.documentTree = tree;
				this._onDidChangeTreeData.fire();
			})
			.catch((e) => {
				if (e instanceof Error) {
					vscode.window.showWarningMessage(e.message);
					return;
				}
			});
	}

	async getApi(): Promise<DynalistAPI> {
		return new DynalistAPI(this.context);
	}

	async reload() {
		const api = await this.getApi();
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
			return Promise.resolve(element.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		} else {
			return Promise.resolve(this.documentTree?.children?.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])) ?? []);
		}
	}
}