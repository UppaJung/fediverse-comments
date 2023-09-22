# Fedi-Comments

A Script to load a Mastodon status (post/Toot) and it's reply stream (comments) into a webpage, so as to allow blog posts to have comments hosted on Mastodon (or any other Fediverse server supporting the MastodonV1 API).

Load the script into a page that contains HTML with annotations that tell the script where to find the root Mastodon post and a template into which comments will be placed.

### HTML template for Favourites/Reblogs

#### Root elements
 - `data-reblogged-url`
 - `data-favourited-url`

#### Child elements: `img`, `name`



### HTML template for Comments

#### Root element: `data-responses-to-url`
Identify the root element of the template using the attribute `data-responses-to-url`, which should contain the URL to a post (a `status` in FediVerse speak) on a server that supports the Mastodon v1 API. For example:
```html
	<div data-responses-to-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494">
	</div>
```

Your root element may also include the optional attributes:
 - `data-max`: a number representing the maximum number of posts to display.
 - `data-exclude`: a comma-separated list of status IDs of posts to exclude (e.g., those you found disrespectful). Responses to this response (and so on) will also be excluded. The status id is the long number associated with a post.
 - `data-include`: a comma-separated list of status IDs of responses to try to include within the limits of the maximum number of posts to display.


#### Child elements: `author`, `content`, & `replies`
Under your root element place three child elements: one for the `author` of the post, one for the `content` of the post, and one for any `replies` to that post. The sub-elements should either have classes of `author`, `content`, and `replies` or have attribute `data-response-type` set to each of those three strings.

Within the author element you may place two sub elements with classes:
 - `author-name`: to be populated with the author's display name, such as  'Stuart Schechter'. If not used, the display name will be added into the element with the `author` class.
 - `author-handle`: to be populated with the author's fediverse handle (e.g., @MildlyAggrievedScientist@mastodon.social). If not used, the handle will be added into the element with the `author` class after the display name.

Example using standard class names to identify child elements
```html
<div data-responses-to-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494">
	<div class="response-author">
		<span class="response-author-name"></span>
		<span class="response-author-handle"></span>
	</div>
	<div class="response-content"></div>
	<div class="response-replies"></div>
</div>
<script src="/fedi-comments.js"></script>
```


### Class names

 - `author`: identifies the element into which the script should place content describing the author of a post.
 - `content`: identifies the element into which the script should load the content of the post.
 - `replies`: identifies the element into which replies should be added. For left-to-right languages like english, this class should have a `margin-left` styling to shift replies to the right. A more language-agnostic approach can also be implemented via flex-boxes.
 - `author-name`: the child of the author element into which to place the display name of the author. If not set, the script will add a child element to the `author` element to hold the author's display name.
 - `author-handle`: the child of the author element into which to place the fediverse handle (@name@host) of the author. If not set, the script will insert an child of the `author` element to hold the author's handle.
 - `fediverse-handle-name`: the script will add this class to the user name of a fediverse handle of the author of a post. For @MildlyAggrievedScientist@Mastodon.social, this class will be added to the element containing the @MildlyAggrievedScientist (currently implemented as an A element linking to the user's fediverse account). The script will NOT look for elements with the class name. It will only add it.
 - `fediverse-host-name`: the script will add to the host name of a fediverse handle of the author of a post. For @MildlyAggrievedScientist@Mastodon.social, this class will be added to the element containing the @Mastodon.social (currently implemented as an span element).  The script will NOT look for elements with the class name. It will only add it.

### Specifying elements using `data-response-type`
If you have reason not to use the above class names, you can identify elements to the script using the attribute `data-response-type` set to the specified class name for that element type. For example, for the element you want to contain the author, instead of assigning the class `author`, you can set the element's attribute `data-response-typ='author'`.


So, one could create the following template using the attribute `data-response-type` attribute to identify child elements
```html
<div data-responses-to-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494">
	<div data-response-type="author">
		<span data-response-type="author-name"></span>
		<span data-response-type="author-handle"></span>
	</div>
	<div data-response-type="content"></div>
	<div data-response-type="replies"></div>
</div>
<script src="/fedi-comments.js"></script>
```
