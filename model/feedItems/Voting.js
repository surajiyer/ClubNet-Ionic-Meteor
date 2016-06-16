if (Meteor.isServer) {
    Meteor.methods({
        /**
         * @summary Increase the number of votes of an Exercise voting feed item by the specified amount.
         * @param {String} itemID The id of the feed item.
         * @param {String} itemType The type of the feed item.
         * @param {Integer} value The number of votes to increase.
         * @return {Integer} None.
         */
        increaseNrVotes: function (itemID, itemType) {
            check(itemID, String);
            check(itemType, String);

            var item = Meteor.call('getFeedItem', itemID);
            var raisedValue = item.nrVotes;
            var newRaisedValue = parseInt(raisedValue)+1;

            console.log("raised value: "+raisedValue);
            console.log("New raised value: "+newRaisedValue);
            return Items.update({ _id: itemID, type: itemType},
                { $set: { nrVotes: newRaisedValue }});
        },
        /**
         * @summary Retrieve the voting results of an Exercise voting feed item.
         * @param {String} itemID The id of the feed item
         * @returns {Integer[]} An array consists of the number of votes of each exercise.
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
            try {
                var obj = HTTP.call("GET", Meteor.absoluteUrl("trainings.json"));
                obj = obj.data;
                for (var training in obj) {
                    obj[training] = obj[training]['training' + (parseInt(training) + 1)];
                }
                return obj;
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        /**
         * @summary Retrieve all the candidate exercises of a training.
         * @param {String} trainingID The id of the training.
         * @return {Object[]} Array consists of all candidate exercises of the specified training.
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
         * @summary Function for checking whether the voting is still opened or closed (status).
         * @param {String} itemId The Item Id of the item for which the status needs to be checked.
         * @returns {Boolean} The status in boolean form
         */
        checkVotingStatus: function (itemID) {
            check(itemID, String);
            var item = Meteor.call("getFeedItem", itemID);
            return new Date < item.deadline && Meteor.call("getTeamSize") > item.nrVotes;
        }
    });
}