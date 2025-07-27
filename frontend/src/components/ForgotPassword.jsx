import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import { Container, Grow, Alert, TextField, Button, Link, Box, Grid } from '@mui/material';

export default function ForgotPassword() {
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { handleSubmit, control } = useForm();
	const navigate = useNavigate();
	const onSubmit = (data) => {
		setAlert(null);
		setIsSubmitting(true);
		axiosInstance
			.post('/password_reset/', { email: data.email })
			.then(() => {
				setAlert({ type: 'success', message: 'Check your Email! You should find a password reset link! You will now be redirected to the login page...' });
				// setIsSubmitting(false); Keep this true to prevent multiple SUCCESSFUL submissions
				setTimeout(() => {
					navigate('/login/');
				}, 15000);
			})
			.catch((error) => {
				setAlert({ type: 'error', message: error.response?.data?.email || 'Failed to send reset link. Please try again.' });
				setIsSubmitting(false);
				console.error('error:', error);
			});
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
				<h1 className='fw-bold primaryColor my-3'>
					<i className='bi-key'></i>&nbsp;Forgot Password
				</h1>
				{!localStorage.getItem('token') && (
					<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<Controller
									name='email'
									control={control}
									rules={{ required: 'Email is required to restore your account!' }}
									render={({ field, fieldState: { error } }) => (
										<TextField
											{...field}
											label='Enter your Email'
											variant='outlined'
											error={!!error}
											helperText={error ? error.message : ''}
											margin='normal'
											required
											fullWidth
											autoComplete='email'
											autoFocus
											color='tertiary'
											disabled={isSubmitting}
										/>
									)}
								/>
							</Grid>
						</Grid>
						<Button type='submit' fullWidth variant='outlined' sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }} startIcon={<i className='bi-key'></i>} disabled={isSubmitting}>
							Get Reset Link
						</Button>
						<Link href='/login/' color='secondary' sx={{ mt: 1, display: 'block' }}>
							Did you remember your password?
						</Link>
						<Link href='/register/' color='secondary' sx={{ mt: 1, display: 'block' }}>
							Create a new Account?
						</Link>
					</form>
				)}
			</Box>
		</Container>
	);
}
