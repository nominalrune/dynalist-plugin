import { window, commands, type ExtensionContext } from 'vscode';
import DocumentListProvider from './DocumentListProvider';
const showDocumentListCommand = (context: ExtensionContext) => {
	const provider = new DocumentListProvider(context);
	const treeView = window.registerTreeDataProvider('dynalist-document-list', provider);
	const showDocumentCommand = commands.registerCommand('dynalist-plugin.show-document-list', () => provider.reload());
	context.subscriptions.push(treeView, showDocumentCommand);
};
export default showDocumentListCommand;