import type {Status} from "./MastodonApiV1Entities.ts";

interface StatusQuery {
  host: string;
  status: string;
}

interface ContextResponseJson {
  ancestors: Status[];
  descendants: Status[];
}

const DataAttributes = ['host', 'status', 'statusUrl', 'include', 'exclude', 'max',  'hideRootStatus', 'display'] as const;
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

// Should take query of the form:
// https://mastodon.social/@MildlyAggrievedScientist/110826278791052494
// So that users can just paste URLs
const urlToStatusQuery = (statusUrl: string): StatusQuery => {
 const {host, pathname} = new URL(statusUrl);
 const status = pathname.split('/')[2] ?? "";//.filter( s => s.length > 0 && !s.startsWith('@') );
 return {host, status}
}

const fetchStatusAndReplies= async (statusQuery: StatusQuery | string) => {
 const query = (typeof statusQuery === "string") ? urlToStatusQuery(statusQuery) : statusQuery; 
 const [status, context] = await Promise.all([fetchStatus(query), fetchContext(query)]);
 return [status, ...context.descendants];
}

const eventTargetToDataElement = (target: EventTarget | null, dataElement: string): string | undefined => {
  var value: string | undefined;
  while (value == null && target instanceof Element) {
    if (target instanceof HTMLElement) {
      value = target.dataset[dataElement];
      if (value != null) {
        return value;
      }
    }
    target = target.parentElement;
  }
}
export const eventTargetToResponseUrl = (target: EventTarget | null): string | undefined =>
  eventTargetToDataElement(target, "responseUrl");
export const eventTargetToRootCommentUrl = (target: EventTarget | null): string | undefined =>
  eventTargetToDataElement(target, "rootCommentUrl");

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
  const statusUrl = dataAttributes["statusUrl"];
  const {host, status} =  statusUrl != null ? urlToStatusQuery(statusUrl) : dataAttributes;

  // ensure there is at least a host and status, either from data-host/data-status or extracted from data-status-url
  if (host == null || status == null) return;

  // filter excluded responses out
  const comments = (await fetchStatusAndReplies({host, status}))
    .filter( r => !excludeSet.has(r.id) );
  
  // filter out responses that exceed length limit (though scrolling is recommended instead)
  if (!isNaN(maxResponses)) {
    for (var i = comments.length-1; i > 0 && comments.length > maxResponses; i--) {
      if (!includeSet.has(comments[i].id)) {
        comments.splice(i, 1);
      }
    }
  }

  // create a map from each comment status id to the DOM element that will hold
  // its replies
  const statusIdToElementContainingItsReplies = new Map<string, Element>();

  // create a DOM template for each response comment by cloning the root comment
  const responseTemplate = rootCommentElement.cloneNode(true) as typeof rootCommentElement;

  // remove data specified for the root comment from the template
  for (const dataAttribute of DataAttributes) {
    delete responseTemplate.dataset[dataAttribute]
  }

  // loop through all response comments to add them
  for (const comment of comments) {
    // clone the template to create the element that will hold this response
    const commentElement = status === comment.id ? rootCommentElement : responseTemplate.cloneNode(true) as typeof rootCommentElement;

    // isolate the child elements for the comments's author, content, and child replies
    const authorElement = commentElement.querySelector('[data-response-type=author], .response-author');
    const authorDisplayNameElement = commentElement.querySelector('[data-response-type=author-name], .response-author-name');
    const authorFullHandleElement = commentElement.querySelector('[data-response-type=author-handle], .response-author-handle');
    const contentElement = commentElement.querySelector('[data-response-type=content], .response-content');
    const repliesToThisResponseElement = commentElement.querySelector('[data-response-type=replies], .response-replies');
    if ((!authorElement && (!authorDisplayNameElement || !authorFullHandleElement)) || !contentElement || !repliesToThisResponseElement) return;

    // create the author content
    const {account} = comment;
    const {hostname} = new URL(account.url);

    const authorHandleNameElement = document.createElement('a');
    authorHandleNameElement.classList.add('fediverse-handle-name');
    authorHandleNameElement.setAttribute('href', account.url);
    authorHandleNameElement.setAttribute('target', '_blank');
    authorHandleNameElement.textContent = `@${account.username}`;
    
    const authorHandleHostSpan = document.createElement('span');
    authorHandleHostSpan.classList.add('fediverse-host-name');
    authorHandleHostSpan.textContent = `@${hostname}`;

    if (authorDisplayNameElement) {
      authorDisplayNameElement.textContent = comment.account.display_name;
    } else if (authorElement) {
      authorElement.textContent = `${comment.account.display_name} `;
    }
    if (authorFullHandleElement) {
        authorFullHandleElement.appendChild(authorHandleNameElement);
        authorFullHandleElement.appendChild(authorHandleHostSpan);
    } else if (authorElement) {
      authorElement.appendChild(authorHandleNameElement);
      authorElement.appendChild(authorHandleHostSpan);
    }

    // copy the content element (non-sanitized, since we're trusting the host server to sanitize it)
    // if we wanted to sanitize, we could use the [HTML Sanitizer API](https://wicg.github.io/sanitizer-api/),
    // or [DOMPurify](https://github.com/cure53/DOMPurify/) until there is full browser support for the
    // the sanitizer API.
    contentElement.innerHTML = comment.content; // NOT sanitized since I'm trusting server to do so.

    // into each element, we will copy a data attribute that allows event handlers to get the
    // response's ID and URL.
    for (const e of [authorElement, authorDisplayNameElement, authorFullHandleElement, contentElement, repliesToThisResponseElement, commentElement]) {
      if (e != null) {
        e.setAttribute('data-response-id', comment.id);
        e.setAttribute('data-response-url', comment.url ?? "");
      }
    }

    // set the mapping from this response's status ID to its reply element so that replies
    // can append themselves to the reply-chain.
    statusIdToElementContainingItsReplies.set(comment.id, repliesToThisResponseElement);
    
    if (commentElement !== rootCommentElement && comment.in_reply_to_id) {
      statusIdToElementContainingItsReplies.get(comment.in_reply_to_id)?.appendChild(commentElement);
    }
  }
}

const findCommentTemplatesAndLoadCommentsIntoDom = () => {
  const commentElements = document.querySelectorAll('[data-host][data-status], [data-status-url]');
  for (const templateElement of commentElements) {
    if (templateElement instanceof HTMLElement) {
      loadCommentsIntoDom(templateElement);
    }
  }  
}

document.addEventListener('DOMContentLoaded', findCommentTemplatesAndLoadCommentsIntoDom);
