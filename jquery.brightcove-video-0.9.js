/**
 * jquery.brightcove-video v0.9 (Feb 2013)
 * Helps you create custom dynamic solutions that work with the Brightcove Video platform.
 * Copyright © 2013 Carmine Olivo (carmineolivo@gmail.com)
 * Released under the (http://co.mit-license.org/) MIT license
 *
 * @requires
 * BrightcoveExperiences (http://admin.brightcove.com/js/BrightcoveExperiences.js)
 * jQuery (http://jquery.com/download/)
 *
 * @note On the Global tab of the player settings editor, under Web
 *       Settings, select Enable ActionScript/JavaScript APIs to enable
 *       the player for JavaScripting
 */
(function( $ ) {
"use strict";
var

	brightcoveVideo = {

		init: function( options, createExperiences ) {
			var params = $.extend( {
						experienceID: null,
						playerID: null,
						playerKey: null,
						"@videoPlayer": null,
						height: null,
						width: null,
						wmode: "transparent",
						bgcolor: "#FFFFFF",
						isVid: true,
						isUI: true,
						dynamicStreaming: true,
						secureConnections: null,
						includeAPI: true,
						templateLoadHandler: null,
						templateReadyHandler: null,
						templateErrorHandler: null,
						url: null,
						autoStart: false
					}, options ),
			    $that = this;

			if ( typeof brightcove == "undefined" ) {
				$
					.ajax( {
							url: "http://admin.brightcove.com/js/BrightcoveExperiences.js",
							dataType: "script",
							cache: true
						} )
					.done( function(script, textStatus) {
							brightcoveVideo.init.call( $that, options, createExperiences );
						} )
					.fail( function(jqxhr, settings, exception) {
							$.error( "Failed to load BrightcoveExperiences. (http://admin.brightcove.com/js/BrightcoveExperiences.js)" );
						} )
				;
				return this;
			}

			if ( typeof brightcove.pluginData == "undefined" ) {
				brightcove.pluginData = { };
			}

			brightcove.pluginData.onTemplateLoad = function( experienceID ) {
				var $experience = $( '#' + experienceID ),
				    $container = $experience.parent(),
				    data = $container.data( 'brightcoveVideo' );

				if ( ! $experience.length )
					return;

				while ( ! data && ! $container.is( 'body' ) ) {
					$container = $container.parent( );
					data = $container.data( 'brightcoveVideo' );
				}

				data.experienceID = experienceID;
				data.player = brightcove.api.getExperience(experienceID);
				if ( data.player ) {
					data.isSmartPlayer = true;
				} else {
					data.player = brightcove.getExperience(experienceID);
					data.isSmartPlayer = false;
				}
				data.videoPlayer = data.player.getModule( brightcove.api.modules.APIModules.VIDEO_PLAYER );
				data.experience = data.player.getModule( brightcove.api.modules.APIModules.EXPERIENCE );

				if ( data.usrTemplateLoadHandler != null ) {
					$container.brightcoveVideo( "onExperienceEvent", "TEMPLATE_READY", function( event ) {
							data.usrTemplateReadyHandler.call( $container.get()[0], event );
						} );
				}

				if ( data.usrTemplateLoadHandler != null ) {
					data.usrTemplateLoadHandler.call( $container.get()[0], experienceID );
				}
			};

			return this.each( function() {
				var playerObject,
				    usrTemplateLoadHandler,
				    usrTemplateReadyHandler,
				    $container = $( this ),
					data = $container.data( "brightcoveVideo" );

				// if the player hasn't been initialized yet
				if ( ! data ) {

					params.autoStart = Boolean( params.autoStart );

					usrTemplateLoadHandler = params.templateLoadHandler;
					usrTemplateReadyHandler = params.templateReadyHandler;

					params.templateLoadHandler = "brightcove.pluginData.onTemplateLoad";
					params.templateReadyHandler = null;

					playerObject = createPlayerObject( params );

					$container.data( "brightcoveVideo", {
							playerObject: playerObject,
							usrTemplateLoadHandler: usrTemplateLoadHandler,
							usrTemplateReadyHandler: usrTemplateReadyHandler,
							target: $container
					} );

					$container.html( playerObject );
					if ( typeof createExperiences == "undefined" || createExperiences ) {
						brightcoveVideo.createExperiences( );
					}
				}
			} );
		},

		destroy: function() {

			return this.each( function() {
				var $this = $( this ),
				    data = $this.data( "brightcoveVideo" ),
					playerObject = data.playerObject,
					isSmartPlayer = data.isSmartPlayer,
					experience = data.experience,
				    target = data.target;

				// Namespacing FTW :)
				$( window ).unbind( ".brightcoveVideo" );
				$this.removeData( "brightcoveVideo" );
				isSmartPlayer || experience.unload( );
				playerObject.remove( );
				target.empty( );
			} );

		},

		createExperiences: function( ) {

			brightcove.createExperiences( );

			return this;
		},

		/**
		 * Invokes the callback function with a boolean as to whether the video currently
		 * displayed in the video window is playing. If a linear ad is currently playing,
		 * this returns the state of the ad.
		 *
		 * @param {function} callback The callback function to invoke with the player state.
		 */
		getIsPlaying: function( callback ) {
			return this.each( function() {
				var data = $( this ).data( "brightcoveVideo" );
				if ( data.isSmartPlayer ) {
				   	data.videoPlayer.getIsPlaying( callback )
				} else {
				   	callback.call( this, data.videoPlayer.isPlaying() );
				}
			} );
		},

		/**
		 *
		 */
		getType: function( callback ) {
			return this.each( function() {
				var data = $( this ).data( "brightcoveVideo" );
				callback.call( this, data.player.type );
			} );
		},

		/**
		 * @param {string} event_name BEGIN, CHANGE, COMPLETE, ERROR, PLAY, PROGRESS, SEEK_NOTIFY, STOP
		 */
		onMediaEvent: function( event_name, handler, priority ) {
			return this.each( function() {
				var data = $( this ).data( "brightcoveVideo" ),
				    events = data.isSmartPlayer ? brightcove.api.events.MediaEvent : BCMediaEvent;

				data.videoPlayer
					.addEventListener( events[event_name], handler, priority );
			} );
		},

		/**
		 * @param {string} event_name TEMPLATE_READY
		 */
		onExperienceEvent: function( event_name, handler, priority ) {
			return this.each( function() {
				var data = $( this ).data( "brightcoveVideo" ),
				    events = data.isSmartPlayer ? brightcove.api.events.ExperienceEvent : BCExperienceEvent;

				data.experience
					.addEventListener( events[event_name], handler, priority );
			} );
		},

		/**
		 * @param {string} event_name CUE
		 */
		onCuePointEvent: function( event_name, handler, priority ) {
			return this.each( function() {
				var data = $( this ).data( "brightcoveVideo" ),
				    events = data.isSmartPlayer ? brightcove.api.events.CuePointEvent : BCCuePointEvent;

				data.videoPlayer
					.addEventListener( events[event_name], handler, priority );
			} );
		},

		/**
		 * Returns a transparent HTML element that is positioned directly on top of the video element.
		 */
		overlay: function( ) {
			var overlays = [ ];

			this.each( function() {
				var $this = $( this ),
				    data = $this.data( "brightcoveVideo" ),
				    $experience, position, $overlay;

				if ( ! data.overlay ) {
					$experience = $( '#' + data.experienceID );
					position = $experience.position( );
					$overlay = $( '<div />' )
						.css({
							position: "absolute",
							top: position.top,
							left: position.left,
							height: $experience.height( ),
							width: $experience.width( ),
							margin: 0,
							padding: 0,
							border: "0 none"
						})
						.appendTo( $this );

					data.overlay = $overlay.get( )[ 0 ];
				}

				overlays.push( data.overlay );
			} );

			return $( overlays );
		},

		/**
		 * Pauses or resumes playback of the current video in the video window.
		 *
		 * @param {boolean} pause (Passing a true value will pauses the video playback. Passing false will resume playback.)
		 */
		pause: function( pause ) {
			return this.each( function() {
				$( this ).data( "brightcoveVideo" ).videoPlayer
					.pause( pause );
			} );
		},

		play: function( ) {
			return this.each( function() {
				$( this ).data( "brightcoveVideo" ).videoPlayer
					.play( );
			} );
		},

		/**
		 * Seeks to a specified time position in the video.
		 *
		 * @param {number} time The time in seconds to seek to
		 */
		seek: function( time ) {
			return this.each( function() {
				$( this ).data( "brightcoveVideo" ).videoPlayer
					.seek( time );
			} );
		}
	},

	createPlayerObject = function( params ) {
		var $player = $( '<object />' )
				.attr( "class", "BrightcoveExperience" );

		if ( params.experienceID !== null ) {
			$player.attr( "id", params.experienceID );
		}

		$.each( params, function( n, v ) {
			if ( v !== null ) {
				$( '<param />' ).prop({ name: n, value: v }).appendTo( $player );
			}
		});

		return $player;
	};

	$.fn.brightcoveVideo = function( method ) {
		if ( brightcoveVideo[method] ) {
			return brightcoveVideo[ method ].apply( this, Array.prototype.slice.call(arguments, 1) );
		} else if ( typeof method === "object" || ! method ) {
			return brightcoveVideo.init.apply( this, arguments );
		} else {
			$.error( "Method " + method + " does not exists on jQuery.brightcoveVideo" );
		}
	};

})( jQuery );