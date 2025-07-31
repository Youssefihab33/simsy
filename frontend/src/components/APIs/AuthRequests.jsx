import axiosInstance from './Axios';

export async function logout(removeToken) {
    try {
        await axiosInstance.post('/auth/logout/');
        if (removeToken) {
            removeToken();
			window.location.href = '/login/';
        }
    } catch (error) {
        alert('Logout failed! Check console for details.');
        console.error('Logout error:', error);
        throw error;
    }
}
