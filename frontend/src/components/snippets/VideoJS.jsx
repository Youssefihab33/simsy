import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/sea/index.css';
import 'videojs-hotkeys';
import 'videojs-seek-buttons';
import 'videojs-mobile-ui';
import '../modules/VideoJS.module.css';

class CustomIconButton extends videojs.getComponent('Button') {
	constructor(player, options) {
		super(player, options);
		this.currentIconClass = null;
		this.applyIcon(options.iconClass);
		this.el().setAttribute('aria-label', this.localize(options.controlText || 'Custom Button'));
	}

	createEl() {
		const el = super.createEl('button');

		const iconDiv = videojs.dom.createEl('div', {
			className: 'vjs-icon-placeholder',
		});
		el.appendChild(iconDiv);

		const controlTextEl = videojs.dom.createEl('span', {
			className: 'vjs-control-text',
			textContent: this.options_.controlText || 'Custom Button',
		});
		el.appendChild(controlTextEl);

		return el;
	}

	applyIcon(newIconClass) {
		const iconElement = this.el().querySelector('.vjs-icon-placeholder');
		if (!iconElement) {
			videojs.log.warn('CustomIconButton: Could not find .vjs-icon-placeholder to update icon.');
			return;
		}
		if (this.currentIconClass) {
			iconElement.classList.remove(...this.currentIconClass.split(' '));
		}
		if (newIconClass) {
			iconElement.classList.add(...newIconClass.split(' '));
		}
		this.currentIconClass = newIconClass;
	}

	updateClickHandler(newHandler) {
		this.off('click', this.options_.clickHandler);
		this.options_.clickHandler = newHandler;
		this.on('click', newHandler);
	}
}

class CurrentEpisodeDisplay extends videojs.getComponent('Component') {
	constructor(player, options) {
		super(player, options);
		// This 'el()' is the div created by videojs.getComponent('Component') by default.
		// Add your custom classes here.
		this.el().classList.add('vjs-control', 'vjs-current-episode-display-custom');

		if (options.season && options.episode) {
			this.updateText(`S${options.season}\nE${options.episode}`);
		}
	}

	createEl() {
		// By default, a Component's createEl creates a div.
		// We can just return an empty div, and its textContent will be set by updateText.
		// We *don't* want to put 'vjs-remaining-time-display' here if it's causing issues.
		// Make sure it doesn't add any inline styles or problematic classes here.
		return videojs.dom.createEl('div', {
			// className: 'vjs-current-episode-inner-text' // Only if you need separate inner styling
		});
	}

	updateText(newText) {
		if (newText !== undefined && newText !== null) {
			this.el().textContent = newText; // Update the text of the main component element
		}
	}
}
videojs.registerComponent('CurrentEpisodeDisplay', CurrentEpisodeDisplay);

export function VideoJS({ options, onReady, color, episodeControls }) {
	const videoRef = useRef(null);
	const playerRef = useRef(null);

	useEffect(() => {
		// Make sure Video.js player is only initialized once
		if (!playerRef.current) {
			const videoElement = document.createElement('video-js');
			videoElement.classList.add('vjs-big-play-centered');
			videoRef.current.appendChild(videoElement);

			const player = (playerRef.current = videojs(videoElement, options, () => {
				onReady && onReady(player);
			}));

			// Adding custom components to the player
			videojs.registerComponent('CustomIconButton', CustomIconButton);
			const controlBar = playerRef.current.getChild('ControlBar');
			if (controlBar) {
				// --- Previous Episode Button ---
				if ('currentEpisode' in episodeControls) {
					const previousEpisodeButtonOptions = {
						controlText: 'Previous Episode',
						clickHandler: () => {
							episodeControls.actionEpisode('previous');
						},
						iconClass: 'vjs-icon-previous-item',
					};
					controlBar.addChild('CustomIconButton', previousEpisodeButtonOptions, 1, 'previousEpisodeButton');
				}

				// --- Rewind Button ---
				const rewindButtonOptions = {
					controlText: 'Rewind',
					clickHandler: () => {
						player.currentTime(player.currentTime() - 5);
					},
					iconClass: 'vjs-icon-replay-5',
				};

				controlBar.addChild('CustomIconButton', rewindButtonOptions, 2, 'rewindButton');

				if ('currentEpisode' in episodeControls) {
					// --- Current Episode Display ---
					const currentEpisodeDisplayOptions = {
						season: episodeControls.currentSeason,
						episode: episodeControls.currentEpisode,
					};
					controlBar.addChild('CurrentEpisodeDisplay', currentEpisodeDisplayOptions, 3);
				}

				// --- Seek Button ---
				const seekButtonOptions = {
					controlText: 'Seek',
					clickHandler: () => {
						player.currentTime(player.currentTime() + 5);
					},
					iconClass: 'vjs-icon-forward-5',
				};
				controlBar.addChild('CustomIconButton', seekButtonOptions, 4, 'seekButton');

				// --- Next Episode Button ---
				if ('currentEpisode' in episodeControls) {
					const nextEpisodeButtonOptions = {
						controlText: 'Next Episode',
						clickHandler: () => {
							episodeControls.actionEpisode('next');
						},
						iconClass: 'vjs-icon-next-item',
					};
					controlBar.addChild('CustomIconButton', nextEpisodeButtonOptions, 5, 'nextEpisodeButton');
				}
				// --- Download Button ---
				const downloadButtonOptions = {
					controlText: 'Download Video',
					clickHandler: function () {
						this.applyIcon('vjs-icon-downloading');
						const downloadFileName =
							'currentEpisode' in episodeControls
								? `${options.show_name} -s${episodeControls.currentSeason}e${episodeControls.currentEpisode}- SIMSY.mp4`
								: `${options.show_name} - SIMSY.mp4`;
						const a = document.createElement('a');
						a.style.display = 'none';
						a.download = downloadFileName;
						document.body.appendChild(a);
						a.href = options.sources[0].src;
						a.click();
						a.removeAttribute('href');
						document.body.removeChild(a);
						setTimeout(() => this.applyIcon('vjs-icon-file-download-done'), 3000);
					},
					iconClass: 'vjs-icon-file-download',
				};
				controlBar.addChild('CustomIconButton', downloadButtonOptions, controlBar.children().length - 1, 'downloadButton');
			}
		} else {
			// This block is for updating an existing player.
			// When updating, we need to handle the playlist logic as well.
			const player = playerRef.current;

			// Update player options (ADD THE REST OF THE OPTIONS HERE)
			player.autoplay(options.autoplay);
			player.src(options.sources);

			// To update CurrentEpisodeDisplay text
			const currentEpisodeDisplay = player.getChild('ControlBar')?.getChild('CurrentEpisodeDisplay');
			if (currentEpisodeDisplay && 'currentEpisode' in episodeControls) {
				currentEpisodeDisplay.updateText(`S${episodeControls.currentSeason}E${episodeControls.currentEpisode}`);
			}
			// Update the download button clickHandler
			const downloadButton = player.getChild('ControlBar')?.getChild('CustomIconButton', 'downloadButton');
			// Restore Icon
			downloadButton.applyIcon('vjs-icon-file-download');
			if (downloadButton && 'currentEpisode' in episodeControls) {
				downloadButton.updateClickHandler(() => {
					downloadButton.applyIcon('vjs-icon-downloading');
					const downloadFileName =
						'currentEpisode' in episodeControls
							? `${options.show_name} -s${episodeControls.currentSeason}e${episodeControls.currentEpisode}- SIMSY.mp4`
							: `${options.show_name} - SIMSY.mp4`;
					const a = document.createElement('a');
					a.style.display = 'none';
					a.download = downloadFileName;
					document.body.appendChild(a);
					a.href = options.sources[0].src;
					a.click();
					a.removeAttribute('href');
					document.body.removeChild(a);
					setTimeout(() => downloadButton.applyIcon('vjs-icon-file-download-done'), 3000);
				});
			}
		}
	}, [options, videoRef, onReady, episodeControls]);

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
			<div ref={videoRef} className='vjs-theme-sea' />
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
