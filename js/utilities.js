/*
Copyright (c) 2015 Ketan Patil (100.percent.ketan@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
 */

/**
 * This method is called when a popup box needs to be created on page.
 */
function createPopup(width, height) {

	$("#popup-parent").remove(); // Making sure existing popup, if any, is removed from dom.

	var bg = $("<div>").attr("id", "popup-parent");
	bg.css({
		position : 'fixed',
		top : "0px",
		paddingTop : "50px",
		left : 0,
		width : '100%',
		height : '100%'
	});
	bg.append("<div id='popup-container'></div>");

	var ret = bg.find("#popup-container");
	ret.css({
		width : width,
		height : height,
		top : 10,
		"-moz-box-shadow" : '1px 1px 6px #333333',
		overflow : 'auto',
		"-webkit-box-shadow" : '1px 1px 6px #333333',
		border : '8px solid #777',
		backgroundColor : "#fff",
		margin : "auto",
		zIndex : 100
	});

	var bdiv = $("<div>").css({
		width : width,
		position : "relative",
		height : "0px",
		textAlign : "right",
		margin : "auto"
	});

	// attaching it to html page's body
	bg.prepend(bdiv);
	$("body").append(bg);

	// close call callback
	bg.bind("close", function() {
		bg.slideUp(300, function() {
			bg.remove();

			// Any additional stuff goes here.

		});
	});

	return ret;
}

/**
 * The method triggers close action of the displayed popup.
 */
function closePopup() {
	getPopup().trigger("close");
}

/**
 * The method returns the reference of popup of its open
 */
function getPopup(){
	  var ret=$("#popup-parent");
	  if (typeof(top)!="undefined"){
	    ret= window.parent.$("#popup-parent");
	  }
	  return ret;
	}

/**
 * This method clones javascript objects. It creates new objects and properties
 * instead of just passing references. It is very helpful when original objects
 * needs to sustain its properties.
 */
function cloneObject(obj) {
	var ret = {};
	for ( var key in obj) {
		if (typeof (obj[key]) != "function") {
			if (typeof (obj[key]) !== "object") {
				ret[key] = obj[key];
			} else if (typeof (obj[key]) === "object") {
				ret[key] = cloneObject(obj[key]);
			}
		}
	}
	return ret;
}

/**
 * A function used for checking if a value is a valid number or not
 */
function isValidDouble(n) {
	reg = new RegExp("^[-+]{0,1}[0-9]*[" + '.' + "]{0,1}[0-9]*$");
	return reg.test(n);
}

/**
 * Converts an SVG element to an IMG element with the same dimensions and same
 * visual content. The IMG src will be a base64-encoded image. Works in Webkit
 * and Firefox (not IE).
 */
$.fn.toImage = function() {
	$(this).each(function() {
		var svg$ = $(this);
		var width = svg$.width();
		var height = svg$.height();

		$(this).find('text').css({
			'font-size' : '12px',
			'color' : 'black',
			'font-weight' : 'bold',
			'overflow' : 'hidden',
			'text-overflow' : 'ellipsis',
			'width' : '100px'
		});
		// Create a blob from the SVG data
		var svgData = new XMLSerializer().serializeToString(this);

		var blob = new Blob([
			svgData
		], {
			type : "image/svg+xml;charset=utf-8"
		});

		// Get the blob's URL
		var domUrl = window.URL || window.webkitURL || window;
		var blobUrl = domUrl.createObjectURL(blob);

		// Load the blob into a temporary image
		$('<img />').width(width).height(height).on('load', function() {
			try {
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');

				// Start with white background (optional; transparent otherwise)
				ctx.fillStyle = '#fff';
				ctx.fillRect(0, 0, width, height);

				// Draw SVG image on canvas
				ctx.drawImage(this, 0, 0);

				//forcing the browser to start download
				var a = document.createElement('a');
				a.href = canvas.toDataURL();
				a.download = "fuzzy_cognitive_maps.png";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);

			} finally {
				domUrl.revokeObjectURL(blobUrl);
			}
		}).attr('src', blobUrl);
	});
};