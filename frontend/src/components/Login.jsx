import { TextField, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Controller, set, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './AlreadyLoggedIn.jsx';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function Login() {
	const navigate = useNavigate();
	const formSchema = yup.object({
		email: yup	.string().email('Invalid email format').required('Email is required!'),
		password: yup.string().required('Password is required!'),
	});

	const { handleSubmit, control } = useForm({ resolver: yupResolver(formSchema) });

	function submission(data) {
		// When Submitted
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
	}

	return (
		<main className='container-xs container-login glassy mx-auto'>
			<div className='d-flex flex-column align-items-center text-center'>
				<h3 style={{ fontSize: '2.5rem', color: '#5DD95D' }}>
					{localStorage.getItem('token') ? (
						<AlreadyLoggedIn />
					) : (
						<span>
							<i className='bi-box-arrow-in-right'></i>&nbsp;Login
						</span>
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

						<Button type='submit' fullWidth variant='contained' sx={{ mt: 2, mb: 2 }}>
							Sign In
						</Button>

						<Link href='/forgot-password/' className='text-light'>
							Forgot password?
						</Link>
						<br />
						<Link href='/register/' className='text-light'>
							{"Don't have an account? Sign Up"}
						</Link>
					</form>
				)}
			</div>
		</main>
	);
}
