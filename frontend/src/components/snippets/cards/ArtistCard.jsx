import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Avatar, Grid, Box, Paper } from '@mui/material';

import styles from '../../modules/ShowDetails.module.css';

const ArtistCard = memo(function ArtistCard({ artist }) {
	const [isHovered, setIsHovered] = useState(false);
	const navigate = useNavigate();

	return (
		<Grid item xs={6} sm={4} md={3} lg={2} key={artist.id}>
			<Paper
				className={styles.artistCard}
				elevation={0}
				onClick={() => {
					navigate(`/artist/${artist.id}`);
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					p: 2,
					cursor: 'pointer',
					transition: 'transform 0.2s',
					background: 'rgba(0, 0, 0, 0.2)',
					color: 'white',
					position: 'relative',
					overflow: 'hidden',
					'&:hover': {
						transform: 'scale(1.05)',
					},
				}}
			>
				<Avatar
					src={artist.image}
					alt={artist.name}
					sx={{ width: 100, height: 100, mb: 1 }}
					imgProps={{ loading: 'lazy' }}
				/>
				<Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
					{artist.name}
				</Typography>

				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(5px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						p: 2,
						opacity: isHovered ? 1 : 0,
						transition: 'opacity 0.3s ease-in-out',
						pointerEvents: isHovered ? 'auto' : 'none',
						zIndex: 10,
					}}
				>
					<Typography variant='body2' sx={{ mt: 1 }}>
						{artist.birthYear} | {artist.nationality?.name}
						<br />
						{artist.age} Years old
					</Typography>
				</Box>
			</Paper>
		</Grid>
	);
});

export default ArtistCard;
