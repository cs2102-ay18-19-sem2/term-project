CREATE TYPE gender_class AS ENUM('Female', 'Male', 'Others');
CREATE TYPE education_level AS ENUM ('other', 'high school', 'college',
'postgraduate');
CREATE TYPE role AS ENUM ('finder','tasker');

CREATE TABLE regions (
  rname   VARCHAR(74) PRIMARY KEY
);

CREATE TABLE specializations (
  sname   VARCHAR(74) PRIMARY KEY,
  details VARCHAR(100),
  check (sname <> 'OTHER' OR details IS NOT NULL)
);

CREATE TABLE states (
  sname VARCHAR(74) PRIMARY KEY
);

CREATE TABLE classifications (
  cname VARCHAR(74) PRIMARY KEY
);

CREATE TABLE accounts(
  aid 		INTEGER PRIMARY KEY,
  email 	VARCHAR(74) UNIQUE,
  username 	VARCHAR(74) NOT NULL,
  password 	VARCHAR(74) NOT NULL
);

CREATE TABLE users(
  aid 		INTEGER,
  rname		VARCHAR(74),
  score   INTEGER,
  gender  gender_class,
  education education_level,
  PRIMARY KEY (aid),
  FOREIGN KEY (aid)   REFERENCES accounts,
  FOREIGN KEY (rname) REFERENCES regions
);

CREATE TABLE admins(
  aid 			   INTEGER PRIMARY KEY,
  FOREIGN KEY(aid) REFERENCES accounts
);

CREATE TABLE specializes (
  aid		   INTEGER     REFERENCES users,
  sname		 VARCHAR(74) REFERENCES specializations,
  PRIMARY KEY  (aid, sname)
);

CREATE TABLE tasks(
  tid INTEGER PRIMARY KEY,
  title       VARCHAR(74),
  sname       VARCHAR(74) DEFAULT 'Unassigned' REFERENCES states,
  rname       VARCHAR(74) DEFAULT 'All' REFERENCES regions,
  cname       VARCHAR(74) DEFAULT 'All' REFERENCES classifications,
  finder_id   INTEGER REFERENCES users(aid) NOT NULL,
  salary      INTEGER NOT NULL,
  post_date   DATE NOT NULL,
  task_date   DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  description VARCHAR(200),
  tasker_id   INTEGER REFERENCES users(aid),
  check (tasker_id <> finder_id),
  check (start_time < end_time)
);

CREATE TABLE bids (
  tid       INTEGER REFERENCES tasks,
  tasker_id INTEGER REFERENCES users,
  salary    INTEGER NOT NULL,
  PRIMARY   KEY (tid, tasker_id)
);

CREATE TABLE reviews(
  tid         	INTEGER REFERENCES tasks,
  reviewer_id 	INTEGER NOT NULL REFERENCES users(aid),
  receiver_id 	INTEGER NOT NULL REFERENCES users(aid),
  receiver_role role NOT NULL,
  score       	INTEGER NOT NULL,
  PRIMARY KEY (tid, reviewer_id, receiver_id),
  check(score >= 0 and score <= 5)
);


INSERT INTO regions (rname) VALUES ('Kent Ridge');
INSERT INTO regions (rname) VALUES ('Buona Vista');
INSERT INTO regions (rname) VALUES ('Bugis');
INSERT INTO regions (rname) VALUES ('Marina Bay');
INSERT INTO regions (rname) VALUES ('Orchard');
INSERT INTO regions (rname) VALUES ('Jurong East');
INSERT INTO regions (rname) VALUES ('Changi Airport');
INSERT INTO regions (rname) VALUES ('Malaysia');
INSERT INTO regions (rname) VALUES ('Bishan');
INSERT INTO regions (rname) VALUES ('Holland Village');
INSERT INTO regions (rname) VALUES ('Yishun');
INSERT INTO regions (rname) VALUES ('Other');

INSERT INTO specializations (sname) VALUES ('Mandarin');
INSERT INTO specializations (sname) VALUES ('Highschool Mathemetics');
INSERT INTO specializations (sname) VALUES ('Singing');
INSERT INTO specializations (sname) VALUES ('Drawing');
INSERT INTO specializations (sname) VALUES ('English');
INSERT INTO specializations (sname) VALUES ('Cooking');
INSERT INTO specializations (sname) VALUES ('Driving');

INSERT INTO states (sname) VALUES ('Unassigned');
INSERT INTO states (sname) VALUES ('Ongoing');
INSERT INTO states (sname) VALUES ('Completed');
INSERT INTO states (sname) VALUES ('Failed');

INSERT INTO classifications (cname) VALUES ('Baby Sitting');
INSERT INTO classifications (cname) VALUES ('Tutor');
INSERT INTO classifications (cname) VALUES ('Horticulture');
INSERT INTO classifications (cname) VALUES ('Lifting');
INSERT INTO classifications (cname) VALUES ('Pets Caring');
INSERT INTO classifications (cname) VALUES ('Electrical');
INSERT INTO classifications (cname) VALUES ('Other');
