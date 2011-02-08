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
beforeEach(function() {
	// Some custom matchers for readability !
	this.addMatchers({
		'toHaveBeenCalledExactly':function(times) {
			this.message=function() {
				if(this.actual.callCount!=times)
					return "Expected to has been called exactly '"+times+"' times, but was called '"
								+this.actual.callCount+"' times!";
			};
			return this.actual.callCount==times;
		},
		'toHaveBeenCalledAtLeast':function(times) {
			this.message=function() {
				if(this.actual.callCount>=times)
					return "Expected to has been called at least '"+times+"' times, but was called '"
								+this.actual.callCount+"' times!";
			};
			return this.actual.callCount>=times;
		},
		'toHaveBeenCalledWithArgumentTypes':function(){
			var args=arguments;
			this.message=function() {
				var actualArgsTypes=[];
				for(var i=0;i<this.actual.mostRecentCall.args.length;i++)
					actualArgsTypes.push(typeof(this.actual.mostRecentCall.args[i]));
				return "Expected to has been called exactly with argument types <"+jasmine.pp(args)+">, but was called <"+jasmine.pp(this.actual.argsForCall)+">";
			};
			if(args.length!=this.actual.mostRecentCall.args.length)
				return false;
			for(var i=0;i<args.length;i++)
				if(args[i]!=typeof(this.actual.mostRecentCall.args[i]))
					return false;
			return true;
		},
		'toBeInDocumentOnlyOnce': function() {
			this.message=function() {
				var s=this.actual.size();
				if(s==0)
					return "Expected to be in document only once, but it was not in the document";
				else
					return "Expected to be in document only once, but was duplicated <"+this.actual.size()+"> times";
			};
			return this.actual.size() == 1;
		}
	});
});