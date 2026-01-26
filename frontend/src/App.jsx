import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './app.css';

import { UserProvider } from './components/APIs/Context';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';

import Header from './components/snippets/Header';
import Footer from './components/snippets/Footer';
import Homepage from './components/Homepage';
import Artist from './components/Artist';
import Country from './components/Country';
import Show from './components/Show';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Profile from './components/Profile';

const theme = createTheme({
	palette: {
		primary: { main: '#9a0606' },
		secondary: { main: '#5dd95d' },
		tertiary: { main: '#54a9de' },
		favorite: { main: '#D4AF37' },
		watchlist: { main: '#0dcaf0' },
	},
});

export default function App() {
	return (
		<ThemeProvider theme={theme}>
			<UserProvider>
				<Header />
				<Routes>
					{/* Public Routes */}
					<Route path='/register/' element={<Register />} />
					<Route path='/login/' element={<Login />} />
					<Route path='/logout/' element={<Logout />} />
					<Route path='/forgot-password/' element={<ForgotPassword />} />
					<Route path='/reset-password/:token' element={<ResetPassword />} />

					{/* Protected Routes */}
					<Route element={<ProtectedRoutes />}>
						<Route path='/' element={<Homepage />} />
						<Route path='/artist/:artist_id' element={<Artist />} />
						<Route path='/country/:country_id' element={<Country />} />
						<Route path='/show/:show_id' element={<Show />} />
						<Route path='/profile' element={<Profile />} />
					</Route>
				</Routes>
				<Footer />
			</UserProvider>
		</ThemeProvider>
	);
}
