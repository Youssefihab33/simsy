import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, TextField, InputAdornment } from '@mui/material'; // Import InputAdornment
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import FiberNewIcon from '@mui/icons-material/FiberNew';

import { UserContext } from './APIs/Context';

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
	const [searchTerm, setSearchTerm] = useState('');

	const { first_name, last_name, profile_picture } = userData || {};

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
		setSearchTerm(event.target.value);
	};

	const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
        console.log('Searching for:', searchTerm);
        // Here you would typically navigate to a search results page
        // or trigger a search API call.
        // Example: navigate('/search?q=' + searchTerm);
    }
};

	return (
		<>
			<AppBar position='sticky'>
				<Container maxWidth='xl' className='glassy rounded-0'>
					<Toolbar disableGutters>
						<FiberNewIcon sx={{ color: 'var(--color1)', opacity: '50%', display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						<Typography
							variant='h6'
							noWrap
							component='a'
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
						<FiberNewIcon sx={{ color: 'primary', display: { xs: 'flex', md: 'none' }, mr: 1 }} />
						<Typography
							variant='h5'
							noWrap
							component='a'
							href='/'
							sx={{
								mr: 2,
								display: { xs: 'flex', md: 'none' },
								flexGrow: 1,
								fontFamily: 'monospace',
								fontWeight: 700,
								letterSpacing: '.3rem',
								color: 'inherit',
								textDecoration: 'none',
							}}
						>
							SIMSY
						</Typography>
						<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
							{pages.map((page) => (
								<Button key={page.name} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }} component={Link} to={page.path}>
									{' '}
									{/* Modified */}
									{page.name}
								</Button>
							))}
						</Box>

						{/* Search Bar */}
						<Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
							<TextField
								variant='outlined'
								size='small'
								placeholder='Search...'
								value={searchTerm}
								onChange={handleSearchChange}
								onKeyDown={handleSearchSubmit}
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
						</Box>

						<Box sx={{ flexGrow: 0 }}>
							<Tooltip title='Open settings'>
								<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
									{userData ? <Avatar alt={`${first_name} ${last_name}`} src={import.meta.env.VITE_BACKEND_URL + profile_picture} /> : <Avatar alt='Loading...' />}
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
					</Toolbar>
				</Container>
			</AppBar>
		</>
	);
}
