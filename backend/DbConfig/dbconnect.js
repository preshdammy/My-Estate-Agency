const mongoose = require('mongoose')

const connect = async()=>{
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI)
    if (connection) {
      console.log("database connected");
      
    }
  } catch (error) {
    console.log(error);
    
  }
}

module.exports = connect