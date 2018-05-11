use bike;

drop table if exists profile_images;

create table profile_images
	(id int not null auto_increment,
	userid int not null,
	image_type varchar(30),
	image_file varchar(100),
	thumb_file varchar(100),
	caption varchar(100),
	status varchar(30),
	created_on timestamp default CURRENT_TIMESTAMP,
	primary key (id)
	);

create index userid_idx on profile_images(userid);
