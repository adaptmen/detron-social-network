import DataProvider from "./DataProvider";
import SqlContext from '../core/SqlContext';

export default class UserDataProvider extends DataProvider {

    public sqlContext: SqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public insertUser(user_id, login, password, token, ftoken: string): Promise<any> {
        return this
        .sqlContext
        .query(`INSERT INTO users 
            (id, name, login, password, token, ftoken)
             VALUES ('${user_id}', '${login}', '${login}', '${password}', '${token}', '${ftoken}')`).then((res) => {
             let sparql =
                `${this.sparqlHelper.prefixes}
                INSERT DATA
                {
                    GRAPH <${this.sparqlHelper.graphs_uri.users}>
                    {
                        users:user_${user_id} type:id "${user_id}" ;
                        users:name "${login}"
                        users:login "${login}"
                        type:role "user" ;
                        type:created_at "${Date.now()}" .
                }}`;
            return this.query(sparql, 'update');
        });
    }

    public getUserById(userId): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?name
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{ ?user type:id "${userId}" .
			  ?user users:name ?name; 
					type:id ?id .
			}`;
        return this.query(sparql, 'query');
    }

    public checkAccess(login, password) {
        let sql = `SELECT (login, password)
         FROM \`users\` WHERE 'login' = ${login}, 'password' = ${password}`;
         return this.sqlContext.query(sql);
    }

    public checkExist(login) {
        let sql = `SELECT login FROM \`users\` WHERE 'login' = ${login}`;
        return this.sqlContext.query(sql);
    }

}