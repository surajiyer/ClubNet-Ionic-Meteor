if (Meteor.isServer) {
    Meteor.methods({
        /**
         * @summary Increase the number of votes of an Exercise voting feed item by one. The Exercise voting feed item
         *  is specified by the id.
         * @param {String} itemID The id of the feed item.
         * @return {Integer} None.
         * @throws error if the input parameters do not have the required type. The itemID must be a String object.
         */
        increaseNrVotes: function (itemID, itemType) {
            check(itemID, String);
            check(itemType, String);

            var item = Meteor.call('getFeedItem', itemID);
            var raisedValue = item.nrVotes;
            var newRaisedValue = parseInt(raisedValue) + 1;

            console.log("raised value: " + raisedValue);
            console.log("New raised value: " + newRaisedValue);
            return Items.update({_id: itemID, type: itemType},
                {$set: {nrVotes: newRaisedValue}});
        },
        /**
         * @summary Retrieve the voting results of an Exercise voting feed item. The Exercise voting feed item is specified
         *  by the id.
         * @param {String} itemID The id of the feed item.
         * @returns {Integer[]} An array consists of the number of votes of each exercise.
         * @throws error if the input parameters do not have the required type. The itemID must be a String object.
         */
        getVotingResults: function (itemID) {
            check(itemID, String);
            var votes = Meteor.call('getResponsesOfOneItem', itemID);
            result = [[0, 0, 0]];
            votes.forEach(function (vote) {
                result[0][Number(vote.value) - 1]++;
            });
            return result;
        },
        /**
         * @summary Retrieve the training object specified by the training id.
         * @param {String} trainingID The id of the training.
         * @return {Object} The training object.
         * @throws error if the input parameters do not have the required type.
         */
        getTrainingObj: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            return _.find(trainings, function (obj) {
                return obj.trId == trainingID;
            });
        },
        /**
         * @summary Retrieve the list of all scheduled trainings of the team of the logged in coach user.
         * @return {Object[]} Array consists of all training objects.
         */
        getTrainings: function () {
            var obj = HTTP.call("GET", Meteor.absoluteUrl("trainings.json"));
            obj = obj.data;
            for (var training in obj) {
                obj[training] = obj[training]['training' + (parseInt(training) + 1)];
            }
            return obj;
        },
        /**
         * @summary Retrieve all the candidate exercises of a training. The training is specified by the id. 
         * @param {String} trainingID The id of the training.
         * @return {Object[]} Array consists of all candidate exercises of the specified training. Each element contains
         *  the name and icon of the exercise.
         * @throws error if the input parameters do not have the required type. The trainingID must be a String object.
         */
        getExercises: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            trainings = _.find(trainings, function (tr) {
                return tr.trId == trainingID;
            });
            return trainings.exercises;
        },
        /**
         * @summary Function for checking whether the voting is still opened or closed (status) and returns true or false
         *  accordingly. The exercise voting feed item is specified by the itemID. A Exercise voting feed item is closed only
         *   when the deadline has passed or all the members in the team have voted.
         * @param {String} itemId The Item Id of the item for which the status needs to be checked.
         * @returns {Boolean} True if the voting is still open. False otherwise.
         */
        checkVotingStatus: function (itemID) {
            check(itemID, String);
            var item = Meteor.call("getFeedItem", itemID);
            return new Date < item.deadline && Meteor.call("getTeamSize") > item.nrVotes;
        }
    });
}