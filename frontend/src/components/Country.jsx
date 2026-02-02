import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Chip, Avatar, Container, Grid, Alert } from '@mui/material';
import {
	Language as LanguageIcon,
	People as PeopleIcon,
	Movie as MovieIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';
import ArtistCard from './snippets/cards/ArtistCard';
import ShowCard from './snippets/cards/ShowCard';
import styles from './modules/ShowDetails.module.css';

const CountryDetails = () => {
	const { country_id } = useParams();
	const [country, setCountry] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCountry = async () => {
			try {
				const response = await axiosInstance.get(`countries/${country_id}/`);
				setCountry(response.data);
			} catch (err) {
				console.error('Error fetching country details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchCountry();
	}, [country_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Container sx={{ mt: 5 }}><Alert severity='error'>Error loading country details.</Alert></Container>;
	if (!country) return <Container sx={{ mt: 5 }}><Alert severity='warning'>Country not found.</Alert></Container>;

	const accentColor = '#5DD95D'; // Green for countries

	return (
		<Box className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<Box
				className={styles.heroSection}
				sx={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${country.flag})`,
				}}
			>
				<Container>
					<Grid container alignItems='center'>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 4, md: 0 } }}>
							<img src={country.flag} alt={country.name} className={styles.posterImage} loading='lazy' />
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{country.name}
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{country.languages.map((lang) => (
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
								About {country.name}
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{country.description || `Explore content from ${country.name}.`}
							</Typography>
						</Box>

						{/* Filmography Section */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Shows from {country.name}
							</Typography>
							<Grid container spacing={2}>
								{country.shows.map((show) => (
									<Grid item xs={6} sm={4} md={3} key={show.id}>
										<ShowCard show={show} />
									</Grid>
								))}
							</Grid>
						</Box>
					</Grid>

					{/* Artists Section */}
					<Grid item xs={12} md={4}>
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Artists (Cast)
							</Typography>
							<Box className={styles.castContainer}>
								<Grid container spacing={1}>
									{country.artists.map((artist) => (
										<Grid item xs={6} key={artist.id}>
											<ArtistCard artist={artist} />
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

export default CountryDetails;
