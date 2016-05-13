// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by user.module.js.
import { name as packageName } from "meteor/user.module";

// Write your tests here!
// Here is an example.
Tinytest.add('user.module - example', function (test) {
  test.equal(packageName, "user.module");
});
