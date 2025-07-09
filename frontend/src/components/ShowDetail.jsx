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
import LoadingSpinner from './snippets/LoadingSpinner';
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

// --- Custom Hooks ---

/**
 * Custom hook for fetching show details and user-specific interaction data.
 * @param {string} showId - The ID of the show to fetch.
 * @returns {object} Contains show details, user interaction status, loading state, error, and refetch function.
 */
const useShowData = (showId) => {
	const [showDetails, setShowDetails] = useState(null);
	const [userInteraction, setUserInteraction] = useState({
		inFavorites: false,
		inWatchlist: false,
		userShowData: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		if (!showId) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);

		try {
			const [showResponse, userResponse] = await Promise.all([axiosInstance.get(`shows/show/${showId}/`), axiosInstance.get(`shows/user/${showId}`)]);

			setShowDetails(showResponse.data);
			setUserInteraction({
				inFavorites: userResponse.data.in_favorites,
				inWatchlist: userResponse.data.in_watchlist,
				userShowData: userResponse.data,
			});
		} catch (err) {
			console.error('Error in useShowData hook:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [showId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Functions to update favorite/watchlist status locally
	const toggleFavoriteLocal = useCallback(() => {
		setUserInteraction((prev) => ({ ...prev, inFavorites: !prev.inFavorites }));
	}, []);

	const toggleWatchlistLocal = useCallback(() => {
		setUserInteraction((prev) => ({ ...prev, inWatchlist: !prev.inWatchlist }));
	}, []);

	return {
		show: showDetails,
		userShowData: userInteraction.userShowData,
		inFavorites: userInteraction.inFavorites,
		inWatchlist: userInteraction.inWatchlist,
		setInFavorites: toggleFavoriteLocal,
		setInWatchlist: toggleWatchlistLocal,
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
const useMediaPlayer = (show, userShowData, refetchShowData) => {
	const [modalOpen, setModalOpen] = useState(false);
	const playerRef = useRef(null);
	const [season, setSeason] = useState(1);
	const [episode, setEpisode] = useState(1);
	const [episodeChangeMessage, setEpisodeChangeMessage] = useState(null);
	const [currentVideoStartTime, setCurrentVideoStartTime] = useState(0);
	const [playerKey, setPlayerKey] = useState(0); // Used to force remount VideoJS

	// Refs to hold current season/episode for use in async callbacks
	const seasonRef = useRef(season);
	const episodeRef = useRef(episode);
	useEffect(() => {
		seasonRef.current = season;
	}, [season]);
	useEffect(() => {
		episodeRef.current = episode;
	}, [episode]);

	useEffect(() => {
		if (userShowData) {
			setSeason(userShowData.season_reached);
			setEpisode(userShowData.episode_reached);
			setCurrentVideoStartTime(userShowData.time_reached || 0);
		}
	}, [userShowData]);

	const handleModalOpen = useCallback(() => {
		setModalOpen(true);
		if (userShowData) {
			setCurrentVideoStartTime(userShowData.time_reached || 0);
		}
	}, [userShowData]);

	const handleModalClose = useCallback(() => {
		setModalOpen(false);
		refetchShowData(); // Fetch latest user data when closing the modal
	}, [refetchShowData]);

	const sendTimeReached = useCallback(async (currentShowId, currentSeason, currentEpisode, timeReached) => {
		try {
			await axiosInstance.get(`shows/update_time_reached/${currentShowId}/${currentSeason || 0}/${currentEpisode || 0}/${Math.round(timeReached)}`);
			console.log(`Updated time_reached for S${currentSeason}E${currentEpisode} to ${Math.round(timeReached)}`);
		} catch (error) {
			console.error('Error updating time reached:', error);
		}
	}, []);

	const episodeChangedRef = useRef(false);

	const handlePlayerReady = useCallback(
		(player) => {
			playerRef.current = player;

			player.currentTime(currentVideoStartTime);
			player.play();

			// Save current time on various player events
			player.on(['pause', 'fullscreenchange', 'seeked', 'dispose'], () => {
				sendTimeReached(show.id, seasonRef.current, episodeRef.current, player.currentTime());
			});
			// When video ends, reset time reached to 0
			player.on('ended', () => {
				sendTimeReached(show.id, seasonRef.current, episodeRef.current, 0);
			});

			// If an episode just changed, request fullscreen and play
			if (episodeChangedRef.current) {
				if (!player.isFullscreen()) {
					player.requestFullscreen();
				}
				player.play();
				episodeChangedRef.current = false; // Reset the flag
			}
		},
		[sendTimeReached, show, currentVideoStartTime]
	);

	const getVideoDetails = useCallback(() => {
		let videoSrc = '';
		let captionsSrc = '';
		const videoRoot = import.meta.env.VITE_VIDEOS_SOURCE_ROOT;

		if (!show) {
			return { videoSrc: '', captionsSrc: '' };
		}

		switch (show.kind) {
			case 'film':
				videoSrc = `${videoRoot}/videos/${show.name}.mp4`;
				captionsSrc = `${videoRoot}/captions/${show.name}.vtt`;
				break;
			case 'series':
				videoSrc = `${videoRoot}/videos/${show.name}/s${season}e${episode}.mp4`;
				captionsSrc = `${videoRoot}/captions/${show.name}/s${season}e${episode}.vtt`;
				break;
			default:
				console.error('Unknown show kind:', show.kind);
				break;
		}
		return { videoSrc, captionsSrc };
	}, [show, season, episode]);

	const { videoSrc, captionsSrc } = getVideoDetails();

	const playerOptions = show
		? {
				...videoJsOptions,
				sources: [{ src: videoSrc, type: 'video/mp4' }],
				tracks:
					show.captions && captionsSrc
						? [
								{
									kind: 'captions',
									srclang: 'en',
									label: 'English',
									src: captionsSrc,
									mode: userShowData?.view_captions ? 'showing' : 'disabled',
								},
						  ]
						: [],
		  }
		: {};

	const actionEpisode = useCallback(
		async (action) => {
			try {
				const response = await axiosInstance.get(`shows/${action}_episode/${show.id}/${seasonRef.current}/${episodeRef.current}/`);
				if (response.data.changed === false) {
					setEpisodeChangeMessage(response.data.message);
				} else {
					setSeason(response.data.new_season);
					setEpisode(response.data.new_episode);
					setCurrentVideoStartTime(response.data.starting_time);
					setEpisodeChangeMessage(null);
					episodeChangedRef.current = true; // Set flag to true before forcing remount
					setPlayerKey((prevKey) => prevKey + 1); // Force remount of VideoJS
					console.log('action_Episode success:', response.data);
				}
			} catch (error) {
				setEpisodeChangeMessage(error.response?.data || 'Error changing episode.');
				console.error('Error in action_Episode:', error);
			}
		},
		[show?.id] // Depend on show.id to ensure actionEpisode is stable unless show changes
	);

	const previousEpisode = useCallback(() => actionEpisode('previous'), [actionEpisode]);
	const nextEpisode = useCallback(() => actionEpisode('next'), [actionEpisode]);

	return {
		modalOpen,
		handleModalOpen,
		handleModalClose,
		handlePlayerReady,
		playerOptions,
		season,
		episode,
		previousEpisode,
		nextEpisode,
		episodeChangeMessage,
		playerKey,
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
			const response = await axiosInstance.post(`shows/${endpoint}/${showId}/`);
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
	const [hoveredArtist, setHoveredArtist] = useState(null);
	const searchbarRef = useRef(null); // Assuming a searchbar exists elsewhere that might steal focus

	const { show, userShowData, inFavorites, inWatchlist, setInFavorites, setInWatchlist, loading, error, refetchShowData } = useShowData(show_id);

	const handleFavoritesToggle = useToggleApi(show?.id, setInFavorites, 'toggleFavorite', 'favorites');
	const handleWatchlistToggle = useToggleApi(show?.id, setInWatchlist, 'toggleWatchlist', 'watchlist');

	const { modalOpen, handleModalOpen, handleModalClose, handlePlayerReady, playerOptions, season, episode, previousEpisode, nextEpisode, episodeChangeMessage, playerKey, playerRef } =
		useMediaPlayer(show, userShowData, refetchShowData);

	// Calculate accent and hover colors once
	const accentColor = getAccentColor(show?.kind);
	const hoverColor = getHoverColor(accentColor);

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
							previousEpisode();
						}
						break;
					case 'KeyL': // L -> Next Episode
						if (show?.kind !== 'film') {
							nextEpisode();
						}
						break;
					case 'KeyF': // F -> Fullscreen (Video.js handles this natively, just focus)
						playerRef.current.focus();
						break;
					case 'KeyX': // X -> Adjust Playback Rate
						playerRef.current.focus();
						const currentRate = playerRef.current.playbackRate();
						playerRef.current.playbackRate(event.shiftKey ? currentRate - 0.25 : currentRate + 0.25);
						break;
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
		[show?.kind, playerRef, modalOpen, handleModalOpen, previousEpisode, nextEpisode]
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

	// Render function for chips (Genres, Labels, Countries, Languages)
	const renderChips = (items, type) => (
		<div className='d-flex flex-wrap'>
			{items.map((item) => (
				<Tooltip key={item.id} title={item.description} placement='top'>
					<Chip label={item.name} avatar={<Avatar src={item.image || item.flag} />} {...commonChipProps} />
				</Tooltip>
			))}
			{type === 'countryLanguage' && show.countries.length > 0 && show.languages.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
			{type === 'genreLabel' && show.genres.length > 0 && show.labels.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
		</div>
	);

	return (
		<div className={styles.showDetailsContainer}>
			{/* --- Hero Section --- */}
			<div className={styles.heroSection} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${show.image})` }}>
				<Container>
					<Row className='align-items-center'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'>
							<img src={show.image} alt={`${show.name} poster`} className={styles.posterImage} />
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
							{renderChips(show.countries, 'countryLanguage')}
							{renderChips(show.languages, 'countryLanguage')}
						</div>

						{/* Genres & Labels */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: `${accentColor} !important` }}>
								Genres & Labels
							</Typography>
							{renderChips(show.genres, 'genreLabel')}
							{renderChips(show.labels, 'genreLabel')}
						</div>
					</Col>

					{/* Cast Section */}
					<Col md={4}>
						<div className='overflow-visible mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Cast
							</Typography>
							<div className={styles.castContainer}>
								<Row xs={2} className='g-2'>
									{show.artists.map((artist) => (
										<Col key={artist.id}>
											<Card className={styles.artistCard} onMouseEnter={() => setHoveredArtist(artist)} onMouseLeave={() => setHoveredArtist(null)}>
												<Avatar src={artist.image} alt={artist.name} className={styles.artistImage} />
												<Typography variant='subtitle1' className='fw-bold text-light'>
													{artist.name}
												</Typography>
												{hoveredArtist?.id === artist.id && (
													<div className={styles.artistInfoHover}>
														<Typography variant='body2' sx={{ mt: 1 }}>
															{artist.birthYear} | {artist.nationality?.name}
															<br />
															{artist.birthYear ? `${new Date().getFullYear() - artist.birthYear} Years old` : ''}
														</Typography>
													</div>
												)}
											</Card>
										</Col>
									))}
								</Row>
							</div>
						</div>
					</Col>
				</Row>

				<hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

				{/* Additional Info */}
				<Row className='mt-5'>
					<Col>
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
						bgcolor: accentColor,
						boxShadow: 24,
						p: { xs: 1, md: 0.7 },
						borderRadius: '8px',
						outline: 'none',
					}}
				>
					{modalOpen && <VideoJS key={playerKey} options={playerOptions} onReady={handlePlayerReady} color={accentColor} />}
					{show?.kind !== 'film' && (
						<div className='text-center text-light m-3'>
							<FirstPageIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('first')} /> <ArrowBackIosNewIcon sx={{ cursor: 'pointer' }} onClick={previousEpisode} />
							<span className='mx-4'>
								S{season}E{episode}
							</span>
							<ArrowForwardIosIcon sx={{ cursor: 'pointer' }} onClick={nextEpisode} /> <LastPageIcon sx={{ cursor: 'pointer' }} onClick={() => actionEpisode('last')} />
							{episodeChangeMessage && <p className='text-danger mt-2'>{episodeChangeMessage}</p>}
						</div>
					)}
				</Box>
			</Modal>
		</div>
	);
};

export default ShowDetails;
