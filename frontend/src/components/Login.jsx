import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useLocalStorage } from 'react-use';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Grid } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';

const loginFormSchema = yup
	.object({
		username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
		password: yup.string().required('Password is required!').min(8, 'Password must be at least 8 characters long'),
	})
	.required();

export default function Login() {
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [token, setToken] = useLocalStorage('auth_token', null, { raw: true });
	const { handleSubmit, control, setError, clearErrors } = useForm({
		resolver: yupResolver(loginFormSchema),
	});
	const navigate = useNavigate();
	// Check if already logged in early
	if (token) {
		return <AlreadyLoggedIn />;
	}

	// If user actually needs to log in
	const handleLoginSuccess = (token) => {
		setToken(token);
		navigate('/');
	};

	const handleLoginError = (error) => {
		setAlert(null);
		clearErrors();

		if (error.response && error.response.data) {
			const errors = error.response.data;
			let generalErrorMessage = null;

			for (const fieldName in errors) {
				if (Object.prototype.hasOwnProperty.call(errors, fieldName)) {
					const fieldErrors = errors[fieldName];
					if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
						if (fieldName === 'username' || fieldName === 'password') {
							setError(fieldName, { type: 'manual', message: fieldErrors[0] });
						} else if (fieldName === 'non_field_errors' || fieldName === 'detail' || fieldName === 'error') {
							generalErrorMessage = fieldErrors[0];
						}
					} else if (typeof fieldErrors === 'string' && fieldName === 'error') {
						generalErrorMessage = fieldErrors;
					}
				}
			}
			if (generalErrorMessage) {
				setAlert({
					type: 'error',
					message: generalErrorMessage,
				});
			} else if (Object.keys(errors).length === 0 && error.response.status !== 200) {
				setAlert({
					type: 'error',
					message: 'An unknown login error occurred. Please try again.',
				});
			} else {
				setAlert(null);
			}
		} else {
			console.error('Login error (no response data):', error);
			setAlert({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
		}
	};

	const onSubmit = async (data) => {
		setAlert(null);
		clearErrors();
		setIsSubmitting(true);

		try {
			const response = await axiosInstance.post('/users/login/', data);
			if (response.status === 200) {
				handleLoginSuccess(response.data.token);
			} else {
				setAlert({ type: 'error', message: 'Login failed with an unexpected status. Please try again.' });
			}
		} catch (error) {
			handleLoginError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Container className='my-5' maxWidth='sm'>
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
				className='d-flex flex-column glassy align-items-center text-center p-4 px-5'
				sx={{
					boxShadow: 3,
					p: 4,
					maxWidth: 600,
					mx: 'auto',
				}}
			>
				<h1 className='fw-bold secondaryColor my-3'>
					<i className='bi-box-arrow-in-right'></i>&nbsp;Login
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
					<Grid container spacing={1}>
						<Grid item xs={12}>
							<Controller
								name='username'
								control={control}
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
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='password'
								control={control}
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
										autoComplete='current-password'
										color='tertiary'
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
					</Grid>
					<Button
						type='submit'
						color='secondary'
						fullWidth
						variant='outlined'
						sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
						disabled={isSubmitting}
						startIcon={<i className='bi-box-arrow-in-right'></i>}
					>
						{isSubmitting ? 'Logging In...' : 'Log In'}
					</Button>
					<Link href='/forgot-password/' sx={{ mt: 1, display: 'block' }}>
						Forgot password?
					</Link>
					<Link href='/register/' sx={{ mt: 1, display: 'block' }}>
						Create a new Account ?
					</Link>
				</form>
			</Box>
		</Container>
	);
}
