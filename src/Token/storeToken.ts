import { type SecretStorage } from "vscode";
import { TOKEN_KEY } from '../constants';

export default async function storeToken(secretStorage: SecretStorage, token: string): Promise<void> {
	await secretStorage.store(TOKEN_KEY, token);
	return;
}

