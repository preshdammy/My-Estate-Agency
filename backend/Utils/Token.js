
const jwt = require("jsonwebtoken")
// let secretkey = "jwtsecret"

const Verifytoken = async(token)=>{
 try {
    if (!token) {
        throw new Error ("Token is not provided")
    }
    else{
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        return decoded.email
    }
 } catch (error) {
    if (error.name == "TokenExpiredError") {
        throw new Error("jwt expired")
    }else{
        // throw new Error("error verifying token")
    }

 }
}

const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  Verifytoken,
  decodeToken,
};



