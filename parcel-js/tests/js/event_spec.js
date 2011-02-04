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
describe("appseed.Event", function() {
	var event, log;
	beforeEach(function(){
		log=jasmine.createSpy('<log>');
		event=new appseed.EventManager("event id", log);
	});
	
	it("notifies registered callbacks when fired", function() {
		var expectedEvent="expected event";
		var notifiedCallbacks=[];
		var callbacks=[];
		var newCallback=function(id) {
			var r=jasmine.createSpy('<event listener>').andCallFake(function(ev) {
				notifiedCallbacks.push(id);
			});
			callbacks[id]=r;
			return r;
		};
		
		event.register(newCallback(1), newCallback(2))
			.register(newCallback(3))
			.fire(expectedEvent);
		
		expect(callbacks[1]).toHaveBeenCalledWith(expectedEvent);
		expect(callbacks[2]).toHaveBeenCalledWith(expectedEvent);
		expect(callbacks[3]).toHaveBeenCalledWith(expectedEvent);		
		expect(notifiedCallbacks).toEqual([1,2,3]);
		expect(log).not.toHaveBeenCalled();
	});
	
	it("ignores duplicated callbacks", function() {
		var callback=jasmine.createSpy('<event listener>');
		
		event.register(callback, callback)
			.register(callback)
			.fire({});
		
		expect(callback).toHaveBeenCalledExactly(1);
		expect(log).not.toHaveBeenCalled();
	});
	
	it("notifies all callbacks even if one of them raises an error when fired", function() {
		var notifiedCallbacks=[];
		var newCallback=function(id, fails) {
			return function(ev) {
				notifiedCallbacks.push(id);
				if(fails)
					throw new Error("expect to fail "+id);
			}
		};
		
		event.register(newCallback(1, false), newCallback(2, true))
			.register(newCallback(3, false))
			.fire();
		
		expect(notifiedCallbacks).toEqual([1,2,3]);
		expect(log).toHaveBeenCalledExactly(1);
		expect(log.mostRecentCall.args[0]).toContain("expect to fail 2");
	});
	
	it("logs an error message if supplied with a log function when a callback raises an error", function() {
		var eventId='event name', errorMsg='an error msg';
		
		new appseed.EventManager(eventId, function(msg){
				expect(msg).toContain(eventId);
				expect(msg).toContain(errorMsg);
			})
			.register(function() {throw new Error(errorMsg);})
			.fire();
	});
});