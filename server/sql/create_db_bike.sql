create database bike
	character set latin1
	collate latin1_general_cs;

create user 'bike'@'localhost' identified by 'bike';

grant all privileges on *.* to 'bike'@'localhost';

grant all privileges on bike.* to 'bike'@'localhost';


/* useful statements for char set */

/***
SELECT default_character_set_name FROM information_schema.SCHEMATA 
WHERE schema_name = "bike";

SELECT CCSA.character_set_name FROM information_schema.`TABLES` T,
information_schema.`COLLATION_CHARACTER_SET_APPLICABILITY` CCSA
WHERE CCSA.collation_name = T.table_collation
AND T.table_schema = "bike"
AND T.table_name = "users";


SELECT character_set_name FROM information_schema.`COLUMNS` 
WHERE table_schema = "bike"
AND table_name = "users"
AND column_name = "fullname";

**/
