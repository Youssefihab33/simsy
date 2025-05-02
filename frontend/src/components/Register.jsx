import { TextField, Button, Link } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import { useNavigate } from 'react-router-dom';
import AlreadyLoggedIn from './AlreadyLoggedIn.jsx';

const defaultTheme = createTheme();

export default function RegisterPanel() {
	const navigate = useNavigate();
	const { handleSubmit, control } = useForm();

	const submission = (data) => {
		// Basic password confirmation check (you might want more robust validation)
		if (data.password !== data.password2) {
			alert('Passwords do not match!'); // Simple error handling
			return; // Stop submission
		} else {
			// When Submitted
			axiosInstance
				.post('/register/', {
					username: data.username,
					email: data.email,
					password: data.password,
					first_name: data.first_name,
					last_name: data.last_name,
					nickname: data.nickname,
					birthday: data.birthday,
					bio: data.bio,
				})
				.then((response) => {
					axiosInstance
						.post('/login/', { username: data.username, password: data.password })
						.then((response) => {
							localStorage.setItem('token', response.data.token);
							navigate('/');
						})
						.catch((error) => {
							console.error('Login error:', error);
						});
				});
		}
	};

	return (
		<main className='container-sm container-login glassy mx-auto'>
			<div className='d-flex flex-column align-items-center text-center'>
				<h3 style={{ fontSize: '2.5rem', color: '#5DD95D' }}>
					<i className='bi-person-plus'></i>
					{localStorage.getItem('token') ? <AlreadyLoggedIn /> : <span>&nbsp;Register</span>}
				</h3>
				{!localStorage.getItem('token') && (
					<form onSubmit={handleSubmit(submission)}>
						<Controller
							name='email'
							control={control}
							rules={{ required: 'Email is required!' }}
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									label='Email'
									variant='outlined'
									error={!!error}
									helperText={error ? error.message : ''}
									margin='normal'
									type='email'
									required
									fullWidth
									autoComplete='email'
									autoFocus
								/>
							)}
						/>
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
									type='password'
									required
									fullWidth
									autoComplete='password'
								/>
							)}
						/>

						<Controller
							name='first_name'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<TextField {...field} label='First Name' variant='outlined' error={!!error} helperText={error ? error.message : ''} margin='normal' autoComplete='first_name' />
							)}
						/>
						<Controller
							name='last_name'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<TextField {...field} label='Last Name' variant='outlined' error={!!error} helperText={error ? error.message : ''} margin='normal' autoComplete='last_name' />
							)}
						/>
						<Controller
							name='nickname'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<TextField {...field} label='Nickname' variant='outlined' error={!!error} helperText={error ? error.message : ''} margin='normal' autoComplete='nickname' />
							)}
						/>
						<Controller
							name='birthday'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									label='Date of Birth'
									variant='outlined'
									error={!!error}
									helperText={error ? error.message : ''}
									margin='normal'
									type='date'
									fullWidth
									autoComplete='birthday'
								/>
							)}
						/>
						<Controller
							name='bio'
							control={control}
							render={({ field, fieldState: { error } }) => (
								<TextField {...field} label='Bio' variant='outlined' error={!!error} helperText={error ? error.message : ''} margin='normal' fullWidth autoComplete='bio' />
							)}
						/>

						<Button type='submit' fullWidth variant='contained' sx={{ mt: 2, mb: 2 }}>
							Register
						</Button>

						<Link href='/login/'>{'Already have an account? Sign in'}</Link>
					</form>
				)}
			</div>
		</main>
		// 	<ThemeProvider theme={defaultTheme}>
		// 		<Container component='main' maxWidth='sm' className='container container-login glassy'>
		// 			<Box
		// 				sx={{
		// 					// marginTop: 8,
		// 					display: 'flex',
		// 					flexDirection: 'column',
		// 					alignItems: 'center',
		// 				}}
		// 			>
		// 				<LockOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
		// 				<Typography component='h3' variant='h3'>
		// 					Register
		// 				</Typography>
		// 				<span className='text-muted'>**Some fields are required, but fill in all the fields to get the best experience!</span>
		// 				<form onSubmit={handleSubmit(submission)} noValidate sx={{ mt: 1 }}>

		// 					{/* <FormControlLabel control={<Checkbox value='remember' onChange={onchange} color='primary' />} label='Remember me' /> */}
		// 					<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
		// 						Register
		// 					</Button>

		// 					<Grid container>
		// 						<Grid item>

		// 						</Grid>
		// 					</Grid>
		// 				</form>
		// 			</Box>
		// 		</Container>
		// 	</ThemeProvider>
		// );
	);
}
