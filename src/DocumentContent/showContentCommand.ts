import { window, commands, type ExtensionContext } from 'vscode';
import getToken from '../Token/getToken';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import DocumentContentProvider from './DocumentContentProvider';
const showContentCommand = (context: ExtensionContext) => commands.registerCommand('dynalist-plugin.show-content', async (documentId: string) => {
	try {
		const token = await getToken(context.secrets);
		if (!token) {
			window.showErrorMessage('API Token not set. Please save your token first.');
			return;
		}
		const api = new DynalistAPI(token);
		const documentContent = await api.fetchDocumentContent(documentId);
			const provider = new DocumentContentProvider(documentContent);
			window.registerTreeDataProvider('dynalist-document-content', provider);
			window.showInformationMessage('Document content loaded successfully.');
	} catch (error) {
		window.showErrorMessage('Failed to load document content.');
	}
});
export default showContentCommand;