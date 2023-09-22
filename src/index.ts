import type {Account, CustomEmoji, Status} from "./MastodonApiV1Entities.ts";

type ClassName = "emoji" | "content" | "avatar" | "fediverse-server" | "avatar-link" | "original-poster" |
	"display-name" | "comment-header" | "comment-footer" |
	"comment-counters" | "comment-counter-favorites" | "comment-counter-reblogs" |
	"replies" | "comment-content" | "comment-time" |
	"comment-author" |
	"fediverse-identity" | "fediverse-username" | "at-symbol" | "server-at-symbol" | "username-at-symbol"
;

interface StatusQuery {
	host: string;
	status: string;
}

interface ContextResponseJson {
	ancestors: Status[];
	descendants: Status[];
}

const friendlyTimeEn = (since: Date, onFriendlyTimeChanged: (newTime: string, originalTime: Date) => void) => {
	const msPassed = Date.now() - since.getTime();
	const setFriendlyTimeTo = (newValue: string, msUntilNextCalculation?: number) => {
		onFriendlyTimeChanged(newValue, since);
		if (msUntilNextCalculation != null && msUntilNextCalculation > 0) {
			setTimeout(() => friendlyTimeEn(since, onFriendlyTimeChanged), msUntilNextCalculation);
		}
	}
	const minuteInMs = 60000;
	const hourInMs = 60 * minuteInMs;
	const dayInMs = 24 * hourInMs;
	if (msPassed < minuteInMs) {
		setFriendlyTimeTo(`seconds ago`, minuteInMs - msPassed);
	} else if (msPassed < hourInMs) {
		const minutes = Math.floor(msPassed/minuteInMs);
		setFriendlyTimeTo(`${minutes} minute${ minutes > 1 ? 's' : ''} ago`, minuteInMs - (msPassed % minuteInMs));
	} else if (msPassed < dayInMs) {
		const hours = Math.floor(msPassed/hourInMs);
		setFriendlyTimeTo(`${hours} hour${ hours > 1 ? 's' : ''} ago`, hourInMs - (msPassed % hourInMs));
	} else if (msPassed < 14 * dayInMs) {
		const days = Math.floor(msPassed/dayInMs);
		setFriendlyTimeTo(`${days} day${ days > 1 ? 's' : ''} ago`, dayInMs - (msPassed % dayInMs));
	} else {
		setFriendlyTimeTo(since.toLocaleString('en-US', {dateStyle: "long",timeStyle: "short"}));
	}
}


const constructElement = <K extends keyof HTMLElementTagNameMap>(
	tag: K,
	{attributes = {}, classes=[], children=[], ...passThroughParameters}: {
		attributes?: {[key: string]: string}, // Partial<Record<keyof HTMLElementTagNameMap[K] | "itemprop" | "itemtype", string>>
		classes?: ClassName[],
		id?: string,
		textContent?: string,
		innerHTML?: string,
		children?: Node[],
	} = {})=> {
	const e = document.createElement<K>(tag);
	Object.entries(attributes).forEach( ([key, value]) =>
		e.setAttribute(key, value) );
	classes.forEach( c => e.classList.add(c) );
	for (const attr of ["id", "textContent", "innerHTML"] as const) {
		const value = passThroughParameters[attr];
		if (value != null) {
			e[attr] = value;
		}
	}
	children.forEach( child => e.appendChild(child) );
	return e;
} 

const emojify = (html: string, emojis: CustomEmoji[]): string => {
	let emojifiedHtml = html;
	emojis.forEach(emoji => {

		const source = constructElement("source", {attributes: {"srcset": emoji.url, "media": "(prefers-reduced-motion: no-preference)"}});

		const img = constructElement("img", {classes: ["emoji"], attributes: {
			src: emoji.static_url,
			alt: `:${ emoji.shortcode }:`,
			title: `:${ emoji.shortcode }:`,
			width: "20",
			height: "20",
		}});

		const picture = constructElement("picture", {children: [source, img]});

		emojifiedHtml = emojifiedHtml.replace(`:${ emoji.shortcode }:`, picture.outerHTML);
	});
	return emojifiedHtml;
}

const DataAttributes = ['host', 'status', 'responsesToUrl', 'include', 'exclude', 'max',  'hideRootStatus', 'display'] as const;
type RootDataAttribute = NonNullable<(typeof DataAttributes)[number]>;

type RootElementDataAttributes = Partial<Record<RootDataAttribute, string>>;

const fetchJson = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
		const response = await fetch(...args);
		if (!response.ok) {
				throw new Error(response.statusText);
		}
		return await response.json() as T
}

const fetchContext = ({host, status}: StatusQuery) =>
	fetchJson<ContextResponseJson>(`https://${host}/api/v1/statuses/${status}/context?limit=1`, {});

const fetchStatus = async ({host, status}: StatusQuery) =>
	fetchJson<Status>(`https://${host}/api/v1/statuses/${status}, {});`);

const fetchRebloggedBy = async ({host, status}: StatusQuery) =>
	fetchJson<Account[]>(`https://${host}/api/v1/statuses/:${status}/reblogged_by, {});`);

const fetchFavouritedBy = async ({host, status}: StatusQuery) =>
	fetchJson<Account[]>(`https://${host}/api/v1/statuses/:${status}/favourited_by, {});`);

// Should take query of the form:
// https://mastodon.social/@MildlyAggrievedScientist/110826278791052494
// So that users can just paste URLs
const urlToStatusQuery = (statusUrl: string): StatusQuery => {
 const {host, pathname} = new URL(statusUrl);
 const status = pathname.split('/')[2] ?? "";//.filter( s => s.length > 0 && !s.startsWith('@') );
 return {host, status}
}

const fetchOriginalStatusAndReplies= async (statusQuery: StatusQuery | string) => {
 const query = (typeof statusQuery === "string") ? urlToStatusQuery(statusQuery) : statusQuery; 
 const [original, context] = await Promise.all([fetchStatus(query), fetchContext(query)]);
 return {original, replies: context.descendants};
}


type ActionAssociatedWithAccount = "reblogged" | "favourited";
const loadAccountsIntoDom = async (rootElement: HTMLElement) => {
const [action, url]: [ActionAssociatedWithAccount, string] = rootElement.dataset['rebloggedUrl'] ?
	['reblogged', rootElement.dataset['rebloggedUrl']] :
	rootElement.dataset['favouritedUrl'] ?
		['favourited', rootElement.dataset['favouritedUrl'] ??""] :
		(() => {throw new Error("no action found")})();
	const statusQuery =  urlToStatusQuery(url);
	const accounts = await (action === "reblogged" ? fetchRebloggedBy(statusQuery) : fetchFavouritedBy(statusQuery));
	if (accounts.length == 0) {

	} else {

	}
}

const renderComments = (comments: Status[], originalPosterAccount: Account) => {
	const topLevelCommentsElements: HTMLElement[] = [];
	const statusIdToRepliesElement = new Map<string, HTMLElement>();
	for (const comment of comments) {
		const isOriginalPoster = comment.account.id === originalPosterAccount.id; 
		const fediverseHost = new URL(comment.account.url).hostname;

		const avatarSource = constructElement('source', {attributes: {
			"srcset": comment.account.avatar,
			"media": "(prefers-reduced-motion: no-preference)",
		}});

		const avatarImg = constructElement("img", {classes: ["avatar"], attributes: {
			src: comment.account.avatar_static,
			alt: `@${ comment.account.username }@${ fediverseHost } avatar`,
		}});

		const avatarPicture = constructElement("picture", {children: [avatarSource, avatarImg]});
		const avatarLink = constructElement("a", { classes: ["avatar-link", ...(isOriginalPoster ? ["original-poster"] as const : [])], attributes: {
			href: comment.account.url,
			rel: "external nofollow",
			title: `${isOriginalPoster ? 'Blog post author: ' : ''} View profile at @${ comment.account.username }@${ fediverseHost }`,
		}, children: [avatarPicture]});

		const usernameAtElement = constructElement("span", {classes: ["at-symbol", "username-at-symbol"],
			textContent: `@`
		})
		const serverAtElement = constructElement("span", {classes: ["at-symbol", "server-at-symbol"],
			textContent: `@`
		}) 
		const usernameElement = constructElement("span", {classes: ["fediverse-username"],
			textContent: comment.account.username
		})
		const serverElement = constructElement("span", {classes: ["fediverse-server"],
			textContent: new URL(comment.account.url).hostname
		})

		const displayNameElement = constructElement("span", {classes: ["display-name"], innerHTML: emojify(comment.account.display_name, comment.emojis), attributes: {
			itemprop: "author",
			itemtype: "http://schema.org/Person",
		}});

		const fediverseIdentityElement = constructElement("a", {classes: ["fediverse-identity", ...(isOriginalPoster ? ["original-poster"] as const : [])],
			attributes: {
				href: comment.account.url,
				title: `${isOriginalPoster ? 'Blog post author: ' : ''} @${ comment.account.username }@${ fediverseHost }`,
				rel: "external nofollow",
			},
			children: [
				usernameAtElement, usernameElement, serverAtElement, serverElement
			]	
		});

		const authorElement = constructElement("div", {
			classes: ["comment-author"],
			children: [displayNameElement, fediverseIdentityElement]
		});

		const headerElement = constructElement("header", {classes: ["comment-header"], children: [avatarLink, authorElement]});

		const originalStatusLink = constructElement("a", {
			textContent: "original post",
			attributes: {
				href: comment.url ?? "",
				itemprop: "url",
				title: `view at ${ fediverseHost }`,
				rel: "external nofollow",		
		}});


		// copy the content element (non-sanitized, since we're trusting the host server to sanitize it)
		// if we wanted to sanitize, we could use the [HTML Sanitizer API](https://wicg.github.io/sanitizer-api/),
		// or [DOMPurify](https://github.com/cure53/DOMPurify/) until there is full browser support for the
		// the sanitizer API.
		const mainContentElement = constructElement("main", {classes: ["content"], innerHTML: emojify(comment.content, comment.emojis), attributes: {
			itemprop: "text",
		}});


		const timestamp = constructElement("time", {
			classes: ["comment-time"],
			attributes: {dateTime: comment.created_at},
			textContent: new Date( comment.created_at ).toLocaleString('en-US', {dateStyle: "long",timeStyle: "short"})
		})
		friendlyTimeEn(new Date( comment.created_at ), (friendlyTimeStr) => {
			timestamp.textContent = friendlyTimeStr;
		});

		const counters = constructElement("span", {
			classes: ["comment-counters"],
			children: [
				...(comment.reblogs_count > 0 ? [
					constructElement("a", {classes: ["comment-counter-reblogs"],
					textContent: `${ comment.favourites_count}`, attributes: {
					href: `${ comment.url }/reblogs`,
					title: `Reblogs from ${ fediverseHost }`,	
					}})
				] : []),
				...(comment.favourites_count > 0 ? [
					constructElement("a", {classes: ["comment-counter-favorites"], textContent: `${ comment.favourites_count}`, attributes: {
						href: `${ comment.url }/favourites`,
						title: `Favorites from ${ fediverseHost }`,	
					}})
				] : [])
			],
		})

		const footerElement = constructElement("footer", {classes:["comment-footer"],
			children: [
				counters,
				originalStatusLink,
				timestamp
			],
		});


		const repliesContainer = constructElement("div", {classes: ["replies"]});
		statusIdToRepliesElement.set(comment.id, repliesContainer);

		const commentElement = constructElement("article", {
			id: `comment-${ comment.id }`,
			classes: ["comment-content", ...(isOriginalPoster ? ["original-poster"] as const : [])],
			attributes: {
				itemprop: "comment-content",
				itemtype: "http://schema.org/Comment",		
			},
			children: [headerElement, mainContentElement, footerElement, repliesContainer]
		});

		const replyBlock = comment.in_reply_to_id != null ? statusIdToRepliesElement.get(comment.in_reply_to_id) : undefined;
		if (replyBlock) {
			replyBlock.appendChild(commentElement);
		} else {
			topLevelCommentsElements.push(commentElement);
		}
	}
	return topLevelCommentsElements;
}


/**
 * 
 * @param rootCommentElement 
 * @returns 
 * 
 * Uses node.clone to create each comment, so inline event listeners on those comments (onclick="...") will be copied,
 * but event listeners added via addEventListener() will not.  One could add those after the fact by querying all
 * the comments. 
 */
const loadCommentsIntoDom = async (rootCommentElement: HTMLElement) => {
	// extra data from data attributes
	const dataAttributes = ((rootCommentElement as HTMLElement)?.dataset ?? {}) as RootElementDataAttributes;
	const includeSet = new Set<string>((dataAttributes.include ?? "").split(',').map(e => e.trim()));
	const excludeSet = new Set<string>((dataAttributes.exclude ?? "").split(',').map(e => e.trim()));
	const maxResponses = parseInt(dataAttributes.max ?? "");
	const statusUrl = dataAttributes["responsesToUrl"];
	const {host, status} =  statusUrl != null ? urlToStatusQuery(statusUrl) : dataAttributes;

	// ensure there is at least a host and status, either from data-host/data-status or extracted from data-responses-to-url
	if (host == null || status == null) return;

	// filter excluded responses out
	const {original, replies} = await fetchOriginalStatusAndReplies({host, status});

	const comments = [original, 
		...replies.filter( r => {
			if (excludeSet.has(r.id)) {
				return false;
			} else if (r.in_reply_to_id != null && excludeSet.has(r.in_reply_to_id)) {
				// descendants of excluded posts should also be excluded.
				excludeSet.add(r.id);
				return false;
			} else {
				return true;
			}
		})
	];
	
	// filter out responses that exceed length limit (though scrolling is recommended instead)
	if (!isNaN(maxResponses)) {
		for (var i = comments.length-1; i > 0 && comments.length > maxResponses; i--) {
			if (!includeSet.has(comments[i].id)) {
				comments.splice(i, 1);
			}
		}
	}

	const topLevelCommentElements = renderComments(comments, original.account);
	topLevelCommentElements.forEach( commentElement => rootCommentElement.appendChild(commentElement) );

	// // create a map from each comment status id to the DOM element that will hold
	// // its replies
	// const statusIdToElementContainingItsReplies = new Map<string, Element>();

	// // create a DOM template for each response comment by cloning the root comment
	// const responseTemplate = rootCommentElement.cloneNode(true) as typeof rootCommentElement;

	// // remove data specified for the root comment from the template
	// for (const dataAttribute of DataAttributes) {
	// 	delete responseTemplate.dataset[dataAttribute]
	// }

	// // loop through all response comments to add them
	// for (const comment of comments) {
	// 	// clone the template to create the element that will hold this response
	// 	const commentElement = status === comment.id ? rootCommentElement : responseTemplate.cloneNode(true) as typeof rootCommentElement;

	// 	// isolate the child elements for the comments's author, content, and child replies
	// 	const authorElement = commentElement.querySelector('[data-response-type=author], .response-author');
	// 	const authorDisplayNameElement = commentElement.querySelector('[data-response-type=author-name], .response-author-name');
	// 	const authorFullHandleElement = commentElement.querySelector('[data-response-type=author-handle], .response-author-handle');
	// 	const contentElement = commentElement.querySelector('[data-response-type=content], .response-content');
	// 	const repliesToThisResponseElement = commentElement.querySelector('[data-response-type=replies], .response-replies');
	// 	if ((!authorElement && (!authorDisplayNameElement || !authorFullHandleElement)) || !contentElement || !repliesToThisResponseElement) return;

	// 	// create the author content
	// 	const {account} = comment;
	// 	const {hostname} = new URL(account.url);

	// 	const authorHandleNameElement = document.createElement('a');
	// 	authorHandleNameElement.classList.add('fediverse-handle-name');
	// 	authorHandleNameElement.setAttribute('href', account.url);
	// 	authorHandleNameElement.setAttribute('target', '_blank');
	// 	authorHandleNameElement.textContent = `@${account.username}`;
		
	// 	const authorHandleHostSpan = document.createElement('span');
	// 	authorHandleHostSpan.classList.add('fediverse-host-name');
	// 	authorHandleHostSpan.textContent = `@${hostname}`;

	// 	if (authorDisplayNameElement) {
	// 		authorDisplayNameElement.textContent = comment.account.display_name;
	// 	} else if (authorElement) {
	// 		authorElement.textContent = `${comment.account.display_name} `;
	// 	}
	// 	if (authorFullHandleElement) {
	// 			authorFullHandleElement.appendChild(authorHandleNameElement);
	// 			authorFullHandleElement.appendChild(authorHandleHostSpan);
	// 	} else if (authorElement) {
	// 		authorElement.appendChild(authorHandleNameElement);
	// 		authorElement.appendChild(authorHandleHostSpan);
	// 	}

		// copy the content element (non-sanitized, since we're trusting the host server to sanitize it)
		// if we wanted to sanitize, we could use the [HTML Sanitizer API](https://wicg.github.io/sanitizer-api/),
		// or [DOMPurify](https://github.com/cure53/DOMPurify/) until there is full browser support for the
		// the sanitizer API.
		// contentElement.innerHTML = comment.content; // NOT sanitized since I'm trusting server to do so.

		// // into each element, we will copy a data attribute that allows event handlers to get the
		// // response's ID and URL.
		// for (const e of [authorElement, authorDisplayNameElement, authorFullHandleElement, contentElement, repliesToThisResponseElement, commentElement]) {
		// 	if (e != null) {
		// 		e.setAttribute('data-response-id', comment.id);
		// 		e.setAttribute('data-response-url', comment.url ?? "");
		// 	}
		// }

		// // set the mapping from this response's status ID to its reply element so that replies
		// // can append themselves to the reply-chain.
		// statusIdToElementContainingItsReplies.set(comment.id, repliesToThisResponseElement);
		
		// if (commentElement !== rootCommentElement && comment.in_reply_to_id) {
		// 	statusIdToElementContainingItsReplies.get(comment.in_reply_to_id)?.appendChild(commentElement);
		// }
	// }
}

const findCommentTemplatesAndLoadCommentsIntoDom = () => {
	const commentElements = document.querySelectorAll('[data-host][data-status], [data-responses-to-url]');
	for (const templateElement of commentElements) {
		if (templateElement instanceof HTMLElement) {
			loadCommentsIntoDom(templateElement);
		}
	}  
}

document.addEventListener('DOMContentLoaded', findCommentTemplatesAndLoadCommentsIntoDom);
