// Get user's location
var geolocSuccess = false;
var latitude = 0, longitude = 0;

// if (navigator.geolocation) {
// 	var location_timeout = setTimeout("geolocFail()", 10000);
// 	navigator.geolocation.getCurrentPosition(function(position) {
//         clearTimeout(location_timeout);
//         latitude = position.coords.latitude;
//         longitude = position.coords.longitude;
//         geolocSuccess = true;
//         console.log("User's location: " + latitude + ", " + longitude);
//     }, function(error) {
//         clearTimeout(location_timeout);
//         geolocFail();
//     });
// } else geolocFail();

// function geolocFail() {
// 	alert("Failed to detect user's location.");
// }

// Check for local storage
var storageSupport = false;
var favorites = [];
if (typeof(Storage) === "undefined") {
	alert("No web storage support.");
} else {
	storageSupport = true;
	localStorage.setItem("favorites", null);
	favorites = localStorage.getItem("favorites");
	console.log("Loaded favorites: " + favorites);
	favorites = JSON.parse(favorites);
}

// Load Facebook SDK for JavaScript
window.fbAsyncInit = function() {
	FB.init({
		appId: '1206266966108255',
		xfbml: true,
		version: 'v2.8'
    });
    FB.AppEvents.logPageView();
};
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));

$(document).ready(function() {
	// Assign active tab
	$(".nav-tabs a[href='#users']").tab("show");
});

// Construct AngularJS module
var app = angular.module("fbSearchApp", ["ngAnimate"]);

// Set up controller
app.controller('fbSearchCtrl', ['$scope', function($scope) {

	$scope.tabs = [ "users", "pages", "events", "places", "groups" ];

	$scope.showTabProgressBars = false;

	$scope.data = {
		users: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
		pages: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
		events: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
		places: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
		groups: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null }
	};

	$scope.favorites = favorites;
	$scope.favorites_details = false;
	$scope.favorites_albums = null;
	$scope.favorites_posts = null;
	$scope.favorites_loadingDetails = false;
	$scope.favorites_selected = null;

	// On clear button click
	$scope.clear = function() {
		$scope.data = {
			users: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			pages: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			events: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			places: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			groups: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null }
		};
	}

	// On search button click
	$scope.search = function() {
		// Show progress bars
		$scope.showTabProgressBars = true;

		// Reset data
		$scope.data = {
			users: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			pages: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			events: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			places: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null },
			groups: { data: null, paging: null, details: false, loadingDetails: false, albums: null, posts: null, selected: null }
		};

		// if (geolocSuccess == false) {
		// 	alert("Detecting user's location. Please try again.");
		// 	return;
		// }

		// Validate user input
		var search = $("#search-text-field").val();
		if (search == "") {
			alert("Please enter a search query.");
			return;
		}
		console.log("Search query for: " + search);

		// Send search request to server
	    $.ajax({
	    	type: "GET",
	    	url: "http://localhost/FBSearch/index.php",
	    	// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: "application/json",
	    	xhrFields: { withCredentials: false },
	    	data: {action: "search", search: search, latitude: latitude, longitude: longitude},
	    	
	    	success: function(response, status, xhr) {
	    		// Parse the JSON response
	    		response = JSON.parse(response);
	    		var users = JSON.parse(response["users"]);
	    		var pages = JSON.parse(response["pages"]);
	    		var events = JSON.parse(response["events"]);
	    		var places = JSON.parse(response["places"]);
	    		var groups = JSON.parse(response["groups"]);

	    		var data = {
	    			users: { data: users["data"], paging: users["paging"] },
	    			pages: { data: pages["data"], paging: pages["paging"] },
	    			events: { data: events["data"], paging: events["paging"] },
	    			places: { data: places["data"], paging: places["paging"] },
	    			groups: { data: groups["data"], paging: groups["paging"] }
	    		};
	    		
	    		$scope.$apply(function() {
	    			// Update panels
	    			for (var key in $scope.data) {
	    				$scope.data[key]["data"] = data[key]["data"];
	    				$scope.data[key]["paging"] = data[key]["paging"];
	    			}

	    			// Hide progress bars
					$scope.showTabProgressBars = false;
	    		});
	    	},
	    	error: function(xhr, status, error) {
	    		// Parse the error
	    		console.log("Failed with status: " + status + " and error: " + error);
	    	}
	    });
	};

	// On pagination button click
	$scope.turnPage = function(panel, direction) {

		console.log("Turning to " + direction + " for panel " + panel);
		var url = $scope.data[panel]["paging"][direction];
		console.log("Page url: " + url);

		// Send load page request to server
		$.ajax({
			type: "GET",
			url: "http://localhost/FBSearch/index.php",
			// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: "application/json",
	    	xhrFields: { withCredentials: false },
	    	data: {action: "loadPage", url: url},
	    	
	    	success: function(response, status, xhr) {
	    		var data = JSON.parse(response);

	    		// Update specified panel
	    		$scope.$apply(function() {
	    			$scope.data[panel]["data"] = data["data"];
	    			$scope.data[panel]["paging"] = data["paging"];
	    		});
	    	},
	    	error: function(xhr, status, error) {
	    		// Parse the error
	    		console.log("Failed with status: " + status + " and error: " + error);
	    	}
		});
	};

	// On details button click
	$scope.showDetails = function(panel, selected) {
		if (panel == "favorites") {
			// Show progress bars
			$scope.favorites_loadingDetails = true;

			// Reset albums and posts
			$scope.favorites_albums = null;
			$scope.favorites_posts = null;

			$scope.favorites_details = true;
			$scope.favorites_selected = selected;
		}
		else {
			// Show progress bars
			$scope.data[panel]["loadingDetails"] = true;

			// Reset albums and posts
			$scope.data[panel]["albums"] = null;
			$scope.data[panel]["posts"] = null;
			$scope.data[panel]["selected"] = null;

			$scope.data[panel]["details"] = true;
			$scope.data[panel]["selected"] = selected;
			
		}
		console.log("Loading details for panel: " + panel + " and id: " + selected["id"]);

		// Send load details request to server
		$.ajax({
			type: "GET",
			url: "http://localhost/FBSearch/index.php",
			crossDomain: true,
			contentType: "application/json",
			xhrFields: { withCredentials: false },
			data: {action: "loadDetails", id: selected["id"]},

			success: function(response, status, xhr) {
				response = JSON.parse(response);
				
				$scope.$apply(function() {
					if (panel == "favorites") {
						// Update details panel
						$scope.favorites_albums = response["albums"];
						$scope.favorites_posts = response["posts"];

						// Hide progress bars
						$scope.favorites_loadingDetails = false;
					}
					else {
						// Update details panel
						$scope.data[panel]["albums"] = response["albums"];
						$scope.data[panel]["posts"] = response["posts"];

						// Hide progress bars
						$scope.data[panel]["loadingDetails"] = false;
					}
				});
			},
			error: function(xhr, status, error) {
				// Parse the error
				console.log("Failed with status: " + status + " and error: " + error);
			}
		});
	};

	// On details back button click
	$scope.hideDetails = function(panel) {
		if (panel == "favorites") {
			$scope.favorites_details = false;
		} else {
			$scope.data[panel]["details"] = false;
		}
	};

	// Formats date time stamps
	$scope.formatDateTime = function(datetime) {
		return moment(datetime).format("YYYY-MM-DD h:mm:ss");
	};

	// On post to Facebook button click
	$scope.postToFacebook = function(info, favorites=false) {
		console.log("Posting to FB about: " + info["name"]);
		var picture = "";
		if (favorites === true) {
			picture = info["img"];
		} else {
			picture = info["picture"]["data"]["url"];
		}
		FB.ui({
			app_id: "1206266966108255",
			method: "feed",
			link: window.location.href,
			picture: picture,
			name: info["name"],
			caption: "FB SEARCH FROM USC CSCI571" },
			function(response) {
				if (response && !response.error_message) {
					alert("Posted Successfully");
				} else {
					alert("Not Posted");
				}
			}
		);
	};

	$scope.toggleFavorite = function(info, panel) {
		console.log("Toggling favorite for " + info["id"] + " of type " + panel);

		// Check for browser storage support
		if (!storageSupport) {
			alert("No web storage support.");
			return;
		}
		
		// Toggle id in favorites
		var favorite;
		if (panel == "favorites") {
			favorite = { id: info["id"], name: info["name"], type: panel, img: info["img"] };
		} else {
			favorite = { id: info["id"], name: info["name"], type: panel, img: info["picture"]["data"]["url"] };
		}
		if ($scope.favorites == null) {
			// Add to favorites
			$scope.favorites = [favorite];
		} else {
			var index = -1;
			for (var i = 0; i < $scope.favorites.length; i++) {
				if ($scope.favorites[i]["id"] == info["id"]) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				// Remove from favorites
				$scope.favorites.splice(index, 1);
			} else {
				// Add to favorites
				$scope.favorites.push(favorite);
			}
		}
		localStorage.setItem("favorites", JSON.stringify($scope.favorites));
		console.log("Updated favorites: " + JSON.stringify($scope.favorites));
	}

	$scope.isFavorite = function(id) {
		// Check for browser storage support
		if (!storageSupport) {
			alert("No web storage support.");
			return false;
		}

		// Check for id in favorites
		if ($scope.favorites == null) {
			return false;
		}
		var index = -1;
		for (var i = 0; i < $scope.favorites.length; i++) {
			if ($scope.favorites[i]["id"] == id) {
				index = i;
				break;
			}
		}
		if (index > -1) {
			return true;
		} else {
			return false;
		}
	}

	$scope.removeFavorite = function(id) {
		// Check for browser storage support
		if (!storageSupport) {
			alert("No web storage support.");
			return false;
		}

		// Check for id in favorites
		if ($scope.favorites == null) {
			return;
		}
		var index = -1;
		for (var i = 0; i < $scope.favorites.length; i++) {
			console.log($scope.favorites[i]);
			if ($scope.favorites[i]["id"] == id) {
				index = i;
				break;
			}
		}
		if (index > -1) {	// Remove from favorites
			$scope.favorites.splice(index, 1);
		} else {	// Not found
			return;
		}
		localStorage.setItem("favorites", JSON.stringify($scope.favorites));
		console.log("Updated favorites: " + JSON.stringify($scope.favorites));
	}
}]);
