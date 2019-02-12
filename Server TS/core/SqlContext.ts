import * as mysql from 'mysql';
import AppTypes from './AppTypes';

var config = require('../config.json');

export default class SqlContext {

	public current_history_table = '201901';
	
	
	public db(_db) {
		this._db = _db;
		return { query: this.query };
	}

	private _db = '';

	public query = (sql,  placeholders?) => {
		return new Promise((resolve, reject) => {
			var connection = mysql.createConnection({
				host     : config['sql_db']['host'],
				port     : config['sql_db']['port'],
				user     : config['sql_db']['user'],
				password : config['sql_db']['password'],
				database: 'app'
			});
			connection.changeUser({
				database: this._db
			});
			connection.connect(function(err) {
				let q = connection.query(mysql.format(sql, placeholders) || [], (err, results, fields) => {
					connection.destroy();
					if (err) return reject(err);
					if (results.length == 0) return resolve(AppTypes.EMPTY);
					if (results.length == 1) return resolve(JSON.parse(JSON.stringify(results[0])));
					return resolve(JSON.parse(JSON.stringify(results)));
				});
				console.log(q.sql);
			});
		});
	};

}