import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, Link, FormControlLabel, Checkbox } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

function LoginPanel() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleUsernameChange = (event) => {
		setUsername(event.target.value);
	};

	const handlePasswordChange = (event) => {
		setPassword(event.target.value);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		// Here you would typically handle the login logic,
		// such as sending the username and password to a server.
		console.log('Login submitted:', { username, password });
		// Reset the form after submission (optional)
		setUsername('');
		setPassword('');
	};

	return (
		<ThemeProvider theme={defaultTheme}>
			<Container component='main' maxWidth='xs' className='container container-login glassy'>
				<Box
					sx={{
						// marginTop: 8,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<LockOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
					<Typography component='h1' variant='h5'>
						Sign in
					</Typography>
					<Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
						<TextField
							margin='normal'
							required
							fullWidth
							id='username'
							label='Username'
							name='username'
							autoComplete='username'
							autoFocus
							value={username}
							onChange={handleUsernameChange}
						/>
						<TextField
							margin='normal'
							required
							fullWidth
							name='password'
							label='Password'
							type='password'
							id='password'
							autoComplete='current-password'
							value={password}
							onChange={handlePasswordChange}
						/>
						<FormControlLabel control={<Checkbox value='remember' color='primary' />} label='Remember me' />
						<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
							Sign In
						</Button>
						<Grid container>
							<Grid item xs>
								<Link href='#' variant='body2'>
									Forgot password?
								</Link>
							</Grid>
							<Grid item>
								<Link href='#' variant='body2'>
									{"Don't have an account? Sign Up"}
								</Link>
							</Grid>
						</Grid>
					</Box>
				</Box>
				{/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
			</Container>
		</ThemeProvider>
	);
}

// function Copyright(props) {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center" {...props}>
//       {'Copyright © '}
//       <Link color="inherit" href="https://your-website.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }

export default LoginPanel;

// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';

export function Login() {
	return (
		<section class='container container-login glassy text-center'>
			<h1>Login</h1>
			<form>
				{/* <TextField id='username' label='Username' variant='outlined' />
				<TextField id='password' label='Password' variant='outlined' /> */}
				<TextField required id='username' label='Username' />
				<br></br>
				{/* <TextField disabled id='outlined-disabled' label='Disabled' defaultValue='Hello World' /> */}
				<TextField required id='password' label='Password' type='password' autoComplete='current-password' />
			</form>
		</section>
	);
}
