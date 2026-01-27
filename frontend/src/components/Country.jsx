import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Card, CardContent, Typography, Chip, List, ListItem, Container, Grid, Box, Alert, Avatar, Accordion, AccordionSummary, AccordionDetails, Pagination } from '@mui/material'; // Import Pagination
import { FlagFill, Globe, CameraVideo, People, InfoCircle } from 'react-bootstrap-icons';
import styles from './modules/ShowDetails.module.css';
import axiosInstance from './APIs/Axios';
import LoadingSpinner from './snippets/LoadingSpinner';
import ShowCard from './snippets/ShowCard';
import ArtistCard from './snippets/ArtistCard';

const useCountryData = (country_id) => {
	const state = useAsync(async () => {
		try {
			const response = await axiosInstance.get(`/countries/${country_id}/`);
			console.log(response);
			return response.data;
		} catch (error) {
			return Promise.reject(error);
		}
	}, [country_id]);
	return state;
};

export default function Country() {
	const { country_id } = useParams();
	const { loading, error, value: Country } = useCountryData(country_id);
	const [expanded, setExpanded] = useState(null);
	const [artistsPage, setArtistsPage] = useState(1);
	const artistsPerPage = 15;
	const [showsPage, setShowsPage] = useState(1);
	const showsPerPage = 8;

	const handleChange = (panel) => (event, newExpanded) => {
		setExpanded(newExpanded ? panel : false);
	};

	const handleArtistsPageChange = (event, value) => {
		setArtistsPage(value);
	};
	const handleShowsPageChange = (event, value) => {
		setShowsPage(value);
	};

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

	if (!Country) {
		return null; // or a "Not Found" message
	}

	const indexOfLastArtist = artistsPage * artistsPerPage;
	const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
	const currentArtists = Country.artists.slice(indexOfFirstArtist, indexOfLastArtist);
	const totalArtistsPages = Math.ceil(Country.artists.length / artistsPerPage);

	const indexOfLastShow = showsPage * showsPerPage;
	const indexOfFirstShow = indexOfLastShow - showsPerPage;
	const currentShows = Country.shows.slice(indexOfFirstShow, indexOfLastShow);
	const totalShowsPages = Math.ceil(Country.shows.length / showsPerPage);

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
					<Box className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0 mt-5 mt-md-0'>
						<img src={Country.flag} alt={Country.name} className={styles.posterImage + ' mt-0'} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} loading='lazy' />
					</Box>
					<Box className='d-flex justify-content-center justify-content-md-start mt-4'>
						<img src={Country.image} alt={Country.name} className={styles.posterImage + ' mt-0'} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} loading='lazy' />
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
								<FlagFill size={50} className='me-2' />
								{Country.name}
							</Typography>
							<Typography color='primary' fontWeight='bold' variant='h6' component='h3' gutterBottom>
								<InfoCircle className='me-2' />
								About
							</Typography>
							<Typography variant='body1' paragraph>
								{Country.description}
							</Typography>
							<div className='d-flex align-items-center mb-2'>
								<Globe size={20} className='me-2' />
								<Box variant='body2'>
									Languages:
									{Country.languages.map((lang, index) => (
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
			<div>
				<Accordion
					expanded={expanded === 'ArtistsPanel'}
					onChange={handleChange('ArtistsPanel')}
					sx={{
						backgroundColor: 'rgba(255, 255, 255, 0.08)',
						backdropFilter: 'blur(10px)',
						boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
					}}
				>
					<AccordionSummary aria-controls='ArtistsPanel-content' id='ArtistsPanel-header'>
						<Typography color='tertiary' fontWeight='bold' variant='h4' component='h2' className='mx-auto mb-3 p-1'>
							<People className='me-2'/>
							Artists ({Country.artists.length})
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<div className='d-flex flex-wrap justify-content-center'>
							{currentArtists.map((artist) => (
								<ArtistCard key={artist.id} artist={artist} />
							))}
						</div>
						{totalArtistsPages > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
								<Pagination
									count={totalArtistsPages}
									page={artistsPage}
									onChange={handleArtistsPageChange}
									color='primary'
									sx={{
										'& .MuiPaginationItem-root': {
											color: 'var(--color3)', // Text color for page numbers
										},
										'& .MuiPaginationItem-ellipsis': {
											color: 'var(--color1)', // Color for ellipsis
										},
										'& .Mui-selected': {
											backgroundColor: 'rgba(0, 0, 0, 0.2) !important', // Background for selected page
										},
										'& .MuiPaginationItem-icon': {
											color: 'var(--color2)', // Color for arrow icons
										},
									}}
								/>
							</Box>
						)}
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={expanded === 'ShowsPanel'}
					onChange={handleChange('ShowsPanel')}
					sx={{
						color: '#E0E0E0',
						backgroundColor: 'rgba(255, 255, 255, 0.08)',
						backdropFilter: 'blur(10px)',
						boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
					}}
				>
					<AccordionSummary aria-controls='ShowsPanel-content' id='ShowsPanel-header'>
						<Typography color='tertiary' fontWeight='bold' variant='h4' component='h2' className='mx-auto mb-3 p-1'>
							<CameraVideo className='me-2' />
							Filmography ({Country.shows.length})
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<div className='d-flex flex-wrap justify-content-center'>
							{currentShows.map((show) => (
								<ShowCard key={show.id} show={show} />
							))}
						</div>
						{totalShowsPages > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
								<Pagination
									count={totalShowsPages}
									page={showsPage}
									onChange={handleShowsPageChange}
									color='primary'
									sx={{
										'& .MuiPaginationItem-root': {
											color: 'var(--color3)', // Text color for page numbers
										},
										'& .MuiPaginationItem-ellipsis': {
											color: 'var(--color1)', // Color for ellipsis
										},
										'& .Mui-selected': {
											backgroundColor: 'rgba(0, 0, 0, 0.2) !important', // Background for selected page
										},
										'& .MuiPaginationItem-icon': {
											color: 'var(--color2)', // Color for arrow icons
										},
									}}
								/>
							</Box>
						)}
					</AccordionDetails>
				</Accordion>
			</div>
		</Container>
	);
}
