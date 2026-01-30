import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Container, Grid, Alert } from '@mui/material';
import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ShowCard from './snippets/ShowCard.jsx';
import styles from './modules/ShowDetails.module.css';

const RatingDetails = () => {
	const { rating_id } = useParams();
	const [rating, setRating] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await axiosInstance.get(`ratings/${rating_id}/`);
				setRating(response.data);
			} catch (err) {
				console.error('Error fetching rating details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchRating();
	}, [rating_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Container sx={{ mt: 5 }}><Alert severity='error'>Error loading rating details.</Alert></Container>;
	if (!rating) return <Container sx={{ mt: 5 }}><Alert severity='warning'>Rating not found.</Alert></Container>;

	const accentColor = '#5DD95D'; // Green for ratings

	return (
		<Box className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<Box
				className={styles.heroSection}
				sx={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${rating.image})`,
				}}
			>
				<Container>
					<Grid container alignItems='center'>
						<Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 4, md: 0 } }}>
							<img src={rating.image} alt={rating.name} className={styles.posterImage} loading='lazy' />
						</Grid>
						<Grid item xs={12} md={8}>
							<Typography variant='h2' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
								{rating.name}
							</Typography>
							<Typography variant='h5' component='p' sx={{ color: 'white', mb: 4 }}>
								Explore shows with {rating.name} rating
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
								About {rating.name}
							</Typography>
							<Typography variant='body1' paragraph sx={{ color: 'white' }}>
								{rating.description || `Shows suitable for ${rating.name}.`}
							</Typography>
						</Box>

						{/* Shows Section */}
						<Box sx={{ mb: 5 }}>
							<Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
								Shows with this Rating
							</Typography>
							<Grid container spacing={2}>
								{rating.shows.map((show) => (
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

export default RatingDetails;
