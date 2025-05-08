const mongoose = require('mongoose');

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connection successfull");

    } catch (err) {
        console.error("MongoDB connection failed", err);
    }
}

module.exports =  connectToDB;