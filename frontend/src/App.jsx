import { Routes, Route } from 'react-router-dom';

import { UserProvider } from './components/APIs/Context';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Homepage from './components/Homepage';
import ShowDetail from './components/ShowDetail';
import Artist from './components/Artist'
import Country from './components/Country';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import './app.css';

export default function App() {
	const theme = createTheme({
		palette: {
			primary: { main: '#9a0606' },
			secondary: { main: '#5dd95d' },
			tertiary: { main: '#54a9de' },
			favorite: { main: '#D4AF37' },
			watchlist: { main: '#0dcaf0' },
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<UserProvider>
				<Header />
				<Routes>
					<Route path='/login/' element={<Login />} />
					<Route path='/logout/' element={<Logout />} />
					<Route path='/register/' element={<Register />} />
					<Route path='/forgot-password/' element={<ForgotPassword />} />
					<Route path='/reset-password/:token' element={<ResetPassword />} />
					<Route element={<ProtectedRoutes />}>
						<Route path='/profile' element={<Profile />} />
						<Route path='/' element={<Homepage />} />
						<Route path='/show/:show_id' element={<ShowDetail />} />
						<Route path='/artist/:artist_id' element={<Artist />} />
						<Route path='/country/:country_id' element={<Country />} />
						{/* <Route path='/about' element={<About />} /> */}
					</Route>
				</Routes>
				<Footer />
			</UserProvider>
		</ThemeProvider>
	);
}
