import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, TextField, InputAdornment, Popper, Paper, List, ListItem, ListItemText, CircularProgress, ClickAwayListener, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import VideoStableIcon from '@mui/icons-material/VideoStable';

import { UserContext } from '../APIs/Context';
import axiosInstance from '../APIs/Axios';
import SearchHorizontalCard from './SearchHorizontalCard';

const pages = [
	{ name: 'Home', path: '/' },
	{ name: 'Explore', path: '/explore' },
];
const settings = [
	{ name: 'Profile', path: '/profile' },
	{ name: 'Dashboard', path: '/dashboard' },
];

const LogoComponent = ({ screen = 'large' }) => {
	let displayProp = { xs: screen === 'small' ? 'flex' : 'none', md: screen === 'large' ? 'flex' : 'none' };
	return (
		<Box component={Link} to='/' sx={{ display: displayProp, alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: screen === 'small' ? 1 : 0 }}>
			<VideoStableIcon sx={{ display: displayProp, mr: 1 }} />
			<Typography
				variant={screen === 'large' ? 'h6' : 'h5'}
				noWrap
				sx={{
					mr: 2,
					display: displayProp,
					fontFamily: 'monospace',
					fontWeight: 700,
					letterSpacing: '.3rem',
					color: 'inherit',
					textDecoration: 'none',
				}}
			>
				SIMSY
			</Typography>
		</Box>
	);
};

export default function Header() {
	const { user, logout } = useContext(UserContext);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	const [anchorElNav, setAnchorElNav] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);

	// Search states
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [loadingSearch, setLoadingSearch] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const searchRef = useRef(null);
	const mobileSearchRef = useRef(null);

	const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
	const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
	const handleCloseNavMenu = () => setAnchorElNav(null);
	const handleCloseUserMenu = () => setAnchorElUser(null);

	const handleLogout = () => {
		handleCloseUserMenu();
		logout();
	};

	// Debounced search logic
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			setShowResults(false);
			return;
		}

		const delayDebounceFn = setTimeout(async () => {
			setLoadingSearch(true);
			setShowResults(true);
			try {
				const response = await axiosInstance.get(`api/search/${searchQuery}/`);
				setSearchResults(response.data.results || []);
			} catch (error) {
				console.error('Search error:', error);
				setSearchResults([]);
			} finally {
				setLoadingSearch(false);
			}
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery]);

	const handleResultClick = (result) => {
		setSearchQuery('');
		setShowResults(false);
		const pathMap = {
			show: `/show/${result.id}`,
			artist: `/artist/${result.id}`,
			country: `/country/${result.id}`,
			language: `/language/${result.id}`,
			genre: `/genre/${result.id}`,
			label: `/label/${result.id}`,
			rating: `/rating/${result.id}`,
			user: `/profile`, // Assuming we go to profile for users
		};
		navigate(pathMap[result.result_type] || '/');
	};

	return (
		<AppBar
			position='sticky'
			sx={{
				background: 'rgba(10, 10, 10, 0.4)',
				backdropFilter: 'blur(12px)',
				borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
				top: 0,
				zIndex: 1100,
			}}
			elevation={0}
		>
			<Container maxWidth='xl'>
				<Toolbar disableGutters>
					{/* Large Screen Logo */}
					<LogoComponent screen='large' />

					{/* Small Screen Menu Icon */}
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar' aria-haspopup='true' onClick={handleOpenNavMenu} color='inherit'>
							<MenuIcon />
						</IconButton>
						<Menu
							id='menu-appbar'
							anchorEl={anchorElNav}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
							keepMounted
							transformOrigin={{ vertical: 'top', horizontal: 'left' }}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{ display: { xs: 'block', md: 'none' } }}
						>
							{pages.map((page) => (
								<MenuItem key={page.name} onClick={handleCloseNavMenu} component={Link} to={page.path}>
									<Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Small Screen Logo */}
					<LogoComponent screen='small' />

					{/* Large Screen Navigation Items */}
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{pages.map((page) => (
							<Button key={page.name} onClick={handleCloseNavMenu} component={Link} to={page.path} sx={{ my: 2, color: 'white', display: 'block' }}>
								{page.name}
							</Button>
						))}
					</Box>

					{/* Search Bar (Visible only when logged in) */}
					{user && (
						<Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2, position: 'relative' }} ref={searchRef}>
							<TextField
								size='small'
								placeholder='Search...'
								variant='outlined'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onFocus={() => searchQuery && setShowResults(true)}
								sx={{
									backgroundColor: 'rgba(255, 255, 255, 0.05)',
									borderRadius: '12px',
									width: '250px',
									transition: 'width 0.3s',
									'&:focus-within': { width: '350px' },
									'& .MuiOutlinedInput-root': {
										color: 'white',
										'& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
										'&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
									},
								}}
								InputProps={{
									sx: { borderRadius: '12px' },
									startAdornment: (
										<InputAdornment position='start'>
											<SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
										</InputAdornment>
									),
									endAdornment: loadingSearch && (
										<InputAdornment position='end'>
											<CircularProgress size={20} color='inherit' />
										</InputAdornment>
									),
								}}
							/>

							<Popper open={showResults && !isMobile} anchorEl={searchRef.current} placement='bottom-start' sx={{ zIndex: 1300, width: '45vw', maxWidth: '600px', mt: 1 }}>
								<ClickAwayListener onClickAway={() => setShowResults(false)}>
									<Paper
										sx={{
											background: 'rgba(15, 15, 15, 0.95)',
											backdropFilter: 'blur(20px)',
											border: '1px solid rgba(255, 255, 255, 0.1)',
											borderRadius: '16px',
											maxHeight: '450px',
											overflow: 'auto',
											boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
											p: 1,
										}}
									>
										<List sx={{ p: 0 }}>
											{searchResults.length > 0 ? (
												searchResults.map((result, index) => (
													<SearchHorizontalCard
														key={`${result.result_type}-${result.id}-${index}`}
														result={result}
														onClick={handleResultClick}
													/>
												))
											) : (
												!loadingSearch && (
													<ListItem>
														<ListItemText primary='No results found' sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }} />
													</ListItem>
												)
											)}
										</List>
									</Paper>
								</ClickAwayListener>
							</Popper>
						</Box>
					)}

					{/* Auth Section */}
					{!user ?
						<Box sx={{ flexGrow: 0, display: 'flex' }}>
							<Button component={Link} to='/login' sx={{ color: 'white' }}>
								Login
							</Button>
							<Button component={Link} to='/register' color='primary' variant='contained' sx={{ ml: 1 }}>
								Sign Up
							</Button>
						</Box>
					:	<Box sx={{ flexGrow: 0 }}>
							<Tooltip title='Open settings'>
								<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
									<Avatar alt={user.username} src={user.profile_picture} />
								</IconButton>
							</Tooltip>
							<Menu
								sx={{ mt: '45px' }}
								id='menu-appbar'
								anchorEl={anchorElUser}
								anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
								keepMounted
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								open={Boolean(anchorElUser)}
								onClose={handleCloseUserMenu}
							>
								{settings.map((setting) => (
									<MenuItem key={setting.name} onClick={handleCloseUserMenu} component={Link} to={setting.path}>
										<Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
									</MenuItem>
								))}
								<MenuItem onClick={handleLogout}>
									<Typography sx={{ textAlign: 'center', color: 'error.main' }}>Logout</Typography>
								</MenuItem>
							</Menu>
						</Box>
					}
				</Toolbar>

				{/* Mobile Search Bar */}
				{user && (
					<Box sx={{ display: { xs: 'flex', md: 'none' }, pb: 2, position: 'relative' }} ref={mobileSearchRef}>
						<TextField
							fullWidth
							size='small'
							placeholder='Search...'
							variant='outlined'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={() => searchQuery && setShowResults(true)}
							sx={{
								backgroundColor: 'rgba(255, 255, 255, 0.15)',
								borderRadius: '12px',
								'& .MuiOutlinedInput-root': {
									color: 'white',
									borderRadius: '12px',
									'& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
								},
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<SearchIcon sx={{ color: 'white' }} />
									</InputAdornment>
								),
								endAdornment: loadingSearch && (
									<InputAdornment position='end'>
										<CircularProgress size={20} color='inherit' />
									</InputAdornment>
								),
							}}
						/>
						{/* Mobile results popup */}
						<Popper open={showResults && isMobile} anchorEl={mobileSearchRef.current} placement='bottom' sx={{ zIndex: 1300, width: 'calc(100vw - 32px)', mt: 1 }}>
							<ClickAwayListener onClickAway={() => setShowResults(false)}>
								<Paper
									sx={{
										background: 'rgba(15, 15, 15, 0.98)',
										backdropFilter: 'blur(20px)',
										border: '1px solid rgba(255, 255, 255, 0.1)',
										borderRadius: '16px',
										maxHeight: '60vh',
										overflow: 'auto',
										boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
										p: 1,
									}}
								>
									<List sx={{ p: 0 }}>
										{searchResults.length > 0 ? (
											searchResults.map((result, index) => (
												<SearchHorizontalCard
													key={`${result.result_type}-${result.id}-${index}`}
													result={result}
													onClick={handleResultClick}
												/>
											))
										) : (
											!loadingSearch && (
												<ListItem>
													<ListItemText primary='No results found' sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }} />
												</ListItem>
											)
										)}
									</List>
								</Paper>
							</ClickAwayListener>
						</Popper>
					</Box>
				)}
			</Container>
		</AppBar>
	);
}
