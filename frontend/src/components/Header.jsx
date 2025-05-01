// Remember to add  if request.path == url bg-white rounded-pill opacity-50 endif

export default function Header() {
	return (
		<header className='container d-flex flex-lg-row flex-column'>
			<img id='logo' className='navbar-brand' src='/logo.png' />

			<nav className='navbar navbar-expand navbar-dark my-3 my-xl-0'>
				<ul className='navbar-nav glassy'>
					<a href='/' className='nav-link'>
						<i className='bi-house'></i>
						Home
					</a>

					<li href=' url ' className='nav-link'>
						<i className='bi-search-heart'></i>
						Explore
					</li>

					<li href=' url ' className='nav-link'>
						<i className='bi-moon-stars-fill'></i>
						Fantasy
					</li>

					<li href=' url ' className='nav-link'>
						<i className='bi-magic'></i>
						Luck
					</li>
					<li href='/admin' className='nav-link d-sm-block d-none'>
						<i className='bi-person-gear'></i>
						Admin
					</li>

					<li href=' url ' className='nav-link'>
						<img className='rounded-circle' src='/PP' />
						Name
					</li>

					<a href='/login/' className='nav-link'>
						<i className='bi-person'></i>
						Profile
					</a>
				</ul>
			</nav>

			<input
				id='searchbar'
				className='glassy'
				// value={'SOME KIND OF A SHOW'}
				placeholder='Show, Artist, anything....'
				type='search'
				dir='ltr'
				spellCheck={false}
				autoCorrect='off'
				autoComplete='off'
				autoCapitalize='off'
				maxLength='2048'
				tabIndex='1'
			/>
		</header>
	);
}
