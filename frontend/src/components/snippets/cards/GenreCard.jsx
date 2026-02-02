import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import styles from '../../modules/SmallCard.module.css';

const GenreCard = memo(function GenreCard({ genre }) {
	const navigate = useNavigate();

	return (
		<Box className={styles.smallCard} onClick={() => navigate(`/genre/${genre.id}`)}>
			<Box className={styles.imageContainer}>
				<img src={genre.image} alt={genre.name} className={styles.cardImage} loading='lazy' />
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardTitle}>{genre.name}</Typography>
				{genre.description && (
					<Typography className={styles.cardText}>
						{genre.description}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

export default GenreCard;
