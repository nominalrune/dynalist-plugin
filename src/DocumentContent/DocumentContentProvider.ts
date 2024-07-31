import * as vscode from 'vscode';
import ContentItem from './ContentItem';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import getToken from '../Token/getToken';
import Node from '../DynalistAPI/Node';
export default class DocumentContentProvider implements vscode.TreeDataProvider<ContentItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ContentItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	onDidChangeCheckboxState: vscode.Event<vscode.TreeCheckboxChangeEvent<ContentItem | undefined | void>>=(e)=>{
		e()
		return;
	};
	private api: DynalistAPI | null = null;
	private content: Node[] = [];
	constructor(private context: vscode.ExtensionContext) {
		console.log('DocumentContentProvider created');
		(async () => {
			const token = await getToken(context.secrets);
			if (!token) {
				vscode.window.showErrorMessage('API Token not set. Please save your token first.');
				return;
			}
			console.log('DocumentContentProvider token:', token);
		})();
	}
	async createApi(): Promise<DynalistAPI> {
		if (this.api) {
			return this.api;
		}
		const token = await getToken(this.context.secrets);
		if (!token) {
			vscode.window.showErrorMessage('API Token not set. Please save your token first.');
			return vscode.commands.executeCommand('dynalist-plugin.save-token').then(() => {
				return this.createApi();
			});
		}
		this.api = new DynalistAPI(token);
		return this.api;
	}
	async load(documentId: string) {
		const api = await this.createApi();
		api.fetchDocumentContent(documentId).then(
			(content) => {
				console.log('DocumentContentProvider content:', content);
				this.content = content.nodes;
				this._onDidChangeTreeData.fire();
			}
		);
	}

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
						if(!childNode) {
							return new ContentItem('Error', 'error', 'Error', false, false);
						}
						return new ContentItem(childNode.content, childNode.id, childNode.note, childNode.collapsed, childNode.checked);
					})
				);
			}
			return Promise.resolve([]);
		} else {
			const rootNode = this.content.find(node=>node.id==='root');
			if (rootNode && rootNode.children) {
				return Promise.resolve(
					rootNode.children.map((childId: string) => {
						const childNode = this.content.find(n => n.id === childId);
						if(!childNode) {
							return new ContentItem('Error', 'error', 'Error', false, false);
						}
						return new ContentItem(childNode.content, childNode.id, childNode.note, childNode.collapsed, childNode.checked);
					})
				);
			}
			return Promise.resolve([]);
		}
	}
}