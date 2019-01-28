export default class SparqlHelper {
    public prefixes =
        'PREFIX users: <http://localhost:3030/users#> \n' +
        'PREFIX chats: <http://localhost:3030/chats#> \n' +
        'PREFIX messages: <http://localhost:3030/messages#> \n' +
        'PREFIX walls: <http://localhost:3030/walls#> \n' +
        'PREFIX type: <http://localhost:3030/type#> \n' +
        'PREFIX files: <http://localhost:3030/files#> \n' +
        'PREFIX events: <http://localhost:3030/events#> \n' +
        'PREFIX news: <http://localhost:3030/news#> \n' +
        'PREFIX posts: <http://localhost:3030/posts#> \n';

    public graphs_uri = {
        users: 'http://localhost:3030/users',
        messages: 'http://localhost:3030/messages',
        chats: 'http://localhost:3030/chats',
        walls: 'http://localhost:3030/walls',
        posts: 'http://localhost:3030/posts',
        files: 'http://localhost:3030/files',
        watches: 'http://localhost:3030/watches',
        history: 'http://localhost:3030/history',
        groups: 'http://localhost:3030/groups'
    };

    public normalizeData(sparqlData: any) {
        if (!sparqlData.results) {
            //console.log(sparqlData);
            return sparqlData['boolean'];
        }
        else {
            let bindings = sparqlData.results.bindings;
            let result = [];
            for (let i = 0; i < bindings.length; i++) {
                let obj = {};
                for (let key in bindings[i]) {
                    obj[key] = bindings[i][key]['value'];
                }
                result.push(obj);
            }
            return result;
        }
    }

}
