use bike;

drop table if exists events;

/* title and description have extra chars to allow for html char conversions */

/* decription is 4000 to allow for special chars - screen length is only 2000 */
create table events
	(id int not null auto_increment,
	owner_id int not null,
	title varchar(200),
	location varchar(200),
	lat decimal (8,4) default 0,
	lng decimal (8,4) default 0,
	description varchar(4000),
	start_date date,
	finish_date date,
	type varchar(50),
	invite_type varchar(50),
	max_attendees int default 0,
	num_attendees int default 0,
	created_on timestamp default CURRENT_TIMESTAMP,
	primary key (id)
	);

create index start_idx on events (start_date);
create index owner_idx on events (owner_id);
