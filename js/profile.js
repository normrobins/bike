/*
 * Update Profile page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			loadProfile ();
			loadBikeImages ();
		}
		else {
			$('#view-profile-msg').html ("Not logged in").show ();
			setNavbar (false, '', 'Something went wrong');
		}
	})
	.fail (function (response) {
		$('#view-profile-msg').html ("Failed").show ();
		setNavbar (false, '', 'Something failed');
	});

	return false;
});

/*
 * out = userid of the profile to view (no params means getProfile returns logged in user's profile
 * in =	[[status[OK|NOTOK], err_msg]
 *       [username, firstname, lastname, email, phone, location, lat, lng, 
 *		gender_id, gender_txt,age_id,age_txt, ability_id,ability_txt, bio, bike_mfg, bike_model, bike_year]
 *       [profile_image_id, filepath/filename]]
 */
function loadProfile () {
	$.post (server + "getProfile.php", {userid:getParameterByName('q')})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var img_src = (resp.length == 3 ? image_server + resp[2][1] : 'img/generic_user.png');
			$('#firstname').html(resp[1][1]);
			$('#lastname').html(resp[1][2]);
			$('#email').html(resp[1][3]);
			$('#phone').html(resp[1][4]);
			$('#location').html(resp[1][5]);
			$('#gender').html(resp[1][8] == '0' ? 'Not specified' : resp[1][9]);
			$('#age').html(resp[1][10] == '0' ? 'Not specified' : resp[1][11]);
			$('#ability').html(resp[1][12] == '0' ? 'Not specified' : resp[1][13]);
			$('#bio').html(resp[1][14]);
			$('#bike-manufacturer').html(resp[1][15]);
			$('#bike-model').html(resp[1][16]);
			$('#bike-year').html(resp[1][17]);
			$('#profile-image').attr('src',img_src);
			$('#profile-image-link').attr('href',img_src);
		}
		else {
			$('#firstname').html('Not found');
		}
	})
	.fail (function (response) {
		$('#view-profile-msg').html ('Failed').show ();
	});
	return false;
}

function loadBikeImages () {
	$.post (server + "getProfileBikeImages.php", {userid:getParameterByName('q')})
	.done (function (response) {
		var resp = $.parseJSON(response);
		if (resp[0][0] == 'OK') {
			var h = '';
			// if there are images they are in the second array element
			if (resp.length == 2) {
				var img = resp[1];
				for (x = 0; x < img.length; x++) {
					h += '<a href="' + image_server+img[x][1] + '">'
					+ '<img class="bike-image" src="' + image_server+img[x][1] + '">'
					+ '</a>';
				}
			}
			$('#bike-images').html (h);
		} else {
			$('#update-profile-msg').html ("Error loading images").show ();
		}
	})
	.fail (function() {
	});
}
