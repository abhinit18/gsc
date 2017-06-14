/**
 * Created by angularpc on 04-11-2016.
 */
myApp.controller('verifyUserController', verifyUserController);
verifyUserController.$inject = ['$scope', '$http', '$location','baseUrl','$sce'];

function verifyUserController($scope, $http, $location,baseUrl,$sce) {
    $scope.$on('$routeChangeSuccess', function () {
        //        $scope.displayEmail = $location.search().email;
        //$scope.displayEmail = 'abc@example.com';
    });

    console.log($location.search());
    $scope.userEmail = $location.search().email;
    $scope.hashcode = $location.search().hashcode;
    //{{url}}/omsservices/webapi/login/verify?email=abcd&hashcode=abcd

    $scope.UserVerification = function(){
        $scope.loading=false;
        $http({
            method: 'GET',
            url: baseUrl + '/omsservices/webapi/login/verify?email='+$scope.userEmail+'&hashcode='+$scope.hashcode
        }).success(function(data){
            console.log(data);
            if(data == true){
                $scope.verifiedsuccess = true;
            }else{
                $scope.verifiedfailed = true;
                $scope.resendlink = false;
                $scope.verifiedsuccess = false;
            }
            $scope.loading = true;
        }).error(function(data){
            console.log(data);
            $scope.errorMessage = data.errorMessage;
            $scope.documentation = data.documentation;
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.verifiedsuccess = false;
        });
    }

    $scope.UserVerification();

    $scope.ResendLink = function(){
        $http({
            method: 'GET',
            url: baseUrl + '/omsservices/webapi/login/resend?email='+$scope.userEmail
        }).success(function(data){
            console.log(data);
            $scope.resendlink = true;
            $scope.verifiedsuccess = false;
            $scope.verifiedfailed = false;
            $scope.loading = true;
        }).error(function(data){
            console.log(data);
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.verifiedsuccess = false;
        });
    }

    //============================================ terms and conditions modal as well as Privacy pollicy =========== //
    $scope.OpenTnC = function(){
        $('#TnC').modal('show');
        var termsnConditions = "https://s3.ap-south-1.amazonaws.com/glmetadata1/pdf/Maven+Terms+of+Service.pdf#page=1&zoom=100";
        $scope.TnC = $sce.trustAsResourceUrl(termsnConditions);
    };
    $scope.PrivacyModal = function(){
        $('#privacy').modal('show');
        var privacyPolicyUrl = "https://s3.ap-south-1.amazonaws.com/glmetadata1/pdf/MavenPrivacy+Policy.pdf#page=1&zoom=100";
        $scope.privacyPolicy = $sce.trustAsResourceUrl(privacyPolicyUrl);
    };


};