/*! This file is part of appseed.jquery/parcel-js and distributed under LGPL V3 */
/*
This file is part of appseed.jquery/parcel-js

xQuiD is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

xQuiD is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with appseed.jquery/parcel-js. If not, see <http://www.gnu.org/licenses/>.
*/
// Created by Enrique J. Amodeo Rubio 24-February-2011
/*
 It contains a jQuery plugin encapsulating a single parcel-js repository
 */
try {
	(function($){
		if (!$) 
			return;
		
		var repository = new appseed.ArtifactsRepository();
		
		$.fn.artifact = function(artifactId){
			return repository.artifact(artifactId);
		};
	})(jQuery);
}catch(err) {
	// OK !
	// jQuery is not defined so no plugin !
}
if (!appseed) {
	var appseed = {};
};
appseed.describeJQueryUI=function(baseURI) {
	if(!baseURI)
		baseURI='./';
	var uri=baseURI;
	if(uri.lastIndexOf('/') != (uri.length - 1))
		uri+='/';
	
	jQuery
		.artifact('jquery.ui.core')
		.isAScript(uri+'js/jquery.ui.core.min.js')
		.isReadyWhen(function() {return jQuery&&typeof(jQuery.ui)!='undefined';});
	jQuery
		.artifact('jquery.ui.widget')
		.requires('jquery.ui.core')
		.isAScript(uri+'js/jquery.ui.widget.min.js')
		.isReadyWhen(function() {return jQuery&&typeof(jQuery.widget)!='undefined';});
	jQuery
		.artifact('jquery.ui.position')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.mouse.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.position)!='undefined';});
	jQuery
		.artifact('jquery.ui.mouse')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.mouse.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.mouse)!='undefined';});
	jQuery
		.artifact('jquery.ui.resizable')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.resizable.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.resizable)!='undefined';});
	jQuery
		.artifact('jquery.ui.sortable')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.sortable.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.sortable)!='undefined';});
	jQuery
		.artifact('jquery.ui.selectable')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.selectable.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.selectable)!='undefined';});
	jQuery
		.artifact('jquery.ui.slider')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.slider.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.slider)!='undefined';});
	jQuery
		.artifact('jquery.ui.draggable')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.draggable.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.draggable)!='undefined';});
	jQuery
		.artifact('jquery.ui.droppable')
		.requires('jquery.ui.core')
		.requires('jquery.ui.mouse')
		.requires('jquery.ui.widget')
		.requires('jquery.ui.draggable')
		.isAScript(uri+'js/jquery.ui.droppable.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.droppable)!='undefined';});
	jQuery
		.artifact('jquery.ui.accordion')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.accordion.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.accordion)!='undefined';});
	jQuery
		.artifact('jquery.ui.autocomplete')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.requires('jquery.ui.position')
		.isAScript(uri+'js/jquery.ui.autocomplete.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.autocomplete)!='undefined';});
	jQuery
		.artifact('jquery.ui.dialog')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.requires('jquery.ui.position')
		.requires('jquery.ui.draggable')
		.requires('jquery.ui.resizable')
		.isAScript(uri+'js/jquery.ui.dialog.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.dialog)!='undefined';});
	jQuery
		.artifact('jquery.ui.button')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.button.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.button)!='undefined';});
	jQuery
		.artifact('jquery.ui.progressbar')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.progressbar.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.progressbar)!='undefined';});
	jQuery
		.artifact('jquery.ui.tabs')
		.requires('jquery.ui.core')
		.requires('jquery.ui.widget')
		.isAScript(uri+'js/jquery.ui.tabs.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.fn&&typeof(jQuery.fn.tabs)!='undefined';});
	jQuery
		.artifact('jquery.ui.datepicker')
		.requires('jquery.ui.core')
		.isAScript(uri+'js/jquery.ui.datepicker.min.js')
		.isReadyWhen(function() {return jQuery&&typeof(jQuery.datepicker)!='undefined';});
	
	jQuery
		.artifact('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.core.min.js')
		.isReadyWhen(function() {return jQuery&&typeof(jQuery.effects)!='undefined';});
	jQuery
		.artifact('jquery.effects.blind')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.blind.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.blind)!='undefined';});
	jQuery
		.artifact('jquery.effects.bounce')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.bounce.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.bounce)!='undefined';});
	jQuery
		.artifact('jquery.effects.clip')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.clip.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.clip)!='undefined';});
	jQuery
		.artifact('jquery.effects.drop')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.drop.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.drop)!='undefined';});
	jQuery
		.artifact('jquery.effects.explode')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.explode.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.explode)!='undefined';});
	jQuery
		.artifact('jquery.effects.fade')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.fade.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.fade)!='undefined';});
	jQuery
		.artifact('jquery.effects.fold')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.fold.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.fold)!='undefined';});
	jQuery
		.artifact('jquery.effects.highlight')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.highlight.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.highlight)!='undefined';});
	jQuery
		.artifact('jquery.effects.pulsate')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.pulsate.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.pulsate)!='undefined';});
	jQuery
		.artifact('jquery.effects.scale')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.scale.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.scale)!='undefined';});
	jQuery
		.artifact('jquery.effects.shake')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.shake.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.shake)!='undefined';});
	jQuery
		.artifact('jquery.effects.slide')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.slide.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.slide)!='undefined';});
	jQuery
		.artifact('jquery.effects.transfer')
		.requires('jquery.effects.core')
		.isAScript(uri+'js/jquery.effects.transfer.min.js')
		.isReadyWhen(function() {return jQuery&&jQuery.effects&&typeof(jQuery.effects.transfer)!='undefined';});
		
	jQuery
		.artifact('jquery.ui.i18n')
		.requires('jquery.ui.datepicker')
		.isAScript(uri+'js/jquery-ui-i18n.js');
	
	jQuery
		.artifact('jquery.themes.humanity')
		.isACSS(uri+'themes/humanity/jquery-ui-1.8.9.custom.css');
	jQuery
		.artifact('jquery.themes.start')
		.isACSS(uri+'themes/start/jquery-ui-1.8.9.custom.css');
	jQuery
		.artifact('jquery.themes.sunny')
		.isACSS(uri+'themes/sunny/jquery-ui-1.8.9.custom.css');
	jQuery
		.artifact('jquery.themes.ui-lightness')
		.isACSS(uri+'themes/ui-lightness/jquery-ui-1.8.9.custom.css');
}
