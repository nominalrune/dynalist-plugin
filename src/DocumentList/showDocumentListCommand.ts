import { window, commands, type ExtensionContext } from 'vscode';
import getToken from '../Token/getToken';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import DocumentListProvider from './DocumentListProvider';
const showDocumentListCommand = (context: ExtensionContext) => commands.registerCommand('dynalist-plugin.show-document-list', async () => {
	try {
		const token = await getToken(context.secrets);
		if (!token) {
			window.showErrorMessage('API Token not set. Please save your token first.');
			return;
		}
		const api = new DynalistAPI(token);
		const tree = api.fetchDocuments();
		if (tree) {
			const provider = new DocumentListProvider(tree);
			window.registerTreeDataProvider('dynalist-document-list', provider);
			window.showInformationMessage('Document list loaded successfully.');
		}
	} catch (error) {
		window.showErrorMessage('Failed to load document list.');
	}
});
export default showDocumentListCommand;