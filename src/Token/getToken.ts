import { type SecretStorage } from 'vscode';
import { TOKEN_KEY } from '../constants';

export default async function getToken(secretStorage: SecretStorage): Promise<string | undefined> {
	return await secretStorage.get(TOKEN_KEY);
}