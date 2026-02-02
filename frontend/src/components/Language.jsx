import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Chip, Avatar, Tooltip, Container, Grid, Alert } from '@mui/material';
import {
	Language as LanguageIcon,
	Flag as FlagIcon,
	People as PeopleIcon,
	Movie as MovieIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ShowCard from './snippets/cards/ShowCard.jsx';
import CountryCard from './snippets/cards/CountryCard.jsx';
import styles from './modules/ShowDetails.module.css';

const LanguageDetails = () => {
	const { language_id } = useParams();
	const [language, setLanguage] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchLanguage = async () => {
			try {
				const response = await axiosInstance.get(`languages/${language_id}/`);
				setLanguage(response.data);
			} catch (err) {
				console.error('Error fetching language details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchLanguage();
	}, [language_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Container sx={{ mt: 5 }}><Alert severity='error'>Error loading language details.</Alert></Container>;
	if (!language) return <Container sx={{ mt: 5 }}><Alert severity='warning'>Language not found.</Alert></Container>;

	const accentColor = '#5DD95D'; // Green

	return (
		<Box className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<Box
				className={styles.heroSection}
				sx={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${language.image})`,
				}}
			>
				<Container>
					<Grid container alignItems='center'>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 4, md: 0 } }}>
							<img src={language.image} alt={language.name} className={styles.posterImage} loading='lazy' />
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{language.name}
							</Typography>
							<Typography variant='h5' component='p' sx={{ color: 'white', mb: 4 }}>
								Explore content in {language.name}
							</Typography>
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
								About {language.name}
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{language.description || `Discover shows and movies in ${language.name}.`}
							</Typography>
						</Box>

						{/* Countries where spoken */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h5' component='h3' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Countries where spoken
							</Typography>
							<Grid container spacing={1}>
								{language.countries.map((country) => (
									<Grid item xs={6} sm={4} md={3} key={country.id}>
										<CountryCard country={country} />
									</Grid>
								))}
							</Grid>
						</Box>

						{/* Filmography Section */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Shows in {language.name}
							</Typography>
							<Grid container spacing={2}>
								{language.shows.map((show) => (
									<Grid item xs={6} sm={4} md={3} key={show.id}>
										<ShowCard show={show} />
									</Grid>
								))}
							</Grid>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default LanguageDetails;
