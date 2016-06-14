if(Meteor.isServer) {
    Meteor.methods({

         /*
         * @summary Check what kind of repeatInterval we are dealing with
         * @param {Integer} item id
         * @after forwarded to corresponding function (daily, weekly, fourweeks are all being handled in seperate functions)
         */
         

        checkRepeatInterval: function (id) {
            check(id, String);
            var item = Items.find({_id: id}).fetch()[0];
            var repeatInterval = item.repeatInterval;
            //*********what kind of interval are we dealing with? Do some method accordingly ***********/
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

        /*
         * @summary Calculates the time difference between the current time and the time that was passed as parameter
         * @param {String} timestamp that states the time at which the item was created
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

        /*
         * @summary Checks if the set time elapsed, if so: renew item (copy item with initial settings, remove old item)
         * @param {Object} item that was created.
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

        /*
         * @summary Checks if the set time elapsed, if so: renew item (copy item with initial settings, remove old item)
         * @param {Object} item that was created.
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

        /*
         * @summary Checks if the set time elapsed, if so: renew item (copy item with initial settings, remove old item)
         * @param {Object} item that was created.
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
         * @summary Function for retrieving the response to a feed item.
         * @param {String} itemID The id of the feed item
         * @returns {Object} The response
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