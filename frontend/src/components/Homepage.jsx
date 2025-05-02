import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export default function Homepage() {
	// const [currentTab, setCurrentTab] = useState(0);
	
	// // Random Shows refresh
	// function randomShowsRefresh(){
	//     $.ajax({
	//         type: "GET",
	//         url: "{% url 'random_shows_query' %}",
	//         data: {
	//             template: "components/bgShowCard.html"
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

	return (
		<section class='container'>
			
			<Tabs defaultActiveKey='new' id='homepageTabs' className='mb-3' justify>
				<Tab eventKey='favorites' title={<span class='homeNav text-warning bi-star-fill'> Favorites (0)</span>}>
                    Favorites
                </Tab>
				<Tab eventKey='watchlist' title={<span class='homeNav text-info bi-list-columns'> Watchlist (0)</span>}>
					Watchlist
				</Tab>
				<Tab eventKey='new' title={<span class='homeNav primaryColor bi-fire'> New</span>}>
					New
				</Tab>
				<Tab eventKey='history' title={<span class='homeNav tertiaryColor bi-clock-history'> History</span>}>
					History
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
