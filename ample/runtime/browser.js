/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/about/licensing/
 *
 */

// Events handling
function fAttachEvent(oNode, sEvent, fHandler) {
	if (bTrident)
		oNode.attachEvent('on' + sEvent, fHandler);
	else
		oNode.addEventListener(sEvent, fHandler, false);
};

function fDetachEvent(oNode, sEvent, fHandler) {
	if (bTrident)
		oNode.detachEvent('on' + sEvent, fHandler);
	else
		oNode.removeEventListener(sEvent, fHandler, false);
};

// Finds AMLElement by event target
function fGetEventTarget(oEvent) {
    return oAML_document.$instance(oEvent.srcElement || oEvent.target) || oAML_document.documentElement;
};

function fGetUIEventPseudo(oEvent) {
    for (var oNode = oEvent.srcElement || oEvent.target, sId, sClass; oNode; oNode = oNode.parentNode) {
        if ((sId = oNode.id) && oAML_ids[sId])
            return oNode;
		else
		if ((sClass = oNode.className) && cString(sClass || sClass.baseVal).match(/--[\w-]+/))
			return oNode;
    }
    return null;
};

function fIsDescendant(oNode, oParent) {
	for (; oNode; oNode = oNode.parentNode)
		if (oNode == oParent)
			return true;
	return false;
};

function fGetUIEventButton(oEvent) {
	var nButton	= oEvent.button;
	if (!bTrident)
		return nButton;
	if (nButton == 4)
		return 1;
	if (nButton == 2)
		return 2;
	return 0;
};

var bTrident	= false,
	bGecko		= false,
	bPresto		= false,
	bWebKit		= false,
/*	bKHTML		= false,*/
	nVersion	= 0;

if (!!oUADocument.namespaces) {
	bTrident	= true;
	nVersion	= oUANavigator.userAgent.match(/MSIE ([\d.]+)/)[1];
}
else
if (!!window.controllers) {
	bGecko		= true;
	nVersion	= fParseFloat(oUANavigator.userAgent.match(/rv:([\d.]+)/)[1]);
}
else
if (!!window.opera) {
	bPresto		= true;
//	nVersion	= oUANavigator.userAgent.match(/Presto\/([\d.]+)/)[1];
}
else
if (oUANavigator.userAgent.match(/AppleWebKit\/([\d.]+)/)[1]) {
	bWebKit		= true;
}

// Private Variables
var oAML_factory	= oUADocument.createElement("span"),
	bKeyDown	= false;

function fAML_render(oNode) {
	if (oNode.nodeType == cAMLNode.TEXT_NODE)
		return oUADocument.createTextNode(oNode.nodeValue);
	else
	if (oNode.nodeType == cAMLNode.ELEMENT_NODE) {
		var sHtml	= oNode.$getTag();
		if (sHtml) {
			if (bTrident) {
				if (sHtml.match(/^<(\w*:)?(\w+)/)) {
					var sTagName	= cRegExp.$2;
					switch (sTagName) {
						case "td":
						case "th":
							sHtml	= '<' + "tr" + '>' + sHtml + '</' + "tr" + '>';
							// no break is left intentionally
						case "tr":
							sHtml	= '<' + "tbody" + '>' + sHtml + '</' + "tbody" + '>';
							// no break is left intentionally
						case "thead":
						case "tbody":
						case "tfoot":
							sHtml	= '<' + "table" + '>' + sHtml + '</' + "table" + '>';
						    break;
						case "option":
							sHtml	= '<' + "select" + '>' + sHtml + '</' + "select" + '>';
							break;
					}
					// Render HTML
					oAML_factory.innerHTML	= sHtml;
					// Return Node
				    return oAML_factory.getElementsByTagName(sTagName)[0] || null;
				}
			}
			else {
				// Add namespace declarations to the shadow content
				if (!("xmlns" + (oNode.prefix ? ':' + oNode.prefix : '') in oNode.attributes) || (oNode.namespaceURI != "http://www.w3.org/2000/svg" && oNode.namespaceURI != "http://www.w3.org/1999/xhtml"))
					sHtml	= sHtml.replace(/^(<(?:(\w+)(:))?(\w+))/, '$1 ' + "xmlns" + '$3$2="' + (oNode.namespaceURI == "http://www.w3.org/2000/svg" ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml") + '"');
				return oUADocument.importNode(new cDOMParser().parseFromString('<!' + "DOCTYPE" + ' ' + "#document-fragment".substr(1) + '[' + sAML_entities + ']>' + sHtml, "text/xml").documentElement, true);
			}
		}
	}
	return null;
};

var hAMLKeyIdentifiers	= fAML_stringToHash('8:Backspace;9:Tab;13:Enter;16:Shift;17:Control;18:Alt;20:CapsLock;27:Esc;33:PageUp;34:PageDown;35:End;36:Home;37:Left;38:Up;39:Right;40:Down;45:Insert;46:Backspace;91:Win;112:F1;113:F2;114:F3;115:F4;116:F5;117:F6;118:F7;119:F8;120:F9;121:F10;122:F11;123:F12;127:Del');
function fGetKeyboardEventIdentifier(oEvent) {
	return hAMLKeyIdentifiers[oEvent.keyCode] || ('U+' + fAML_numberToHex(oEvent.keyCode, 4).toUpperCase());
};

function fGetKeyboardEventModifiersList(oEvent) {
	var aModifiersList = [];
	if (oEvent.altKey)
		aModifiersList[aModifiersList.length] = "Alt";
	if (oEvent.ctrlKey)
		aModifiersList[aModifiersList.length] = "Control";
	if (oEvent.metaKey)
		aModifiersList[aModifiersList.length] = "Meta";
	if (oEvent.shiftKey)
		aModifiersList[aModifiersList.length] = "Shift";
	return aModifiersList.join(' ');
};

function fEventPreventDefault(oEvent) {
    for (var nIndex = 1, nLength = arguments.length; nIndex < nLength; nIndex++)
	    if (arguments[nIndex].defaultPrevented) {
	    	if (oEvent.preventDefault)
		    	oEvent.preventDefault();
	    	return false;
	    }
    return true;
};

function fOnMouseWheel(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		bPrevent	= false,
		nWheelDelta	= bGecko ? oEvent.detail : -1 * oEvent.wheelDelta / 40,
		oEventMouseWheel	= new cAMLMouseWheelEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
		bPrevent	= true;
	}

	// Init MouseWheel event
	oEventMouseWheel.initMouseWheelEvent("mousewheel", true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, fGetUIEventButton(oEvent), null, fGetKeyboardEventModifiersList(oEvent), nWheelDelta);
	oEventMouseWheel.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventMouseWheel);
    else
    	bPrevent	= true;

    if (bPrevent)
    	oEventMouseWheel.preventDefault();

	//
	return fEventPreventDefault(oEvent, oEventMouseWheel);
};

// Key Events
function fOnKeyDown(oEvent) {
	var oTarget		= oAML_document.activeElement || oAML_document.documentElement,	// FF bugfix
		oPseudo		= fGetUIEventPseudo(oEvent),
		oEventKeyDown	= new cAMLKeyboardEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

    // Init KeyDown event
    oEventKeyDown.initKeyboardEvent("keydown", true, true, window, fGetKeyboardEventIdentifier(oEvent), null, fGetKeyboardEventModifiersList(oEvent));
    oEventKeyDown.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventKeyDown);

	//
	return fEventPreventDefault(oEvent, oEventKeyDown);
};

function fOnKeyPress(oEvent)
{
	// Opera doesn't repeat keydown, but does repeat keypress
	if (bPresto && bKeyDown)
		fOnKeyDown(oEvent);

    // Fix for repeated keydown in presto
    bKeyDown	= true;

	// Filter out non-alphanumerical keypress events
	if (oEvent.ctrlKey || oEvent.altKey || oEvent.keyCode in hAMLKeyIdentifiers)
		return;

	var oTarget		= oAML_document.activeElement || oAML_document.documentElement,	// FF bugfix
		oPseudo		= fGetUIEventPseudo(oEvent),
		oEventKeyPress	= new cAMLKeyboardEvent,
		oEventTextInput	= new cAMLTextEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

    // Init KeyPress event
    oEventKeyPress.initKeyboardEvent("keypress", true, true, window, fGetKeyboardEventIdentifier(oEvent), null, fGetKeyboardEventModifiersList(oEvent));
	oEventKeyPress.$pseudoTarget	= oPseudo;

	// Init TextInput event
	oEventTextInput.initTextEvent("textInput", true, true, null, cString.fromCharCode(oEvent.charCode || oEvent.keyCode));
    oEventTextInput.$pseudoTarget	= oPseudo;

    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode)) {
    	//
    	fAMLNode_dispatchEvent(oTarget, oEventKeyPress);
		//
    	fAMLNode_dispatchEvent(oTarget, oEventTextInput);
    }

	//
	return fEventPreventDefault(oEvent, oEventKeyPress, oEventTextInput);
};

function fOnKeyUp(oEvent) {
	var oTarget		= oAML_document.activeElement || oAML_document.documentElement,
		oPseudo		= fGetUIEventPseudo(oEvent),
		oEventKeyUp	= new cAMLKeyboardEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

    // Init KeyUp event
	oEventKeyUp.initKeyboardEvent("keyup", true, true, window, fGetKeyboardEventIdentifier(oEvent), null, fGetKeyboardEventModifiersList(oEvent));
	oEventKeyUp.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventKeyUp);

    bKeyDown	= false;

	//
	return fEventPreventDefault(oEvent, oEventKeyUp);
};

function fOnMouseOver(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton 	= fGetUIEventButton(oEvent),
		oEventMouseOver,
		oEventMouseOut;

	if (oTarget == oAML_mouseNode)
		return;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

	// TODO: Remove this dependency from here
	if (!(nAMLDragAndDrop_dragState || nAMLResize_resizeState)) {
		// do not dispatch event if outside modal
	    if (!oAML_modalNode || fIsDescendant(oAML_mouseNode, oAML_modalNode)) {
			if (oAML_mouseNode && oAML_all[oAML_mouseNode.uniqueID]) {
			    // Create an Event
			    oEventMouseOut = new cAMLMouseEvent;
			    oEventMouseOut.initMouseEvent("mouseout", true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, oTarget);
				oEventMouseOut.$pseudoTarget	= oPseudo;
				fAMLNode_dispatchEvent(oAML_mouseNode, oEventMouseOut);
			}
	    }

		// do not dispatch event if outside modal
	    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode)) {
		    // Create an Event
		    oEventMouseOver = new cAMLMouseEvent;
		    oEventMouseOver.initMouseEvent("mouseover", true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, oAML_mouseNode);
		    oEventMouseOver.$pseudoTarget	= oPseudo;
		    fAMLNode_dispatchEvent(oTarget, oEventMouseOver);
	    }
	}

	//
	oAML_mouseNode	= oTarget;
};

// Touches
function fGetTouches(oUATouches) {
	var nIndex	= 0,
		nLength	= oUATouches.length,
		oTouches	= new cAMLTouchList,
		oTouch,
		oUATouch;
	while (nIndex < nLength) {
		oUATouch	= oUATouches.item(nIndex++);
		oTouch		= new cAMLTouch;
		oTouch.clientX	= oUATouch.clientX;
		oTouch.clientY	= oUATouch.clientY;
		oTouch.identifier	= oUATouch.identifier;
		oTouch.pageX	= oUATouch.pageX;
		oTouch.pageY	= oUATouch.pageY;
		oTouch.screenX	= oUATouch.screenX;
		oTouch.screenY	= oUATouch.screenY;
		oTouches[oTouches.length++]	= oTouch;
	}
	return oTouches;
};

function fOnTouch(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		oEventTouch	= new cAMLTouchEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

    // Init Touch event
	oEventTouch.initTouchEvent(oEvent.type, oEvent.bubbles, oEvent.cancelable, oEvent.view, oEvent.detail, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, fGetTouches(oEvent.touches), fGetTouches(oEvent.targetTouches), fGetTouches(oEvent.changedTouches), oEvent.scale, oEvent.rotation);
	oEventTouch.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventTouch);

	//
	return fEventPreventDefault(oEvent, oEventTouch);
};

function fOnGesture(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		oEventGesture	= new cAMLGestureEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

    // Init Touch event
	oEventGesture.initGestureEvent(oEvent.type, oEvent.bubbles, oEvent.cancelable, oEvent.view, oEvent.detail, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, oEvent.target, oEvent.scale, oEvent.rotation);
	oEventGesture.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventGesture);

	//
	return fEventPreventDefault(oEvent, oEventGesture);
};

/*
oUADocument.attachEvent('on' + "mouseover", function(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent);
    // Create an Event
    var oEventMouseOver = new cAMLMouseEvent;
    oEventMouseOver.initMouseEvent("mouseover", true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, oEvent.button, null);
    oEventMouseOver.$pseudoTarget	= oPseudo;
	fAMLNode_dispatchEvent(oTarget, oEventMouseOver);
});

oUADocument.attachEvent('on' + "mouseout", function(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent);
    // Create an Event
    var oEventMouseOut = new cAMLMouseEvent;
    oEventMouseOut.initMouseEvent("mouseout", true, false, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, oEvent.button, null);
    oEventMouseOut.$pseudoTarget	= oPseudo;
	fAMLNode_dispatchEvent(oTarget, oEventMouseOut);
});
*/

var oAML_captureNode= null,	// Set in Capture manager
	oAML_modalNode	= null,	// Set in Capture manager
	aAML_mouseNodes	= new cAMLNodeList,
	oAML_mouseNode	= null;

function fOnMouseMove(oEvent) {
    var oTarget		= fGetEventTarget(oEvent),
    	oPseudo		= fGetUIEventPseudo(oEvent),
    	nButton 	= fGetUIEventButton(oEvent),
    	nIndexCommon=-1,
    	aElements	= new cAMLNodeList,
    	oEventMouseMove = new cAMLMouseEvent,
    	oEventMouseLeave,
		oEventMouseEnter;

	//
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

	// TODO: Remove this dependency from here
	if (!(nAMLDragAndDrop_dragState || nAMLResize_resizeState)) {
		if (aAML_mouseNodes[0] != oTarget) {
			// find common relative
			for (var oElement = oTarget; oElement.nodeType != cAMLNode.DOCUMENT_NODE; oElement = oElement.parentNode) {
				aElements.$add(oElement);
				if (nIndexCommon ==-1)
					nIndexCommon = aAML_mouseNodes.$indexOf(oElement);
			}

			// TODO: Come up with a better implementation that doesn't check for modality on every iteration in loops

			// propagate mouseleave branch
			for (var nIndex = 0; nIndex < nIndexCommon; nIndex++) {
				// do not dispatch event if outside modal
				if (!oAML_modalNode || fIsDescendant(aAML_mouseNodes[nIndex], oAML_modalNode)) {
					oEventMouseLeave = new cAMLMouseEvent;
				    oEventMouseLeave.initMouseEvent("mouseleave", false, false, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, aAML_mouseNodes[nIndex + 1] || null);
				    oEventMouseLeave.$pseudoTarget	= oPseudo;
				    fAMLNode_dispatchEvent(aAML_mouseNodes[nIndex], oEventMouseLeave);
				}
			}

			// propagate mouseenter branch
			for (var nIndex	= nIndexCommon + aElements.length - aAML_mouseNodes.length; nIndex > 0; nIndex--) {
				// do not dispatch event if outside modal
				if (!oAML_modalNode || fIsDescendant(aElements[nIndex - 1], oAML_modalNode)) {
				    oEventMouseEnter = new cAMLMouseEvent;
				    oEventMouseEnter.initMouseEvent("mouseenter", false, false, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, aElements[nIndex] || null);
				    oEventMouseEnter.$pseudoTarget	= oPseudo;
				    fAMLNode_dispatchEvent(aElements[nIndex - 1], oEventMouseEnter);
				}
		    }

			// save current path stack
			aAML_mouseNodes	= aElements;
		}
	}

	// scope to modal
    if (oAML_modalNode && fIsDescendant(oTarget, oAML_modalNode))
    	oTarget	= oAML_modalNode;

    // Init MouseMove event
    oEventMouseMove.initMouseEvent("mousemove", true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, null);
    oEventMouseMove.$pseudoTarget	= oPseudo;
    fAMLNode_dispatchEvent(oTarget, oEventMouseMove);

	//
	return fEventPreventDefault(oEvent, oEventMouseMove);
};

function fOnContextMenu(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton 	= fGetUIEventButton(oEvent),
		bPrevent	= false,
		oEventClick	= new cAMLMouseEvent,
		oEventContextMenu	= new cAMLMouseEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
		bPrevent	= true;
	}

	// Init Click event
	oEventClick.initMouseEvent("click", true, true, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, null, 2, null);
	oEventClick.$pseudoTarget	= oPseudo;

    // Init ContextMenu event
    oEventContextMenu.initMouseEvent("contextmenu", true, true, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, 2, null);
    oEventContextMenu.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode)) {
    	// Simulate missing 'click' event in IE and WebKit
		if (bTrident || bWebKit)
			fAMLNode_dispatchEvent(oTarget, oEventClick);

		fAMLNode_dispatchEvent(oTarget, oEventContextMenu);
    }
    else
    	bPrevent	= true;

	if (bPrevent)
		oEventContextMenu.preventDefault();

	//
	return fEventPreventDefault(oEvent, oEventContextMenu, oEventClick);
};

function fOnClick(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton		= fGetUIEventButton(oEvent),
		bPrevent	= false,
		oEventClick	= new cAMLMouseEvent;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
		bPrevent	= true;
	}
	// Init Click event
    oEventClick.initMouseEvent("click", true, true, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, null);
    oEventClick.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
    	fAMLNode_dispatchEvent(oTarget, oEventClick);
    else
    	bPrevent	= true;

	if (bPrevent)
		oEventClick.preventDefault();

	//
	return fEventPreventDefault(oEvent, oEventClick);
};

function fOnDblClick(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton		= fGetUIEventButton(oEvent),
		oEventDblClick = new cAMLMouseEvent,
		oEventClick,
		oEventMouseDown,
		oEventMouseUp;

	// if modal, do not dispatch event
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

	// Init DblClick event
    oEventDblClick.initMouseEvent("dblclick", true, true, window, oEvent.detail || 2, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, null);
    oEventDblClick.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
    if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode)) {
		if (bTrident) {
	 		// Simulate missing 'mousedown' event in IE
	    	oEventMouseDown = new cAMLMouseEvent;
	    	oEventMouseDown.initMouseEvent("mousedown", true, true, window, 2, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, null, nButton, null);
	    	oEventMouseDown.$pseudoTarget	= oPseudo;
	    	fAMLNode_dispatchEvent(oTarget, oEventMouseDown);

	 		// Simulate missing 'click' event in IE
	    	oEventClick = new cAMLMouseEvent;
	    	oEventClick.initMouseEvent("click", true, true, window, 2, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, null, nButton, null);
	    	oEventClick.$pseudoTarget	= oPseudo;
	    	fAMLNode_dispatchEvent(oTarget, oEventClick);
		}

		fAMLNode_dispatchEvent(oTarget, oEventDblClick);

		// Simulate missing 'mouseup' event in IE
		if (bTrident) {
	    	oEventMouseUp = new cAMLMouseEvent;
	    	oEventMouseUp.initMouseEvent("mouseup", true, true, window, 2, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, null, nButton, null);
	    	oEventMouseUp.$pseudoTarget	= oPseudo;
	    	fAMLNode_dispatchEvent(oTarget, oEventMouseUp);
		}
    }
};

function fOnMouseDown(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton		= fGetUIEventButton(oEvent),
		bCapture	= false,
		bModal		= false,
		oEventMouseDown = new cAMLMouseEvent;

	// change target if some element is set to receive capture
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
		bCapture	= true;
	}

	// Init MouseDown event
    oEventMouseDown.initMouseEvent("mousedown", true, true, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, null);
    oEventMouseDown.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
	if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode)) {
		// Moved here from #mouseup handler. Not sure yet if it is right though
		oAML_document.activeElement	= oTarget;
		//
		fAMLNode_dispatchEvent(oTarget, oEventMouseDown);
	}
	else {
		bModal	= true;
	}

	if (bCapture || bModal) {
		// Notify element on capture
		var oCaptureEvent	= new cAMLUIEvent;
		oCaptureEvent.initUIEvent("capture", true, false, window, null);
		oCaptureEvent.$pseudoTarget	= oPseudo;
		fAMLNode_dispatchEvent(bModal ? oAML_modalNode : oTarget, oCaptureEvent);
		//
		oEventMouseDown.preventDefault();
	}

	// toggle user-selection (IE only)
	if (oEventMouseDown.defaultPrevented)
		bAML_userSelect	= false;

	//
	return fEventPreventDefault(oEvent, oEventMouseDown);
};

function fOnMouseUp(oEvent) {
	var oTarget		= fGetEventTarget(oEvent),
		oPseudo		= fGetUIEventPseudo(oEvent),
		nButton		= fGetUIEventButton(oEvent),
		oEventMouseUp	= new cAMLMouseEvent;

	// change target if some element is set to receive capture
	if (oAML_captureNode && !fIsDescendant(oTarget, oAML_captureNode)) {
		oTarget	= oAML_captureNode;
		oPseudo	= oTarget.$getContainer();
	}

	// Init MouseUp event
    oEventMouseUp.initMouseEvent("mouseup", true, true, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey, nButton, null);
    oEventMouseUp.$pseudoTarget	= oPseudo;

	// do not dispatch event if outside modal
	if (!oAML_modalNode || fIsDescendant(oTarget, oAML_modalNode))
		fAMLNode_dispatchEvent(oTarget, oEventMouseUp);

	//
	return fEventPreventDefault(oEvent, oEventMouseUp);
};

function fOnResize(oEvent) {
    // Create an Event
    var oEventResize = new cAMLUIEvent;
    oEventResize.initUIEvent("resize", true, false, window, null);
    fAMLNode_dispatchEvent(oAML_document, oEventResize);
};

function fOnScroll(oEvent) {
    // Create an Event
    var oEventScroll = new cAMLUIEvent;
    oEventScroll.initUIEvent("scroll", true, false, window, null);
    fAMLNode_dispatchEvent(oAML_document, oEventScroll);
};

// User selection
var bAML_userSelect	= true;
function fOnSelectStart() {
	var bUserSelect	= bAML_userSelect;
	bAML_userSelect	= true;
	return bUserSelect;
};

function fAML_toggleSelect(bAllow) {
	if (bTrident)
		bAML_userSelect	= bAllow;
	else {
		var oStyle	= oUADocument.documentElement.style;
		oStyle.WebkitUserSelect	=
		oStyle.MozUserSelect	=
		oStyle.OperaUserSelect	=
		oStyle.KhtmlUserSelect 	=
		oStyle.userSelect		= bAllow ? '' : "none";
	}
};

// Utilities
function fAML_replaceNode(oOld, oNew) {
	oOld.parentNode.insertBefore(oNew, oOld);
	oOld.parentNode.removeChild(oOld);
};

function fAML_getResponseDocument(oRequest) {
	var oDocument	= oRequest.responseXML;
	// Try parsing responseText
	if (bTrident && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
		oDocument	= new fActiveXObject("Microsoft.XMLDOM");
		oDocument.loadXML(oRequest.responseText);
	}
	// Check if there is no error in document
	if (oDocument)
		if ((bTrident && oDocument.parseError != 0) || !oDocument.documentElement || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror"))
			return null;
	return oDocument;
};

function fAML_parseStyleSheet(sCSS, sUri) {
	// 1. Remove namespace declarations
	var aNameSpaces = sCSS.match(/@namespace\s+([\w-]+\s+)?(url\()?(['"])?[^'";\s]+(['"])?\)?;?/g);
	if (aNameSpaces)
		for (var nIndex = 0; nIndex < aNameSpaces.length; nIndex++)
			sCSS	= sCSS.replace(aNameSpaces[nIndex], '');

	// 2. Rewrite Relative URLs
	var aCSS	= sCSS.match(/url\s*\([^\)]+\)/g);
	if (aCSS)
		for (var nIndex = 0, nLength = aCSS.length, aUrl; nIndex < nLength; nIndex++)
			if (aUrl = aCSS[nIndex].match(/url\s*\(['"]?([^\)"']+)['"]?\)/i))
				sCSS	= sCSS.replace(aCSS[nIndex], "url" + '("' + fAML_resolveUri(aUrl[1], sUri) + '")');

	// 3. Process imports
	var aImports	= sCSS.match(/@import\s+url\s*\(\s*['"]?[^'"]+['"]?\s*\)\s*;?/g);
	if (aImports)
		for (var nIndex = 0, nLength = aImports.length; nIndex < nLength; nIndex++)
			if (aUrl = aImports[nIndex].match(/url\s*\(['"]?([^\)"']+)['"]?\)/i))
				sCSS	= sCSS.replace(aImports[nIndex], fAML_parseStyleSheet(fAML_loadStyleSheet(aUrl[1]), aUrl[1]));

	// 4. Convert styles
	if (bTrident) {
		// Rewrite display:inline-block to display:inline (IE8-)
		if (nVersion < 8)
			sCSS	= sCSS.replace(/display\s*:\s*inline-block/g, 'display:inline;zoom:1');
		// Rewrite opacity
		if (nVersion < 9)
			sCSS	= sCSS.replace(/(?:[^-])opacity\s*:\s*([\d.]+)/g, function(sMatch, nOpacity) {
				return "filter" + ':' + "progid" + ':' + "DXImageTransform.Microsoft.Alpha" + '(' + "opacity" + '=' + nOpacity * 100 + ');zoom:1';
			});
	}
	else
	if (bGecko || bWebKit || bPresto) {
		var sBefore	= '$1$2$3-',
			sAfter	= '-$1$2$3';
		// Rewrite text-overflow
		sCSS	= sCSS
					.replace(/(?:\s|;)(text-overflow\s*:\s*)(.+)(\n|;)/gi, sBefore + (bPresto ? "o" : bGecko ? "moz" : "webkit") + sAfter);
		//
		if (!bPresto) {
			// Rewrite box-shadow
			sCSS	= sCSS
						.replace(/(?:\s|;)(box-shadow\s*:\s*)(.+)(\n|;)/gi, sBefore + (bGecko ? "moz" : "webkit") + sAfter)
						.replace(/(?:\s|;)(outline-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + (bGecko ? "moz" : "webkit") + sAfter)
						.replace(/(?:\s|;)(border-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + (bGecko ? "moz" : "webkit") + sAfter);
			if (bGecko) {
				// Rewrite box-sizing
				sCSS	= sCSS.replace(/(?:\s|;)(box-sizing\s*:\s*)(.+)(\n|;)/gi, sBefore + "moz" + sAfter);
				// Rewrite border-radius
				sBefore	= sBefore + 'moz-border-radius-';
				sAfter	= ':$2$3';
				sCSS	= sCSS
							.replace(/(?:\s|;)(border-top-left-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + 'topleft' + sAfter)
							.replace(/(?:\s|;)(border-top-right-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + 'topright' + sAfter)
							.replace(/(?:\s|;)(border-bottom-left-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + 'bottomleft' + sAfter)
							.replace(/(?:\s|;)(border-bottom-right-radius\s*:\s*)(.+)(\n|;)/gi, sBefore + 'bottomright' + sAfter);
			}
			// Rewrite linear-gradient
//			sCSS	= sCSS.replace(/(\s|;)(background-image\s*:\s*)(linear-gradient\(.+\))(\n|;)/gi, "$1$2$3$4$1$2\-moz\-$3$4");
		}
	}

	// 5. Modify selectors
	var aCSS	= [],
		aRules	= sCSS.match(/[^{]+{[^}]*}/g);
	if (aRules) {
		for (var nIndex = 0, nLength = aRules.length, aRule; nIndex < nLength; nIndex++) {
			aRule	= aRules[nIndex].match(/([^{]+)({[^}]*})/);
			aCSS.push(aRule[1]
//						.replace(/([\s>+~,])(?:([\w]+)\|)?([\w]+)/g, '$1.$2-$3')		// Element
						.replace(/\|/g, '-')							// Namespace
						.replace(/([\s>+~,]|not\()([\w])/g, '$1.$2')	// Element
						.replace(/\[([\w]+)=?([\w]+)?\]/g, '-$1-$2')	// Attribute
						.replace(/::/g, '--')							// Pseudo-element
						.replace(/:nth-child\((\d+)\)/g, '_nth-child-$1')	// Pseudo-class nth-child
						.replace(/:(?!last-child|first-child|not)/g, '_')	// Pseudo-class
//						.replace(/>/g, '--' + "gateway" + '>').replace(/(--gateway){2,}/g, '--' + "gateway")// > selector
						,
						aRule[2]);
		}
		sCSS	= aCSS.join('');
	}

	return sCSS;
};

function fAML_loadStyleSheet(sUri) {
	var oRequest	= new cXMLHttpRequest;
	oRequest.open("GET", sUri, false);
	oRequest.setRequestHeader("Accept", "text/css" + ',*' + '/' + '*;q=0.1');
	oRequest.send(null);

	return oRequest.responseText;
};

function fAML_createStyleSheet(sCSS, sUri, sMedia) {
	// Process Stylesheet
	oAML_factory.innerHTML	= "#text" + '<' + "style" + ' ' + "type" + '="' + "text/css" + '"' + (sMedia ? ' ' + "media" + '="' + sMedia + '"' : '') + '>' + fAML_parseStyleSheet(sCSS, sUri) + '</' + "style" + '>';
	return oAML_factory.childNodes[1];
};

function fAML_toCssPropertyName(sName) {
	for (var nIndex = 1, aValue = sName.split('-'); nIndex < aValue.length; nIndex++)
    	aValue[nIndex] = aValue[nIndex].substr(0, 1).toUpperCase() + aValue[nIndex].substr(1);
	return aValue.join('');
};

function fAML_getComputedStyle(oElementDOM) {
	return oElementDOM.currentStyle || window.getComputedStyle(oElementDOM, null);
};

function fAML_getStyle(oElementDOM, sName) {
	var oStyle	= fAML_getComputedStyle(oElementDOM);
	if (sName == "opacity") {
		if (bTrident && nVersion < 9)
			return cString(cString(oStyle.filter).match(/opacity=([\.0-9]+)/i) ? oElementDOM.filters.item("DXImageTransform.Microsoft.Alpha").opacity / 100 : 1);
		else
			return cString(oStyle[sName]) || '1';
	}
	//
	return oStyle[sName == "borderColor" ? "borderBottomColor" : sName];
};

function fAML_setStyle(oElementDOM, sName, sValue) {
	var oStyle	= oElementDOM.style;
	if (sName == "opacity") {
		if (bTrident && nVersion < 9) {
			var sFilter	= cString(oElementDOM.currentStyle.filter),
				bFilter	= sFilter.match(/opacity=([\.0-9]+)/i);
			if (sValue < 1) {
				if (!bFilter) {
					oStyle.filter	= sFilter + ' ' + "progid" + ':' + "DXImageTransform.Microsoft.Alpha" + '(' + "opacity" + '=100)';
					if (!oElementDOM.currentStyle.hasLayout)
						oElementDOM.style.zoom	= '1';
				}
				oElementDOM.filters.item("DXImageTransform.Microsoft.Alpha").opacity	= cMath.round(sValue * 100);
			}
			else
			if (oElementDOM.filters.length == 1 && bFilter)	// Single opacity filter applied
				oStyle.removeAttribute("filter");
		}
		else
			oStyle[sName]	= sValue;
	}
	else
		oStyle[sName]	= sValue;
};

function fAML_stringToHash(sValue, sPrefix) {
	for (var hValue = {}, aValues = sValue.split(';'), nIndex = 0, nLength = aValues.length, aValue; nIndex < nLength; nIndex++)
		hValue[(aValue = aValues[nIndex].split(':'))[0]]	=(sPrefix || '') + aValue[1];
	return hValue;
};

function fAML_numberToHex(nValue, nLength/* =2 */) {
	var sValue	= cMath.abs(cMath.floor(nValue)).toString(16);
	if (!nLength)
		nLength	= 2;
	if (sValue.length < nLength)
		sValue	= cArray(nLength + 1 - sValue.length).join('0') + sValue;
	return sValue;
};

//
fAttachEvent(window, "load", function(oEvent) {
	// change readystate to "loaded"
	fAML_changeReadyState("loaded");

//->Source
	oUADocument.title	= "Initializing...";
//<-Source

    // Add to document, otherwise will not render VML
	oUADocument.body.appendChild(oAML_factory);
    oAML_factory.style.display	= "none";

	// Register window event listeners
	fAttachEvent(window, "resize", fOnResize);
	fAttachEvent(window, "scroll", fOnScroll);

	// Register document event listeners
	fAttachEvent(oUADocument, "keydown",	fOnKeyDown);
	fAttachEvent(oUADocument, "keyup",		fOnKeyUp);
	fAttachEvent(oUADocument, "keypress",	fOnKeyPress);
	fAttachEvent(oUADocument, "mouseover",	fOnMouseOver);
	fAttachEvent(oUADocument, "mousemove",	fOnMouseMove);
	fAttachEvent(oUADocument, "contextmenu",fOnContextMenu);
	fAttachEvent(oUADocument, "click",		fOnClick);
	fAttachEvent(oUADocument, "dblclick",	fOnDblClick);
	fAttachEvent(oUADocument, "mousedown",	fOnMouseDown);
	fAttachEvent(oUADocument, "mouseup",	fOnMouseUp);
	if (!bGecko) {
		fAttachEvent(oUADocument.body, "mousewheel",	fOnMouseWheel);
		if (bTrident)
			fAttachEvent(oUADocument, "selectstart",	fOnSelectStart);
	}
	else
		fAttachEvent(oUADocument.body, "DOMMouseScroll",	fOnMouseWheel);

	// Register touch events
	fAttachEvent(oUADocument, "touchstart",		fOnTouch);
	fAttachEvent(oUADocument, "touchmove",		fOnTouch);
	fAttachEvent(oUADocument, "touchend",		fOnTouch);
	fAttachEvent(oUADocument, "touchcancel",	fOnTouch);
	fAttachEvent(oUADocument, "gesturestart",	fOnGesture);
	fAttachEvent(oUADocument, "gesturechange",	fOnGesture);
	fAttachEvent(oUADocument, "gestureend",		fOnGesture);

	// Initialize
	// When running in Air, start in sync with onload
	if (bWebKit && window.runtime)
		fAML_initialize();
	else
		fSetTimeout(fAML_initialize, 0);
});

fAttachEvent(window, "unload", function(oEvent) {
//->Source
	oUADocument.title	= "Finalizing...";
//<-Source

    // Remove factory from document
	oUADocument.body.removeChild(oAML_factory);

    // Unregister document event listeners
	fDetachEvent(oUADocument, "keydown",	fOnKeyDown);
	fDetachEvent(oUADocument, "keyup",		fOnKeyUp);
	fDetachEvent(oUADocument, "keypress",	fOnKeyPress);
	fDetachEvent(oUADocument, "mouseover",	fOnMouseOver);
	fDetachEvent(oUADocument, "mousemove",	fOnMouseMove);
	fDetachEvent(oUADocument, "contextmenu",fOnContextMenu);
	fDetachEvent(oUADocument, "click",		fOnClick);
	fDetachEvent(oUADocument, "dblclick",	fOnDblClick);
	fDetachEvent(oUADocument, "mousedown",	fOnMouseDown);
	fDetachEvent(oUADocument, "mouseup",	fOnMouseUp);
	if (!bGecko) {
		fDetachEvent(oUADocument.body, "mousewheel",	fOnMouseWheel);
		if (bTrident)
			fDetachEvent(oUADocument, "selectstart",	fOnSelectStart);
	}
	else
		fDetachEvent(oUADocument.body, "DOMMouseScroll",	fOnMouseWheel);

	// Unregister touch events
	fDetachEvent(oUADocument, "touchstart",		fOnTouch);
	fDetachEvent(oUADocument, "touchmove",		fOnTouch);
	fDetachEvent(oUADocument, "touchend",		fOnTouch);
	fDetachEvent(oUADocument, "touchcancel",	fOnTouch);
	fDetachEvent(oUADocument, "gesturestart",	fOnGesture);
	fDetachEvent(oUADocument, "gesturechange",	fOnGesture);
	fDetachEvent(oUADocument, "gestureend",		fOnGesture);

	// Unregister window event listeners
	fDetachEvent(window, "resize", fOnResize);
	fDetachEvent(window, "scroll", fOnScroll);

	// Finalize
	fAML_finalize();
});
