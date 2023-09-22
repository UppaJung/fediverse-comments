import { fetchOriginalStatusAndReplies } from "./fetchFromMastodonApi.ts";
import { renderComments } from "./renderComments.ts";
import { urlToStatusQuery } from "./StatusQuery.ts";

const DataAttributes = ['host', 'status', 'responsesToUrl', 'include', 'exclude', 'max',  'hideRootComment', 'display'] as const;
type RootDataAttribute = NonNullable<(typeof DataAttributes)[number]>;
export type RootElementDataAttributes = Partial<Record<RootDataAttribute, string>>;

/**
 *
 * @param rootCommentElement
 * @returns
 *
 * Uses node.clone to create each comment, so inline event listeners on those comments (onclick="...") will be copied,
 * but event listeners added via addEventListener() will not.  One could add those after the fact by querying all
 * the comments.
 */
export const loadCommentsIntoDom = async (rootCommentElement: HTMLElement) => {
	// extra data from data attributes
	const dataAttributes = ((rootCommentElement as HTMLElement)?.dataset ?? {}) as RootElementDataAttributes;
	const hideRootComment = dataAttributes.hideRootComment != null && dataAttributes.hideRootComment !== "false";
	const includeSet = new Set<string>((dataAttributes.include ?? "").split(',').map(e => e.trim()));
	const excludeSet = new Set<string>((dataAttributes.exclude ?? "").split(',').map(e => e.trim().toLocaleLowerCase()));
	const maxResponses = parseInt(dataAttributes.max ?? "");
	const statusUrl = dataAttributes["responsesToUrl"];
	const { host, status } = statusUrl != null ? urlToStatusQuery(statusUrl) : dataAttributes;

	// ensure there is at least a host and status, either from data-host/data-status or extracted from data-responses-to-url
	if (host == null || status == null) return;

	// filter excluded responses out
	const { original, replies } = await fetchOriginalStatusAndReplies({ host, status });

	const comments = [
		...(hideRootComment ? [] : [original]),
		...replies.filter(r => {
			if (excludeSet.has(r.id.toLocaleLowerCase()) || excludeSet.has(r.account.username.toLocaleLowerCase()) || excludeSet.has(r.account.id.toLocaleLowerCase()) ) {
				return false;
			} else if (r.in_reply_to_id != null && excludeSet.has(r.in_reply_to_id)) {
				// descendants of excluded posts should also be excluded.
				excludeSet.add(r.id.toLocaleLowerCase());
				return false;
			} else {
				return true;
			}
		})
	];

	// filter out responses that exceed length limit (though scrolling is recommended instead)
	if (!isNaN(maxResponses)) {
		for (var i = comments.length - 1; i > 0 && comments.length > maxResponses; i--) {
			const c = comments[i];
			if (!(includeSet.has(c.id.toLocaleLowerCase()) || excludeSet.has(c.account.username.toLocaleLowerCase()) || excludeSet.has(c.account.id.toLocaleLowerCase()))) {
				comments.splice(i, 1);
			}
		}
	}

	const topLevelCommentElements = renderComments(comments, original.account);
	topLevelCommentElements.forEach(commentElement => rootCommentElement.appendChild(commentElement));
};

export const findCommentContainersAndLoadCommentsIntoDom = () => {
	const commentContainerElements = document.querySelectorAll('[data-host][data-status], [data-responses-to-url]');
	for (const commentContainerElement of commentContainerElements) {
		if (commentContainerElement instanceof HTMLElement) {
			loadCommentsIntoDom(commentContainerElement);
		}
	}  
}