import MagicString from 'magic-string';
import { walk, parse } from 'svelte/compiler';
import { newName } from './util.js';

// 参考: kaisermann/svelte-markup-walker
// https://github.com/kaisermann/svelte-markup-walker
export const minifyClassName = {
	markup({ content, filename }) {
		const parsed = parse(content);
		const magicContent = new MagicString(content);

		// Svelteファイルのマークアップからclass属性を抽出し、
		// そのclass名をキー、class名を変更する関数の配列を値としてMapに保存する
		const classes = new Map();
		walk(parsed.html, {
			enter(node, parent, prop, index) {
				if (node.type === 'Attribute' && node.name === 'class') {
					node.value
						.filter((v) => v.type === 'Text') // MustacheTag{} や class: ディレクティブは対象外。静的なclassのみ
						.forEach((v) => {
							const processes = classes.get(v.data) || [];
							classes.set(v.data, [
								...processes,
								(name) => magicContent.update(v.start, v.end, name)
							]);
						});
				}
			}
		});

		// Svelteファイルのstyleタグからclassセレクタを抽出し、
		// そのセレクタをキー、セレクタを変更する関数の配列を値としてMapに保存する
		const selectors = new Map();
		walk(parsed.css, {
			enter(node, parent, prop, index) {
				if (node.type === 'ClassSelector') {
					const processes = selectors.get(node.name) || [];
					selectors.set(node.name, [
						...processes,
						(name) => magicContent.update(node.start, node.end, `.${name}`)
					]);
				}
			}
		});

		// マークアップとstyleタグの両方にある場合、変更する関数を実行する
		classes.forEach((value, key) => {
			const selector = selectors.get(key);
			if (selector) {
				// ここを変えて、好きな名前を付けてね
				const name = newName();

				[...value, ...selector].forEach((process) => {
					process(name);
				});
			}
		});

		return {
			code: magicContent.toString(),
			map: magicContent.generateMap({ source: filename }).toString()
		};
	}
};
