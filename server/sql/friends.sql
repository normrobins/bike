use bike;

drop table if exists friends;

create table friends
	(id int not null auto_increment,
	created_on timestamp default CURRENT_TIMESTAMP,
	user_id int not null,
	friend_id int not null,
	last_used boolean default 0,
	status varchar(100),
	related_id int,
	primary key (id)
	);

