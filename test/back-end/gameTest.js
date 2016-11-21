process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server/server');
var should = chai.should();
var Game = require("../../server/models/game");
var Pin = require("../../server/models/pin");
var User = require("../../server/models/user");

chai.use(chaiHttp);

describe('Game', function () {

  afterEach(function (done) {
    Game.collection.drop();
    Pin.collection.drop();
    done();
  });

  it('should not get list of all games on /games GET if user is not authenticated', function (done) {
    chai.request(server).get('/games').end(function (err, res) {
      res.should.have.status(200);
      res.body.should.be.an('object');
      done();
    });
  });

  it('should add a game on /games POST', function (done) {
    chai.request(server).post('/games').set({ 'authorization': 'test' }).send({ 'name': 'Testy Johnson', limit: 4 }).end(function (err, res) {
      res.should.have.status(200);
      res.body.name.should.equal('Testy Johnson');
      res.body.scoreboard[0].points.should.equal(100)
      res.body.scoreboard[0].user.should.equal('58221b1deb8543b7ba21e39f')
      res.body.users[0]._id.should.equal('58221b1deb8543b7ba21e39f');
      done();
    });
  });

  it('should get a single game on GET /games/:gameid', function (done) {
    new Game({
      name: 'test game name',
      pins: [],
      users: ['58221b1deb8543b7ba21e39f']
    }).save(function (err, game) {
      chai.request(server).get('/games/' + game._id).set({ 'authorization': 'test' }).end(function (err, res) {
        res.should.have.status(200);
        res.body[0].name.should.equal('test game name');
        res.body[0]._id.should.equal(game._id.toString());
        res.body[0].users[0].should.equal('58221b1deb8543b7ba21e39f');
        done();
      });
    });
  });

  it('should set a winner for a game', function (done){
    var game
    new Game({  //  CREATE NEW GAME
        name: 'test game name',
        pins: [],
        users: [],
        scoreboard: [],
        remain: 12
      })
      .save(function (err, gameRes) {
        game = gameRes;
      });

    new User({
      firstName: 'Testy',
      lastName: 'Johnson',
      email: 'tester@test.com'
    })
    .save(function (err, user){
      chai.request(server).put('/games/' + game._id + '/winner').set({ 'authorization': 'test'}).send({'winner': user}).end(function (err,res){
        console.log("RESSS~~~~~~", res.res.body)
        res.should.have.status(200);
        res.body.winner.should.exist;
        done();
    })
    });
  });

  it('should start a game', function (done) {
    var gameId;
    new Game({
      name: 'test game name',
      pins: [],
      users: [],
      limit: 1,
      remain: 1
    }).save(function (err, game) {
      gameId = game._id
      chai.request(server)
      .put('/games/' + gameId) // JOIN THE GAME
      .set({ 'authorization': 'test' })
      .end(function (err, res) {
        chai.request(server) // Sending post request to create a pin for a specific game
        .post('/games/' + gameId + '/pins')
        .set({ 'authorization': 'test' })
        .send({ address: 'Testing Ave 1', points: 20 })
        .end(function(err, res){
          chai.request(server) // Sending post request to create a pin for a specific game
          .post('/games/' + gameId + '/pins')
          .set({ 'authorization': 'test' })
          .send({ address: 'Testing Ave 2', points: 20 })
          .end(function(err, res){
            chai.request(server) // Sending post request to create a pin for a specific game
            .post('/games/' + gameId + '/pins')
            .set({ 'authorization': 'test' })
            .send({ address: 'Testing Ave 3', points: 20 })
            .end(function(err, res){
              Game.findOne({_id: gameId}, (err, game) => {
                console.log('GAME: ', game)
                game.start.should.equal(true)
                game.remain.should.equal(0)
                done()
              })
            })
          })
        })
      })
    });
  });

  it('should allow a logged in user to join a game if there is space- but not more than once', function (done) {
    new Game({
      name: 'test game name',
      pins: [],
      users: [],
      remain: 12
    }).save(function (err, game) {
      chai.request(server).put('/games/' + game._id)
      .set({ 'authorization': 'test' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body[0].scoreboard[0].user.should.equal('58221b1deb8543b7ba21e39f')
        res.body[0].scoreboard[0].points.should.equal(100)
        res.body[0].remain.should.equal(11);
        res.body[0].users[0]._id.should.equal('58221b1deb8543b7ba21e39f');
        chai.request(server).put('/games/' + game._id)
        .set({ 'authorization': 'test' })
        .end(function (err, res) {
          res.text.should.equal('You already joined this game')
          done();
        });
      });
    });
  });

  it('should not allow a logged in user to join a game if there is not space', function (done) {
    new Game({
      name: 'test game name',
      pins: [],
      users: [],
      remain: 0
    })
    .save(function(err, game) {
        chai.request(server)
        .put('/games/' + game._id)
        .set({'authorization': 'test'})
        .end(function(err, res) {
          res.body[0].users.length.should.equal(0);
          done();
        })
    })
  })

});
