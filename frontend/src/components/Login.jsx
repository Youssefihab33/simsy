import { Container, Grow, TextField, Button, Link, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function Login() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [invalidCredentials, setInvalidCredentials] = useState(false);

	const formSchema = yup.object({
		username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
		password: yup.string().required('Password is required!').min(8, 'Password must be at least 8 characters long'),
	});
	const { handleSubmit, control } = useForm({
		resolver: yupResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	const submission = (data) => {
		// When Submitted
		axiosInstance.post('/login/', { username: data.username, password: data.password }).then((response) => {
			if (response.status === 200) {
				localStorage.setItem('token', response.data.token);
				navigate('/');
			} else {
				setInvalidCredentials(true);
			}
		});
	};

	return (
		<Container maxWidth='sm'>
			<Grow in={invalidCredentials} style={{ transitionDelay: '200ms' }}>
				<Alert icon={<CheckIcon fontSize='inherit' />} severity='primary' color='primary' className='my-3' onClose={() => {}}>
					You are already logged in as <strong>Your username</strong>. If you want to log in as another user, please log out first.
				</Alert>
			</Grow>
			<div className='d-flex flex-column glassy align-items-center text-center p-4 px-0 px-sm-5'>
				{localStorage.getItem('token') ? (
					<AlreadyLoggedIn />
				) : (
					<>
						<h1 className='fw-bold secondaryColor my-3'>
							<i className='bi-box-arrow-in-right'></i>&nbsp;Login
						</h1>
						<form onSubmit={handleSubmit(submission)}>
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
										required
										fullWidth
										autoComplete='username'
										autoFocus
										color='tertiary'
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
										required
										fullWidth
										autoComplete='password'
										color='tertiary'
									/>
								)}
							/>

							<Button type='submit' fullWidth variant='contained' className='my-3' size='large'>
								Sign In
							</Button>

							<Link href='/forgot-password/' className='text-light'>
								Forgot password?
							</Link>
							<br />
							<Link href='/register/' className='text-light'>
								Don't have an account? Sign Up
							</Link>
						</form>
					</>
				)}
			</div>
		</Container>
	);
}
