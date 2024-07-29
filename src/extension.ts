import { type ExtensionContext } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showDocumentListCommand from './DocumentList/showDocumentListCommand';
import showContentCommand from './DocumentContent/showContentCommand';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		saveTokenCommand(context),
		showDocumentListCommand(context),
		showContentCommand(context),
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }