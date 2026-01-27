import { useState, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
	Container,
	TextField,
	Button,
	Avatar,
	Typography,
	FormControlLabel,
	Switch,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	CircularProgress,
	Snackbar,
	Alert,
	IconButton,
	Grid,
	Box,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import axiosInstance from './APIs/Axios';
import { UserContext } from './APIs/Context';

const profileFormSchema = yup.object({
	email: yup.string().email('Invalid email format').required('Email is required!'),
	username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
	first_name: yup
		.string()
		.matches(/^[^0-9]*$/, 'Name cannot contain numbers')
		.nullable(),
	last_name: yup
		.string()
		.matches(/^[^0-9]*$/, 'Name cannot contain numbers')
		.nullable(),
	nickname: yup
		.string()
		.matches(/^[^0-9]*$/, 'Nicknames cannot contain numbers')
		.nullable(),
	nationality: yup.string(),
	birthday: yup.mixed().nullable(),
	bio: yup.string().nullable(),
	remember_home_tab: yup.boolean(),
});

export default function Profile() {
	const { user, setUser } = useContext(UserContext);
	const [isSaving, setIsSaving] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [profilePreview, setProfilePreview] = useState(user?.profile_picture || '');
	const [countries, setCountries] = useState([]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const res = await axiosInstance.get('countries/');
				setCountries(res.data);
			} catch (err) {
				console.error('Failed to fetch countries', err);
			}
		};
		fetchCountries();
	}, []);

	const { handleSubmit, control, reset } = useForm({
		resolver: yupResolver(profileFormSchema),
		defaultValues: {
			email: user?.email || '',
			username: user?.username || '',
			first_name: user?.first_name || '',
			last_name: user?.last_name || '',
			nickname: user?.nickname || '',
			nationality: user?.nationality || '',
			birthday: user?.birthday ? dayjs(user.birthday) : null,
			bio: user?.bio || '',
			remember_home_tab: user?.remember_home_tab || false,
		},
	});

	useEffect(() => {
		if (user) {
			reset({
				...user,
				birthday: user.birthday ? dayjs(user.birthday) : null,
			});
			setProfilePreview(user.profile_picture);
		}
	}, [user, reset]);

	const onSubmit = async (data) => {
		setIsSaving(true);
		try {
			// Re-wrap birthday in dayjs before formatting to avoid "not a function" error
			const formattedBirthday = data.birthday && dayjs(data.birthday).isValid() ? dayjs(data.birthday).format('YYYY-MM-DD') : null;

			// Create a submission object that EXCLUDES profile_picture
			// This prevents the "submitted data was not a file" error
			const { profile_picture, ...textData } = data;

			const payload = {
				...textData,
				birthday: formattedBirthday,
			};

			const res = await axiosInstance.patch(`/users/current/`, payload);
			setUser(res.data);
			setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
		} catch (err) {
			const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update profile.';
			setSnackbar({ open: true, message: errorMsg, severity: 'error' });
			console.error(err);
		} finally {
			setIsSaving(false);
		}
	};

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		// Display local preview immediately
		setProfilePreview(URL.createObjectURL(file));

		const formData = new FormData();
		formData.append('profile_picture', file);

		try {
			const res = await axiosInstance.patch(`/users/current/`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setUser(res.data);
			setSnackbar({ open: true, message: 'Picture updated!', severity: 'success' });
		} catch (err) {
			setSnackbar({ open: true, message: 'Failed to upload picture.', severity: 'error' });
		}
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Container maxWidth='lg' sx={{ my: 4 }}>
				<Typography variant='h4' sx={{ color: 'secondary.main', fontWeight: 'bold', mb: 3 }} textAlign='center'>
					Edit Profile
				</Typography>
				<Box sx={{ p: 5, boxShadow: 3, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Grid container spacing={4}>
							<Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<Box sx={{ position: 'relative' }}>
									<Avatar src={profilePreview} sx={{ width: 180, height: 180, mb: 2, border: '4px solid', borderColor: 'secondary.main' }} />
									<input accept='image/*' style={{ display: 'none' }} id='icon-button-file' type='file' onChange={handleFileChange} />
									<label htmlFor='icon-button-file'>
										<IconButton
											color='tertiary'
											aria-label='upload picture'
											component='span'
											sx={{
												position: 'absolute',
												bottom: 20,
												right: 10,
												backgroundColor: 'white',
												'&:hover': { backgroundColor: '#f0f0f0' },
											}}
										>
											<PhotoCamera />
										</IconButton>
									</label>
								</Box>
								<Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
									Click the camera to update your photo
								</Typography>
							</Grid>

							<Grid item xs={12} md={8}>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={4}>
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
													variant='outlined'
													sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={5}>
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
													variant='outlined'
													sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={3}>
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
													variant='outlined'
													sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={4}>
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
													variant='outlined'
													sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={8}>
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
													variant='outlined'
													sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Controller
											name='birthday'
											control={control}
											render={({ field }) => (
												<DatePicker
													{...field}
													label='Birthday'
													slotProps={{ textField: { fullWidth: true, variant: 'outlined', sx: { input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } } } }}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FormControl fullWidth>
											<InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Nationality</InputLabel>
											<Controller
												name='nationality'
												control={control}
												render={({ field }) => (
													<Select {...field} label='Nationality' sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.23)' } }}>
														{countries?.map((country) => (
															<MenuItem key={country.id} value={country.id}>
																{country.name}
															</MenuItem>
														))}
													</Select>
												)}
											/>
										</FormControl>
									</Grid>
								</Grid>

								<FormControlLabel
									control={<Controller name='remember_home_tab' control={control} render={({ field }) => <Switch {...field} checked={field.value} color='primary' />} />}
									label='Remember Home Tab'
									sx={{ mt: 2, color: 'white' }}
								/>

								<Button type='submit' variant='contained' color='tertiary' fullWidth disabled={isSaving} sx={{ mt: 4, py: 1.5 }}>
									{isSaving ?
										<CircularProgress size={24} color='inherit' />
									:	'Save Changes'}
								</Button>
							</Grid>
						</Grid>
					</form>
				</Box>

				<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
					<Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</Container>
		</LocalizationProvider>
	);
}
