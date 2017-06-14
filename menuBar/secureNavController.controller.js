myApp.controller('secureNavController', secureNavController);

secureNavController.$inject = ['$scope','$rootScope', '$location', '$http', 'baseUrl', '$cookies'];

function secureNavController($scope,$rootScope, $location, $http, baseUrl, $cookies) {

    var noHeaderPaths = ['/login/','/forgotPassword/','/resetpassword','/signUpSuccess/','/verifyFail','/verifySuccess','/maintenance/','/signUp/'];
    //noHeaderPaths.indexOf($location.path()) !== -1 ? true : false;
    $scope.hidePageHeader = noHeaderPaths.indexOf($location.path()) !== -1 ? true : false;
    $rootScope.$on('$locationChangeStart', function() {
        $scope.hidePageHeader = noHeaderPaths.indexOf($location.path()) !== -1 ? true : false;
        $scope.getmenubar();
        $scope.userNavData = $cookies.get("username");
    });

    $scope.userNavData = $cookies.get("username");

    $scope.isClicked = [];

    $scope.showHideDropdown = function(index) {

        if($scope.isClicked[index] == undefined || $scope.isClicked[index] == false){
            $scope.isClicked = [];
            $scope.isClicked[index] = true;
        }
       else{
            $scope.isClicked = [];
            $scope.isClicked[index] = false;
        }
    };

    $scope.hideDropdown = function(index) {
        $scope.isClicked[index] = false;
    };


    $scope.getmenubar = function() {
        $scope.menubar = JSON.parse(localStorage.getItem("menu"));
        /*if($scope.menubar == null && isLoggedIn){
           $scope.getmenu();
        }*/
        $scope.createanalyticsmenu = localStorage.getItem("createanalyticsmenu");
        $scope.createinventorypassbookmenu = localStorage.getItem("createinventorypassbookmenu");
    };

    $scope.getmenubar();

    $scope.isActive = function (path) {
        if(path.href){
            return $location.path() === path.href;
        }
        else if(path.subMenu){
            var found = false;
            path.subMenu.forEach(function (v) {
                if($location.path() === v.href){
                    found = true;
                }
            });
            return found;
        }

    }

    $scope.logout = function() {
        var leftUrl = "/omsservices/webapi/login/logout";
        $http({
            method: 'POST',
            url: baseUrl + leftUrl
        }).success(function(res) {
            console.log(res);
            localStorage.clear();
            $cookies.put('isLoggedIn', false);
            $location.path('/login');

        }).error(function(error) {
            console.log(error)
        });
    }


    $scope.getmenu = function(){
        var menuUrl = baseUrl + "/omsservices/webapi/omsusers/menu?user="+$cookies.get('useremail');
        $http.get(menuUrl).success(function(data)
        {
            localStorage.setItem('menu', JSON.stringify(data));
            if(data.length == 0){
                console.log("throw error");
                return;
            }
            if(data[0].href){
                localStorage.setItem('defaultpage',data[0].href);
            }
            else{
                localStorage.setItem('defaultpage',data[0].subMenu[0].href);
            }

            var dashboard = false, inventory=false;
            angular.forEach(data, function(value) {
                if(value.name == 'Analytics'){
                    localStorage.setItem('analytics',true);
                }
                else if(value.name == 'Inventory Passbook')
                {
                    localStorage.setItem('inventorypassbook',true);
                }
                else if(value.name == 'Inventory')
                {
                    inventory = true;
                }
                else if(value.name == 'Dashboard')
                {
                    dashboard = true;
                }
            });
            if(inventory == false){
                var passbook = localStorage.getItem('inventorypassbook');
                if(passbook == "true"){
                    localStorage.setItem('createinventorypassbookmenu',true);
                }
            }
            if(dashboard == false){
                var analytics = localStorage.getItem('analytics');
                if(analytics == "true"){
                    localStorage.getItem('createanalyticsmenu',true);
                }
            }
            $scope.menubar = data;
        }).error(function(error, status)
        {
            if(status == 400 || status == 401){
                console.log(error.errorMessage);
            }
            else{
                console.log("Failed to get Menu bar");
            }

        });
    }
};
