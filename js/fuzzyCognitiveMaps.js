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
 * A method to convert maps json string into javascript objects and draw factors
 * and linkages accordingly on canvas.
 */
function loadMaps(mapsJson) {
	try {

		var obj = JSON.parse(mapsJson);
		maps.editable = obj.editable;
		for (var i = 0; i < obj.factors.length; i++) {
			maps.loadFactors(obj.factors[i]);
		}

		for (var j = 0; j < obj.linkages.length; j++) {
			maps.loadLinkage(obj.linkages[j].id, obj.linkages[j].from, obj.linkages[j].to, obj.linkages[j].type, obj.linkages[j].weight);
		}

		// Setting default values in case if dirty load
		if (typeof maps.editable === "undefined" || (!maps.editable === true && !maps.editable === false)) {
			maps.editable = true;
		}
		// a new factor is added if there are no factors present
		if (maps.factors.length == 0) {
			var newFactor = new Factor(('temp' + new Date().getTime()), 'Factor ' + 1, 0, 0, 40, maps);
			maps.addFactor(newFactor);
		}
	} catch (ex) {
		alert(messages.ERROR_MESSAGE_ERRORNOUS_LOAD);
		console.log(ex);
	}
}

/**
 * This method is to be called in order to save maps. The method will give data
 * in form of json string. The same needs to processed server side.
 */
function saveMaps() {
	try {

		var toBeSaved = (maps);
		for (var k = 0; k < toBeSaved.factors.length; k++) {
			// removing unneeded elements and references from javascript objects
			delete toBeSaved.factors[k].parent;
			delete toBeSaved.factors[k].svgElement;
			delete toBeSaved.factors[k].svgTextElement;
		}

		for (var j = 0; j < toBeSaved.deletedFactors.length; j++) {
			// removing unneeded elements and references from javascript objects
			delete toBeSaved.deletedFactors[j].parent;
			delete toBeSaved.deletedFactors[j].svgElement;
			delete toBeSaved.deletedFactors[j].svgTextElement;

		}

		for (var i = 0; i < toBeSaved.linkages.length; i++) {
			// in json output string, only the factor ids are stored in a linkage, not the object
			toBeSaved.linkages[i].from = toBeSaved.linkages[i].from.id;
			toBeSaved.linkages[i].to = toBeSaved.linkages[i].to.id;
			// removing unneeded elements and references from javascript objects
			delete toBeSaved.linkages[i].parent;
			delete toBeSaved.linkages[i].svgElement;

		}

		for (var l = 0; l < toBeSaved.deletedLinkages.length; l++) {
			// in json output string, only the factor ids are stored in a linkage, not the object
			toBeSaved.deletedLinkages[l].from = toBeSaved.deletedLinkages[l].from.id;
			toBeSaved.deletedLinkages[l].to = toBeSaved.deletedLinkages[l].to.id;
			// removing unneeded elements and references from javascript objects
			delete toBeSaved.deletedLinkages[l].parent;
			delete toBeSaved.deletedLinkages[l].svgElement;

		}

		// removing unneeded elements and references from javascript objects
		delete toBeSaved.zoomLevel;
		delete toBeSaved.xOrigin;
		delete toBeSaved.yOrigin;

		var json = JSON.stringify(toBeSaved); // conversion to json string
		$('#maps-json').val(json);
		console.log($('#maps-json').val());
		reloadMaps(); // A reload call is given once data is saved successfully. Gets rid on unnecessary data.
		alert(messages.CONFIRMATION_MESSAGE_SAVE_SUCCESSFUL);

		// additional code to save maps on server goes here.

	} catch (ex) {
		alert(messages.ERROR_MESSAGE_ERRORNOUS_SAVE);
		console.log(ex);
	}
}

/**
 * A method used for generating buttons from template. Action items are also
 * bound here. This method is called only once, on pageload.
 */
function loadComponents() {
	var buttonsBarTemplate = $($("#maps-templates").find("#buttons-bar").get(0).firstChild.nodeValue);
	//info button
	buttonsBarTemplate.find('#button-bar-info-button').click(function() {
		alert(messages.INFO_MESSAGE);
	});

	//reload button
	buttonsBarTemplate.find('#button-bar-reload-button').click(function() {
		reloadMaps();
	});

	//reset button
	buttonsBarTemplate.find('#button-bar-reset-button').click(function() {
		resetMaps();
	});

	//save button
	buttonsBarTemplate.find('#button-bar-save-button').click(function() {
		saveMaps();
	});

	//export button
	//This will export maps as a png image file.
	buttonsBarTemplate.find('#button-bar-export-button').click(function() {
		exportMaps();
	});

	$('body').prepend(buttonsBarTemplate);
}

/**
 * A method used for reloading the maps from json string. SVG elements and
 * javascript objects are freshly created.
 */
function reloadMaps() {
	canvasSpace.empty().removeClass('hasSVG').unbind();
	canvasSpace.svg();

	maps = new Canvas();
	maps.initilize();
	var mapsJson = $('#maps-json').val();
	loadMaps(mapsJson);
}

/**
 * A method used for clearing out the canvas. User is then left with a single
 * blank factor. SVG elements and javascript objects are freshly created.
 */
function resetMaps() {
	canvasSpace.empty().removeClass('hasSVG').unbind();
	canvasSpace.svg();

	maps = new Canvas();
	maps.initilize();
	var newFactor = new Factor(('temp' + new Date().getTime()), 'Factor 1', 0, 0, 40, maps);
	maps.addFactor(newFactor);

}

/**
 * This method is called to export the svg element of page as a png image.
 */
function exportMaps() {
	$('svg').toImage();
}
