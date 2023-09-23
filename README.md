# Fediverse-Comments

A Script to load and render the favourites (likes), reblogs (boosts), and comment (reply) stream from a Mastodon status (post/Toot). Pair your blogs posts with a Mastodon status update and this script to allow readers to favourite, boost, and add comments to your posts.

Load the script into a page that contains HTML with annotations that tell the script where to place any or all of the favourites list, the boost list, and/or the comment stream.

#### Host elements
- `data-responses-to-url` this element is the container for a comment (status/reply) stream starting at the original post in the URL.
- `data-reblogged-url`: the element is the container a set of avatars of users who reblogged (boosted) the original post in the URL.
- `data-favourited-url`: the element is the container a set of avatars of users who favourited (liked) the original post in the URL.

 All of the above may be paired with a `data-exclude` attribute that supports a list of comma-separated ids of items to exclude. These can be the account id or username of the account liking, reblogging, or commenting. For responses, it can also be the status id of the response. All are case-insensitive. If you exclude a comment, all of the comments in reply to that comment will also be excluded.

#### Example
Identify the root element of the template using the attribute `data-responses-to-url`, which should contain the URL to a post (a `status` in FediVerse speak) on a server that supports the Mastodon v1 API. For example:
```html
	<div
		class="fediverse-favourites-list"
		data-favourited-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494"
	></div>
	<div
		class="fediverse-reblogged-list"
		data-reblogged-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494"
	></div>
	<div
		class="fediverse-comments"
		data-responses-to-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494"
		exclude="NetTroll42"
		data-hide-root-comment="true"
	></div>
	<script src="/fediverse-comments.js"></script>
```
### Comment Streams

#### Additional Parameters

A comment element with `data-responses-to-url` may also include the optional attributes:
- `hide-root-comment`: adding this attribute and setting it to any value other than "false" will hide the root comment (the status pointed to in `data-responses-to-url`) and show only the replies. This is useful if your blog post content is the same as the root comment/status, and so there's no need to present that comment a second time.
- `data-max`: a number representing the maximum number of posts to display. (Better to not limit the list and scroll as necessary). Note that mastodon's API has built-in limits on the number of elements it will return, anyway.
- `data-include`: similar to `data-exclude`, but ensures items are not deleted when trimming the list to meet the `data-max` requirement.

#### Generated HTML

Comments are generated hierarchically. Each comment has a reply block and replies to that comment will be placed in the children of the reply block. The HTML generated for a comment looks like this:

```html
<article class="fediverse-comment original-poster" id="comment-109570065394823161">
	<header class="comment-header">
		<a href="https://mastodon.social/@MildlyAggrievedScientist" class="comment-authors-avatar-link">
			<picture>
				<img class="comment-authors-avatar">
			</picture>
		</a>
		<div class="comment-author">
			<span class="comment-authors-display-name">…</span>
			<a class="comment-authors-fediverse-identity">
				<span class="at-symbol username-at-symbol">@</span>
				<span class="comment-authors-fediverse-username">…</span>
				<span class="at-symbol server-at-symbol">@</span>
				<span class="comment-authors-fediverse-server">mastodon.social</span>
			</a>
		</div>
	</header>
	<main class="comment-content"><p>…</p><p>…</p></main>
	<footer class="comment-footer">
		<span class="comment-counters">
			<a class="comment-counter-reblogs">20</a>
			<a class="comment-counter-favourites">19</a>
		</span>
		<a class="comment-link-to-original">original post</a>
		<time class="comment-time">…</time>
	</footer>
	<div class="comment-replies">…</div>
</article>
```

#### CSS Class Summary

Comments have a class structure that mirror the structure of the HTML above.
- `fediverse-comment`
	- `comment-header`
		- `comment-authors-avatar-link`
			- `comment-authors-avatar`
		- `comment-author`
			- `comment-authors-display-name`
			- `comment-authors-fediverse-identity`
				- `at-symbol`
				- `username-at-symbol`
				- `comment-authors-fediverse-username`
				- `server-at-symbol`
				- `comment-authors-fediverse-server`
	- `comment-content`
	- `comment-footer`
		- `comment-counters`
			- `comment-counter-favourites`
			- `comment-counter-reblogs`
		- `comment-link-to-original`
		- `comment-time`
	- `comment-replies`

*Importantly*, there are two additional classes that are added within the hierarchy:

- `emoji`	- This class is added to `img` elements that are used to place emoji in author's display names and comment content. Emoji appear in display names and comment content via via tags surrounded by colons (e.g. `:heart:`). You will want to style emoji to ensure they do not grow larger than the text they are part of. For example:
	```css
	.fediverse-comment .emoji {
		max-height: 1rem;
	}
	```
- `original-poster` - If the comment's author is the author of the root status, this class is added to the comment's header and footer elements. So, for example, one could change the border of the avatar's styling with a css selector that checks to see if an item is descended from a header or footer with the `.original-poster` class.
	```css
	.comment-header.original-poster .comment-authors-avatar {
		border-width: 2px;
	}
	```


### Favourite/Reblog lists

#### Generated HTML structure
```html
<a class="fediverse-account-avatar-link">
	<picture class="fediverse-account-avatar">
		<img class="fediverse-account-avatar">
	</picture>
</a>
```

##### Class summary
	- `fediverse-account-avatar-link`
		- `fediverse-account-avatar`


### Acknowledgements

This solution borrows some structure and code for the comments elements from a [similar solution by Carl Schwan](https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/), as my original solution did not have support for avatars, emoji, or [microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata) (`itemscope` & `itemprop`).

