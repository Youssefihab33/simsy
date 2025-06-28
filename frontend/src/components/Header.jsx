import React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FiberNewIcon from '@mui/icons-material/FiberNew';

const pages = ['Home', 'Explore'];
const settings = ['Profile', 'Dashboard', 'Logout'];

import { useContext } from 'react';
import { UserContext } from './APIs/Context';

export default function Header() {
	const userData = useContext(UserContext);
	const [anchorElNav, setAnchorElNav] = React.useState(null);
	const [anchorElUser, setAnchorElUser] = React.useState(null);

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

	return (
		<>
			<AppBar position='sticky'>
				<Container maxWidth='xl' className='glassy rounded-0'>
					<Toolbar disableGutters>
						<FiberNewIcon sx={{ color:'var(--color1)', opacity:'50%', display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						<Typography
							variant='h6'
							noWrap
							component='a'
							href='/'
							sx={{
								backgroundcolor: "primary",
								backgroundImage: `linear-gradient(90deg, var(--color1), var(--color2), var(--color3))`,
								backgroundSize: "100%",
								backgroundRepeat: "repeat",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								mr: 2,
								display: { xs: 'none', md: 'flex' },
								fontFamily: 'monospace',
								fontWeight: 700,
								fontStyle: 'italic',
								letterSpacing: '.3rem',
								color: 'inherit',
								textDecoration: 'none',
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
									<MenuItem key={page} onClick={handleCloseNavMenu}>
										<Typography sx={{ textAlign: 'center' }}>{page}</Typography>
									</MenuItem>
								))}
							</Menu>
						</Box>
						<FiberNewIcon sx={{ color:'primary', display: { xs: 'flex', md: 'none' }, mr: 1 }} />
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
								<Button key={page} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
									{page}
								</Button>
							))}
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
									<MenuItem key={setting} onClick={handleCloseUserMenu}>
										<Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
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

// Remember to add  if request.path == url bg-white rounded-pill opacity-50 endif
// function Header() {
// 	return (
// 		<header className='container d-flex flex-lg-row flex-column'>
// 			<img id='logo' className='navbar-brand' src='/logo.png' />

// 			<nav className='navbar navbar-expand navbar-dark my-3 my-xl-0'>
// 				<ul className='navbar-nav glassy'>
// 					<a href='/' className='nav-link'>
// 						<i className='bi-house'></i>
// 						Home
// 					</a>

// 					<li href=' url ' className='nav-link'>
// 						<i className='bi-search-heart'></i>
// 						Explore
// 					</li>

// 					<li href=' url ' className='nav-link'>
// 						<i className='bi-moon-stars-fill'></i>
// 						Fantasy
// 					</li>

// 					<li href=' url ' className='nav-link'>
// 						<i className='bi-magic'></i>
// 						Luck
// 					</li>
// 					<li href='/admin' className='nav-link d-sm-block d-none'>
// 						<i className='bi-person-gear'></i>
// 						Admin
// 					</li>

// 					<li href=' url ' className='nav-link'>
// 						<img className='rounded-circle' src='/PP' />
// 						Name
// 					</li>

// 					<a href='/login/' className='nav-link'>
// 						<i className='bi-person'></i>
// 						Profile
// 					</a>
// 				</ul>
// 			</nav>

// 			<input
// 				id='searchbar'
// 				className='glassy'
// 				// value={'SOME KIND OF A SHOW'}
// 				placeholder='Show, Artist, anything....'
// 				type='search'
// 				dir='ltr'
// 				spellCheck={false}
// 				autoCorrect='off'
// 				autoComplete='off'
// 				autoCapitalize='off'
// 				maxLength='2048'
// 				tabIndex='1'
// 			/>
// 		</header>
// 	);
// }
