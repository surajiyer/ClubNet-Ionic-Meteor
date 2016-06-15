if (Meteor.isServer) {
    Meteor.methods({
        increaseNrVotes: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);

            var item = Meteor.call('getFeedItem', itemID);
            var raisedValue = item.nrVotes;
            var newRaisedValue = parseInt(raisedValue)+parseInt(value);

            console.log("raised value: "+raisedValue);
            console.log("New raised value: "+newRaisedValue);
            return Items.update({ _id: itemID, type: itemType},
                { $set: { nrVotes: newRaisedValue }});
        },
        /**
         * @summary Function for retrieving the voting results of a voting feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * The response will consists of an array of number of votes nested within an array with no other data.
         * @method getVotingResults
         * @param {String} itemID The id of the feed item for which the voting results needs to be retrieved.
         * @returns {Array} The voting results
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
         * @summary Function for retrieving a training.
         * @param {String} trainingID The String Id of the training which needs to be retrieved.
         * @returns {Object} The training
         */
        getTrainingObj: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            return _.find(trainings, function (obj) {
                return obj.trId == trainingID;
            });
        },
        /**
         * @summary Function for retrieving a list of trainings.
         * @returns {Array} The trainings
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
         * @summary Function for retrieving the exercises of a training.
         * @param {String} trainingID The String Id of the training for which the exercises need to be retrieved.
         * @returns {Array} The exercises of a training
         */
        getExercises: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            trainings = _.find(trainings, function (tr) {
                return tr.trId == trainingID;
            });
            return trainings.exercises;
        },
    });
}