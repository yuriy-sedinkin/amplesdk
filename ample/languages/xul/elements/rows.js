/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/about/licensing/
 *
 */

var cXULElement_rows	= function(){};
cXULElement_rows.prototype	= new cXULElement;
/*
// Class Events Handlers
cXULElement_rows.handlers	= {
	"DOMAttrModified":	function(oEvent) {
		if (oEvent.target == this) {
			this.$mapAttribute(oEvent.attrName, oEvent.newValue);
		}
	}
};
*/
// Register Element with language
oXULNamespace.setElement("rows", cXULElement_rows);
