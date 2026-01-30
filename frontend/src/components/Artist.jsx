import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Chip, Avatar, Tooltip, Container, Grid, Alert, CircularProgress } from '@mui/material';
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
	if (error) return <Container sx={{ mt: 5 }}><Alert severity='error'>Error loading artist details.</Alert></Container>;
	if (!artist) return <Container sx={{ mt: 5 }}><Alert severity='warning'>Artist not found.</Alert></Container>;

	const accentColor = '#54A9DE'; // Default blue for artists

	return (
		<Box className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<Box
				className={styles.heroSection}
				sx={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${artist.image})`,
				}}
			>
				<Container>
					<Grid container alignItems='center'>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 4, md: 0 } }}>
							<img src={artist.image} alt={artist.name} className={styles.posterImage} loading='lazy' />
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{artist.name}
							</Typography>
							<Typography variant='h5' component='p' sx={{ color: 'white', mb: 4 }}>
								{artist.birthYear} ({artist.age} years old)
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* Main Content */}
			<Container sx={{ my: 5 }}>
				<Grid container spacing={4}>
					<Grid item xs={12} md={8}>
						{/* About */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								About {artist.name}
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{artist.description || 'No description available.'}
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
										Born:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>{artist.birthYear}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Age:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>{artist.age} years old</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='subtitle1' sx={{ color: accentColor }}>
										Nationality:
									</Typography>
									<Typography variant='body1' sx={{ color: 'white' }}>{artist.nationality.name}</Typography>
								</Grid>
							</Grid>
						</Box>

						{/* Languages (via Nationality) */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h5' component='h3' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								Languages
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
							</Box>
						</Box>
					</Grid>

					{/* Filmography Section */}
					<Grid item xs={12} md={4}>
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Filmography
							</Typography>
							<Box className={styles.castContainer}>
								<Grid container spacing={2}>
									{artist.shows.map((show) => (
										<Grid item xs={6} key={show.id}>
											<ShowCard show={show} />
										</Grid>
									))}
								</Grid>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default ArtistDetails;
