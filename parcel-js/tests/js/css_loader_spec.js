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
// Created by Enrique J. Amodeo Rubio 2-January-2011
describe("appseed.CSSLoader", function() {
	beforeEach(function() {
		// Cleans link tags.
		$('link[synthetic]').remove();
	});
	
	var importedCSSWithURI=function(uri){
		return $('link[synthetic][rel="stylesheet"][type="text/css"][href="'+uri+'"]');
	};
	
	it("load() will insert the CSS in the document if not present, and then call ready anyway", function() {
		var artifactDescription={
			'uri':'the css uri',
			'ready':function() {
				expect(importedCSSWithURI('the css uri')).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		var loader=new appseed.CSSLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
		
		expect(importedCSSWithURI('the css uri')).toBeInDocumentOnlyOnce();
	});
});