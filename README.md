# Fediverse-Comments

A Script to load and render the favourites (likes), reblogs (boosts), and reply stream from a Mastodon status (post/Toot). Pair your blogs posts with a Mastodon status update and this script to allow readers to favourite, boost, and add comments to your posts.

Load the script into a page that contains HTML with annotations that tell the script where to place any or all of the favourites list, the boost list, and the reply stream.


#### Host elements
 - `data-responses-to-url` this element is the container for a comment (status/reply) stream starting at the original post in the URL.
 - `data-reblogged-url`: the element is the container a set of avatars of users who reblogged (boosted) the original post in the URL.
 - `data-favourited-url`: the element is the container a set of avatars of users who favourited (liked) the original post in the URL.

 All of the above may be paired with a `data-exclude` attribute that supports a list of comma-separated ids of items to exclude. These can be the account id or username of the account liking, reblogging, or commenting. For responses, it can also be the status id of the response. All are case-insensitive.

A comment element with `data-responses-to-url` may also include the optional attributes:
 - `data-max`: a number representing the maximum number of posts to display. (Better to not limit the list and scroll as necessary). Note that mastodon's API has built-in limits on the number of elements it will return, anyway.
 - `data-include`: similar to `data-exclude`, but ensures items are not deleted when trimming the list to meet the `data-max` requirement.

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
	></div>
	<script src="/fediverse-comments.js"></script>
```

#### Styling

Global
- `emoji`
- `original-poster`

Comments
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
		- `comment-time`
	- `comment-replies`

Favourite/Reblog lists

- `fediverse-account`
	- `fediverse-account-avatar-link`
		- `fediverse-account-avatar`

### Acknowledgements

Borrows some structure and code for the comments elements from a [similar solution by Carl Schwan](https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/), as my original version did not have support for avatars, emoji, or [microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata) (`itemscope` & `itemprop`).

