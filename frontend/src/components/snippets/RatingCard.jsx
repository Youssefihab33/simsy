import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import styles from '../modules/SmallCard.module.css';

const RatingCard = memo(function RatingCard({ rating }) {
	const navigate = useNavigate();

	return (
		<Box className={styles.smallCard} onClick={() => navigate(`/rating/${rating.id}`)}>
			<Box className={styles.imageContainer}>
				<img src={rating.image} alt={rating.name} className={styles.cardImage} loading='lazy' />
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardTitle}>{rating.name}</Typography>
				{rating.description && (
					<Typography className={styles.cardText}>
						{rating.description}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

export default RatingCard;
