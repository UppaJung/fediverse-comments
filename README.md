# FediPosts

A Script to load a Mastodon reply stream into a webpage.

### Your HTML template

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

#### Root element
The script will search for a root comment in your webpage with either the single attribute `data-status-url` or the dual attributes
`data-host` and `data-status`.

`data-status-url` should have a URL to a status post on a server that supports the Mastodon v1 API. e.g. `data-status-url="https://mastodon.social/@MildlyAggrievedScientist/110826278791052494"`.

Or, break that down into `data-host="mastodon.social"` and `data-status="110826278791052494"`

#### Child elements

author:  `data-response-type="author"` or class `response-author`
	authorDisplayName: `data-response-type="author-name"` or class `response-author-name`
	authorFullHandle: `data-response-type="author-handle"` or class `response-author-handle`
content: `data-response-type="content"` or class `response-content`

replies: `data-response-type="replies"` or class `response-replies`
For tabbing, use css `margin-left`.