import * as mysql from 'mysql';
import AppTypes from './AppTypes';

var config = require('../config.json');

export default class SqlContext {
	
	public query = (sql) => {
		return new Promise((resolve, reject) => {
			var connection = mysql.createConnection({
				host     : config['sql_db']['host'],
				user     : config['sql_db']['user'],
				password : config['sql_db']['password']
			});
			connection.connect(function(err) {
				connection.query(sql, (err, results, fields) => {
					connection.destroy();
					if (err) return reject(err);
					if (results.length == 0) return resolve(AppTypes.EMPTY);
					if (results.length == 1) return resolve(results[0]);
					return resolve(results);
				});
			});
		});
	};

}