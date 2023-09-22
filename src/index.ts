import { findCommentContainersAndLoadCommentsIntoDom } from "./loadCommentsIntoDom.ts";
import { findAccountListContainersAndLoadAccountListsIntoDom } from "./renderAccountList.ts";

document.addEventListener('DOMContentLoaded', () => {
	findCommentContainersAndLoadCommentsIntoDom();
	findAccountListContainersAndLoadAccountListsIntoDom();
});