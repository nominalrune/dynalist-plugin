import { commands,  window, type ExtensionContext } from 'vscode';
import { TOKEN_KEY } from '../constants';
const saveTokenCommand = (context: ExtensionContext) => {
	const saveCommand = commands.registerCommand('dynalist-plugin.save-token', () => store(context));
	const updateCommand = commands.registerCommand('dynalist-plugin.update-token', () => store(context));
	const deleteCommand = commands.registerCommand('dynalist-plugin.delete-token', () => destroy(context));
	context.subscriptions.push(saveCommand, updateCommand, deleteCommand);
};

async function store(context: ExtensionContext) {
	const token = await window.showInputBox({
		prompt: 'Enter your Dynalist API Token',
		ignoreFocusOut: true,
		password: true,
	});
	if (token) {
		try {
			await context.secrets.store(TOKEN_KEY, token);
			window.showInformationMessage('Token saved successfully.');
		} catch (error) {
			window.showErrorMessage('Failed to save token.');
		}
	}
	return;
}
function destroy(context: ExtensionContext) {
	context.secrets.delete(TOKEN_KEY);
}

export default saveTokenCommand;