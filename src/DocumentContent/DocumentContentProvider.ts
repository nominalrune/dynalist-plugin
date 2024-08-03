import * as vscode from 'vscode';
import ContentItem from './ContentItem';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import getToken from '../Token/getToken';
import Node from '../DynalistAPI/Node';
import { Change } from '../DynalistAPI/Change';
export default class DocumentContentProvider implements vscode.TreeDataProvider<ContentItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ContentItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	private changes: Change[] = [];
	public fileId: string = '';
	private api: DynalistAPI | null = null;
	public content: Node[];
	private interval_id;
	constructor(private context: vscode.ExtensionContext) {
		console.log('DocumentContentProvider created');
		this.getApi();
		this.content = [];
		this.interval_id = setInterval(() => {
			if (this.changes.length > 0) {
				this.saveChanges();
			}
		}, 15000);
	}
	dispose() {
		this.saveChanges();
		clearInterval(this.interval_id);
	}
	private async getApi(): Promise<DynalistAPI> {
		if (this.api) { return this.api; }
		const token = await getToken(this.context.secrets);
		this.api = new DynalistAPI(token);
		return this.api;
	}
	async load(documentId?: string) {
		if (documentId) {
			this.fileId = documentId;
		}
		if (!this.fileId) { return; }
		const api = await this.getApi();
		api.fetchDocumentContent(this.fileId)
			.then((documentContent) => {
				console.log('document fetched.', documentContent);
				this.content = documentContent.nodes;
				this._onDidChangeTreeData.fire();
			})
			.catch(e => {
				if (!(e instanceof Error)) { return; }
				vscode.window.showErrorMessage(e.message);
			});
	}

	getTreeItem(element: ContentItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ContentItem): Thenable<ContentItem[]> {
		const node = this.content.find((node: any) => element ? (node.id === element?.id) : node.id === 'root');
		if (node && !!node.children?.length) {
			return Promise.resolve(
				node.children.map((childId: string) => {
					const childNode = this.content.find((n: any) => n.id === childId);
					if (!childNode) {
						return new ContentItem('Error', 'error', 'Error', false, false, false);
					}
					return new ContentItem(childNode.content, childNode.id, childNode.note, !!childNode.children?.length, childNode.collapsed, childNode.checked);
				})
			);
		}
		return Promise.resolve([]);
	}

	public insertNode(node: ContentItem | undefined, content: string) {
		const index = node ? this.content.findIndex(n => n.id === node.id) : 0;
		if (index === -1) { return; }
		const parent = node ? this.content.find(n => !!n.children?.includes(node.id)) : this.content.find(n => n.id === 'root');
		if (!parent) { return; }
		const tmpId = Math.random().toString(36).substring(2, 15);
		this.content = this.content.map(n => (n.id === parent.id)
			? ({ ...n, children: n.children?.toSpliced(index + 1, 0, tmpId) })
			: n).concat({
				id: tmpId,
				content,
				note: '',
				checked: false,
				collapsed: false,
				children: [],
				created: Date.now(),
				modified: Date.now(),
			});
		this.updateData({
			action: 'insert',
			parent_id: parent.id,
			index: index + 1,
			content,
		});
		console.log('inserted', this.content);
		this._onDidChangeTreeData.fire();
	}

	public editNode(node: ContentItem, content: string) {
		this.content = this.content.map(n => n.id === node.id ? ({
			...n,
			content: content,
		}) : n);
		this.updateData({
			action: 'edit',
			node_id: node.id,
			content,
		});
		this._onDidChangeTreeData.fire();
	}

	public deleteNode(node: ContentItem) {
		console.log("delete", { node });
		const n = this.content.find(n => n.id === node.id);
		if (!n) { return; }
		this.content = this.content
			.filter(item => (item.id !== node.id))
			.map(item => ({ ...item, children: item.children?.filter(i => i !== node.id) }));
		this.updateData({
			action: 'delete',
			node_id: n.id
		});
		this._onDidChangeTreeData.fire();
	}
	public toogleCheck(node: ContentItem) {
		const n = this.content.find(n => n.id === node.id);
		if (!n) { return; }
		this.updateData({
			action: 'edit',
			node_id: n.id,
			checked: node.checkboxState === vscode.TreeItemCheckboxState.Checked ? true : false,
		});
	}
	public indentNode(node: ContentItem) {
		const parent = this.content.find(n => n.children?.includes(node.id));
		if (!parent || !parent.children) {
			return;
		}
		const index = parent.children.findIndex(c => c === node.id);
		if (index === -1 || index === 0) {
			return;
		}
		const previousSibling = this.content.find(n => n.id === parent.children?.[index - 1]);
		if (!previousSibling) {
			return;
		}
		this.content = this.content
			.map(n => (n.id === parent.id)
				? ({ ...n, children: n.children?.filter(c => c !== node.id) })
				: n)
			.map(n => (n.id === previousSibling.id)
				? ({ ...n, children: (n.children ?? []).concat([node.id]) })
				: n)
			;
		this.updateData({
			action: 'move',
			node_id: node.id,
			parent_id: previousSibling.id,
			index: previousSibling.children?.length ?? 0,
		});
		this._onDidChangeTreeData.fire();
	}
	public outdentNode(node: ContentItem) {
		const parent = this.content.find(n => n.children?.includes(node.id));
		if (!parent || !parent.children) {
			return;
		}
		const grandParent = this.content.find(n => n.children?.includes(parent.id));
		if (!grandParent || !grandParent.children) {
			return;
		}
		const parentIndex = grandParent.children.findIndex(c => c === parent.id);
		if (parentIndex === -1) {
			return;
		}
		this.content = this.content
			.map(n => (n.id === parent.id)
				? ({ ...n, children: n.children?.filter(c => c !== node.id) })
				: n)
			.map(n => (n.id === grandParent.id)
				? ({ ...n, children: n.children?.toSpliced(parentIndex + 1, 0, node.id) })
				: n)
			;
		this.updateData({
			action: 'move',
			node_id: node.id,
			parent_id: grandParent.id,
			index: parentIndex + 1,
		});
		this._onDidChangeTreeData.fire();
	}

	private updateData(change: Change) {
		this.changes.push(change);
		return this.changes;
	}
	public async saveChanges() {
		const api = await this.getApi();
		api.saveDocumentContetnt(this.fileId, this.changes).then(() => {
			this._onDidChangeTreeData.fire();
			this.changes = [];
		});
	}
}