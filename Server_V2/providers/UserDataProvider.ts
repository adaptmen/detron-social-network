import DataProvider from "./DataProvider";
import SqlContext from '../core/SqlContext';
import AppTypes from '../core/AppTypes';

export default class UserDataProvider extends DataProvider {

    public sqlContext: SqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public insertUser(user_id, login, password, token, ftoken: string): Promise<any> {
        return this
        .sqlContext
        .db('app')
        .query(`INSERT INTO ?? 
            (id, name, login, password, token, f_token)
             VALUES (?, ?, ?, ?, ?, ?)`, 
             ['users', user_id, login, login, password, token, ftoken])
        .then((res) => {
             let sparql =
                `${this.sparqlHelper.prefixes}
                INSERT DATA
                {
                    GRAPH <${this.sparqlHelper.graphs_uri.users}>
                    {
                        users:user_${user_id} type:id "${user_id}" ;
                        users:login "${login}";
                        type:role "user" ;
                        type:created_at "${Date.now()}" .
                }}`;
            return this.query(sparql, 'update');
        });
    }

    public getUserById(userId): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?login
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{ ?user type:id "${userId}" .
			  ?user users:login ?login; 
					type:id ?id .
			}`;
        return this.query(sparql, 'query');
    }

    public getPersonById(user_id) {
        return this
        .sqlContext
        .db('app').query(`SELECT ??, ??, ?? FROM ?? WHERE id = ?`
            ,['id', 'name', 'avatar_url', 'users', user_id]);
    }

    public getPersonsById(users_ids) {
        let str = users_ids.join('", "');

        return this
        .sqlContext
        .db('app').query(`SELECT ??, ??, ??
         FROM ?? WHERE id IN (?)`, ['id', 'name', 'avatar_url', str]);
    }

    public getByLogin(login) {
        return this
        .sqlContext
        .db('app').query(`SELECT ??, ??, ??, ??
         FROM ?? WHERE login = ?`, ['app', 'id', 'name', 'login', 'password', 'users', login]);
        
    }

    public getUserInit(login) {
        let fields = ['id', 'name', 'login', 'password', 'avatar_url', 'age', "city", "wall_id"];
        return this
        .sqlContext
        .db('app').query(`SELECT ??
         FROM ?? WHERE login = ?`,
          [fields, 'users', login]);
    }

    public getPageUserById(id) {
        let fields = ['id', 'name', 'login', 'avatar_url', 'age', "city"];
        return this
        .sqlContext
        .db('app').query(`SELECT ??
         FROM ?? WHERE id = ?`,
          [fields, 'users', id]);
    }

    public checkAccess(login, password) {
        let columns = ['login', 'password'];
        let sql = `SELECT * FROM ?? WHERE login = ? AND password = ?`;
         return this.sqlContext.db('app').query(sql, ['users', login, password]);
    }

    public checkExist(login) {
        let sql = `SELECT ?? FROM ?? WHERE login = ?`;
        return this.sqlContext.db('app').query(sql, ['login', 'users', login]);
    }

    public checkExistById(id) {
        let sql = `SELECT ?? FROM ?? WHERE id = ?`;
        return this.sqlContext.db('app').query(sql, ['id', 'users', id]);
    }

    public checkSubscribe(user_id, object) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            ASK WHERE
            {
                GRAPH <${this.sparqlHelper.graphs_uri.users}>
                { 
                    users:user_${user_id} type:subscribe ?object
                }
            }`;
        return this.query(sparql, 'query').then((res) => { return res ? AppTypes.SUCCESS : AppTypes.ERROR });
    }

    public subscribeUser(user_id, object) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            INSERT DATA
            {
              GRAPH <${this.sparqlHelper.graphs_uri.users}>
              {
                users:user_${user_id} type:subscribe ${object} 
              }}`;
        return this.query(sparql, 'update');
    }

}