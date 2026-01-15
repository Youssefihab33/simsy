import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import axiosInstance from './APIs/Axios';
import ShowCard from './snippets/ShowCard';
import LoadingSpinner from './snippets/LoadingSpinner';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function Homepage() {
	const [loadingTabs, setLoadingTabs] = useState({
		favorites: false,
		watchlist: false,
		new: false,
		history: false,
		random: false,
	});
	const [error, setError] = useState(null);

	const [activeTab, setActiveTab] = useState(null);
	const [isConfiguring, setIsConfiguring] = useState(true);

	const [tabData, setTabData] = useState({
		favorites: [],
		watchlist: [],
		new: [],
		history: [],
		random: [],
	});
	const tabDataRef = useRef(tabData);

	useEffect(() => {
		tabDataRef.current = tabData;
	}, [tabData]);

	useEffect(() => {
		const fetchUserConfig = async () => {
			try {
				const response = await axiosInstance.get('/users/user_home_tab/');
				const preferredTab = response.data.home_tab;

				// Validate that the returned tab name exists in our allowed list
				const validTabs = ['favorites', 'watchlist', 'new', 'history', 'random'];
				if (validTabs.includes(preferredTab)) {
					setActiveTab(preferredTab);
				} else {
					setActiveTab('new'); // Fallback if backend sends something weird
				}
			} catch (err) {
				console.error('Failed to fetch user tab preference:', err);
				setActiveTab('new'); // Fallback on error
			} finally {
				setIsConfiguring(false);
			}
		};

		fetchUserConfig();
	}, []);

	const fetchData = useCallback(async (tabName) => {
		// Safety check: don't fetch if tabName isn't set yet
		if (!tabName) return;

		const currentTabData = tabDataRef.current;

		if (currentTabData[tabName].length > 0 && tabName !== 'random') {
			setLoadingTabs((prev) => ({ ...prev, [tabName]: false }));
			return;
		}

		setLoadingTabs((prev) => ({ ...prev, [tabName]: true }));
		setError(null);
		let endpoint = '';

		switch (tabName) {
			case 'favorites':
				endpoint = '/shows/favoriteShows/';
				break;
			case 'watchlist':
				endpoint = '/shows/watchlistShows/';
				break;
			case 'new':
				endpoint = '/shows/newShows/';
				break;
			case 'history':
				endpoint = '/shows/historyShows/';
				break;
			case 'random':
				endpoint = '/shows/randomShows/';
				break;
			default:
				console.warn('Unknown tab:', tabName);
				setLoadingTabs((prev) => ({ ...prev, [tabName]: false }));
				return;
		}

		try {
			const response = await axiosInstance.get(endpoint);
			setTabData((prevData) => ({
				...prevData,
				[tabName]: response.data,
			}));
		} catch (error) {
			console.error(`Error fetching '${tabName}' data:`, error);
			setError(error.response?.data || `A Timeout error occurred while fetching '${tabName}' data.`);
		} finally {
			setLoadingTabs((prev) => ({ ...prev, [tabName]: false }));
		}
	}, []);

	// This effect runs whenever activeTab is updated (either by initial config or user click)
	useEffect(() => {
		if (activeTab) {
			fetchData(activeTab);
		}
	}, [activeTab, fetchData]);

	const handleTabSelect = (tabKey) => {
		setActiveTab(tabKey);
	};

	// Show a loading state while we figure out which tab to open
	if (isConfiguring) {
		return (
			<div className='text-center text-light mt-5'>
				<LoadingSpinner />
				<h3 className='mt-3'>Loading...</h3>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center text-light mt-5'>
				<h3 className='text-danger'>Error loading shows. Please contact an admin!</h3>
				<h4 className='mt-5'>Error Details:</h4>
				<p id='error_details'>{error}</p>
			</div>
		);
	} else {
		return (
			<section className='container my-5'>
				<Tabs activeKey={activeTab} onSelect={handleTabSelect} id='homepageTabs' className='mb-3' justify>
					<Tab eventKey='favorites' title={<span className='homeNav text-warning bi-star-fill'> Favorites{tabData.favorites.length > 0 && `(${tabData.favorites.length})`}</span>}>
						{tabData.favorites.length > 0 ? (
							<div className='d-flex flex-wrap justify-content-center'>
								{tabData.favorites.map((show) => (
									<ShowCard key={show.id} show={show} />
								))}
							</div>
						) : (
							<div className='text-center text-warning mt-5'>
								{loadingTabs.favorites ? (
									<h3>
										<LoadingSpinner /> Loading Favorites...
									</h3>
								) : (
									<h3>No favorites yet!</h3>
								)}
							</div>
						)}
					</Tab>

					<Tab eventKey='watchlist' title={<span className='homeNav text-info bi-list-columns'> Watchlist{tabData.watchlist.length > 0 && `(${tabData.watchlist.length})`}</span>}>
						{tabData.watchlist.length > 0 ? (
							<div className='d-flex flex-wrap justify-content-center'>
								{tabData.watchlist.map((show) => (
									<ShowCard key={show.id} show={show} />
								))}
							</div>
						) : (
							<div className='text-center text-info mt-5'>
								{loadingTabs.watchlist ? (
									<h3>
										<LoadingSpinner /> Loading Watchlist...
									</h3>
								) : (
									<h3>No watchlist items yet!</h3>
								)}
							</div>
						)}
					</Tab>

					<Tab eventKey='new' title={<span className='homeNav primaryColor bi-fire'> New</span>}>
						{tabData.new.length > 0 ? (
							<div className='d-flex flex-wrap justify-content-center'>
								{tabData.new.map((show) => (
									<ShowCard key={show.id} show={show} />
								))}
							</div>
						) : (
							<div className='text-center primaryColor mt-5'>
								{loadingTabs.new ? (
									<h3>
										<LoadingSpinner /> Loading New Shows...
									</h3>
								) : (
									<h3>No new shows available.</h3>
								)}
							</div>
						)}
					</Tab>

					<Tab eventKey='history' title={<span className='homeNav tertiaryColor bi-clock-history'> History</span>}>
						{tabData.history.length > 0 ? (
							<div className='d-flex flex-wrap justify-content-center'>
								{tabData.history.map((show) => (
									<ShowCard key={show.id} show={show} />
								))}
							</div>
						) : (
							<div className='text-center tertiaryColor mt-5'>
								{loadingTabs.history ? (
									<h3>
										<LoadingSpinner /> Loading History...
									</h3>
								) : (
									<h3>No history items yet!</h3>
								)}
							</div>
						)}
					</Tab>

					<Tab eventKey='random' title={<span className='homeNav secondaryColor bi-magic'> For you</span>}>
						<button type='button' className='btn btn-success d-flex secondary-color mx-auto my-2' onClick={() => fetchData('random')}>
							<span className='secondaryColor bi-arrow-repeat'>&nbsp;Refresh Shows</span>
						</button>

						{tabData.random.length > 0 ? (
							<div className='d-flex flex-wrap justify-content-center'>
								{tabData.random.map((show) => (
									<ShowCard key={show.id} show={show} />
								))}
							</div>
						) : (
							<div className='text-center secondaryColor mt-5'>
								{loadingTabs.random ? (
									<h3>
										<LoadingSpinner /> Loading Random Shows...
									</h3>
								) : (
									<h3>No random shows available.</h3>
								)}
							</div>
						)}
					</Tab>
				</Tabs>

				<div className='text-end mt-3 me-5'>
					<a className='text-info text-decoration-none' href='/explore'>
						Discover <strong>NEW</strong> Content?
						<br />
						Go to &nbsp;
						<strong>
							<i className='bi-search-heart'></i> Explore
						</strong>
					</a>
				</div>
			</section>
		);
	}
}
