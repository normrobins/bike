use bike;

drop table if exists bike_manufacturers;

create table bike_manufacturers
	(id int not null auto_increment,
	manufacturer varchar(50) not null,
	created TIMESTAMP not null default CURRENT_TIMESTAMP,
	status varchar(20),
	primary key (id)
	);

create index man on bike_manufacturers(manufacturer);
