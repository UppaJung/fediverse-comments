
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
	for (const attr of ["id", "textContent", "innerHTML"] as const) {
		const value = passThroughParameters[attr];
		if (value != null) {
			e[attr] = value;
		}
	}
	children.forEach(child => e.appendChild(child));
	return e;
};
