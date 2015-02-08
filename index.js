/**
 * Created by cristianorosario on 07/01/15.
 */
var app = require('./appUsage');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
});