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
describe("appseed.ScriptLoader", function() {
	var uri='../the script uri';
	
	beforeEach(function() {
		// Cleans link tags.
		$('script[synthetic]').remove();
		delete appseed['test'];
	});
	
	var importedScriptWithURI=function(uri){
		return $('script[synthetic][type="text/javascript"][src="'+uri+'"]');
	};
	
	var waitForAnyCallbackToBeCalled=function(artifactDescription) {
		waitsFor(function(){
			return artifactDescription.ready.callCount>0||artifactDescription.error.callCount>0;
		}, '<any artifact callbacks to be called>', 500);
	};
	
	it("load() will add a script tag once in the document and then call ready() once", function(){
		var artifactDescription={
			'uri':'../the script uri',
			'ready':function() {
				expect(importedScriptWithURI('../the script uri')).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
		
		expect(importedScriptWithURI('../the script uri')).toBeInDocumentOnlyOnce();
		
		artifactDescription={
			'uri':'./the script uri',
			'ready':function() {
				expect(importedScriptWithURI('./the script uri')).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
		
		expect(importedScriptWithURI('./the script uri')).toBeInDocumentOnlyOnce();
	});
	
	it("given a detector function is provided, load() will add a script tag once in the document, and when the detector returns true, will call ready() once", function(){
		var artifactDescription={
			'uri':uri,
			'detector':function(){},
			'error':function() {},
			'ready':function() {
				expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'detector').andReturn(false);
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		expect(artifactDescription.detector).toHaveBeenCalled();
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		
		waits(5);
		
		runs(function() {
			artifactDescription.detector.andReturn(true);
		});
		
		waitForAnyCallbackToBeCalled(artifactDescription);
		
		runs(function(){
			expect(artifactDescription.ready).toHaveBeenCalledExactly(1);
			expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			
			loader.load().load();
			
			expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
			expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		});
	});
	
	it("given a detector function is provided, load() will add a script tag once in the document, and if the detector throws immediately an error, will call immediately error() once with the exception message", function(){
		var errorMsg="this is an error";
		var artifactDescription={
			'uri':uri,
			'detector':function(){},
			'error':function(){},
			'ready':function() {
				expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'detector').andThrow(new Error(errorMsg));
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		expect(artifactDescription.error).toHaveBeenCalledExactly(3);
		expect(artifactDescription.error).toHaveBeenCalledWith(errorMsg);
		expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
	});
	
	it("given a detector function is provided, load() will add a script tag once in the document, and when the detector throws an error, will call error() once with the exception message", function(){
		var errorMsg="this is an error";
		var artifactDescription={
			'uri':uri,
			'detector':function(){},
			'error':function(){},
			'ready':function() {
				expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'detector').andReturn(false);
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		expect(artifactDescription.detector).toHaveBeenCalled();
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		expect(artifactDescription.error).not.toHaveBeenCalled();
		
		waits(5);
		
		runs(function() {
			artifactDescription.detector.andThrow(new Error(errorMsg));
		});
		
		waitForAnyCallbackToBeCalled(artifactDescription);
		
		runs(function(){
			expect(artifactDescription.ready).not.toHaveBeenCalled();
			expect(artifactDescription.error).toHaveBeenCalledWith(errorMsg);
			expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		});
	});
	
	it("given a detector function and a timeout is provided, load() will add a script tag once in the document, and when the timeout expires, will call error() once with timeout message", function(){
		var artifactDescription={
			'uri':uri,
			'timeout':100,
			'detector':function(){},
			'error':function(){},
			'ready':function() {
				expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'detector').andReturn(false);
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load().load();
		
		expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		expect(artifactDescription.detector).toHaveBeenCalled();
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		expect(artifactDescription.error).not.toHaveBeenCalled();
		
		waitForAnyCallbackToBeCalled(artifactDescription);
		
		runs(function(){
			expect(artifactDescription.ready).not.toHaveBeenCalled();
			expect(artifactDescription.error).toHaveBeenCalled();
			expect(artifactDescription.error.mostRecentCall.args[0]).toContain('time');
			expect(artifactDescription.error.mostRecentCall.args[0]).toContain('out');
			expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
		});
	});
	
	it("given the script has errors, load will retry it", function(){
		var errorMsg="this is an error";
		var artifactDescription={
			'uri':uri,
			'detector':function(){},
			'error':function(){},
			'ready':function() {
				expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
			}
		};
		spyOn(artifactDescription, 'ready');
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'detector').andThrow(new Error(errorMsg));
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load();
		
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
		expect(artifactDescription.error).toHaveBeenCalledWith(errorMsg);
		
		artifactDescription.detector.andReturn(true);
		
		loader.load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(2);
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
		expect(importedScriptWithURI(uri)).toBeInDocumentOnlyOnce();
	});
	
	it("integration test", function() {
		var artifactDescription={
			'uri':'./testScript.js',
			'timeout':100,
			'detector':function(){
				return appseed&&appseed.test;
			},
			'error':function(){},
			'ready':function() {}
		};
		spyOn(artifactDescription, 'error');
		spyOn(artifactDescription, 'ready');
		var loader=new appseed.ScriptLoader(artifactDescription);
		
		loader.load().load();
		
		waitForAnyCallbackToBeCalled(artifactDescription);
		
		runs(function() {
			expect(appseed).toBeDefined();
			expect(appseed.test).toBeDefined();
			expect(appseed.test.doStuff).toBeDefined();
			
			expect(appseed.test.doStuff()).toBeTruthy();
		});
	});
});