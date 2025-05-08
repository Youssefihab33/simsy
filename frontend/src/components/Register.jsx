import { TextField, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './AlreadyLoggedIn.jsx';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function Register() {
	const navigate = useNavigate();
	const formSchema = yup.object({
		email: yup.string().email('Invalid email format').required('Email is required!'),
		username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
		password: yup.string().required('Password is required!').min(8, 'Password must be at least 8 characters long'),
		password2: yup
			.string()
			.required('Password confirmation is required!')
			.oneOf([yup.ref('password'), null], 'Passwords do not match!'),
	});
	const { handleSubmit, control } = useForm({resolver: yupResolver(formSchema)});
	const submission = (data) => {
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

						<Link href='/login/' className='text-light'>
							{'Already have an account? Sign in'}
						</Link>
					</form>
				)}
			</div>
		</main>
	);
}
