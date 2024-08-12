export default class Typed {
	constructor(element, config) {
		config.typeSpeed = config.typeSpeed ?? 100;
		this.speed = config.typeSpeed; // use default type speed
		this.nextPause = null;
		this.config = config;

		this.el = typeof element === 'string'
			? document.querySelector(element)
			: element;

		this.nodeCounter = 0;
		this.setDisplay(this.el, config.strings[0]);
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
		const [nodes, actions] = this.parseString(curString);
		this.actions = actions;
		element.replaceChildren(...nodes);
	}

	parseString(curString) {
		let nodes = [];
		let actions = [];
		let nodeCounter = 0;

		// Separate curString into text and action sections
		//   eg: "{speed:10}hello {pause:1000}{speed:1000}world!"
		//     -> [ '', '{speed:10}', 'hello ', '{pause:1000}', '', '{speed:1000}', 'world!' ]
		// `(?:<pattern>)` is a non-capturing group, see https://devdocs.io/javascript/regular_expressions/non-capturing_group
		const actionPattern = /(\{(?:pause|speed):\d+\})/;
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
						nodeCounter++;
						node = document.createElement('span');
						node.append(textNode);
						node.style.visibility = 'hidden';
					}
					nodes.push(node);
				}
			// action section
			} else {
				// extract action and parameter
				const match = /\{(?<action>pause|speed):(?<n>\d+)\}/.exec(section);
				actions[nodeCounter] = {
					action: match.groups.action,
					n: match.groups.n,
				};
			}
		});
		return [nodes, actions];
	}

	executeAction(action) {
		if (action.action == "speed") {
			this.speed = action.n; // overwrites speed value permanently
		} else if (action.action == "pause") {
			this.nextPause = action.n // sets a wait time temporarily
		}
		
	}

	typewrite() {
		if (this.actions[this.nodeCounter]) {
			this.executeAction(this.actions[this.nodeCounter])
		}
		const waitTime = this.nextPause ?? this.speed;
		if (this.nextPause) {
			this.nextPause = null;
		}
		this.timeout = setTimeout(() => {
			this.el.children[this.nodeCounter].style = "";
			this.nodeCounter += 1;
			if (this.nodeCounter < this.el.children.length) {
 				this.typewrite();
			}
		}, waitTime);
	}

	destroy() {
		clearTimeout(this.timeout);
		this.el.replaceChildren();
		this.config.onDestroy(this);
	}
}
