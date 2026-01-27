import { Container, Grow, Alert, TextField, Button, Link, Box, Grid, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Key as KeyIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import axiosInstance from './APIs/Axios.jsx';
import AnimatedFace from './snippets/AnimatedFace.jsx';

export default function ForgotPasswordConfirm() {
	const navigate = useNavigate();
	const token = useParams().token;
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const [showPassword, setShowPassword] = useState(false);
	const { handleSubmit, control } = useForm();
	const submission = (data) => {
		setAlert(null);
		if (data.password !== data.password2) {
			setAlert({ type: 'error', message: 'Passwords do not match!' });
			return;
		}
		setIsSubmitting(true);
		axiosInstance
			.post('/password_reset/confirm/', { password: data.password, token: token })
			.then(() => {
				setAlert({ type: 'success', message: 'Your password was changed successfully! Redirecting...' });
				setTimeout(() => navigate('/login/'), 2000);
			})
			.catch((error) => {
				console.error('error:', error);
				setAlert({ type: 'error', message: 'An error occurred! Please try again.' });
				setIsSubmitting(false);
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
					Reset Password
				</h1>
				<form onSubmit={handleSubmit(submission)}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Controller
								name='password'
								control={control}
								rules={{ required: 'Password is required!' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										type={showPassword ? 'text' : 'password'}
										label='New Password'
										fullWidth
										error={!!error}
										helperText={error ? error.message : ''}
										required
										disabled={isSubmitting}
										onFocus={() => setFaceState(showPassword ? 'typing' : 'hiding')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
										InputProps={{
											endAdornment: (
												<InputAdornment position='end'>
													<IconButton
														onClick={() => {
															const nextShow = !showPassword;
															setShowPassword(nextShow);
															setFaceState(nextShow ? 'typing' : 'hiding');
														}}
														edge='end'
														sx={{ color: 'rgba(255,255,255,0.5)' }}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='password2'
								control={control}
								rules={{ required: 'Enter the same password again!' }}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										type={showPassword ? 'text' : 'password'}
										label='Confirm New Password'
										fullWidth
										error={!!error}
										helperText={error ? error.message : ''}
										required
										disabled={isSubmitting}
										onFocus={() => setFaceState(showPassword ? 'typing' : 'hiding')}
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
						color='secondary'
						sx={{
							mt: 4,
							py: 1.5,
							borderRadius: '12px',
							fontSize: '1.1rem',
							fontWeight: 'bold',
							textTransform: 'none',
							boxShadow: '0 4px 12px rgba(93, 217, 93, 0.3)',
						}}
						disabled={isSubmitting}
					>
						Change Password
					</Button>

					<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Link component={RouterLink} to='/login/' sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
							Back to <span style={{ color: 'var(--color3)', fontWeight: 'bold' }}>Log In</span>
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
