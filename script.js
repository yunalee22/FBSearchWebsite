// Construct AngularJS module
var app = angular.module("fbSearchApp", ["ngAnimate"]);

// Set up controller
app.controller('fbSearchCtrl', ['$scope', function($scope) {

	// Initialize variables
	$scope.users_data = null;	$scope.users_paging = null;		$scope.users_details = false;
	$scope.pages_data = null;	$scope.pages_paging = null;		$scope.pages_details = false;
	$scope.events_data = null;	$scope.events_paging = null;	$scope.events_details = false;
	$scope.places_data = null;	$scope.places_paging = null;	$scope.places_details = false;
	$scope.groups_data = null;	$scope.groups_paging = null;	$scope.groups_details = false;


	// On search button click
	$scope.search = function() {

		// Validate user input
		var search = $("#search-text-field").val();
		if (search == "") {
			alert("Please enter a search query.");
			return;
		}
		console.log("Search query for: " + search);

		// Make HTTP request to Facebook API
	    $.ajax({
	    	type: 'GET',
	    	url: "http://localhost/index.php",
	    	// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: 'text',
	    	xhrFields: { withCredentials: false },
	    	data: {action: "search", search: search},
	    	
	    	success: function(response, status, xhr) {
	    		// Parse the JSON response
	    		var data = JSON.parse(response);
	    		var users = JSON.parse(data["users"]);
	    		var pages = JSON.parse(data["pages"]);
	    		var events = JSON.parse(data["events"]);
	    		var places = JSON.parse(data["places"]);
	    		var groups = JSON.parse(data["groups"]);

	    		$scope.$apply(function() {

	    			// Update users panel
	    			$scope.users_data = users["data"];
	    			$scope.users_paging = users["paging"];

	    			// Update pages panel
	    			$scope.pages_data = pages["data"];
	    			$scope.pages_paging = pages["paging"];
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
		var url;
		switch (panel) {
			case "users": url = $scope.users_paging[direction]; break;
			case "pages": url = $scope.pages_paging[direction]; break;
			case "events": url = $scope.events_paging[direction]; break;
			case "places": url = $scope.places_paging[direction]; break;
			case "groups": url = $scope.groups_paging[direction]; break;
			default: return;
		}

		$.ajax({
			type: 'GET',
			url: "http://localhost/index.php",
			// url: "http://fbsearch-hw8.us-west-2.elasticbeanstalk.com/",
	    	crossDomain: true,
	    	contentType: 'text',
	    	xhrFields: { withCredentials: false },
	    	data: {action: "loadPage", url: url},
	    	
	    	success: function(response, status, xhr) {
	    		var data = JSON.parse(response);
	    		$scope.$apply(function() {
	    			// Update specified panel
	    			switch (panel) {
	    				case "users":
	    					$scope.users_data = data["data"];
	    					$scope.users_paging = data["paging"];
	    					break;
	    				case "pages":
	    					$scope.pages_data = data["data"];
	    					$scope.pages_paging = data["paging"];
	    					break;
	    				case "events":
	    					$scope.events_data = data["data"];
	    					$scope.events_paging = data["paging"];
	    					break;
	    				case "places":
	    					$scope.places_data = data["data"];
	    					$scope.places_paging = data["paging"];
	    					break;
	    				case "groups":
	    					$scope.groups_data = data["data"];
	    					$scope.groups_paging = data["paging"];
	    					break;
	    				default: break;
	    			}
	    			
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

		switch (panel) {
			case "users": $scope.users_details = true; break;
			case "pages": $scope.pages_details = true; break;
			case "events": $scope.events_details = true; break;
			case "places": $scope.places_details = true; break;
			case "groups": $scope.groups_details = true; break;
			default: return;
		}

		console.log("Loading details for panel: " + panel + " and id: " + id);
	};

	// On details back button click
	$scope.hideDetails = function(panel) {
		$scope.users_details = false;
	}
}]);