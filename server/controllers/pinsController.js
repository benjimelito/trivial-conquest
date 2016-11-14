const db = require('../models/config')
const Pin = require('../models/pin')

module.exports = {
  createNewPin: (req, res) => {
    //First checking to see how many pins user has already created
    Pin.find({game : req.params.gameid})
    .then((pins) => {
      var userPins = pins.filter(function(pin){
        return pin.creator === req.tokenPayload._id
      })
      //If the user has created 3 pins already, throw an error
      if(userPins.length >= 3) {
        console.log('Over pins limit')
        throw new Error('You have already created the maximum number of pins allowed')
      }
      Pin.find({game: req.params.gameid, address: req.body.address}).then(repeats => {
        console.log('REPEATS: ', repeats)
        if(repeats.length > 0){
          res.status(500).send('Sorry mate- that pin already exists')
        } else {
          //Otherwise, add a new pin
          new Pin({
            address: req.body.address,
            name: req.body.name,
            coordinates: req.body.coordinates,
            owner: req.tokenPayload._id,
            creator: req.tokenPayload._id,
            game: req.params.gameid,
            icon: req.tokenPayload.profilePicture
          }).save()
          .then((pin) => {
            console.log('successfully created pin: ', pin)
            res.send(pin)
          })
          .catch((err) => {
            console.log('ERROR: ', err)
            res.status(500).send('Pin limit reached')
          })
        }
      })
    })
  },

  deletePin: (req, res) => {
    Pin.find({_id: req.params.pinId}).remove()
    .then((pin) => {
      res.send(pin)
      // res.redirect('/')
    })
    .catch((err) => {
      console.log('ERROR: ', err)
    })
  },

  getPinsForGame: (req, res) => {
    Pin.find({game : req.params.gameid})
    .then((pins) => {
      res.send(pins)
    })
    .catch((err) =>{
      console.log('ERROR', err)
    })
  },

  updatePinOwner: (req, res) => {
    Pin.findOneAndUpdate({_id: req.params.pinId}, {owner: req.tokenPayload._id, icon: req.tokenPayload.profilePicture}, {new: true}, function(err, pin){
        if (err) return res.send(500, { error: err });
        return res.send(pin);
    });
  }
};
