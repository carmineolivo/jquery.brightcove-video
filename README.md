Brightcove Video
==================================================

jQuery Plugin
--------------------------------------

Helps you create custom dynamic solutions that work with the Brightcove Video platform.

The Smart Player technology detects if the device supports Flash, then the player loads in Flash mode, or supports HTML5, then the player loads in HTML5 mode (for Apple iOS and Android OS devices).

It handles player events, including events triggered by viewer actions like play or pause, and you can capture these events using simple event listeners.

You can also add an overlay positioned directly on top of the video element with your custom HTML content.

Initialization & Usage
--------------------------------------
The video object is created from an HTML element container (for example a DIV element).
When the video object is ready, the `TEMPLATE_READY` event is triggered.
So to execute the desired action, bind a function to the `templateReadyHandler`.

[EXAMPLE.html](EXAMPLE.html)

```javascript
// Initialize the jQuery Brightcove Video plugin
$('#player').brightcoveVideo({
	'playerID': '1925363807001',
	'@videoPlayer': '1754276221001',
	'templateReadyHandler': onTemplateReady
});
```

```javascript
// On TEMPLATE_READY (The player is ready for interaction through API)
function onTemplateReady(event) {
	var $player = $(this);

	// On PLAY (The player has begun or resumed playback)
	$player.brightcoveVideo("onMediaEvent", "PLAY", function(event) {
		alert("PLAY");

		// Pause the video after 3 seconds of play
		setTimeout(function() {
			$player.brightcoveVideo("pause");
			alert("pause");
		}, 3000);
	});

	// Append an image on top of the player, fading out on click
	$player.brightcoveVideo( "overlay", "<img src='http://goo.gl/hR0kK'>" )
		.on( "click", function() { $(this).fadeOut() } );
}
```

Requirements
--------------------------------------
The plugin requires
* [jQuery 1.6+](http://jquery.com)

Licensing
--------------------------------------

Copyright © 2013 Carmine Olivo

Licensed under the [MIT license](http://co.mit-license.org/).