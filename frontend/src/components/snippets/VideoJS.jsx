import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/sea/index.css';
import 'videojs-hotkeys';
import 'videojs-seek-buttons';
import 'videojs-mobile-ui';

export function VideoJS({ options, onReady, color }) {
	const videoRef = useRef(null);
	const playerRef = useRef(null);

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
		} else {
			// This block is for updating an existing player.
			// When updating, we need to handle the playlist logic as well.
			const player = playerRef.current;

			// Update player options (ADD THE REST OF THE OPTIONS HERE)
			player.autoplay(options.autoplay);
			player.src(options.sources);
		}
	}, [options, videoRef, onReady]);

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

	// This useEffect handles applying the custom color
	useEffect(() => {
        const player = playerRef.current;

        if (player && color) {
            const playerEl = player.el(); // Get the player's root DOM element

            // Function to safely apply style if element exists
            const applyStyle = (selector, styleProp, value) => {
                const element = playerEl.querySelector(selector);
                if (element) {
                    element.style[styleProp] = value;
                }
            };

            // Main color (e.g., icons, progress bar)
            applyStyle('.vjs-theme-sea.video-js', 'color', color); // For general icons/text
            applyStyle('.vjs-theme-sea .vjs-play-progress', 'backgroundColor', color);
            // applyStyle('.vjs-theme-forest .vjs-slider.vjs-volume-level', 'backgroundColor', color);
            // applyStyle('.vjs-theme-forest .vjs-big-play-button', 'borderColor', color);
            // applyStyle('.vjs-theme-forest .vjs-big-play-button', 'backgroundColor', color + 'b3'); // Example with 70% opacity

            // applyStyle('.vjs-theme-forest .vjs-control-bar', 'backgroundColor', '#ff0000');
            // applyStyle('.vjs-theme-forest .vjs-current-time', 'color', '#00ff00');
            // applyStyle('.vjs-theme-forest .vjs-duration', 'color', '#00ff00');
        }
    }, [color]); // This effect depends only on the 'color' prop

	return (
		// Add a class to the container div so we can target it for the playlist UI
		<div data-vjs-player className='video-js-container'>
			<div ref={videoRef} className='vjs-theme-sea'/>
		</div>
	);
}

// Video.js options
export const videoJsOptions = {
	autoplay: true,
	controls: true,
	loop: false,
	responsive: true,
	fluid: true,
	aspectRatio: '19:9',
	playbackRates: [0.75, 1, 1.25, 1.5, 1.75, 2.0],
	plugins: {
		hotkeys: {
			volumeStep: 0.1,
			seekStep: 5,
			enableModifiersForNumbers: false,
		},
		// seekButtons: {
		// 	forward: 10,
		// 	back: 10,
		// },
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
	},
};
