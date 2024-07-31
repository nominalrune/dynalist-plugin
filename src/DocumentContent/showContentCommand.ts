import { window, commands, type ExtensionContext } from 'vscode';
import DocumentContentProvider from './DocumentContentProvider';
const showContentCommand = (context: ExtensionContext) => {1
	try {
		const provider = new DocumentContentProvider(context);
		const dp = window.registerTreeDataProvider('dynalist-document-content', provider);
		const c = commands.registerCommand('dynalist-plugin.show-content', (documentId: string) => {
			provider.load(documentId);
		});
		context.subscriptions.push(dp, c);
	} catch (error) {
		window.showErrorMessage('Failed to register the `dynalist-plugin.show-content` command.');
	}
};
export default showContentCommand;