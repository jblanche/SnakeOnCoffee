
exports.DatabaseConfig = {
  database: process.env.SNAKES_DATABASE_NAME,
  table: process.env.SNAKES_DATABASE_TABLE,
  user: process.env.SNAKES_DATABASE_USER,
  password: process.env.SNAKES_DATABASE_PASSWORD
};

/*
Create table with 
CREATE TABLE `scores` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `score` int(11) DEFAULT NULL,
  `name` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8;
*/
