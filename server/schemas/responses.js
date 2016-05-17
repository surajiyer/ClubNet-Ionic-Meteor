/**
 * Created by Chen on 5/13/2016.
 */
//basic response schema
baseResponseSchema = new SimpleSchema({
    responserID:{type:String},
    itemID:{type:String},
    itemType:{type: String},
    value:{type:Number}
})
//betting response schema
bettingResponseSchema = new SimpleSchema({
    responserID:{type:String},
    itemID:{type:String},
    bets:{type:[String], allowedValues :["win", "lose","tie","none"]}
})