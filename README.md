# FediPosts

A Script to load a Mastodon reply stream into a webpage (e.g., as a means of allowing comments on an article).

Load the script into a page that contains HTML with annotations that tell the script where to find the root Mastodon post and a template into which comments will be placed.

### Your HTML template

#### Root element: `data-status-url`
Identify the root element of the template using either the single attribute `data-status-url` or the dual attributes `data-host` and `data-status`. The `data-status-url` attribute the URL to a status post on a server that supports the Mastodon v1 API. For example:
`data-status-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494"`.

Or, break that down into `data-host="mastodon.social"` and `data-status="110826278791052494"`

#### Child elements: `author`, `content`, & `replies`
Under your root element place three child elements: one for the `author` of the post, one for the `content` of the post, and one for any `replies` to that post. The sub-elements should either have classes of `author`, `content`, and `replies` or have attribute `data-response-type` set to each of those three strings.

Within the author element you may place two sub elements for the author's display name (class `author-name` or `data-response-type="response-author-name"`, to be populated with a display name such as 'Stuart Schechter') and the fediverse handle of the user (class `author-handle` or  `data-response-type="response-author-handle"`, to be populated with a handle such as  @MildlyAggrievedScientist@mastodon.social).

Example using standard class names to identify child elements
```html
<div data-status-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494">
	<div class="response-author">
		<span class="response-author-name"></span>
		<span class="response-author-handle"></span>
	</div>
	<div class="response-content"></div>
	<div class="response-replies"></div>
</div>
<script src="/fedicomments.js"></script>
```


### Class names

 - `author`: identifies the element into which the script should place content describing the author of a post.
 - `content`: identifies the element into which the script should load the content of the post.
 - `replies`: identifies the element into which replies should be added. For left-to-right languages like english, this class should have a `margin-left` styling to shift replies to the right. A more language-agnostic approach can also be implemented via flex-boxes.
 - `author-name`: the child of the author element into which to place the display name of the author. If not set, the script will add a child element to the `author` element to hold the author's display name.
 - `author-handle`: the child of the author element into which to place the fediverse handle (@name@host) of the author. If not set, the script will insert an child of the `author` element to hold the author's handle.
 - `fediverse-handle-name`: the script will add this class to the user name of a fediverse handle of the author of a post. For @MildlyAggrievedScientist@Mastodon.social, this class will be added to the element containing the @MildlyAggrievedScientist (currently implemented as an A element linking to the user's fediverse account.)
 - `fediverse-host-name`: the script will add to the host name of a fediverse handle of the author of a post. For @MildlyAggrievedScientist@Mastodon.social, this class will be added to the element containing the @Mastodon.social (currently implemented as an span element)

### Data-response-types
If you have reason not to use the above class names, you can identify them to the script using the `data-response-type` attribute and set it to the class name. For example, instead of using the class `author`, you can set `data-response-typ='author'`.


Example using the `data-response-type` attribute to identify child elements
```html
<div class="response"
	data-status-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494">
	<div data-response-type="author">
		<span data-response-type="author-name"></span>
		<span data-response-type="author-handle"></span>
	</div>
	<div data-response-type="content"></div>
	<div data-response-type="replies"></div>
</div>
<script src="/fedicomments.js"></script>
```
