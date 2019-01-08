'use strict';
const deburr = require('lodash.deburr');
const escapeStringRegexp = require('escape-string-regexp');
const builtinReplacements = require('./replacements');
const builtinOverridableReplacements = require('./overridable-replacements');

const decamelize = string => {
	return string
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

const removeMootSeparators = (string, separator) => {
	return string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

module.exports = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = Object.assign({
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: []
	}, options);

	const separator = escapeStringRegexp(options.separator);
	const customReplacements = new Map([
		...builtinOverridableReplacements,
		...options.customReplacements,
		...builtinReplacements
	]);

	string = doCustomReplacements(string, customReplacements);
	string = deburr(string);
	string = string.normalize('NFKD');

	if (options.decamelize) {
		string = decamelize(string);
	}

	// CJK Letter Charset via https://github.com/ikatyang/cjk-regex
	let patternSlug = /[^a-zA-Z\d\u1100-\u11ff\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u3005\u3007\u3021-\u3029\u3038-\u303b\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fd-\u30ff\u3105-\u312e\u3131-\u318e\u31a0-\u31ba\u31f0-\u321e\u3260-\u327e\u32d0-\u32fe\u3300-\u3357\u3400-\u4db5\u4e00-\u9fea\ua960-\ua97c\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\uff66-\uff6f\uff71-\uff9d\uffa0-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]+/g;

	if (options.lowercase) {
		string = string.toLowerCase();
		patternSlug = /[^a-z\d\u1100-\u11ff\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u3005\u3007\u3021-\u3029\u3038-\u303b\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fd-\u30ff\u3105-\u312e\u3131-\u318e\u31a0-\u31ba\u31f0-\u321e\u3260-\u327e\u32d0-\u32fe\u3300-\u3357\u3400-\u4db5\u4e00-\u9fea\ua960-\ua97c\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\uff66-\uff6f\uff71-\uff9d\uffa0-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]+/g;
	}

	string = string.replace(patternSlug, separator);
	string = string.replace(/\\/g, '');
	string = removeMootSeparators(string, separator);

	return string;
};
