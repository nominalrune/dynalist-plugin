import { type SecretStorage, window, commands } from 'vscode';
import { TOKEN_KEY } from '../constants';

export default async function getToken(secretStorage: SecretStorage) {
	const token = await secretStorage.get(TOKEN_KEY);
	if (!token) {
		throw new Error('API Token not set. Please save your token first.');
	}
	return token;
}