import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Typography, Box, Chip, Avatar, Tooltip } from '@mui/material';
import {
	Language as LanguageIcon,
	Flag as FlagIcon,
	People as PeopleIcon,
	Movie as MovieIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ArtistCard from './snippets/ArtistCard.jsx';
import ShowCard from './snippets/ShowCard.jsx';
import CountryCard from './snippets/CountryCard.jsx';
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
	if (error) return <Alert variant='danger' className='mt-5'>Error loading language details.</Alert>;
	if (!language) return <Alert variant='warning' className='mt-5'>Language not found.</Alert>;

	const accentColor = '#5DD95D'; // Green

	return (
		<div className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<div
				className={styles.heroSection}
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${language.image})`,
				}}
			>
				<Container>
					<Row className='align-items-center'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'>
							<img src={language.image} alt={language.name} className={styles.posterImage} loading='lazy' />
						</Col>
						<Col md={8}>
							<Typography variant='h2' component='h1' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								{language.name}
							</Typography>
							<Typography variant='h5' component='p' className='text-light mb-4'>
								Explore content in {language.name}
							</Typography>
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
								About {language.name}
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{language.description || `Discover shows and movies in ${language.name}.`}
							</Typography>
						</div>

						{/* Countries where spoken */}
						<div className='mb-5'>
							<Typography variant='h5' component='h3' gutterBottom className='fw-bold text-light'>
								Countries where spoken
							</Typography>
							<Row xs={2} sm={3} md={4} className='g-2'>
								{language.countries.map((country) => (
									<Col key={country.id}>
										<CountryCard country={country} />
									</Col>
								))}
							</Row>
						</div>

						{/* Filmography Section */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Shows in {language.name}
							</Typography>
							<Row xs={2} sm={3} md={4} className='g-3'>
								{language.shows.map((show) => (
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

export default LanguageDetails;
