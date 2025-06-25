import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import axiosInstance from './APIs/Axios';
import ShowCard from './snippets/ShowCard';
import { useState, useEffect } from 'react';

export default function Homepage() {
	const [loading, setLoading] = useState(true);
	const [shows, setShows] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Fetch shows data when the component mounts
		const fetchShows = async () => {
			try {
				const response = await axiosInstance.get('/shows/randomShows/');
				setShows(response.data);
				console.log('Retrieved data: ', response.data);
			} catch (error) {
				console.error('Error fetching shows data:', error);
				setError(error.response.data || 'A Timeout error occurred while fetching data.\nDid\'t receive a valid response from the server in time.');
			}
			setLoading(false);
		};
		fetchShows();
	}, []);
	// const [currentTab, setCurrentTab] = useState(0);

	// // Random Shows refresh
	// function randomShowsRefresh(){
	//     $.ajax({
	//         type: "GET",
	//         url: "{% url 'random_shows_query' %}",
	//         data: {
	//             template: "components/showCard.html"
	//         },
	//         success: function(data){
	//             $("#randomShowsDiv").html(data)
	//         }
	//     })
	// }

	// // Tabs Key presses
	// document.addEventListener('keypress', (event) => {
	//     // 1 --> favorites
	//     if (document.activeElement != searchbar && event.code == "Digit1") {
	//         $("[data-name=favorites]").click()
	//     } else
	//     // 2 --> watchlist
	//     if (document.activeElement != searchbar && event.code == "Digit2") {
	//         $("[data-name=watchlist]").click()
	//     } else
	//     // 3 --> new
	//     if (document.activeElement != searchbar && event.code == "Digit3") {
	//         $("[data-name=new]").click()
	//     } else
	//     // 4 --> history
	//     if (document.activeElement != searchbar && event.code == "Digit4") {
	//         $("[data-name=history]").click()
	//     } else
	//     // 5 --> random
	//     if (document.activeElement != searchbar && event.code == "Digit5") {
	//         $("[data-name=random]").click()
	//     }
	// }, false);
	if (loading) {
		return (
			<div className='text-center text-light mt-5'>
				<h3>Loading...</h3>
			</div>
		);
	} else if (error) {
		return (
			<div className='text-center text-light mt-5'>
				<h3 className='text-danger'>Error loading shows. Please contact an admin!</h3>
				<h4 className='mt-5'>Error Details:</h4>
				<p id='error_details'>{error}</p>
			</div>
		);
	} else {
		return (
			<section class='container my-5'>
				<Tabs defaultActiveKey='new' id='homepageTabs' className='mb-3' justify>
					<Tab eventKey='favorites' title={<span class='homeNav text-warning bi-star-fill'> Favorites (0)</span>}></Tab>
					<Tab eventKey='watchlist' title={<span class='homeNav text-info bi-list-columns'> Watchlist (0)</span>}>
						{/* {shows.map((show) => {
							return <ShowCard key={show.id} show={show} />;
						})} */}
					</Tab>
					<Tab eventKey='new' title={<span class='homeNav primaryColor bi-fire'> New</span>}>
						{shows.map((show) => {
							return <ShowCard key={show.id} show={show} />;
						})}
					</Tab>
					<Tab eventKey='history' title={<span class='homeNav tertiaryColor bi-clock-history'> History</span>}>
						<h2 className='text-primary'>Coming soon!</h2>
						<p>History content will be displayed here.</p>
					</Tab>
					<Tab eventKey='random' title={<span class='homeNav secondaryColor bi-magic'> For you</span>}>
						<span class='h3 primaryColor mb-5'>
							<b class='bi-arrow-repeat' onclick='randomShowsRefresh()'></b>
						</span>
						<br />
						<div id='randomShowsDiv'>RANDOM</div>
					</Tab>
				</Tabs>

				<div class='text-end mt-3 me-5'>
					<a class='text-info text-decoration-none' href="{% url 'explore' %}">
						Discover <strong>NEW</strong> Content?
						<br />
						Go to &nbsp;
						<strong>
							<i class='bi-search-heart'></i> Explore
						</strong>
					</a>
				</div>
			</section>
		);
	}
}
