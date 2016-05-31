Meteor.startup(function() {
	process.env.MONGO_URL = "mongodb://sep:sep@ds011472.mlab.com:11472/clubnet";
    console.log(process.env.MONGO_URL);
});
process.env.MONGO_URL = "mongodb://sep:sep@ds011472.mlab.com:11472/clubnet";
console.log(process.env.MONGO_URL);

// mongodb://sep:sep@ds011472.mlab.com:11472/clubnet meteor
//MONGO_URL = "mongodb://clubnet-9079:Zqz2HTvk7VX8bujl_YHv@clubnet-9079.mongo.dbs.appsdeck.eu:30065/clubnet-9079";
//mongorestore -u "sepsep" -p "36RDIOM17d0s9Z6K-K4N" -h "clubnet-9079.mongo.dbs.appsdeck.eu/clubnet-9079:3001"//mongodb://clubnet-9079:Zqz2HTvk7VX8bujl_YHv@clubnet-9079.mongo.dbs.appsdeck.eu:30065/clubnet-9079

//mongorestore -u clubnet-9079 -p  Zqz2HTvk7VX8bujl_YHv -h 127.0.0.1:10000 -d clubnet-9079 dump/meteor
//mongorestore -u clubnet-9079 -p Zqz2HTvk7VX8bujl_YHv -h clubnet-9079.mongo.dbs.appsdeck.eu:30065 -d clubnet-9079 ../../meteor
//git push scalingo master