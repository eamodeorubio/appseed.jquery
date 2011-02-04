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
describe("appseed.AjaxConnectionFactory", function() {
	var connectionFactory, readyCallback, errorCallback;
	beforeEach(function(){
		readyCallback=jasmine.createSpy('<ready callback>');
		errorCallback=jasmine.createSpy('<error callback>');
		connectionFactory=new appseed.AjaxConnectionFactory();
	});
	
	var waitForAnyCallbackToBeCalled=function() {
		waitsFor(function(){
			return readyCallback.callCount>0||errorCallback.callCount>0;
		}, '<any AJAX callbacks to be called>', 500);
	};
	
	it("given the resource exists, doGet will call ready with the contents of the requested resource", function(){
		var fileContents="Hola Mariola\nSoy un fichero\najaxxxxxxxxx";
		connectionFactory
			.newConnection()
			.doGet('./testResource.pepe', readyCallback, errorCallback);
		
		waitForAnyCallbackToBeCalled();
		
		runs(function() {
			expect(errorCallback).not.toHaveBeenCalled();
			expect(readyCallback).toHaveBeenCalledExactly(1);
			expect(readyCallback).toHaveBeenCalledWith(fileContents);
		});
	});
	
	it("given the resource does not exists, doGet will call error with an error", function(){
		connectionFactory
			.newConnection()
			.doGet('./testResourceNotExists.pepe', readyCallback, errorCallback);
		
		waitForAnyCallbackToBeCalled();
		
		runs(function() {
			expect(readyCallback).not.toHaveBeenCalled();
			expect(errorCallback).toHaveBeenCalledExactly(1);
			expect(typeof(errorCallback.mostRecentCall.args[0])).toEqual('string');
			expect(errorCallback.mostRecentCall.args[1]).toEqual(404);
		});
	});
	
	it("given a request is in progress, calling doGet again will not have effect", function() {
		connectionFactory
			.newConnection()
			.doGet('./testResource.pepe', readyCallback, errorCallback)
			.doGet('./testResource.pepe', readyCallback, errorCallback)
			.doGet('./testResource.pepe', readyCallback, errorCallback);
		
		waitForAnyCallbackToBeCalled();
		
		runs(function() {
			expect(errorCallback).not.toHaveBeenCalled();
			expect(readyCallback).toHaveBeenCalledExactly(1);
		});
	});
});