// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by feedhelper.js.
import { name as packageName } from "meteor/feedhelper";

// Write your tests here!
// Here is an example.
Tinytest.add('feedhelper - example', function (test) {
  test.equal(packageName, "feedhelper");
});
