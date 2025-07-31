import { useContext } from 'react';
import { Container } from "@mui/material";
import { UserContext } from "../APIs/Context.jsx";

export default function AlreadyLoggedIn() {
	const { username } = useContext(UserContext);
	return (
		<Container className='my-5' maxWidth='sm'>
			<div className='d-flex flex-column glassy align-items-center text-center p-4 px-0 px-sm-5'>
				<h3 className='fw-bold secondaryColor my-3'>
					<i className='bi-person-check'></i>&nbsp;You are already logged in as {username}!
				</h3>
				<br />
				<a className='text-decoration-none text-info' href='/' style={{ fontSize: '1.5rem' }}>
					<i className='bi-house'></i> Go to homepage
				</a>
				<br />
				<a className='btn btn-link text-decoration-none text-danger' href='/logout' style={{ fontSize: '1rem' }}>
					<i className='bi-person-dash'></i> Logout
				</a>
			</div>
		</Container>
	);
}
