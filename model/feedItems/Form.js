if(Meteor.isServer) {
    Meteor.methods({
         /**
         * @summary Recreate a Practicality feed item based on its specified repeat interval.
         * @param {Integer} id The id of the feed item.
         * @return None.
         * @after Based on the repeat interval(daily, weekly or monthly), a new Practicality feed item is created with
         * the identical initial settings except the deadline. The new deadline is either a day, week or month later than
          * the old deadline.
         */
        checkRepeatInterval: function (id) {
            check(id, String);
            var item = Items.find({_id: id}).fetch()[0];
            var repeatInterval = item.repeatInterval;
            switch (repeatInterval) {
                case 'daily':
                    var succesCheck = Meteor.call('renewItemDaily', item);
                    break;
                case 'weekly':
                    var succesCheck = Meteor.call('renewItemWeekly', item);
                    break;
                case 'fourweeks':
                    var succesCheck = Meteor.call('renewItemFourweeks', item);
            }
            return true;
        },
        /**
         * @summary Calculates the time difference in day unit between the current time and the time that is passed as parameter.
         * @param {Date} createdAt A date object which the current time is compared with.
         * @return {Integer} The time difference in day unit.
         */
        calculateTimeDifference: function (createdAt) {
            check(createdAt, Date);
            //get the current time (server sided ofc)
            var date = new Date();

            // time difference in ms
            var timeDiff = date - createdAt;

            // strip the ms
            timeDiff /= 1000;
            // get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
            var seconds = Math.round(timeDiff % 60);
            // remove seconds from the date
            timeDiff = Math.floor(timeDiff / 60);
            // get minutes
            var minutes = Math.round(timeDiff % 60);
            // remove minutes from the date
            timeDiff = Math.floor(timeDiff / 60);
            // get hours
            var hours = Math.round(timeDiff % 24);
            // remove hours from the date
            timeDiff = Math.floor(timeDiff / 24);
            // the rest of timeDiff is number of days
            var days = timeDiff;

            return days;
        },
        /**
         * @summary Recreate a feed item that is passed as parameter. The new feed item has the identical initial settings
         * except the deadline. The deadline is a day later than the old deadline.
         * @param {Object} item The item that needs to be recreated.
         * @return None. .
         */
        renewItemDaily: function (item) {
            check(item, Object);
            var createdAt = item.createdAt;
            var repeatInterval = item.repeatInterval;

            var days = Meteor.call('calculateTimeDifference', createdAt);

            //console.log('Elapsed time in hours in function: '+hours);
            console.log('Elapsed time in days in function: ' + days);

            if (days >= 1 && item.status == 'published') {
                console.log('its me!');

                item.status = 'expired';
                var succesCheck = Meteor.call('updateFeedItem', item);

                var newItem = item;
                newItem.createdAt = new Date();
                newItem._id = null;
                newItem.status = 'published';
                var succesCheck = Meteor.call('addFeedItem', newItem);
            }

            return true;
        },
        /**
         * @summary Recreate a feed item that is passed as parameter. The new feed item has the identical initial settings
         * except the deadline. The deadline is a week later than the old deadline.
         * @param {Object} item The item that needs to be recreated.
         * @return None. .
         */
        renewItemWeekly: function (item) {
            check(item, Object);
            var createdAt = item.createdAt;
            var repeatInterval = item.repeatInterval;

            var days = Meteor.call('calculateTimeDifference', createdAt);

            //console.log('Elapsed time in hours in function: '+hours);
            console.log('Elapsed time in days in function: ' + days);

            if (days >= 7 && item.status == 'published') {
                console.log('its me!');

                item.status = 'expired';
                var succesCheck = Meteor.call('updateFeedItem', item);

                var newItem = item;
                newItem.createdAt = new Date();
                newItem._id = null;
                newItem.status = 'published';
                var succesCheck = Meteor.call('addFeedItem', newItem);
            }

            return true;
        },
        /**
         * @summary Recreate a feed item that is passed as parameter. The new feed item has the identical initial settings
         * except the deadline. The deadline is a month ( four weeks ) later than the old deadline
         * @param {Object} item The item that needs to be recreated.
         * @return None. .
         */
        renewItemFourweeks: function (item) {
            check(item, Object);
            var createdAt = item.createdAt;
            var repeatInterval = item.repeatInterval;

            var days = Meteor.call('calculateTimeDifference', createdAt);

            //console.log('Elapsed time in hours in function: '+hours);
            console.log('Elapsed time in days in function: ' + days);

            if (days >= 28 && item.status == 'published') {
                console.log('its me!');
                item.status = 'expired';
                var succesCheck = Meteor.call('updateFeedItem', item);
                var newItem = item;
                newItem.createdAt = new Date();
                newItem._id = null;
                newItem.status = 'published';
                var succesCheck = Meteor.call('addFeedItem', newItem);
            }

            return true;
        },
        /**
         * @summary Calculate the raised value of a Practicality feed item.
         * @param {String} itemID The id of the feed item.
         * @returns {Integer} The raised value.
         */
        getRaisedValue: function (itemID) {
            check(itemID, String);
            // return Responses.find({itemID: itemID}).fetch();

            var total = 0;
            Responses.find({itemID: itemID}).map(function (doc) {
                var value = parseInt(doc.value);
                if (_.isNaN(value)) return;
                total += value;
            });

            return total;
        },

        /**
         * @summary Find the name of the contributors of a Practicality feed item.
         * @param {String} itemID The id of the feed item.
         * @returns {String[]} An array consists of the names of all contributors. Each element is a concatenation of
         * the first and last name of each contributor.
         */
        getContributing: function (itemID) {
            check(itemID, String);
            var responses = Responses.find({itemID: itemID}).fetch();

            var peopleThatResponded = _.map(responses, function (response) {
                console.log(peopleThatResponded);
                var userProfile = Meteor.users.find({_id: response.userID}).fetch()[0].profile;
                return userProfile.firstName + " " + userProfile.lastName;
            });
            return peopleThatResponded;
        },

        /**
         * @summary Increase the raised value of a Practicality feed item by the specified amount.
         * @param {String} itemID The id of the feed item.
         * @param {String} itemType The type of the feed item ( Practicality ).
         * @param {Integer} value The amount to increase.
         * @return {Integer} None.
         */
        increaseValue: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);
            var item = Meteor.call('getFeedItem', itemID);
            var raisedValue = item.raisedValue;
            var newRaisedValue = parseInt(raisedValue) + parseInt(value);
            console.log("raised value: " + raisedValue);
            console.log("New raised value: " + newRaisedValue);
            try {
                Items.update({_id: itemID, type: itemType},
                    {$set: {raisedValue: newRaisedValue}});
                return Items.find(itemID, {_id: 1, type: 1, raisedValue: 1}).fetch()[0];
            } catch (e) {}
        },
        /**
         * @summary Decrease the raised value of a Practicality feed item by the specified amount.
         * @param {String} itemID The id of the feed item.
         * @param {String} itemType The type of the feed item ( Practicality ).
         * @param {Integer} value The amount to decrease.
         * @return {Integer} None.
         */
        decreaseValue: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);
            var item = Meteor.call('getFeedItem', itemID);
            var raisedValue = item.raisedValue;
            var newRaisedValue = parseInt(raisedValue) - parseInt(value);
            console.log("raised value: " + raisedValue);
            console.log("New raised value: " + newRaisedValue);
            try {
                Items.update({_id: itemID, type: itemType},
                    {$set: {raisedValue: newRaisedValue}});
                return Items.find(itemID, {_id: 1, type: 1, raisedValue: 1}).fetch()[0];
            } catch (e) {}
        },
    });
}