"use strict";
(() => {
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };

  // src/friendlyTime.ts
  var friendlyTimeEn = (since, onFriendlyTimeChanged) => {
    const msPassed = Date.now() - since.getTime();
    const setFriendlyTimeTo = (newValue, msUntilNextCalculation) => {
      onFriendlyTimeChanged(newValue, since);
      if (msUntilNextCalculation != null && msUntilNextCalculation > 0) {
        setTimeout(() => friendlyTimeEn(since, onFriendlyTimeChanged), msUntilNextCalculation);
      }
    };
    const minuteInMs = 6e4;
    const hourInMs = 60 * minuteInMs;
    const dayInMs = 24 * hourInMs;
    if (msPassed < minuteInMs) {
      setFriendlyTimeTo("seconds ago", minuteInMs - msPassed);
    } else if (msPassed < hourInMs) {
      const minutes = Math.floor(msPassed / minuteInMs);
      setFriendlyTimeTo("".concat(minutes, " minute").concat(minutes > 1 ? "s" : "", " ago"), minuteInMs - msPassed % minuteInMs);
    } else if (msPassed < dayInMs) {
      const hours = Math.floor(msPassed / hourInMs);
      setFriendlyTimeTo("".concat(hours, " hour").concat(hours > 1 ? "s" : "", " ago"), hourInMs - msPassed % hourInMs);
    } else if (msPassed < 14 * dayInMs) {
      const days = Math.floor(msPassed / dayInMs);
      setFriendlyTimeTo("".concat(days, " day").concat(days > 1 ? "s" : "", " ago"), dayInMs - msPassed % dayInMs);
    } else {
      setFriendlyTimeTo(since.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }));
    }
  };

  // src/index.ts
  var constructElement = (tag, _a = {}) => {
    var _b = _a, { attributes = {}, classes = [], children = [] } = _b, passThroughParameters = __objRest(_b, ["attributes", "classes", "children"]);
    const e = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => e.setAttribute(key, value));
    classes.forEach((c) => e.classList.add(c));
    for (const attr of ["id", "textContent", "innerHTML"]) {
      const value = passThroughParameters[attr];
      if (value != null) {
        e[attr] = value;
      }
    }
    children.forEach((child) => e.appendChild(child));
    return e;
  };
  var emojify = (html, emojis) => {
    let emojifiedHtml = html;
    emojis.forEach((emoji) => {
      const source = constructElement("source", { attributes: { "srcset": emoji.url, "media": "(prefers-reduced-motion: no-preference)" } });
      const img = constructElement("img", { classes: ["emoji"], attributes: {
        src: emoji.static_url,
        alt: ":".concat(emoji.shortcode, ":"),
        title: ":".concat(emoji.shortcode, ":")
      } });
      const picture = constructElement("picture", { children: [source, img] });
      emojifiedHtml = emojifiedHtml.replace(":".concat(emoji.shortcode, ":"), picture.outerHTML);
    });
    return emojifiedHtml;
  };
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
  var fetchOriginalStatusAndReplies = async (statusQuery) => {
    const query = typeof statusQuery === "string" ? urlToStatusQuery(statusQuery) : statusQuery;
    const [original, context] = await Promise.all([fetchStatus(query), fetchContext(query)]);
    return { original, replies: context.descendants };
  };
  var renderComments = (comments, originalPosterAccount) => {
    var _a;
    const topLevelCommentsElements = [];
    const statusIdToRepliesElement = /* @__PURE__ */ new Map();
    for (const comment of comments) {
      const isOriginalPoster = comment.account.id === originalPosterAccount.id;
      const commentAuthorsFediverseHost = new URL(comment.account.url).hostname;
      const avatarSource = constructElement("source", { attributes: {
        "srcset": comment.account.avatar,
        "media": "(prefers-reduced-motion: no-preference)"
      } });
      const avatarImg = constructElement("img", { classes: ["comment-authors-avatar"], attributes: {
        src: comment.account.avatar_static,
        alt: "@".concat(comment.account.username, "@").concat(commentAuthorsFediverseHost, " avatar")
      } });
      const avatarPicture = constructElement("picture", { children: [avatarSource, avatarImg] });
      const avatarLink = constructElement("a", { classes: ["comment-authors-avatar-link", ...isOriginalPoster ? ["original-poster"] : []], attributes: {
        href: comment.account.url,
        rel: "external nofollow",
        title: "view profile at @".concat(comment.account.username, "@").concat(commentAuthorsFediverseHost)
      }, children: [avatarPicture] });
      const usernameAtElement = constructElement("span", {
        classes: ["at-symbol", "username-at-symbol"],
        textContent: "@"
      });
      const serverAtElement = constructElement("span", {
        classes: ["at-symbol", "server-at-symbol"],
        textContent: "@"
      });
      const usernameElement = constructElement("span", {
        classes: ["comment-authors-fediverse-username"],
        textContent: comment.account.username
      });
      const serverElement = constructElement("span", {
        classes: ["comment-authors-fediverse-server"],
        textContent: commentAuthorsFediverseHost
      });
      const displayNameElement = constructElement("span", { classes: ["comment-authors-display-name"], innerHTML: emojify(comment.account.display_name, comment.account.emojis), attributes: {
        itemprop: "author",
        itemtype: "http://schema.org/Person"
      } });
      const fediverseIdentityElement = constructElement("a", {
        classes: ["comment-authors-fediverse-identity", ...isOriginalPoster ? ["original-poster"] : []],
        attributes: {
          href: comment.account.url,
          title: "@".concat(comment.account.username, "@").concat(commentAuthorsFediverseHost),
          rel: "external nofollow"
        },
        children: [
          usernameAtElement,
          usernameElement,
          serverAtElement,
          serverElement
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
          href: (_a = comment.url) != null ? _a : "",
          itemprop: "url",
          title: "view at ".concat(commentAuthorsFediverseHost),
          rel: "external nofollow"
        }
      });
      const mainContentElement = constructElement("main", { classes: ["comment-content"], innerHTML: emojify(comment.content, comment.emojis), attributes: {
        itemprop: "text"
      } });
      const timestamp = constructElement("time", {
        classes: ["comment-time"],
        attributes: { dateTime: comment.created_at },
        textContent: new Date(comment.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })
      });
      friendlyTimeEn(new Date(comment.created_at), (friendlyTimeStr) => {
        timestamp.textContent = friendlyTimeStr;
      });
      const counters = constructElement("span", {
        classes: ["comment-counters"],
        children: [
          ...comment.reblogs_count > 0 ? [
            constructElement("a", {
              classes: ["comment-counter-reblogs"],
              textContent: "".concat(comment.reblogs_count),
              attributes: {
                href: "".concat(comment.url, "/reblogs"),
                title: "Reblogs reported by ".concat(commentAuthorsFediverseHost)
              }
            })
          ] : [],
          ...comment.favourites_count > 0 ? [
            constructElement("a", {
              classes: ["comment-counter-favorites"],
              textContent: "".concat(comment.favourites_count),
              attributes: {
                href: "".concat(comment.url, "/favourites"),
                title: "Favorites reported by ".concat(commentAuthorsFediverseHost)
              }
            })
          ] : []
        ]
      });
      const footerElement = constructElement("footer", {
        classes: ["comment-footer"],
        children: [
          counters,
          originalStatusLink,
          timestamp
        ]
      });
      const repliesContainer = constructElement("div", { classes: ["comment-replies"] });
      statusIdToRepliesElement.set(comment.id, repliesContainer);
      const commentElement = constructElement("article", {
        id: "comment-".concat(comment.id),
        classes: ["fediverse-comment", ...isOriginalPoster ? ["original-poster"] : []],
        attributes: {
          itemprop: "comment",
          itemtype: "http://schema.org/Comment"
        },
        children: [headerElement, mainContentElement, footerElement, repliesContainer]
      });
      const replyBlock = comment.in_reply_to_id != null ? statusIdToRepliesElement.get(comment.in_reply_to_id) : void 0;
      if (replyBlock) {
        replyBlock.appendChild(commentElement);
      } else {
        topLevelCommentsElements.push(commentElement);
      }
    }
    return topLevelCommentsElements;
  };
  var loadCommentsIntoDom = async (rootCommentElement) => {
    var _a, _b, _c, _d;
    const dataAttributes = (_a = rootCommentElement == null ? void 0 : rootCommentElement.dataset) != null ? _a : {};
    const includeSet = new Set(((_b = dataAttributes.include) != null ? _b : "").split(",").map((e) => e.trim()));
    const excludeSet = new Set(((_c = dataAttributes.exclude) != null ? _c : "").split(",").map((e) => e.trim()));
    const maxResponses = parseInt((_d = dataAttributes.max) != null ? _d : "");
    const statusUrl = dataAttributes["responsesToUrl"];
    const { host, status } = statusUrl != null ? urlToStatusQuery(statusUrl) : dataAttributes;
    if (host == null || status == null)
      return;
    const { original, replies } = await fetchOriginalStatusAndReplies({ host, status });
    const comments = [
      original,
      ...replies.filter((r) => {
        if (excludeSet.has(r.id)) {
          return false;
        } else if (r.in_reply_to_id != null && excludeSet.has(r.in_reply_to_id)) {
          excludeSet.add(r.id);
          return false;
        } else {
          return true;
        }
      })
    ];
    if (!isNaN(maxResponses)) {
      for (var i = comments.length - 1; i > 0 && comments.length > maxResponses; i--) {
        if (!includeSet.has(comments[i].id)) {
          comments.splice(i, 1);
        }
      }
    }
    const topLevelCommentElements = renderComments(comments, original.account);
    topLevelCommentElements.forEach((commentElement) => rootCommentElement.appendChild(commentElement));
  };
  var findCommentTemplatesAndLoadCommentsIntoDom = () => {
    const commentElements = document.querySelectorAll("[data-host][data-status], [data-responses-to-url]");
    for (const templateElement of commentElements) {
      if (templateElement instanceof HTMLElement) {
        loadCommentsIntoDom(templateElement);
      }
    }
  };
  document.addEventListener("DOMContentLoaded", findCommentTemplatesAndLoadCommentsIntoDom);
})();
//# sourceMappingURL=fedicomments-debug.js.map
