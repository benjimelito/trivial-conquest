'use strict';

var AuthModule = require('../config/AuthModule');
var TokenService = require('../config/TokenService');

module.exports = {
    facebookAuth: facebookAuth,
    retrieveUser: retrieveUser,
    generateToken: generateToken
};

function facebookAuth(req, res, next) {

    console.log('this is working', req.body)
    var options = {
        code: req.body.code,
        clientId: req.body.clientId,
        redirectUri: req.body.redirectUri
    };
    console.log('this is fcbkauth options', options)

    AuthModule.facebookAuthentication(options, function (err, response) {
        if (err) return res.status(401).json({ err: 'Error during facebook oauth' });
        console.log('this is facebookAuth')
        // for larger apps recommended to namespace req variables
        req.authObject = response;

        next();
    });
}

// Here we will generate the user or retrieve existing one to pass for our token generator
function retrieveUser(req, res, next) {
    console.log('this is retrieveuser')
    if (!req.authObject) return res.status(401).json({ err: "Error while fetching user" });

    var userToRetrieve = {
        user: req.authObject.user,
        type: req.authObject.type
    };

    AuthModule.createOrRetrieveUser(userToRetrieve, function (err, user) {
        console.log('this is createOrRetrieveUser')
        if (err || !user) return res.status(401).json({ err: 'Error while fetching user' });

        req.user = user;

        next();
    });
}

// The last Middleware in the chain
// reponsible for returning the generated token back to client
function generateToken(req, res, next) {
    console.log('this is generate token')
    TokenService.createToken({ user: req.user }, function (err, token) {
        console.log('this is creatingtoken')
        if (err) return next({ status: 401, err: 'User Validation failed' });

        req.generatedToken = token;

        next();
    });
}