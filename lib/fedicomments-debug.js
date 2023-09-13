"use strict";
(() => {
  // src/index.ts
  var DataAttributes = ["host", "status", "statusUrl", "include", "exclude", "max", "hideRootStatus", "display"];
  var fetchJson = async (...args) => {
    const response = await fetch(...args);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  };
  var fetchContext = ({ host, status }) => fetchJson("https://".concat(host, "/api/v1/statuses/").concat(status, "/context?limit=1"), {});
  var fetchStatus = async ({ host, status }) => fetchJson("https://".concat(host, "/api/v1/statuses/").concat(status, ", {});"));
  var urlToStatusQuery = (statusUrl) => {
    var _a;
    const { host, pathname } = new URL(statusUrl);
    const status = (_a = pathname.split("/")[2]) != null ? _a : "";
    return { host, status };
  };
  var fetchStatusAndReplies = async (statusQuery) => {
    const query = typeof statusQuery === "string" ? urlToStatusQuery(statusQuery) : statusQuery;
    const [status, context] = await Promise.all([fetchStatus(query), fetchContext(query)]);
    return [status, ...context.descendants];
  };
  var eventTargetToDataElement = (target, dataElement) => {
    var value;
    while (value == null && target instanceof Element) {
      if (target instanceof HTMLElement) {
        value = target.dataset[dataElement];
        if (value != null) {
          return value;
        }
      }
      target = target.parentElement;
    }
  };
  var eventTargetToResponseUrl = (target) => eventTargetToDataElement(target, "responseUrl");
  var eventTargetToRootCommentUrl = (target) => eventTargetToDataElement(target, "rootCommentUrl");
  var loadCommentsIntoDom = async (rootCommentElement) => {
    var _a, _b, _c, _d, _e, _f;
    const dataAttributes = (_a = rootCommentElement == null ? void 0 : rootCommentElement.dataset) != null ? _a : {};
    const includeSet = new Set(((_b = dataAttributes.include) != null ? _b : "").split(",").map((e) => e.trim()));
    const excludeSet = new Set(((_c = dataAttributes.exclude) != null ? _c : "").split(",").map((e) => e.trim()));
    const maxResponses = parseInt((_d = dataAttributes.max) != null ? _d : "");
    const statusUrl = dataAttributes["statusUrl"];
    const { host, status } = statusUrl != null ? urlToStatusQuery(statusUrl) : dataAttributes;
    if (host == null || status == null)
      return;
    const comments = (await fetchStatusAndReplies({ host, status })).filter((r) => !excludeSet.has(r.id));
    if (!isNaN(maxResponses)) {
      for (var i = comments.length - 1; i > 0 && comments.length > maxResponses; i--) {
        if (!includeSet.has(comments[i].id)) {
          comments.splice(i, 1);
        }
      }
    }
    const statusIdToElementContainingItsReplies = /* @__PURE__ */ new Map();
    const responseTemplate = rootCommentElement.cloneNode(true);
    for (const dataAttribute of DataAttributes) {
      delete responseTemplate.dataset[dataAttribute];
    }
    for (const comment of comments) {
      const commentElement = status === comment.id ? rootCommentElement : responseTemplate.cloneNode(true);
      const authorElement = commentElement.querySelector("[data-response-type=author], .response-author");
      const authorDisplayNameElement = commentElement.querySelector("[data-response-type=author-name], .response-author-name");
      const authorFullHandleElement = commentElement.querySelector("[data-response-type=author-handle], .response-author-handle");
      const contentElement = commentElement.querySelector("[data-response-type=content], .response-content");
      const repliesToThisResponseElement = commentElement.querySelector("[data-response-type=replies], .response-replies");
      if (!authorElement && (!authorDisplayNameElement || !authorFullHandleElement) || !contentElement || !repliesToThisResponseElement)
        return;
      const { account } = comment;
      const { hostname } = new URL(account.url);
      const authorHandleNameElement = document.createElement("a");
      authorHandleNameElement.classList.add("fediverse-handle-name");
      authorHandleNameElement.setAttribute("href", account.url);
      authorHandleNameElement.setAttribute("target", "_blank");
      authorHandleNameElement.textContent = "@".concat(account.username);
      const authorHandleHostSpan = document.createElement("span");
      authorHandleHostSpan.classList.add("fediverse-host-name");
      authorHandleHostSpan.textContent = "@".concat(hostname);
      if (authorDisplayNameElement) {
        authorDisplayNameElement.textContent = comment.account.display_name;
      } else if (authorElement) {
        authorElement.textContent = "".concat(comment.account.display_name, " ");
      }
      if (authorFullHandleElement) {
        authorFullHandleElement.appendChild(authorHandleNameElement);
        authorFullHandleElement.appendChild(authorHandleHostSpan);
      } else if (authorElement) {
        authorElement.appendChild(authorHandleNameElement);
        authorElement.appendChild(authorHandleHostSpan);
      }
      contentElement.innerHTML = comment.content;
      for (const e of [authorElement, authorDisplayNameElement, authorFullHandleElement, contentElement, repliesToThisResponseElement, commentElement]) {
        if (e != null) {
          e.setAttribute("data-response-id", comment.id);
          e.setAttribute("data-response-url", (_e = comment.url) != null ? _e : "");
        }
      }
      statusIdToElementContainingItsReplies.set(comment.id, repliesToThisResponseElement);
      if (commentElement !== rootCommentElement && comment.in_reply_to_id) {
        (_f = statusIdToElementContainingItsReplies.get(comment.in_reply_to_id)) == null ? void 0 : _f.appendChild(commentElement);
      }
    }
  };
  var findCommentTemplatesAndLoadCommentsIntoDom = () => {
    const commentElements = document.querySelectorAll("[data-host][data-status], [data-status-url]");
    for (const templateElement of commentElements) {
      if (templateElement instanceof HTMLElement) {
        loadCommentsIntoDom(templateElement);
      }
    }
  };
  document.addEventListener("DOMContentLoaded", findCommentTemplatesAndLoadCommentsIntoDom);
})();
//# sourceMappingURL=fedicomments-debug.js.map
