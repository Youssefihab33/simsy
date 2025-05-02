export default function AlreadyLoggedIn() {
	return (
		<>
			<span>&nbsp;Already logged in</span>
			<br />
			<a className='text-decoration-none text-info' href='/' style={{ fontSize: '1.5rem' }}>
				<i className='bi-house'></i> Go to homepage
			</a>
			<br />
			<a
				className='text-decoration-none text-danger'
				onClick={() => {
					localStorage.removeItem('token');
					navigate('/login/');
				}}
				style={{ fontSize: '1rem' }}
			>
				<i className='bi-person-dash'></i> Logout
			</a>
		</>
	);
}
