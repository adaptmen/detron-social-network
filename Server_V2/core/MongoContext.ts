const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const DB_URL = "localhost:27017";
const DB_NAME = "local";
const MongoId = mongo.ObjectId;

export default class MongoContext {

    public bucket;
    public client;
    public db;

    constructor() {
        MongoClient.connect(`mongodb://${DB_URL}/${DB_NAME}`, {
            native_parser: true,
            useNewUrlParser: true
        }, (err, client) => {
            this.db = client.db(DB_NAME);
            this.bucket = new mongo.GridFSBucket(this.db);
            console.log('mongo started');
        });
	}

	public MongoId = mongo.ObjectID;

    public writeStream(fileName, options) {
        return this.bucket.openUploadStream(fileName, options);
    }

    public readStream(m_fileId): any {
        return this.bucket.openDownloadStream(MongoId(m_fileId));
    }

    public find(collection, searchOptions) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this
                    .db
                    .collection(collection)
                    .find(searchOptions.props,
                    searchOptions.agregates || {})
                    .toArray((err, results) => {
                        if (!err) {
                            if (!results.length) {
                                resolve(results);
                                return;
                            }
                            else if (results.length === 1) {
                                results = results[0]
                            }
                            resolve(results);
                        }
                        else {
                            reject(err);
                        }
                    });
            });
        }
	}

	public findOne(collection, searchOptions) {
		if (this.db) {
			return new Promise((resolve, reject) => {
				this
					.db
					.collection(collection)
					.findOne(searchOptions.props,
						searchOptions.agregates || {})
					.toArray((err, results) => {
						if (!err) {
							if (!results.length) {
								resolve(results);
								return;
							}
							else if (results.length === 1) {
								results = results[0]
							}
							resolve(results);
						}
						else {
							reject(err);
						}
					});
			});
		}
	}

    public insertOne(collection, data) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.collection(collection).insertOne(data, (err, result: any) => {
                    if (!err) {
                        resolve(result);
                    }
                    else {
                        reject(err);
                    }
                })
            });
        }
    }

    public updateOne(collection, filters) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this
                    .db
                    .collection(collection)
                    .updateOne(
                        filters.props,
                        filters.agregates || {},
                        (err, result) => {
                            if (!err) {
                                resolve(result);
                            }
                            else {
                                reject(err);
                            }
                        }
                    )
            });
        }
    }

}
