import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/APIs/Context';
import './app.css';
import ProtectedRoutes from './components/APIs/ProtectedRoutes';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Register from './components/Register';
import Login from './components/Login';
import Footer from './components/Footer';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ShowDetail from './components/ShowDetail';

export default function App() {
	const theme = createTheme({
		palette: {
			primary: { main: '#9a0606' },
			secondary: { main: '#5dd95d' },
			tertiary: { main: '#54a9de' },
		},
	});
	const noNavbar = ['/register/', '/login/'];

	return (
		<ThemeProvider theme={theme}>
			<UserProvider>
				<Header />
				<Routes>
					<Route path='/login/' element={<Login />} />
					<Route path='/show/:show_id' element={<ShowDetail />} />
					<Route path='/register/' element={<Register />} />
					<Route path='/forgot-password/' element={<ForgotPassword />} />
					<Route path='/reset-password/:token' element={<ResetPassword />} />

					<Route element={<ProtectedRoutes />}>
						<Route path='/' element={<Homepage />} />
						{/* <Route path='/about' element={<About />} /> */}
					</Route>
				</Routes>
				<Footer />
			</UserProvider>
		</ThemeProvider>
	);
}
