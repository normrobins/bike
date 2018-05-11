use bike;

drop table if exists verify_email;

create table verify_email
	(id int not null auto_increment,
	userid int not null,
	code_a varchar(50) not null,
	code_b varchar(50) not null,
	primary key (id)
	);

