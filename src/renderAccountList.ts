import type { Account } from "./MastodonApiV1Entities.ts";
import { urlToStatusQuery } from "./StatusQuery.ts";
import { constructElementFactory } from "./constructElement.ts";
import { fetchFavouritedBy, fetchRebloggedBy } from "./fetchFromMastodonApi.ts";


const DataAttributes = ['rebloggedUrl', 'favouritedUrl', 'exclude'] as const;
type RootDataAttribute = NonNullable<(typeof DataAttributes)[number]>;
export type RootElementDataAttributes = Partial<Record<RootDataAttribute, string>>;

export type AccountListClassNames =
	"fediverse-account" |
		"fediverse-account-avatar-link" |
			"fediverse-account-avatar"
;

const constructElement = constructElementFactory<AccountListClassNames>();

const renderAccount = (account: Account) => {
	const accountsHostName = new URL(account.url).hostname;

	const avatarSource = constructElement('source', {
		attributes: {
			"srcset": account.avatar,
			"media": "(prefers-reduced-motion: no-preference)",
		}
	});

	const avatarImg = constructElement("img", {
		classes: ["fediverse-account-avatar"], attributes: {
			src: account.avatar_static,
			alt: `@${account.username}@${accountsHostName} avatar`,
		}
	});

	const avatarPicture = constructElement("picture", {classes: ["fediverse-account-avatar"], children: [avatarSource, avatarImg] });
	const avatarAnchor = constructElement("a", {
		classes: ["fediverse-account-avatar-link"], attributes: {
			href: account.url,
			rel: "external nofollow",
			title: `@${account.username}@${accountsHostName}`,
		}, children: [avatarPicture]
	});

	return avatarAnchor;
}

export const renderAccountList = (parent: HTMLElement, accounts: Account[]) => {
	accounts.forEach( account => parent.appendChild(renderAccount(account)));
};

/**
 *
 * @param rootCommentElement
 * @returns
 *
 * Uses node.clone to create each comment, so inline event listeners on those comments (onclick="...") will be copied,
 * but event listeners added via addEventListener() will not.  One could add those after the fact by querying all
 * the comments.
 */
export const loadAccountListsIntoDom = async (listType: "reblogged" | "favourited", url: string, listContainerElement: HTMLElement) => {
	// extra data from data attributes
	const dataAttributes = ((listContainerElement as HTMLElement)?.dataset ?? {}) as RootElementDataAttributes;
	const excludeSet = new Set<string>((dataAttributes.exclude ?? "").split(',').map(e => e.trim().toLocaleLowerCase()));
	const query = urlToStatusQuery(url);
	const {host, status} = query;

	// ensure there is at least a host and status, either from data-host/data-status or extracted from data-responses-to-url
	if (host == null || status == null) return;

	// filter excluded responses out
	const accounts = (await (listType === "reblogged" ? fetchRebloggedBy(query) : fetchFavouritedBy(query)))
		.filter( a => !(excludeSet.has(a.id.toLocaleLowerCase())) || excludeSet.has(a.username.toLocaleLowerCase()));

	accounts.map( renderAccount ).forEach( account => listContainerElement.appendChild(account) );
};


export const findAccountListContainersAndLoadAccountListsIntoDom = () => {
	const rebloggedAccountListContainerElements = document.querySelectorAll('[data-reblogged-url]');
	for (const rebloggedAccountListContainerElement of rebloggedAccountListContainerElements) {
		if (rebloggedAccountListContainerElement instanceof HTMLElement) {
			const rebloggedUrl = rebloggedAccountListContainerElement.dataset["rebloggedUrl"];
			if (rebloggedUrl != null) {
				loadAccountListsIntoDom("reblogged", rebloggedUrl, rebloggedAccountListContainerElement);
			}
		}
	}
	const favouritedAccountListContainerElements = document.querySelectorAll('[data-favourited-url]');
	for (const favouritedAccountListContainerElement of favouritedAccountListContainerElements) {
		if (favouritedAccountListContainerElement instanceof HTMLElement) {
			const favouritedUrl = favouritedAccountListContainerElement.dataset["favouritedUrl"];
			if (favouritedUrl != null) {
				loadAccountListsIntoDom("favourited", favouritedUrl, favouritedAccountListContainerElement);
			}
		}
	}
}