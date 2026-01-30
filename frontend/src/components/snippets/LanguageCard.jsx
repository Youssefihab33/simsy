import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import styles from '../modules/SmallCard.module.css';

const LanguageCard = memo(function LanguageCard({ language }) {
	const navigate = useNavigate();

	return (
		<Box className={styles.smallCard} onClick={() => navigate(`/language/${language.id}`)}>
			<Box className={styles.imageContainer}>
				<img src={language.image} alt={language.name} className={styles.cardImage} loading='lazy' />
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardTitle}>{language.name}</Typography>
				{language.description && (
					<Typography className={styles.cardText}>
						{language.description}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

export default LanguageCard;
