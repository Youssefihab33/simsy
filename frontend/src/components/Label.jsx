import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Container, Grid, Alert } from '@mui/material';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';
import ShowCard from './snippets/cards/ShowCard';
import styles from './modules/ShowDetails.module.css';

const LabelDetails = () => {
	const { label_id } = useParams();
	const [label, setLabel] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchLabel = async () => {
			try {
				const response = await axiosInstance.get(`labels/${label_id}/`);
				setLabel(response.data);
			} catch (err) {
				console.error('Error fetching label details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchLabel();
	}, [label_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Container sx={{ mt: 5 }}><Alert severity='error'>Error loading label details.</Alert></Container>;
	if (!label) return <Container sx={{ mt: 5 }}><Alert severity='warning'>Label not found.</Alert></Container>;

	const accentColor = '#54A9DE'; // Blue for labels

	return (
		<Box className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<Box
				className={styles.heroSection}
				sx={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${label.image})`,
				}}
			>
				<Container>
					<Grid container alignItems='center'>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 4, md: 0 } }}>
							<img src={label.image} alt={label.name} className={styles.posterImage} loading='lazy' />
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{label.name}
							</Typography>
							<Typography variant='h5' component='p' sx={{ color: 'white', mb: 4 }}>
								Explore content labeled as {label.name}
							</Typography>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* Main Content */}
			<Container sx={{ my: 5 }}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						{/* About */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								About {label.name}
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{label.description || `Discover more about ${label.name}.`}
							</Typography>
						</Box>

						{/* Shows Section */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Shows with this Label
							</Typography>
							<Grid container spacing={2}>
								{label.shows.map((show) => (
									<Grid item xs={6} sm={4} md={3} lg={2} key={show.id}>
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

export default LabelDetails;
