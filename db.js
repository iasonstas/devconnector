const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//connect returns a promise can use .then
// mongoose.connect(db)

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      //DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
      useCreateIndex: true
    });
    console.log("MongoDB Connected.");
  } catch (error) {
    console.log(error.message);
    //Exit process with failure.
    process.exit(1);
  }
};

module.exports = connectDB;
