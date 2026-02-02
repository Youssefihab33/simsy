import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Card } from 'react-bootstrap';
import { Typography, Avatar } from '@mui/material';

import styles from '../../modules/ShowDetails.module.css';

const ArtistCard = memo(function ArtistCard({ artist }) {
	const [hoveredArtist, setHoveredArtist] = useState(null);
	const navigate = useNavigate();

	return (
		<Col key={artist.id}>
			<Card
				className={styles.artistCard}
				onClick={() => {
					navigate(`/artist/${artist.id}`);
				}}
				onMouseEnter={() => setHoveredArtist(artist)}
				onMouseLeave={() => setHoveredArtist(null)}
			>
				<Avatar src={artist.image} alt={artist.name} className={styles.artistImage} imgProps={{ loading: 'lazy' }} />
				<Typography variant='subtitle1' className='fw-bold text-light'>
					{artist.name}
				</Typography>
				{hoveredArtist?.id === artist.id && (
					<div className={styles.artistInfoHover}>
						<Typography variant='body2' sx={{ mt: 1 }}>
							{artist.birthYear} | {artist.nationality?.name}
							<br />
							{artist.age} Years old
						</Typography>
					</div>
				)}
			</Card>
		</Col>
	);
});

export default ArtistCard;
