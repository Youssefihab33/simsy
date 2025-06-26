import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../APIs/Axios';

// Debounce helper function (can be a utility outside the component, or inline for simplicity here)
const debounce = (func, delay) => {
    let timeout;
    return function executed(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

export default function ShowCard({
    show = {
        id: 1,
        name: 'Show Name',
        sample: false,
		captions: true,
        image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fencrypted-tbn0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcQCAVNHSTMg1kboB9nLrl_xjF7cJQJsjj8fNPqkYwb8pc_mmpe9&psig=AOvVaw1drnveOAIfTpaxcIltJK22&ust=1750255082518000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCIjzsrXO-I0DFQAAAAAdAAAAABAE',
    },
}) {
    const navigate = useNavigate();

    // Use React state to manage favorited and watchlisted status
    // Initialize with the prop, which should come from your fetched show data
    const [isFavorited, setIsFavorited] = useState(show.is_favorited);
    const [isWatchlisted, setIsWatchlisted] = useState(show.is_watchlisted);

    // State to manage loading status for each toggle button
    const [isLoadingFav, setIsLoadingFav] = useState(false);
    const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

    // Use a ref to store the latest favorite/watchlist state for the debounce callback
    // This prevents the debounce callback from capturing stale state
    const isFavoritedRef = useRef(isFavorited);
    const isWatchlistedRef = useRef(isWatchlisted);

    useEffect(() => {
        isFavoritedRef.current = isFavorited;
    }, [isFavorited]);

    useEffect(() => {
        isWatchlistedRef.current = isWatchlisted;
    }, [isWatchlisted]);

    // Update local state if the 'show' prop changes (e.g., when parent re-fetches data)
    useEffect(() => {
        setIsFavorited(show.is_favorited);
        setIsWatchlisted(show.is_watchlisted);
    }, [show.is_favorited, show.is_watchlisted]);


    // Convert to an async function using axiosInstance
    const actualToggleFavorite = useCallback(async (showId) => {
        if (isLoadingFav) return; // Prevent multiple requests if one is already pending
        setIsLoadingFav(true);

        try {
            // Replace $.ajax with axiosInstance
            const response = await axiosInstance.get(`/toggle_fav/?showID=${showId}`);
            if (response.data.status === 500) {
                alert(response.data.message);
            } else {
                // Update React state based on the response
                setIsFavorited(response.data.current_state);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // You might want to show a more user-friendly error message here
            alert('Error toggling favorite. Please try again.');
        } finally {
            setIsLoadingFav(false);
        }
    }, [isLoadingFav]); // Dependency on isLoadingFav ensures we use the latest value

    const actualToggleWatchlist = useCallback(async (showId) => {
        if (isLoadingWatchlist) return; // Prevent multiple requests if one is already pending
        setIsLoadingWatchlist(true);

        try {
            // Replace $.ajax with axiosInstance
            const response = await axiosInstance.get(`/toggle_watchlist/?showID=${showId}`);
            if (response.data.status === 500) {
                alert(response.data.message);
            } else {
                // Update React state based on the response
                setIsWatchlisted(response.data.current_state);
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            // You might want to show a more user-friendly error message here
            alert('Error toggling watchlist. Please try again.');
        } finally {
            setIsLoadingWatchlist(false);
        }
    }, [isLoadingWatchlist]); // Dependency on isLoadingWatchlist


    // Debounced versions of the toggle functions
    // Using useCallback and useRef to ensure these debounced functions don't change unnecessarily
    const debouncedToggleFavorite = useCallback(debounce((showId) => {
        actualToggleFavorite(showId);
    }, 300), [actualToggleFavorite]); // Debounce for 300ms

    const debouncedToggleWatchlist = useCallback(debounce((showId) => {
        actualToggleWatchlist(showId);
    }, 300), [actualToggleWatchlist]); // Debounce for 300ms


    // Function to handle click, calls the debounced function
    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent the card's navigation click
        debouncedToggleFavorite(show.id);
    };

    const handleWatchlistClick = (e) => {
        e.stopPropagation(); // Prevent the card's navigation click
        debouncedToggleWatchlist(show.id);
    };


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
                                onClick={handleFavoriteClick} // Use the new handler
                                className={`bi-star-fill ${isFavorited ? 'text-warning' : 'text-secondary'} mx-1 ${isLoadingFav ? 'disabled-icon' : ''}`} // Add disabled class
                                style={{ cursor: isLoadingFav ? 'not-allowed' : 'pointer' }} // Visual feedback for disabled
                            ></span>

                            {/* Watchlist Button */}
                            <span
                                id={`watchlistBtn${show.id}`} // Using template literal for ID
                                onClick={handleWatchlistClick} // Use the new handler
                                className={`bi-watch ${isWatchlisted ? 'text-info' : 'text-secondary'} mx-1 ${isLoadingWatchlist ? 'disabled-icon' : ''}`} // Add disabled class
                                style={{ cursor: isLoadingWatchlist ? 'not-allowed' : 'pointer' }} // Visual feedback for disabled
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