const express = require('express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const cors = require("cors");

const port = process.env.PORT;
const region = process.env.REGION;
const userPoolId = process.env.USERPOOLID;
const app = express();

app.use(cors({
    origin: '*'
}));
  

const client = jwksClient({
    jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});

function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
        // console.log(`${key}`);
        // var signingKey = key.publicKey || key.rsaPublicKey;
        // callback(null, signingKey);
        if (err) {
            console.error('Error retrieving signing key', err);
            return callback(err, null);
          }
          if (!key) {
            console.error('No key found');
            return callback(new Error('No key found'), null);
          }
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
    });
}

// Middleware to check and validate JWT token
const checkTokenMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`);

  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, getKey, (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token.' });
    }

    // Token is valid, save decoded information for the next middleware
    req.user = decoded;
    next();
  });
};

// Profile API
app.get('/profile', checkTokenMiddleware, (req, res) => {
  // Assuming the JWT contains user information in its payload
  console.log('profile apis');
  res.json({
    message: 'Profile information',
    user: req.user // User information decoded from the JWT
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
