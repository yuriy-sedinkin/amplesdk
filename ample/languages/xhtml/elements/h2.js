/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/about/licensing/
 *
 */

var cXHTMLElement_h2	= function(){};
cXHTMLElement_h2.prototype	= new cXHTMLElement;

// Class Events Handlers
cXHTMLElement_h2.handlers	= {
	"DOMAttrModified":	function(oEvent) {
		if (oEvent.target == this)
			cXHTMLElement.mapAttribute(this, oEvent.attrName, oEvent.newValue);
	}
};

// Register Element with language
oXHTMLNamespace.setElement("h2", cXHTMLElement_h2);
