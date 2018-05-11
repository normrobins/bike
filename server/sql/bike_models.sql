use bike;

drop table if exists bike_models;

create table bike_models
	(id int not null auto_increment,
	manufacturer varchar(50) not null,
	model varchar(50) not null,
	created TIMESTAMP not null default CURRENT_TIMESTAMP,
	status varchar(20),
	primary key (id)
	);

/* search is always where manufacturer='x' and model like '%xx%' */
create index manmod on bike_models (manufacturer, model);
