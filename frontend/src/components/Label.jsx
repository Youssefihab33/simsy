import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Typography, Box, Chip, Avatar, Tooltip } from '@mui/material';
import {
	Label as LabelIcon,
} from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import ShowCard from './snippets/ShowCard.jsx';
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
	if (error) return <Alert variant='danger' className='mt-5'>Error loading label details.</Alert>;
	if (!label) return <Alert variant='warning' className='mt-5'>Label not found.</Alert>;

	const accentColor = '#54A9DE'; // Blue for labels

	return (
		<div className={styles.showDetailsContainer}>
			{/* Hero Section */}
			<div
				className={styles.heroSection}
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${label.image})`,
				}}
			>
				<Container>
					<Row className='align-items-center'>
						<Col md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'>
							<img src={label.image} alt={label.name} className={styles.posterImage} loading='lazy' />
						</Col>
						<Col md={8}>
							<Typography variant='h2' component='h1' gutterBottom className='fw-bold' sx={{ color: accentColor }}>
								{label.name}
							</Typography>
							<Typography variant='h5' component='p' className='text-light mb-4'>
								Explore content labeled as {label.name}
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
								About {label.name}
							</Typography>
							<Typography variant='body1' paragraph className='text-light'>
								{label.description || `Discover more about ${label.name}.`}
							</Typography>
						</div>

						{/* Shows Section */}
						<div className='mb-5'>
							<Typography variant='h4' component='h2' gutterBottom className='fw-bold text-light'>
								Shows with this Label
							</Typography>
							<Row xs={2} sm={3} md={4} lg={6} className='g-3'>
								{label.shows.map((show) => (
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

export default LabelDetails;
