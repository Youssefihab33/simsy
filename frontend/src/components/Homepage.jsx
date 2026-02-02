import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Box, Tabs, Tab, Pagination, Stack, InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import axiosInstance from './APIs/Axios';
import { UserContext } from './APIs/Context';
import ShowCard from './snippets/cards/ShowCard';
import LoadingSpinner from './snippets/LoadingSpinner';

// Configuration: Add or remove tabs here without touching the JSX logic
const TABS_CONFIG = {
	favorites: { label: 'Favorites', icon: 'bi-star-fill', color: 'text-warning', endpoint: '/shows/favorites/', empty: 'No favorites yet!' },
	watchlist: { label: 'Watchlist', icon: 'bi-list-columns', color: 'text-info', endpoint: '/shows/watchlist/', empty: 'No watchlist items yet!' },
	new: { label: 'New', icon: 'bi-fire', color: 'primaryColor', endpoint: '/shows/new/', empty: 'No new shows available.' },
	history: { label: 'History', icon: 'bi-clock-history', color: 'tertiaryColor', endpoint: '/shows/history/', empty: 'No history items yet!' },
	random: { label: 'For You', icon: 'bi-magic', color: 'secondaryColor', endpoint: '/shows/random/', empty: 'No random shows available.', refreshable: true },
};

const TabPanel = ({ children, value, index }) => (
	<div role='tabpanel' hidden={value !== index}>
		{value === index && <Box sx={{ py: 2 }}>{children}</Box>}
	</div>
);

export default function Homepage() {
	const { user, setUser } = useContext(UserContext);
	const [activeTab, setActiveTab] = useState('new');
	const [page, setPage] = useState(1);
	const [isConfiguring, setIsConfiguring] = useState(true);
	const [ShowsPerPage, setShowsPerPage] = useState(user.shows_per_page);
	const handleShowsPerPageChange = async (event) => {
		setShowsPerPage(event.target.value);
		try {
			const response = await axiosInstance.put(`/users/current/`, {
				shows_per_page: event.target.value,
			});
			setUser(response);
		} catch (error) {
			alert('An error occurred while attempting to save your Shows_Per_Page. Please try again.');
			console.error('An error occurred while attempting to save Shows_Per_Page.', error);
		}
	};

	// Consolidated State
	const [state, setState] = useState({
		data: { favorites: [], watchlist: [], new: [], history: [], random: [] },
		loading: {},
		error: null,
	});

	// Initialize Active Tab from User Context
	useEffect(() => {
		if (TABS_CONFIG[user.home_tab]) {
			setActiveTab(user.home_tab);
		}
		setIsConfiguring(false);
	}, [user.home_tab]);

	/**
	 * Fetch Data Logic
	 * Functional updates are used inside setState to keep the function stable (empty dependency array).
	 * This prevents the infinite "random" refresh loop.
	 */
	const fetchData = useCallback(async (tabKey) => {
		setState((prev) => ({
			...prev,
			loading: { ...prev.loading, [tabKey]: true },
			error: null,
		}));

		try {
			const { data } = await axiosInstance.get(TABS_CONFIG[tabKey].endpoint);
			setState((prev) => ({
				...prev,
				data: { ...prev.data, [tabKey]: data },
				loading: { ...prev.loading, [tabKey]: false },
			}));
		} catch (err) {
			setState((prev) => ({
				...prev,
				error: err.response?.data || `Error fetching ${tabKey}`,
				loading: { ...prev.loading, [tabKey]: false },
			}));
		}
	}, []);

	// Trigger fetch on tab change only if data doesn't exist
	useEffect(() => {
		if (!isConfiguring && activeTab) {
			const hasData = state.data[activeTab]?.length > 0;
			if (!hasData) {
				fetchData(activeTab);
			}
		}
	}, [activeTab, isConfiguring, fetchData, state.data]);

	// Handle Page/Tab changes
	const handleTabChange = (_, newValue) => {
		setActiveTab(newValue);
		setPage(1);
	};

	const handlePageChange = (_, value) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	/**
	 * Pagination Logic
	 * Wrapped in useMemo so it only recalculates when data, page, or tab changes.
	 */
	const { paginatedData, totalPages } = useMemo(() => {
		const currentData = state.data[activeTab] || [];
		const total = Math.ceil(currentData.length / ShowsPerPage);
		const sliced = currentData.slice((page - 1) * ShowsPerPage, page * ShowsPerPage);
		return { paginatedData: sliced, totalPages: total };
	}, [state.data, activeTab, page, ShowsPerPage]);

	// UI Conditionals
	if (isConfiguring)
		return (
			<div className='text-center text-light mt-5'>
				<LoadingSpinner /> <h3>Loading...</h3>
			</div>
		);

	if (state.error)
		return (
			<div className='text-center text-light mt-5'>
				<h3 className='text-danger'>Error loading shows!</h3>
				<p>{state.error}</p>
			</div>
		);

	const config = TABS_CONFIG[activeTab];
	const isLoading = state.loading[activeTab];

	return (
		<section className='container my-5'>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', color: 'tertiary' }}>
				<FormControl sx={{ width: 120, color: 'tertiary' }}>
					<InputLabel
						sx={{
							color: 'tertiary.main',
							'&.Mui-focused': { color: 'tertiary.main' },
						}}
						id='shows-per-page-select-label'
					>
						Shows per page
					</InputLabel>
					<Select
						labelId='shows-per-page-select-label'
						id='shows-per-page-select'
						value={ShowsPerPage}
						label='Shows per page'
						onChange={handleShowsPerPageChange}
						sx={{
							color: 'tertiary.main',
							'.MuiOutlinedInput-notchedOutline': { borderColor: 'tertiary.main' },
							'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'tertiary.main' },
							'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'tertiary.main' },
							'.MuiSvgIcon-root': { color: 'tertiary.main' },
						}}
						MenuProps={{
							PaperProps: {
								sx: {
									bgcolor: '#333',
									color: '#ddd',
									'& .MuiMenuItem-root': {
										'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
										'&.Mui-selected': { bgcolor: 'tertiary.main', color: '#000' },
										'&.Mui-selected:hover': { bgcolor: 'tertiary.main' },
									},
								},
							},
						}}
					>
						<MenuItem value={5}>5</MenuItem>
						<MenuItem value={10}>10</MenuItem>
						<MenuItem value={15}>15</MenuItem>
						<MenuItem value={20}>20</MenuItem>
					</Select>
				</FormControl>
			</Box>
			<Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					variant='fullWidth'
					textColor='inherit'
					indicatorColor='primary'
					sx={{
						'& .MuiTab-root': { color: '#aaa', minHeight: '64px' },
						'& .Mui-selected': { color: '#fff' },
					}}
				>
					{Object.entries(TABS_CONFIG).map(([key, item]) => (
						<Tab
							key={key}
							value={key}
							label={
								<span>
									<i className={`${item.icon} ${item.color.startsWith('text-') ? item.color : ''}`} style={!item.color.startsWith('text-') ? { color: item.color } : {}}></i>{' '}
									{item.label}
								</span>
							}
						/>
					))}
				</Tabs>
			</Box>

			<TabPanel value={activeTab} index={activeTab}>
				{config.refreshable && (
					<button type='button' className='btn btn-success d-flex mx-auto mb-3' onClick={() => fetchData(activeTab, true)}>
						<span className='bi-arrow-repeat'>&nbsp;Refresh Shows</span>
					</button>
				)}

				{isLoading ?
					<div className='text-center mt-5'>
						<h3>
							<LoadingSpinner /> Loading...
						</h3>
					</div>
				: paginatedData.length > 0 ?
					<>
						<div className='d-flex flex-wrap justify-content-center'>
							{paginatedData.map((show) => (
								<ShowCard key={show.id} show={show} />
							))}
						</div>
						{totalPages > 1 && (
							<Stack spacing={2} className='mt-4' alignItems='center'>
								<Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' sx={{ '& .MuiPaginationItem-root': { color: '#fff' } }} />
							</Stack>
						)}
					</>
				:	<h3 className={`text-center mt-5 ${config.color.startsWith('text-') ? config.color : ''}`}>{config.empty}</h3>}
			</TabPanel>

			<div className='text-end mt-3 me-5'>
				<a className='text-info text-decoration-none' href='/explore'>
					Discover <strong>NEW</strong> Content? <br />
					Go to &nbsp;
					<strong>
						<i className='bi-search-heart'></i> Explore
					</strong>
				</a>
			</div>
		</section>
	);
}
