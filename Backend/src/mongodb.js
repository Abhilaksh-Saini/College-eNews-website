const mongoose = require("mongoose");
const {type} = require("os");
mongoose.connect("mongodb://localhost:27017/Project1").then(()=>{
    console.log("MongoDB Connected");
}).catch(()=>{
    console.log("Failed to Connect");
})

const loginSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

const collection = new mongoose.model("Collection1",loginSchema);

module.exports = collection