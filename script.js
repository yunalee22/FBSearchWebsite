// Construct AngularJS module
var app = angular.module("fbSearchApp", ["ngAnimate"]);

// Set up controller
app.controller('fbSearchCtrl', ['$scope', function($scope) {

	$scope.data = {
		users: { data: null, paging: null, details: false },
		pages: { data: null, paging: null, details: false },
		events: { data: null, paging: null, details: false },
		places: { data: null, paging: null, details: false },
		groups: { data: null, paging: null, details: false }
	};

	// On search button click
	$scope.search = function() {

		// Validate user input
		var search = $("#search-text-field").val();
		if (search == "") {
			alert("Please enter a search query.");
			return;
		}
		console.log("Search query for: " + search);

		// Get user's current location
		var latitude = 0, longitude = 0;
		navigator.geolocation.getCurrentPosition(
			function(pos) {		// On success
				var crd = pos.coords;
				latitude = crd.latitude;
				longitude = crd.longitude;
			},
			function() {		// On error
				alert("User's location could not be detected.");
				return;
			},
			{	// Options
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0
			}
		);

		// Make HTTP request to Facebook API
	    $.ajax({
	    	type: 'GET',
	    	url: "http://localhost/FBSearch/index.php",
	    	// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: 'application/json',
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

		$.ajax({
			type: 'GET',
			url: "http://localhost/FBSearch/index.php",
			// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: 'application/json',
	    	xhrFields: { withCredentials: false },
	    	data: {action: "loadPage", url: url},
	    	
	    	success: function(response, status, xhr) {
	    		var data = JSON.parse(response);
	    		$scope.$apply(function() {
	    			// Update specified panel
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
	$scope.showDetails = function(panel, id) {
		$scope.data[panel]["details"] = true;
		console.log("Loading details for panel: " + panel + " and id: " + id);
	};

	// On details back button click
	$scope.hideDetails = function(panel) {
		$scope.data[panel]["details"] = false;
	}
}]);