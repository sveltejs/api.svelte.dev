declare namespace GitHub {
	type AccessToken = string;

	// @see https://docs.github.com/en/rest/reference/users#get-a-user
	interface User {
		type: 'User';
		/** First Last (?) */
		name: string;
		/** fixed id */
		id: number;
		/** username */
		login: string;
		/** https://... */
		avatar_url: string;
		/** profile link */
		html_url: string;
		// ... truncated
	}
}
