import axiosInstance from '../APIs/Axios';
import { useNavigate } from 'react-router-dom';

export default function AlreadyLoggedIn() {
	const navigate = useNavigate();
	function logout() {
		axiosInstance
			.post('/auth/logout/')
			.then((response) => {
				alert('Logout successful!');
				localStorage.removeItem('token');
				navigate('/login/');
			})
			.catch((error) => {
				alert('Logout failed:', error.response.data);
				console.error('Logout error:', error);
			});
	}

	return (
		<>
			<h1 className='fw-bold secondaryColor my-3'>
				<i className='bi-person-check'></i>&nbsp;Already logged in
			</h1>
			<br />
			<a className='text-decoration-none text-info' href='/' style={{ fontSize: '1.5rem' }}>
				<i className='bi-house'></i> Go to homepage
			</a>
			<br />
			<button className='btn btn-link text-decoration-none text-danger' onClick={logout} style={{ fontSize: '1rem' }}>
				<i className='bi-person-dash'></i> Logout
			</button>
		</>
	);
}
