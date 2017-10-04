/**
 * Some utils
 */
var utils = {};

utils.whitelist = ['#text', 'A', 'ABBR', 'ADDRESS', 'AREA', 'ARTICLE', 'ASIDE', 'AUDIO', 'B', 'BDI', 'BDO', 'BLOCKQUOTE', 'BR', 'BUTTON', 'CAPTION', 'CITE', 'CODE', 'COL', 'COLGROUP', 'DATA', 'DATALIST', 'DD', 'DEL', 'DFN', 'DIV', 'DL', 'DT', 'EM', 'EMBED', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'I', 'IFRAME', 'IMG', 'INPUT', 'INS', 'KBD', 'KEYGEN', 'LABEL', 'LEGEND', 'LI', 'MAIN', 'MAP', 'MARK', 'METER', 'NAV', 'OBJECT', 'OL', 'OPTGROUP', 'OPTION', 'OUTPUT', 'P', 'PARAM', 'PRE', 'PROGRESS', 'Q', 'RB', 'RP', 'RT', 'RTC', 'RUBY', 'S', 'SAMP', 'SECTION', 'SELECT', 'SMALL', 'SOURCE', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TIME', 'TR', 'TRACK', 'U', 'UL', 'VAR', 'VIDEO', 'WBR'];

/**
 * Get article ID from URL
 */
utils.articleId = function() {
	var match = document.location.href.match(/^https:\/\/dennikn\.sk\/(\d+).*/);
	return (match !== null && match.length >= 2) ? match[1] : null;
};

/**
 * Detect paid article
 */
utils.isPaidArticle = function() {
	return document.querySelector('.e_lockhard');
};

/**
 * Remove elements from document using selector
 */
utils.removeSelector = function(doc, selector) {
	var elements = doc.querySelectorAll(selector);
	var i = elements.length;
	while (i--) {
		elements[i].parentNode.removeChild(elements[i]);
	}
	return doc;
};

/**
 * Copy only allowed HTML elements and their styles from the remote article
 */
utils.sanitizeContent = function(root, node) {
	for(var i = 0; i < node.childNodes.length; i++ ) {
		var child = node.childNodes[i];

		if (utils.whitelist.indexOf(child.nodeName) >= 0) {
			var element;

			if (child.nodeName == '#text') {
				element = document.createTextNode(child.textContent);
			}
			else {
				element = document.createElement(child.nodeName);
				if (child.hasAttribute('id')) {
					element.id = child.id;
				}
				if (child.className.length > 0) {
					element.className = child.className;
				}
				if (child.style.cssText.length > 0) {
					element.style.cssText = child.style.cssText;
				}

				if (child.nodeName == 'A') {
					for (let i of ['href', 'name', 'rel']) {
						if (child.hasAttribute(i)) {
							element.setAttribute(i, child.getAttribute(i));
						}
					}
				}
				else if (child.nodeName == 'DIV') {
					if (child.hasAttribute('data-image-src') && child.hasAttribute('data-parallax')) {
						var img = document.createElement('img');
						img.src = child.getAttribute('data-image-src');
						img.style.display = 'block';
						img.style.marginLeft = 'auto';
						img.style.marginRight = 'auto';
						element.appendChild(img);
					}
				}
				else if (child.nodeName == 'IFRAME') {
					for (let i of ['allowfullscreen', 'frameborder', 'height', 'scrolling', 'src', 'width']) {
						if (child.hasAttribute(i)) {
							element.setAttribute(i, child.getAttribute(i));
						}
					}
				}
				else if (child.nodeName == 'IMG') {
					for (let i of ['alt', 'height', 'src', 'width']) {
						if (child.hasAttribute(i)) {
							element.setAttribute(i, child.getAttribute(i));
						}
					}
				}
				else if (child.nodeName == 'SOURCE') {
					for (let i of ['src', 'type']) {
						if (child.hasAttribute(i)) {
							element.setAttribute(i, child.getAttribute(i));
						}
					}
				}
				else if (child.nodeName == 'VIDEO') {
					for (let i of ['autoplay', 'loop', 'poster', 'preload']) {
						if (child.hasAttribute(i)) {
							element.setAttribute(i, child.getAttribute(i));
						}
					}
				}

				if (child.childNodes.length > 0) {
					utils.sanitizeContent(element, child);
				}
			}

			root.appendChild(element);
		}
	}
};

/**
 * Get mobile version of the article
 */
utils.getArticle = function(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status == 200) {
			try {
				var json = JSON.parse(request.responseText);
				var doc = (new DOMParser()).parseFromString(json.articles[0].content, 'text/html');
				var html = document.querySelector('.d-content');
				html.innerHTML = '';
				utils.sanitizeContent(html, doc.querySelector('body'));
				utils.removeSelector(document, '.parallax-mirror');
			}
			catch (e) {
				console.error(`majster-n: ${e}`);
			}
		}
	};
	request.send();
};

var articleId = utils.articleId();
if (articleId && utils.isPaidArticle()) {
	utils.getArticle('https://dennikn.sk/api/reader?id=' + articleId);
}
