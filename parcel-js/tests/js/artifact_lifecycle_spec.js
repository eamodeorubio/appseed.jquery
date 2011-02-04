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
		'toHaveBeenCalledWithALoadingEvent':function(resourceId) {
			var ev=this.actual.mostRecentCall.args[0];
			this.message=function() { return "Not a loading event for resource '"+resourceId+"'. It was <"+jasmine.pp(ev)+">"; }
			return ev.artifactId()==resourceId
					&&ev.status().isLoading()
					&&!ev.status().isError()
					&&!ev.status().isReady();
		},
		'toHaveBeenCalledWithAReadyEvent':function(resourceId, detail) {
			var ev=this.actual.mostRecentCall.args[0];
			this.message=function() { return "Not a ready event for resource '"+resourceId+"'. It was <"+jasmine.pp(ev)+">"; }
			return ev.artifactId()==resourceId
					&&!ev.status().isLoading()
					&&!ev.status().isError()
					&&ev.status().isReady()
					&&ev.detail()==detail;
		},
		'toHaveBeenCalledWithAnErrorEvent':function(resourceId, errorDetail) {
			var ev=this.actual.mostRecentCall.args[0];
			this.message=function() { return "Not an error event for resource '"+resourceId+"'. It was <"+jasmine.pp(ev)+">"; }
			return ev.artifactId()==resourceId
					&&!ev.status().isLoading()
					&&ev.status().isError()
					&&!ev.status().isReady()
					&&ev.detail()==errorDetail;
		}
	});
});

describe("appseed.ArtifactLifecycleManager", function() {
	var resourceId='a resource id';
	var readyDetail='ready data'
		, errorDetail='an error detail';
	
	var lifecycleManager, events;
	beforeEach(function(){
		events={};
		lifecycleManager=new appseed.ArtifactLifecycleManager(resourceId, function(id, log){
			expect(id).toContain(resourceId);
			expect(log).toBeDefined();
			r={
				'id':id,
				'log':log,
				'fire':function(){},
				'register':function(){}
			};
			spyOn(r, 'fire');
			spyOn(r, 'register');
			if(id.indexOf('Ready')!=-1)
				events['Ready']=r;
			else if(id.indexOf('Error')!=-1)
				events['Error']=r;
			else if(id.indexOf('Loading')!=-1)
				events['Loading']=r;
			else if(id.indexOf('Loaded')!=-1)
				events['Loaded']=r;
			return r;
		});
	});
	
	var createRegisterEventCallbackSpec=function(eventName, registerCallbackMethodName) {
		it(registerCallbackMethodName+" registers callbacks for the '"+eventName+"' event", function() {
			var registeredCallbacks=[];
			events[eventName].register.andCallFake(function() {
				for(var i=0;(this.id.indexOf(eventName)!=-1)&&i<arguments.length;i++)
					registeredCallbacks.push(arguments[i]);
			});
			
			var f1=function() {return 1;};
			var f2=function() {return 2;};
			var f3=function() {return 3;};
			
			lifecycleManager
				[registerCallbackMethodName](f1, f2)
				[registerCallbackMethodName](f3);
			
			expect(registeredCallbacks).toEqual([f1, f2, f3]);
		});
	}
	
	var eventNames=['Loading', 'Ready', 'Error', 'Loaded'];
	for(var i=0;i<eventNames.length;i++)
		createRegisterEventCallbackSpec(eventNames[i], 'whenIs'+eventNames[i]);
	
	var expectLifecycleInLoadingState=function(){
		lifecycleManager
			.startLoading();
		
		expect(events['Loading'].fire).toHaveBeenCalledExactly(1);
		expect(events['Loading'].fire).toHaveBeenCalledWithALoadingEvent(resourceId);
		
		return lifecycleManager;
	};
	
	it("given the lifecycle is in NOT_LOADED state, when startLoading is invoked, 'Loading' state event is fired only once", function() {
		expectLifecycleInLoadingState()
			.startLoading()
			.startLoading();
		
		expect(events['Loading'].fire).toHaveBeenCalledExactly(1);
		expect(events['Loading'].fire).toHaveBeenCalledWithALoadingEvent(resourceId);
		expect(events['Error'].fire).not.toHaveBeenCalled();
		expect(events['Loaded'].fire).not.toHaveBeenCalled();
		expect(events['Ready'].fire).not.toHaveBeenCalled();
	});
	
	it("given the lifecycle is in NOT_LOADED state, loadSuccessful and errorLoading will do nothing", function(){
		lifecycleManager
			.loadSuccessful(readyDetail)
			.errorLoading(errorDetail);
		
		expect(events['Loading'].fire).not.toHaveBeenCalled();
		expect(events['Error'].fire).not.toHaveBeenCalled();
		expect(events['Loaded'].fire).not.toHaveBeenCalled();
		expect(events['Ready'].fire).not.toHaveBeenCalled();
	});
	
	var checkProperNotificationForReadyState=function() {
		expect(events['Ready'].fire).toHaveBeenCalledExactly(1);
		expect(events['Ready'].fire).toHaveBeenCalledWithAReadyEvent(resourceId, readyDetail);
		
		expect(events['Loaded'].fire).toHaveBeenCalledExactly(1);
		expect(events['Loaded'].fire).toHaveBeenCalledWithAReadyEvent(resourceId, readyDetail);
		
		expect(events['Error'].fire).not.toHaveBeenCalled();
	};
	
	var expectLifecycleInReadyState=function() {
		expectLifecycleInLoadingState()
			.loadSuccessful(readyDetail);
		
		checkProperNotificationForReadyState();
		
		return lifecycleManager;
	};
	
	it("given the lifecycle is LOADING, loadSuccessful will change state to Ready and the proper notifications will be made", function(){
		expectLifecycleInReadyState()
			.loadSuccessful(readyDetail);
		
		checkProperNotificationForReadyState();
	});
	
	var checkProperNotificationForErrorState=function() {
		expect(events['Error'].fire).toHaveBeenCalledExactly(1);
		expect(events['Error'].fire).toHaveBeenCalledWithAnErrorEvent(resourceId, errorDetail);
		
		expect(events['Loaded'].fire).toHaveBeenCalledExactly(1);
		expect(events['Loaded'].fire).toHaveBeenCalledWithAnErrorEvent(resourceId, errorDetail);
		
		expect(events['Ready'].fire).not.toHaveBeenCalled();
	};
	
	var expectLifecycleInErrorState=function() {
		expectLifecycleInLoadingState()
			.errorLoading(errorDetail);
		
		checkProperNotificationForErrorState();
		
		return lifecycleManager;
	};
	
	it("given the lifecycle is LOADING, errorLoading will change state to Error and the proper notifications will be made", function(){
		expectLifecycleInErrorState()
			.errorLoading(errorDetail);
		
		checkProperNotificationForErrorState();
	});
	
	it("given the lifecycle is READY, startLoading will do nothing", function() {
		expectLifecycleInReadyState()
			.startLoading()
			.startLoading();
		
		checkProperNotificationForReadyState();
	});
	
	it("given the lifecycle is READY, loadSuccessful will do nothing", function() {
		expectLifecycleInReadyState()
			.loadSuccessful(readyDetail)
			.loadSuccessful(readyDetail);
		
		checkProperNotificationForReadyState();
	});
	
	it("given the lifecycle is READY, errorLoading will do nothing", function() {
		expectLifecycleInReadyState()
			.errorLoading(errorDetail)
			.errorLoading(errorDetail);
		
		checkProperNotificationForReadyState();
	});
	
	it("given the lifecycle is ERROR, startLoading will change state to Loading and the proper notifications will be made", function() {
		expectLifecycleInErrorState()
			.startLoading()
			.startLoading();
		
		checkProperNotificationForErrorState();
		
		expect(events['Loading'].fire).toHaveBeenCalledExactly(2);
		expect(events['Loading'].fire).toHaveBeenCalledWithALoadingEvent(resourceId);
	});
	
	it("given the lifecycle is ERROR, loadSuccessful will do nothing", function() {
		expectLifecycleInErrorState()
			.loadSuccessful(readyDetail)
			.loadSuccessful(readyDetail);
		
		checkProperNotificationForErrorState();
	});
	
	it("given the lifecycle is ERROR, errorLoading will do nothing", function() {
		expectLifecycleInErrorState()
			.errorLoading(errorDetail)
			.errorLoading(errorDetail);
		
		checkProperNotificationForErrorState();
	});
});