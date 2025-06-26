import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Typography, Button, Chip, Avatar, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LoadingSpinner from './snippets/LoadingSpinner';
import styles from './modules/ShowDetails.module.css'; // Import the CSS module

export default function ShowDetails() {
	const [show, setShow] = useState(null);
	const { show_id } = useParams();
	const [hoveredArtist, setHoveredArtist] = useState(null);

	useEffect(() => {
		// Fetch show details when the component mounts
		axiosInstance
			.get(`shows/show/${show_id}/`)
			.then((response) => {
				if (response.status === 200) {
					setShow(response.data);
				} else {
					console.error('Error fetching show details (non 200):', response.statusText);
				}
			})
			.catch((error) => {
				console.error('Error fetching show details:', error);
			});
	}, [show_id]);

	if (!show) {
		return <LoadingSpinner />;
	}

	// Determine the accent color based on show.kind
	let accentColor = '#555555';
	let hoverColor = '#777777';
	if (show.kind === 'film') {
		accentColor = '#9A0606';
		hoverColor = '#B00707';
	} else if (show.kind === 'series') {
		accentColor = '#5DD95D';
		hoverColor = '#79E679';
	} else if (show.kind === 'program') {
		accentColor = '#54A9DE';
		hoverColor = '#6CB5E3';
	}

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
								>
									Watch Now
								</Button>
								<Button variant='outlined' startIcon={<FavoriteIcon />} size='large' className='text-warning border-warning me-2'>
									Add to Favorites
								</Button>
								<Button variant='outlined' startIcon={<BookmarkAddIcon />} size='large' className='text-info border-info'>
									Add to Watchlist
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
										Year:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.year}
									</Typography>
								</Col>
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
										Captions:
									</Typography>
									<Typography variant='body1' className='text-light'>
										{show.captions ? 'Available (English)' : 'Not Available'}
									</Typography>
								</Col>
								{show.rating && (
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
								)}
							</Row>
						</div>

						{/* Genres */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light' sx={{ color: accentColor + ' !important' }}>
								Genres
							</Typography>
							<div>
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
							</div>
						</div>

						{/* Countries & Languages */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light' sx={{ color: accentColor + ' !important' }}>
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
							</div>
							<div className='d-flex flex-wrap mt-3'>
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
					</Col>

					{/* Right Column for Cast */}
					<Col md={4}>
						{/* Cast & Crew Section */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Cast
							</Typography>
							{/* Make the cast container scrollable */}
							<div className={styles.castContainer}>
								<Row xs={2} sm={2} md={2} className='g-2'>
									{/* 2x2 grid */}
									{show.artists.map((artist) => (
										<Col key={artist.id}>
											<Card className={styles.artistCard} onMouseEnter={() => setHoveredArtist(artist)} onMouseLeave={() => setHoveredArtist(null)}>
												<Avatar src={artist.image} alt={artist.name} className={styles.artistImage} />
												<Typography variant='subtitle1' className='fw-bold text-light'>
													{artist.name}
												</Typography>
												<Typography variant='body2' className='text-muted text-light'>
													{artist.birthYear}
												</Typography>
												{hoveredArtist?.id === artist.id && (
													<div className={styles.artistInfoHover}>
														<Typography variant='body2' sx={{ mt: 1 }}>
															**Bio:**
															{/* This is a placeholder for additional artist info from your API */}
															<br />
															{`Artist details for ${artist.name} will go here.`}
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
						<Typography variant='body2' className='text-muted text-light'>
							**Finalized:** {show.finalized ? 'Yes' : 'No'}
						</Typography>
						<Typography variant='body2' className='text-muted text-light'>
							**Created:** {new Date(show.created).toLocaleString()}
						</Typography>
						<Typography variant='body2' className='text-muted text-light'>
							**Updated:** {new Date(show.updated).toLocaleString()}
						</Typography>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
