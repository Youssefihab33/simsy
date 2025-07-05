import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useContext } from 'react';
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

export default function ShowDetails() {
	const { show_id } = useParams();
	const [show, setShow] = useState(null);
	const [userShowData, setUserShowData] = useState(null);
	const [season, setSeason] = useState(1);
	const [episode, setEpisode] = useState(1);
	const [hoveredArtist, setHoveredArtist] = useState(null);
	const [open, setOpen] = useState(false);
	const playerRef = useRef(null);
	const intervalRef = useRef(null);
	const [inFavorites, setInFavorites] = useState(null);
	const [inWatchlist, setInWatchlist] = useState(null);
	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};
	const handleFavoritesToggle = () => {
		axiosInstance
			.post(`shows/toggleFavorite/${show.id}/`)
			.then((response) => {
				if (response.status === 200) {
					setInFavorites(response.data.in_favorites);
				} else {
					console.error('Error toggling favorite (non 200):', response.statusText);
				}
			})
			.catch((error) => {
				console.error('Error toggling favorite:', error);
			});
	};
	const handleWatchlistToggle = () => {
		axiosInstance
			.post(`shows/toggleWatchlist/${show.id}/`)
			.then((response) => {
				if (response.status === 200) {
					setInWatchlist(response.data.in_watchlist);
				} else {
					console.error('Error toggling watchlist (non 200):', response.statusText);
				}
			})
			.catch((error) => {
				console.error('Error toggling watchlist:', error);
			});
	};

	// Fetch show details & User-show related data
	useEffect(() => {
		axiosInstance
			.get(`shows/show/${show_id}/`)
			.then((response) => {
				if (response.status === 200) {
					setShow(response.data);
					setInFavorites(response.data.in_favorites);
					setInWatchlist(response.data.in_watchlist);
				} else {
					console.error('Error fetching show details (non 200):', response.statusText);
				}
			})
			.catch((error) => {
				console.error('Error fetching show details:', error);
			});
	}, [show_id]);

	// Fetch User-Show Related Data
	useEffect(() => {
		if (show) {
			axiosInstance
				.get(`shows/user/${show.id}`)
				.then((response) => {
					setUserShowData(response.data);
					setSeason(response.data.season_reached);
					setEpisode(response.data.episode_reached);
				});
		}
	}, [show]);

	if (!show) {
		return <LoadingSpinner />;
	}

	// Determine values based on show.kind
	let accentColor,
		hoverColor,
		videoSrc,
		captionsSrc = '';
	switch (show.kind) {
		case 'film':
			accentColor = '#9A0606';
			hoverColor = '#B00707';
			videoSrc = `${import.meta.env.VITE_VIDEOS_SOURCE_ROOT}/videos/${show.name}.mp4`;
			captionsSrc = `${import.meta.env.VITE_VIDEOS_SOURCE_ROOT}/captions/${show.name}.vtt`;
			break;
		case 'series':
			accentColor = '#5DD95D';
			hoverColor = '#79E679';
			videoSrc = `${import.meta.env.VITE_VIDEOS_SOURCE_ROOT}/videos/${show.name}/s${season}e${episode}.mp4`;
			captionsSrc = `${import.meta.env.VITE_VIDEOS_SOURCE_ROOT}/captions/${show.name}/s${season}e${episode}.vtt`;
			break;
		case 'program':
			accentColor = '#54A9DE';
			hoverColor = '#6CB5E3';
			break;
		default:
			console.error('Unknown show kind:', show.kind);
	}

	const playerOptions = {
		...videoJsOptions,
		sources: [
			{
				src: videoSrc,
				type: 'video/mp4',
			},
		],
		tracks:
			show.captions && captionsSrc
				? [
						{
							kind: 'captions',
							srclang: 'en',
							label: 'English',
							src: captionsSrc,
							mode: userShowData.view_captions ? 'showing' : 'disabled',
						},
				  ]
				: [],
	};

	// Set up Video.js options
	const handlePlayerReady = (player) => {
		playerRef.current = player;
		player
			.requestFullscreen()
			.then(() => {
				return player.play();
			})
			.then(() => {
				player.currentTime(userShowData.time_reached);
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
				intervalRef.current = setInterval(() => {
					if (!player.paused()) {
						sendTimeReached(show.id, player.currentTime());
					}
				}, 2500);
			})
			.catch((error) => {
				console.error('Error in media operations:', error);
			});
	};

	const sendTimeReached = (show_id, timeReached) => {
		axiosInstance
			.get(`shows/update_time_reached/${show_id}/${season || 0}/${episode || 0}/${Math.round(timeReached)}`)
			.then((response) => {
				console.log(response.data.message);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<div className={styles.showDetailsContainer}>
			{/* --- Hero Section --- */}
			<div className={styles.heroSection} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${show.image})` }}>
				<Container>
					<Row className='align-items-center'>
						{/* Poster and Details Column */}
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
							{/* This is the IMDb widget from the API response */}
							{show.imdb && <div dangerouslySetInnerHTML={{ __html: show.imdb }} />}
						</Col>
					</Row>
				</Container>
			</div>

			{/* --- Main Details Section --- */}
			<Container className='my-5'>
				<Row>
					{/* Left Column for Details */}
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

						{/* Key Information Grid */}
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
												# of Episodes
											</Typography>
										</Col>
									</>
								)}
							</Row>
						</div>

						{/* Countries & Languages */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: accentColor + ' !important' }}>
								Countries & Languages
							</Typography>
							<div className='d-flex flex-wrap'>
								{show.countries.map((country) => (
									<Tooltip key={country.id} title={country.description} placement='top'>
										<Chip
											label={country.name}
											variant='outlined'
											sx={{ margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
											avatar={<Avatar src={country.flag} />}
										/>
									</Tooltip>
								))}
								{show.countries.length > 0 && show.languages.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
								{show.languages.map((language) => (
									<Tooltip key={language.id} title={language.description} placement='top'>
										<Chip
											label={language.name}
											variant='outlined'
											sx={{ margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
											avatar={<Avatar src={language.image} />}
										/>
									</Tooltip>
								))}
							</div>
						</div>

						{/* Genres */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: accentColor + ' !important' }}>
								Genres & Labels
							</Typography>
							<div className='d-flex flex-wrap'>
								{show.genres.map((genre) => (
									<Tooltip key={genre.id} title={genre.description} placement='top'>
										<Chip
											label={genre.name}
											variant='outlined'
											sx={{ margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
											avatar={<Avatar src={genre.image} />}
										/>
									</Tooltip>
								))}
								{show.genres.length > 0 && show.labels.length > 0 && <h3 style={{ margin: '4px 8px' }}>|</h3>}
								{show.labels.map((label) => (
									<Tooltip key={label.id} title={label.description} placement='top'>
										<Chip
											label={label.name}
											variant='outlined'
											sx={{ margin: '4px', color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
											avatar={<Avatar src={label.image} />}
										/>
									</Tooltip>
								))}
							</div>
						</div>
					</Col>

					{/* Right Column for Cast */}
					<Col md={4}>
						{/* Cast & Crew Section */}
						<div className='overflow-visible mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Cast
							</Typography>
							{/* Make the cast container scrollable */}
							<div className={styles.castContainer}>
								<Row xs={2} className='g-2'>
									{/* 2x2 grid */}
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
															{artist.birthYear} | {artist.nationality.name}
															<br />
															{new Date().getFullYear() - artist.birthYear} Years old
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

				{/* Additional Details */}
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
