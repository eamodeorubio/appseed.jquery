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
describe("appseed.NullLoader", function() {
	it("load() will simply allways call ready", function() {
		var artifactDescription={'ready':function() {}};
		spyOn(artifactDescription, 'ready');
		var loader=new appseed.NullLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
	});
});