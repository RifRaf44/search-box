/**
 * Created by RaphaelV on 5/06/2015.
 */
angular.module('searchbox').controller('ModalController', function($scope, close){
    result = {};
    $scope.save = function() {
        result.save = true;
        result.data = $scope.name;

        close(result, 500); // close, but give 500ms for bootstrap to animate
    };

    $scope.cancel = function(){
        result.save = false;

        close(result, 500); // close, but give 500ms for bootstrap to animate
    }

})