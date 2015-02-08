/**
 * Created by cristianorosario on 20/01/15.
 */
var configs = {
    "development": {
        getConnString: function()
        {
            return "postgres://qxadmin:simples69@localhost/queixinhasdb";
        }
    }
};

var config = configs[process.env.NODE_ENV] || configs["development"];

console.log("using config", config);


module.exports = config;