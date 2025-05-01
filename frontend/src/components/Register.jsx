import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, Link, FormControlLabel, Checkbox } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';

const defaultTheme = createTheme();

export default function RegisterPanel() {
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm();

	const submission = (data) => {
		console.log(data);
		// Basic password confirmation check (you might want more robust validation)
		if (data.password !== data.password2) {
			alert('Passwords do not match!'); // Simple error handling
			return; // Stop submission
		} else {
			// When Submitted
			axiosInstance.post('/register/', { username: data.username, password: data.password }).then((response) => {
				console.log(response);
			});
		}
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
					<Typography component='h3' variant='h3'>
						Register
					</Typography>
					<form onSubmit={handleSubmit(submission)} noValidate sx={{ mt: 1 }}>
						<Controller
							name='username'
							control={control}
							rules={{ required: 'Username is required!' }}
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									label='Username'
									variant='outlined'
									error={!!error}
									helperText={error ? error.message : ''}
									margin='normal'
									required
									fullWidth
									autoComplete='username'
									autoFocus
								/>
							)}
						/>

						<Controller
							name='password'
							control={control}
							rules={{ required: 'Password is required!' }}
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									label='Password'
									variant='outlined'
									error={!!error}
									helperText={error ? error.message : ''}
									margin='normal'
									required
									fullWidth
									autoComplete='password'
									autoFocus
								/>
							)}
						/>
						<Controller
							name='password2'
							control={control}
							rules={{ required: 'Enter the same password again!' }}
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									label='Password again'
									variant='outlined'
									error={!!error}
									helperText={error ? error.message : ''}
									margin='normal'
									required
									fullWidth
									autoComplete='password'
									autoFocus
								/>
							)}
						/>
						{/* <FormControlLabel control={<Checkbox value='remember' onChange={onchange} color='primary' />} label='Remember me' /> */}
						<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
							Sign In
						</Button>

						{/* <Grid container>
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
						</Grid> */}
					</form>
				</Box>
			</Container>
		</ThemeProvider>
	);
}
