import { Container } from "@mui/material";
import { logout } from '../APIs/AuthRequests.jsx';

export default function AlreadyLoggedIn() {
	return (
		<Container className='my-5' maxWidth='sm'>
			<div className='d-flex flex-column glassy align-items-center text-center p-4 px-0 px-sm-5'>
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
			</div>
		</Container>
	);
}
