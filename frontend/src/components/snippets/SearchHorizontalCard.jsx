import { memo } from 'react';
import { Typography, Box, Avatar } from '@mui/material';
import styles from '../modules/HorizontalCard.module.css';

/**
 * A horizontal card component for search results.
 * @param {Object} props
 * @param {Object} props.result - The search result object from the backend.
 * @param {Function} props.onClick - Click handler for the card.
 */
const SearchHorizontalCard = memo(function SearchHorizontalCard({ result, onClick }) {
	const getMeta = () => {
		switch (result.result_type) {
			case 'show':
				return (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<span className={styles.showType}>{result.kind}</span>
						<span>{result.year} {result.rating ? `• ${result.rating}` : ''}</span>
					</Box>
				);
			case 'artist':
				return (
					<span>
						{result.nationality || 'Unknown'} {result.age ? `• ${result.age} years old` : ''}
					</span>
				);
			case 'user':
				return <span>User {result.nationality ? `• ${result.nationality}` : ''}</span>;
			default:
				return <span style={{ textTransform: 'capitalize' }}>{result.result_type}</span>;
		}
	};

	return (
		<Box className={styles.horizontalCard} onClick={() => onClick(result)}>
			<Box className={styles.imageContainer}>
				<Avatar
					src={result.image}
					alt={result.name}
					variant={result.result_type === 'show' ? 'rounded' : 'circular'}
					sx={{
						width: '100%',
						height: '100%',
						borderRadius: result.result_type === 'show' ? '8px' : '50%',
						backgroundColor: 'rgba(255,255,255,0.05)',
						border: '1px solid rgba(255,255,255,0.1)'
					}}
				>
					{result.name?.charAt(0)}
				</Avatar>
			</Box>
			<Box className={styles.cardContent}>
				<Typography className={styles.cardMeta}>{getMeta()}</Typography>
				<Typography className={styles.cardTitle}>{result.name}</Typography>
				{result.description && <Typography className={styles.cardDescription}>{result.description}</Typography>}
			</Box>
		</Box>
	);
});

export default SearchHorizontalCard;
