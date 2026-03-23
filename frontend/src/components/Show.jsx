// Main
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// Styles & Icons
import { Container, Typography, Button, Chip, Avatar, Tooltip, Modal, Box, IconButton, Grid, Paper } from '@mui/material';
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
	CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// My modules
import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ArtistCard from './snippets/cards/ArtistCard.jsx';
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
			await axiosInstance.post(`shows/${currentShowId}/update_time_reached/`, {
				season: currentSeason || 0,
				episode: currentEpisode || 0,
				time_reached: Math.round(timeReached),
			});
		} catch (error) {
			console.error('Error updating time reached:', error);
		}
	}, []);

	const actionEpisode = useCallback(
		async (actionName, finished = false) => {
			try {
				const response = await axiosInstance.post(`shows/${show.id}/${actionName}_episode/`, {
					season: seasonRef.current,
					episode: episodeRef.current,
					finished: finished,
				});
				if (response.data.changed === false) {
					setEpisodeChangeMessage(response.data.message);
				} else {
					setSeason(response.data.new_season);
					setEpisode(response.data.new_episode);
					// Update currentVideoStartTime from the backend response
					setCurrentVideoStartTime(response.data.starting_time);
					setEpisodeChangeMessage(null);
					refetchShowData(); // Update reached_times for indicators
				}
			} catch (error) {
				setEpisodeChangeMessage(error.response?.data || 'Error changing episode.');
				console.error('Error in action_Episode:', error);
			}
		},
		[show?.id, refetchShowData],
	);

	const jumpToEpisode = useCallback(
		async (targetSeason, targetEpisode) => {
			try {
				const response = await axiosInstance.post(`shows/${show.id}/jump_to_episode/`, {
					season: targetSeason,
					episode: targetEpisode,
				});
				setSeason(response.data.new_season);
				setEpisode(response.data.new_episode);
				setCurrentVideoStartTime(response.data.starting_time);
				setEpisodeChangeMessage(null);
				refetchShowData(); // Update reached_times
			} catch (error) {
				setEpisodeChangeMessage(error.response?.data || 'Error jumping to episode.');
				console.error('Error in jumpToEpisode:', error);
			}
		},
		[show?.id, refetchShowData],
	);

	const handlePlayerReady = useCallback(
		(player) => {
			playerRef.current = player;

			// Save current time on various player events
			player.on(['fullscreenchange', 'seeked', 'dispose'], () => {
				if (playerRef.current) {
					sendTimeReached(show.id, seasonRef.current, episodeRef.current, playerRef.current.currentTime());
				}
			});
			// When video ends, mark as watched and advance episode if applicable
			player.on('ended', () => {
				if (show.kind === 'series') {
					// If it's a series, automatically go to the next episode and mark current as finished
					actionEpisode('next', true);
				} else {
					// For films, just mark as finished
					sendTimeReached(show.id, seasonRef.current, episodeRef.current, 1);
				}
			});
		},
		[sendTimeReached, show, actionEpisode],
	);

	const videoDetails = useMemo(() => {
		let filmsSrc = '';
		let seriesSrc = '';
		let captionsSrc = '';

		if (!show) {
			return { filmsSrc: '', seriesSrc: '', captionsSrc: '' };
		}

		switch (show.kind) {
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
	}, [show, season, episode]);

	const { filmsSrc, seriesSrc, captionsSrc } = videoDetails;

	// Optimization: Move source updates and time setting to VideoJS component to avoid duplication
	// The currentVideoStartTime is now part of playerOptions to trigger updates correctly.

	const playerOptions = useMemo(() => {
		if (!show) return {};
		return {
			...videoJsOptions,
			show_name: show.name,
			sources: [
				{ src: filmsSrc, type: 'video/mp4' },
				{ src: seriesSrc, type: 'video/mp4' },
			],
			tracks:
				show.captions && captionsSrc ?
					[
						{
							kind: 'captions',
							srclang: 'en',
							label: 'English',
							src: captionsSrc,
							mode: show.view_captions !== false ? 'showing' : 'disabled',
						},
					]
				:	[],
			currentVideoStartTime, // Added to trigger updates in VideoJS
		};
	}, [show, filmsSrc, seriesSrc, captionsSrc, currentVideoStartTime]);

	return {
		modalOpen,
		handleModalOpen,
		handleModalClose,
		handlePlayerReady,
		playerOptions,
		season,
		episode,
		actionEpisode,
		jumpToEpisode,
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

	const handleMarkAsUnwatched = useCallback(async () => {
		if (!show?.id) return;
		try {
			await axiosInstance.post(`shows/${show.id}/mark_as_unwatched/`);
			refetchShowData();
		} catch (error) {
			console.error('Error marking show as unwatched:', error);
		}
	}, [show?.id, refetchShowData]);

	const { modalOpen, handleModalOpen, handleModalClose, handlePlayerReady, playerOptions, season, episode, actionEpisode, jumpToEpisode, episodeChangeMessage, playerRef } = useMediaPlayer(
		show,
		refetchShowData,
	);

	// Optimization: Memoize colors to prevent unnecessary re-calculations and re-renders
	const accentColor = useMemo(() => getAccentColor(show?.kind), [show?.kind]);
	const hoverColor = useMemo(() => getHoverColor(accentColor), [accentColor]);
	const darkerColor = useMemo(() => getDarkerColor(accentColor), [accentColor]);

	// Optimization: Memoize episode controls for VideoJS
	const episodeControls = useMemo(() => {
		if (!show || show.kind === 'film') return {};
		return { actionEpisode, currentEpisode: episode, currentSeason: season };
	}, [show, actionEpisode, episode, season]);

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
					case 'KeyX': {
						// X -> Adjust Playback Rate
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
		[show?.kind, playerRef, modalOpen, handleModalOpen, actionEpisode],
	);

	useEffect(() => {
		document.addEventListener('keypress', handleKeyPress);
		return () => {
			document.removeEventListener('keypress', handleKeyPress);
		};
	}, [handleKeyPress]);

	// --- Render Logic ---

	// Common props for MUI Chip components
	const commonChipProps = useMemo(
		() => ({
			variant: 'outlined',
			sx: { margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' },
		}),
		[],
	);

	// Modified render function for chips
	const renderChipGroup = useCallback(
		(items, kind) => (
			<>
				{items?.map((item) => (
					<Tooltip key={item.id} title={item.description} placement='top'>
						<Chip
							label={item.name}
							variant='outlined'
							component='a'
							href={`/${kind}/${item.id}`}
							avatar={<Avatar alt={item.name} src={item.image || item.flag} sx={{ ml: 1, color: 'white' }} />}
							{...commonChipProps}
							clickable
						/>
					</Tooltip>
				))}
			</>
		),
		[commonChipProps],
	);

	// Optimization: Memoize chip groups
	const countryChips = useMemo(() => renderChipGroup(show?.countries, 'country'), [show?.countries, renderChipGroup]);
	const languageChips = useMemo(() => renderChipGroup(show?.languages, 'language'), [show?.languages, renderChipGroup]);
	const genreChips = useMemo(() => renderChipGroup(show?.genres, 'genre'), [show?.genres, renderChipGroup]);
	const labelChips = useMemo(() => renderChipGroup(show?.labels, 'label'), [show?.labels, renderChipGroup]);

	// Optimization: Memoize Season Indicator styling
	const SeasonCircle = useCallback(
		({ num, active = false }) => (
			<Box
				sx={{
					width: 32,
					height: 32,
					borderRadius: '50%',
					bgcolor: accentColor,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'white',
					fontWeight: 'bold',
					fontSize: '0.75rem',
					flexShrink: 0,
					userSelect: 'none',
					border: active ? '2px solid white' : 'none',
					boxShadow: active ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
				}}
			>
				S{num}
			</Box>
		),
		[accentColor],
	);

	// Optimization: Memoize cast list
	const castList = useMemo(() => show?.artists?.map((artist, index) => <ArtistCard key={index} artist={artist} />), [show?.artists]);

	// Optimization: Memoize visible episode list for pagination
	const visibleEpisodes = useMemo(() => {
		if (!show || !show.episodes || show.kind === 'film') return [];
		const all = [];
		Object.entries(show.episodes)
			.sort((a, b) => Number(a[0]) - Number(b[0]))
			.forEach(([s, count]) => {
				for (let e = 1; e <= count; e++) {
					all.push({ s: Number(s), e: Number(e) });
				}
			});

		if (all.length <= 10) return all;

		const currentIdx = all.findIndex((item) => item.s === Number(season) && item.e === Number(episode));
		const range = 2;
		const result = [];

		// Always include first
		result.push(all[0]);

		let start = Math.max(1, currentIdx - range);
		let end = Math.min(all.length - 2, currentIdx + range);

		// Adjust window if near boundaries to keep consistent size
		if (currentIdx <= range + 1) end = Math.min(all.length - 2, range * 2 + 1);
		if (currentIdx >= all.length - range - 2) start = Math.max(1, all.length - range * 2 - 2);

		if (start > 1) result.push({ type: 'ellipsis' });

		for (let i = start; i <= end; i++) {
			result.push(all[i]);
		}

		if (end < all.length - 2) result.push({ type: 'ellipsis' });

		// Always include last
		result.push(all[all.length - 1]);

		return result;
	}, [show, season, episode]);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <Box sx={{ color: 'white', textAlign: 'center', mt: 5 }}>Error loading show details. Please try again later.</Box>;
	}

	if (!show) {
		return <Box sx={{ color: 'white', textAlign: 'center', mt: 5 }}>No show details found.</Box>;
	}

	return (
		<Box sx={{ backgroundColor: 'transparent', minHeight: '100vh', mt: -8 }}>
			{/* --- Hero Section --- */}
			<Box
				sx={{
					position: 'relative',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${show.image})`,
					color: 'white',
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					pt: { xs: 15, md: 0 },
					pb: { xs: 5, md: 0 },
				}}
			>
				<Container>
					<Grid container spacing={1}>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
							<Box
								component='img'
								src={show.image}
								alt={`${show.name} poster`}
								className={styles.posterImage}
								sx={{
									width: '100%',
									maxWidth: 300,
									borderRadius: 2,
									boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
									transition: 'transform 0.3s ease-in-out',
									'&:hover': { transform: 'scale(1.05)' },
								}}
							/>
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{show.name}
							</Typography>
							<Typography variant='h5' component='p' sx={{ color: 'white', mb: 5 }}>
								{show.year} | {show.kind.charAt(0).toUpperCase() + show.kind.slice(1)} {show.kind !== 'film' && `| S${season}E${episode}`}
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
								<Button
									variant='contained'
									size='large'
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
									onClick={handleFavoritesToggle}
									sx={{
										color: inFavorites ? 'white' : '#D4AF37',
										borderColor: '#D4AF37',
										backgroundColor: inFavorites ? '#D4AF37' : 'transparent',
										'&:hover': { borderColor: '#D4AF37', backgroundColor: inFavorites ? '#B8962E' : 'rgba(212, 175, 55, 0.1)' },
									}}
								>
									{inFavorites ? 'In your Favorites' : 'Add to Favorites'}
								</Button>
								<Button
									variant={inWatchlist ? 'contained' : 'outlined'}
									startIcon={inWatchlist ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
									size='small'
									onClick={handleWatchlistToggle}
									sx={{
										color: inWatchlist ? 'white' : '#0dcaf0',
										borderColor: '#0dcaf0',
										backgroundColor: inWatchlist ? '#0dcaf0' : 'transparent',
										'&:hover': { borderColor: '#0dcaf0', backgroundColor: inWatchlist ? '#0baccc' : 'rgba(13, 202, 240, 0.1)' },
									}}
								>
									{inWatchlist ? 'In your Watchlist' : 'Add to Watchlist'}
								</Button>
								<Button variant='outlined' size='small' color='error' sx={{ textTransform: 'none' }} onClick={handleMarkAsUnwatched}>
									Mark as unwatched
								</Button>
							</Box>
							{show.imdb && <Box dangerouslySetInnerHTML={{ __html: show.imdb }} sx={{ color: 'white' }} />}
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* --- Main Details Section --- */}
			<Container sx={{ my: 5 }}>
				<Grid container spacing={5}>
					<Grid item xs={12} md={8}>
						{/* Overview */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Overview
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{show.description}
							</Typography>
						</Box>

						{/* Details */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h5' component='h3' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Details
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Type:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>
										{show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Year:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>
										{show.year}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Rating:
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<Box component='img' src={show.rating.image} alt={show.rating.name} sx={{ height: '30px', mr: 1 }} />
										<Typography variant='body1' sx={{ color: 'white' }}>
											{show.rating.name}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Captions:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>
										{show.captions ? 'Available (English)' : 'Not Available'}
									</Typography>
								</Grid>
								{show.kind !== 'film' && (
									<>
										<Grid item xs={12} sm={6}>
											<Typography variant='subtitle1' sx={{ color: accentColor }}>
												Status:
											</Typography>
											<Typography variant='body1' sx={{ color: 'white' }}>
												{show.sample ? 'A Sample' : `Full ${show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}`}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Typography variant='subtitle1' sx={{ color: accentColor }}>
												Episodes:
											</Typography>
											<Typography variant='body1' sx={{ color: 'white' }}>
												{show.number_of_episodes || '# of Episodes'}
											</Typography>
										</Grid>
									</>
								)}
							</Grid>
						</Box>

						{/* Countries & Languages */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h5' component='h3' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								Countries & Languages
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
								{countryChips}
								{show.countries.length > 0 && show.languages.length > 0 && (
									<Typography variant='h4' sx={{ mx: 1, color: 'white' }}>
										|
									</Typography>
								)}
								{languageChips}
							</Box>
						</Box>

						{/* Genres & Labels */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h5' component='h3' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								Genres & Labels
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
								{genreChips}
								{show.genres.length > 0 && show.labels.length > 0 && (
									<Typography variant='h4' sx={{ mx: 1, color: 'white' }}>
										|
									</Typography>
								)}
								{labelChips}
							</Box>
						</Box>

						{/* Additional Info */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h6' component='h4' gutterBottom sx={{ color: 'white' }}>
								Additional Info
							</Typography>
							<Typography variant='body2' sx={{ color: 'white' }}>
								<b>Finalized:</b> {show.finalized ? 'Yes' : 'No'}
							</Typography>
							<Typography variant='body2' sx={{ color: 'white' }}>
								<b>Created:</b> {new Date(show.created).toLocaleString()}
							</Typography>
							<Typography variant='body2' sx={{ color: 'white' }}>
								<b>Updated:</b> {new Date(show.updated).toLocaleString()}
							</Typography>
						</Box>
					</Grid>

					{/* Cast Section */}
					<Grid item xs={12} md={4}>
						<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
							Cast
						</Typography>
						<Box className={styles.castContainer} sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
							<Grid container spacing={1}>
								{castList}
							</Grid>
						</Box>
					</Grid>
				</Grid>
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
						borderRadius: 2,
						outline: 'none',
					}}
				>
					{modalOpen && <VideoJS options={playerOptions} onReady={handlePlayerReady} color={accentColor} episodeControls={episodeControls} />}
					{show?.kind !== 'film' && (
						<Box
							sx={{
								p: 1.5,
								bgcolor: 'rgba(0, 0, 0, 0.5)',
								borderBottomLeftRadius: 8,
								borderBottomRightRadius: 8,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 1,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 1 }}>
								<Tooltip title='First Episode'>
									<IconButton onClick={() => actionEpisode('first')} sx={{ color: 'white' }}>
										<FirstPageIcon />
									</IconButton>
								</Tooltip>
								<Tooltip title='Previous Episode'>
									<IconButton onClick={() => actionEpisode('previous')} sx={{ color: 'white' }}>
										<ArrowBackIosNewIcon />
									</IconButton>
								</Tooltip>

								{/* Episode Pagination Container */}
								<Box
									sx={{
										maxWidth: '85%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexWrap: 'nowrap',
										gap: 0.5,
										px: 1,
										py: 1,
										overflowX: 'auto',
									}}
								>
									{/* Fixed Season Indicator for multiple seasons */}
									{Object.keys(show.episodes).length > 1 && (
										<Box sx={{ mr: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
											<SeasonCircle num={season} active />
											<Box sx={{ width: '2px', height: '24px', bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
										</Box>
									)}

									{(() => {
										let lastS = null;
										return visibleEpisodes.map((item, idx) => {
											if (item.type === 'ellipsis') {
												return (
													<Typography key={`ell-${idx}`} sx={{ color: 'rgba(255,255,255,0.5)', px: 0.5, userSelect: 'none' }}>
														...
													</Typography>
												);
											}

											const isCurrent = Number(season) === item.s && Number(episode) === item.e;
											const isWatched = show.reached_times?.[String(item.s)]?.[String(item.e)] > 0;

											const isSeasonBoundary = lastS !== null && lastS !== item.s;
											lastS = item.s;

											return (
												<Box key={`${item.s}-${item.e}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													{isSeasonBoundary && <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontWeight: 'bold', userSelect: 'none' }}>|</Typography>}
													<Button
														size='small'
														variant={isCurrent ? 'contained' : 'text'}
														onClick={() => jumpToEpisode(item.s, item.e)}
														sx={{
															minWidth: '32px',
															height: '32px',
															p: 0,
															color: isCurrent ? 'white' : 'rgba(255,255,255,0.7)',
															bgcolor: isCurrent ? accentColor : 'transparent',
															'&:hover': { bgcolor: isCurrent ? hoverColor : 'rgba(255,255,255,0.1)' },
															position: 'relative',
														}}
													>
														{item.e}
														{isWatched && !isCurrent && (
															<CheckCircleIcon
																sx={{
																	position: 'absolute',
																	top: -4,
																	right: -4,
																	fontSize: '12px',
																	color: '#5DD95D',
																}}
															/>
														)}
													</Button>
												</Box>
											);
										});
									})()}
								</Box>

								<Tooltip title='Next Episode'>
									<IconButton onClick={() => actionEpisode('next')} sx={{ color: 'white' }}>
										<ArrowForwardIosIcon />
									</IconButton>
								</Tooltip>
								<Tooltip title='Last Episode'>
									<IconButton onClick={() => actionEpisode('last')} sx={{ color: 'white' }}>
										<LastPageIcon />
									</IconButton>
								</Tooltip>
							</Box>
							{episodeChangeMessage && (
								<Typography variant='caption' color='error'>
									{episodeChangeMessage}
								</Typography>
							)}
						</Box>
					)}
				</Box>
			</Modal>
		</Box>
	);
};

export default ShowDetails;
