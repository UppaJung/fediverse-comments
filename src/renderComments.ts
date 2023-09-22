import type { Account, Status } from "./MastodonApiV1Entities.ts";
import { constructElementFactory } from "./constructElement.ts";
import { emojifyHtml } from "./emojifyHtml.ts";
import { friendlyTimeEn } from "./friendlyTime.ts";

export type CommentClassNames =
	"emoji" |
	"original-poster" |
	"fediverse-comment" |
		"comment-header" |
			"comment-authors-avatar-link" |
				"comment-authors-avatar" |
			"comment-author" |
				"comment-authors-display-name" |
				"comment-authors-fediverse-identity" |
					"at-symbol" |
					"username-at-symbol" |
					"comment-authors-fediverse-username" |
					"server-at-symbol" |
					"comment-authors-fediverse-server" |
		"comment-content" |
		"comment-footer" |
			"comment-counters" |
				"comment-counter-favorites" |
				"comment-counter-reblogs" |
			"comment-time" |
		"comment-replies"
;
const constructElement = constructElementFactory<CommentClassNames>();

export const renderComments = (comments: Status[], originalPosterAccount: Account) => {
	const topLevelCommentsElements: HTMLElement[] = [];
	const statusIdToRepliesElement = new Map<string, HTMLElement>();
	for (const comment of comments) {
		const isOriginalPoster = comment.account.id === originalPosterAccount.id;
		const commentAuthorsFediverseHost = new URL(comment.account.url).hostname;

		const avatarSource = constructElement('source', {
			attributes: {
				"srcset": comment.account.avatar,
				"media": "(prefers-reduced-motion: no-preference)",
			}
		});

		const avatarImg = constructElement("img", {
			classes: ["comment-authors-avatar"], attributes: {
				src: comment.account.avatar_static,
				alt: `@${comment.account.username}@${commentAuthorsFediverseHost} avatar`,
			}
		});

		const avatarPicture = constructElement("picture", { children: [avatarSource, avatarImg] });
		const avatarLink = constructElement("a", {
			classes: ["comment-authors-avatar-link", ...(isOriginalPoster ? ["original-poster"] as const : [])], attributes: {
				href: comment.account.url,
				rel: "external nofollow",
				title: `view profile at @${comment.account.username}@${commentAuthorsFediverseHost}`,
			}, children: [avatarPicture]
		});

		const usernameAtElement = constructElement("span", {
			classes: ["at-symbol", "username-at-symbol"],
			textContent: `@`
		});
		const serverAtElement = constructElement("span", {
			classes: ["at-symbol", "server-at-symbol"],
			textContent: `@`
		});
		const usernameElement = constructElement("span", {
			classes: ["comment-authors-fediverse-username"],
			textContent: comment.account.username
		});
		const serverElement = constructElement("span", {
			classes: ["comment-authors-fediverse-server"],
			textContent: commentAuthorsFediverseHost
		});

		const displayNameElement = constructElement("span", {
			classes: ["comment-authors-display-name"], innerHTML: emojifyHtml(comment.account.display_name, comment.account.emojis), attributes: {
				itemprop: "author",
				itemtype: "http://schema.org/Person",
			}
		});

		const fediverseIdentityElement = constructElement("a", {
			classes: ["comment-authors-fediverse-identity", ...(isOriginalPoster ? ["original-poster"] as const : [])],
			attributes: {
				href: comment.account.url,
				title: `@${comment.account.username}@${commentAuthorsFediverseHost}`,
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

		const headerElement = constructElement("header", { classes: ["comment-header"], children: [avatarLink, authorElement] });

		const originalStatusLink = constructElement("a", {
			textContent: "original post",
			attributes: {
				href: comment.url ?? "",
				itemprop: "url",
				title: `view at ${commentAuthorsFediverseHost}`,
				rel: "external nofollow",
			}
		});


		// copy the content element (non-sanitized, since we're trusting the host server to sanitize it)
		// if we wanted to sanitize, we could use the [HTML Sanitizer API](https://wicg.github.io/sanitizer-api/),
		// or [DOMPurify](https://github.com/cure53/DOMPurify/) until there is full browser support for the
		// the sanitizer API.
		const mainContentElement = constructElement("main", {
			classes: ["comment-content"], innerHTML: emojifyHtml(comment.content, comment.emojis), attributes: {
				itemprop: "text",
			}
		});

		const timestamp = constructElement("time", {
			classes: ["comment-time"],
			attributes: { dateTime: comment.created_at },
			textContent: new Date(comment.created_at).toLocaleString('en-US', { dateStyle: "long", timeStyle: "short" })
		});
		friendlyTimeEn(new Date(comment.created_at), (friendlyTimeStr) => {
			timestamp.textContent = friendlyTimeStr;
		});

		const counters = constructElement("span", {
			classes: ["comment-counters"],
			children: [
				...(comment.reblogs_count > 0 ? [
					constructElement("a", {
						classes: ["comment-counter-reblogs"],
						textContent: `${comment.reblogs_count}`,
						attributes: {
							href: `${comment.url}/reblogs`,
							title: `Reblogs reported by ${commentAuthorsFediverseHost}`,
						}
					})
				] : []),
				...(comment.favourites_count > 0 ? [
					constructElement("a", {
						classes: ["comment-counter-favorites"],
						textContent: `${comment.favourites_count}`,
						attributes: {
							href: `${comment.url}/favourites`,
							title: `Favorites reported by ${commentAuthorsFediverseHost}`,
						}
					})
				] : [])
			],
		});

		const footerElement = constructElement("footer", {
			classes: ["comment-footer"],
			children: [
				counters,
				originalStatusLink,
				timestamp
			],
		});

		const repliesContainer = constructElement("div", { classes: ["comment-replies"] });
		statusIdToRepliesElement.set(comment.id, repliesContainer);

		const commentElement = constructElement("article", {
			id: `comment-${comment.id}`,
			classes: ["fediverse-comment", ...(isOriginalPoster ? ["original-poster"] as const : [])],
			attributes: {
				itemprop: "comment",
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
};
