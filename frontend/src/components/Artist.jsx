import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Typography, Box, Chip, Avatar, Tooltip } from '@mui/material';
import {
	CalendarMonth as CalendarIcon,
	Flag as FlagIcon,
	Language as LanguageIcon,
	Movie as MovieIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ShowCard from './snippets/ShowCard.jsx';
import styles from './modules/ShowDetails.module.css';

const ArtistDetails = () => {
	const { artist_id } = useParams();
	const [artist, setArtist] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchArtist = async () => {
			try {
				const response = await axiosInstance.get(`artists/${artist_id}/`);
				setArtist(response.data);
			} catch (err) {
				console.error('Error fetching artist details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchArtist();
	}, [artist_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Alert variant='danger' className='mt-5'>Error loading artist details.</Alert>;
	if (!artist) return <Alert variant='warning' className='mt-5'>Artist not found.</Alert>;

	const accentColor = '#54A9DE'; // Default blue for artists

	return (
		<div className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<div
				className={styles.heroSection}
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${artist.image})`,
				}}
			>
				<Container>
					<Row className='align-items-center'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'>
							<img src={artist.image} alt={artist.name} className={styles.posterImage} loading='lazy' />
						</Col>
						<Col md={8}>
							<Typography variant='h2' component='h1' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								{artist.name}
							</Typography>
							<Typography variant='h5' component='p' className='text-light mb-4'>
								{artist.birthYear} ({artist.age} years old)
							</Typography>
							<Box className='d-flex flex-wrap gap-2'>
								<Chip
									label={artist.nationality.name}
									variant='outlined'
									component={RouterLink}
									to={`/country/${artist.nationality.id}`}
									avatar={<Avatar alt={artist.nationality.name} src={artist.nationality.flag} />}
									sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}
									clickable
								/>
							</Box>
						</Col>
					</Row>
				</Container>
			</div>

			{/* Main Content */}
			<Container className='my-5'>
				<Row>
					<Col md={8}>
						{/* About */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								About {artist.name}
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{artist.description || 'No description available.'}
							</Typography>
						</div>

						{/* Details */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light'>
								Details
							</Typography>
							<Row className='text-light'>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Born:
									</Typography>
									<Typography variant='body1'>{artist.birthYear}</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Age:
									</Typography>
									<Typography variant='body1'>{artist.age} years old</Typography>
								</Col>
								<Col md={6} className='mb-3'>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Nationality:
									</Typography>
									<Typography variant='body1'>{artist.nationality.name}</Typography>
								</Col>
							</Row>
						</div>

						{/* Languages (via Nationality) */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								Languages
							</Typography>
							<div className='d-flex flex-wrap gap-2'>
								{artist.nationality.languages.map((lang) => (
									<Chip
										key={lang.id}
										label={lang.name}
										variant='outlined'
										component={RouterLink}
										to={`/language/${lang.id}`}
										avatar={<Avatar alt={lang.name} src={lang.image} />}
										sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}
										clickable
									/>
								))}
							</div>
						</div>
					</Col>

					{/* Filmography Section */}
					<Col md={4}>
						<div className='overflow-visible mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Filmography
							</Typography>
							<div className={styles.castContainer}>
								<Row xs={2} className='g-2'>
									{artist.shows.map((show) => (
										<ShowCard key={show.id} show={show} />
									))}
								</Row>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ArtistDetails;
