export default class Typed {
	constructor(element, config) {
		config.typeSpeed = config.typeSpeed ?? 100;
		this.config = config;

		this.el = typeof element === 'string'
			? document.querySelector(element)
			: element;

		this.curPos = 0;
		this.setDisplay(element, config.strings[0]);
		this.typewrite();
	}

	get strings() {
		return this.config.strings;
	}

	/**
		@param {HTMLElement} element
		@param {string} curString
	 */
	setDisplay(element, curString) {
		let nodes = [];
		let actions = [];
		let visibleCharsSeenN = 0;

		// Separate curString into text and action sections
		//   eg: "{speed:10}hello {pause:1000}{speed:1000}world!"
		//     -> [ '', '{speed:10}', 'hello ', '{pause:1000}', '', '{speed:1000}', 'world!' ]
		// `(?:<pattern>)` is a non-capturing group, see https://devdocs.io/javascript/regular_expressions/non-capturing_group
		const actionPattern = /\{(?:pause|speed):\d+\}/;
		const sections = curString.split(actionPattern);

		sections.forEach((section, i) => {
			// text section
			if (i % 2 === 0) {
				// iterate over the string, adding <span>s to the element as we go
				for (const char of section) {
					const textNode = document.createTextNode(char);
					let node;
					const isWhite = /\s/.test(char);
					if (isWhite) {
						node = textNode;
					} else {
						visibleCharsSeenN++;
						node = document.createElement('span');
						node.append(textNode);
						node.style.visibility = 'hidden';
					}
					nodes.push(node);
				}
			// action section
			} else {
				const match = /\{(?<action>pause|speed):(?<n>\d+)\}/.exec(section);
				actions[visibleCharsSeenN] = {
					action: match.groups.action,
					n: match.groups.n,
				};
			}
		});

		this.el.replaceChildren(...nodes);
	}

	typewrite() {
		this.timeout = setTimeout(() => {
			this.el.children[this.curPos].style = "";
			this.curPos += 1;
			if (this.curPos < this.el.children.length) {
 				this.typewrite();
			}
		}, this.config.typeSpeed);
	}

	destroy() {
		clearTimeout(this.timeout);
		this.el.replaceChildren();
		this.config.onDestroy(this);
	}
}
