import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Grid } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';

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
					<Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Box className='glassy p-4 text-center' sx={{ boxShadow: 3 }}>
				<h1 className='fw-bold secondaryColor mb-4'>
					<LoginIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
					Login
				</h1>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								name='username'
								control={control}
								render={({ field, fieldState: { error } }) => <TextField {...field} label='Username' fullWidth error={!!error} helperText={error?.message} disabled={isSubmitting} />}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='password'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField {...field} type='password' label='Password' fullWidth error={!!error} helperText={error?.message} disabled={isSubmitting} />
								)}
							/>
						</Grid>
					</Grid>
					<Button type='submit' color='primary' fullWidth variant='contained' sx={{ mt: 3, py: 1.5 }} disabled={isSubmitting}>
						{isSubmitting ? 'Verifying...' : 'Log In'}
					</Button>
					<Box sx={{ mt: 2 }}>
						<Link component={RouterLink} to='/forgot-password/' display='block' sx={{ mb: 1 }}>
							Forgot password?
						</Link>
						<Link component={RouterLink} to='/register/' display='block'>
							Create a new Account?
						</Link>
					</Box>
				</form>
			</Box>
		</Container>
	);
}
