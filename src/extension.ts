import { type ExtensionContext } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showDocumentListCommand from './DocumentList/showDocumentListCommand';
import showContentCommand from './DocumentContent/showContentCommand';

export function activate(context: ExtensionContext) {
	showDocumentListCommand(context);
	showContentCommand(context);
	saveTokenCommand(context);
}

export function deactivate() { }