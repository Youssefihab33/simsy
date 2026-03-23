import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import { Container, Grow, Alert, TextField, Button, Link, Box, Grid, Typography } from '@mui/material';
import AnimatedFace from './snippets/AnimatedFace.jsx';
import { useTitle } from 'react-use';

export default function ForgotPassword() {
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const { handleSubmit, control } = useForm();
	const navigate = useNavigate();
	useTitle('Forgot Password - SIMSY');

	const onSubmit = (data) => {
		setAlert(null);
		setIsSubmitting(true);
		axiosInstance
			.post('/password_reset/', { email: data.email })
			.then(() => {
				setAlert({
					type: 'success',
					message: 'Check your Email! You should find a password reset link! You will now be redirected to the login page...',
				});
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
		<Container sx={{ my: 5 }} maxWidth='sm'>
			{alert && (
				<Grow in={!!alert}>
					<Alert severity={alert.type} sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setAlert(null)}>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Box className='glassy' sx={{ p: 5, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
				<AnimatedFace state={faceState} />
				<Typography variant='h4' component='h1' sx={{ fontWeight: 'bold', mb: 4, color: 'white', letterSpacing: '1px' }}>
					Forgot Password
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
					<Grid container spacing={3}>
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
										required
										fullWidth
										autoComplete='email'
										autoFocus
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
									/>
								)}
							/>
						</Grid>
					</Grid>
					<Button
						type='submit'
						fullWidth
						variant='contained'
						color='primary'
						sx={{
							mt: 4,
							mb: 2,
							py: 1.5,
							borderRadius: '12px',
							fontSize: '1.1rem',
							fontWeight: 'bold',
							textTransform: 'none',
							boxShadow: '0 4px 12px rgba(154, 6, 6, 0.3)',
						}}
						disabled={isSubmitting}
					>
						Get Reset Link
					</Button>
					<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Link component={RouterLink} to='/login/' sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
							Remember your password?{' '}
							<Box component='span' sx={{ color: '#54a9de', fontWeight: 'bold' }}>
								Log In
							</Box>
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
