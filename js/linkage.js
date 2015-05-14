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

function Linkage(id, from, to, parent) {
	this.id = id; // Id is the unique identifier. Temp_... id refer to newly created linkages. 
	this.from = from; // Reference of the from factor object
	this.to = to; // Reference of the to factor object
	this.type = 1; // Type of linkage
	this.weight = 0;
	this.parent = parent; // Reference of the canvas object
	this.svgElement; // Reference of the svg line object
}

/**
 * This method is called when a linkage needs to be deleted.
 */
Linkage.prototype.deleteLinkage = function() {
	var self = this;
	var index = self.parent.linkages.indexOf(self);
	if (index > -1) {
		self.svgElement.remove();
		self.parent.linkages.splice(index, 1);
		// Deleted linkages are added in an array.
		// Temp id linkages are not added as they are not yet saved in database.
		if (String(self.id).indexOf('temp_') !== 0) {
			self.parent.deletedLinkages.push(self);
		}
	}

}

/**
 * This method populates element of linkage editor popup
 */
Linkage.prototype.showEditor = function(popup) {
	var self = this;
	// Assigns values from javascript object to popup elements.
	popup.find('#linkage-editor-from-factor').html(self.from.name);
	popup.find('#linkage-editor-to-factor').html(self.to.name);
	popup.find('#linkage-editor-type').val(self.type);
	popup.find('#linkage-editor-weight').val(self.weight);

	// Delete button action 
	popup.find("#linkage-editor-delete-button").click(function() {
		self.deleteLinkage();
		closePopup();
	});

	// Save button action
	popup.find("#linkage-editor-save-button").click(function() {
		// Weight field accepts only numbers.
		if (!isValidDouble(popup.find('#linkage-editor-weight').val())) {
			alert(messages.ERROR_MESSAGE_LINKAGE_WEIGHT_INVALID);
			return false;
		}
		self.type = popup.find('#linkage-editor-type').val();
		self.weight = popup.find('#linkage-editor-weight').val();

		// If the linkage type is changed, corresponding colour is given to arrow.
		if (self.type > 0) {
			self.svgElement.css({
				stroke : 'green',
				'marker-end' : "url(#positiveMarker)"
			});
		} else if (self.type < 0) {
			self.svgElement.css({
				stroke : 'red',
				'marker-end' : "url(#negativeMarker)"
			});
		} else {
			self.svgElement.css({
				stroke : '#FF9900',
				'marker-end' : "url(#neutralMarker)"
			});
		}
		closePopup();
	});

	// Cancel button action
	popup.find("#linkage-editor-cancel-button").click(function() {
		closePopup();
	});

	// Removes delete and save buttons if map is opened in non editable mode.
	if (self.parent.editable === false) {
		popup.find("#linkage-editor-delete-button").remove();
		popup.find("#linkage-editor-save-button").remove();
	}

}
