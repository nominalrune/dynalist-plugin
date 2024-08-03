import { type SecretStorage, window, commands } from 'vscode';
import { TOKEN_KEY } from '../constants';

export default async function getToken(secretStorage: SecretStorage) {
	const token = await secretStorage.get(TOKEN_KEY);
	if (!token) {
		window.showErrorMessage('API Token not set. Please save your token first.');
		const result = await commands.executeCommand('dynalist-plugin.update-token');
		return await getToken(secretStorage);
	}
	return token;
}