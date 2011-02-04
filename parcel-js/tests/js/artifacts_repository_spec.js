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
		'toBeADependencyListenerForArtifact':function(id) {
			this.message=function() {
				return "Expected an artifact for '"+id+"', it was <"+jasmine.pp(this.actual)+">";
			};
			return this.actual.id==id
					&& typeof(this.actual.importedArtifactStatusChanged)=='function';
		}
	});
});

describe("appseed.ArtifactRepository", function() {
	var artifactId='artifact id'
		, importedArtifactId='imported artifact id'
		, anotherArtifactId='another artifact id'
		, yetAnotherArtifactId='yet another artifact id'
		, deepArtifactId='deep artifact id'
		, artifactURI='https://www.notexists.com/artifacts/a'
		, anotherArtifactURI='https://www.notexists.com/artifacts/b';
	var artifactData='artifact data'
		, errorDetail='error detail';
	
	var expectError=function(f){
		return function() {
			expect(f).toThrow();
		}
	}
	
	var repositoryConfig, repository, dependenciesManager;
	beforeEach(function() {
		dependenciesManager={
			'artifactRequiresArtifact':function(){},
			'loadImportedArtifactsBy':function(){},
			'notifyArtifactStatusChanged':function(){},
			'anyImportedArtifactHasErrors':function(){},
			'allImportedArtifactsAreReady':function(){},
			'loadingProgress':function(){}
		};
		spyOn(dependenciesManager, 'artifactRequiresArtifact');
		spyOn(dependenciesManager, 'loadImportedArtifactsBy');
		spyOn(dependenciesManager, 'notifyArtifactStatusChanged');
		spyOn(dependenciesManager, 'anyImportedArtifactHasErrors');
		spyOn(dependenciesManager, 'allImportedArtifactsAreReady');
		spyOn(dependenciesManager, 'loadingProgress');
		
		repositoryConfig={
			'newLifecycleManager':function(id) {
				return {
					'configureLog':function() {},
					'whenIsLoading':function() {},
					'whenIsReady':function() {},
					'whenIsError':function() {},
					'whenIsLoaded':function() {},
					'startLoading':function() {},
					'errorLoading':function() {},
					'loadSuccessful':function() {}
				};
			},
			'newDependenciesManager':function() {
				return dependenciesManager;
			},
			'newCSSLoader':function() {
				return {'load':function(){}};
			},
			'newAjaxResourceLoader':function() {
				return {'load':function(){}};
			},
			'newPackageLoader':function() {
				return {'load':function(){}};
			},
			'newScriptLoader':function() {
				return {'load':function(){}};
			}
		};
		
		repository=new appseed.ArtifactsRespository(repositoryConfig);
	});
	
	var mockFunction=function(obj, funName, optFun) {
		if(typeof(obj[funName])=='undefined'){
			obj[funName]=function() {};
		}
		if(typeof(optFun)=='function')
			obj[funName]=optFun;
		spyOn(obj, funName).andCallThrough();
	};
	
	var getLifecycleManagerSpy=function(lifecycleManagerStub) {
		if(!lifecycleManagerStub)
			lifecycleManagerStub={};
		mockFunction(lifecycleManagerStub, 'startLoading');
		mockFunction(lifecycleManagerStub, 'errorLoading');
		mockFunction(lifecycleManagerStub, 'loadSuccessful');
		mockFunction(lifecycleManagerStub, 'configureLog');
		mockFunction(lifecycleManagerStub, 'whenIsLoading');
		mockFunction(lifecycleManagerStub, 'whenIsReady');
		mockFunction(lifecycleManagerStub, 'whenIsError');
		mockFunction(lifecycleManagerStub, 'whenIsLoaded');
		spyOn(repositoryConfig, 'newLifecycleManager').andReturn(lifecycleManagerStub);
		return lifecycleManagerStub;
	};
	
	var expectToBeAnImportFromTo=function(actualArgs, artifactId, importedArtifactId) {
		expect(actualArgs.length).toEqual(2);
		expect(actualArgs[0]).toBeADependencyListenerForArtifact(artifactId);
		expect(actualArgs[1]).toEqual(importedArtifactId);
	};
	
	it("raises an error if no artifact id is passed", expectError(function() {
		repository.artifact();
	}));
	
	it("raises an error if a null is passed as artifact id", expectError(function() {
		repository.artifact(null);
	}));
	
	it("raises an error if a non string is passed as artifact id", expectError(function() {
		repository.artifact(3333);
	}));
	
	it("id() will return the artifact identifier although its type is not defined", function() {
		expect(repository.artifact(artifactId).id()).toEqual(artifactId);
		expect(repository.artifact(anotherArtifactId).id()).toEqual(anotherArtifactId);
		expect(repository.artifact(yetAnotherArtifactId).id()).toEqual(yetAnotherArtifactId);
	});
		
	it("cannot load an artifact if its type has not been defined yet", function() {
		expect(repository.artifact(artifactId).load).not.toBeDefined();
	});
	
	it("artifacts not yet defined aren't ready nor has errors", function() {
		var artifact=repository.artifact(artifactId);
		
		expect(artifact.isReady()).toBeFalsy();
		expect(artifact.hasErrors()).toBeFalsy();
	});
	
	it("does not allows to register callbacks if artifact type is not defined", function() {
		expect(repository.artifact(artifactId).whenIsReady).not.toBeDefined();
		expect(repository.artifact(artifactId).whenIsLoading).not.toBeDefined();
		expect(repository.artifact(artifactId).whenIsError).not.toBeDefined();
		expect(repository.artifact(artifactId).whenIsLoaded).not.toBeDefined();
	});
	
	var appendArtifactCommonSpecs=function(artifactType, theOtherArtifactTypes) {
		var artifactMethodName="isA"+artifactType;
		var artifactWithIdAndDefinedType=function() {
			var artifact=repository.artifact(artifactId);
			if (artifactType != 'Package')
				return artifact[artifactMethodName](artifactURI);
			else
				return artifact.isAPackage();
		};
		var getLoaderSpy=function(optLoadFunction) {
			var loader={};
			mockFunction(loader, 'load', optLoadFunction);
			spyOn(repositoryConfig, 'new'+artifactType+'Loader').andCallFake(function(desc) {
				loader.description=desc;
				return loader;
			});
			return loader;
		};
		if (artifactType != 'Package') {
			it(artifactMethodName + " raises an error if no uri is passed", expectError(function(){
				repository.artifact(artifactId)[artifactMethodName]();
			}));
			
			it(artifactMethodName + " raises an error if a null is passed uri", expectError(function(){
				repository.artifact(artifactId)[artifactMethodName](null);
			}));
			
			it(artifactMethodName + " raises an error if a non string is passed as uri", expectError(function(){
				repository.artifact(artifactId)[artifactMethodName](3333);
			}));
			
			it("given the artifact is a "+artifactType+", uri() will return its URI", function() {
				var artifact=artifactWithIdAndDefinedType();
				
				expect(artifact.uri()).toEqual(artifactURI);
				
				artifact
					[artifactMethodName](anotherArtifactURI);
				
				expect(artifact.uri()).toEqual(anotherArtifactURI);
			});
			
			it("given the artifact is a " + artifactType + ", cannot redefine the URI after load() has been called", function(){
				artifactWithIdAndDefinedType().load();
				
				expect(repository.artifact(artifactId)['isA' + artifactType]).not.toBeDefined();
			});
			
			it("given the artifact is a "+artifactType+", can redefine the artifact URI before loading", function() {
				dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
				
				var loader=getLoaderSpy();
				
				artifactWithIdAndDefinedType()
					[artifactMethodName](anotherArtifactURI)
					.load();
				
				expect(loader.load).toHaveBeenCalledExactly(1);
				expect(loader.description.uri).toEqual(anotherArtifactURI);
				expect(typeof(loader.description.ready)).toEqual('function');
				expect(typeof(loader.description.error)).toEqual('function');
			});
		}
		
		it("given the artifact is a "+artifactType+", id() will return its identifier", function() {
			var artifact=artifactWithIdAndDefinedType();
			
			expect(artifact.id()).toEqual(artifactId);
			expect(artifact.load().id()).toEqual(artifactId);
		});
		
		it("given the artifact is a "+artifactType+", loadingProgress calls dependenciesManager.loadingProgress(artifactId)", function() {
			dependenciesManager.loadingProgress.andReturn(1);
			
			var result=artifactWithIdAndDefinedType().loadingProgress();
			
			expect(result).toEqual(1);
			expect(dependenciesManager.loadingProgress).toHaveBeenCalledWith(artifactId);
			
			dependenciesManager.loadingProgress.andReturn(2);
			
			result=repository.artifact(artifactId).load().loadingProgress();
			
			expect(result).toEqual(2);
			expect(dependenciesManager.loadingProgress).toHaveBeenCalledWith(artifactId);
		});
		
		it("given the artifact is a "+artifactType+", does not allows to redefine the type of artifact", function() {
			artifactWithIdAndDefinedType();
			
			for (var i = 0; i < theOtherArtifactTypes.length; i++)
				expect(repository.artifact(artifactId)['isA'+theOtherArtifactTypes[i]]).not.toBeDefined();
		});
		
		it("given the artifact is a "+artifactType+", and is not yet loaded, then is nor ready neither has errors", function() {
			var artifact=artifactWithIdAndDefinedType();
			
			expect(artifact.isReady()).toBeFalsy();
			expect(artifact.hasErrors()).toBeFalsy();
		});
		
		var createRegisterEventCallbackSpec=function(eventName, registerCallbackMethodName) {
			it("given the artifact is a "+artifactType+", "+registerCallbackMethodName+" registers callbacks for the '"+eventName+"' event on the lifecycleManager", function() {
				var registeredCallbacks=[];
				var lifecycleManager={};
				mockFunction(lifecycleManager, 'configureLog');
				mockFunction(lifecycleManager, registerCallbackMethodName, function() {
					for(var i=0;i<arguments.length;i++)
						registeredCallbacks.push(arguments[i]);
					return this;
				});
				spyOn(repositoryConfig, 'newLifecycleManager').andReturn(lifecycleManager);
				
				var f1=function() {return 1;};
				var f2=function() {return 2;};
				var f3=function() {return 3;};
				
				artifactWithIdAndDefinedType()
					[registerCallbackMethodName](f1, f2)
					[registerCallbackMethodName](f3);
				
				expect(repositoryConfig.newLifecycleManager).toHaveBeenCalledWith(artifactId);
				expect(lifecycleManager.configureLog).toHaveBeenCalledWithArgumentTypes('function');
				expect(registeredCallbacks).toEqual([f1, f2, f3]);
			});
		}
		
		var eventNames=['Loading', 'Ready', 'Error', 'Loaded'];
		for(var i=0;i<eventNames.length;i++)
			createRegisterEventCallbackSpec(eventNames[i], 'whenIs'+eventNames[i]);
		
		it("given the artifact is a "+artifactType+", requires will call dependenciesManager.artifactRequiresArtifact", function() {
			if (artifactType != 'Package')
				repository.artifact(artifactId).requires(anotherArtifactId, yetAnotherArtifactId).isACSS(artifactURI);
			else
				repository.artifact(artifactId).requires(anotherArtifactId, yetAnotherArtifactId).isAPackage();
			
			expect(dependenciesManager.artifactRequiresArtifact).toHaveBeenCalledExactly(2);
			expectToBeAnImportFromTo(dependenciesManager.artifactRequiresArtifact.argsForCall[0], artifactId, anotherArtifactId);
			expectToBeAnImportFromTo(dependenciesManager.artifactRequiresArtifact.argsForCall[1], artifactId, yetAnotherArtifactId);
			
			repository.artifact(artifactId).requires(deepArtifactId);
			
			expect(dependenciesManager.artifactRequiresArtifact).toHaveBeenCalledExactly(3);
			expectToBeAnImportFromTo(dependenciesManager.artifactRequiresArtifact.argsForCall[2], artifactId, deepArtifactId);
		});
		
		var expectToLoadAnArtifactWithRequisites=function(requisitesWillBeReady, requisitesWillHaveErrors) {
			var lifecycleManager=getLifecycleManagerSpy();
			
			dependenciesManager.allImportedArtifactsAreReady.andReturn(requisitesWillBeReady);
			dependenciesManager.anyImportedArtifactHasErrors.andReturn(requisitesWillHaveErrors);
			if (artifactType != 'Package')
				repository.artifact(artifactId).requires(importedArtifactId)[artifactMethodName](artifactURI).load();
			else
				repository.artifact(artifactId).requires(importedArtifactId).isAPackage().load();
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1);
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledWith(artifactId);
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(1);
			expect(dependenciesManager.allImportedArtifactsAreReady).toHaveBeenCalled();
			
			expect(repository.artifact(artifactId).isReady()).toEqual(false);
			expect(repository.artifact(artifactId).hasErrors()).toEqual(requisitesWillHaveErrors);
			
			return lifecycleManager;
		};
		
		it("given the artifact is a "+artifactType+", load will notify startLoading and will load all of its prerrequisites, but will load itself only if all the prerrequisites are ok", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectToLoadAnArtifactWithRequisites(true, false);
			
			expect(dependenciesManager.notifyArtifactStatusChanged).not.toHaveBeenCalled();
			
			expect(loader.load).toHaveBeenCalledExactly(1);
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
		});
		
		it("given the artifact is a "+artifactType+", load will notify startLoading and will load all of its prerrequisites, but will not load itself if any of the prerrequisites has errors and then it will notify errorLoading and will be in error too", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectToLoadAnArtifactWithRequisites(false, true);
			
			expect(dependenciesManager.anyImportedArtifactHasErrors).toHaveBeenCalled();
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledWith(artifactId);
			
			expect(loader.load).not.toHaveBeenCalled();
			
			expect(lifecycleManager.errorLoading).toHaveBeenCalledExactly(1);
		});
		
		var expectAnArtifactLoadingWithPendingRequisites=function(loader) {
			var lifecycleManager=expectToLoadAnArtifactWithRequisites(false, false);
			
			expect(dependenciesManager.anyImportedArtifactHasErrors).toHaveBeenCalled();
			expect(dependenciesManager.notifyArtifactStatusChanged).not.toHaveBeenCalled();
			
			expect(loader.load).not.toHaveBeenCalled();
			return lifecycleManager;
		};
		
		var expectALoadingArtifactWithAllPrerrequisitesReady=function(loader) {
			var lifecycleManager=expectAnArtifactLoadingWithPendingRequisites(loader);
			
			var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
			
			dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
			
			dependencyListener.importedArtifactStatusChanged(importedArtifactId);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(1); // Not called again
			expect(dependenciesManager.notifyArtifactStatusChanged).not.toHaveBeenCalled();
			
			expect(loader.load).toHaveBeenCalledExactly(1);
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
			return lifecycleManager;
		};
		
		it("given the artifact is a "+artifactType+", given an artifact is loading and has pending prerrequisites, importedArtifactStatusChanged will trigger loader.load on itself if all requisites are ready", function(){
			var loader=getLoaderSpy();
			expectALoadingArtifactWithAllPrerrequisitesReady(loader);
		});
		
		var expectALoadedAndReadyArtifact=function(loader) {
			var lifecycleManager=expectALoadingArtifactWithAllPrerrequisitesReady(loader);
			
			loader.description.ready(artifactData);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			expect(lifecycleManager.loadSuccessful).toHaveBeenCalledWith(artifactData);
			
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledWith(artifactId); // Notify success
			
			expect(repository.artifact(artifactId).isReady()).toBeTruthy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
			return lifecycleManager;
		};
		
		it("given the artifact is a "+artifactType+", a loading artifact will notify loadSuccessful and will be ready when its loader calls ready", function(){
			var loader=getLoaderSpy();
			expectALoadedAndReadyArtifact(loader);
		});
		
		var expectALoadingArtifactWithAllPrerrequisitesReadyButWithErrors=function(loader) {
			var lifecycleManager=expectALoadingArtifactWithAllPrerrequisitesReady(loader);
			
			loader.description.error(errorDetail);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			expect(lifecycleManager.errorLoading).toHaveBeenCalledWith(errorDetail);
			
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledWith(artifactId); // Notify success
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeTruthy();
			return lifecycleManager;
		};
		
		it("given the artifact is a "+artifactType+", a loading artifact will notify errorLoading and will be in error when its loader calls error", function(){
			var loader=getLoaderSpy();
			expectALoadingArtifactWithAllPrerrequisitesReadyButWithErrors(loader);
		});
		
		it("given the artifact is a "+artifactType+", and has errors but the prerrequisites are ready, load will try to load it again", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectALoadingArtifactWithAllPrerrequisitesReadyButWithErrors(loader);
			
			repository
				.artifact(artifactId)
				.load();
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(2); // Called again
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalled(); // Do not care how many, since prerreqs are ready
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledExactly(1);// Not called again
			
			expect(loader.load).toHaveBeenCalledExactly(2); // Another try !
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
		});
		
		it("given the artifact is a "+artifactType+", and is ready, load will do nothing", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectALoadedAndReadyArtifact(loader);
			
			repository.artifact(artifactId).load().load();
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			expect(lifecycleManager.loadSuccessful).toHaveBeenCalledWith(artifactData);
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledExactly(1);
			
			expect(repository.artifact(artifactId).isReady()).toBeTruthy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
		});
		
		it("given the artifact is a "+artifactType+", and is loading with pending prerrequisites, importedArtifactStatusChanged will not trigger loader.load on itself if not all requisites are ready", function(){
			var loader=getLoaderSpy();
			var lifecycleManager=expectAnArtifactLoadingWithPendingRequisites(loader);
			var artifact=repository.artifact(artifactId);
			
			var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
			
			dependenciesManager.allImportedArtifactsAreReady.andReturn(false);
			dependenciesManager.anyImportedArtifactHasErrors.andReturn(false);
			
			dependencyListener.importedArtifactStatusChanged(importedArtifactId);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(1); // Not called again
			expect(dependenciesManager.notifyArtifactStatusChanged).not.toHaveBeenCalled();
			
			expect(loader.load).not.toHaveBeenCalled();
			
			expect(artifact.isReady()).toBeFalsy();
			expect(artifact.hasErrors()).toBeFalsy();
		});
		
		var expectALoadedArtifactButWithErrorsInDependencies=function(loader) {
			var lifecycleManager=expectAnArtifactLoadingWithPendingRequisites(loader);
			
			var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
			
			expect(lifecycleManager.errorLoading).not.toHaveBeenCalled();
			dependenciesManager.allImportedArtifactsAreReady.andReturn(false);
			dependenciesManager.anyImportedArtifactHasErrors.andReturn(true);
			
			dependencyListener.importedArtifactStatusChanged(importedArtifactId);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(1); // Not called again
			expect(lifecycleManager.errorLoading).toHaveBeenCalledWithArgumentTypes('string'); // Notify error
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(1); // Not called again
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledWith(artifactId); // Notify error
			
			expect(loader.load).not.toHaveBeenCalled();
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeTruthy();
			
			return lifecycleManager;
		};
		
		it("given the artifact is a "+artifactType+", and is loading with pending prerrequisites, importedArtifactStatusChanged will notify errorLoading and be in error if any of the requisites has errors", function(){
			var loader=getLoaderSpy();
			expectALoadedArtifactButWithErrorsInDependencies(loader);
		});
		
		it("given the artifact is a "+artifactType+", and has errors in its prerrequisites, load will try to load it again", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectALoadedArtifactButWithErrorsInDependencies(loader);
			
			dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
			
			repository
				.artifact(artifactId)
				.load();
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(2); // Called again
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(2); // Called again
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledExactly(1);// Not called again
			
			expect(loader.load).toHaveBeenCalledExactly(1);
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
		});
		
		it("given the artifact is a "+artifactType+", and has errors in its prerrequisites, a notification of import status changed will launch a load again", function() {
			var loader=getLoaderSpy();
			var lifecycleManager=expectALoadedArtifactButWithErrorsInDependencies(loader);
			
			var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
			
			dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
			
			dependencyListener.importedArtifactStatusChanged(importedArtifactId);
			
			expect(lifecycleManager.startLoading).toHaveBeenCalledExactly(2); // Called again
			
			expect(dependenciesManager.loadImportedArtifactsBy).toHaveBeenCalledExactly(2); // Called again
			expect(dependenciesManager.notifyArtifactStatusChanged).toHaveBeenCalledExactly(1);// Not called again
			
			expect(loader.load).toHaveBeenCalledExactly(1);
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
			
			expect(repository.artifact(artifactId).isReady()).toBeFalsy();
			expect(repository.artifact(artifactId).hasErrors()).toBeFalsy();
		});
		
		it("given the artifact is a "+artifactType+", it can be loaded later", function() {
			var loader=getLoaderSpy();
			dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
			
			artifactWithIdAndDefinedType();
			
			repository.artifact(artifactId).load();
			
			expect(loader.load).toHaveBeenCalledExactly(1);
			if (artifactType != 'Package')
				expect(loader.description.uri).toEqual(artifactURI);
			else
				expect(loader.description.uri).not.toBeDefined();
			expect(typeof(loader.description.ready)).toEqual('function');
			expect(typeof(loader.description.error)).toEqual('function');
		});
		
		it("given the artifact is a "+artifactType+", after load, no more requisites can be added", function(){
			expect(artifactWithIdAndDefinedType().load().requires).not.toBeDefined();
		});
	};
	
	var artifactTypes=['CSS', 'Script', 'AjaxResource', 'Package'];
	for (var i = 0; i < artifactTypes.length; i++) {
		var theOtherArtifactTypes=[];
		for (var j = 0; j < artifactTypes.length; j++){
			if(j!=i)
				theOtherArtifactTypes.push(artifactTypes[j]);
		}
		appendArtifactCommonSpecs(artifactTypes[i], theOtherArtifactTypes);
	}
	
	it("scripts can have a detector function", function(){
		var detectorFun1=function(){return 1;};
		var detectorFun2=function(){return 2;};
		var loader={
			'load':function() {
				expect(loader.description.detector).toBeDefined();
				expect(loader.description.detector).toBe(detectorFun2);
			}
		};
		spyOn(loader, 'load');
		spyOn(repositoryConfig, 'newScriptLoader').andCallFake(function(desc) {
			loader.description=desc;
			return loader;
		});
		dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
		
		expect(repository.artifact(artifactId).isReadyWhen).not.toBeDefined();
		
		repository
			.artifact(artifactId)
			.isAScript(artifactURI)
			.isReadyWhen(detectorFun1)
			.isReadyWhen(detectorFun2)
			.load();
		
		expect(repository.artifact(artifactId).isReadyWhen).not.toBeDefined();
		expect(loader.load).toHaveBeenCalled();
	});
	
	it("scripts can have a detector function and a timeout", function() {
		var detectorFun=function(){};
		var timeout1=1;
		var timeout2=2;
		var loader={
			'load':function() {
				expect(loader.description.detector).toBeDefined();
				expect(loader.description.detector).toBe(detectorFun);
				expect(loader.description.timeout).toEqual(timeout2);
			}
		};
		spyOn(loader, 'load');
		spyOn(repositoryConfig, 'newScriptLoader').andCallFake(function(desc) {
			loader.description=desc;
			return loader;
		});
		dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
		
		expect(repository.artifact(artifactId).withTimeout).not.toBeDefined();
		
		repository
			.artifact(artifactId)
			.isAScript(artifactURI)
			.withTimeout(timeout1)
			.isReadyWhen(detectorFun)
			.withTimeout(timeout2)
			.load();
		
		expect(repository.artifact(artifactId).withTimeout).not.toBeDefined();
		expect(loader.load).toHaveBeenCalled();
	});
	
	it("ajax loaded artifacts can retrieve its response data", function(){
		var data='artifact data';
		spyOn(repositoryConfig, 'newAjaxResourceLoader').andCallFake(function(desc) {
			return {
				'load': function(){
					desc.ready(data);
				}
			};
		});
		dependenciesManager.allImportedArtifactsAreReady.andReturn(false);
		dependenciesManager.anyImportedArtifactHasErrors.andReturn(false);
		
		expect(repository.artifact(artifactId).contents).not.toBeDefined();
		
		repository
			.artifact(artifactId)
			.requires(importedArtifactId)
			.isAAjaxResource(artifactURI)
			.load();
		
		expect(repository.artifact(artifactId).contents).not.toBeDefined();
		
		dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
		var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
		dependencyListener.importedArtifactStatusChanged(importedArtifactId);
		
		expect(repository.artifact(artifactId).contents()).toEqual(data);
		expect(repository.artifact(artifactId).errorDetails()).toBe(null);
	});
	
	it("ajax loaded artifacts can retrieve its error data", function(){
		var errorData='error data';
		spyOn(repositoryConfig, 'newAjaxResourceLoader').andCallFake(function(desc) {
			return {
				'load': function(){
					desc.error(errorData);
				}
			};
		});
		dependenciesManager.allImportedArtifactsAreReady.andReturn(false);
		dependenciesManager.anyImportedArtifactHasErrors.andReturn(false);
		
		expect(repository.artifact(artifactId).errorDetails).not.toBeDefined();
		
		repository
			.artifact(artifactId)
			.requires(importedArtifactId)
			.isAAjaxResource(artifactURI)
			.load();
		
		expect(repository.artifact(artifactId).errorDetails).not.toBeDefined();
		
		dependenciesManager.allImportedArtifactsAreReady.andReturn(true);
		dependenciesManager.anyImportedArtifactHasErrors.andReturn(false);
		
		var dependencyListener=dependenciesManager.artifactRequiresArtifact.mostRecentCall.args[0];
		dependencyListener.importedArtifactStatusChanged(importedArtifactId);
		
		expect(repository.artifact(artifactId).errorDetails()).toEqual(errorData);
		expect(repository.artifact(artifactId).contents()).toBe(null);
	});
	
	it("loadingProgress of an artifact will call dependenciesManager.loadingProgress(artifactId)", function() {
		dependenciesManager.loadingProgress.andReturn(1);
		
		var result=repository.artifact(artifactId).loadingProgress();
		
		expect(result).toEqual(1);
		expect(dependenciesManager.loadingProgress).toHaveBeenCalledWith(artifactId);
	});
});