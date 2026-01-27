import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Grid, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Check as CheckIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import AnimatedFace from './snippets/AnimatedFace.jsx';

const registerFormSchema = yup
	.object({
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
		birthday: yup.string().nullable(),
		bio: yup.string().nullable(),
	})
	.required();

export default function Register() {
	const { user, login } = useContext(UserContext);
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const { handleSubmit, control, setError, clearErrors } = useForm({
		resolver: yupResolver(registerFormSchema),
		defaultValues: {
			email: '',
			username: '',
			password: '',
			password2: '',
			first_name: '',
			last_name: '',
			nickname: '',
			birthday: '',
			bio: '',
		},
	});

	if (user) return <AlreadyLoggedIn />;

	const onSubmit = async (data) => {
		setAlert(null);
		clearErrors();
		setIsSubmitting(true);

		try {
			await axiosInstance.post('/users/register/', {
				username: data.username,
				email: data.email,
				password: data.password,
				first_name: data.first_name,
				last_name: data.last_name,
				nickname: data.nickname,
				birthday: data.birthday,
				bio: data.bio,
			});

			const loginRes = await axiosInstance.post('/users/login/', {
				username: data.username,
				password: data.password,
			});

			if (loginRes.status === 200) {
				login(loginRes.data.token);
			}
		} catch (error) {
			const errors = error.response?.data;
			if (errors) {
				// Map backend errors to form fields
				Object.keys(errors).forEach((key) => {
					setError(key, {
						type: 'manual',
						message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
					});
				});

				// Set general alert
				const generalMsg = errors.non_field_errors?.[0] || errors.detail || 'Registration failed.';
				setAlert({ type: 'error', message: generalMsg });
			} else {
				setAlert({ type: 'error', message: 'An unexpected error occurred.' });
			}
		} finally {
			setIsSubmitting(false);
			navigate('/');
		}
	};

	return (
		<Container className='my-5' maxWidth='md'>
			{alert && (
				<Grow in={!!alert}>
					<Alert
						severity={alert.type}
						sx={{ position: 'sticky', top: 75, zIndex: 1000, mb: 3, borderRadius: '12px' }}
						onClose={() => setAlert(null)}
						icon={alert.type === 'info' ? <CheckIcon fontSize='inherit' /> : undefined}
					>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Box className='glassy p-5 text-center' sx={{ maxWidth: 650, mx: 'auto' }}>
				<AnimatedFace state={faceState} />
				<h1 className='fw-bold mb-4' style={{ color: 'white', letterSpacing: '1px' }}>
					Create Account
				</h1>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Controller
								name='email'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Email'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
									/>
								)}
							/>
						</Grid>
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
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
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
						<Grid item xs={12} sm={6}>
							<Controller
								name='password2'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										type={showPassword ? 'text' : 'password'}
										label='Confirm Password'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState(showPassword ? 'typing' : 'hiding')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
										type='date'
										fullWidth
										InputLabelProps={{ shrink: true }}
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
										fullWidth
										multiline
										rows={3}
										error={!!error}
										helperText={error?.message}
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
						color='secondary'
						fullWidth
						variant='contained'
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
						{isSubmitting ? 'Creating Account...' : 'Register'}
					</Button>

					<Box sx={{ mt: 3 }}>
						<Link component={RouterLink} to='/login/' sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
							Already have an account? <span style={{ color: 'var(--color3)', fontWeight: 'bold' }}>Log In</span>
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
