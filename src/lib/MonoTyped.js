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

	setDisplay(element, curString) {
		let nodes = [];
		// iterate over the string, adding <span>s to the element as we go
		for (const char of curString) {
			const textNode = document.createTextNode(char);
			let node;
			const isWhite = /\s/.test(char);
			if (isWhite) {
				node = textNode;
			} else {
				node = document.createElement('span');
				node.append(textNode);
				node.style.visibility = 'hidden';
			}
			nodes.push(node);
		}
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
