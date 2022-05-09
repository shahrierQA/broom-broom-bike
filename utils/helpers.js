// We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require("moment");

// function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);
