import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../APIs/Axios';
import { IconButton, Tooltip, Box } from '@mui/material';
import {
	Star as StarIcon,
	StarBorder as StarBorderIcon,
	Bookmark as BookmarkIcon,
	BookmarkBorder as BookmarkBorderIcon,
	Info as InfoIcon,
} from '@mui/icons-material';
import LoadingSpinner from './LoadingSpinner';

export default function ShowCard({ show }) {
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
				const response = await axiosInstance.post(`shows/toggleFavorite/${show.id}/`);
				if (response.status === 200) {
					setInFavorites(response.data.in_favorites);
				}
			} catch (error) {
				console.error('Error toggling favorite:', error);
			} finally {
				setIsFavoriteLoading(false);
			}
		},
		[show.id]
	);

	const handleWatchlistToggle = useCallback(
		async (e) => {
			e.stopPropagation();
			setIsWatchlistLoading(true);
			try {
				const response = await axiosInstance.post(`shows/toggleWatchlist/${show.id}/`);
				if (response.status === 200) {
					setInWatchlist(response.data.in_watchlist);
				}
			} catch (error) {
				console.error('Error toggling watchlist:', error);
			} finally {
				setIsWatchlistLoading(false);
			}
		},
		[show.id]
	);

	const handleInfoClick = (e) => {
		e.stopPropagation();
		navigate(`/show/${show.id}`);
	};

	return (
		<div className='card d-inline-flex text-center text-light bg-transparent border-0 m-1'>
			<div className='showCard-container' onClick={() => navigate(`/show/${show.id}`)}>
				<div className='showCard'>
					<div className='showCard-front bg-dark img-container'>
						{show.sample && (
							<div className='ribbon ribbon-top-left'>
								<span>Sample</span>
							</div>
						)}
						<img className='showCard-image d-block' src={show.image} alt={show.name} />
						<div className='showCard-front-textbox'>
							<div className='showCard-front-text'>{show.name}</div>
						</div>
					</div>
					<Box
						className='showCard-transparent-overlay'
						onClick={(e) => e.stopPropagation()}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 0.5,
							background: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
							padding: '4px 8px',
							zIndex: 3,
						}}
					>
						{show.captions && (
							<Tooltip title='Captions Available'>
								<i className='bi-badge-cc text-secondary mx-1' style={{ fontSize: '1.2rem' }}></i>
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
								{isFavoriteLoading ? <LoadingSpinner small /> : inFavorites ? <StarIcon fontSize='small' /> : <StarBorderIcon fontSize='small' />}
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
								{isWatchlistLoading ? <LoadingSpinner small /> : inWatchlist ? <BookmarkIcon fontSize='small' /> : <BookmarkBorderIcon fontSize='small' />}
							</IconButton>
						</Tooltip>

						<Tooltip
							title={
								<Box sx={{ p: 0.5, textAlign: 'center' }}>
									<div style={{ fontWeight: 'bold' }}>{show.name}</div>
									<div>
										{show.year} | {show.kind?.charAt(0).toUpperCase() + show.kind?.slice(1)}
									</div>
									{show.rating && <div>Rating: {show.rating.name}</div>}
								</Box>
							}
						>
							<IconButton aria-label='Show Info' onClick={handleInfoClick} size='small' sx={{ color: 'rgba(255,255,255,0.5)' }}>
								<InfoIcon fontSize='small' />
							</IconButton>
						</Tooltip>
					</Box>
				</div>
			</div>
		</div>
	);
}
