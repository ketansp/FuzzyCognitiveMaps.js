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

function Factor(id, name, x, y, parent) {
	this.id = id; // Id is the unique identifier. Temp_... id refer to newly created factors. 
	this.name = name;
	this.code;
	this.value;
	this.description;
	this.x = x; // X co-ordinate of center of factor circle on canvas
	this.y = y; // Y co-ordinate of center of factor circle on canvas
	//this.radius = radius;
	this.radius = 40; // Radius of factor circle
	this.parent = parent; // Reference of the canvas object
	this.svgElement; // Reference of the svg circle object
	this.svgTextElement; // Reference of the text svg object, which appear on factors
}

/**
 * This method populates element of factor editor popup
 */
Factor.prototype.showEditor = function(popup) {
	var self = this;
	// Assigns values from javascript object to popup elements.
	popup.find('#factor-editor-code').val(self.code);
	popup.find('#factor-editor-name').val(self.name);
	popup.find('#factor-editor-value').val(self.value);
	popup.find('#factor-editor-description').val(self.description);

	// Delete action
	popup.find("#factor-editor-delete-button").click(function() {
		self.deleteFactor();
		closePopup();
	});

	// Save action
	popup.find("#factor-editor-save-button").click(function() {
		// Every factor must have a name.
		if (typeof popup.find('#factor-editor-name').val() === "undefined" || popup.find('#factor-editor-name').val() == null || popup.find('#factor-editor-name').val().trim() == "") {
			alert(messages.ERROR_MESSAGE_FACTOR_NO_NAME);
			return false;
		}

		// Value must be numeric
		if (!isValidDouble(popup.find('#factor-editor-value').val())) {
			alert(messages.ERROR_MESSAGE_FACTOR_VALUE_INVALID);
			return false;
		}

		// Assigning updated values to javascript object
		self.code = popup.find('#factor-editor-code').val();
		self.name = popup.find('#factor-editor-name').val();
		self.value = popup.find('#factor-editor-value').val();
		self.description = popup.find('#factor-editor-description').val();

		// The name is being updated on the factor. It is trimmed if too long.
		self.svgTextElement.html((self.name.length > 10 ? (self.name.substring(0, 10) + '..') : self.name));
		closePopup();
	});

	// Cancel action
	popup.find("#factor-editor-cancel-button").click(function() {
		closePopup();
	});

	// Removes delete and save buttons if map is opened in non editable mode.
	if (self.parent.editable === false) {
		popup.find("#factor-editor-delete-button").remove();
		popup.find("#factor-editor-save-button").remove();
	}

}

/**
 * This method is called when a linkage needs to be deleted.
 */
Factor.prototype.deleteFactor = function() {
	var self = this;
	var index = self.parent.factors.indexOf(self);
	var count = self.parent.factors.length;
	// Wont delete the last remaining factor
	if (count == 1) {
		alert(messages.ERROR_MESSAGE_LAST_FACTOR_DELETION);
		return false;
	}

	if (index > -1) {
		self.svgElement.remove();
		self.svgTextElement.remove();
		self.parent.factors.splice(index, 1);

		// Deleted factors are added in an array.
		// Temp id factors are not added as they are not yet saved in database.
		if (String(self.id).indexOf('temp_') !== 0) {
			self.parent.deletedFactors.push(self);
		}

		// Linkages of that factor are also deleted
		var attachedLinkages = self.getLinkages();
		for (var i = 0; i < attachedLinkages; i++) {
			attachedLinkages[i].deleteLinkage();
		}

	}

}

/**
 * The method returns all linkages attached to current factor
 */
Factor.prototype.getLinkages = function() {
	var self = this;
	var ret = [];
	for (var i = 0; i < self.parent.linkages.length; i++) {
		// Factor must be either to or from in the linkage.
		if (self.parent.linkages[i].from.id == self.id || self.parent.linkages[i].to.id == self.id) {
			ret.push(self.parent.linkages[i]);
		}
	}
	return ret;
}