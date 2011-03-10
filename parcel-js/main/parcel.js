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

// Upgrade of Array class to support indexOf method
if (!Array.indexOf) {
	Array.prototype.indexOf = function (obj, start) {
		for (var i = (start || 0); i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	}
}

if (!appseed) {
	var appseed = {};
};

appseed.log = function(msg){
	if (msg) {
		if (typeof(console) != 'undefined' && typeof(console.log) == 'function') 
			console.log(msg);
		else if (typeof(log) == 'function') 
			log(msg);
		else alert(msg);
	}
};

appseed.EventManager = function(id, optLog){
	var callbacks = [];
	var addCallback = function(callback){
		var count = callbacks.length;
		var found = false;
		for (var i = 0; !found && i < count; i++) 
			found = callbacks[i] == callback;
		if (!found) 
			callbacks.push(callback);
	};
	
	var log = typeof(optLog) == 'function' ? optLog : appseed.log;
	var doNotification=function(callback, ev) {
		try {
			callback(ev);
		} catch (e) {
			log("[EventName:" + id + "]Error in callback:<" +
			e +
			":message=" +
			e.message +
			">. Callback is:" +
			callback.toString());
		}
	};
	
	this.fire = function(ev){
		var l = callbacks.length;
		for (var i = 0; i < l; i++)
			doNotification(callbacks[i], ev);
		
		return this;
	};
	
	this.register = function(){
		var l = arguments.length;
		for (var i = 0; i < l; i++) {
			var callback = arguments[i];
			if (typeof(callback) == 'function' &&
			callbacks.indexOf(callback) == -1) 
				addCallback(callback);
		}
		
		return this;
	};
	
	this.registerAndNotify=function() {
		var event=arguments[0];
		var argCount=arguments.length;
		for(var i=1;i<argCount;i++) {
			var callback=arguments[i];
			this.register(callback);
			doNotification(callback, event);
		}
		return this;
	};
};

appseed.CSSLoader = function(artifactDescription) {
	var tag;
	var getTag=function() {
		if(!tag)
		{
			tag=document.createElement('LINK');
			tag.rel = 'stylesheet';
			tag.type = 'text/css';
			tag.href = artifactDescription.uri;
			tag.setAttribute('synthetic', 'true');
		}
		return tag;
	}
	var hasBeenIncludedInDocument = function() {
		var linkTags = document.getElementsByTagName('LINK');
		var linkTagsCount = linkTags.length;
		for (var i = 0; i < linkTagsCount; i++) {
			var linkTag = linkTags[i];
			if (linkTag.rel == 'stylesheet' &&
					linkTag.type == 'text/css' &&
					linkTag.href == getTag().href)
				return true;
		}
		return false;
	};
	
	this.load = function(){
		if (!hasBeenIncludedInDocument())
			document.getElementsByTagName("head").item(0).appendChild(getTag());
		if (typeof(artifactDescription.ready) == 'function') 
			artifactDescription.ready();
		return this;
	};
};

appseed.ScriptLoader = function(artifactDescription){
	if (typeof(artifactDescription.timeout) != 'number') 
		artifactDescription.timeout = 5000;
	
	var tag;
	var getTag=function() {
		if(!tag) {
			tag = document.createElement('SCRIPT');
			tag.type = 'text/javascript';
			tag.src = artifactDescription.uri;
			tag.setAttribute('synthetic', 'true');
		}
		return tag;
	}
	var hasBeenIncludedInDocument = function(){
		var scriptTags = document.getElementsByTagName('SCRIPT');
		var scriptTagsCount = scriptTags.length;
		for (var i = 0; i < scriptTagsCount; i++) {
			var scriptTag = scriptTags[i];
			if (scriptTag.type == 'text/javascript' && getTag().src == scriptTag.src) 
				return true;
		}
		return false;
	};
	
	var checkIsScheduled = false;
	var loadTime;
	var scriptLoadedCheck = function(nextTimeInterval){
		if (checkIsScheduled) 
			return;
		try {
			if (((new Date()).getTime() - loadTime) > artifactDescription.timeout) 
				throw new Error("Script timed out !");
			else if (artifactDescription.detector()) 
				artifactDescription.ready();
			else {
				checkIsScheduled = true;
				window.setTimeout(function(){
					checkIsScheduled = false;
					scriptLoadedCheck(Math.min(5000, nextTimeInterval * 2));
				}, nextTimeInterval);
			}
		} catch (e) {
			if (typeof(artifactDescription.error) == 'function') 
				artifactDescription.error(e.message);
		}
	};
	
	this.load = function(){
		if (!hasBeenIncludedInDocument()) {
			document.getElementsByTagName("head").item(0).appendChild(getTag());
			loadTime = new Date().getTime();
		}
		if (typeof(artifactDescription.ready) == 'function') {
			if (typeof(artifactDescription.detector) == 'function') {
				scriptLoadedCheck(1);
			} else artifactDescription.ready();
		}
		return this;
	};
};

appseed.AjaxConnectionFactory = function(){
	var newXmlHttpRequest;
	if (window.XMLHttpRequest) {
		newXmlHttpRequest = function(){
			return new window.XMLHttpRequest();
		};
	} else if (window.ActiveXObject) {
		newXmlHttpRequest = function(){
			var msxmls = ['Msxml2.XMLHTTP.7.0', 'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'];
			var r;
			var activeXUsed;
			for (var i = 0; i < msxmls.length && r === undefined; i++) {
				try {
					r = new window.ActiveXObject(msxmls[i]);
					activeXUsed = msxmls[i];
				} catch (ex2) {
					r = undefined;
				}
			}
			if (r !== undefined) 
				newXmlHttpRequest = function(){
					return new ActiveXObject(activeXUsed);
				};
			else {
				// Last chance !
				try {
					r = new XMLHttpRequest();
				} catch (e) {
					r = undefined;
				}
				if (r === undefined) {
					newXmlHttpRequest = function(){
						throw new Error("No AJAX capabilities detected in this browser !");
					};
				} else {
					newXmlHttpRequest = function(){
						return new XMLHttpRequest();
					};
				}
			}
		};
	}
	
	var AjaxConnection=function(xhReq) {
		var working=false;
		this.doGet=function(uri, readyCallback, errorCallback) {
			if(working)
				return this;
			xhReq.open("GET", uri, true);
			xhReq.onreadystatechange=function() {
				if(xhReq.readyState!=4)
					return;
				var httpStatus=xhReq.status;
				try {
					if ((httpStatus == 200
							|| httpStatus == 1223 // IE fix !
							|| httpStatus == 204
							|| httpStatus == 304)
							&& typeof(readyCallback) == 'function') {
						readyCallback(xhReq.responseText);
					} else if (typeof(errorCallback) == 'function') {
						errorCallback(httpStatus, xhReq.responseText);
					}
				} finally {
					working=false;
					xhReq.onreadystatechange = null;
				}
			};
			xhReq.send(null);
			
			working=true;
			
			return this;
		};
	};
	
	this.newConnection=function() {
		return new AjaxConnection(newXmlHttpRequest());
	}
};

appseed.NullLoader = function(artifactDescription) {
	this.load=function() {
		if(artifactDescription&&typeof(artifactDescription.ready)=='function')
			artifactDescription.ready();
		return this;
	}
};

appseed.AjaxLoader = function(artifactDescription, optAjaxConnectionFactory){
	var connectionFactory = optAjaxConnectionFactory &&
	typeof(optAjaxConnectionFactory.newConnection == 'function') ? optAjaxConnectionFactory : new appseed.AjaxConnectionFactory();
	
	var connection;
	var ready = false;
	var responseData;
	var ajaxLoad = function(){
		if (ready && typeof(artifactDescription.ready) == 'function') 
			return artifactDescription.ready(responseData);
		if (connection) 
			return;
		responseData = null;
		ready = false;
		connection = connectionFactory.newConnection();
		connection.doGet(artifactDescription.uri, function(artifactData){
			ready = true;
			connection = null;
			if (typeof(artifactDescription.ready) == 'function') {
				responseData = artifactData;
				ajaxLoad();
			}
		}, function(statusCode, errorData){
			connection = null;
			if (typeof(artifactDescription.error) == 'function') {
				artifactDescription.error({
					'errorDetail': errorData,
					'statusCode': statusCode
				});
			}
		});
	};
	
	this.load = function(){
		ajaxLoad();
		return this;
	}
};

appseed.ArtifactLifecycleManager = (function(NOT_LOADED, LOADING, ERROR, READY, LOADED){
	return function(artifact, optEventManagerFactory){
		var state = NOT_LOADED;
		var detail;
		var log = appseed.log;
		var eventManagerFactory = optEventManagerFactory;
		if (typeof(eventManagerFactory) != 'function') {
			eventManagerFactory = function(eventId, aLog){
				return new appseed.EventManager(eventId, aLog);
			};
		}
		var newEventManager = function(eventId){
			return eventManagerFactory(eventId, function(msg){
				log(msg);
			});
		};
		var StateChangeEvent = function(theState, detail){
			this.isLoading = function(){
				return theState == LOADING;
			},
			this.isError = function(){
				return theState == ERROR;
			},
			this.isReady = function(){
				return theState == READY;
			};
			this.artifact = function(){
				return artifact;
			};
			this.detail = function(){
				return detail;
			};
		};
		
		var eventManagers = {};
		eventManagers[READY] = newEventManager(READY + " '" + artifact.id() + "'");
		eventManagers[LOADING] = newEventManager(LOADING + " '" + artifact.id()+ "'");
		eventManagers[LOADED] = newEventManager(LOADED + " '" + artifact.id() + "'");
		eventManagers[ERROR] = newEventManager(ERROR + " '" + artifact.id() + "'");
		var registerCallbackFor = function(eventId, callbacks){
			eventManagers[eventId].register.apply(eventManagers[eventId], callbacks);
			return this;
		};
		var registerCallbackAndNotifyIt = function(eventId, callbacks){
			args=[new StateChangeEvent(state, detail)];
			var callbacksCount=callbacks.length;
			for(var i=0;i<callbacksCount;i++)
				args.push(callbacks[i]);
			eventManagers[eventId].registerAndNotify.apply(eventManagers[eventId], args);
			return this;
		};
		var notify = function(eventId){
			eventManagers[eventId].fire(new StateChangeEvent(state, detail));
		};
		
		this.configureLog = function(newLog){
			if (typeof(newLog) == 'function') 
				log = newLog;
			return this;
		};
		
		this.whenIsLoading = function() {
			if(state==LOADING)
				return registerCallbackAndNotifyIt.call(this, LOADING, arguments);
				
			return registerCallbackFor.call(this, LOADING, arguments);
		};
		
		this.whenIsReady = function(){
			if(state==READY)
				return registerCallbackAndNotifyIt.call(this, READY, arguments);
				
			return registerCallbackFor.call(this, READY, arguments);
		};
		
		this.whenIsError = function(){
			if(state==ERROR)
				return registerCallbackAndNotifyIt.call(this, ERROR, arguments);
				
			return registerCallbackFor.call(this, ERROR, arguments);
		};
		
		this.whenIsLoaded = function(){
			if(state==READY||state==ERROR)
				return registerCallbackAndNotifyIt.call(this, LOADED, arguments);
				
			return registerCallbackFor.call(this, LOADED, arguments);
		};
		
		this.startLoading = function(){
			if (state == NOT_LOADED || state == ERROR) {
				state = LOADING;
				notify(state);
			}
			return this;
		};
		
		this.loadSuccessful = function(optDetail){
			if (state == LOADING) {
				state = READY;
				detail=optDetail;
				notify(state);
				notify(LOADED);
			}
			return this;
		};
		
		this.errorLoading = function(optErrorDetail){
			if (state == LOADING) {
				state = ERROR;
				detail=optErrorDetail;
				notify(state);
				notify(LOADED);
			}
			return this;
		};
		
		this.loadingProgress=function(){
			if(state==LOADING)
				notify(state);
			return this;
		};
	};
})('NotLoaded', 'Loading', 'Error', 'Ready', 'Loaded');

appseed.DependenciesManager = function(repository){
	var addIfNotPresent = function(array, element){
		if (array.indexOf(element) == -1) 
			array.push(element);
	};
	
	var artifactsImportedBy = {};
	var artifactsImportingMe = {};
	
	this.artifactRequiresArtifact = function(artifact, importedArtifactId) {
		var artifactsImported = artifactsImportedBy[artifact.id];
		if (!artifactsImported) {
			artifactsImported = [];
			artifactsImportedBy[artifact.id] = artifactsImported;
		}
		addIfNotPresent(artifactsImported, importedArtifactId);
		
		var artifactsImporting = artifactsImportingMe[importedArtifactId];
		if (!artifactsImporting) {
			artifactsImporting = [];
			artifactsImportingMe[importedArtifactId] = artifactsImporting;
		}
		addIfNotPresent(artifactsImporting, artifact);
	};
	
	this.loadImportedArtifactsBy = function(artifactId) {
		var artifactsImportedByMe = artifactsImportedBy[artifactId];
		if (!artifactsImportedByMe) 
			return;
		var artifactsImportedByMeCount = artifactsImportedByMe.length;
		for (var i = 0; i < artifactsImportedByMeCount; i++) {
			var requiredArtifact = repository.artifact(artifactsImportedByMe[i]);
			if (requiredArtifact && typeof(requiredArtifact.load) == 'function') 
				requiredArtifact.load();
		}
	};
	
	this.notifyArtifactStatusChanged = function(artifactId) {
		var artifactsImporting = artifactsImportingMe[artifactId];
		if (!artifactsImporting) 
			return;
		var artifactsImportingCount = artifactsImporting.length;
		for (var i = 0; i < artifactsImportingCount; i++) 
			artifactsImporting[i].importedArtifactStatusChanged(artifactId);
	};
	
	this.allImportedArtifactsAreReady = function(artifactId) {
		var artifactsImportedByMe = artifactsImportedBy[artifactId];
		if (!artifactsImportedByMe) 
			return true;
		var ready = true;
		var artifactsImportedByMeCount = artifactsImportedByMe.length;
		for (var i = 0; ready && i < artifactsImportedByMeCount; i++) 
			ready = repository.artifact(artifactsImportedByMe[i]).isReady();
		return ready;
	};
	
	this.anyImportedArtifactHasErrors = function(artifactId) {
		var artifactsImportedByMe = artifactsImportedBy[artifactId];
		if (!artifactsImportedByMe) 
			return false;
		var hasErrors = false;
		var artifactsImportedByMeCount = artifactsImportedByMe.length;
		for (var i = 0; !hasErrors && i < artifactsImportedByMeCount; i++) 
			hasErrors = repository.artifact(artifactsImportedByMe[i]).hasErrors();
		return hasErrors;
	};
	
	var requiredArtifactsSet=function(artifactId, result, processedArtifacts) {
		if (!processedArtifacts[artifactId]) {
			result.push(artifactId);
			processedArtifacts[artifactId]=true;
		}
		var artifactsImportedByMe = artifactsImportedBy[artifactId];
		if (artifactsImportedByMe) {
			var artifactsImportedByMeCount = artifactsImportedByMe.length;
			for (var i = 0; i < artifactsImportedByMeCount; i++) 
				requiredArtifactsSet(artifactsImportedByMe[i], result, processedArtifacts);
		}
	};
	
	this.loadingProgress=function(artifactId) {
		if(repository.artifact(artifactId).isReady())
			return 1;
		var allRequiredArtifacts=[];
		requiredArtifactsSet(artifactId, allRequiredArtifacts, {});
		var totalProgress=0;
		var allRequiredArtifactsCount=allRequiredArtifacts.length;
		for(var i=0;i<allRequiredArtifactsCount;i++)
			if(repository.artifact(allRequiredArtifacts[i]).isReady())
				totalProgress++;
		return totalProgress/allRequiredArtifactsCount;
	};
};

appseed.ArtifactsRepository = function(optConfig){
	var repository = this;
	var log=appseed.log;
	var configuration = {
		'newLifecycleManager': function(id){
			return new appseed.ArtifactLifecycleManager(repository.artifact(id));
		},
		'newCSSLoader': function(artifactDescription){
			return new appseed.CSSLoader(artifactDescription);
		},
		'newAjaxResourceLoader': function(artifactDescription){
			return new appseed.AjaxLoader(artifactDescription);
		},
		'newPackageLoader':function(artifactDescription) {
			return new appseed.NullLoader(artifactDescription);
		},
		'newScriptLoader': function(artifactDescription){
			return new appseed.ScriptLoader(artifactDescription);
		}
	};
	if (optConfig) {
		if (typeof(optConfig.newLifecycleManager) == 'function') {
			configuration.newLifecycleManager = function(){
				return optConfig.newLifecycleManager.apply(optConfig, arguments);
			}
		}
		if (typeof(optConfig.newCSSLoader) == 'function') {
			configuration.newCSSLoader = function(){
				return optConfig.newCSSLoader.apply(optConfig, arguments);
			}
		}
		if (typeof(optConfig.newScriptLoader) == 'function') {
			configuration.newScriptLoader = function(){
				return optConfig.newScriptLoader.apply(optConfig, arguments);
			}
		}
		if (typeof(optConfig.newPackageLoader) == 'function') {
			configuration.newPackageLoader = function(){
				return optConfig.newPackageLoader.apply(optConfig, arguments);
			}
		}
		if (typeof(optConfig.newAjaxResourceLoader) == 'function') {
			configuration.newAjaxResourceLoader = function(){
				return optConfig.newAjaxResourceLoader.apply(optConfig, arguments);
			}
		}
		if (typeof(optConfig.log) == 'function') {
			this.configureLog(function(){
				return optConfig.log.apply(optConfig, arguments);
			});
		}
	}
	var artifacts = {};
	var newLifecycleManager = function(id){
		var r = configuration.newLifecycleManager(id);
		if (typeof(r.configureLog) == 'function') {
			r.configureLog(function(msg){
				log(msg);
			});
		}
		return r
	};
	
	var dependeciesManager = optConfig && typeof(optConfig.newDependenciesManager) == 'function' ? optConfig.newDependenciesManager(repository) : new appseed.DependenciesManager(repository);
	
	var newArtifact = function(identifier) {
		// Common to all artifacts
		var loadImportedArtifacts = function(){
			dependeciesManager.loadImportedArtifactsBy(identifier);
		};
		
		var allImportedArtifactsAreReady = function(){
			return dependeciesManager.allImportedArtifactsAreReady(identifier);
		};
		
		var anyImportedArtifactHasErrors = function(){
			return dependeciesManager.anyImportedArtifactHasErrors(identifier);
		};
		var notifyImportChanged = function(){
		};
		
		var ArtifactMixin = function() {
			this.requires = function() {
				var dependencyListener;
				var argCount = arguments.length;
				if (argCount > 0) {
					dependencyListener = {
						'id': identifier,
						'importedArtifactStatusChanged': function(){
							notifyImportChanged();
						}
					};
				}
				for (var i = 0; i < argCount; i++) {
					var arg = arguments[i];
					if (typeof(arg) == 'string') 
						dependeciesManager.artifactRequiresArtifact(dependencyListener, arg);
				}
				return this;
			};
			
			this.id = function(){
				return identifier;
			};
			
			this.hasBeenLoaded = function(){
				return this.isDefined() && (this.isReady() || this.hasErrors());
			};
			
			this.loadingProgress = function(){
				return dependeciesManager.loadingProgress(identifier);
			};
			
			artifacts[identifier]=this;
		};
		
		var ArtifactOfTypeMixin=function(artifactType, loaderConfig) {
			ArtifactMixin.call(this);
			
			var lifecycleManager = newLifecycleManager(identifier);
			
			this.isDefined=function() {
				return true;
			};
		
			this.isReady = function(){
				return false;
			};
			
			this.hasErrors = function(){
				return false;
			};
			
			this.whenIsLoading = function(){
				lifecycleManager.whenIsLoading.apply(lifecycleManager, arguments);
				return this;
			};
			
			this.whenIsReady = function(){
				lifecycleManager.whenIsReady.apply(lifecycleManager, arguments);
				return this;
			};
			
			this.whenIsError = function(){
				lifecycleManager.whenIsError.apply(lifecycleManager, arguments);
				return this;
			};
			
			this.whenIsLoaded = function(){
				lifecycleManager.whenIsLoaded.apply(lifecycleManager, arguments);
				return this;
			};
			loaderConfig.error= function(optErrorDetail){
				var self = repository.artifact(identifier);
				self.isReady = function(){
					return false;
				};
				self.hasErrors = function(){
					return true;
				};
				notifyImportChanged = function() {
					self.load();
				};
				lifecycleManager.loadingProgress();
				lifecycleManager.errorLoading(optErrorDetail);
				dependeciesManager.notifyArtifactStatusChanged(identifier);
			};
			loaderConfig.ready=function(optArtifactData){
				var self = repository.artifact(identifier);
				self.isReady = function(){
					return true;
				};
				self.hasErrors = function(){
					return false;
				};
				self.load = function(){
					return this;
				};
				lifecycleManager.loadingProgress();
				lifecycleManager.loadSuccessful(optArtifactData);
				dependeciesManager.notifyArtifactStatusChanged(identifier);
			};
			
			this.load = function(){
				delete this['requires'];
				this.hasErrors = function(){
					return false;
				};
				lifecycleManager.startLoading();
				notifyImportChanged = function() {
					lifecycleManager.loadingProgress();
					if (allImportedArtifactsAreReady()) 
						configuration['new'+artifactType+'Loader'](loaderConfig).load();
					else if (anyImportedArtifactHasErrors()) 
						loaderConfig.error('Some imported artifact by "' + identifier + '" of type "'+artifactType+'" has errors');
				};
				loadImportedArtifacts();
				notifyImportChanged();
				return this;
			};
		};
		
		var ArtifactOfTypeWithUriMixin = function(artifactType, URI, loaderConfig) {
			this['isA'+artifactType] = function(newUri){
				if (typeof(newUri) != 'string') 
					throw new Error("Only an string is allowed as an URI [artifactId='" + identifier + "', type='"+artifactType+"']. It was <" + newUri + ">");
				loaderConfig.uri = newUri;
				return this;
			};
			
			ArtifactOfTypeMixin.call(this['isA'+artifactType](URI)
																, artifactType
																, loaderConfig);
			var commonLoad=this.load;
			this.load=function() {
				delete this['isA'+artifactType];
				return commonLoad.call(this);
			};
			
			this.uri=function() {
				return loaderConfig.uri;
			};
		};
		
		return new function() {
			ArtifactMixin.call(this);
			
			this.isDefined=function() {
				return false;
			};
			
			this.isReady = function(){
				return false;
			};
			
			this.hasErrors = function(){
				return false;
			};
			
			this.isACSS = function(uri){
				return new function(){
					ArtifactOfTypeWithUriMixin.call(this, 'CSS', uri, {});
				};
			};
			
			this.isAPackage = function(uri){
				return new function(){
					this.isAPackage=function() { return this; };
					ArtifactOfTypeMixin.call(this, 'Package', {});
				};
			};
			
			this.isAScript = function(uri){
				return new function() {
					var loaderConfig = {};
					ArtifactOfTypeWithUriMixin.call(this, 'Script', uri, loaderConfig);
					
					var commonLoad=this.load;
					this.load=function() {
						delete this['isReadyWhen'];
						delete this['withTimeout'];
						return commonLoad.call(this);
					};
					
					this.isReadyWhen=function(detectorFunction) {
						if(typeof(detectorFunction)=='function')
							loaderConfig.detector=detectorFunction;
						return this;
					};
					
					this.withTimeout=function(timeout) {
						if(typeof(timeout)=='number'&&timeout>0)
							loaderConfig.timeout=timeout;
						return this;
					};
				};
			};
			
			this.isAAjaxResource = function(uri){
				return new function(){
					var loaderConfig = {};
					ArtifactOfTypeWithUriMixin.call(this, 'AjaxResource', uri, loaderConfig);
					
					var commonReady=loaderConfig.ready;
					loaderConfig.ready=function(optArtifactData){
						var self = repository.artifact(identifier);
						self.contents=function() {
							return optArtifactData;
						};
						self.errorDetails=function() {
							return null;
						};
						return commonReady.call(loaderConfig, optArtifactData);
					};
					
					var commonError=loaderConfig.error;
					loaderConfig.error=function(optErrorDetail){
						var self = repository.artifact(identifier);
						self.contents=function() {
							return null;
						};
						self.errorDetails=function() {
							return optErrorDetail;
						};
						return commonError.call(loaderConfig, optErrorDetail);
					};
				};
			};
		};
	};
	
	this.artifact = function(id){
		if (typeof(id) != 'string') 
			throw new Error("Only an string is allowed as an artifact id. It was <" + id + ">")
		var resource = artifacts[id];
		if (!resource) 
			resource = newArtifact(id);
		return resource;
	}
	
	this.configureLog = function(newLog){
		if (typeof(newLog) == 'function') 
			log = newLog;
		return this;
	};
};
