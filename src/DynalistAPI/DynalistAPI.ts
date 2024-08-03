import Node from './Node';
import File from './File';
import { Change } from './Change';

export default class DynalistAPI {
	token: string = '';
	constructor(token: string) {
		this.token = token;
	}
	async fetchDocuments() {
		const response = await fetch('https://dynalist.io/api/v1/file/list', {
			method: 'POST',
			body: JSON.stringify({
				token: this.token,
			})
		}).then((response) => response.json() as Promise<ListResponse>);
		if (response._code !== 'Ok') {
			throw new Error('Failed to fetch documents:' + response._msg);
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

		// Return the tree starting from the root folder
		return buildTree(rootFileId);
	}
	async fetchDocumentContent(fileId: string) {
		const response = await fetch('https://dynalist.io/api/v1/doc/read', {
			method: 'POST',
			body: JSON.stringify({
				token: this.token,
				file_id: fileId,
			})
		}).then((response) => response.json() as Promise<DocResponse>);
		if (response._code !== 'Ok') {
			throw new Error('Failed to fetch document content' + response._msg);
		}
		return response;
	}
	async saveDocumentContetnt(fileId: string, changes: Change[]) {
		const response = await fetch('https://dynalist.io/api/v1/doc/edit', {
			method: 'POST',
			body: JSON.stringify({
				token: this.token,
				file_id: fileId,
				changes: changes,
			})
		}).then((response) => response.json() as Promise<EditResponse>);
		console.log('saveDocumentContetnt response:', response);
		if (response._code !== 'Ok') {
			throw new Error('Failed to update document content:' + response._msg);
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