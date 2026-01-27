// Main
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Styles & Icons
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Typography, Button, Chip, Avatar, Tooltip, Modal, Box } from '@mui/material';
import {
	PlayArrow as PlayArrowIcon,
	BookmarkAdd as BookmarkAddIcon,
	BookmarkAdded as BookmarkAddedIcon,
	Favorite as FavoriteIcon,
	FavoriteBorder as FavoriteBorderIcon,
	FirstPage as FirstPageIcon,
	ArrowBackIosNew as ArrowBackIosNewIcon,
	ArrowForwardIos as ArrowForwardIosIcon,
	LastPage as LastPageIcon,
} from '@mui/icons-material';

// My modules
import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ArtistCard from './snippets/ArtistCard.jsx';
import styles from './modules/ShowDetails.module.css';
import { VideoJS, videoJsOptions } from './snippets/VideoJS.jsx';

// --- Helper Functions ---

/**
 * Determines the accent color based on the show kind.
 * @param {string} kind - The kind of show (e.g., 'film', 'series', 'program').
 * @returns {string} The corresponding hex color code.
 */
const getAccentColor = (kind) => {
	switch (kind) {
		case 'film':
			return '#9A0606'; // Red
		case 'series':
			return '#5DD95D'; // Green
		case 'program':
			return '#54A9DE'; // Blue
		default:
			return '#9A0606'; // Default to Red
	}
};

/**
 * Calculates the hover color based on the base accent color.
 * @param {string} accentColor - The base accent color.
 * @returns {string} The brighter hover color.
 */
const getHoverColor = (accentColor) => {
	switch (accentColor) {
		case '#9A0606':
			return '#B00707';
		case '#5DD95D':
			return '#79E679';
		case '#54A9DE':
			return '#6CB5E3';
		default:
			return '#6CB5E3'; // Default hover color
	}
};

/**
 * Calculates the darker color based on the base accent color.
 * @param {string} accentColor - The base accent color.
 * @returns {string} The darker color.
 */
const getDarkerColor = (accentColor) => {
	switch (accentColor) {
		case '#9A0606':
			return '#4D0303';
		case '#5DD95D':
			return '#409740';
		case '#54A9DE':
			return '#2C5772';
		default:
			return '#4D0303'; // Default hover color
	}
};

// --- Custom Hooks ---
/**
 * Custom hook for fetching show details and user-specific interaction data.
 * @param {string} showId - The ID of the show to fetch.
 * @returns {object} Contains show details, user interaction status, loading state, error, and refetch functions.
 */
const useShowData = (showId) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		if (!showId) {
			setLoading(false);
			setError('No Show ID was provided!');
			return;
		}
		setError(null);

		try {
			const response = await axiosInstance.get(`shows/${showId}/`);
			setData(response.data);
		} catch (err) {
			console.error('Error fetching show data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [showId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const setInFavorites = useCallback((val) => {
		setData((prev) => (prev ? { ...prev, in_favorites: val } : prev));
	}, []);

	const setInWatchlist = useCallback((val) => {
		setData((prev) => (prev ? { ...prev, in_watchlist: val } : prev));
	}, []);

	return {
		show: data,
		inFavorites: data?.in_favorites || false,
		inWatchlist: data?.in_watchlist || false,
		setInFavorites,
		setInWatchlist,
		loading,
		error,
		refetchShowData: fetchData,
	};
};

/**
 * Custom hook for handling media player logic, including episode navigation and time tracking.
 * @param {object} show - The show details object.
 * @param {object} userShowData - User-specific data for the show.
 * @param {function} refetchShowData - Function to refetch show and user data.
 * @returns {object} Contains modal state, player options, episode navigation functions, and more.
 */
const useMediaPlayer = (show, refetchShowData) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [season, setSeason] = useState(0);
	const [episode, setEpisode] = useState(0);
	const [episodeChangeMessage, setEpisodeChangeMessage] = useState(null);
	const [currentVideoStartTime, setCurrentVideoStartTime] = useState(0);
	const playerRef = useRef(null);

	// Refs to hold current season/episode for use in async callbacks
	const seasonRef = useRef(season);
	const episodeRef = useRef(episode);
	useEffect(() => {
		seasonRef.current = season;
	}, [season]);
	useEffect(() => {
		episodeRef.current = episode;
	}, [episode]);

	// This useEffect initializes season, episode, and starting time from show data
	useEffect(() => {
		if (show) {
			setSeason(show.season_reached || 1);
			setEpisode(show.episode_reached || 1);
			setCurrentVideoStartTime(show.time_reached || 0);
		}
	}, [show]);

	const handleModalOpen = useCallback(() => {
		setModalOpen(true);
		refetchShowData();
	}, [refetchShowData]);

	const handleModalClose = useCallback(() => {
		setModalOpen(false);
		refetchShowData(); // Fetch latest user data when closing the modal
		// Dispose of the player instance when modal closes to prevent memory leaks
		if (playerRef.current) {
			playerRef.current.dispose();
			playerRef.current = null;
		}
	}, [refetchShowData]);

	const sendTimeReached = useCallback(async (currentShowId, currentSeason, currentEpisode, timeReached) => {
		try {
			const response = await axiosInstance.post(`shows/${currentShowId}/update_time_reached/`, {
				season: currentSeason || 0,
				episode: currentEpisode || 0,
				time_reached: Math.round(timeReached),
			});
			console.log(response.data.message);
		} catch (error) {
			console.error('Error updating time reached:', error);
		}
	}, []);

	const actionEpisode = useCallback(
		async (actionName) => {
			try {
				const response = await axiosInstance.post(`shows/${show.id}/${actionName}_episode/`, {
					season: seasonRef.current,
					episode: episodeRef.current,
				});
				if (response.data.changed === false) {
					setEpisodeChangeMessage(response.data.message);
				} else {
					setSeason(response.data.new_season);
					setEpisode(response.data.new_episode);
					// Update currentVideoStartTime from the backend response
					setCurrentVideoStartTime(response.data.starting_time);
					setEpisodeChangeMessage(null);
					console.log('action_Episode success:', response.data);
				}
			} catch (error) {
				setEpisodeChangeMessage(error.response?.data || 'Error changing episode.');
				console.error('Error in action_Episode:', error);
			}
		},
		[show?.id]
	);

	const handlePlayerReady = useCallback(
		(player) => {
			playerRef.current = player;
			// DEBUG : 4
			console.log('PlayerReady run');

			// Save current time on various player events
			player.on(['fullscreenchange', 'seeked', 'dispose'], () => {
				if (playerRef.current) {
					sendTimeReached(show.id, seasonRef.current, episodeRef.current, playerRef.current.currentTime());
				}
			});
			// When video ends, reset time reached to 0 and advance episode if applicable
			player.on('ended', () => {
				sendTimeReached(show.id, seasonRef.current, episodeRef.current, 0);
				// If it's a series, automatically go to the next episode
				if (show.kind === 'series') {
					actionEpisode('next'); // This will update season/episode and trigger re-render/source change
				}
				// DEBUG : 5
				console.log('---VIDEO ENDED---');
			});
		},
		[sendTimeReached, show, actionEpisode]
	);

	const getVideoDetails = useCallback(() => {
		let filmsSrc = '';
		let seriesSrc = '';
		let captionsSrc = '';

		if (!show) {
			return { filmsSrc: '', seriesSrc: '', captionsSrc: '' };
		}

		switch (show.kind) {
			// The strange part below is to make the films and series paths work with both films and series
			// Making the rule less strict
			case 'film':
				filmsSrc = `${import.meta.env.VITE_VC_SOURCE + 'films/' + show.name}.mp4`;
				seriesSrc = `${import.meta.env.VITE_VC_SOURCE + 'series/' + show.name}.mp4`;
				captionsSrc = `${import.meta.env.VITE_VC_SOURCE + 'captions/' + show.name}.vtt`;
				break;
			case 'series':
				filmsSrc = `${import.meta.env.VITE_VC_SOURCE + 'films/' + show.name}/s${season}e${episode}.mp4`;
				seriesSrc = `${import.meta.env.VITE_VC_SOURCE + 'series/' + show.name}/s${season}e${episode}.mp4`;
				captionsSrc = `${import.meta.env.VITE_VC_SOURCE + 'captions/' + show.name}/s${season}e${episode}.vtt`;
				break;
			default:
				console.error('Unknown show kind:', show.kind);
				break;
		}
		return { filmsSrc, seriesSrc, captionsSrc };
	}, [show, season, episode]); // Dependency on season and episode is crucial here

	const { filmsSrc, seriesSrc, captionsSrc } = getVideoDetails();

	// Effect to update player source when filmsSrc or captionsSrc changes
	// and also apply the currentVideoStartTime
	useEffect(() => {
		if (playerRef.current && show) {
			playerRef.current.src([
				{ src: filmsSrc, type: 'video/mp4' },
				{ src: seriesSrc, type: 'video/mp4' },
			]);

			if (show.captions && captionsSrc) {
				// Remove existing tracks and add the new one
				const tracks = playerRef.current.textTracks();
				for (let i = 0; i < tracks.length; i++) {
					playerRef.current.removeRemoteTextTrack(tracks[i]);
				}
				playerRef.current.addRemoteTextTrack(
					{
						kind: 'captions',
						srclang: 'en',
						label: 'English',
						src: captionsSrc,
						mode: show.view_captions !== false ? 'showing' : 'disabled',
					},
					true
				); // The 'true' argument ensures the track is loaded
			}

			// This listener ensures currentTime is set AFTER the video is loaded
			const handleLoadedData = () => {
				if (playerRef.current) {
					playerRef.current.currentTime(currentVideoStartTime);
					// DEBUG : 6
					console.log('set time on LOADEDDATA :', currentVideoStartTime);
					playerRef.current.play(); // Auto-play the new episode
					playerRef.current.off('loadeddata', handleLoadedData); // Remove listener after use
				}
			};

			playerRef.current.on('loadeddata', handleLoadedData);
			playerRef.current.load(); // Load the new source
		}
		// Cleanup function for useEffect to remove the 'loadeddata' listener
		return () => {
			if (playerRef.current) {
				playerRef.current.off('loadeddata');
			}
		};
	}, [filmsSrc, seriesSrc, captionsSrc, show, currentVideoStartTime]); // Added currentVideoStartTime to dependencies

	const playerOptions = show
		? {
				...videoJsOptions,
				show_name: show.name,
				sources: [
					{ src: filmsSrc, type: 'video/mp4' },
					{ src: seriesSrc, type: 'video/mp4' },
				],
				tracks:
					show.captions && captionsSrc
						? [
								{
									kind: 'captions',
									srclang: 'en',
									label: 'English',
									src: captionsSrc,
									mode: show.view_captions !== false ? 'showing' : 'disabled',
								},
						]
						: [],
		}
		: {};

	return {
		modalOpen,
		handleModalOpen,
		handleModalClose,
		handlePlayerReady,
		playerOptions,
		season,
		episode,
		actionEpisode,
		episodeChangeMessage,
		playerRef,
	};
};

/**
 * Custom hook for toggling show status (favorites/watchlist) via API.
 * @param {string} showId - The ID of the show.
 * @param {function} setInState - Setter function for the local state (e.g., setInFavorites).
 * @param {string} endpoint - The API endpoint suffix (e.g., 'toggleFavorite').
 * @param {string} name - The property name in the API response (e.g., 'favorites').
 * @returns {function} The toggle handler function.
 */
const useToggleApi = (showId, setInState, endpoint, name) => {
	const handleToggle = useCallback(async () => {
		if (!showId) return;
		try {
			const response = await axiosInstance.post(`shows/${showId}/${endpoint}/`);
			if (response.status === 200) {
				setInState(response.data[`in_${name}`]); // Update local state based on API response
			} else {
				throw new Error(`Error toggling ${endpoint}: ${response.statusText}`);
			}
		} catch (error) {
			console.error(`Error toggling ${endpoint}:`, error);
			// Optionally, revert the local state if the API call fails
			// setInState(prev => !prev);
		}
	}, [showId, setInState, endpoint, name]);
	return handleToggle;
};

// --- Show Details Component ---

const ShowDetails = () => {
	const { show_id } = useParams();
	const searchbarRef = useRef(null); // Assuming a searchbar exists elsewhere that might steal focus // DEBUG : FIX THIS

	const { show, inFavorites, inWatchlist, setInFavorites, setInWatchlist, loading, error, refetchShowData } = useShowData(show_id);

	const handleFavoritesToggle = useToggleApi(show?.id, setInFavorites, 'toggleFavorite', 'favorites');
	const handleWatchlistToggle = useToggleApi(show?.id, setInWatchlist, 'toggleWatchlist', 'watchlist');

	const { modalOpen, handleModalOpen, handleModalClose, handlePlayerReady, playerOptions, season, episode, actionEpisode, episodeChangeMessage, playerRef } = useMediaPlayer(
		show,
		refetchShowData
	); // Removed playerKey from destructuring

	// Calculate accent and hover and darker colors once
	const accentColor = getAccentColor(show?.kind);
	const hoverColor = getHoverColor(accentColor);
	const darkerColor = getDarkerColor(accentColor);

	// Keyboard controls for media playback and modal
	const handleKeyPress = useCallback(
		(event) => {
			const isSearchbarActive = searchbarRef.current && document.activeElement === searchbarRef.current;
			if (isSearchbarActive) {
				return; // Do nothing if searchbar is active
			}

			if (!modalOpen) {
				if (event.code === 'KeyK') {
					handleModalOpen();
				}
				return; // Only 'K' works outside modal, then exit
			}

			// Handle player controls inside the modal
			if (playerRef.current) {
				switch (event.code) {
					case 'KeyK': // K -> Pause/Play
						playerRef.current.focus();
						if (playerRef.current.paused()) {
							playerRef.current.play();
						} else {
							playerRef.current.pause();
						}
						break;
					case 'KeyJ': // J -> Previous Episode
						if (show?.kind !== 'film') {
							// Directly call actionEpisode with 'previous'
							actionEpisode('previous');
						}
						break;
					case 'KeyL': // L -> Next Episode
						if (show?.kind !== 'film') {
							// Directly call actionEpisode with 'next'
							actionEpisode('next');
						}
						break;
					case 'KeyF': // F -> Fullscreen (Video.js handles this natively, just focus)
						playerRef.current.focus();
						break;
					case 'KeyX': { // X -> Adjust Playback Rate
						playerRef.current.focus();
						const currentRate = playerRef.current.playbackRate();
						playerRef.current.playbackRate(event.shiftKey ? currentRate - 0.25 : currentRate + 0.25);
						break;
					}
					case 'KeyZ': // Z -> Reset Playback Rate to 1x
						playerRef.current.focus();
						playerRef.current.playbackRate(1);
						break;
					// No case for 'C' (captions) as it requires a specific API interaction which is not provided.
					default:
						break;
				}
			}
		},
		[show?.kind, playerRef, modalOpen, handleModalOpen, actionEpisode]
	);

	useEffect(() => {
		document.addEventListener('keypress', handleKeyPress);
		return () => {
			document.removeEventListener('keypress', handleKeyPress);
		};
	}, [handleKeyPress]);

	// --- Render Logic ---

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className='text-light text-center mt-5'>Error loading show details. Please try again later.</div>;
	}

	if (!show) {
		return <div className='text-light text-center mt-5'>No show details found.</div>;
	}

	// Common props for MUI Chip components
	const commonChipProps = {
		variant: 'outlined',
		sx: { margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' },
	};

	// Modified render function for chips
	const renderChipGroup = (items, kind) => (
		<>
			{items.map((item) => (
				<Tooltip key={item.id} title={item.description} placement='top'>
					<Chip
						label={item.name}
						variant='outlined'
						component='a'
						href={`/${kind}/${item.id}`}
						avatar={<Avatar alt={item.name} src={item.image || item.flag} className='ms-2 text-light' clickable='true' />}
						{...commonChipProps}
						clickable
					/>
				</Tooltip>
			))}
		</>
	);

	return (
		<div className={styles.showDetailsContainer}>
			{/* --- Hero Section --- */}
			<div className={styles.heroSection} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${show.image})` }}>
				<Container>
					<Row className='align-items-center mt-5 mt-md-0'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0 mt-5 mt-md-0'>
							<img src={show.image} alt={`${show.name} poster`} className={styles.posterImage} loading='lazy' />
						</Col>
						<Col md={8} className='mt-5 mt-md-0'>
							<Typography variant='h2' component='h1' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								{show.name}
							</Typography>
							<Typography variant='h5' component='p' className='text-light mb-5'>
								{show.year} | {show.kind.charAt(0).toUpperCase() + show.kind.slice(1)} {show.kind !== 'film' && `| S${season}E${episode}`}
							</Typography>
							<div className='d-flex align-items-center mb-4'>
								<Button
									variant='contained'
									size='large'
									className='me-3'
									startIcon={<PlayArrowIcon />}
									sx={{ backgroundColor: accentColor, '&:hover': { backgroundColor: hoverColor } }}
									onClick={handleModalOpen}
								>
									Watch Now
								</Button>
								<Button
									variant={inFavorites ? 'contained' : 'outlined'}
									startIcon={inFavorites ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									size='small'
									color='favorite'
									className='me-2'
									onClick={handleFavoritesToggle}
								>
									{inFavorites ? 'In your Favorites' : 'Add to Favorites'}
								</Button>
								<Button
									variant={inWatchlist ? 'contained' : 'outlined'}
									startIcon={inWatchlist ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
									size='small'
									color='watchlist'
									onClick={handleWatchlistToggle}
								>
									{inWatchlist ? 'In your Watchlist' : 'Add to Watchlist'}
								</Button>
							</div>
							{show.imdb && <div dangerouslySetInnerHTML={{ __html: show.imdb }} />}
						</Col>
					</Row>
				</Container>
			</div>

			{/* --- Main Details Section --- */}
			<Container className='my-5'>
				<Row>
					<Col md={8}>
						{/* Overview */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Overview
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{show.description}
							</Typography>
						</div>

						{/* Details */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light'>
								Details
							</Typography>
							<Row className='text-light'>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
										Type:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}
									</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
										Year:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.year}
									</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
										Rating:
									</Typography>
									<div className='d-flex align-items-center'>
										<img src={show.rating.image} alt={show.rating.name} style={{ height: '30px', marginRight: '8px' }} />
										<Typography variant='body1' className='text-light'>
											{show.rating.name}
										</Typography>
									</div>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
										Captions:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.captions ? 'Available (English)' : 'Not Available'}
									</Typography>
								</Col>
								{show.kind !== 'film' && (
									<>
										<Col md={6} className='mb-3'>
											<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
												Status:
											</Typography>
											<Typography variant='body1' className='text-light'>
												{show.sample ? 'A Sample' : `Full ${show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}`}
											</Typography>
										</Col>
										<Col md={6} className='mb-3'>
											<Typography variant='subtitle1' className='text-muted' sx={{ color: `${accentColor} !important` }}>
												Episodes:
											</Typography>
											<Typography variant='body1' className='text-light'>
												{show.number_of_episodes || '# of Episodes'}
											</Typography>
										</Col>
									</>
								)}
							</Row>
						</div>

						{/* Countries & Languages */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: `${accentColor} !important` }}>
								Countries & Languages
							</Typography>
							<div className='d-flex flex-wrap'>
								{renderChipGroup(show.countries, 'country')}
								{show.countries.length > 0 && show.languages.length > 0 && <h3 style={{ margin: '4px 8px', color: 'white' }}>|</h3>}
								{renderChipGroup(show.languages, 'language')}
							</div>
						</div>

						{/* Genres & Labels */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: `${accentColor} !important` }}>
								Genres & Labels
							</Typography>
							<div className='d-flex flex-wrap'>
								{renderChipGroup(show.genres, 'genre')}
								{show.genres.length > 0 && show.labels.length > 0 && <h3 style={{ margin: '4px 8px', color: 'white' }}>|</h3>}
								{renderChipGroup(show.labels, 'label')}
							</div>
						</div>
						{/* Additional Info */}
						<Row>
							<Typography variant='h6' component='h4' gutterBottom className='text-light'>
								Additional Info
							</Typography>
							<Typography variant='body2' className='text-light'>
								<b>Finalized:</b> {show.finalized ? 'Yes' : 'No'}
							</Typography>
							<Typography variant='body2' className='text-light'>
								<b>Created:</b> {new Date(show.created).toLocaleString()}
							</Typography>
							<Typography variant='body2' className='text-light'>
								<b>Updated:</b> {new Date(show.updated).toLocaleString()}
							</Typography>
						</Row>
					</Col>

					{/* Cast Section */}
					<Col md={4}>
						<div className='overflow-visible mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Cast
							</Typography>
							<div className={styles.castContainer}>
								<Row xs={2} className='g-2'>
									{show.artists.map((artist, index) => (
										<ArtistCard key={index} artist={artist} />
									))}
								</Row>
							</div>
						</div>
					</Col>
				</Row>

			</Container>

			{/* --- Video Player Modal --- */}
			<Modal open={modalOpen} onClose={handleModalClose} aria-labelledby='video-player-modal' aria-describedby='video-player-for-show'>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '90vw',
						bgcolor: darkerColor,
						boxShadow: 24,
						p: { xs: 1, md: 0.7 },
						borderRadius: '8px',
						outline: 'none',
					}}
				>
					{/* The VideoJS component is rendered once and its options are updated via prop */}
					{modalOpen && (
						<VideoJS
							options={playerOptions}
							onReady={handlePlayerReady}
							color={accentColor}
							episodeControls={show.kind === 'film' ? {} : { actionEpisode: actionEpisode, currentEpisode: episode, currentSeason: season }}
						/>
					)}
					{show?.kind !== 'film' && (
						<div className='d-block text-center text-light border border-dark-subtle border-top-0 p-3 mx-auto'>
							<FirstPageIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('first')} />{' '}
							<ArrowBackIosNewIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('previous')} />
							&nbsp;Season {season} Episode {episode}&nbsp;
							<ArrowForwardIosIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('next')} />
							<LastPageIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('last')} />
							{episodeChangeMessage && <Typography color='error'>{episodeChangeMessage}</Typography>}
						</div>
					)}
				</Box>
			</Modal>
		</div>
	);
};

export default ShowDetails;
