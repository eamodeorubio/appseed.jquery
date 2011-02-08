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
describe("appseed.DependenciesManager", function() {
	var artifactId='artifact id'
		, importedArtifactId1='imported artifact id 1'
		, importedArtifactId2='imported artifact id 2'
		, anotherArtifactId='another artifact id'
		, importedArtifactId3='imported artifact id 3';
	
	var manager, repo;
	beforeEach(function(){
		repo={
			'artifact':function(id){
				return this.artifacts[id];
			},
			'artifacts':{}
		};
		spyOn(repo, 'artifact').andCallThrough();
		manager=new appseed.DependenciesManager(repo);
	});
	
	var mockArtifact=function(id) {
		var artifact={'load':function(){},'isReady':function(){},'hasErrors':function(){}};
		spyOn(artifact, 'load');
		spyOn(artifact, 'isReady');
		spyOn(artifact, 'hasErrors');
		repo.artifacts[id]=artifact;
		return artifact;
	};
	
	var mockArtifactDescription=function(id) {
		var artifact={'importedArtifactStatusChanged':function(){}};
		spyOn(artifact, 'importedArtifactStatusChanged');
		artifact.id=id;
		return artifact;
	};
	
	it("loadImportedArtifactsByMe() will do nothing if no dependencies", function() {
		manager.loadImportedArtifactsBy(artifactId);
		
		expect(repo.artifact).not.toHaveBeenCalled();
	});
	
	it("loadImportedArtifactsByMe() will locate and call load() in the imported dependencies", function() {
		var artifactDescription=mockArtifactDescription(artifactId);
		var importedArtifact1=mockArtifact(importedArtifactId1);
		var importedArtifact2=mockArtifact(importedArtifactId2);
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		
		manager.loadImportedArtifactsBy(artifactId);
		
		expect(importedArtifact1.load).toHaveBeenCalledExactly(1);
		expect(importedArtifact2.load).toHaveBeenCalledExactly(1);
	});
	
	it("allImportedArtifactsAreReady() is true only if all the imported dependencies are ready", function() {
		var artifactDescription=mockArtifactDescription(artifactId);
		
		var artifact1Ready=false;
		var importedArtifact1=mockArtifact(importedArtifactId1);
		importedArtifact1.isReady.andCallFake(function(){
			return artifact1Ready;
		});
		
		var artifact2Ready=false;
		var importedArtifact2=mockArtifact(importedArtifactId2);
		importedArtifact2.isReady.andCallFake(function(){
			return artifact2Ready;
		});
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		
		expect(manager.allImportedArtifactsAreReady(artifactId)).toBeFalsy();
		
		artifact1Ready=true;
		
		expect(manager.allImportedArtifactsAreReady(artifactId)).toBeFalsy();
		
		artifact2Ready=true;
		
		expect(manager.allImportedArtifactsAreReady(artifactId)).toBeTruthy();
	});
	
	it("anyImportedArtifactHasErrors() is true if any of the imported dependencies has errors", function() {
		var artifactDescription=mockArtifactDescription(artifactId);
		
		var artifact1Errors=false;
		var importedArtifact1=mockArtifact(importedArtifactId1);
		importedArtifact1.hasErrors.andCallFake(function(){
			return artifact1Errors;
		});
		
		var artifact2Errors=false;
		var importedArtifact2=mockArtifact(importedArtifactId2);
		importedArtifact2.hasErrors.andCallFake(function(){
			return artifact2Errors;
		});
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		
		expect(manager.anyImportedArtifactHasErrors(artifactId)).toBeFalsy();
		
		artifact1Errors=true;
		
		expect(manager.anyImportedArtifactHasErrors(artifactId)).toBeTruthy();
		
		artifact2Errors=true;
		
		expect(manager.anyImportedArtifactHasErrors(artifactId)).toBeTruthy();
		
		artifact1Errors=false;
		
		expect(manager.anyImportedArtifactHasErrors(artifactId)).toBeTruthy();
	});
	
	it("notifyArtifactStatusChanged() will locate all artifacts importing it and call importedArtifactStatusChanged() ", function() {
		var artifactDescription=mockArtifactDescription(artifactId);
		var anotherArtifactDescription=mockArtifactDescription(anotherArtifactId);
		var importedArtifact1=mockArtifact(importedArtifactId1);
		var importedArtifact2=mockArtifact(importedArtifactId2);
		var importedArtifact3=mockArtifact(importedArtifactId3);
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(anotherArtifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(anotherArtifactDescription, importedArtifactId3);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(anotherArtifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(anotherArtifactDescription, importedArtifactId3);
		
		manager.notifyArtifactStatusChanged(importedArtifactId1);
		
		expect(artifactDescription.importedArtifactStatusChanged).toHaveBeenCalledExactly(1);
		expect(anotherArtifactDescription.importedArtifactStatusChanged).toHaveBeenCalledExactly(1);
		expect(artifactDescription.importedArtifactStatusChanged).toHaveBeenCalledWith(importedArtifactId1);
		expect(anotherArtifactDescription.importedArtifactStatusChanged).toHaveBeenCalledWith(importedArtifactId1);
		
		manager.notifyArtifactStatusChanged(importedArtifactId2);
		expect(artifactDescription.importedArtifactStatusChanged).toHaveBeenCalledExactly(2);
		expect(anotherArtifactDescription.importedArtifactStatusChanged).toHaveBeenCalledExactly(1);
		expect(artifactDescription.importedArtifactStatusChanged).toHaveBeenCalledWith(importedArtifactId2);
	});
	
	it("given an artifact with no prerrequisites, but not ready, loadingProgress() will return 0", function() {
		var artifact=mockArtifact(artifactId);
		artifact.isReady.andReturn(false);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0);
	});
	
	it("given an artifact with no prerrequisites, but ready, loadingProgress() will return 1", function() {
		var artifact=mockArtifact(artifactId);
		artifact.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(1);
	});
	
	it("given an artifact with prerrequisites, but not ready, loadingProgress() will return the average count(all deep imported artifacts ready)/(1+count(all deep imported artifacts)", function() {
		var artifact=mockArtifact(artifactId);
		artifact.isReady.andReturn(false);
		
		var artifactDescription=mockArtifactDescription(artifactId);
		var importedArtifact1=mockArtifact(importedArtifactId1);
		var importedArtifact2=mockArtifact(importedArtifactId2);
		var importedArtifact3=mockArtifact(importedArtifactId3);
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId3);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId3);
		
		importedArtifact1.isReady.andReturn(false);
		importedArtifact2.isReady.andReturn(false);
		importedArtifact3.isReady.andReturn(false);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0);
		
		importedArtifact2.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0.25);
		
		importedArtifact1.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0.5);
		
		importedArtifact3.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0.75);
		
		var anotherImportedArtifact=mockArtifact(anotherArtifactId);
		anotherImportedArtifact.isReady.andReturn(false);
		manager.artifactRequiresArtifact(artifactDescription, anotherArtifactId);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0.6)
		anotherImportedArtifact.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(0.8);
		
		var deepArtifactId1="deepArtifactId1", deepArtifactId2="deepArtifactId2";
		var anotherImportedArtifactDescription=mockArtifactDescription(anotherArtifactId);
		var deepArtifact1=mockArtifact(deepArtifactId1);
		var deepArtifact2=mockArtifact(deepArtifactId2);
		manager.artifactRequiresArtifact(anotherImportedArtifactDescription, deepArtifactId1);
		manager.artifactRequiresArtifact(anotherImportedArtifactDescription, deepArtifactId2);
		manager.artifactRequiresArtifact(anotherImportedArtifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(anotherImportedArtifactDescription, importedArtifactId2);
		manager.artifactRequiresArtifact(anotherImportedArtifactDescription, importedArtifactId3);
		
		anotherImportedArtifact.isReady.andReturn(false);
		deepArtifact1.isReady.andReturn(false);
		deepArtifact2.isReady.andReturn(false);
		
		expect(manager.loadingProgress(artifactId)).toEqual(3/7);
		
		deepArtifact2.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(4/7);
		
		deepArtifact1.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(5/7);
		
		anotherImportedArtifact.isReady.andReturn(true);
		
		expect(manager.loadingProgress(artifactId)).toEqual(6/7);
	});
	
	it("given an artifact with prerrequisites, and ready, loadingProgress() will return 1", function() {
		var artifact=mockArtifact(artifactId);
		artifact.isReady.andReturn(true);
		
		var artifactDescription=mockArtifactDescription(artifactId);
		var importedArtifact1=mockArtifact(importedArtifactId1);
		var importedArtifact2=mockArtifact(importedArtifactId2);
		
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId1);
		manager.artifactRequiresArtifact(artifactDescription, importedArtifactId2);
		
		expect(manager.loadingProgress(artifactId)).toEqual(1);
	});
});