import type { CustomEmoji } from "./MastodonApiV1Entities.ts";
import { constructElementFactory } from "./constructElement.ts";

const constructElement = constructElementFactory();

export const emojifyHtml = (html: string, emojis: CustomEmoji[]): string => {
	let emojifiedHtml = html;
	emojis.forEach(emoji => {

		const source = constructElement("source", { attributes: { "srcset": emoji.url, "media": "(prefers-reduced-motion: no-preference)" } });

		const img = constructElement("img", {
			classes: ["emoji"], attributes: {
				src: emoji.static_url,
				alt: `:${emoji.shortcode}:`,
				title: `:${emoji.shortcode}:`,
			}
		});

		const picture = constructElement("picture", { classes: ["emoji"], children: [source, img] });

		emojifiedHtml = emojifiedHtml.replace(`:${emoji.shortcode}:`, picture.outerHTML);
	});
	return emojifiedHtml;
};
