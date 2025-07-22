import axiosInstance from './Axios';

export async function logout() {
	if (!localStorage.getItem('token')) {
		return;
	} else {
		axiosInstance
			.post('/auth/logout/')
			.then(() => {
				localStorage.removeItem('token');
				window.location.reload();
			})
			.catch((error) => {
				alert('Logout failed!', error);
				console.error('Logout error:', error);
			});
	}
}
