import SparqlHelper from "../helpers/SparqlHelper";
import SecurityHelper from "../helpers/SecurityHelper";

var request = require('request');
var fs = require('fs');
//var urlencode = require('urlencode');

export default abstract class DataProvider {

  public base_url = 'http://localhost:3030';
  public dataset  = 'dev';
  public sparqlHelper: SparqlHelper = new SparqlHelper();
  public securityHelper: SecurityHelper = new SecurityHelper();

  public query(sparql: string, type: string) {

    // console.log(sparql);

    return new Promise<any> ((resolve, reject) => {
      switch (type) {
        case 'query':
          request.get( {
            url: `http://127.0.0.1:3030/${this.dataset}/${type}?query=${encodeURIComponent(sparql)}&output=json`
          }, (error: any, full_res: any, body: any) => {
            if (error)
              reject(error)
            else
              //console.log('Query answer: ', body);
              //console.log('-------------------');
              resolve( this.sparqlHelper.normalizeData(JSON.parse(body)) );
          } );
          break;

        case 'update':
          // console.log('Update string: ', sparql);
          request.post( {
            url: `${this.base_url}/${this.dataset}/${type}`,
            form: {
              update: sparql
            }
          }, (error: any, full_res: any, body: any) => {
            //console.log('Update answer: ', body);
            //console.log('-------------------');
            error ? reject( error ) : resolve( body )
          } );
          break;
      }
    })
  }




  /**
   * @param info
   * Example:
   * {
   *   graph: ... ,
   *   vertex: {
   *     prefix: "users",
   *     fid: "user_3" (full_id: "user_3")
   *   },
   *   edge: {
   *     prefix: "user_",
   *     property: "name"
   *   }
   * }
   *
   * @return Promise <any>
   */

  public getByProperty(info: any) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        SELECT ?${info.edge.property}
        FROM <${info.graph}>
        { ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} ?${info.edge.property} }`;
    return this.query(sparql, 'query');
  }




  /**
   * @param info
   * Example:
   * {
   *   graph: ... ,
   *   vertex: {
   *     prefix: "users",
   *     fid: "user_3" (full_id)
   *   },
   *   props: [
   *     {
   *        'prefix': 'users',
   *        'name': "densisddasd"
   *      },
   *      {
   *        'prefix': 'users',
   *        'age': "18"
   *      }
   *   ]
   * }
   *
   * @return Promise <any>
   */

  public pushProperties(info: any): Promise<any> {
    let formattedProps = [];
    info.props.forEach((prop) => {
      for (let key in prop) {
        if (prop[key] !== prop['prefix'] )
          formattedProps.push(`${prop.prefix}:${key} "${prop[key]}"`)
      }
    });
    let sparql =
      `${this.sparqlHelper.prefixes} 
        INSERT DATA { 
          GRAPH <${info.graph}>
          { ${info.vertex.prefix}:${info.vertex.fid} ${formattedProps.join('; ')} }
        }`;
    return this.query(sparql, 'update');
  }




  /**
   * @param info
   * Example:
   * {
   *   graph: ... ,
   *   value: "234",
   *   vertex: {
   *     prefix: "users",
   *     fid: "user_3" (full_id)
   *   },
   *   edge: {
   *     prefix: "users",
   *     property: "name"
   *   }
   * }
   *
   * @return Promise <any>
   */

  public replaceProperty(info: any): Promise<any> {
    let sparql =
      `${this.sparqlHelper.prefixes}
        WITH <${info.graph}>
        DELETE {
          ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} ?before
        }
        INSERT { 
          GRAPH <${info.graph}> {
            ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} "${info.value}" 
          }
        }
        WHERE {
          ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} ?before
        }`;
    return this.query(sparql, 'update');
  }




  /**
   * @param info
   * Example:
   * {
   *   graph: ... ,
   *   value: "234",
   *   vertex: {
   *     prefix: "users",
   *     fid: "user_3" (full_id: "user_3")
   *   },
   *   edge: {
   *     prefix: "user_",
   *     property: "name"
   *   }
   * }
   *
   * @return Promise <any>
   */

  public deleteProperty(info: any): Promise<any> {
    let sparql =
      `${this.sparqlHelper.prefixes}
        WITH <${info.graph}>
        DELETE { ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} ${info.value} }
        WHERE  { ${info.vertex.prefix}:${info.vertex.fid} ${info.edge.prefix}:${info.edge.property} ${info.value} }`;
    return this.query(sparql, 'update');
  }


}
