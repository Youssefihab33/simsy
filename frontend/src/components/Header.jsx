import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Button,
	Tooltip,
	MenuItem,
	TextField,
	InputAdornment,
	Popper,
	Paper,
	ClickAwayListener,
	CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import VideoStableIcon from '@mui/icons-material/VideoStable';

import { UserContext } from './APIs/Context';
import axiosInstance from './APIs/Axios';

const pages = [
	{ name: 'Home', path: '/' },
	{ name: 'Explore', path: '/explore' },
];
const settings = [
	{ name: 'Profile', path: '/profile' },
	{ name: 'Dashboard', path: '/dashboard' },
	{ name: 'Logout', path: '/logout' },
];

export default function Header() {
	const userData = useContext(UserContext);
	const [anchorElNav, setAnchorElNav] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);
	const [anchorElDropdown, setAnchorElDropdown] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const navigate = useNavigate();
	const { first_name, last_name, profile_picture } = userData || {};

	// Debounce search effect
	useEffect(() => {
		if (searchTerm === '') {
			setIsDropdownOpen(false);
			setSearchResults([]);
			return;
		} else if (searchTerm.length < 3) {
			setIsDropdownOpen(true);
			setSearchResults([]);
			return;
		}

		// Set a timer to wait for the user to stop typing
		const delayDebounceFn = setTimeout(() => {
			setIsLoading(true);
			axiosInstance
				.get(`shows/search/${encodeURIComponent(searchTerm)}/`)
				.then((response) => {
					if (response.status != 200) {
						throw new Error('Network response was not Successful');
					}
					return response.data;
				})
				.then((data) => {
					setSearchResults(data.results);
					setIsDropdownOpen(true);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('There was a problem with the search fetch operation:', error);
					setSearchResults([]);
					setIsLoading(false);
				});
		}, 500);

		// Cleanup function to clear the timer
		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm]);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const handleSearchChange = (event) => {
		const newSearchTerm = event.target.value;
		setSearchTerm(newSearchTerm);
		if (newSearchTerm) {
			setAnchorElDropdown(event.currentTarget);
		}
	};

	const handleDropdownClickAway = () => {
		setIsDropdownOpen(false);
	};

	const handleResultClick = (result) => {
		setIsDropdownOpen(false);
		setSearchTerm('');
		navigate(`/show/${result.id}`);
	};

	// New handler for toggling mobile search
	const handleToggleMobileSearch = () => {
		setIsMobileSearchOpen(!isMobileSearchOpen);
		if (isMobileSearchOpen) {
			setSearchTerm('');
			setIsDropdownOpen(false);
		}
	};

	return (
		<>
			<AppBar position='sticky'>
				<Container maxWidth='xl' className='glassy rounded-0'>
					<Toolbar disableGutters>
						{/* For Large Screens */}
						<VideoStableIcon sx={{ color: 'var(--color1)', opacity: '50%', display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						<Typography
							variant='h6'
							noWrap
							component='a'
							href='/'
							sx={{
								backgroundcolor: 'primary',
								backgroundImage: `linear-gradient(90deg, var(--color1), var(--color2), var(--color3))`,
								backgroundSize: '100%',
								backgroundRepeat: 'repeat',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								mr: 2,
								display: { xs: 'none', md: 'flex' },
								fontFamily: 'monospace',
								fontWeight: 700,
								fontStyle: 'italic',
								letterSpacing: '.3rem',
								color: 'inherit',
								textDecoration: 'none',
								userSelect: 'none',
							}}
						>
							SIMSY
						</Typography>
						<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
							{pages.map((page) => (
								<Button key={page.name} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }} component={Link} to={page.path}>
									{page.name}
								</Button>
							))}
						</Box>
						{/* Search Bar with Debounced Search (Large Screens) */}
						{userData && (
							<Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto', mr: 3 }}>
								<TextField
									variant='outlined'
									size='small'
									placeholder='Search...'
									value={searchTerm}
									onChange={handleSearchChange}
									color='tertiary'
									sx={{
										minWidth: '200px',
										backgroundColor: 'rgba(255, 255, 255, 0.1)',
										borderRadius: '5px',
										'& .MuiOutlinedInput-root': {
											'& fieldset': {
												borderColor: 'transparent',
											},
											'&:hover fieldset': {
												borderColor: 'rgba(255, 255, 255, 0.5)',
											},
											'&.Mui-focused fieldset': {
												borderColor: 'tertiary',
											},
											color: 'white',
										},
										'& .MuiInputBase-input::placeholder': {
											color: 'rgba(255, 255, 255, 0.7)',
											opacity: 1,
										},
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
											</InputAdornment>
										),
									}}
								/>

								<Popper open={isDropdownOpen} anchorEl={anchorElDropdown} placement='bottom-start' style={{ width: 400, zIndex: 1300 }}>
									<Paper
										sx={{
											mt: 1,
											backgroundColor: 'rgba(255, 255, 255, 0.1)',
											backdropFilter: 'blur(10px)',
											borderRadius: '5px',
											color: 'white',
											overflow: 'hidden',
										}}
									>
										<ClickAwayListener onClickAway={handleDropdownClickAway}>
											<Box
												sx={{
													maxHeight: '300px',
													overflowY: 'auto',
												}}
											>
												{isLoading ? (
													<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
														<CircularProgress size={20} sx={{ color: 'white' }} />
													</Box>
												) : searchResults && searchResults.length > 0 ? (
													searchResults.map((result) => (
														<MenuItem
															key={result.id}
															onClick={() => handleResultClick(result)}
															sx={{
																'&:hover': {
																	backgroundColor: 'rgba(255, 255, 255, 0.2)',
																},
																display: 'block',
															}}
														>
															<Box>
																<Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
																	{result.name}
																</Typography>
																<Typography variant='body2' color='text.secondary' noWrap sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
																	{result.description}
																</Typography>
															</Box>
														</MenuItem>
													))
												) : searchTerm.length < 3 ? (
													<MenuItem>
														<Typography sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>Keep Typing...</Typography>
													</MenuItem>
												) : (
													<MenuItem>
														<Typography sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>No results found</Typography>
													</MenuItem>
												)}
											</Box>
										</ClickAwayListener>
									</Paper>
								</Popper>
							</Box>
						)}
						{/* For Small Screens */}
						<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
							<IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar' aria-haspopup='true' onClick={handleOpenNavMenu} color='inherit'>
								<MenuIcon />
							</IconButton>
							<Menu
								id='menu-appbar'
								anchorEl={anchorElNav}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'left',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'left',
								}}
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
						<VideoStableIcon sx={{ color: 'var(--color1)', display: { xs: 'flex', md: 'none' }, mr: 1 }} />
						<Typography
							variant='h5'
							noWrap
							component='a'
							href='/'
							sx={{
								backgroundcolor: 'primary',
								backgroundImage: `linear-gradient(90deg, var(--color1), var(--color2), var(--color3))`,
								backgroundSize: '100%',
								backgroundRepeat: 'repeat',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								mr: 2,
								display: { xs: 'flex', md: 'none' },
								flexGrow: 1,
								fontFamily: 'monospace',
								fontWeight: 700,
								fontStyle: 'italic',
								letterSpacing: '.3rem',
								color: 'inherit',
								textDecoration: 'none',
								userSelect: 'none',
							}}
						>
							SIMSY
						</Typography>

						{/* Search Icon for small screens */}
						{userData && (
							<Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', mr: 1 }}>
								<IconButton size='large' aria-label='search' color='inherit' onClick={handleToggleMobileSearch}>
									<SearchIcon />
								</IconButton>
							</Box>
						)}

						{/* Common (User Settings) */}
						{userData && (
							<Box sx={{ flexGrow: 0 }}>
								<Tooltip title='Open settings'>
									<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
										{userData ? <Avatar alt={`${first_name} ${last_name}`} src={profile_picture} /> : <Avatar alt='Loading...' />}
									</IconButton>
								</Tooltip>
								<Menu
									sx={{ mt: '45px' }}
									id='menu-appbar'
									anchorEl={anchorElUser}
									anchorOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									keepMounted
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									open={Boolean(anchorElUser)}
									onClose={handleCloseUserMenu}
								>
									{settings.map((setting) => (
										<MenuItem key={setting.name} onClick={handleCloseUserMenu} component={Link} to={setting.path}>
											<Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
										</MenuItem>
									))}
								</Menu>
							</Box>
						)}
					</Toolbar>
					{/* Search Bar for Small Screens (conditionally rendered) */}
					{userData && (
						<Box sx={{ display: { xs: isMobileSearchOpen ? 'flex' : 'none', md: 'none' }, justifyContent: 'center', pb: 1 }}>
							<TextField
								variant='outlined'
								size='small'
								placeholder='Search...'
								value={searchTerm}
								onChange={handleSearchChange}
								color='tertiary'
								sx={{
									minWidth: '200px',
									width: '100%', // Make it full width on small screens
									backgroundColor: 'rgba(255, 255, 255, 0.1)',
									borderRadius: '5px',
									'& .MuiOutlinedInput-root': {
										'& fieldset': {
											borderColor: 'transparent',
										},
										'&:hover fieldset': {
											borderColor: 'rgba(255, 255, 255, 0.5)',
										},
										'&.Mui-focused fieldset': {
											borderColor: 'tertiary',
										},
										color: 'white',
									},
									'& .MuiInputBase-input::placeholder': {
										color: 'rgba(255, 255, 255, 0.7)',
										opacity: 1,
									},
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
										</InputAdornment>
									),
								}}
							/>
							<Popper open={isDropdownOpen} anchorEl={anchorElDropdown} placement='bottom-start' style={{ width: 400, zIndex: 1300 }}>
								{/* Adjust width */}
								<Paper
									sx={{
										mt: 1,
										backgroundColor: 'rgba(255, 255, 255, 0.1)',
										backdropFilter: 'blur(10px)',
										borderRadius: '5px',
										color: 'white',
										overflow: 'hidden',
									}}
								>
									<ClickAwayListener onClickAway={handleDropdownClickAway}>
										<Box
											sx={{
												maxHeight: '300px',
												overflowY: 'auto',
											}}
										>
											{isLoading ? (
												<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
													<CircularProgress size={20} sx={{ color: 'white' }} />
												</Box>
											) : searchResults && searchResults.length > 0 ? (
												searchResults.map((result) => (
													<MenuItem
														key={result.id}
														onClick={() => handleResultClick(result)}
														sx={{
															'&:hover': {
																backgroundColor: 'rgba(255, 255, 255, 0.2)',
															},
															display: 'block',
														}}
													>
														<Box>
															<Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
																{result.name}
															</Typography>
															<Typography variant='body2' color='text.secondary' noWrap sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
																{result.description}
															</Typography>
														</Box>
													</MenuItem>
												))
											) : searchTerm.length < 3 ? (
												<MenuItem>
													<Typography sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>Keep Typing...</Typography>
												</MenuItem>
											) : (
												<MenuItem>
													<Typography sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>No results found</Typography>
												</MenuItem>
											)}
										</Box>
									</ClickAwayListener>
								</Paper>
							</Popper>
						</Box>
					)}
				</Container>
			</AppBar>
		</>
	);
}
