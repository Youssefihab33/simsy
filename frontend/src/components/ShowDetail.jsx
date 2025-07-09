import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Typography, Button, Chip, Avatar, Tooltip, Modal, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LastPageIcon from '@mui/icons-material/LastPage';
import LoadingSpinner from './snippets/LoadingSpinner';
import styles from './modules/ShowDetails.module.css';
import { VideoJS, videoJsOptions } from './snippets/VideoJS.jsx';

// Custom hook for API calls
const useShowData = (showId) => {
	// Consolidate show and user-related data into single state objects
	const [showDetails, setShowDetails] = useState(null);
	const [userInteraction, setUserInteraction] = useState({
		inFavorites: false,
		inWatchlist: false,
		userShowData: null, // Keep the full user data here if needed
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		if (!showId) {
			setLoading(false);
			return;
		}

		setError(null); // Clear previous errors

		try {
			// Used Promise.all for concurrent requests for efficiency
			const [showResponse, userResponse] = await Promise.all([axiosInstance.get(`shows/show/${showId}/`), axiosInstance.get(`shows/user/${showId}`)]);

			if (showResponse.status === 200) {
				setShowDetails(showResponse.data);
			} else {
				throw new Error(`Error fetching show details: ${showResponse.statusText}`);
			}

			if (userResponse.status === 200) {
				setUserInteraction({
					inFavorites: userResponse.data.in_favorites,
					inWatchlist: userResponse.data.in_watchlist,
					userShowData: userResponse.data,
				});
			} else {
				throw new Error(`Error fetching user show data: ${userResponse.statusText}`);
			}
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

	// Functions to update favorite/watchlist status locally (without immediate API call here)
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
		refetchShowData: fetchData, // Renamed for clarity to refetch all data
	};
};

// Custom hook for media player logic
const useMediaPlayer = (show, userShowData, refetchShowData) => {
	const [modalOpen, setModalOpen] = useState(false);
	const playerRef = useRef(null);
	const [season, setSeason] = useState(1);
	const [episode, setEpisode] = useState(1);
	const [episodeChangeMessage, setEpisodeChangeMessage] = useState(null);
	const [currentVideoStartTime, setCurrentVideoStartTime] = useState(0);
	const [playerKey, setPlayerKey] = useState(0);

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

	const handleModalOpen = () => {
		setModalOpen(true);
		if (userShowData) {
			setCurrentVideoStartTime(userShowData.time_reached || 0);
		}
	};

	const handleModalClose = () => {
		setModalOpen(false);
		refetchShowData(); // Fetch latest user data when closing
	};

	const sendTimeReached = useCallback(async (currentShowId, currentSeason, currentEpisode, timeReached) => {
		try {
			await axiosInstance.get(`shows/update_time_reached/${currentShowId}/${currentSeason || 0}/${currentEpisode || 0}/${Math.round(timeReached)}`);
			console.log('sendTimeReached', `Updated time_reached for S${currentSeason}E${currentEpisode} to ${Math.round(timeReached)}`);
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

			player.on(['pause', 'fullscreenchange', 'seeked', 'dispose'], () => {
				sendTimeReached(show.id, seasonRef.current, episodeRef.current, player.currentTime());
			});
			player.on('ended', () => {
				sendTimeReached(show.id, seasonRef.current, episodeRef.current, 0);
			});

			// If an episode just changed, request fullscreen here
			if (episodeChangedRef.current) {
				if (!player.isFullscreen()) {
					player.requestFullscreen();
				}
				player.play(); // Ensure playback starts
				episodeChangedRef.current = false; // Reset the flag
			}

			// Cleanup function for VideoJS player
			return () => {
				if (playerRef.current) {
					playerRef.current.dispose();
					playerRef.current = null;
				}
			};
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

		switch (show?.kind) {
			case 'film':
				videoSrc = `${videoRoot}/videos/${show.name}.mp4`;
				captionsSrc = `${videoRoot}/captions/${show.name}.vtt`;
				break;
			case 'series':
				videoSrc = `${videoRoot}/videos/${show.name}/s${season}e${episode}.mp4`;
				captionsSrc = `${videoRoot}/captions/${show.name}/s${season}e${episode}.vtt`;
				break;
			default:
				console.error('Unknown show kind:', show?.kind);
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
					show?.captions && captionsSrc
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

	const accentColor = getAccentColor(show?.kind);

	const action_Episode = async (action) => {
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
				setPlayerKey((prevKey) => prevKey + 1); // Force remount
				console.log('action_Episode success:', response.data);
			}
		} catch (error) {
			setEpisodeChangeMessage(error.response?.data || 'Error changing episode.');
			console.error('Error in action_Episode:', error);
		}
	};

	const perviousEpisode = () => {
		action_Episode('previous');
	};

	const nextEpisode = () => {
		action_Episode('next');
	};

	return { modalOpen, handleModalOpen, handleModalClose, handlePlayerReady, playerOptions, accentColor, season, episode, perviousEpisode, nextEpisode, episodeChangeMessage, playerKey, playerRef };
};

// Helper to determine accent color
const getAccentColor = (kind) => {
	switch (kind) {
		case 'film':
			return '#9A0606';
		case 'series':
			return '#5DD95D';
		case 'program':
			return '#54A9DE';
		default:
			return '#9A0606'; // Default color
	}
};

// Helper for API toggles (favorites/watchlist)
const useToggleApi = (showId, setInState, endpoint, name) => {
	const handleToggle = useCallback(async () => {
		if (!showId) return; // Ensure showId exists before making API call
		try {
			const response = await axiosInstance.post(`shows/${endpoint}/${showId}/`);
			if (response.status === 200) {
				setInState(response.data[`in_${name}`]); // Update local state based on API response
			} else {
				throw new Error(`Error toggling ${endpoint}: ${response.statusText}`);
			}
		} catch (error) {
			console.error(`Error toggling ${endpoint}:`, error);
		}
	}, [showId, setInState, endpoint, name]); // Added 'name' to dependencies
	return handleToggle;
};

export default function ShowDetails() {
	const { show_id } = useParams();
	const [hoveredArtist, setHoveredArtist] = useState(null);
	const searchbarRef = useRef(null);

	// Using the refactored useShowData hook
	const {
		show,
		userShowData,
		inFavorites,
		inWatchlist,
		setInFavorites, // This is now a local state setter provided by useShowData
		setInWatchlist, // This is now a local state setter provided by useShowData
		loading,
		error,
		refetchShowData, // Use this to refetch all show and user data
	} = useShowData(show_id);

	// These hooks now just handle the API call part, and use the local state setters from useShowData
	const handleFavoritesToggle = useToggleApi(show?.id, setInFavorites, 'toggleFavorite', 'favorites');
	const handleWatchlistToggle = useToggleApi(show?.id, setInWatchlist, 'toggleWatchlist', 'watchlist');

	const { modalOpen, handleModalOpen, handleModalClose, handlePlayerReady, playerOptions, accentColor, season, episode, perviousEpisode, nextEpisode, episodeChangeMessage, playerKey, playerRef } =
		useMediaPlayer(show, userShowData, refetchShowData); // Pass refetchShowData to mediaPlayer

	// Key Presses
	const handleKeyPress = useCallback(
		(event) => {
			// Ensure the searchbar is not the active element
			const isSearchbarActive = searchbarRef.current && document.activeElement === searchbarRef.current;
			if (isSearchbarActive) {
				return; // Do nothing if searchbar is active
			}
			if (!modalOpen) {
				if (event.code == 'KeyK') {
					handleModalOpen();
				}
				return; // Start Watching when 'K' is pressed and Do nothing else
			}
			if (playerRef.current) {
				switch (event.code) {
					case 'KeyK': // K --> Pause/Play
						playerRef.current.focus();
						if (playerRef.current.paused()) {
							playerRef.current.play();
						} else {
							playerRef.current.pause();
						}
						break;

					case 'KeyJ': // J --> Previous Episode
						if (show.kind !== 'film') {
							perviousEpisode();
						}
						break;
					case 'KeyL': // L --> Next Episode
						if (show.kind !== 'film') {
							nextEpisode();
						}
						break;
					case 'KeyC': // C --> Toggle Captions
						if (show.captions) {
							playerRef.current.focus();
							// Assuming captionsToggle is a function available in the scope or passed as a prop
						}
						break;
					case 'KeyF': // F --> Fullscreen
						playerRef.current.focus();
						// The original code just focuses, actual fullscreen logic might be handled by playerRef.current
						break;
					case 'KeyX': // X --> Toggle speed (forward or reverse with Shift)
						playerRef.current.focus();
						if (event.shiftKey) {
							playerRef.current.playbackRate(playerRef.current.playbackRate() - 0.25);
						} else {
							playerRef.current.playbackRate(playerRef.current.playbackRate() + 0.25);
						}
						break;
					case 'KeyZ': // Z --> Set Speed to 1
						playerRef.current.focus();
						playerRef.current.playbackRate(1);
						break;
					default:
						break;
				}
			}
		},
		[show, playerRef.current, modalOpen]
	); // Dependencies for useCallback

	useEffect(() => {
		// Attach the event listener when the component mounts
		document.addEventListener('keypress', handleKeyPress);

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener('keypress', handleKeyPress);
		};
	}, [handleKeyPress]); // Dependency for useEffect

	const hoverColor = accentColor === '#9A0606' ? '#B00707' : accentColor === '#5DD95D' ? '#79E679' : accentColor === '#54A9DE' ? '#6CB5E3' : '#6CB5E3';

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className='text-light text-center mt-5'>Error loading show details. Please try again later.</div>;
	}

	if (!show) {
		return null; // Or a message indicating no show found
	}

	const commonChipProps = {
		variant: 'outlined',
		sx: { margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' },
	};

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
								{show.year} | {show.kind.charAt(0).toUpperCase() + show.kind.slice(1)} | {show.kind != 'film' && `S${season}E${episode}`}
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
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Overview
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{show.description}
							</Typography>
						</div>

						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light'>
								Details
							</Typography>
							<Row className='text-light'>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
										Type:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}
									</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
										Year:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.year}
									</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
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
									<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
										Captions:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.captions ? 'Available (English)' : 'Not Available'}
									</Typography>
								</Col>
								{show.kind !== 'film' && (
									<>
										<Col md={6} className='mb-3'>
											<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
												Status:
											</Typography>
											<Typography variant='body1' className='text-light'>
												{show.sample ? 'A Sample' : `Full ${show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}`}
											</Typography>
										</Col>
										<Col md={6} className='mb-3'>
											<Typography variant='subtitle1' className='text-muted' sx={{ color: accentColor + ' !important' }}>
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

						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: accentColor + ' !important' }}>
								Countries & Languages
							</Typography>
							<div className='d-flex flex-wrap'>
								{show.countries.map((country) => (
									<Tooltip key={country.id} title={country.description} placement='top'>
										<Chip label={country.name} avatar={<Avatar src={country.flag} />} {...commonChipProps} />
									</Tooltip>
								))}
								{show.countries.length > 0 && show.languages.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
								{show.languages.map((language) => (
									<Tooltip key={language.id} title={language.description} placement='top'>
										<Chip label={language.name} avatar={<Avatar src={language.image} />} {...commonChipProps} />
									</Tooltip>
								))}
							</div>
						</div>

						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: accentColor + ' !important' }}>
								Genres & Labels
							</Typography>
							<div className='d-flex flex-wrap'>
								{show.genres.map((genre) => (
									<Tooltip key={genre.id} title={genre.description} placement='top'>
										<Chip label={genre.name} avatar={<Avatar src={genre.image} />} {...commonChipProps} />
									</Tooltip>
								))}
								{show.genres.length > 0 && show.labels.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
								{show.labels.map((label) => (
									<Tooltip key={label.id} title={label.description} placement='top'>
										<Chip label={label.name} avatar={<Avatar src={label.image} />} {...commonChipProps} />
									</Tooltip>
								))}
							</div>
						</div>
					</Col>

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
				<Row className='mt-5'>
					<Col>
						<Typography variant='h6' component='h4' gutterBottom className='text-light'>
							Additional Info
						</Typography>
						<Typography variant='body2' className='text-light'>
							**Finalized:** {show.finalized ? 'Yes' : 'No'}
						</Typography>
						<Typography variant='body2' className='text-light'>
							**Created:** {new Date(show.created).toLocaleString()}
						</Typography>
						<Typography variant='body2' className='text-light'>
							**Updated:** {new Date(show.updated).toLocaleString()}
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
							<FirstPageIcon /> <ArrowBackIosNewIcon onClick={perviousEpisode} />
							<span className='mx-4'>
								S{season}E{episode}
							</span>
							<ArrowForwardIosIcon onClick={nextEpisode} /> <LastPageIcon />
							{episodeChangeMessage && <p className='text-danger'>{episodeChangeMessage}</p>}
						</div>
					)}
				</Box>
			</Modal>
		</div>
	);
}
