import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-playlist-ui/dist/videojs-playlist-ui.css';
import 'videojs-playlist';
import 'videojs-playlist-ui';
import 'videojs-hotkeys';
import 'videojs-seek-buttons';
import 'videojs-mobile-ui';

export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, onReady, isPlaylist = false } = props;

	useEffect(() => {
		// Make sure Video.js player is only initialized once
		if (!playerRef.current) {
			const videoElement = document.createElement('video-js');
			videoElement.classList.add('vjs-big-play-centered');
			videoRef.current.appendChild(videoElement);

			const player = (playerRef.current = videojs(videoElement, options, () => {
				videojs.log('player is ready');
				onReady && onReady(player);
			}));

			// --- Playlist setup logic ---
			// If it's a playlist, call the playlist plugin on the player instance.
			if (isPlaylist) {
				// The playlist items are expected to be in options.sources
				player.playlist(options.sources);

				// Initialize the playlist UI. This will create the playlist UI component.
				// The container for the playlist UI is where the div with `data-vjs-player` is.
				// We'll add a class to the container div in the JSX to target it.
				player.playlistUi({
        el: playerRef.current,
    })

				// You can add event listeners for the playlist here if needed
				player.on('playlistitem', () => {
				  console.log('Now playing:', player.playlist.currentItem());
				});
			}
		} else {
			// This block is for updating an existing player.
			// When updating, we need to handle the playlist logic as well.
			const player = playerRef.current;

			// Update player options
			player.autoplay(options.autoplay);

			// Check if we are dealing with a playlist or a single source
			if (isPlaylist) {
				// If it's a playlist, update the playlist.
				// This will replace the entire playlist with the new one.
				player.playlist(options.sources);

				// You can also reset to the first item
				// player.playlist.currentItem(0);
			} else {
				// If it's a single source, update the source as before.
				player.src(options.sources);
			}
		}
	}, [options, videoRef, isPlaylist, onReady]);

	// Dispose the Video.js player when the functional component unmounts
	useEffect(() => {
		const player = playerRef.current;

		return () => {
			if (player && !player.isDisposed()) {
				player.dispose();
				playerRef.current = null;
			}
		};
	}, [playerRef]);

	return (
		// Add a class to the container div so we can target it for the playlist UI
		<div data-vjs-player className={`video-js-container ${isPlaylist ? 'vjs-playlist-ui' : ''}`}>
			<div ref={videoRef} />
		</div>
	);
};

export default VideoJS;

// Video.js options
export const videoJsOptions = {
	autoplay: true,
	controls: true,
	loop: false,
	responsive: true,
	fluid: true,
	// aspectRatio: '16:9',
	playbackRates: [0.75, 1, 1.25, 1.5, 1.75, 2.0],
	plugins: {
		hotkeys: {
			volumeStep: 0.1,
			seekStep: 5,
			enableModifiersForNumbers: false,
		},
		seekButtons: {
			forward: 10,
			back: 10,
		},
		mobileUi: {
			fullscreen: {
				enterOnRotate: true,
				exitOnRotate: true,
				lockOnRotate: true,
				lockToLandscapeOnEnter: false,
				disabled: false,
			},
			touchControls: {
				seekSeconds: 5,
				tapTimeout: 300,
				disableOnEnd: false,
				disabled: false,
			},
		},
        playlist: {
            autoadvance: true,
        },
        playlistUi: {
            el: 'the_playlist_container_id',
        },
	},
};

// --- Example usage in your parent component ---

// Example for a single film
// export const filmOptions = {
// 	...videoJsOptions,
// 	sources: [
// 		{
// 			src: 'path/to/your/film.mp4',
// 			type: 'video/mp4',
// 		},
// 	],
// };

// Example for a series
// export const seriesPlaylist = {
// 	...videoJsOptions,
// 	// This is the playlist array that the plugin will use
// 	sources: [
// 		{
// 			src: 'path/to/series/episode1.mp4',
// 			type: 'video/mp4',
// 			title: 'Episode 1: The Beginning',
// 			poster: 'path/to/poster1.jpg',
// 		},
// 		{
// 			src: 'path/to/series/episode2.mp4',
// 			type: 'video/mp4',
// 			title: 'Episode 2: The Plot Thickens',
// 			poster: 'path/to/poster2.jpg',
// 		},
// 		{
// 			src: 'path/to/series/episode3.mp4',
// 			type: 'video/mp4',
// 			title: 'Episode 3: The Climax',
// 			poster: 'path/to/poster3.jpg',
// 		},
// 	],
// };

// --- How you would use it in a parent component (e.g., App.jsx) ---
/*
import React, { useState } from 'react';
import { VideoJS, filmOptions, seriesPlaylist } from './VideoJS';

function App() {
  const [isSeries, setIsSeries] = useState(false);
  const playerRef = useRef(null);

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    // You can do more with the player here
  };

  const options = isSeries ? seriesPlaylist : filmOptions;

  return (
    <div>
      <h1>My Video App</h1>
      <button onClick={() => setIsSeries(!isSeries)}>
        Switch to {isSeries ? 'Film' : 'Series'}
      </button>
      <VideoJS 
        options={options} 
        onReady={handlePlayerReady} 
        isPlaylist={isSeries} 
      />
    </div>
  );
}
*/
