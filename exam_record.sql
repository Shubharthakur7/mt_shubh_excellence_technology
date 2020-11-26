/**
create database exam_record
*create table in mysql
*/
create table candidate(
	id int not null auto_increment,
    name varchar(50),
	email varchar(50) unique,
    primary key(id)
);

create table test_score(
	id int auto_increment,
    candidate_id int not null,
    score int2,
    round int1,
    primary key (id),
    foreign key (candiate_id) references candidate (id)
    ON DELETE cascade
);
