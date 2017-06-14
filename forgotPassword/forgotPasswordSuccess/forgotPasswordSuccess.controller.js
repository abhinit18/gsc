myApp.controller('forgotPwdSuccessController', forgotPwdSuccessController);
forgotPwdSuccessController.$inject = ['$scope', '$http', '$location'];

function forgotPwdSuccessController($scope, $http, $location) {
    $scope.$on('$routeChangeSuccess', function () {
//        $scope.displayEmail = $location.search().email;
        $scope.displayEmail = 'abc@example.com';
    });
};