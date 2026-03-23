import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
import axiosInstance from '../../APIs/Axios';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, Info as InfoIcon, ClosedCaption as CCIcon } from '@mui/icons-material';
import LoadingSpinner from '../LoadingSpinner';

// Memoized to prevent unnecessary re-renders when switching tabs on the Homepage
const ShowCard = memo(function ShowCard({ show, width = 250, height = 400 }) {
	const navigate = useNavigate();
	const [inFavorites, setInFavorites] = useState(show.in_favorites);
	const [inWatchlist, setInWatchlist] = useState(show.in_watchlist);
	const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
	const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

	useEffect(() => {
		setInFavorites(show.in_favorites);
		setInWatchlist(show.in_watchlist);
	}, [show.in_favorites, show.in_watchlist]);

	const handleFavoritesToggle = useCallback(
		async (e) => {
			e.stopPropagation();
			setIsFavoriteLoading(true);
			try {
				const response = await axiosInstance.post(`shows/${show.id}/toggleFavorite/`);
				if (response.status === 200) {
					setInFavorites(response.data.in_favorites);
				}
			} catch (error) {
				console.error('Error toggling favorite:', error);
			} finally {
				setIsFavoriteLoading(false);
			}
		},
		[show.id],
	);

	const handleWatchlistToggle = useCallback(
		async (e) => {
			e.stopPropagation();
			setIsWatchlistLoading(true);
			try {
				const response = await axiosInstance.post(`shows/${show.id}/toggleWatchlist/`);
				if (response.status === 200) {
					setInWatchlist(response.data.in_watchlist);
				}
			} catch (error) {
				console.error('Error toggling watchlist:', error);
			} finally {
				setIsWatchlistLoading(false);
			}
		},
		[show.id],
	);

	const handleInfoClick = (e) => {
		e.stopPropagation();
		navigate(`/show/${show.id}`);
	};

	return (
		<Box
			sx={{
				display: 'inline-flex',
				textAlign: 'center',
				backgroundColor: 'transparent',
				m: 1,
			}}
		>
			<Box width={width} height={height} className='showCard-container' onClick={() => navigate(`/show/${show.id}`)}>
				{show.sample && (
					<Box className='ribbon ribbon-top-left'>
						<Typography component='span'>Sample</Typography>
					</Box>
				)}
				<Box className='showCard'>
					<Box className='showCard-front'>
						<Box component='img' className='showCard-image' src={show.image} alt={show.name} loading='lazy' sx={{ display: 'block' }} />
						<Box className='showCard-front-textbox'>
							<Typography className='showCard-front-text'>{show.name}</Typography>
						</Box>
					</Box>
					<Box
						className='showCard-transparent-overlay'
						onClick={(e) => e.stopPropagation()}
						sx={{
							display: 'flex',
							position: 'absolute',
							alignItems: 'center',
							gap: 1,
							top: 0,
							right: 0,
							m: 1,
							p: 1,
							zIndex: 3,
						}}
					>
						{show.captions && (
							<Tooltip title='Captions Available'>
								<CCIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', mx: 0.5 }} />
							</Tooltip>
						)}

						<Tooltip title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}>
							<IconButton
								aria-label={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
								onClick={handleFavoritesToggle}
								size='small'
								disabled={isFavoriteLoading}
								sx={{ color: inFavorites ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}
							>
								{isFavoriteLoading ?
									<LoadingSpinner small />
								: inFavorites ?
									<StarIcon fontSize='small' />
								:	<StarBorderIcon fontSize='small' />}
							</IconButton>
						</Tooltip>

						<Tooltip title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}>
							<IconButton
								aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
								onClick={handleWatchlistToggle}
								size='small'
								disabled={isWatchlistLoading}
								sx={{ color: inWatchlist ? '#0dcaf0' : 'rgba(255,255,255,0.5)' }}
							>
								{isWatchlistLoading ?
									<LoadingSpinner small />
								: inWatchlist ?
									<BookmarkIcon fontSize='small' />
								:	<BookmarkBorderIcon fontSize='small' />}
							</IconButton>
						</Tooltip>

						<Tooltip
							title={
								<Box sx={{ p: 0.5, textAlign: 'center' }}>
									<Typography sx={{ fontWeight: 'bold' }}>{show.name}</Typography>
									<Typography variant='body2'>
										{show.year} | {show.kind?.charAt(0).toUpperCase() + show.kind?.slice(1)}
									</Typography>
									{show.rating && <Typography variant='body2'>Rating: {show.rating.name}</Typography>}
								</Box>
							}
						>
							<IconButton aria-label='Show Info' onClick={handleInfoClick} size='small' sx={{ color: 'rgba(255,255,255,0.5)' }}>
								<InfoIcon fontSize='small' />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			</Box>
		</Box>
	);
});

export default ShowCard;
