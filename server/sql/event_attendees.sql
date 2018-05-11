use bike;

drop table if exists event_attendees;

create table event_attendees
	(id int not null auto_increment,
	event_id int not null,
	attendee_id int not null,
	attending varchar(10) not null default 'no',
	reason varchar(100),
	reason_time timestamp default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	message varchar(200) default '',
	email_code_a varchar(100) default '',
	email_code_b varchar(100) default '',
	primary key (id)
	);

create index event_index on event_attendees (event_id);
create index attendee_index on event_attendees (attendee_id);
