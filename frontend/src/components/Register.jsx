import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Grid } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';

const registerFormSchema = yup.object({
	email: yup.string().email('Invalid email format').required('Email is required!'),
	username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
	password: yup.string().required('Password is required!').min(8, 'Password must be at least 8 characters long'),
	password2: yup
		.string()
		.required('Password confirmation is required!')
		.oneOf([yup.ref('password'), null], 'Passwords do not match!'),
	first_name: yup.string().matches(/^[^0-9]*$/, 'Name cannot contain numbers'),
	last_name: yup.string().matches(/^[^0-9]*$/, 'Name cannot contain numbers'),
	nickname: yup.string().matches(/^[^0-9]*$/, 'Nicknames cannot contain numbers'),
});

export default function Register() {
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { handleSubmit, control, setError } = useForm({
		resolver: yupResolver(registerFormSchema),
	});
	const navigate = useNavigate();
	// Check if already logged in early
	if (localStorage.getItem('token')) {
		return <AlreadyLoggedIn />;
	}

	// If user actually needs to register
	const handleLoginSuccess = (token) => {
		localStorage.setItem('token', token);
		navigate('/');
	};

	const handleLoginError = (error) => {
		if (error.response && error.response.status === 401) {
			setAlert({
				type: 'error',
				message: 'Invalid login. Please try again.',
			});
			setError('username', { type: 'manual', message: 'Username not found' });
			setError('password', { type: 'manual', message: 'Wrong password' });
		} else {
			console.error('Login error:', error);
			setAlert({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
		}
	};

	const handleRegisterError = (error) => {
		if (error.response && error.response.data) {
			const errors = error.response.data;
			let generalErrorMessage = 'Registration failed. Please check the form.';
			for (const fieldName in errors) {
				if (Object.prototype.hasOwnProperty.call(errors, fieldName)) {
					const fieldErrors = errors[fieldName];
					if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
						setError(fieldName, { type: 'manual', message: String(fieldErrors[0]).charAt(0).toUpperCase() + String(fieldErrors[0]).slice(1) });
						if (fieldName === 'non_field_errors' || fieldName === 'detail') {
							generalErrorMessage = fieldErrors[0];
						}
					}
				}
			}
			if (Object.keys(errors).length === 0 || generalErrorMessage !== 'Registration failed. Please check the form.') {
				setAlert({
					type: 'error',
					message: generalErrorMessage,
				});
			} else {
				// If there were only field-specific errors, clear any general alert
				setAlert(null);
			}
		} else {
			console.error('Register error:', error);
			setAlert({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
		}
	};

	const onSubmit = async (data) => {
		setAlert(null);
		setIsSubmitting(true);

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
						handleLoginSuccess(response.data.token);
					})
					.catch((error) => {
						handleLoginError(error);
					});
			})
			.catch((error) => {
				handleRegisterError(error);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	return (
		<Container className='my-5' maxWidth='md'>
			{alert && (
				<Grow in={!!alert} style={{ transitionDelay: '200ms' }}>
					<Alert
						severity={alert.type}
						className='my-3 sticky-alert'
						sx={{
							position: 'sticky',
							top: 75,
							zIndex: 1000,
							boxSizing: 'border-box',
						}}
						onClose={() => setAlert(null)}
						icon={alert.type === 'info' ? <CheckIcon fontSize='inherit' /> : undefined}
					>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Box
				className='d-flex flex-column glassy align-items-center text-center p-4 px-0 px-sm-5'
				sx={{
					boxShadow: 3,
					p: 4,
					maxWidth: 600,
					mx: 'auto',
				}}
			>
				<h1 className='fw-bold secondaryColor my-3'>
					<i className='bi-person-add'></i>&nbsp;Create an Account!
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
					<Grid container spacing={1}>
						<Grid item xs={12}>
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
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Controller
								name='first_name'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='First Name'
										variant='outlined'
										error={!!error}
										helperText={error ? error.message : ''}
										margin='normal'
										fullWidth
										autoComplete='first-name'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Controller
								name='last_name'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Last Name'
										variant='outlined'
										error={!!error}
										helperText={error ? error.message : ''}
										margin='normal'
										fullWidth
										autoComplete='last-name'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
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
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
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
										autoComplete='new-password'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Controller
								name='password2'
								control={control}
								rules={{ required: 'Enter the same password again!' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Confirm Password'
										variant='outlined'
										error={!!error}
										helperText={error ? error.message : ''}
										margin='normal'
										type='password'
										fullWidth
										autoComplete='new-password'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='nickname'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Nickname'
										variant='outlined'
										error={!!error}
										helperText={error ? error.message : ''}
										margin='normal'
										fullWidth
										autoComplete='nickname'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
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
										InputLabelProps={{ shrink: true }} // Ensures label doesn't overlap with date
										autoComplete='bday'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='bio'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Bio'
										variant='outlined'
										error={!!error}
										helperText={error ? error.message : ''}
										margin='normal'
										fullWidth
										multiline // Allow multiple lines for bio
										rows={3}
										autoComplete='off'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
					</Grid>

					<Button type='submit' color='secondary' fullWidth variant='outlined' sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }} disabled={isSubmitting} startIcon={<i className='bi-person-add'></i>}>
						{isSubmitting ? 'Registering...' : 'Register'}
					</Button>

					<Link href='/login/' sx={{ mt: 1, display: 'block' }}>
						Already have an account?
					</Link>
				</form>
			</Box>
		</Container>
	);
}
