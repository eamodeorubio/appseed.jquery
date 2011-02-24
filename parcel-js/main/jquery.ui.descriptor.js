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
		
		var repository = new appseed.ArtifactsRespository();
		
		$.fn.artifact = function(artifactId){
			return repository.artifact(artifactId);
		};
	})(jQuery);
}catch(err) {
	// OK !
}
