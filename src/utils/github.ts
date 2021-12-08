import { HttpError } from "./index";

const SELF_API = 'https://api.svelte.dev';
const GITHUB_API = 'https://github.com/login/oauth';

// Defined as Worker secrets
declare var GITHUB_CLIENT_ID: string;
declare var GITHUB_CLIENT_SECRET: string;

// Construct authorize URL location
export function authorize() {
	const addr = new URL(`${GITHUB_API}/authorize`);
	addr.searchParams.set('scope', 'read:user');
	addr.searchParams.set('client_id', GITHUB_CLIENT_ID);
	addr.searchParams.set('redirect_uri', `${SELF_API}/auth/callback`);
	return addr.href;
}

// Trade a "code" for an "access_token"
export async function access_token(code: string): Promise<GitHub.AccessToken> {
	const oauth = new URL(`${GITHUB_API}/access_token`);
	oauth.searchParams.set('code', code);
	oauth.searchParams.set('client_id', GITHUB_CLIENT_ID);
	oauth.searchParams.set('client_secret', GITHUB_CLIENT_SECRET);

	const res = await fetch(oauth.href, { method: 'POST' });
	const values = await res.formData();

	const token = values.get('access_token');
	if (token) return token as GitHub.AccessToken;
	else throw new HttpError('OAuth failed', 400);
}

export async function user(token: GitHub.AccessToken): Promise<GitHub.User> {
	const res = await fetch('https://api.github.com/user', {
		headers: {
			'User-Agent': 'svelte.dev',
			'Authorization': `token ${token}`
		}
	});

	if (res.ok) {
		return res.json() as Promise<GitHub.User>;
	} else {
		throw new HttpError('Authentication failed', 400);
	}
}

export interface Payload {
	token: GitHub.AccessToken;
	profile: GitHub.User;
}

export async function exchange(code: string): Promise<Payload> {
	const token = await access_token(code);
	const profile = await user(token);

	return { token, profile };
}
