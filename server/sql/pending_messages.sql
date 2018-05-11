use bike;

drop table if exists pending_messages;

create table pending_messages
	(id int not null auto_increment,
	sender_id int not null,
	recipient_id int not null,
	message varchar(2000),
	message_type varchar(100),
	status varchar(100),
	spare_int int,
	created_at timestamp default CURRENT_TIMESTAMP,
	code_a varchar(30),
	code_b varchar(30),
	primary key (id)
	);

