import * as vscode from 'vscode';
import Node from './Node';
import File from './File';
import { Change } from './Change';
import getToken from '../Token/getToken';

export default class DynalistAPI {
	token: string | null = null;
	constructor(private context: vscode.ExtensionContext) { }
	private async fetch<T>(url: string, body?: object): Promise<T> {
		if (!this.token) {
			const token = await getToken(this.context.secrets);
			if (!token) {
				const action = await vscode.window.showInformationMessage('API token not set. Please input your dynalist token.', 'Input token');
				if (action === 'Input token') {
					vscode.commands.executeCommand('dynalist-plugin.update-token');
				}
				throw new Error('Token not set.');
			}
			this.token = token;
		}
		// console.log("body:",body,JSON.stringify({
		// 	token: this.token,
		// 	...body,
		// }))
		const result = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				token: this.token,
				...body,
			})
		});
		if(!result.ok){
			throw new Error(`Fetch error. ${result.statusText}`);
		}
		return await result.json() as T;
	}
	async fetchDocuments() {
		const response = await this.fetch<ListResponse>('https://dynalist.io/api/v1/file/list');
		if (response._code !== 'Ok') {
			throw new Error('Failed to fetch documents: ' + response._msg);
		}
		const files = response.files;
		const rootFileId = response.root_file_id;
		const fileMap = new Map(files.map(file => [file.id, file]));
		const buildTree = (id: string): any => {
			const node = fileMap.get(id);
			if (!node) {
				return null;
			}
			return {
				id: node.id,
				title: node.title,
				type: node.type,
				children: (node.children || []).map(buildTree).filter(child => !!child)
			};
		};
		return buildTree(rootFileId);
	}
	async fetchDocumentContent(fileId: string) {
		console.log('fetchDocumentContent, file_id:', fileId);
		const response = await this.fetch<DocResponse>('https://dynalist.io/api/v1/doc/read', {
			file_id: fileId,
		});
		if (response._code !== 'Ok') {
			console.error({response});
			throw new Error(`Failed to fetch content. ${response._msg}, document_id:${fileId}`);
		}
		return response;
	}
	async saveDocumentContetnt(fileId: string, changes: Change[]) {
		const response = await this.fetch<EditResponse>('https://dynalist.io/api/v1/doc/edit', {
			file_id: fileId,
			changes: changes,
		})
			.catch(e => {
				if (e instanceof Error) {
					throw e;
				} else { throw new Error(`Failed to save content: ${String(e)}, document_id:${fileId}`); }
			});
		console.log('saveDocumentContetnt response:', response);
		if (response._code !== 'Ok') {
			throw new Error(`Failed to save content: ${response._msg}, document_id:${fileId}`);
		}
	}
}
type CommonError = "InvalidToken" | "TooManyRequests" | "Invalid" | "LockFail";
interface ListResponse {
	"_code": "Ok" | CommonError,
	"_msg": string,
	"root_file_id": string,
	"files": File[],
}

interface DocResponse {
	"_code": "Ok" | CommonError | "Unauthorized" | "NotFound",
	"_msg": string,
	"file_id": string,
	"title": string,
	"nodes": Node[];
}

interface EditResponse {
	"_code": "Ok" | CommonError | "Unauthorized" | "NotFound" | "NodeNotFound",
	"_msg": string,
}