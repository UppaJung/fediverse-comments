export interface StatusQuery {
	host: string;
	status: string;
}

// Should take query of the form:
// https://mastodon.social/@MildlyAggrievedScientist/110826278791052494
// So that users can just paste URLs
export const urlToStatusQuery = (statusUrl: string): StatusQuery => {
	const { host, pathname } = new URL(statusUrl);
	const status = pathname.split('/')[2] ?? ""; //.filter( s => s.length > 0 && !s.startsWith('@') );
	return { host, status };
};
