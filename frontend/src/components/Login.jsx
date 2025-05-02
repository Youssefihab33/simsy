import { TextField, Button, Link, FormControlLabel, Checkbox } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import { useNavigate } from 'react-router-dom';
import AlreadyLoggedIn from './AlreadyLoggedIn.jsx';

export default function LoginPanel() {
	const navigate = useNavigate();
	const { handleSubmit, control } = useForm();
	const submission = (data) => {
		axiosInstance
			.post('/login/', { username: data.username, password: data.password })
			.then((response) => {
				localStorage.setItem('token', response.data.token);
				navigate('/');
			})
			.catch((error) => {
				alert('Login failed! Please check your credentials.');
				console.error('Login error:', error);
			});
	};

	return (
		// FIX THE LOGOUT HERE
		<main className='container-xs container-login glassy mx-auto'>
			<div className='d-flex flex-column align-items-center text-center'>
				<h3 style={{ fontSize: '2.5rem', color: '#5DD95D' }}>
					<i className='bi-person-lock'></i>
					{localStorage.getItem('token') ? (
						<AlreadyLoggedIn/>
					) : (
						<span>&nbsp;Login</span>
					)}
				</h3>
				{!localStorage.getItem('token') && (
					<form onSubmit={handleSubmit(submission)}>
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
						<FormControlLabel control={<Checkbox value='remember' onChange={onchange} checked />} label='Remember me' />
						<Button type='submit' fullWidth variant='contained' sx={{ mt: 2, mb: 2 }}>
							Sign In
						</Button>

						<Link href='#'>Forgot password?</Link>
						<br />
						<Link href='/register/'>{"Don't have an account? Sign Up"}</Link>
					</form>
				)}
			</div>
		</main>
	);
}