import { window, commands, type ExtensionContext } from 'vscode';
import getToken from '../Token/getToken';
import DynalistAPI from '../DynalistAPI/DynalistAPI';
import DocumentListProvider from './DocumentListProvider';
const showDocumentListCommand = (context: ExtensionContext) => {
	try {
		const provider = new DocumentListProvider(context);
		const r = window.registerTreeDataProvider('dynalist-document-list', provider);
		const b = commands.registerCommand('dynalist-plugin.show-document-list', () => provider.reload());
		context.subscriptions.push(r, b);
	} catch (error) {
		window.showErrorMessage('Failed to load document list.');
	}
};
export default showDocumentListCommand;