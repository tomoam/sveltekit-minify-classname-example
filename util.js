// marijnh/style-mod からの借用
// https://github.com/marijnh/style-mod/blob/0e9a345fe6d558dd39b825f4615f871d779470d7/src/style-mod.js#L1-L4
const C = '\u037c';
const COUNT = typeof Symbol == 'undefined' ? '__' + C : Symbol.for(C);
const top =
	typeof globalThis != 'undefined' ? globalThis : typeof window != 'undefined' ? window : {};

// marijnh/style-mod からの借用
// https://github.com/marijnh/style-mod/blob/0e9a345fe6d558dd39b825f4615f871d779470d7/src/style-mod.js#L59-L63
export function newName() {
	let id = top[COUNT] || 1;
	top[COUNT] = id + 1;
	return C + id.toString(36);
}
