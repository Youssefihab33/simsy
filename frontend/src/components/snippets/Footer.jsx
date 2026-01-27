import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, Stack } from '@mui/material';
import {
	GitHub,
	Twitter,
	LinkedIn,
	Instagram,
	Favorite,
	Person,
	History,
	Cake,
	Email,
	Info,
	Security,
	Description,
} from '@mui/icons-material';
import { UserContext } from '../APIs/Context';

export default function Footer() {
	const currentYear = new Date().getFullYear();
	const { user } = useContext(UserContext);

	const lastLogin = user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A';
	const joinDate = user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A';

	const getDaysUntilBirthday = (birthdayStr) => {
		if (!birthdayStr) return null;
		const today = new Date();
		const birthday = new Date(birthdayStr);
		birthday.setFullYear(today.getFullYear());
		if (today > birthday) birthday.setFullYear(today.getFullYear() + 1);
		const diffInMs = birthday - today;
		return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
	};

	const daysTillBirthday = getDaysUntilBirthday(user?.birthday);

	return (
		<Box
			component='footer'
			sx={{
				mt: 8,
				py: 6,
				background: 'rgba(10, 10, 10, 0.4)',
				backdropFilter: 'blur(12px)',
				borderTop: '1px solid rgba(255, 255, 255, 0.08)',
				color: 'rgba(255, 255, 255, 0.6)',
			}}
		>
			<Container maxWidth='lg'>
				<Grid container spacing={4}>
					{/* Brand Section */}
					<Grid item xs={12} md={4}>
						<Typography variant='h6' color='white' sx={{ fontWeight: 700, letterSpacing: '2px', mb: 2 }}>
							SIMSY
						</Typography>
						<Typography variant='body2' sx={{ mb: 3, maxWidth: 300 }}>
							Elevating your entertainment experience with a modern, personalized touch. Join the community and discover more.
						</Typography>
						<Stack direction='row' spacing={1}>
							<IconButton size='small' color='inherit' sx={{ '&:hover': { color: 'primary.main' } }}>
								<GitHub fontSize='small' />
							</IconButton>
							<IconButton size='small' color='inherit' sx={{ '&:hover': { color: '#1DA1F2' } }}>
								<Twitter fontSize='small' />
							</IconButton>
							<IconButton size='small' color='inherit' sx={{ '&:hover': { color: '#E4405F' } }}>
								<Instagram fontSize='small' />
							</IconButton>
						</Stack>
					</Grid>

					{/* Navigation Links */}
					<Grid item xs={6} md={2}>
						<Typography variant='subtitle1' color='white' sx={{ fontWeight: 600, mb: 2 }}>
							Explore
						</Typography>
						<Stack spacing={1}>
							<Link component={RouterLink} to='/' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Home
							</Link>
							<Link component={RouterLink} to='/explore' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Discover
							</Link>
							<Link component={RouterLink} to='/profile' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Account
							</Link>
						</Stack>
					</Grid>

					<Grid item xs={6} md={2}>
						<Typography variant='subtitle1' color='white' sx={{ fontWeight: 600, mb: 2 }}>
							Legal
						</Typography>
						<Stack spacing={1}>
							<Link href='#' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Privacy
							</Link>
							<Link href='#' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Terms
							</Link>
							<Link href='#' color='inherit' underline='none' sx={{ '&:hover': { color: 'white' } }}>
								Help
							</Link>
						</Stack>
					</Grid>

					{/* User Personalization Section */}
					<Grid item xs={12} md={4}>
						{user ?
							<Box className='glassy' sx={{ p: 2, borderRadius: '16px !important' }}>
								<Typography variant='subtitle2' color='white' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
									<Person fontSize='small' color='secondary' /> {user.username}
								</Typography>
								<Stack spacing={1.5}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<History sx={{ fontSize: 16, color: 'tertiary.main' }} />
										<Typography variant='caption'>Logged in: {lastLogin}</Typography>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Security sx={{ fontSize: 16, color: 'secondary.main' }} />
										<Typography variant='caption'>Member since: {joinDate}</Typography>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Cake sx={{ fontSize: 16, color: 'primary.main' }} />
										<Typography variant='caption'>
											{daysTillBirthday !== null ? `${daysTillBirthday} days until your birthday!` : 'Join the celebration!'}
										</Typography>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Email sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
										<Typography variant='caption' sx={{ opacity: 0.8 }}>
											{user.email}
										</Typography>
									</Box>
								</Stack>
							</Box>
						:	<Box sx={{ p: 2, textAlign: 'center' }}>
								<Typography variant='body2' sx={{ fontStyle: 'italic' }}>
									Login to see your personalized stats!
								</Typography>
								<Link component={RouterLink} to='/login' color='primary' sx={{ fontWeight: 'bold', mt: 1, display: 'inline-block' }}>
									Get Started
								</Link>
							</Box>
						}
					</Grid>
				</Grid>

				<Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
					<Typography variant='caption'>
						© {currentYear} SIMSY. Built with <Favorite sx={{ fontSize: 12, color: 'primary.main', verticalAlign: 'middle' }} /> for enthusiasts.
					</Typography>
					<Typography variant='caption' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						Enjoy your time here! ❤️
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
