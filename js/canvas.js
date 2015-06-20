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

function Canvas() {
	this.factors = []; // An array of all factors
	this.linkages = []; // An array of all linkages between factors
	this.xOrigin; // The start point on x axis
	this.yOrigin; // The start point on y axis
	this.deletedFactors = []; // An array of deleted factors. Factors with temp id will not be added in this array.
	this.deletedLinkages = []; // An array of deleted linkages. Linkages with temp id will not be added in this array.
	this.editable = true; // A variable which determines the right to edit a map
}

/**
 * This method is called for loading the map elements on the screen.
 */
Canvas.prototype.initilize = function() {
	var self = this;

	// Center of the screen is treated as origin
	self.xOrigin = ($(window).width() - 30) / 2;
	self.yOrigin = ($(window).height() - 50) / 2;

	// Double click on canvas to create a new factor at that position
	canvasSpace.dblclick(function(e) {
		e.stopPropagation();
		// Wont let user create new factors if in non editable mode
		if (self.editable === false) {
			return false;
		}

		var newFactor = new Factor(('temp_' + new Date().getTime()), 'Factor ' + (self.factors.length + 1), (e.pageX - self.xOrigin), (e.pageY - self.yOrigin - 40), self);

		// Checking factors for overlapping positions
		for (var i = 0; i < self.factors.length; i++) {
			if (newFactor.id == self.factors[i].id) {
				continue;
			}
			if ((self.factors[i].radius + newFactor.radius) >= (Math.sqrt(Math.pow((self.factors[i].x - newFactor.x), 2)
					+ Math.pow((self.factors[i].y - newFactor.y), 2)))) {
				alert(messages.ERROR_MESSAGE_FACTOR_OVERLAPPING_POSITION);
				return false;
			}

		}

		self.addFactor(newFactor);
	});

	// Creating a SVG element for canvas and appending marker definitions.
	// Maker definitions are used for creating arrow heads.
	canvasSpace.svg();
	var svg = $(canvasSpace.svg('get'));
	canvasSpace
			.find('svg')
			.html(
					'<defs><marker id="positiveMarker" viewBox="0 0 10 10" refX="28" refY="5" markerUnits="userSpaceOnUse" orient="auto" markerWidth="20" markerHeight="20"> <polyline points="0,0 10,5 0,10 1,5" fill="green" /></marker>'
							+ '<marker id="negativeMarker" viewBox="0 0 10 10" refX="28" refY="5" markerUnits="userSpaceOnUse" orient="auto" markerWidth="20" markerHeight="20"> <polyline points="0,0 10,5 0,10 1,5" fill="red" /></marker>'
							+ '<marker id="neutralMarker" viewBox="0 0 10 10" refX="28" refY="5" markerUnits="userSpaceOnUse" orient="auto" markerWidth="20" markerHeight="20"> <polyline points="0,0 10,5 0,10 1,5" fill="#FF9900" /></marker></defs>');

}

/**
 * This method resizes the canvas and repositions the elements as well
 */
Canvas.prototype.resize = function() {
	var self = this;

	// Defining new dimensions
	canvasSpace.css({
		width : ($(window).width() - 30),
		height : ($(window).height() - 50)
	});
	canvasSpace.find('svg').css({
		width : ($(window).width() - 30),
		height : ($(window).height() - 50)
	});

	// Defining new origin point
	self.xOrigin = ($(window).width() - 30) / 2;
	self.yOrigin = ($(window).height() - 50) / 2;
	self.redraw();
}

/**
 * This method redraws all visual elements as per new dimensions and origin
 * point.
 */
Canvas.prototype.redraw = function() {
	self = this;

	// Redrawing all factors
	for (var i = 0; i < self.factors.length; i++) {
		self.factors[i].svgElement.attr('cx', self.xOrigin + self.factors[i].x);
		self.factors[i].svgElement.attr('cy', self.yOrigin + self.factors[i].y);
		self.factors[i].svgTextElement.attr('x', self.xOrigin + self.factors[i].x - self.factors[i].radius + 7);
		self.factors[i].svgTextElement.attr('y', self.yOrigin + self.factors[i].y + 5);
	}

	// Redrawing all linkages
	for (var j = 0; j < self.linkages.length; j++) {
		self.linkages[j].svgElement.find('line').attr('x1', self.xOrigin + self.linkages[j].from.x);
		self.linkages[j].svgElement.find('line').attr('y1', self.yOrigin + self.linkages[j].from.y);
		self.linkages[j].svgElement.find('line').attr('x2', self.xOrigin + self.linkages[j].to.x);
		self.linkages[j].svgElement.find('line').attr('y2', self.yOrigin + self.linkages[j].to.y);
	}

}

/**
 * This method generates the visual element for a factor and defines its
 * behaviour as well.
 */
Canvas.prototype.addFactor = function(factor) {
	var self = this;

	var svg = canvasSpace.svg('get');
	// Creating a SVG circle
	var svgCircle = $(svg.circle(self.xOrigin + factor.x, self.yOrigin + factor.y, factor.radius));

	// Creating SVG text
	// Text is trimmed if too long
	var textElement = $(svg.text((parseInt(svgCircle.attr('cx')) - parseInt(svgCircle.attr('r')) + 7), (parseInt(svgCircle.attr('cy')) + 5),
			factor.name.length > 10 ? (factor.name.substring(0, 10) + '..') : factor.name, {
				class : "factor-text"
			}));

	// Double click on text element opens the editor 
	textElement.on('dblclick', function(e) {
		self.showFactorEditor(factor);
		e.stopPropagation();
	});

	// Hover action for text element
	// Expends text is hovered
	textElement.hover(function() {
		$('svg').append(textElement);
		textElement.html(factor.name);
	}, function() {
		textElement.html((factor.name.length > 10 ? (factor.name.substring(0, 10) + '..') : factor.name));
	});

	// attaching reference of text element on factor object
	factor.svgTextElement = textElement;

	// css properties of circle
	svgCircle.css({
		'fill' : '#D1F0FF',
		'stroke' : '#3D7A99',
		'strokeWidth' : '3',
		'position' : 'absolute'
	});

	// Double click on circle to open factor ediot
	svgCircle.dblclick(function(e) {
		self.showFactorEditor(factor);
		e.stopPropagation();
	});

	// backup variables
	var links;
	var originalX = factor.x;
	var originalY = factor.y;

	// hovering on circle changes its style
	svgCircle.hover(function() {
		svgCircle.css({
			'fill' : '#D1F0FF',
			'stroke' : '#3D7A99',
			'strokeWidth' : '6',
			'position' : 'absolute',
			'cursor' : 'move'
		});

	}, function() {
		svgCircle.css({
			'fill' : '#D1F0FF',
			'stroke' : '#3D7A99',
			'strokeWidth' : '3',
			'position' : 'absolute'
		});
	});

	// Defining drag functions on circle to reposition it or to create a new linkage 
	svgCircle.draggable().bind('dragstart', function(e) {
		e.stopPropagation(); //stops the mousedown calls of deeper layer elements

		// Wont be able to move if in non editable mode
		if (self.editable === false) {
			return false;
		}

		links = factor.getLinkages();
		originalX = factor.x;
		originalY = factor.y;
		factor.svgTextElement.remove(); // Temporarily removing text element while moving

	}).bind('drag', function(e) {
		e.stopPropagation(); // Stops the drag calls of deeper layer elements
		// Wont be able to move if in non editable mode
		if (self.editable === false) {
			return false;
		}

		// Moving circle to new position
		$(canvasSpace[0].firstChild).append(factor.svgElement);
		svgCircle.attr('cx', e.pageX);
		svgCircle.attr('cy', e.pageY - 40);
		factor.x = e.pageX - self.xOrigin;
		factor.y = e.pageY - self.yOrigin - 40;

		// Moving likages arrows as per new position of the factor
		for (var i = 0; i < links.length; i++) {
			if (links[i].from.id == factor.id) {
				links[i].svgElement.find('line').attr('x1', e.pageX);
				links[i].svgElement.find('line').attr('y1', e.pageY - 40);
			} else if (links[i].to.id == factor.id) {
				links[i].svgElement.find('line').attr('x2', e.pageX);
				links[i].svgElement.find('line').attr('y2', e.pageY - 40);
			}
		}

	}).bind('dragstop',
			function(e) {
				e.stopPropagation(); // Stops the drag calls of deeper layer elements
				// Wont be able to move if in non editable mode
				if (self.editable === false) {
					return false;
				}

				// Validate the new position of the factor.
				// Below call determines whether to move factor or to create a new linkage.
				validateMovementOrCreateLinkage();
				factor.svgTextElement.remove();

				// Re-attaching the text element and its action items
				var textElement = $(svg.text((parseInt(svgCircle.attr('cx')) - parseInt(svgCircle.attr('r')) + 7), (parseInt(svgCircle.attr('cy')) + 5), factor.name.length > 10 ? (factor.name
						.substring(0, 10) + '..') : factor.name, {
					class : "factor-text"
				}));
				textElement.dblclick(function(e) {
					e.stopPropagation();
					self.showFactorEditor(factor);

				});
				textElement.hover(function() {
					$('svg').append(textElement);
					textElement.html(factor.name);
				}, function() {
					textElement.html((factor.name.length > 10 ? (factor.name.substring(0, 10) + '..') : factor.name));
				});

				factor.svgTextElement = textElement; // Attaching a reference to factor object

			});

	/**
	 * This method determines whether to reposition the factor or to create a
	 * new linkage if factor overlaps with another factor.
	 */
	function validateMovementOrCreateLinkage() {

		for (var i = 0; i < factor.parent.factors.length; i++) {
			if (factor.id == factor.parent.factors[i].id) {
				continue;
			}
			// Check if new position overlaps with another factor
			// Factor is moved if it doesnt
			if ((factor.parent.factors[i].radius + factor.radius) >= (Math.sqrt(Math.pow((factor.parent.factors[i].x - factor.x), 2) + Math.pow((factor.parent.factors[i].y - factor.y), 2)))) {

				// Repositioning the factor
				factor.x = originalX;
				factor.y = originalY;
				svgCircle.attr('cx', self.xOrigin + factor.x);
				svgCircle.attr('cy', self.yOrigin + factor.y);

				// Repositioning its linkages
				for (var k = 0; k < links.length; k++) {
					if (links[k].from.id == factor.id) {
						links[k].svgElement.find('line').attr('x1', self.xOrigin + factor.x);
						links[k].svgElement.find('line').attr('y1', self.yOrigin + factor.y);
					} else if (links[k].to.id == factor.id) {
						links[k].svgElement.find('line').attr('x2', self.xOrigin + factor.x);
						links[k].svgElement.find('line').attr('y2', self.yOrigin + factor.y);
					}
				}

				// Creating a linkage if position overlaps
				if (!self.checkIfLinkageExists(factor, factor.parent.factors[i]) && !self.checkIfLinkageExists(factor.parent.factors[i], factor)) {
					self.addLinkage(('temp_' + new Date().getTime()), factor, factor.parent.factors[i], 1, '');
					alert(messages.CONFIRMATION_MESSAGE_NEW_LINKAGE_CREATED);
				} else {
					// There can not be more than one linkage between two factors
					alert(messages.ERROR_MESSAGE_DUPLICATE_LINKAGE);
				}

				return false;

			}

		}
	}

	factor.svgElement = svgCircle; // Attaching reference
	self.factors.push(factor); // Adding to array

}

/**
 * This method validates and loads a linkage
 */
Canvas.prototype.loadLinkage = function(id, fromId, toId, type, weight) {
	var self = this;
	var factorsFound = false;
	var from, to;

	// From and To can not be same.
	if (fromId == toId) {
		return false;
	}

	// Checking whether fromId and toId are valid. Both must exist.
	for (var i = 0; i < self.factors.length; i++) {
		if (self.factors[i].id == fromId) {
			from = self.factors[i];
		}
		if (self.factors[i].id == toId) {
			to = self.factors[i];
		}
		if (from && to) {
			factorsFound = true;
			break;
		}
	}

	// Linkage is added only if factor ids are valid
	if (factorsFound === true) {
		self.addLinkage(id, from, to, type, weight);
	} else {
		return false;
	}
}

/**
 * This method builds and adds linkage to canvas
 */
Canvas.prototype.addLinkage = function(id, from, to, type, weight) {
	var self = this;

	// type < 0 means negative relationship
	// type > 0 means positive relationship
	// type = 0 means neutral relationship
	if (type && type > 0) {
		type = 1;
	} else if (type && type < 0) {
		type = -1;
	} else {
		type = 0;
	}

	// Hygiene check for weight
	if (weight) {
		weight = weight;
	} else {
		weight = 0;
	}

	var link = new Linkage(id, from, to, self);
	link.type = type;
	link.weight = weight;

	// Creating a SVG line and attaching a proper maker to it according to its type
	var svg = canvasSpace.svg('get');
	if (link.type > 0) {
		var g = $(svg.group({
			stroke : 'green',
			strokeWidth : '4',
			'marker-end' : "url(#positiveMarker)"
		}));
	} else if (link.type < 0) {
		var g = $(svg.group({
			stroke : 'red',
			strokeWidth : 4,
			'marker-end' : "url(#negativeMarker)"
		}));
	} else {
		var g = $(svg.group({
			stroke : '#FF9900',
			strokeWidth : 4,
			'marker-end' : "url(#neutralMarker)"
		}));
	}

	var svgLine = $(svg.line(g, this.xOrigin + from.x, this.yOrigin + from.y, this.xOrigin + to.x, this.yOrigin + to.y));

	// Line is removed here and appended back again later. This is because, it needs to be first most element on canvas to be at the back. 
	g.remove();

	// Hover actions
	g.hover(function() {
		g.css({
			'strokeWidth' : '10'
		});
	}, function() {
		g.css({
			'strokeWidth' : '4'
		});
	});

	// Double click action opens the editor
	g.dblclick(function(e) {
		e.stopPropagation(); // stops the double click of layers behind this element
		self.showLinkageEditor(link);
	});

	// SVG element is prepended. This throws it at backmost position
	$(canvasSpace[0].firstChild).prepend(g);
	link.svgElement = g;

	// Adding linkage in array
	self.linkages.push(link);

}

/**
 * This method validates and loads a factor
 */
Canvas.prototype.loadFactors = function(factor) {
	var self = this;
	var newFactor = new Factor(factor.id, factor.name, factor.x, factor.y, self);
	newFactor.value = factor.value;
	newFactor.code = factor.code;
	newFactor.description = factor.description;
	self.addFactor(newFactor);
}

/**
 * This method when called, generates the editor popup
 */
Canvas.prototype.showFactorEditor = function(factor) {
	var self = this;
	var popup = createPopup(530, 145);
	// Contents of the popup are generated from templates.
	// The commented code inside templates is grabbed and dom object is created out of it.
	var editorTemplate = $("#maps-templates").find("#factor-editor").get(0).firstChild.nodeValue;
	popup.append(editorTemplate);
	factor.showEditor(popup);
}

/**
 * This method when called, generates the editor popup
 */
Canvas.prototype.showLinkageEditor = function(linkage) {
	var self = this;
	var popup = createPopup(500, 110);
	// Contents of the popup are generated from templates.
	// The commented code inside templates is grabbed and dom object is created out of it.
	var editorTemplate = $("#maps-templates").find("#linkage-editor").get(0).firstChild.nodeValue;
	popup.append(editorTemplate);
	linkage.showEditor(popup);
}

/**
 * This method returns a factor object is an id is passed to it
 */
Canvas.prototype.getFactorById = function(id) {
	var ret;
	for (var i = 0; i < this.factors.length; i++) {
		if (this.factors.id == id) {
			ret = this.factors[i];
			break;
		}
		return ret;
	}
}

/**
 * This method checks if a linkage exists between two factors.
 */
Canvas.prototype.checkIfLinkageExists = function(from, to) {
	var self = this;
	var ret = false;
	for (var i = 0; i < self.linkages.length; i++) {
		if (self.linkages[i].from.id == from.id && self.linkages[i].to.id == to.id) {
			ret = true;
			break;
		}
	}

	return ret;
}

/**
 * This method returns a linkage if from and to factor objects are passed to it.
 * There can be at max a single linkage between any two factors
 */
Canvas.prototype.getLinkage = function(from, to) {
	var self = this;
	var ret;
	for (var i = 0; i < self.linkages.length; i++) {
		if (self.linkages[i].from.id == from.id && self.linkages[i].to.id == to.id) {
			ret = self.linkages[i];
			break;
		}
	}

	return ret;
}