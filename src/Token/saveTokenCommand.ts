import { commands, window, type ExtensionContext } from 'vscode';
import storeToken from './storeToken';
const saveTokenCommand = (context: ExtensionContext) => {
	const command = commands.registerCommand('dynalist-plugin.save-token', async () => {
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
	context.subscriptions.push(command);
};

export default saveTokenCommand;