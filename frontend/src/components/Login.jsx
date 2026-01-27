import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Grid, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import AnimatedFace from './snippets/AnimatedFace.jsx';

const loginFormSchema = yup
	.object({
		username: yup.string().required('Username is required!').min(3, 'Minimum 3 characters'),
		password: yup.string().required('Password is required!').min(8, 'Minimum 8 characters'),
	})
	.required();

export default function Login() {
	const { user, login } = useContext(UserContext);
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/';

	const { handleSubmit, control, setError, clearErrors } = useForm({
		resolver: yupResolver(loginFormSchema),
		defaultValues: { username: '', password: '' },
	});

	if (user) return <AlreadyLoggedIn />;

	const onSubmit = async (data) => {
		setAlert(null);
		clearErrors();
		setIsSubmitting(true);

		try {
			const response = await axiosInstance.post('/users/login/', data);
			if (response.status === 200) {
				login(response.data.token, from);
			}
		} catch (error) {
			const errors = error.response?.data;
			if (errors) {
				// Handle Field-specific errors
				if (errors.username) setError('username', { message: errors.username[0] });
				if (errors.password) setError('password', { message: errors.password[0] });

				// Handle Generic errors
				const generalMsg = errors.non_field_errors?.[0] || errors.detail || errors.error;
				if (generalMsg) setAlert({ type: 'error', message: generalMsg });
			} else {
				setAlert({ type: 'error', message: 'Connection to server failed.' });
			}
		} finally {
			setIsSubmitting(false);
			navigate('/');
		}
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

			<Box className='glassy p-5 text-center'>
				<AnimatedFace state={faceState} />
				<h1 className='fw-bold mb-4' style={{ color: 'white', letterSpacing: '1px' }}>
					Welcome Back
				</h1>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Controller
								name='username'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Username'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{
											'& .MuiOutlinedInput-root': { borderRadius: '12px' },
										}}
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
										type={showPassword ? 'text' : 'password'}
										label='Password'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState(showPassword ? 'typing' : 'hiding')}
										onBlur={() => setFaceState('default')}
										sx={{
											'& .MuiOutlinedInput-root': { borderRadius: '12px' },
										}}
										InputProps={{
											endAdornment: (
												<InputAdornment position='end'>
													<IconButton
														aria-label='toggle password visibility'
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
					</Grid>
					<Button
						type='submit'
						color='primary'
						fullWidth
						variant='contained'
						sx={{
							mt: 4,
							py: 1.5,
							borderRadius: '12px',
							fontSize: '1.1rem',
							fontWeight: 'bold',
							textTransform: 'none',
							boxShadow: '0 4px 12px rgba(154, 6, 6, 0.3)',
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Verifying...' : 'Log In'}
					</Button>
					<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Link component={RouterLink} to='/forgot-password/' sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
							Forgot password?
						</Link>
						<Link component={RouterLink} to='/register/' sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
							Don't have an account? <span style={{ color: 'var(--color3)', fontWeight: 'bold' }}>Sign Up</span>
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
