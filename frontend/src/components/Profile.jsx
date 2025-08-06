import { useState, useEffect } from 'react';
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
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosInstance from './APIs/Axios';

const profileFormSchema = yup.object({
	email: yup.string().email('Invalid email format').required('Email is required!'),
	username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
	first_name: yup.string().matches(/^[^0-9]*$/, 'Name cannot contain numbers'),
	last_name: yup.string().matches(/^[^0-9]*$/, 'Name cannot contain numbers'),
	nickname: yup.string().matches(/^[^0-9]*$/, 'Nicknames cannot contain numbers'),
});

export default function Profile() {
	const [userData, setUserData] = useState({
		username: '',
		email: '',
		nickname: '',
		first_name: '',
		last_name: '',
		birthday: null,
		profile_picture: '',
		bio: '',
		nationality: '',
		time_autosave: true,
		autoplay: true,
		view_captions: true,
		remember_home_tab: true,
		home_tab: 3,
	});
	const [countries, setCountries] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [alert, setAlert] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [isBioEnhancing, setIsBioEnhancing] = useState(false);
	const { handleSubmits, control, setError } = useForm({
		resolver: yupResolver(profileFormSchema),
	});

	// Gemini API Key
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

	useEffect(() => {
		const fetchUserProfileData = async () => {
			return axiosInstance.get('/users/profile/').then((response) => {
				return response.data;
			});
		};
		const fetchCountriesList = async () => {
			return axiosInstance.get('/list_countries/').then((response) => {
				return response.data;
			});
		};

		const fetchData = async () => {
			try {
				const [user, countryList] = await Promise.all([fetchUserProfileData(), fetchCountriesList()]);
				setUserData({
					...user,
					birthday: user.birthday ? dayjs(user.birthday) : null, // Convert birthday string to Dayjs object
				});
				setCountries(countryList);
			} catch (error) {
				console.error('Error fetching user data or countries:', error);
				setAlert({ type: 'error', message: 'Failed to load profile data.' });
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setUserData((prevData) => ({
			...prevData,
			[name]: type === 'checkbox' || type === 'switch' ? checked : value,
		}));
	};

	const handleDateChange = (date) => {
		setUserData((prevData) => ({
			...prevData,
			birthday: date,
		}));
	};

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
			setUserData((prevData) => ({
				...prevData,
				profile_picture: URL.createObjectURL(e.target.files[0]),
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		setAlert(null);

		try {
			// Prepare data for submission, converting Dayjs object back to string
			const resp = {
				...userData,
				birthday: userData.birthday ? userData.birthday.format('YYYY-MM-DD') : null,
				// Handle file upload separately (e.g., to a storage service)
				// Here, just sending the URL or a placeholder
				profile_picture: selectedFile ? 'new_profile_pic_url' : userData.profile_picture,
			};
			const { profile_picture, date_joined, is_active, is_staff, is_superuser, last_login, ...dataToSave } = resp;
			const response = await axiosInstance.put('/users/update_user_data/', dataToSave);
			if (response.status == 200) {
				setAlert({ type: 'success', message: 'Updated your data!' });
				setUserData({
					...response.data,
					birthday: response.data.birthday ? dayjs(response.data.birthday) : null, // Convert birthday string to Dayjs object
				});
			} else {
				setAlert({ type: 'error', message: 'An unknown error occurred during update.' });
			}
		} catch (error) {
			console.error('Error saving user data:', error);
			setAlert({ type: 'error', message: error.message || 'Failed to update profile.' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleEnhanceBio = async () => {
		setIsBioEnhancing(true);
		setAlert(null)

		const prompt = `Enhance the following bio for a professional profile, making it more engaging and concise. Keep it under 150 words:\n\n"${userData.bio}"`;

		try {
			let chatHistory = [];
			chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
			const payload = { contents: chatHistory };
			const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
				const enhancedBio = result.candidates[0].content.parts[0].text;
				setUserData((prevData) => ({
					...prevData,
					bio: enhancedBio,
				}));
				setAlert({ type: 'success', message: 'Bio enhanced successfully!' });
			} else {
				setAlert({ type: 'error', message: 'Failed to enhance bio: No suggestions received.' });
			}
		} catch (error) {
			console.error('Error enhancing bio:', error);
			setAlert({ type: 'error', message: 'Failed to enhance bio. Please try again.' });
		} finally {
			setIsBioEnhancing(false);
		}
	};

	const handleCloseAlert = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setAlert(null);
	};

	if (isLoading) {
		return (
			<Container className='my-5 flex justify-center items-center min-h-[50vh]'>
				<CircularProgress />
				<Typography variant='h6' className='ml-4'>
					Loading profile...
				</Typography>
			</Container>
		);
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Container
				className='my-4'
				sx={{
					p: { xs: 3, sm: 6 },
					mx: 'auto',
					color: '#E0E0E0',
					backgroundColor: 'rgba(255, 255, 255, 0.08)', // A very subtle transparent white
					backdropFilter: 'blur(10px)', // Blurs the background behind the element
					borderRadius: '12px', // Slightly more rounded corners
					border: '1px solid rgba(255, 255, 255, 0.15)', // A thin, subtle border
					boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)', // More prominent shadow for depth
				}}
			>
				{alert && (
					<Snackbar open={true} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
						<Alert onClose={handleCloseAlert} severity={alert.type} sx={{ width: '100%' }}>
							{alert.message}
						</Alert>
					</Snackbar>
				)}

				<Grid container spacing={1}>
					<Grid item md={4} className='pe-5'>
						<Avatar
							alt={userData.username}
							src={userData.profile_picture}
							sx={{
								width: '100%',
								height: 'auto',
								aspectRatio: '1/1',
								border: '4px solid var(--color2)',
								boxShadow: '0 0 0 2px var(--color1)',
							}}
						/>
						<input accept='image/*' style={{ display: 'none' }} id='icon-button-file' type='file' onChange={handleFileChange} />
						<label htmlFor='icon-button-file'>
							<IconButton
								color='primary'
								aria-label='upload picture'
								component='span'
								sx={{
									position: 'relative',
									bottom: 50,
									right: -250,
									backgroundColor: 'var(--color3)',
									color: 'white',
									'&:hover': {
										backgroundColor: 'var(--color2)',
										transform: 'scale(1.1)',
									},
									padding: '8px',
									borderRadius: '50%',
									boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
									transition: 'all 0.2s ease-in-out',
								}}
							>
								<PhotoCamera />
							</IconButton>
						</label>
					</Grid>
					<Grid item md={8}>
						<form onSubmit={handleSubmit}>
							<Grid container spacing={2}>
								<Grid item md={6}>
									<Controller
										name='username'
										control={control}
										rules={{ required: 'Username is required!' }}
										render={({ field, fieldState: { error } }) => (
											<TextField
												{...field}
												className='glassy rounded-1'
												label='Username'
												variant='outlined'
												error={!!error}
												helperText={error ? error.message : ''}
												margin='normal'
												fullWidth
												autoComplete='username'
												color='tertiary'
												disabled={isSaving}
												value={userData.username}
												onChange={handleChange}
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6}>
									<Controller
										name='nickname'
										control={control}
										render={({ field, fieldState: { error } }) => (
											<TextField
												{...field}
												className='glassy rounded-1'
												label='Nickname'
												variant='outlined'
												error={!!error}
												helperText={error ? error.message : ''}
												margin='normal'
												fullWidth
												autoComplete='nickname'
												color='tertiary'
												disabled={isSaving}
												value={userData.nickname}
												onChange={handleChange}
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6}>
									<Controller
										name='first_name'
										control={control}
										render={({ field, fieldState: { error } }) => (
											<TextField
												{...field}
												className='glassy rounded-1'
												label='First Name'
												variant='outlined'
												error={!!error}
												helperText={error ? error.message : ''}
												margin='normal'
												fullWidth
												autoComplete='first_name'
												color='tertiary'
												disabled={isSaving}
												value={userData.first_name}
												onChange={handleChange}
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6}>
									<Controller
										name='last_name'
										control={control}
										render={({ field, fieldState: { error } }) => (
											<TextField
												{...field}
												className='glassy rounded-1'
												label='Last Name'
												variant='outlined'
												error={!!error}
												helperText={error ? error.message : ''}
												margin='normal'
												fullWidth
												autoComplete='last_name'
												color='tertiary'
												disabled={isSaving}
												value={userData.last_name}
												onChange={handleChange}
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
											/>
										)}
									/>
								</Grid>
								<Grid item md={12}>
									<Controller
										name='email'
										control={control}
										rules={{ required: 'Email is required!' }}
										render={({ field, fieldState: { error } }) => (
											<TextField
												{...field}
												className='glassy rounded-1'
												label='Email'
												type='email'
												variant='outlined'
												error={!!error}
												helperText={error ? error.message : ''}
												margin='normal'
												fullWidth
												autoComplete='email'
												color='tertiary'
												disabled={isSaving}
												value={userData.email}
												onChange={handleChange}
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6}>
									<FormControl
										fullWidth
										margin='normal'
										variant='outlined'
										sx={{
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: 'rgba(255, 255, 255, 0.3) !important',
											},
											'&:hover .MuiOutlinedInput-notchedOutline': {
												borderColor: 'rgba(255, 255, 255, 0.6) !important',
											},
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
												borderColor: '#6366F1 !important',
											},
											'& .MuiInputLabel-root': {
												color: '#B0B0B0 !important',
											},
											'& .MuiSelect-select': {
												color: 'white !important',
												backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle background for select
												borderRadius: '4px',
											},
											'& .MuiSvgIcon-root': {
												// Dropdown arrow color
												color: '#B0B0B0',
											},
										}}
									>
										<InputLabel id='nationality-label'>Nationality</InputLabel>
										<Select labelId='nationality-label' id='nationality' name='nationality' value={userData.nationality || ''} onChange={handleChange} label='Nationality'>
											<MenuItem value=''>
												<em style={{ color: '#B0B0B0' }}>None</em>
											</MenuItem>
											{countries.map((country) => (
												<MenuItem key={country.id} value={country.id} sx={{ color: '#333' }}>
													{country.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item md={6}>
									<DatePicker
										label='Birthday'
										value={userData.birthday}
										onChange={handleDateChange}
										renderInput={(params) => (
											<TextField
												{...params}
												fullWidth
												margin='normal'
												variant='outlined'
												InputLabelProps={{ style: { color: '#B0B0B0' } }}
												InputProps={{ style: { color: 'white' } }}
												sx={{
													'& .MuiOutlinedInput-notchedOutline': {
														borderColor: 'rgba(255, 255, 255, 0.3) !important',
													},
													'&:hover .MuiOutlinedInput-notchedOutline': {
														borderColor: 'rgba(255, 255, 255, 0.6) !important',
													},
													'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
														borderColor: '#6366F1 !important',
													},
													'& .MuiSvgIcon-root': {
														// Calendar icon color
														color: '#B0B0B0',
													},
													'& .MuiInputBase-input': {
														backgroundColor: 'rgba(255, 255, 255, 0.05)',
														borderRadius: '4px',
													},
												}}
											/>
										)}
									/>
								</Grid>
								<Grid item md={12}>
									<TextField
										label='Bio'
										name='bio'
										value={userData.bio || ''}
										onChange={handleChange}
										fullWidth
										margin='normal'
										variant='outlined'
										multiline
										rows={4}
										InputLabelProps={{ style: { color: '#B0B0B0' } }}
										InputProps={{ style: { color: 'white' } }}
										sx={{
											'& .MuiOutlinedInput-notchedOutline': {
												borderColor: 'rgba(255, 255, 255, 0.3) !important',
											},
											'&:hover .MuiOutlinedInput-notchedOutline': {
												borderColor: 'rgba(255, 255, 255, 0.6) !important',
											},
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
												borderColor: '#6366F1 !important',
											},
											'& .MuiSvgIcon-root': {
												// Calendar icon color
												color: '#B0B0B0',
											},
											'& .MuiInputBase-input': {
												backgroundColor: 'rgba(255, 255, 255, 0.05)',
												borderRadius: '4px',
											},
										}}
									/>
								</Grid>
							</Grid>
							{/* Gemini API Integration: Enhance Bio */}
							<Button
								variant='outlined'
								color='secondary'
								onClick={handleEnhanceBio}
								disabled={isBioEnhancing}
								fullWidth
								sx={{
									mt: 2,
									borderColor: '#9333EA', // Purple shade for secondary button
									color: '#9333EA',
									'&:hover': {
										borderColor: '#A855F7',
										backgroundColor: 'rgba(147, 51, 234, 0.1)',
										transform: 'translateY(-1px)',
									},
									transition: 'all 0.3s ease-in-out',
									borderRadius: '8px',
									fontSize: '1rem',
									fontWeight: 500,
								}}
							>
								{isBioEnhancing ? <CircularProgress size={24} sx={{ color: '#9333EA' }} /> : '✨ Enhance Bio'}
							</Button>

							<Typography variant='h6' className='mt-8 mb-4 text-left w-full' sx={{ color: 'white', fontWeight: 500 }}>
								User Preferences
							</Typography>

							<FormControlLabel
								control={
									<Switch
										checked={userData.time_autosave}
										onChange={handleChange}
										name='time_autosave'
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: '#6366F1',
												'&:hover': {
													backgroundColor: 'rgba(99, 102, 241, 0.08)',
												},
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
												backgroundColor: '#6366F1',
											},
											'& .MuiSwitch-switchBase': {
												color: 'rgba(255, 255, 255, 0.7)',
											},
											'& .MuiSwitch-track': {
												backgroundColor: 'rgba(255, 255, 255, 0.3)',
											},
										}}
									/>
								}
								label='Time Autosave'
								className='w-full flex justify-between ml-0 mr-0'
								labelPlacement='start'
								sx={{ color: '#E0E0E0' }}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={userData.autoplay}
										onChange={handleChange}
										name='autoplay'
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: '#6366F1',
												'&:hover': {
													backgroundColor: 'rgba(99, 102, 241, 0.08)',
												},
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
												backgroundColor: '#6366F1',
											},
											'& .MuiSwitch-switchBase': {
												color: 'rgba(255, 255, 255, 0.7)',
											},
											'& .MuiSwitch-track': {
												backgroundColor: 'rgba(255, 255, 255, 0.3)',
											},
										}}
									/>
								}
								label='Autoplay'
								className='w-full flex justify-between ml-0 mr-0'
								labelPlacement='start'
								sx={{ color: '#E0E0E0' }}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={userData.view_captions}
										onChange={handleChange}
										name='view_captions'
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: '#6366F1',
												'&:hover': {
													backgroundColor: 'rgba(99, 102, 241, 0.08)',
												},
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
												backgroundColor: '#6366F1',
											},
											'& .MuiSwitch-switchBase': {
												color: 'rgba(255, 255, 255, 0.7)',
											},
											'& .MuiSwitch-track': {
												backgroundColor: 'rgba(255, 255, 255, 0.3)',
											},
										}}
									/>
								}
								label='View Captions'
								className='w-full flex justify-between ml-0 mr-0'
								labelPlacement='start'
								sx={{ color: '#E0E0E0' }}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={userData.remember_home_tab}
										onChange={handleChange}
										name='remember_home_tab'
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: '#6366F1',
												'&:hover': {
													backgroundColor: 'rgba(99, 102, 241, 0.08)',
												},
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
												backgroundColor: '#6366F1',
											},
											'& .MuiSwitch-switchBase': {
												color: 'rgba(255, 255, 255, 0.7)',
											},
											'& .MuiSwitch-track': {
												backgroundColor: 'rgba(255, 255, 255, 0.3)',
											},
										}}
									/>
								}
								label='Remember Home Tab'
								className='w-full flex justify-between ml-0 mr-0'
								labelPlacement='start'
								sx={{ color: '#E0E0E0' }}
							/>

							<Button
								type='submit'
								variant='contained'
								color='primary'
								fullWidth
								className='mt-8 py-3 font-semibold text-lg'
								disabled={isSaving}
								sx={{
									backgroundColor: '#6366F1',
									'&:hover': {
										backgroundColor: '#4F46E5',
										transform: 'translateY(-2px)',
										boxShadow: '0 6px 12px rgba(99, 102, 241, 0.3)',
									},
									transition: 'all 0.3s ease-in-out',
									borderRadius: '8px',
									fontSize: '1.1rem',
									letterSpacing: '0.05em',
								}}
							>
								{isSaving ? <CircularProgress size={24} color='inherit' /> : 'Save Changes'}
							</Button>
						</form>
					</Grid>
				</Grid>
			</Container>
		</LocalizationProvider>
	);
}
