import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import { Container, Grow, Alert, TextField, Button, Link, Box, Grid } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import AnimatedFace from './snippets/AnimatedFace.jsx';

export default function ForgotPassword() {
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const { handleSubmit, control } = useForm();
	const navigate = useNavigate();
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
		<Container className='my-5' maxWidth='sm'>
			{alert && (
				<Grow in={!!alert}>
					<Alert severity={alert.type} sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setAlert(null)}>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Box className='glassy p-5 text-center' sx={{ maxWidth: 600, mx: 'auto' }}>
				<AnimatedFace state={faceState} />
				<h1 className='fw-bold mb-4' style={{ color: 'white', letterSpacing: '1px' }}>
					Forgot Password
				</h1>
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
							Remember your password? <span style={{ color: 'var(--color3)', fontWeight: 'bold' }}>Log In</span>
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
