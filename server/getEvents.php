<?php
	/*
 	 * getEvents - returns list of events.
	 * Return structure is the same, all that varies is the query
	 * in [filter=allEvents|pastEvents|eventsIOwn|eventsIAmAttending]
	 * 	all: no params
	 *	past: older_by:months
	 *	iown: no params
	 *	iamattending: no params
	 * out = [status(OK|NOTOK)], [event_id, start, finish, invite_type, title, ride_type,
	 *		description, max_attendees, num_attendees, owner_id, owner_fname, owner_lname, **profile_image,
	 *		logged_in, is_owner, is_attending, reason [[attendee_id, fname, lname],[..]]]
 	 */
	include "dbLogin.php";

	$ret_data[] = array ("NOTOK", "Server error");
	$user_id = false;
	$logged_in = "0";

	// If logged in, I will highlight events that I am the owner of
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
		$logged_in = "1";
	} 
	session_write_close ();


	// generic select / join for all queries. 'where' clause appended depending on 'filter'
	$select = "select e.id, date_format(e.start_date,'%d %b %Y') as start, date_format(e.finish_date,'%d %b %Y') as finish,
			e.invite_type, e.title, e.type, e.description, e.owner_id, e.max_attendees, e.num_attendees, e.location,
			uu.firstname as owner_fname, uu.lastname as owner_lname, 
			pi.image_file as owner_profile_image,
			a.attending, a.reason, a.attendee_id,
			u.firstname as attendee_fname, u.lastname as attendee_lname, att_pi.image_file as attendee_profile_image
		from users uu, events e 
		left join event_attendees a on e.id = a.event_id and a.attending in ('yes', 'pending')
		left join profile_images pi on e.owner_id = pi.userid and pi.image_type='profile' and pi.status='active'
		left join profile_images att_pi on a.attendee_id = att_pi.userid and att_pi.image_type='profile' and att_pi.status='active'
		left join users u on u.id = a.attendee_id
		where uu.id = e.owner_id ";

	if (($db=dbLogin()) != false) {
		// set where clause depending on filter
		$filter=$_POST['filter'];
		if ($filter == 'eventsIAmAttending') {
			// get list of events that I am attending
			$event_ids='';
			$sql = "select event_id from event_attendees where attendee_id=$user_id and attending='yes'";
			$result = $db->query($sql);
			if ($result) {
				$conn = '';
				while ($row = $result->fetch_assoc()) {
					$event_ids .= $conn . $row['event_id'];
					$conn = ',';
				}
			}
			$result->close();
			// if no events set id to -1 so no rows will be returned
			if ($event_ids == '') {
				$event_ids = -1;
				// no events, just return success
				$ret_data[0][0] = "OK";
			}
			$sql = $select . " and e.id in ($event_ids)
				and e.start_date >= curdate()
				order by e.start_date asc, e.id asc";
		} else if ($filter == 'eventsIOwn') {
			$sql = $select . " and e.start_date >= curdate()
				and e.owner_id = $user_id
				order by e.start_date asc, e.id asc";
		} else if ($filter == 'eventsAround') {
			$lat = $_POST['lat'];
			$lng = $_POST['lng'];
			$lat_search_range = LAT_SEARCH_RANGE;
			$lng_search_range = LNG_SEARCH_RANGE;
			$sql = $select . " and e.start_date >= curdate()
				and e.lat < $lat+$lat_search_range and e.lat > $lat-$lat_search_range
				and e.lng < $lng+$lng_search_range and e.lng > $lng-$lng_search_range
				order by e.start_date asc, e.id asc";
		} else if ($filter == 'pastEvents') {
			$older_by = $_POST['older_by'];
			$sql = $select . " and e.start_date >= date_sub(curdate(), INTERVAL $older_by month)
				and e.start_date < curdate()
				order by e.start_date desc";
		} else {
			// all Events
			$sql = $select . " and e.start_date >= curdate()
				order by e.start_date asc, e.id asc";
		}

		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			$this_event_id = 0;
			$first_row = true;
			$owner = 0;
			$attending = 'no';
			$reason='';
			$prev_row = false;
			while ($row = $result->fetch_assoc()) {
				if ($row['id'] != $this_event_id) {
					// new event. Reset event_id
					$this_event_id = $row['id'];
					// write out the previous event (unless first row), then process this row
					if ($first_row) {
						$first_row = false;
						// save this row
						$prev_row = $row;
						// add attendee (if any) to attendees array
						if (($row['attendee_id'] == null) || ($row['attending'] != 'yes')) {
							// if no attendees set to an empty array
							$attendees = array ();
						} else {
							$attendees[] = array (
								$row['attendee_id'],
								$row['attendee_fname'],
								$row['attendee_lname'],
								$row['attendee_profile_image']
							);
						}
					} else {
						// not first row
						// copy previous attendees, check attending/owner
						$prev_attendees = $attendees;
						$prev_attending = $attending;
						$prev_reason = $reason;
						$prev_owner = ($owner > 0) ? '1' : '0';
						// and write out the previous event
						$ret_data[] = array(
							$prev_row['id'],
							$prev_row['start'],
							$prev_row['finish'],
							$prev_row['invite_type'],
							$prev_row['title'],
							$prev_row['type'],
							$prev_row['description'],
							$prev_row['max_attendees'],
							$prev_row['num_attendees'],
							$prev_row['location'],
							$prev_row['owner_id'],
							$prev_row['owner_fname'],
							$prev_row['owner_lname'],
							$prev_row['owner_profile_image'],
							$logged_in,
							$prev_owner,
							$prev_attending,
							$prev_reason,
							$prev_attendees
						);
						// clear attendees array and reload current row
						unset ($attendees);
						$attending = 'no';
						$reason = '';
						$owner = 0;
						// save this (current) row
						$prev_row = $row;

						// copy attendees if not null
						if (($row['attendee_id'] == null) || ($row['attending'] != 'yes')) {
							$attendees = array ();
						} else {
							$attendees[] = array (
								$row['attendee_id'],
								$row['attendee_fname'],
								$row['attendee_lname'],
								$row['attendee_profile_image']
							);
						}
					}
					// (this row): if logged in user is an attendee set attending=yes|pending
					if ($user_id == $row['attendee_id']) {
						$attending = $row['attending'];
						$reason = $row['reason'];
					} 
					// if logged in user is owner, then set owner field
					if ($row['owner_id'] == $user_id) {
						$owner++;
					}
					// end of if (new event)
				} else {
					// not new event. Just add attendee if attending
					if ($row['attending'] == 'yes') {
						$attendees[] = array (
							$row['attendee_id'],
							$row['attendee_fname'],
							$row['attendee_lname'],
							$row['attendee_profile_image']
						);
					}
					// (this row): if logged in user is attendee then set attending(yes/no/pending) and reason
					if ($user_id == $row['attendee_id']) {
						$attending = $row['attending'];
						$reason = $row['reason'];
					} 
					// (this row): if owner_id is the same as logged in user, then owner=1;
					if ($row['owner_id'] == $user_id) {
						$owner++;
					}
				}
			}
			// write out the last prev_row (if any). Copy current attendees to prev_attendees
			if ($prev_row) {
				$prev_attendees = $attendees;
				$prev_attending = $attending;
				$prev_reason = $reason;
				$prev_owner = ($owner > 0) ? '1' : '0';
				$ret_data[] = array(
					$prev_row['id'],
					$prev_row['start'],
					$prev_row['finish'],
					$prev_row['invite_type'],
					$prev_row['title'],
					$prev_row['type'],
					$prev_row['description'],
					$prev_row['max_attendees'],
					$prev_row['num_attendees'],
					$prev_row['location'],
					$prev_row['owner_id'],
					$prev_row['owner_fname'],
					$prev_row['owner_lname'],
					$prev_row['owner_profile_image'],
					$logged_in,
					$prev_owner,
					$prev_attending,
					$prev_reason,
					$prev_attendees
				);
			}
			$result->close();
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
