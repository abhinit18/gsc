myApp.controller('loginController', loginController);
loginController.$inject = ['$scope', '$http', '$location', 'baseUrl', '$cookies', 'growl','$sce'];

function loginController($scope, $http, $location, baseUrl, $cookies, growl,$sce) {

    $scope.$on('$routeChangeSuccess', function() {
        $scope.pwdValidateStyle = {
            'display': 'none'
        };
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };

    });

    /* ------------------------------------------------
                            EMAIL
       ------------------------------------------------ */
    $scope.checkEmail = function(email) {

        $scope.clearEmailCheck();
        if (!email) {
            $scope.displayEmailMessage = "Please enter an Email ID";
            $scope.emailValidateWrongStyle = {
                'display': 'block'
            };
            return;
        }
        $http.get(baseUrl + "/omsservices/webapi/signup/checkemail?email=" + email).success(function(data) {
            if (data) {
                $scope.emailValidateCorrectStyle = {
                    'display': 'block'
                };
            } else {
                $scope.emailValidateWrongStyle = {
                    'display': 'block'
                };
                $scope.displayEmailMessage = "Email is not registered";
            }
        }).error(function(error, status) {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else if (status == 401) {
                //$('#AuthError').modal('show');
                growl.error('Your Email ID or Password might be incorrect.');
                $location.path('/login');
            }
            else {
                alert("Service is down");
            }
        });
    };

    $scope.clearEmailCheck = function() {
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };
        $scope.displayEmailMessage = "";
    };



    /* ------------------------------------------------
                         PASSWORD
       ------------------------------------------------ */

    $scope.checkPwd = function(password) {
        $scope.clearPwdCheck();
        if (!password) {
            $scope.displayPasswordMessage = "Please Enter the Password";
            $scope.pwdValidateStyle = {
                'display': 'block'
            };
            return false;
        }
        return true;
    };

    $scope.clearPwdCheck = function() {
        $scope.displayPasswordMessage = "";
        $scope.pwdValidateStyle = {
            'display': 'none'
        };
    };

    /* ------------------------------------------------
                         LOGIN
       ------------------------------------------------ */


    $scope.userLogin = function() {

        $scope.displayEmailMessage = "";
        $scope.displayPasswordMessage = "";
        $scope.pwdValidateStyle = {
            'display': 'none'
        };
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };

        console.log(baseUrl);
        if (!$scope.email && !$scope.password) {
            $scope.displayEmailMessage = "Please enter an Email ID";
            $scope.emailValidateWrongStyle = {
                'display': 'block'
            };
            $scope.displayPasswordMessage = "Please enter the Password";
            $scope.pwdValidateStyle = {
                'display': 'block'
            };
            return;
        } else if (!$scope.email) {
            $scope.displayEmailMessage = "Please enter an Email ID";
            $scope.emailValidateWrongStyle = {
                'display': 'block'
            };
            return;

        } else if (!$scope.password) {
            $scope.displayPasswordMessage = "Please enter the Password";
            $scope.pwdValidateStyle = {
                'display': 'block'
            };
            return;
        }

        $http.get(baseUrl + "/omsservices/webapi/signup/checkemail?email=" + $scope.email).success(function(data) {
            localStorage.clear();
            if (data == 'false') {
                $scope.displayEmailMessage = "Email is not registered";
                $scope.emailValidateWrongStyle = {
                    'display': 'block'
                };
                return;
            } else {

                $http.post(baseUrl + "/omsservices/webapi/login/authenticate?email=" + $scope.email + "&password=" + $scope.password).success(function(data) {
                    console.log(data);
                    $http.get(baseUrl + "/omsservices/webapi/clientprofiles/clientfirsttime")
                        .success(function(firsttime)
                        {
                            if (firsttime && !data) {
                                $scope.password = '';
                                $scope.displayPasswordMessage = "Wrong password entered";

                                //display cross-icon-password
                                $scope.pwdValidateStyle = {
                                    'display': 'block'
                                };
                                return;
                            } else if (data.tableUserIsEmailVerified == false) {
                                console.log("not verified");
                                $('#loginError').modal('show');
                            } else {
                                $cookies.put("username", data.tableUserFirstName);
                                console.log(data.tableUserIsEmailVerified);
                                $cookies.put("useremail", data.tableUserEmailId);
                                $scope.password = '';
                                $scope.showAlert = true;
                                $scope.displayActivationMessage = "";
                                $scope.alertMsg = "Redirecting to Dashboard";
                                $http.get(baseUrl + "/omsservices/webapi/clientprofiles/checkfirsttime")
                                    .success(function(data)
                                    {
                                        console.log(data);

                                    }).error(function(data)
                                {
                                    console.log(data);
                                });
                                $cookies.put('isLoggedIn', true);
                                $cookies.put('timezone',data.tableClient.tableClientTimeZone);

                                $http.get(baseUrl + "/omsservices/webapi/omsusers/omsusergroup")
                                    .success(function(data,status,headers)
                                    {
                                        if(data.tableOmsUserGroupName == 'ROLE_VENDOR')
                                        {
                                            localStorage.setItem('isvendor',true);
                                            localStorage.setItem('vendorid',headers()['vendorid'])
                                        }
                                        else
                                        {
                                            localStorage.setItem('isvendor',false);
                                        }
                                    }).error(function(error,status){
                                        console.log("error occured to get user role")
                                });

                                $scope.getmenubar();
                            }

                        }).error(function(error, status) {
                        console.log(error);
                        console.log(status);
                        if(status == 400){
                            $scope.displayEmailMessage = error.errorMessage;
                        }
                        else if (status == -1 || status == 401) {
                            growl.error('Your Email ID or Password might be incorrect.');
                        }
                        else{
                            growl.error("Failed to authenticate user")
                        }
                    });
                }).error(function(error, status) {
                    console.log(error);
                    console.log(status);
                    if(status == 400){
                        $scope.displayEmailMessage = error.errorMessage;
                    }
                    else if (status == -1 || status == 401) {
                        growl.error('Your Email ID or Password might be incorrect.');
                    }
                    else{
                        growl.error("Failed to authenticate user")
                    }
                });
            }
        });
    };

    $scope.resendActivationLink = function() {
        $http.get(baseUrl + "/omsservices/webapi/login/resend?email=" + $scope.email).success(function(data) {
            console.log(data);
            if (data == true) {
                $scope.showAnchor = false;
                $('#loginError').modal('hide');
                growl.success("Activation link has been sent successfully to your email address provided during registration.");
            }
        }).error(function(error, status) {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else if (status == 401) {
                growl.error('Your Email ID or Password might be incorrect.');
            }
            else{
                growl.error('Failed to send mail');
            }
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


    var LoginToken = $cookies.get('isLoggedIn');
    console.log(LoginToken);
    $scope.checkLogedIn = function() {
        var menubar = JSON.parse(localStorage.getItem("menu"));
        if(menubar == null){
            $cookies.put('isLoggedIn',false);
        }
        console.log(typeof LoginToken);
        if (LoginToken == true || LoginToken == 'true') {
            console.log('helloe');
            $location.path('/Dashboard');
        } else {
            console.log('login again');
        };
    };
    $scope.checkLogedIn();

    $scope.getmenubar = function(){
        var menuUrl = baseUrl + "/omsservices/webapi/omsusers/menu?user="+$cookies.get('useremail');
        $http.get(menuUrl).success(function(data)
        {
            localStorage.setItem('menu', JSON.stringify(data));
            if(data.length == 0)
            {
                console.log("throw error");
                return;
            }
            if(data[0].href)
            {
                localStorage.setItem('defaultpage',data[0].href);
            }
            else
            {
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
            $location.path(localStorage.getItem('defaultpage'));
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
//--------------------------------------- circleAdmin ---------------------------------------//
