import { TextField, Button, Link, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';

export default function ForgotPasswordConfirm() {
	const navigate = useNavigate();
	const token = useParams().token;
	const { handleSubmit, control } = useForm();
	const submission = (data) => {
		// Basic password confirmation check (you might want more robust validation)
		if (data.password !== data.password2) {
			alert('Passwords do not match!'); // Simple error handling
			return; // Stop submission
		} else {
			// When Submitted
			axiosInstance
				.post('/api/password_reset/confirm/', { password: data.password, token: token })
				.then((response) => {
					alert('Your password was changed successfully!');
					navigate('/login/');
				})
				.catch((error) => {
					console.error('error:', error);
					alert('An error occurred! check console for more details!');
				});
		}
	};

	return (
		<main className='container-xs container-login glassy mx-auto'>
			<div className='d-flex flex-column align-items-center text-center'>
				<h3 style={{ fontSize: '2.5rem', color: '#5DD95D' }}>
					<i className='bi-key-fill'></i> Type your new password
				</h3>
				<form onSubmit={handleSubmit(submission)}>
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
							/>
						)}
					/>
					<Controller
						name='password2'
						control={control}
						rules={{ required: 'Enter the same password again!' }}
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								label='Password again'
								variant='outlined'
								error={!!error}
								helperText={error ? error.message : ''}
								margin='normal'
								type='password'
								required
								fullWidth
								autoComplete='password'
							/>
						)}
					/>

					<Button type='submit' fullWidth variant='contained' sx={{ mt: 2, mb: 2 }}>
						Change Password
					</Button>

					<Link href='/login/' className='text-light'>
						Did you remember your password? Login
					</Link>
					<br />
					<Link href='/register/' className='text-light'>
						Don't have an account? Sign Up
					</Link>
				</form>
			</div>
		</main>
	);
}
