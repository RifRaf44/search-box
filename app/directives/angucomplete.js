/**
 * Angucomplete
 * Autocomplete directive for AngularJS
 * By Daryl Rowland
 */

angular.module('searchbox')
    .directive('angucomplete', function ($parse, $http, $timeout, ModalService) {
    return {
        restrict: 'EA',
        scope: {
            "id": "@id",
            "placeholder": "@placeholder",
            "selectedObject": "=selectedobject",
            "url": "@url",
            "titleField": "@titlefield",
            "descriptionField": "@descriptionfield",
            "imageField": "@imagefield",
            "inputClass": "@inputclass",
            "userPause": "@pause",
            "localData": "=localdata",
            "companies": "=companies",
            "searchFields": "@searchfields",
            "minLengthUser": "@minlength"
        },
        templateUrl: 'app/templates/searchbox.html',
        controller: function ( $scope ) {
            $scope.lastFoundWord = null;
            $scope.currentIndex = null;
            $scope.justChanged = false;
            $scope.searchTimer = null;
            $scope.searching = false;
            $scope.pause = 500;
            $scope.minLength = 3;
            $scope.myFilters = []
            $scope.filterOpen = false;

            init()
            function init(){
                if(localStorage["myFilters"]){
                    $scope.myFilters = JSON.parse(localStorage["myFilters"]);
                }
            }

            if ($scope.minLengthUser && $scope.minLengthUser != "") {
                $scope.minLength = $scope.minLengthUser;
            }

            if ($scope.userPause) {
                $scope.pause = $scope.userPause;
            }

            $scope.processResults = function(responseData) {
                if (responseData && responseData.length > 0) {
                    $scope.results = [];
                    // var companies = []
                    var people = [], calculations = [];

                    from(responseData).take(7).each(function(obj){
                        people.push(obj);
                    });

                    //$scope.companies = companies;
                    $scope.people = people;


                } else {
                    //$scope.companies = [];
                    $scope.people = [];
                }
            }

            $scope.search = function(str, searchFields) {
                // Begin the search
                // init filteredResults if Necessary
                $scope.filteredResults = $scope.filteredResults || $scope.localData;

                if (str.length >= $scope.minLength) {
                    if ($scope.filteredResults) {

                        var matches = [];


                        for (var i = 0; i < $scope.filteredResults.length; i++) {
                            var match = false;
                            var searchString = '';

                            for(var j = 0; j < searchFields.length; j++){
                                searchString += eval('$scope.filteredResults[i].' + searchFields[j]) + ' ';
                            }
                            if (searchString.toLowerCase().search(str.toLowerCase()) != -1) {
                                matches[matches.length] = $scope.filteredResults[i];
                            }
                        }

                        $scope.searching = false;
                        $scope.processResults(matches);
                        $scope.$apply();
                    }
                }

            }

            $scope.filter = function(){
                if($scope.filterStr.length > 0){
                    $timeout(function(){
                        $scope.search($scope.filterStr,["company"]);
                    },1);
                }
                else
                {
                    $scope.companies = [];
                }

            }

            function filterCompanies(companies){

                if (companies.length > 0) {

                    var results = [];

                    for (var i = 0; i < $scope.localData.length; i++) {
                        var match = false;
                        var matchString = 'match = match ||';

                        for(var j = 0; j < companies.length; j++){
                            match = match || $scope.localData[i].company == companies[j].company;
                            //matchString += eval('$scope.filteredResults[i].company') + ' == ' + companies[j].company + ' ||' ;
                        }

                        if(match){
                            results.push($scope.localData[i]);
                        }
                    }

                    $scope.searching = false;
                    $scope.filteredResults = results;


                }else{
                    $scope.filteredResults = $scope.localData;
                }
                }


            $scope.toggle = function (company) {
                if(!$scope.selectedCompanies)
                {
                    $scope.selectedCompanies = [];
                }

                if($scope.companies.indexOf(company) < 0){
                    var result = $scope.companies.filter(function( obj ) {
                        return obj.companyId == company.companyId;
                    });
                    company = result[0];
                }

                var i = $scope.selectedCompanies.indexOf(company)
                if(i > -1){
                    company.checked = false;
                    $scope.selectedCompanies.splice(i,1);
                    filterCompanies($scope.selectedCompanies);
                }
                else
                {
                    company.checked = true;
                    $scope.selectedCompanies.push(company);
                    filterCompanies($scope.selectedCompanies);
                }
            }



            $scope.keyPressed = function(event) {
                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                    if (!$scope.searchStr || $scope.searchStr == "") {
                        $scope.showDropdown = false;
                    } else {

                        if ($scope.searchStr.length >= $scope.minLength) {
                            $scope.showDropdown = true;
                            $scope.currentIndex = -1;
                            $scope.results = [];

                            if ($scope.searchTimer) {
                                clearTimeout($scope.searchTimer);
                            }

                            $scope.searching = true;

                            $scope.searchTimer = setTimeout(function() {
                                $scope.search($scope.searchStr, $scope.searchFields.split(","));
                            }, $scope.pause);
                        }

                    }

                } else {
                    event.preventDefault();
                }
            }


            $scope.selectPerson = function(person) {
                console.log(person);
                $scope.selectedObject = person;
                $scope.searchStr = ""
                $scope.showDropdown = false;
                $scope.results = [];
                //$scope.$apply();
            }

            $scope.openFilter = function(){
                $scope.filterOpen = !$scope.filterOpen;
            }

            $scope.selectFilter = function(filter){
                for(var j=0; j < $scope.selectedCompanies.length; j++ ){
                    $scope.selectedCompanies[j].checked = false;
                }
                $scope.selectedCompanies = [];
                for(var i=0; i < filter.content.length; i++){
                    $scope.toggle(filter.content[i]);
                }
            }

            $scope.saveSelected = function(){

                ModalService.showModal({
                    templateUrl: "app/templates/modal.html",
                    controller: "ModalController"
                }).then(function(modal) {

                    //it's a bootstrap element, use 'modal' to show it
                    modal.element.modal();
                    modal.close.then(function(result) {
                        if(result.save){

                        var myFilters = localStorage["myFilters"];

                        var saveObj = {
                            name: result.data,
                            content: $scope.selectedCompanies
                        }

                        if(!myFilters){
                            localStorage["myFilters"] = JSON.stringify([saveObj]);
                        }
                        else
                        {
                            var tempArr = JSON.parse(myFilters);
                            tempArr.push(saveObj)
                            localStorage["myFilters"] = JSON.stringify(tempArr);
                        }
                        $scope.myFilters.push(saveObj);

                        }
                    });
                });

            }



        },

        link: function($scope, elem, attrs, ctrl) {

            $scope.$watch('filterOpen', function(){
                var a = angular.element('a.input-group-addon');
                if($scope.filterOpen){
                    a.addClass('filter-active')
                }
                else
                {
                    $scope.myFilterOpen = false
                    a.removeClass('filter-active')
                }
            });

            elem.bind("keyup", function (event) {
                if(event.which === 40) {
                    if (($scope.currentIndex + 1) < $scope.results.length) {
                        $scope.currentIndex ++;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                    $scope.$apply();
                } else if(event.which == 38) {
                    if ($scope.currentIndex >= 1) {
                        $scope.currentIndex --;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                } else if (event.which == 13) {
                    if ($scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                        $scope.selectResult($scope.results[$scope.currentIndex]);
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    } else {
                        $scope.results = [];
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                } else if (event.which == 27) {
                    $scope.results = [];
                    $scope.showDropdown = false;
                    $scope.$apply();
                } else if (event.which == 8) {
                    $scope.selectedObject = null;
                    $scope.$apply();
                }
            });


        }
    };
});