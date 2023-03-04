const jwt = require("jsonwebtoken");
const privateKey = "mantapp";
const pool = require("../db");

const authenticationUser = (req, res, next) => {
// console.log("mas");
const accessToken = req.headers.access_token;
if(accessToken) {
    jwt.verify(accessToken, privateKey, (error, decoded) => {
        if(error) throw console.error(`Error Message:{${error}}`);
        const {id, email, role} = decoded;
        const findUser = `SELECT * FROM users WHERE id = $1`;
          pool.query(findUser, [id], (error, result) => {
            if(error) throw error;
            if (result.rows.length === 0) {
                console.log("Wrong Password");
            } else {
                const user = result.rows[0];
                req.logUser = {
                    id: user.id,
                    email: user.email,
                    role: user.role
                };
                next();
            }
          })
    });
} else {
    console.log("gagal masuk");
}
}

const authorizationUser = (req, res, next) => {
    const {id, email, role, is_login} = req.logUser;
 
    if(is_login) {
        next();
    } else {
        next(message = gagalMasuk);
    }

}

module.exports = {authenticationUser, authorizationUser};