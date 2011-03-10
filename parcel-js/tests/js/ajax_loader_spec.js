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
describe("appseed.AjaxLoader", function() {
	var uri='./the script uri'
			, artifactData='artifact data'
			, errorData='error message'
			, errorCode=500;
	
	var loader
		, artifactDescription
		, ajaxConnection
		, ajaxConnectionFactory
		, readyCallback
		, errorCallback;
	beforeEach(function(){
		ajaxConnection={
			'doGet':function(requestUri, readyF, errorF) {
				expect(requestUri).toEqual(uri);
				expect(typeof(readyF)).toEqual('function');
				expect(typeof(errorF)).toEqual('function');
				readyCallback=readyF;
				errorCallback=errorF;
			}
		};
		spyOn(ajaxConnection, 'doGet').andCallThrough();
		
		ajaxConnectionFactory={'newConnection':function() {} };
		spyOn(ajaxConnectionFactory, 'newConnection').andReturn(ajaxConnection);
		
		artifactDescription={
			'uri':uri,
			'error':function(data, status) {
				expect(data.errorDetail).toEqual(errorData);
				expect(data.statusCode).toEqual(errorCode);
			},
			'ready':function(data) {
				expect(data).toEqual(artifactData);
			}
		};
		spyOn(artifactDescription, 'ready').andCallThrough();
		spyOn(artifactDescription, 'error').andCallThrough();
		
		loader=new appseed.AjaxLoader(artifactDescription, ajaxConnectionFactory);
	});
	
	it("load() will make a GET AJAX request with the uri specified, and call ready() once with the resulting text when request is successful", function() {
		loader.load().load().load();
		
		expect(ajaxConnectionFactory.newConnection).toHaveBeenCalledExactly(1);
		expect(ajaxConnection.doGet).toHaveBeenCalledExactly(1);
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		expect(artifactDescription.error).not.toHaveBeenCalled();
		
		readyCallback(artifactData);
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(1);
		expect(artifactDescription.error).not.toHaveBeenCalled();
		
		loader.load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
		expect(artifactDescription.error).not.toHaveBeenCalled();
	});
	
	it("load() will make a GET AJAX request with the uri specified, and call error() once with the resulting error when request fails", function(){
		loader.load().load().load();
		
		expect(ajaxConnectionFactory.newConnection).toHaveBeenCalledExactly(1);
		expect(ajaxConnection.doGet).toHaveBeenCalledExactly(1);
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		expect(artifactDescription.error).not.toHaveBeenCalled();
		
		errorCallback(errorCode, errorData);
		
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
		expect(artifactDescription.error.mostRecentCall.args[0].errorDetail).toEqual(errorData);
		expect(artifactDescription.error.mostRecentCall.args[0].statusCode).toEqual(errorCode);
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		
		loader.load().load();
		
		expect(ajaxConnectionFactory.newConnection).toHaveBeenCalledExactly(2);
		expect(ajaxConnection.doGet).toHaveBeenCalledExactly(2);
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
		expect(artifactDescription.ready).not.toHaveBeenCalled();
		
		readyCallback(artifactData);
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(1);
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
		
		loader.load().load();
		
		expect(artifactDescription.ready).toHaveBeenCalledExactly(3);
		expect(artifactDescription.error).toHaveBeenCalledExactly(1);
	});
});