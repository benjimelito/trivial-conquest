angular.module('trivial.allgames', [])

.controller('AllGamesCtrl', ['$scope', '$stateParams', 'gameSrvc', '$window', function($scope, $stateParams, gameSrvc, $window) {
 //will need to pull all games fom the server and attach them to scope variable


 $scope.getGames = function(){
  
    gameSrvc.getAllGames()
    .then(function(games){
      console.log('all games retrieved', typeof(games))
      if(typeof(games) === 'string') $window.location = '/'
      $scope.games = games
    })
    .catch(function(){
      console.log('no games retrieved')
      $scope.repeat = true
      $scope.allgames.gamename = null
    })
 }

  $scope.createGame = function(){
    console.log('this is inside createGmae', name)
    gameSrvc.createGame($scope.allgames.gamename)
    .then(function(game){
      console.log("$$$$%%%^^#", game._id)
      $scope.getGames()
      $scope.allgames.gamename = null
      $scope.allgames.repeat = function(){
        return false;
      }
      $window.location = '#/games/' + game._id
    })
    .catch(function(err){
     console.log('this didnt work')
     $scope.allgames.repeat = function(){
      return true;
      }
      $scope.allgames.gamename = null;
    })
  }




$scope.getGames()

 }])