import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../APIs/Axios';

export default function ShowCard({ show }) {
	const navigate = useNavigate();
	const [inFavorites, setInFavorites] = useState(show.in_favorites);
	const [inWatchlist, setInWatchlist] = useState(show.in_watchlist);

	// Update local state if the 'show' prop changes (e.g., when parent re-fetches data)
	useEffect(() => {
		setInFavorites(show.in_favorites);
		setInWatchlist(show.in_watchlist);
	}, [show.in_favorites, show.in_watchlist]);

	const handleFavoritesToggle = useCallback(
		async () => {
			axiosInstance
				.post(`shows/toggleFavorite/${show.id}/`)
				.then((response) => {
					if (response.status === 200) {
						setInFavorites(response.data.in_favorites);
					} else {
						console.error('Error toggling favorite (non 200):', response.statusText);
					}
				})
				.catch((error) => {
					console.error('Error toggling favorite:', error);
				})
		},
		[]
	);

	const handleWatchlistToggle = useCallback(
		async () => {
			axiosInstance
				.post(`shows/toggleWatchlist/${show.id}/`)
				.then((response) => {
					if (response.status === 200) {
						setInWatchlist(response.data.in_watchlist);
					} else {
						console.error('Error toggling watchlist (non 200):', response.statusText);
					}
				})
				.catch((error) => {
					console.error('Error toggling watchlist:', error);
				})
		},
		[]
	);
	return (
		<>
			<div className='card d-inline-flex text-center text-light bg-transparent border-0 m-1'>
				<div className='showCard-container'>
					<div className='showCard'>
						<div className='showCard-front bg-dark img-container' onClick={() => navigate(`/show/${show.id}`)}>
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
						<div
							className='showCard-transparent-overlay'
							// The original event handlers were probably causing issues or were for jQuery popovers.
							// Removed the commented out onClick with stopPropagation/Default here, as the new onClick on spans handles it.
						>
							{show.captions && <i className='bi-badge-cc text-secondary mx-1'></i>}

							{/* Favorite Button */}
							<span
								id={`favoriteBtn${show.id}`} // Using template literal for ID
								onClick={handleFavoritesToggle} // Use the new handler
								className={`bi-star-fill ${inFavorites ? 'text-warning' : 'text-secondary'} mx-1`} // Add disabled class
							></span>

							{/* Watchlist Button */}
							<span
								id={`watchlistBtn${show.id}`} // Using template literal for ID
								onClick={handleWatchlistToggle} // Use the new handler
								className={`bi-watch ${inWatchlist ? 'text-info' : 'text-secondary'} mx-1`} // Add disabled class
							></span>

							{/* Info Button - Keep as is, ensure popover is handled via JS (likely in Homepage.jsx or a separate useEffect) */}
							<span
								id={`info${show.id}target`} // Using template literal for ID
								className='bi-info-circle text-secondary mx-1'
								tabIndex='0'
								style={{ cursor: 'help' }}
								data-bs-toggle='popover'
								data-bs-trigger='hover focus'
								data-bs-title='This Should Be Replaced By JavaScript!' // This will need dynamic update via useEffect as well
							></span>
						</div>
					</div>
				</div>
			</div>

			{/* Hidden div for popover content - you'll likely need to generate this dynamically */}
			{/* from props or an effect if your info is truly dynamic per show */}
			<div id={`info${show.id}`} className='d-none'>
				{/* Replace with actual React rendering of show details if needed */}
				{/* Example:
                <div>ID: {show.id} | {show.kind} | {show.year}</div>
                <div>Languages: {show.languages.join(', ')}</div>
                <div>Countries: {show.countries.join(', ')}</div>
                <div>Genres: {show.genres.join(', ')}</div>
                <div>Rating: {show.rating}</div>
                */}
			</div>
		</>
	);
}
