import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Box, Tabs, Tab, Pagination, Stack, InputLabel, MenuItem, FormControl, Select, Container, Typography, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
	Star as StarIcon,
	List as ListIcon,
	Whatshot as FireIcon,
	History as HistoryIcon,
	AutoAwesome as MagicIcon,
	Refresh as RefreshIcon,
	Favorite as FavoriteIcon,
} from '@mui/icons-material';
import axiosInstance from './APIs/Axios';
import { UserContext } from './APIs/Context';
import ShowCard from './snippets/cards/ShowCard';
import LoadingSpinner from './snippets/LoadingSpinner';
import { useTitle } from 'react-use';

// Configuration: Add or remove tabs here without touching the JSX logic
const TABS_CONFIG = {
	favorites: { label: 'Favorites', icon: <StarIcon />, color: '#ffc107', endpoint: '/shows/favorites/', empty: 'No favorites yet!' },
	watchlist: { label: 'Watchlist', icon: <ListIcon />, color: '#0dcaf0', endpoint: '/shows/watchlist/', empty: 'No watchlist items yet!' },
	new: { label: 'New', icon: <FireIcon />, color: '#9a0606', endpoint: '/shows/new/', empty: 'No new shows available.' },
	history: { label: 'History', icon: <HistoryIcon />, color: '#54a9de', endpoint: '/shows/history/', empty: 'No history items yet!' },
	random: { label: 'For You', icon: <MagicIcon />, color: '#5dd95d', endpoint: '/shows/random/', empty: 'No random shows available.', refreshable: true },
};

const TabPanel = ({ children, value, index }) => (
	<Box role='tabpanel' hidden={value !== index} sx={{ py: 3 }}>
		{value === index && children}
	</Box>
);

export default function Homepage() {
	const { user, setUser } = useContext(UserContext);
	const [activeTab, setActiveTab] = useState('new');
	const [page, setPage] = useState(1);
	const [isConfiguring, setIsConfiguring] = useState(true);
	const [ShowsPerPage, setShowsPerPage] = useState(user?.shows_per_page || 10);
	useTitle(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - Home - SIMSY`)

	const handleShowsPerPageChange = async (event) => {
		const newVal = event.target.value;
		setShowsPerPage(newVal);
		try {
			const response = await axiosInstance.put(`/users/current/`, {
				shows_per_page: newVal,
			});
			setUser(response.data);
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
		if (user?.home_tab && TABS_CONFIG[user.home_tab]) {
			setActiveTab(user.home_tab);
		}
		setIsConfiguring(false);
	}, [user?.home_tab]);

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

	const { paginatedData, totalPages } = useMemo(() => {
		const currentData = state.data[activeTab] || [];
		const total = Math.ceil(currentData.length / ShowsPerPage);
		const sliced = currentData.slice((page - 1) * ShowsPerPage, page * ShowsPerPage);
		return { paginatedData: sliced, totalPages: total };
	}, [state.data, activeTab, page, ShowsPerPage]);

	// UI Conditionals
	if (isConfiguring)
		return (
			<Box sx={{ textAlign: 'center', color: 'white', mt: 10 }}>
				<LoadingSpinner />
				<Typography variant='h5' sx={{ mt: 2 }}>Loading...</Typography>
			</Box>
		);

	if (state.error)
		return (
			<Box sx={{ textAlign: 'center', color: 'white', mt: 10 }}>
				<Typography variant='h4' color='error'>Error loading shows!</Typography>
				<Typography>{String(state.error)}</Typography>
			</Box>
		);

	const config = TABS_CONFIG[activeTab];
	const isLoading = state.loading[activeTab];

	return (
		<Container maxWidth='xl' sx={{ my: 5 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
				<FormControl sx={{ minWidth: 150 }}>
					<InputLabel id='shows-per-page-label' sx={{ color: 'rgba(255,255,255,0.7)' }}>Shows per page</InputLabel>
					<Select
						labelId='shows-per-page-label'
						value={ShowsPerPage}
						label='Shows per page'
						onChange={handleShowsPerPageChange}
						sx={{
							color: 'white',
							'.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
							'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
							'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#54a9de' },
							'.MuiSvgIcon-root': { color: 'white' },
						}}
					>
						{[5, 10, 15, 20].map((val) => (
							<MenuItem key={val} value={val}>{val}</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			<Box sx={{ width: '100%', borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					variant='fullWidth'
					textColor='inherit'
					sx={{
						'& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', minHeight: '64px', fontSize: '1rem' },
						'& .Mui-selected': { color: 'white' },
						'& .MuiTabs-indicator': { backgroundColor: config.color },
					}}
				>
					{Object.entries(TABS_CONFIG).map(([key, item]) => (
						<Tab
							key={key}
							value={key}
							label={
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									{item.icon}
									<Typography variant='body1' sx={{ fontWeight: 'bold' }}>{item.label}</Typography>
								</Box>
							}
							sx={{ '& .MuiSvgIcon-root': { color: item.color } }}
						/>
					))}
				</Tabs>
			</Box>

			<TabPanel value={activeTab} index={activeTab}>
				{config.refreshable && (
					<Button
						variant='contained'
						color='success'
						startIcon={<RefreshIcon />}
						onClick={() => fetchData(activeTab)}
						sx={{ display: 'flex', mx: 'auto', mb: 3 }}
					>
						Refresh Shows
					</Button>
				)}

				{isLoading ?
					<Box sx={{ textAlign: 'center', mt: 5, color: 'white' }}>
						<LoadingSpinner />
						<Typography variant='h5' sx={{ mt: 2 }}>Loading...</Typography>
					</Box>
				: paginatedData.length > 0 ?
					<>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
							{paginatedData.map((show) => (
								<ShowCard key={show.id} show={show} />
							))}
						</Box>
						{totalPages > 1 && (
							<Stack spacing={2} sx={{ mt: 4 }} alignItems='center'>
								<Pagination
									count={totalPages}
									page={page}
									onChange={handlePageChange}
									color='primary'
									sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
								/>
							</Stack>
						)}
					</>
				:	<Typography variant='h4' sx={{ textAlign: 'center', mt: 5, color: config.color }}>{config.empty}</Typography>}
			</TabPanel>

			<Box sx={{ textAlign: 'right', mt: 3, mr: { md: 5 } }}>
				<Link
					component={RouterLink}
					to='/explore'
					sx={{
						color: '#54a9de',
						textDecoration: 'none',
						'&:hover': { textDecoration: 'underline' },
						display: 'inline-block',
					}}
				>
					<Typography variant='body1'>
						Discover <strong>NEW</strong> Content?
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, fontWeight: 'bold' }}>
						<FavoriteIcon fontSize='small' /> Explore
					</Box>
				</Link>
			</Box>
		</Container>
	);
}
