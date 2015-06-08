angular.module('searchbox', ['angularModalService']).controller('MainCtrl', function($scope, $http){

    $http.get('./data/companies.json').then(function(result){
        $scope.companies = result.data;
    });
	$http.get('./data/people.json').then(function(result){
        $scope.people = result.data;
    });

});