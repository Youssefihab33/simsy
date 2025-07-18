import { TextField, Button, Link, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';

export default function ForgotPassword() {
	const navigate = useNavigate();
	const { handleSubmit, control } = useForm();
	const submission = (data) => {
		axiosInstance
			.post('/password_reset/', { email: data.email })
			.then((response) => {
                // MISSING: Add a success message or redirect to another page
                // For example, you can show an alert or navigate to a different page
				alert('Password reset link sent to your email!');
                // navigate('/');
			})
			.catch((error) => {
				alert('Cannot find an account Linked to your email! Make sure you entered the correct email!');
				console.error('error:', error);
			});
	};

	return (
		<main className='container-xs container-login glassy mx-auto'>
			<div className='d-flex flex-column align-items-center text-center'>
				<h3 style={{ fontSize: '2.5rem', color: '#5DD95D' }}>
					<i className='bi-key-fill'></i> Forgot Password
				</h3>
				{!localStorage.getItem('token') && (
					<form onSubmit={handleSubmit(submission)}>
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
								/>
							)}
						/>

						<Button type='submit' fullWidth variant='contained' sx={{ mt: 2, mb: 2 }}>
							Get Reset Link
						</Button>

						<Link href='/login/' className='text-light'>
							Did you remember your password? Login
						</Link>
						<br />
						<Link href='/register/' className='text-light'>
							Don't have an account? Sign Up
						</Link>
					</form>
				)}
			</div>
		</main>
	);
}
