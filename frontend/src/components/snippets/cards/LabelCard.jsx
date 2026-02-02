import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import styles from '../../modules/SmallCard.module.css';

const LabelCard = memo(function LabelCard({ label }) {
	const navigate = useNavigate();

	return (
		<Box className={styles.smallCard} onClick={() => navigate(`/label/${label.id}`)}>
			<Box className={styles.imageContainer}>
				<img src={label.image} alt={label.name} className={styles.cardImage} loading='lazy' />
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardTitle}>{label.name}</Typography>
				{label.description && (
					<Typography className={styles.cardText}>
						{label.description}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

export default LabelCard;
