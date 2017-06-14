myApp.controller('clientprofileController', clientprofileController);

clientprofileController.$inject = ['$scope', '$http', '$location', 'baseUrl','commonPathUrl', '$mdDialog', '$mdMedia','$sce', 'growl', '$window', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies','$timeout','$controller'];

function clientprofileController($scope, $http, $location, baseUrl,commonPathUrl, $mdDialog, $mdMedia,$sce, growl, $window, Upload, PagerService, $q,  $routeParams, $cookies,$timeout,$controller) {

    $scope.invoiceformatavailable = false;
    $scope.saleorderinvoiceformat = "";
    $scope.invoicedetails = {};
    $scope.showfinanceyear=false;

    $scope.financialYears = {
        "yy-yy" : 1,
        "yy" : 2

    }
    $scope.clientprofile = {};

    $scope.$on('$routeChangeSuccess', function() {
        $scope.getClientProfile();
        $scope.getInvoice();
    });

    $scope.getClientProfile = function() {
        var clientProfileUrl = baseUrl + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data) {
            if(data.length > 0){
                $scope.clientprofile = data[0];
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to load client profile");
            }
        });
    }

    $scope.getInvoice = function() {
        var invoiceUrl = baseUrl + "/omsservices/webapi/saleorderinvoicerule";
        $http.get(invoiceUrl).success(function(data) {
            if(data.length > 0){
                $scope.invoicedetails = data[0];
                $scope.checkFinancialyear();
            }
        }).error(function(error, status) {
        });
    }

    $scope.checkFinancialyear = function() {
        if($scope.invoicedetails.tableSaleOrderInvoiceRulesIsFySelected){
            if($scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat == null)
            {
                $scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat = 1;
            }
            $scope.showfinanceyear=true;
        }else{
            $scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat = null;
            $scope.showfinanceyear=false;
        }
    }

    $scope.updateInvoiceDetails = function() {
        if($scope.invoicedetails.idtableSaleOrderInvoiceRulesId)
        {
            $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/saleorderinvoicerule/' + $scope.invoicedetails.idtableSaleOrderInvoiceRulesId,
                data: $scope.invoicedetails,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                growl.success("invoice details updated successfully");
            }).error(function(error, status) {
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Failed to update Invoice Details");
                }

            });
        }
        else
        {
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/saleorderinvoicerule',
                data: $scope.invoicedetails,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                $scope.invoicedetails = res;
                growl.success("invoice details updated successfully");
            }).error(function(error, status) {
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Failed to update Invoice Details");
                }

            });
        }

    }

    $scope.updateClientProfile = function() {
        if(!$scope.clientprofile.tableClientProfileCst){
            growl.error("Enter CST/TIN No");
            return;
        }
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/clientprofiles',
            data: $scope.clientprofile,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            growl.success("CST/TIN No updated successfully");
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Failed to update clientProfile");
            }

        });
    }


}
