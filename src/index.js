'use strict';

require('angular');
require('angular-spotify');

(function(angular){

	let app = angular.module('topSongs', ['spotify']);

	app.controller('TopSongsController', function($window){

		this.exportPlaylist = function(playlist, event) {
			let exportPlaylist = {
				title: playlist.title,
				songs: []
			};
			playlist.songs.forEach( song => {
				exportPlaylist.songs.push({
					track: song.name,
					artist: song.artists.join(', '),
					album: song.album.name,
					note: song.note,
					customImage: song.image
				});
			});
			$window.open( "data:text/json;charset=utf-8," + encodeURIComponent( JSON.stringify(exportPlaylist) ), '_blank');
		};

	});

	app.component('playlistCreator', {
		bindings: {
			onSavePlaylist: '&',
			onExportPlaylist: '&'
		},
		template: `
			<h1>Spotify Search</h1>
			<h3>Searches Spotify by track, album and artist</h3>
			<search on-search="$ctrl.search(data)"></search>
			<tracks-search 
				tracks="tracksSearchResponse"
				on-select="$ctrl.addTrack(id)"
			></tracks-search>
			<div class="playlist-container">
				<playlist
					list="$ctrl.playlist"
				></playlist>
				<!--<button ng-click=" $ctrl.onSavePlaylist( { playlist : $ctrl.playlist } ) ">Save Playlist</button>-->
				<button ng-click=" $ctrl.onExportPlaylist( { playlist : $ctrl.playlist, event : $event } )">Export Playlist</button>
				<button ng-click=" $ctrl.newPlaylist()">New Playlist</button>	
			</div>
		`,
		controller: function($scope) {
			this.searchTracks = {};
			this.playlist = {
				title: 'Untitled Playlist',
				songs: []
			};
			this.search = function(data) {
				data.tracks.items.forEach( track => {
					this.searchTracks[track.id] = track;
				} );
				$scope.tracksSearchResponse = data.tracks.items;
			};
			this.addTrack = function(trackId) {
				let track = this.searchTracks[trackId];
				this.playlist.songs.push(track);
			};
			this.newPlaylist = function() {
				this.playlist = {
				title: 'Untitled Playlist',
				songs: []
				};
			};
		}
	});

	app.component('playlist', {
		bindings: {
			list: '='
		},
		template: `
			<h1>
				<span ng-click="titleEditing = titleEditing * -1" ng-show="titleEditing===1">{{ $ctrl.list.title }}</span>
				<input ng-model="$ctrl.list.title" ng-enter="titleEditing = titleEditing * -1" type="text" ng-hide="titleEditing===1">
			</h1>
			<ul class="tracks-list">
				<li 
					ng-repeat="track in $ctrl.list.songs track by track.id" data-track-id="{{ track.id }}">

					<div class="track-name"><span>{{ $index + 1 }}</span> <span>{{ track.name }}</span></div>
					<div class="track-album"><span class="desc">album</span> </span>{{ track.album.name }}</span></div>
					<span class="desc">artist<span ng-show="track.artists.length > 1">s</span></span> <ul class="track-artists"><li ng-repeat="artist in track.artists">{{ artist.name }}<span ng-hide="$last">, </span></li></ul>
					<img ng-hide="addingImage==='{{track.id}}'" ng-src="{{ track.image }}">
					<p ng-hide="addingNote==='{{track.id}}'">{{ track.note }}</p>

					<div class="controls">
						<span ng-click="addingImage = track.id" class="add-image">Add image</span> 
						<span ng-click="addingNote = track.id" class="add-note">Add note</span> 
						<span ng-click="$ctrl.remove($index)" class="remove">Remove</span> 
					</div>

					<div ng-show="addingImage==='{{track.id}}'">
						<input ng-enter="addingImage=false" ng-model="track.image" type="text">
					</div>

					<div ng-show="addingNote==='{{track.id}}'">
						<textarea ng-enter="addingNote=false" ng-model="track.note"></textarea>
					</div>

				</li>
			</ul>
		`,
		controller: function($scope) {

			$scope.titleEditing = 1;

			this.remove = index => {
				this.list.songs.splice(index, 1);	
			}
		}
	});

	app.component('search', {
		bindings: {
			onSearch: '&'
		},
		controller: function($scope, Spotify){
			this.submit = () => {
				Spotify.search(this.query, 'track', { limit: 50 })
				.then( data => {
					this.onSearch({data:data});
				});
			}
		},
		template: `
			<span><input ng-enter="$ctrl.submit()" ng-model="$ctrl.query" type="text"></span>
			<span><button ng-click="$ctrl.submit()">Search</button></span>
			`
	});

	app.component('tracksSearch', {
		bindings: {
			tracks: '<',
			onSelect: '&'
		},
		template: `
			<ul class="tracks-list">
				<li ng-click="$ctrl.onSelect({id: track.id})" 
					ng-repeat="track in $ctrl.tracks" data-track-id="{{ track.id }}">

					<div class="track-name"><span>{{ track.name }}</span></div>
					<div class="track-album"><span class="desc">album</span> </span>{{ track.album.name }}</span></div>
					<span class="desc">artist<span ng-show="track.artists.length > 1">s</span></span> <ul class="track-artists"><li ng-repeat="artist in track.artists">{{ artist.name }}<span ng-hide="$last">, </span></li></ul>

				</li>
			</ul>
			`
	});

	app.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind('keydown keypress', function (e) {
				if(e.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});
					e.preventDefault();
				}
			});
		};
	});

}(angular));