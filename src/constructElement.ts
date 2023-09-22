// Support for the HTML Sanitizer API (not yet supported by Safari/FireFox)
// https://wicg.github.io/sanitizer-api/
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API
declare global {
	class Sanitizer {
	}
	interface SetHTMLOptions {
		sanitizer: Sanitizer
	}
	interface Element {
		setHTML(input: string, options?: SetHTMLOptions): void;
	}
}

export const constructElementFactory = <ClassName extends string>() => <K extends keyof HTMLElementTagNameMap>(
	tag: K,
	{ attributes = {}, classes = [], children = [], ...passThroughParameters }: {
		attributes?: { [key: string]: string; }; // Partial<Record<keyof HTMLElementTagNameMap[K] | "itemprop" | "itemtype", string>>
		classes?: ClassName[];
		id?: string;
		textContent?: string;
		innerHTML?: string;
		children?: Node[];
	} = {}) => {
	const e = document.createElement<K>(tag);
	Object.entries(attributes).forEach(([key, value]) => e.setAttribute(key, value));
	classes.forEach(c => e.classList.add(c));
	for (const attr of ["id", "textContent"] as const) {
		const value = passThroughParameters[attr];
		if (value != null) {
			e[attr] = value;
		}
	}
	const {innerHTML} = passThroughParameters;
	if (innerHTML) {
		try {
			const s = new Sanitizer();
			e.setHTML(innerHTML, {sanitizer: s});
			console.log(`sanitized`, innerHTML);
		} catch {
			e.innerHTML = innerHTML;
		}
	}
	children.forEach(child => e.appendChild(child));
	return e;
};
