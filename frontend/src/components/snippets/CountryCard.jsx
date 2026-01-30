import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import styles from '../modules/SmallCard.module.css';

const CountryCard = memo(function CountryCard({ country }) {
	const navigate = useNavigate();

	return (
		<Box className={styles.smallCard} onClick={() => navigate(`/country/${country.id}`)}>
			<Box className={styles.imageContainer}>
				<img src={country.flag || country.image} alt={country.name} className={styles.cardImage} loading='lazy' />
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardTitle}>{country.name}</Typography>
				{country.description && (
					<Typography className={styles.cardText}>
						{country.description}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

export default CountryCard;
