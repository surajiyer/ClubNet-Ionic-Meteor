/**
 * Created by Chen on 5/13/2016.
 */
clubSchema = new SimpleSchema({
    name:{type: String},
    logo:{type: String},
    colorSchema:{ type:[String], label:"Three colors", minCount:3, maxCount:3}
})