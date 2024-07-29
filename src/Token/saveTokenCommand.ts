import { commands, window, type ExtensionContext } from 'vscode';
import storeToken from './storeToken';
const saveTokenCommand = (context: ExtensionContext) => commands.registerCommand('dynalist-plugin.show-document-list', async () => {
	const token = await window.showInputBox({
		prompt: 'Enter your Dynalist API Token',
		ignoreFocusOut: true,
		password: true,
	});
	if (token) {
		try {
			await storeToken(context.secrets, token);
			window.showInformationMessage('Token saved successfully.');
		} catch (error) {
			window.showErrorMessage('Failed to save token.');
		}
	}
	return;
});

export default saveTokenCommand;