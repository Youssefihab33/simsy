import { Container, TextField, Button, Typography, Box, Grid, Link, FormControlLabel, Checkbox } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function LoginPanel() {
	const navigate = useNavigate();
	const { handleSubmit, control } = useForm();

	const submission = (data) => {
		axiosInstance
			.post('/login/', { username: data.username, password: data.password })
			.then((response) => {
				localStorage.setItem('token', response.data.token);
				alert('Login successful!');
				navigate('/');
			})
			.catch((error) => {
				alert('Login failed! Please check your credentials.');
			});
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
						{localStorage.getItem('token') ? <span>Already logged in</span> : <span>Login</span>}
					</Typography>
					{!localStorage.getItem('token') && (
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
										type='password'
										required
										fullWidth
										autoComplete='password'
										autoFocus
									/>
								)}
							/>
							<FormControlLabel control={<Checkbox value='remember' onChange={onchange} color='primary' />} label='Remember me' />
							<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
								Sign In
							</Button>

							<Grid container>
								{/* <Grid item xs>
                                <Link href='#' variant='body2'>
                                    Forgot password?
                                </Link>
                            </Grid> */}
								<Grid item>
									<Link href='/register/' variant='body2'>
										{"Don't have an account? Sign Up"}
									</Link>
								</Grid>
							</Grid>
						</form>
					)}
				</Box>
			</Container>
		</ThemeProvider>
	);
}
