<?php
	// Set CORS response headers
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Credentials: true ");
	header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
	header("Access-Control-Allow-Headers: X-Requested-With, content-type, access-control-allow-origin, access-control-allow-methods, access-control-allow-headers");

	error_reporting(E_ERROR | E_PARSE);

	// Determine requested action
	if (isset($_GET["action"]) && !empty($_GET["action"])) {
		$action = $_GET["action"];
		switch ($action) {
			case "search":
				search($_GET["search"], $_GET["latitude"], $_GET["longitude"]);
				break;
			case "loadPage":
				loadPage($_GET["url"]);
				break;
			case "loadDetails":
				loadDetails($_GET["id"]);
				break;
			default: exit;
		}
	}

	function search($search, $latitude, $longitude) {
		// Facebook API access token
		$access_token = "EAASUD5YjcQ4BABS1vQJtpi04oPj1eMsRhsKOLEGnQ5ObPW51biTD5tyyuT9HrVf1Uvoxu07p5r1juVUp8nH7hq959w0C0RDZAYXGVYLFescycfCFavprCgz7oUnBDUndqzz2R2grya20YxutZB";

		// Construct queries
		$search = urlencode($search);
		$users_query = "https://graph.facebook.com/v2.8/search?q=" . $search . "&type=user&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;
		$pages_query = "https://graph.facebook.com/v2.8/search?q=" . $search . "&type=page&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;
		$events_query = "https://graph.facebook.com/v2.8/search?q=" . $search . "&type=event&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;
		$places_query = "https://graph.facebook.com/v2.8/search?q=" . $search . "&type=place&fields=id,name,picture.width(700).height(700)&center=" . $latitude . "," . $longitude . "&access_token=" . $access_token;
		$groups_query = "https://graph.facebook.com/v2.8/search?q=" . $search . "&type=group&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;

		// Send HTML requests
		$data["users"] = file_get_contents($users_query);
		$data["pages"] = file_get_contents($pages_query);
		$data["events"] = file_get_contents($events_query);
		$data["places"] = file_get_contents($places_query);
		$data["groups"] = file_get_contents($groups_query);

		// Send content back to application
		echo json_encode($data);
	}

	function loadPage($url) {
		// Facebook API access token
		$access_token = "EAASUD5YjcQ4BABS1vQJtpi04oPj1eMsRhsKOLEGnQ5ObPW51biTD5tyyuT9HrVf1Uvoxu07p5r1juVUp8nH7hq959w0C0RDZAYXGVYLFescycfCFavprCgz7oUnBDUndqzz2R2grya20YxutZB";

		// Send HTML request
		$data = file_get_contents($url);

		// Send content back to application
		echo $data;
	}

	function loadDetails($id) {
		// Facebook API access token
		$access_token = "EAASUD5YjcQ4BABS1vQJtpi04oPj1eMsRhsKOLEGnQ5ObPW51biTD5tyyuT9HrVf1Uvoxu07p5r1juVUp8nH7hq959w0C0RDZAYXGVYLFescycfCFavprCgz7oUnBDUndqzz2R2grya20YxutZB";

		// Get albums and posts
		$query = "https://graph.facebook.com/v2.8/" . $id . "?fields=albums.limit(5){name,photos.limit(2){name,picture}},posts.limit(5)&access_token=" . $access_token;
		$response = json_decode(file_get_contents($query), true);

		$data["albums"] = array();
		$data["posts"] = array();
		if ($response === false) {
			echo json_encode($data);
			exit;
		}

		// Get album photos
		if (array_key_exists("albums", $response)) {
			$albums = $response["albums"]["data"];
			foreach ($albums as $album) {
				$a["name"] = $album["name"];
				$a["photos"] = array();
				foreach ($album["photos"]["data"] as $photo) {
					$query = "https://graph.facebook.com/v2.8/" . $photo["id"] . "/picture?redirect=false&access_token=" . $access_token;
					$album_response = json_decode(file_get_contents($query), true);
					$img_url = $album_response["data"]["url"];
					array_push($a["photos"], $img_url);
				}
				array_push($data["albums"], $a);
			}
		}
		
		// Get post messages
		if (array_key_exists("posts", $response)) {
			$posts = $response["posts"]["data"];
			foreach ($posts as $post) {
				$p["message"] = $post["message"];
				$p["created_time"] = $post["created_time"];
				array_push($data["posts"], $p);
			}
		}
		
		// Send content back to application
		echo json_encode($data);
	}

?>