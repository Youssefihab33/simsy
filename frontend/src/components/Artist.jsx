import { useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { Card, CardContent, Typography, Chip, List, ListItem, Container, Grid, Box, Alert, Avatar } from '@mui/material';
import { FlagFill, Globe, CameraVideo, Calendar, InfoCircle } from 'react-bootstrap-icons';
import styles from './modules/ShowDetails.module.css';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';
import ShowCard from './snippets/ShowCard';

const useActorData = (artist_id) => {
	const state = useAsync(async () => {
		try {
			const response = await axiosInstance.get(`/shows/artist/${artist_id}/`);
			return response.data;
		} catch (error) {
			return Promise.reject(error);
		}
	}, [artist_id]);
	return state;
};

export default function Actor() {
	const { artist_id } = useParams();
	const { loading, error, value: actor } = useActorData(artist_id);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<Box p={3}>
				<Alert severity='error'>Error fetching data: {error.message}</Alert>
			</Box>
		);
	}

	if (!actor) {
		return null; // or a "Not Found" message
	}

	return (
		<Container
			className='my-4'
			sx={{
				p: { xs: 3, sm: 6 },
				mx: 'auto',
				color: '#E0E0E0',
				backgroundColor: 'rgba(255, 255, 255, 0.08)',
				backdropFilter: 'blur(10px)',
				borderRadius: '12px',
				border: '1px solid rgba(255, 255, 255, 0.15)',
				boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
			}}
		>
			<Grid container className='mb-4'>
				<Grid item md={4}>
					<Box md={4} className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0 mt-5 mt-md-0'>
						<img src={actor.image} alt={actor.name} className={styles.posterImage + ' mt-0'} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
					</Box>
				</Grid>
				<Grid item md={8}>
					<Card
						className='mb-3'
						sx={{
							p: 1,
							mx: 'auto',
							color: '#E0E0E0',
							backgroundColor: 'rgba(255, 255, 255, 0.08)',
							backdropFilter: 'blur(10px)',
							borderRadius: '12px',
							border: '1px solid rgba(255, 255, 255, 0.15)',
							boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
						}}
					>
						<CardContent>
                            <Typography className='text-center' color='secondary' variant='h2' component='h1' gutterBottom>
						{actor.name}
					</Typography>
							<Typography color='primary' fontWeight='bold' variant='h6' component='h3' gutterBottom>
								<InfoCircle className='me-2' />
								About
							</Typography>
							<Typography variant='body1' paragraph>
								{actor.description}
							</Typography>
							<div className='d-flex align-items-center mb-3'>
								<Calendar size={20} className='me-2' />
								<Box variant='body2'>
									<Typography fontWeight='bold'>
										Born:
									</Typography>
									{actor.birthYear} ({actor.age} Years old!)
								</Box>
							</div>
							<div className='d-flex align-items-center mb-2'>
								<FlagFill size={20} className='me-2' />
								<Box variant='body2'>
									Nationality:
									<Chip
										avatar={<Avatar alt={actor.nationality.name} src={actor.nationality.flag} />}
										label={actor.nationality.name}
										variant='outlined'
										component='a'
										href={`/country/${actor.nationality.id}`}
										className='ms-2 text-light'
										clickable
									/>
								</Box>
							</div>
							<div className='d-flex align-items-center mb-2'>
								<Globe size={20} className='me-2' />
								<Box variant='body2'>
									Languages:
									{actor.nationality.languages.map((lang, index) => (
										<Chip
											key={index}
											avatar={<Avatar alt={lang.name} src={lang.image} />}
											label={lang.name}
											variant='outlined'
											component='a'
											href={`/language/${lang.id}`}
											className='ms-2 text-light'
											clickable
										/>
									))}
								</Box>
							</div>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item>
					<Typography color='primary' fontWeight='bold' variant='h4' component='h2' className='mb-3'>
						<CameraVideo className='me-2' />
						Filmography
					</Typography>
					<List>
						<div className='d-flex flex-wrap justify-content-center'>
							{actor.shows.map((show, index) => (
								<ShowCard key={show.id} show={show} />
							))}
						</div>
					</List>
				</Grid>
			</Grid>
		</Container>
	);
}
