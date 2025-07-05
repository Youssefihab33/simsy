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
import LoadingSpinner from './snippets/LoadingSpinner';
import styles from './modules/ShowDetails.module.css';
import { VideoJS, videoJsOptions } from './snippets/VideoJS.jsx';

// Custom hook for API calls
const useShowData = (showId) => {
	const [show, setShow] = useState(null);
	const [userShowData, setUserShowData] = useState(null);
	const [inFavorites, setInFavorites] = useState(null);
	const [inWatchlist, setInWatchlist] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchShowDetails = useCallback(async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get(`shows/show/${showId}/`);
			if (response.status === 200) {
				setShow(response.data);
				setInFavorites(response.data.in_favorites);
				setInWatchlist(response.data.in_watchlist);
			} else {
				throw new Error(`Error fetching show details: ${response.statusText}`);
			}
		} catch (err) {
			console.error('Error fetching show details:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [showId]);

	const fetchUserShowData = useCallback(async () => {
		if (!showId) return;
		try {
			const response = await axiosInstance.get(`shows/user/${showId}`);
			setUserShowData(response.data);
		} catch (err) {
			console.error('Error fetching user show data:', err);
			setError(err);
		}
	}, [showId]);

	useEffect(() => {
		fetchShowDetails();
	}, [fetchShowDetails]);

	useEffect(() => {
		if (show) {
			fetchUserShowData();
		}
	}, [show, fetchUserShowData]);

	return { show, userShowData, inFavorites, inWatchlist, setInFavorites, setInWatchlist, loading, error, fetchUserShowData };
};

// Custom hook for media player logic
const useMediaPlayer = (show, userShowData, fetchUserShowData) => {
	const [open, setOpen] = useState(false);
	const playerRef = useRef(null);
	const [season, setSeason] = useState(1);
	const [episode, setEpisode] = useState(1);

	useEffect(() => {
		if (userShowData) {
			setSeason(userShowData.season_reached);
			setEpisode(userShowData.episode_reached);
		}
	}, [userShowData]);

	const handleOpen = () => setOpen(true);

	const handleClose = () => {
		setOpen(false);
		fetchUserShowData(); // Refresh user show data after modal closes
	};

	const sendTimeReached = useCallback(
		async (currentShowId, timeReached) => {
			try {
				await axiosInstance.get(`shows/update_time_reached/${currentShowId}/${season || 0}/${episode || 0}/${Math.round(timeReached)}`);
			} catch (error) {
				console.error('Error updating time reached:', error);
			}
		},
		[season, episode]
	);

	const handlePlayerReady = useCallback(
		(player) => {
			playerRef.current = player;

			player.on('loadedmetadata', () => {
				player.currentTime(userShowData?.time_reached || 0);
				player.play();
			});

			player.on(['pause', 'fullscreenchange', 'dispose'], () => {
				sendTimeReached(show.id, player.currentTime());
			});
			player.on('ended', () => {
				sendTimeReached(show.id, 0);
			});
		},
		[sendTimeReached, show, userShowData]
	);

	// Determine video source and captions based on show kind
	const getVideoDetails = useCallback(() => {
		let videoSrc = '';
		let captionsSrc = '';
		const videoRoot = import.meta.env.VITE_VIDEOS_SOURCE_ROOT;

		// Check for 'show' before accessing its properties
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
				// Consider a default video/caption source or handle this error more gracefully
				break;
		}
		return { videoSrc, captionsSrc };
	}, [show, season, episode]);

	const { videoSrc, captionsSrc } = getVideoDetails();

	// Ensure playerOptions are only built if show is available
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
		: {}; // Provide a default empty object or null if show is not ready

	// Also guard accentColor
	const accentColor = getAccentColor(show?.kind);

	return { open, handleOpen, handleClose, handlePlayerReady, playerOptions, accentColor };
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
const useToggleApi = (showId, inState, setInState, endpoint, name) => {
	const handleToggle = useCallback(async () => {
		try {
			const response = await axiosInstance.post(`shows/${endpoint}/${showId}/`);
			if (response.status === 200) {
				setInState(response.data[`in_${name}`]);
			} else {
				throw new Error(`Error toggling ${endpoint}: ${response.statusText}`);
			}
		} catch (error) {
			console.error(`Error toggling ${endpoint}:`, error);
		}
	}, [showId, setInState, endpoint]);
	return handleToggle;
};

export default function ShowDetails() {
	const { show_id } = useParams();
	const [hoveredArtist, setHoveredArtist] = useState(null);

	const { show, userShowData, inFavorites, inWatchlist, setInFavorites, setInWatchlist, loading, error, fetchUserShowData } = useShowData(show_id);

	const handleFavoritesToggle = useToggleApi(show?.id, inFavorites, setInFavorites, 'toggleFavorite', 'favorites');
	const handleWatchlistToggle = useToggleApi(show?.id, inWatchlist, setInWatchlist, 'toggleWatchlist', 'watchlist');

	const { open, handleOpen, handleClose, handlePlayerReady, playerOptions, accentColor } = useMediaPlayer(show, userShowData, fetchUserShowData);

	// Dynamic hover color based on accentColor
	const hoverColor = accentColor === '#9A0606' ? '#B00707' : accentColor === '#5DD95D' ? '#79E679' : accentColor === '#54A9DE' ? '#6CB5E3' : '#6CB5E3'; // Default hover color

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
								{show.year} | {show.kind.charAt(0).toUpperCase() + show.kind.slice(1)}
							</Typography>
							<div className='d-flex align-items-center mb-4'>
								<Button
									variant='contained'
									size='large'
									className='me-3'
									startIcon={<PlayArrowIcon />}
									sx={{ backgroundColor: accentColor, '&:hover': { backgroundColor: hoverColor } }}
									onClick={handleOpen}
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
												{show.number_of_episodes || '# of Episodes'} {/* Use actual prop if available */}
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
			<Modal open={open} onClose={handleClose} aria-labelledby='video-player-modal' aria-describedby='video-player-for-show'>
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
					{open && <VideoJS options={playerOptions} onReady={handlePlayerReady} color={accentColor} />}
				</Box>
			</Modal>
		</div>
	);
}
