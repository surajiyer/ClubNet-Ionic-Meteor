/**
 * Created by Chen on 5/13/2016.
 */
//base user schema
baseUserSchema = new SimpleSchema({
    userType:{type:String, allowedValues:['coach','player','general member']},
    email:{type: String},
    firstName:{type: String},
    lastName:{type: String},
    password:{type: String},
    clubID:{type:String},
    bettingResults:{type:[{
        season:{type:String},
        points:{type:Number}
    }]},
})

//coach schema
coachSchema = new SimpleSchema([baseUserSchema,{
    teamID : {type:String},
    notes:{type:[{
        itemID:{type:String},
        text:{type:String}
    }]}
}])

//player schema
playerSchema = new SimpleSchema([baseUserSchema,{
    teamID : {type:String},
}])