/**
 * Created by cristianorosario on 20/01/15.
 */
module.exports = {
    selectAll: dbSelectAll,
    selectOne: dbSelectOne,
    executeQuery: dbExecuteQuery
};

///////////////////////////////////////////////////////////////////////////////////////////

var config = require(require('path').resolve(__dirname, "..", "config.js"));
var pg = require("pg");
///
function dbSelectAll(query, queryParams, createElem, cb) {
    pg.connect(config.getConnString(), function (err, client, done) {
        if (err) return cb("Error fetching client from pool: " + err);
        client.query(query, queryParams, function (err, result) {
            done();
            if (err) return cb("Error running query: " + err);
            if (typeof createElem == 'function') {
                var elems = result.rows.map(createElem);
                return cb(null, elems);
            }
            cb(null, result);
        });
    });
}

function dbSelectOne(query, queryParams, createElem, cb) {
    pg.connect(config.getConnString(), function (err, client, done) {
        if (err) return cb("Error fetching client from pool: " + err);
        client.query(query, queryParams, function (err, result) {
            done();
            if (err) return cb("Error running query: " + err);

            if (result.rowCount == 0) return cb(null, null);
            if (result.rowCount > 1)  return cb("More than one element selected.", null);
            if (typeof createElem == 'function') {
                var elem = createElem(result.rows[0]);
                return cb(null, elem);
            }
            return cb(null, result.rows[0]);
        });
    });
}

function dbExecuteQuery(query, queryParams, cb) {
    pg.connect(config.getConnString(), function (err, client, done) {
        if (err) return cb("Error fetching client from pool: " + err);
        client.query(query, queryParams, function (err, result) {
            done();
            if (err) return cb("Error running query: " + err);

            //if(result.rowCount != 1) return cb("Cannot execute the query: " + query, null);
            cb(null, result);
        });
    });
}