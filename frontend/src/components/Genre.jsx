import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Typography, Box, Chip, Avatar, Tooltip } from '@mui/material';
import {
	Category as CategoryIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ShowCard from './snippets/ShowCard.jsx';
import styles from './modules/ShowDetails.module.css';

const GenreDetails = () => {
	const { genre_id } = useParams();
	const [genre, setGenre] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchGenre = async () => {
			try {
				const response = await axiosInstance.get(`genres/${genre_id}/`);
				setGenre(response.data);
			} catch (err) {
				console.error('Error fetching genre details:', err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchGenre();
	}, [genre_id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <Alert variant='danger' className='mt-5'>Error loading genre details.</Alert>;
	if (!genre) return <Alert variant='warning' className='mt-5'>Genre not found.</Alert>;

	const accentColor = '#9A0606'; // Red for genres

	return (
		<div className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<div
				className={styles.heroSection}
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${genre.image})`,
				}}
			>
				<Container>
					<Row className='align-items-center'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'>
							<img src={genre.image} alt={genre.name} className={styles.posterImage} loading='lazy' />
						</Col>
						<Col md={8}>
							<Typography variant='h2' component='h1' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								{genre.name}
							</Typography>
							<Typography variant='h5' component='p' className='text-light mb-4'>
								Explore shows in the {genre.name} genre
							</Typography>
						</Col>
					</Row>
				</Container>
			</div>

			{/* Main Content */}
			<Container className='my-5'>
				<Row>
					<Col md={12}>
						{/* About */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								About {genre.name}
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{genre.description || `Discover the best of ${genre.name}.`}
							</Typography>
						</div>

						{/* Shows Section */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Shows in this Genre
							</Typography>
							<Row xs={2} sm={3} md={4} lg={6} className='g-3'>
								{genre.shows.map((show) => (
									<Col key={show.id}>
										<ShowCard show={show} />
									</Col>
								))}
							</Row>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default GenreDetails;
