use bike;

drop table if exists users;

create table users
	(id int not null auto_increment,
	username varchar(50) not null,
	password varchar(100) not null,
	firstname varchar(50) default '',
	lastname varchar(50) default '',
	fullname varchar(200),
	email varchar(50) default '',
	email_verified tinyint not null default 0,
	email_verified_date TIMESTAMP default CURRENT_TIMESTAMP,
	phone varchar(50) default '',
	location varchar(200) default '',
	lat decimal (8,4) default 0,
	lng decimal (8,4) default 0,
	gender int default 0,
	age int default 0,
	ability int default 0,
	bio varchar(2000) default '',
	new_message bool default 0,
	bike_manufacturer varchar(100) default '',
	bike_model varchar(200) default '',
	bike_year varchar(10) default '',
	primary key (id)
	);


drop table if exists user_ability;
create table user_ability
	(id int not null,
	ability varchar (100) not null
	);
insert into user_ability (id, ability)
	values (0,'Select ability'),(1,'Beginner'), (2,'Intermediate'),(3,'Advanced');

drop table if exists user_gender;
create table user_gender
	(id int not null,
	gender varchar (100) not null
	);
insert into user_gender (id, gender)
	values (0,'Select gender'), (1,'Male'), (2,'Female');

drop table if exists user_age;
create table user_age
	(id int not null,
	age varchar(100) not null
	);
insert into user_age (id, age)
	values (0,'Select age'),(1,'Under 25'), (2,'26 - 35'),(3,'36 - 45'),(4,'46 - 55'),(5,'56 - 65'),(6,'66 - 75'),(7,'Over 75');
