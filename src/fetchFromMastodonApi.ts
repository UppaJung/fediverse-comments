import type { Account, Status } from "./MastodonApiV1Entities.ts";
import { StatusQuery, urlToStatusQuery } from "./StatusQuery.ts";

export interface ContextResponseJson {
	ancestors: Status[];
	descendants: Status[];
}


const fetchJson = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
	const response = await fetch(...args);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return (await response.json()) as T;
};
export const fetchContext = ({ host, status }: StatusQuery) => fetchJson<ContextResponseJson>(`https://${host}/api/v1/statuses/${status}/context?limit=1`, {});
export const fetchReplies = (query: StatusQuery) => fetchContext(query).then( x => x.descendants );
export const fetchStatus = async ({ host, status }: StatusQuery) => fetchJson<Status>(`https://${host}/api/v1/statuses/${status}, {});`);
export const fetchRebloggedBy = async ({ host, status }: StatusQuery) => fetchJson<Account[]>(`https://${host}/api/v1/statuses/${status}/reblogged_by`, {});
export const fetchFavouritedBy = async ({ host, status }: StatusQuery) => fetchJson<Account[]>(`https://${host}/api/v1/statuses/${status}/favourited_by`, {});
export const fetchOriginalStatusAndReplies= async (statusQuery: StatusQuery | string) => {
	const query = (typeof statusQuery === "string") ? urlToStatusQuery(statusQuery) : statusQuery; 
	const [original, replies] = await Promise.all([fetchStatus(query), fetchReplies(query)]);
	return {original, replies};
}
