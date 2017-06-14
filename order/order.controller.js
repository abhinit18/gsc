myApp.controller('orderController', orderController);


orderController.$inject = ['$rootScope' ,'$scope' ,'$http', '$location', '$filter', 'baseUrl','commonPathUrl', '$mdDialog', '$mdMedia','$sce', 'growl', '$window', 'downloadOrderTemplateUrl', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies','$timeout','$controller', 'mastersService'];
       
function orderController($rootScope ,$scope, $http, $location, $filter, baseUrl, commonPathUrl, $mdDialog, $mdMedia,$sce, growl, $window, downloadOrderTemplateUrl, Upload, PagerService, $q,  $routeParams, $cookies, $timeout, $controller,  mastersService) {

    $scope.addDeliveryClicked = false;
    $scope.singleorderData = {};
    $scope.singleorderData.billingAddressSameAsShipping = false;
    $scope.customersData = {};
    $scope.customerAddress = {};
    $scope.billingAddress = {};
    $scope.shippingAddress = {};
    $scope.bulkOrderSettingData = "";
    $scope.billingAddrClicked = false;
    $scope.warehouseError = {};
    $scope.notApplicableCounter = 1;
    $scope.filter = {};
    $scope.bulkUploadTabShow = true;
    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];

    $scope.shipping = {};

    $scope.start = 0;
    $scope.orderSize = 5;
    if ($cookies.get('Dashdata')) {
        $scope.defaultTab = $cookies.get('Dashdata');
    } else {
        var currentUrl,UrlName;
        currentUrl = window.location.href;
        UrlName = currentUrl.search('order');
        console.log(UrlName);
        if(UrlName == -1){
            $scope.defaultTab = "new";
        }else{
            $scope.defaultTab = "all";
        }
    }

    $scope.products = [];

    $scope.shippingDetails = '';
    $scope.Packing = '';
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipDataTable = [];

    $scope.orderLevelAction = {};
    $scope.array = [];
    $scope.singleOrderTab = true;
    $scope.singleOrderMode = "add";
    $scope.bulkOrderTab = false;
    $scope.incrVar = false;
    $scope.decrVar = false;
    $scope.arrayHeaderList = [];
    $scope.arrayList = [];
    $scope.myList = [];
    $scope.bulkUploadSettingMode = "add";
    $scope.bulkUploadOrderFielsClicked = false;
    $scope.bulkUploadMapElemClicked = false;
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';
    $scope.baseBulkUploadSettingsUrl = baseUrl + '/omsservices/webapi/bulkuploadsettings?search=';
    $scope.downloadOrderTemplateUrl = downloadOrderTemplateUrl;
    $scope.csvTrue = false;
    $scope.baseSchedulePickUpUrl = baseUrl + "/omsservices/webapi/orders/schedulepickup";
    $scope.downloadOrderTemplateUrl = baseUrl + "/omsservices/webapi/orders/bulkuploadtemplate";
    $scope.salesChannelSelected = false;
    $scope.deliveryAddressSelected = false;
    $scope.orderNumberEntered = false;
    $scope.isProductSelected = false;
    $scope.isPriceEntered = false;
    $scope.isQuantityEntered = false;
   // $scope.singleorderData.submitted = false;

    $scope.sortType = "tableSaleOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.bulkSelectChannel = false;
    $scope.bulkSelectFile = false;

    $scope.otherReasonNotFiled = false;
    $scope.reasonData = null ;

    $scope.clearStartDate = function() {
        $scope.filter.startDate = "";
        $scope.filter.start1Date = null;
        if($scope.filter.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filter.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function() {
        $scope.filter.endDate = "";
        $scope.filter.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filter.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.filter.start1Date);
        }
    }

    $scope.openCustomerMode = function($event)
    {
        $('#addOrderDialog').modal('hide');
        $scope.orderTotalMode = "new";
        $scope.addCustomer($event);
    }


    //============================================= add customer ======================================== //
    $scope.cancelCustomerData = function()
    {
        $mdDialog.hide({
            templateUrl : 'addCustomerinSaleOrder.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
        $('#addOrderDialog').modal('show');
        $scope.customersData = null;
        $scope.genericData.shipAddrBillAddrSame = false;
        $scope.shippingAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddrClicked=false;
        $scope.genericData.billingStateData={};
        $scope.genericData.billingDistrictData={};


    };


    $scope.addCustomer = function(ev) {

        $scope.genericData.customerMode = "add";
        $scope.creationSourceData("Manual");
        $scope.customersData = {};
        $scope.customerAddress = {};
        $scope.shipAddrClicked = false;
        $scope.returnParamsClicked = false;
        $scope.genericData.returnType = "";
        $scope.showCustomerBox(ev);
    };
    $scope.showCustomerBox = function(ev) {
        $mdDialog.show({
            templateUrl: 'addCustomerinSaleOrder.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new(),
            escapeToClose: false
        })
    };
    $scope.getCustomerTypes = function () {
        $scope.customerTypes = [];
        var customersTypesUrl = baseUrl + "/omsservices/webapi/customertypes";
        $http.get(customersTypesUrl).success(function(data)
        {
            $scope.customerTypes = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    };
    $scope.returnTypes = [];

    $scope.returnTypes.push(
        {
            "returnTypeString" : 'valuebased',
            "returnTypeDisplayString" : '% Value'
        },
        {
            "returnTypeString" : 'quantitybased',
            "returnTypeDisplayString" : '% Quantity'
        }
    )
    $scope.billingAddrClickedRow = function(){
        $scope.billingAddrClicked = !$scope.billingAddrClicked;
    }
    $scope.shipAddrClickedRow = function() {
        $scope.shipAddrClicked = !$scope.shipAddrClicked;
    };
    $scope.returnParamsClickedRow = function() {
        $scope.returnParamsClicked = !$scope.returnParamsClicked;
    };

    $scope.callGetLatLong = function() {
        $scope.getLatitudeLongitude($scope.showResult).then(
            function(v) {},
            function(err) {}
        );
    };
    $scope.callGetLatLongForBilling = function() {
        $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
            function(v) {},
            function(err) {}
        );
    };

    $scope.creationSourceData = function(saleChannelType) {
        var q = $q.defer();
        $scope.creationSourceArray = [];
        var salesChannelUrl = baseUrl + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename;
        $http.get(salesChannelUrl).success(function(data) {
            if (saleChannelType == "Manual")
            {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                        $scope.creationSourceArray.push(data[i]);
                    }
                }
                q.resolve(true);
            }
            else
            {
                for (var i = 0; i < data.length; i++)
                {
                    $scope.creationSourceArray.push(data[i]);
                }
                q.resolve(true);
            }
        }).error(function(error, status) {
            q.resolve(false);
            console.log(error);
            console.log(status);
        });
        return q.promise;
    };
    $scope.checkCustomerCode = function(customercode)
    {
        var q = $q.defer();
        if(customercode != null && customercode != undefined && customercode != "")
        {
            if (customercode.length > 45)
            {
                growl.error("Customer code should be less than 45 characters");
                q.resolve(false);
            }
            else
            {
                var checkCustomerCodeUrl = baseUrl + "/omsservices/webapi/customers/checkcustomercode?customercode=" + customercode;
                $http.get(checkCustomerCodeUrl).success(function (data)
                {
                    if (data.status == false) {
                        growl.error(data.statusMessage);
                        q.resolve(false);
                    }
                    if (data.status == true)
                    {
                        q.resolve(true);
                    }
                });
            }
        }
        else{
            q.resolve(true);
        }
        return q.promise;
    };

    $scope.checkEmail = function(email)
    {
        var q = $q.defer();
        var checkEmailUrl = baseUrl + "/omsservices/webapi/customers/checkemail?email=" + email ;
        $http.get(checkEmailUrl).success(function(data)
        {
            if (data.status == false)
            {
                growl.error(data.statusMessage);
                q.resolve(false);
            }

            if (data.status == true)
            {
                q.resolve(true);
            }
        });
        return q.promise;
    }

    $scope.checkPhoneNo = function(phoneno)
    {
        var q = $q.defer();

        if (phoneno.length != 10)
        {
            growl.error('Please enter a 10 digit valid mobile no.');
            q.resolve(false);
        }
        else
        {

            var checkPhoneUrl = baseUrl + "/omsservices/webapi/customers/checkphonenumber?phone=" + phoneno ;
            $http.get(checkPhoneUrl).success(function(data)
            {
                if (data.status == false)
                {
                    growl.error(data.statusMessage);
                    q.resolve(false);
                }

                if (data.status == true)
                {
                    q.resolve(true);
                }
            });
        }

        return q.promise;
    };

    $scope.regionsStatesDistrictDataForBilling = function(stateData)
    {
        $scope.stateForBilling = stateData.tableStateLongName;
        $scope.getLatitudeLongitude($scope.showResult).then(
            function(v) {
                if (v || !v) {
                    console.log(v);
                    console.log(stateData);
                    $scope.stateIdForBilling = stateData.idtableStateId;
                    $scope.regionsStatesDistrictArrayForBilling = [];
                    var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                    $http.get(regionsStatesDistrictUrl).success(function(data) {
                        if (data != null)
                        {
                            $scope.regionsStatesDistrictArrayForBilling = data;
                            $scope.customerAddress.districtDataBilling = initializeDropdowns($scope.regionsStatesDistrictArrayForBilling, 'idtableDistrictId', stateData.idtableDistrictId);
                        }
                    }).error(function(error, status)
                    {
                        console.log(error);
                        console.log(status);

                    });
                }
            },
            function(err) {}
        );
    };
    //For Billing Address
    $scope.regionsStatesDistrictsCityDataForBilling = function(stateData, districtData) {
        if (districtData) {
            $scope.districtForBilling = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        $scope.regionsStatesDistrictsCityArrayForBilling = [];
                        $scope.districtIdForBilling = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data)
                        {
                            $scope.regionsStatesDistrictsCityArrayForBilling = data;
                            console.log($scope.regionsStatesDistrictsCityArrayForBilling);

                        }).error(function(error, status) {
                            console.log(error);
                        });
                    }
                },
                function(err) {}
            );
        }
    };
    $scope.validateCustomerData =  function (customersData)
    {

        if (!customersData.tableCustomerClientCustomerCode)
        {
        }
        else
        {
            if (customersData.tableCustomerClientCustomerCode.length > 45)
            {
                growl.error("Customer code should be less than 45 characters");
                return false;
            }
        }
        if (!customersData.tableSalesChannelValueInfo) {
            growl.error("Select sales channel");
            return false;
        }

        if(customersData.tableSalesChannelValueInfo.tableCustomerType)
        {
            if (customersData.tableSalesChannelValueInfo.tableCustomerType.tableCustomerTypeString != null && customersData.tableSalesChannelValueInfo.tableCustomerType.tableCustomerTypeString != undefined) {
                if (customersData.tableSalesChannelValueInfo.tableCustomerType.tableCustomerTypeString == "B2B" && !customersData.tableCustomerCompany) {
                    growl.error("Select company name");
                    return false;
                }
            }
        }
        else
        {
            if(customersData.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.tableCustomerType)
            {
                if(customersData.tableSalesChannelValueInfo.tableSalesChannelMetaInfo.tableCustomerType.tableCustomerTypeString == "B2B" && !customersData.tableCustomerCompany)
                {
                    growl.error("Select company name");
                    return false;
                }
            }
        }

        if (!customersData.tableCustomerFirstName)
        {
            growl.error("Contact person first name is mandatory");
            return false;
        }
        if (customersData.tableCustomerFirstName.length > 45)
        {
            growl.error("First name cannot be greater than 45 characters");
            return false;
        }
        if (customersData.tableCustomerLastName) {
            if (customersData.tableCustomerLastName.length > 45) {
                growl.error("Last name cannot be greater than 45 characters");
                return false;
            }
        }
        if (!customersData.tableCustomerEmail)
        {
            growl.error("Enter a valid email address");
            return false;
        }

        if (!customersData.tableCustomerPhone)
        {
            growl.error("Enter a valid 10-12 digit phone number!");
            return false;
        }
        else
        {
            if (customersData.tableCustomerPhone.length != 10)
            {
                growl.error('Please enter a 10 digit valid mobile no.');
                return false;
            }
        }
        if (customersData.tableCustomerPhone.length < 10 || customersData.tableCustomerPhone.length > 12)
        {
            growl.error("Enter a valid 10-12 digit phone number!");
            return false;
        }

        return true;

    }

    $scope.validateAddress = function (address,supportdata)
    {
        if (!address.tableAddressContactPerson1)
        {
            growl.error("Please enter the contact person name");
            return false;
        }
        if (!address.tableAddressEmail1)
        {
            growl.error("Please enter a valid email address");
            return false;
        }
        if (!address.tableAddressPhone1)
        {
            growl.error("Please enter a valid 10-12 digit Phone Number!");
            return false;
        }
        if (address.tableAddressPhone1.length < 10 || address.tableAddressPhone1.length > 12)
        {
            growl.error("Please enter a valid 10-12 digit Phone Number!");
            return false;
        }
        if (!address.tableAddress1)
        {
            growl.error("Please enter a valid Address");
            return false;
        }
        if (!supportdata.stateData)
        {
            growl.error("Please choose state from the available states!");
            return false;
        }
        if (!supportdata.districtData)
        {
            growl.error("Please choose district from the available districts!");
            return false;
        }
        if (!address.tableCity)
        {
            growl.error("Please choose city from the available cities!");
            return false;
        }
        if (!address.tableAddressPin)
        {
            growl.error("Please enter valid 6 digit postal code!");
            return false;
        }
        if (address.tableAddressPin.length != 6) {
            growl.error("Please enter valid 6 digit postal code!");
            return false;
        }
        return true;
    }

    $scope.validateAddressMin = function (address,supportdata, type)
    {

        if (!address.tableAddress1)
        {
            growl.error("Please enter a valid "+type+" Address");
            return false;
        }
        if (!supportdata.stateData)
        {
            growl.error("Please choose state from the available states!");
            return false;
        }
        if (!supportdata.districtData)
        {
            growl.error("Please choose district from the available districts!");
            return false;
        }
        if (!address.tableCity)
        {
            growl.error("Please choose city from the available cities!");
            return false;
        }
        if (!address.tableAddressPin)
        {
            growl.error("Please enter valid 6 digit postal code!");
            return false;
        }
        if (address.tableAddressPin.length != 6) {
            growl.error("Please enter valid 6 digit postal code!");
            return false;
        }
        return true;
    }
    $scope.addStateWiseVat = function(stateWiseVat,customerid)
    {
        var q = $q.defer();
        //Add state wise VAT/TIN if customer is B2B and VAT/TIN is provided
        if(stateWiseVat.tableCustomerStateWiseVatNo != null && stateWiseVat.tableCustomerStateWiseVatNo != undefined && stateWiseVat.tableCustomerStateWiseVatNo != '')
        {
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/customers/' + customerid + '/vats',
                data: stateWiseVat,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                q.resolve(true);
            }).error(function (error,status) {
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else{
                    growl.error("Failed to add vat");
                }
                q.resolve(false);
            });
        }
        else
        {
            q.resolve(true);
        }

        return q.promise;
    }
    // ADD Customer Data to backend OMS Customer API
    $scope.saveCustomerData = function(customersData, customerMode)
    {
        console.log(customersData);
        if($scope.validateCustomerData(customersData) == true)
        {
            console.log($scope.shippingAddress);
            if (customerMode == "add") {
                $scope.checkCustomerCode(customersData.tableCustomerClientCustomerCode).then(function (retval) {
                    if (retval == false) {
                        return false;
                    }
                    else {
                        $scope.checkEmail(customersData.tableCustomerEmail).then(function (retvalue) {
                            if (retvalue == false) {
                                return false;
                            }
                            else {
                                $scope.checkPhoneNo(customersData.tableCustomerPhone).then(function (retvalue) {
                                    if (retvalue == false) {
                                        return false;
                                    }
                                    else {
                                        if (customerMode == "add") {
                                            if ($scope.validateAddressMin($scope.shippingAddress, $scope.customerAddress, "Shipping") == false) {
                                                return false;
                                            }
                                            if ($scope.genericData.shipAddrBillAddrSame == undefined || $scope.genericData.shipAddrBillAddrSame == false) {
                                                if ($scope.validateAddressMin($scope.billingAddress, $scope.customerAddress, "Billing") == false) {
                                                    return false;
                                                }
                                            }
                                            else {
                                                $scope.billingAddress = $scope.shippingAddress;
                                            }
                                            $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
                                            $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

                                            var statewisevat = {};
                                            statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTin;
                                            statewisevat.tableState = $scope.customerAddress.stateData;

                                            $scope.saveCustomer(customersData, $scope.shippingAddress, $scope.billingAddress, statewisevat);

                                        }

                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    };
    $scope.saveCustomer = function(customersData,shippingAddress,billingAddress,stateWiseVat)
    {

        if(customersData.tableCustomerReturnValue != 'undefined' && customersData.tableCustomerReturnValue != null && (customersData.tableCustomerReturnValue > 100 || customersData.tableCustomerReturnValue < 0)){
            growl.error("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if(customersData.tableCustomerReturnQuantity != 'undefined' && customersData.tableCustomerReturnQuantity != null && (customersData.tableCustomerReturnQuantity > 100 || customersData.tableCustomerReturnQuantity < 0)){
            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }
        customersData.tableCustomerIsActive = true;
        customersData.tableCustomerIsBlacklisted = false;

        var postCustomerData = customersData;

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/customers',
            data: postCustomerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            growl.success("Customer added successfully");
            var postShippingAddressData = {};
            postShippingAddressData.tableAddress = shippingAddress;
            postShippingAddressData.tableAddress.tableAddressContactPerson1 = res.tableCustomerFullName;
            postShippingAddressData.tableAddress.tableAddressPhone1 = res.tableCustomerPhone;
            postShippingAddressData.tableAddress.tableAddressEmail1 = res.tableCustomerEmail;

            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/customers/' + res.idtableCustomerId + '/shippingaddress',
                data: postShippingAddressData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(shippingAddressResponse)
            {
                var postBillingAddressData = {};
                postBillingAddressData.tableAddress = billingAddress;
                postBillingAddressData.tableAddress.tableAddressContactPerson1 = res.tableCustomerFullName;
                postBillingAddressData.tableAddress.tableAddressPhone1 = res.tableCustomerPhone;
                postBillingAddressData.tableAddress.tableAddressEmail1 = res.tableCustomerEmail;
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/customers/' +  res.idtableCustomerId  + '/billingaddress',
                    data: postBillingAddressData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(billingAddressResponse)
                {
                    //Add state wise VAT/TIN if customer is B2B and VAT/TIN is provided
                    $scope.addStateWiseVat(stateWiseVat,res.idtableCustomerId).then(function(retval)
                    {
                        $scope.cancelCustomerData();
                    })
                    if (res != null) {
                        console.log(res);
                        $scope.isCustomerSelected = false;
                        $scope.singleorderData.customerObj = res;

                        $scope.deliveryAddressArray = [];
                        for (var i = 0; i < $scope.singleorderData.customerObj.tableCustomerShippingAddressLists.length; i++) {
                            $scope.deliveryAddressArray.push($scope.singleorderData.customerObj.tableCustomerShippingAddressLists[i].tableAddress);
                        }

                        $scope.billingAddressArray = [];
                        for (var i = 0; i < $scope.singleorderData.customerObj.tableCustomerBillingAddressLists.length; i++) {
                            $scope.billingAddressArray.push($scope.singleorderData.customerObj.tableCustomerBillingAddressLists[i].tableAddress);
                        }

                    } else {
                        $scope.isCustomerSelected = true;
                    }

                }).error(function(error,status)
                {
                    $scope.cancelCustomerData();
                    if(status == 400){
                        growl.error(error.errorMessage);
                    }
                    else{
                        growl.error("Failed to add customer billing address");
                    }
                });

            }).error(function(error,status)
            {
                $scope.cancelCustomerData();
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else{
                    growl.error("Failed to add customer shipping address");
                }

            });

        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to add new customer");
            }
        });
    };

    $scope.cancelBillingAddress = function()
    {
        $scope.customerAddress = {};
        $scope.billingAddress = {};
        $('#billingAddressModal').modal('hide');
    };

    //=============================================== ends here =================================== //

    

    $scope.onPageInitialize = function () {
        var customerId = $routeParams.customerId;
        if (customerId != null) {
            $scope.customerid = customerId;
            $http.get(baseUrl + '/omsservices/webapi/customers/' + customerId).success(function(data) {
                $scope.customerString = data.tableCustomerFirstName;
                if (data.tableCustomerLastName && data.tableCustomerLastName != null && data.tableCustomerLastName != null) {
                    $scope.customerString += " " + data.tableCustomerLastName;
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });
        }

        $scope.getCustomerTypes();
        $scope.listOfChannels();
        $scope.listOfPayments();
        $scope.dateFormatsBulkUpload();
        $scope.regionsStatesData();
        $scope.SelectVehicleType();
        $scope.LengthMeasureUnitDropDown();
        $scope.generateHeaders();


        if($cookies.get('orderid') != null){
            $scope.filter.orderid = $cookies.get('orderid');
            $cookies.remove('orderid')
        }

        if($rootScope.defaultTab != null)
        {
            $scope.defaultTab = $rootScope.defaultTab;
            $rootScope.defaultTab = null;

        }
        if($rootScope.saleOrderFilterObj != null)
        {
            $scope.filter = $rootScope.saleOrderFilterObj;
            $rootScope.saleOrderFilterObj = null;
        }

        $scope.listOfStatesCount($scope.defaultTab);
    }

    $scope.initDateLimits = function () {

        $scope.minDateSc = null;
        $scope.maxDateSc = new Date();

        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    }

    $scope.initDateLimits();



    $scope.onShippingDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.tableSaleOrderLatestDeliveryDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderData.tableSaleOrderLatestShippngDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.tableSaleOrderLatestShippngDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderData.tableSaleOrderLatestShippngDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.tableSaleOrderLatestShippngDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.tableSaleOrderLatestDeliveryDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }
    
    $scope.searchLocation = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    };

    $scope.showResult = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        $scope.searchLocation = {
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng()
        }
        console.log($scope.searchLocation);
    };
    $scope.getLatitudeLongitude = function(callback) 
    {
        var q = $q.defer();
        var address = "";
        if ($scope.customerAddress) 
	{
            if ($scope.customerAddress.adLine1) 
	    {
                address = address + $scope.customerAddress.adLine1;
            }
            if ($scope.customerAddress.adLine2) 
	    {
                if (address != "") 
		{
                    address = address + ", " + $scope.customerAddress.adLine2;
                } 
		else 
		{
                    address = $scope.customerAddress.adLine2;
                }
            }
            if ($scope.customerAddress.adLine3) 
	    {
                if (address != "") 
		{
                    address = address + ", " + $scope.customerAddress.adLine3;
                } 
		else 
		{
                    address = $scope.customerAddress.adLine3;
                }
            }
            if ($scope.cityVal && !$scope.customerAddress.pincode) 
	    {
                if (address != "") 
		{
                    address = address + ", " + $scope.cityVal;
                } 
		else 
		{
                    address = $scope.cityVal;
                }
            }
            if ($scope.district && (!$scope.cityVal && !$scope.customerAddress.pincode)) {
                if (address != "") 
		{
                    address = address + ", " + $scope.district;
                } 
		else 
		{
                    address = $scope.district;
                }
            }
            if ($scope.state && !$scope.customerAddress.pincode) 
	    {
                if (address != "") 
		{
                    address = address + ", " + $scope.state;
                } 
		else 
		{
                    address = $scope.state;
                }
            }
            if ($scope.customerAddress.pincode) 
	    {
                if (address != "") 
		{
                    address = address + ", " + $scope.customerAddress.pincode;
                } 
		else 
		{
                    address = $scope.customerAddress.pincode;
                }
            }
        }

        console.log(address);
        if (address != "") 
	{
            // Initialize the Geocoder
            geocoder = new google.maps.Geocoder();
            console.log(geocoder);
            if (geocoder) 
	    {
                geocoder.geocode(
		{
                    'address': address.toString()
                }, function(results, status) 
		{
                    console.log(status);
                    console.log(results);
                    if (status == google.maps.GeocoderStatus.OK) 
		    {
                        q.resolve(callback(results[0]));
                    } 
		    else 
		    {
                        q.resolve(callback(results[0]));
                        // growl.error("Exact location cannot be fetched from the entered address")
                    }
                });
            }
        }
        return q.promise;
    };


    //Number Validation not allowing -,+,e
    $scope.Num = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            '+': 43
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    $scope.cancelShippingAddress = function() {
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $('#orderShippingAddressModal').modal('hide');
    };

    //Regions Data from region generic API
    $scope.regionsStatesData = function() {
        $scope.regionsStatesArray = [];
        var regionsStatesUrl = baseUrl + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.regionsStatesArray.push(data[i]);
            }
            console.log($scope.regionsStatesArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //Regions Data from region states generic API
    $scope.regionsStatesDistrictData = function(stateData) {
        console.log(stateData);
        $scope.stateId = stateData.idtableStateId;
        $scope.regionsStatesDistrictArray = [];
        var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
        $http.get(regionsStatesDistrictUrl).success(function(data) {
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.regionsStatesDistrictArray.push(data[i]);
                    $scope.state = data[i].tableState.tableStateLongName;
                }
                console.log($scope.regionsStatesDistrictArray);
                $scope.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', stateData.idtableDistrictId);
                console.log($scope.districtData);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        console.log(districtData);
        $scope.regionsStatesDistrictsCityArray = [];
        $scope.districtId = districtData.idtableDistrictId;
        var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
        $http.get(regionsStatesDistrictsCityUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.regionsStatesDistrictsCityArray.push(data[i]);
                $scope.district = data[i].tableDistrict.tableDistrictLongName;
            }
            console.log($scope.regionsStatesDistrictsCityArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.changeCity = function(city) {
        var cityM = city;
        console.log(cityM);
        $scope.cityVal = cityM.tableCityLongName;
    };

    //saving shipping address data based on customer id
    $scope.saveShippingAddressData = function()
    {
        if($scope.validateAddress($scope.shippingAddress,$scope.customerAddress) == false)
        {
            return;
        }

        $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
        $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

        var statewisevat = {};
        statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTin;
        statewisevat.tableState = $scope.customerAddress.stateData;

        var postShippingAddressData = {};
        postShippingAddressData.tableAddress = $scope.shippingAddress;

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/shippingaddress',
            data: postShippingAddressData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.deliveryAddressArray.push(res.tableAddress);
            $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId).then(function(retval)
            {
                $scope.shipAddressMode = "add";
                $scope.customerAddress = {};
                growl.success("Shipping address added successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }

                $scope.cancelShippingAddress();
            })

        }).error(function(error,status) {
            console.log(error);
            $scope.cancelShippingAddress();
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to add shipping address");
            }
        });
    };

    //saving billing address data based on customer id
    $scope.saveBillingAddressData = function()
    {
        if($scope.validateAddress($scope.billingAddress,$scope.customerAddress) == false)
        {
            return;
        }

        var postBillingAddressData = {};
        postBillingAddressData.tableAddress = $scope.billingAddress;

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress',
            data: postBillingAddressData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.billingAddressArray.push(res.tableAddress);

            $scope.cancelBillingAddress();

        }).error(function(error,status) {
            console.log(error);
            $scope.cancelBillingAddress();
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to add billing address");
            }
        });

    };

    $scope.getTinNo = function(customerId, stateData) {
        console.log(customerId);
        console.log(stateData.idtableStateId);
        var getTinurl = baseUrl + "/omsservices/webapi/customers/" + customerId + "/vats/checkvat/" + stateData.idtableStateId;
        $http.get(getTinurl).success(function(data1) {
            console.log(data1);
            if (data1 != null || data1 != undefined || data1 != "") {
                $scope.tinMode = "put"
                $scope.tinArray = data1;
                $scope.tinVatId = data1.idtableCustomerStateWiseVatId;
            }
            if (data1 == null || data1 == undefined || data1 == "") {
                $scope.tinMode = "post";
                $scope.tinArray = data1;
            }
        }).error(function(error) {
            console.log(error);
        });
    };

    $scope.validateEmail = function(emailCase) {
        if (emailCase == false) {
            growl.error("Please Enter Valid Email Id");
            document.myForm.custEmail.focus();
        }
    };

    $scope.uploadBulkOrderMapFile = function() {
        file = $scope.bulkOrderMapFile;
        if (file) {
            if (!file.$error) {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = $scope.loadHandler;
            }
        }
    };

    $scope.loadHandler = function(event) {
        $scope.contents = event.target.result;
        var data = {
            csv: null,
            separator: ','
        };
        // Get the contents of the reader
        var contents = $scope.contents;

        // Set our contents to our data model
        data.csv = contents;

        var results = $scope.convertToJSON(data);
        $scope.createHeaderList(results);
    };

    $scope.convertToJSON = function(content) {

        // Declare our variables
        var lines = content.csv.replace(/[\r]/g, '').split('\n'),
            headers = lines[0].split(content.separator),
            results = [];

        // For each row
        for (var i = 1; i < lines.length - 1; i++) {

            // Declare an object
            var obj = {};

            // Get our current line
            var line = lines[i].split(new RegExp(content.separator + '(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));

            // For each header
            for (var j = 0; j < headers.length; j++) {

                // Populate our object
                obj[headers[j]] = line[j];
            }

            // Push our object to our result array
            results.push(obj);
        }

        // Return our array
        return results;
    };

    $scope.ViewDownloadBtn = 'success';
    $scope.downloadLink = function(value) {
        console.log(value);
        $scope.ViewDownloadBtn = value;
    }

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        file = bulkOrderUploadfile;
        console.log(file);

        if (!bulkOrderSettingData) {
            $scope.bulkSelectChannel = true;
            growl.error("Please choose channel from available channels!");
        }

        else if (!file) {
            $scope.bulkOrderSettingData = bulkOrderSettingData;
            $scope.bulkSelectFile = true;
            growl.error("Please select the file in proper format!");
        }
        else {
            growl.info("Upload is being processed in the background");
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);
                var uploadUrl = baseUrl + '/omsservices/webapi/saleschannels/' + bulkOrderSettingData.channelId + '/uploadbulkorders';

                var fd = new FormData();
                fd.append('uploadFile', file);
                console.log(uploadUrl);
                console.log('uploadFile' + file);
                console.log('fd' + fd);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function(resp) {
                    // file is uploaded successfully
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    //$scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $cookies.put('BulkUploadData','order');
                    $cookies.put('ActiveTab','Orders');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    $scope.closebulkOrderUploadCsv("success");
                }, function(resp) {                   
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
    };

    // fetching count details of states of different orders.
    $scope.listOfStatesCount = function(tabsValue, page, action) {
        console.log(tabsValue);
        console.log(page);

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;
        $scope.deliveredCount = 0;
        $scope.draftCount = 0;

        var countURL = baseUrl + "/omsservices/webapi/orders/filtercount?";

        countURL += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel)
        {
            countURL += "&salesChannel=0";
        }
        else
        {
            countURL += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId)
        {
            countURL += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            countURL += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            countURL += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate)
        {
            countURL += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            countURL += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            countURL += "&refid=" + $scope.filter.refid;
        }

        var newCountUrl = countURL + "&state=new";
        var processCountUrl = countURL + "&state=process";
        var holdCountUrl = countURL + "&state=hold";
        var returnCountUrl = countURL + "&state=return";
        var cancelledCountUrl = countURL + "&state=cancelled";
        var shippingCountUrl = countURL + "&state=shipping";
        var deliveredCountUrl = countURL + "&state=delivered";
        var draftCountUrl = countURL + "&state=draft";
        var allCountUrl = countURL;

        $http.get(allCountUrl).success(function(data) {
            if (data != null) {
                $scope.allCount = data;
                if (tabsValue == 'all') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;

                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });

        $http.get(newCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.newCount = data;
                if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }


                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });


        $http.get(processCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.processCount = data;
                if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });

        $http.get(holdCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.holdCount = data;
                if (tabsValue == 'hold') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                       setPage(page);
                    }
                }
            }
        });

        $http.get(returnCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.returnCount = data;
                if (tabsValue == 'return') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.returnCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });

        $http.get(cancelledCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.cancelledCount = data;
                if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });
        $http.get(shippingCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.shippingCount = data;
                if (tabsValue == 'shipping') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.shippingCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                       setPage(page);
                    }
                }
            }
        });
        $http.get(deliveredCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.deliveredCount = data;
                if (tabsValue == 'delivered') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.deliveredCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });
        $http.get(draftCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.draftCount = data;
                if (tabsValue == 'draft') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.draftCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }
        });
    }


    // getting all list of orders (all the orders)
    $scope.listOfOrders = function(tabsValue, start, action) {
        if (tabsValue == 'draft') {
            $scope.DeleteAndConfimData = true;
            $scope.reEdit = false;
        } else {
            $scope.DeleteAndConfimData = false;
            $scope.reEdit = true;
        }
        console.log(tabsValue);
        console.log(start);

        if (tabsValue == 'all') {
            $scope.tabsColor = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }
        if (tabsValue == 'new') {
            $scope.tabsColor1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }
        if (tabsValue == 'process') {
            $scope.tabsColor2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }

        if (tabsValue == 'shipping') {
            $scope.tabsColor3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }
        if (tabsValue == 'return') {
            $scope.tabsColor4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }

        if (tabsValue == 'hold') {
            $scope.tabsColor5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }
        if (tabsValue == 'cancelled') {
            $scope.tabsColor6 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor7 = {};
        }
        if (tabsValue == 'delivered') {
            $scope.tabsColor7 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            };
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
        }
        if (tabsValue == 'draft') {
            $scope.tabsColor8 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
        }

        $scope.defaultTab = tabsValue;

        var orderListUrl = baseUrl + "/omsservices/webapi/orders";

        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        orderListUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            orderListUrl += "&salesChannel=0";
        } else {
            orderListUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            orderListUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            orderListUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            orderListUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            orderListUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            orderListUrl += "&refid=" + $scope.filter.refid;
        }
        console.log("ORDER LIST URL");
        console.log(orderListUrl);
        $http.get(orderListUrl).success(function(data) {
            // console.log(data);
            $scope.orderLists = data;
            //$scope.showOrderLevelAction(data);

            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {

            console.log(status);

        });
    };

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tableSaleOrderSkuses.length ; j += 1){
            var ordersku = orderdata.tableSaleOrderSkuses[j];
            if(ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 1 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 2
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 4 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 7
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9
                || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 10 || ordersku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 33){
                return false;
            }
        }
        return true;
    }


    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = baseUrl + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename;
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function(data) {
            console.log(data);
            $scope.channelLists = data;

            for (var i = 0; i < $scope.channelLists.length; i++) {
                if ($scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                    $scope.channelNamesData.push($scope.channelLists[i]);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfPayments = function() {
        $scope.paymentNamesData = [];
        var paymentListUrl = baseUrl + "/omsservices/webapi/saleorderpaymenttypes";
        // console.log(paymentListUrl);
        $http.get(paymentListUrl).success(function(data) {
            // console.log(data);
            $scope.paymentLists = data;

            for (var i = 0; i < $scope.paymentLists.length; i++) {
                $scope.paymentNamesData.push($scope.paymentLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    $scope.searchSaleOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function()
    {
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.exportFile = true;

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        $scope.listOfStatesCount($scope.defaultTab, 1);
    };

    //clear filter for clearing applied filters
    $scope.clearAction = function(saleChannelId, skuId, startDate, endDate, customerid,orderid) {
        $scope.sortType = "tableSaleOrderSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.filter = {};
        $scope.skuId = null;
        $scope.customerid = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
    }

    $scope.searchedProductForFilter = function(selected) {
        if (selected != undefined && selected != null) {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }
        else{
            $scope.skuId = undefined;
        }
    };

    $scope.searchedCustomer = function(selected) {
        if (selected != null && selected != undefined) {
            $scope.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.customerid = undefined;
        }
    }

    $scope.getTotal = function(tableSkuData) {
        var total = 0;
        for (var i = 0; i < tableSkuData.tableSaleOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tableSaleOrderSkusChargeses[i].tableSaleOrderSkusChargesValue;
            total += product;
        }
        return total;
    }

    $scope.exportOrderDataFile = function(){
        $mdDialog.show({
            templateUrl: 'exportFile.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    };

    $scope.downloadInvoices = function(){
        var orderListUrl = baseUrl + "/omsservices/webapi/saleinvoice/Invoices?";

        orderListUrl += "&state=" + 'shipping';

        orderListUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            orderListUrl += "&salesChannel=0";
        } else {
            orderListUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            orderListUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            orderListUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            orderListUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            orderListUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            orderListUrl += "&refid=" + $scope.filter.refid;
        }





        $http({
            method: 'GET',
            url: orderListUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data, status) {
                console.log(data);
                if(status == '204'){
                    growl.error("Invoices are not available for current filter values.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Invoices.xls";
                    document.body.appendChild(a);
                    a.click();
                };

        }).error(function(error,status){
            if(status == 400){
                growl.error(data.errorMessage);
            }
            else{
                growl.error("Order Export request failed");
            }

        });
    }

    $scope.DownloadOrderFileExport = function()
    {
        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        var exportUrl = baseUrl+'/omsservices/webapi/orders/export?';

        orderListUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            exportUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            exportUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            exportUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            exportUrl += "&refid=" + $scope.filter.refid;
        }
        $http.get(exportUrl).success(function(response, status) {
            console.log(response);
            $cookies.put('DownloadExportData','orders');
            console.log($cookies.get('DownloadExportData'));
            $cookies.put('ActiveTab','Orders');

            if(status == 204){
                growl.error("No Records Available.");
            }else{
                $rootScope.growlmessage = growl.success("Order Export requested successfully.<br><a href='#/export' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",{ttl: -1});
            }

            $mdDialog.hide({
                templateUrl: 'exportFile.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }).error(function(error,status){
            if(status == 400){
                growl.error(data.errorMessage);
            }
            else{
                growl.error("Order Export request failed");
            }

        });
    };
    $scope.DownloadOrderItemFileExport = function()
    {

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        var exportUrl = baseUrl+'/omsservices/webapi/orders/orderitem/export?';

        exportUrl += "&uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.filter.startDate) {
            exportUrl += "&startDate=" + $scope.filter.startDate;
        }
        if ($scope.filter.endDate) {
            exportUrl += "&endDate=" + $scope.filter.endDate;
        }
        if ($scope.filter.orderid) {
            exportUrl += "&orderid=" + $scope.filter.orderid;
        }
        if ($scope.filter.refid) {
            exportUrl += "&refid=" + $scope.filter.refid;
        }
        $http.get(exportUrl).success(function(response, status) {
            $cookies.put('DownloadExportData','orderitems');
            $cookies.put('ActiveTab','orderitems');
            if(status == 204){
                growl.error("No Records Available.");
            }else{
                $rootScope.growlmessage = growl.success("Order Export requested successfully.<br><a href='#/export' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",{ttl: -1});
            }

            $mdDialog.hide({
                templateUrl: 'exportFile.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else{
                growl.error("Order Item request failed");
            }
        });
    };

    $scope.totalCostPerProduct = function(tableSkuData) {
        // console.log(tableSkuData.tableSaleOrderSkusChargeses.length);
        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tableSaleOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tableSaleOrderSkusChargeses[i].tableSaleOrderSkusChargesValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tableSaleOrderSkusSkuQuantity;

        return totalCost;
    }

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableSaleOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        // console.log(allSkus);
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            for (var j = 0; j < allSkus[i].tableSaleOrderSkusChargeses.length; j++) {
                var product = allSkus[i].tableSaleOrderSkusChargeses[j].tableSaleOrderSkusChargesValue;
                total += product;
            }
            totalCostAmount += total * allSkus[i].tableSaleOrderSkusSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
    }

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };


    $scope.selectTableRow = function(index, storeId) {
        $scope.skuWarehouses = [];
        $scope.orderLists[index].tableSaleOrderSkuses.forEach(function(value,key){
            $scope.getAllocatedWarehouse($scope.orderLists[index], value,key);
        });

        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }
        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.dayDataCollapse[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

    //=============================== Print packing Lables ================================== //
    //== will be view after wharehouse allocated and wharehouse informed, wh_picked.. id= 8 , 9 , 11

    $scope.printPreview = function(response){
        $http.get(commonPathUrl+response.previewLink
            ,{responseType: 'arraybuffer'}
        ).success(function(data) {
                $mdDialog.show({
                    templateUrl: 'printLabels.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    scope: $scope.$new()
                });
                console.log(data);
                var file = new Blob([(data)], {
                    type: 'application/pdf'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
            }).error(function(error){
                console.log(error);
            });
    };

    $scope.printpackingLabel = function(value){
        console.log(value);
       $scope.previewTemp = baseUrl+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/packingslip';
        console.log($scope.previewTemp);
        $http.get($scope.previewTemp).success(function(response) {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else{
                growl.error("Failed to download packing slip");
            }
        });
    };


    //====================================== ends here ============================== //


    //===================================== get packing and shipping numbers ========================== //

    $scope.orderValueID = "";
    $scope.getPackingAndShippingNumbers = function(value,screen){
        console.log(value);
        $scope.orderValueID = value.idtableSaleOrderId;
        var packingNshipping = baseUrl+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/shipmentnumbers';
        $http.get(packingNshipping).success(function(response) {
            //$scope.printPreview(response);
            console.log(response);
            //var fakeValue = [
            //
            //    {
            //        "shipmentNumber":"abccc",
            //        "creationDate":"02-12-2016 12:30 AM"
            //    },
            //    {
            //        "shipmentNumber":"abcdc",
            //        "creationDate":"02-12-2016 12:31 AM"
            //    },
            //    {
            //        "shipmentNumber":"abcde",
            //        "creationDate":"02-12-2016 12:32 AM"
            //    },
            //    {
            //        "shipmentNumber":"abcdef",
            //        "creationDate":"02-12-2016 12:33 AM"
            //    }
            //];
            $scope.shippingNumberList = response;
            if(screen == 'packing'){
                $mdDialog.show({
                    templateUrl: 'packingNumber.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    scope: $scope.$new()
                });
            }else{
                $mdDialog.show({
                    templateUrl: 'shippingNumber.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    scope: $scope.$new()
                });
            }

        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Getting old shipment details failed");
            }
        });
    };

    $scope.DownloadShippingNumberLabel = function(value){
        console.log(value);
        var downloadShippingNumberLabel = baseUrl+'/omsservices/webapi/orders/'+$scope.orderValueID+'/shippinglabel?shipmentno='+value.shipmentNumber;
        $http.get(downloadShippingNumberLabel).success(function(response) {
            console.log(response);
            $scope.printPreview(response);
        }).error(function(error,status){
           console.log(error);
           if(status == 400){
               growl.error(error.errorMessage);
           }else{
               growl.error("Failed to download shipping label");
           }
        });
    };

    $scope.DownloadPackingNumberLabel = function(value){
        console.log(value);
        var downloadPackingNumberLabel = baseUrl+'/omsservices/webapi/orders/'+$scope.orderValueID+'/packingslip?shipmentno='+value.shipmentNumber;
        $http.get(downloadPackingNumberLabel).success(function(response) {
            console.log(response);
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else{
                growl.error("Failed to download packing slip");
            }
        });
    };

    $scope.cancelshippingNumberDialog = function(){
      $mdDialog.hide();
    };

    //=============================== Print shipping Lables ================================== //

    //== will be view after wharehouse allocated and wharehouse informed, wh_picked.. id= 8 , 9 , 11

    $scope.printshippingLabel = function(value,SkuValue){
        console.log(value);
        $scope.previewTemp = baseUrl+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/shippinglabel';
        $http.get($scope.previewTemp).success(function(response) {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to download shipping label");
            }
        });
    };


    //====================================== ends here ============================== //


    //=============================== Print invoice slip Lables ================================== //

    //== will be view after packed and shipping allocated.. id= 13 , 14 , 15
    function showInvoiceError(error) {
        alert = $mdDialog.alert({
            title: 'Attention',
            textContent: error +'. Please go to the tax section and add tax rules.',
            ok: 'Close'
        });

        $mdDialog
            .show( alert )
            .finally(function() {
                alert = undefined;
            });
    }


    $scope.printinvoiceLabel = function(value){
        console.log(value);
        $scope.previewTemp = baseUrl+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/invoiceslip';
       $http.get($scope.previewTemp).success(function(response) {
           $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                //growl.error(error.errorMessage);
                showInvoiceError(error.errorMessage)
            }
            else{
                growl.error("Failed to download invoice");
            }
        });
    };


    //====================================== ends here ============================== //



    //=============================== Print manifest Lables ================================== //

    //== will be view after packed and shipping allocated.. id= 13 , 14 , 15

    $scope.printmanifestLabel = function(value,SkuValue){
        console.log(value);
        console.log(SkuValue);
        $scope.previewTemp = baseUrl+'/omsservices/webapi/orders/'+value.idtableSaleOrderId+'/skus/'+SkuValue.idtableSaleOrderSkusId+'/manifestslip';
        $http.get($scope.previewTemp).success(function(response) {
            $scope.printPreview(response);
        }).error(function(error,status){
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to download manifest file");
            }
        });

    };


    //====================================== ends here ============================== //



    $scope.addDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = true;
    };

    $scope.chooseDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = false;
    };

    $scope.customerObj = function(selected) {
        var q = $q.defer();
        if (selected != null)
        {
            $scope.isCustomerSelected = false;
            $scope.singleorderData.customerObj = selected.originalObject;

            $scope.deliveryAddresses(selected.originalObject.idtableCustomerId).then(
                function(v)
                {
                    $scope.billingAddresses(selected.originalObject.idtableCustomerId);
                    q.resolve(true);
                },
                function(err) {
                    q.reject(false);
                }
            );
        }
        else
        {
            $scope.isCustomerSelected = true;
        }
        return q.promise;
    }


    $scope.productObject = function(selected)
    {
        if (selected != null) {
            console.log(selected);
            $scope.isProductSelected = false;
            $scope.singleorderData.productObject = selected.originalObject;
            if ($scope.filter.saleChannel != undefined) {
                $scope.getPriceOfProduct(selected.originalObject.idtableSkuId, $scope.filter.saleChannel.idtableSalesChannelValueInfoId);
            }
        } else {
            $scope.isProductSelected = true;
        }
    }

    $scope.customerChanged = function(str) {
        console.log(str);
        if (str == '') {
            $scope.custName = null;
            $scope.deliveryAddressArray = null;
        }
    }


    $scope.showAddOrderModal = function(ev) {

        $scope.singleorderData = {};
        $scope.singleorderData.billingAddressSameAsShipping = false;
        $scope.bulkUploadTabShow = true;
        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.orderNumberEntered = false;

        $scope.initDateLimits();

        $('#addOrderDialog').modal('show');
        
    };

    $scope.toggleDeliveryAddressSubmittedValue = function() {
    	if ($scope.singleorderData.deliveryAddressName) {
            $scope.deliveryAddressSelected = false;
        } else {
            $scope.deliveryAddressSelected = true;
        }
    };

    $scope.toggleBillingAddressSubmittedValue = function() {
        if ($scope.singleorderData.billingAddress) {
            $scope.billingAddressSelected = false;
        } else {
            $scope.billingAddressSelected = true;
        }
    };

    $scope.togglePaymentTypeSubmittedValue = function(paymentType) {
        if (paymentType) {
            $scope.paymentTypeSelected = false;
        } else {
            $scope.paymentTypeSelected = true;
        }
    };

    $scope.saveSingleOrder = function() {

        console.log($scope.singleorderData);
        $scope.checkOrderNumber($scope.singleorderData.orderNo).then(
            function(v) {
                if (v) {
                    if ($scope.singleorderData.channelObject == undefined || $scope.singleorderData.channelObject == null) {
                        $scope.salesChannelSelected = true;
                        growl.error("Please choose a sales channel!");
                        return;
                    } else if ($scope.products.length < 1) {
                        growl.error("Please add at least one Product!");
                        $scope.isProductSelected = true;
                        return;
                    } else if (!$scope.singleorderData.customerObj) {
                        $scope.isCustomerSelected = true;
                        growl.error("Please choose a Customer!");
                        return;
                    } else if ($scope.singleorderData.deliveryAddressName == undefined || $scope.singleorderData.deliveryAddressName == null) {
                        $scope.deliveryAddressSelected = true;
                        growl.error("Please choose a delivery address!");
                        return;
                    }
                    if($scope.singleorderData.billingAddressSameAsShipping == true)
                    {
                        $scope.singleorderData.billingAddress = $scope.singleorderData.deliveryAddressName;
                    }
                    else
                    {
                        if($scope.singleorderData.billingAddress == undefined || $scope.singleorderData.billingAddress == null)
                        {
                            growl.error("Please choose a billing address!");
                            return;
                        }
                    }

                    if (!$scope.singleorderData.paymentObject) {
                        $scope.paymentTypeSelected = true;
                        growl.error("Please choose a payment type!");
                        return;
                    }else if(!$scope.singleorderData.tableSaleOrderScDateTime){
                         growl.error("Please enter sales channel date");
                         return;
                    }

                    else {
                        var shipmentDate = null;
                        var deliveryDate = null;
                        if($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined)
                        {
                            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
                        }
                        if($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined){
                            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
                        }

                        var postData = {
                            "idtableSaleOrderId": 1,
                            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
                            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
                            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
                            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
                            "tableCustomer": $scope.singleorderData.customerObj,
                            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
                            "tableSaleOrderSkuses": $scope.products,
                            "tableSaleOrderRemarks":$scope.singleorderData.tableSaleOrderRemarks,
                            "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
                            "tableSaleOrderLatestDeliveryDate":deliveryDate,
                            "tableSaleOrderLatestShippngDate": shipmentDate
                        }
                        console.log(postData);
                        $http({
                            method: 'POST',
                            url: baseUrl + '/omsservices/webapi/orders',
                            data: postData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(res) {
                            console.log(res);
                            if (res) {
                                $scope.singleOrderMsg = 'Submitted successfully';
                                $scope.orderNo = '';
                                $scope.product = '';
                                $scope.deliveryAddress = '';
                                $scope.customer = '';
                                $scope.popupChannel = '';
                                $scope.payment = '';
                                $scope.singleorderData = null;
                                postData = null;
                                $scope.products = [];
                                // $scope.listOfOrders($scope.defaultTab, 0);
                                $scope.cancelSingleOrder();
                                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                                if ($scope.singleOrderMode == "add") {
                                    growl.success("Order Added Successfully");
                                } else if ($scope.singleOrderMode == "copy") {
                                    growl.success("Order Copied Successfully");
                                }

                            }
                        }).error(function(error, status) {
                            console.log(error);
                            if(status == 400){
                                growl.error(error.errorMessage);
                            }
                            else{
                                growl.error("Order Cant be Added");
                            }
                        });
                    }
                }
            },
            function(err) {

            }
        );
    };

    $scope.updateSingleOrder = function() {
        console.log($scope.singleorderData);
        if ($scope.singleorderData.channelObject == undefined || $scope.singleorderData.channelObject == null) {
            $scope.salesChannelSelected = true;
            growl.error("Please choose a sales channel!");
            return;
        } else if ($scope.singleorderData.deliveryAddressName == undefined || $scope.singleorderData.deliveryAddressName == null) {
            $scope.deliveryAddressSelected = true;
            growl.error("Please choose a delivery address!");
            return;
        }
        else
        {
            if($scope.singleorderData.billingAddress == undefined || $scope.singleorderData.billingAddress == null)
            {
                growl.error("Please choose a billing address!");
                return;
            }
        }
        if ($scope.products.length < 1) {
			growl.error("Please add atleast one Product!");
			$scope.isProductSelected = true;
			return;
		} else if (!$scope.singleorderData.customerObj) {
			$scope.isCustomerSelected = true;
			growl.error("Please choose a Customer!");
			return;
		} else if (!$scope.singleorderData.paymentObject) {
			$scope.paymentTypeSelected = true;
			growl.error("Please choose a payment type!");
			return;
		}else if(!$scope.singleorderData.tableSaleOrderScDateTime){
			 growl.error("Please enter sales channel date");
			 return;
		}else {
            $('#confirmEditOrder').modal('show');
        }
    };

    $scope.updateSingleOrderConfirmed = function() {
		var shipmentDate = null;
		var deliveryDate = null;
		if($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined){
			shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
		}
		if($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined){
			deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
		}
        var postData = {
            "idtableSaleOrderId": $scope.updateOrderId,
            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
            "tableCustomer": $scope.singleorderData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
			"tableSaleOrderRemarks":$scope.singleorderData.tableSaleOrderRemarks,
			"tableSaleOrderScDateTime":moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
			"tableSaleOrderLatestDeliveryDate":deliveryDate,
			"tableSaleOrderLatestShippngDate": shipmentDate
        }
        console.log(postData);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/orders/' + $scope.updateOrderId + '/update',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.singleOrderMsg = 'Submitted successfully';
                $scope.orderNo = '';
                $scope.product = '';
                $scope.deliveryAddress = '';
                $scope.customer = '';
                $scope.popupChannel = '';
                $scope.payment = '';
                $scope.singleorderData = null;
                postData = null;
                $scope.products = [];
                // $scope.listOfOrders($scope.defaultTab, 0);
                $scope.cancelSingleOrder();
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                growl.success("Order Updated Successfully");

            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Order Cant be Added");
            }

        });
    };

    //cancel single order
    $scope.cancelSingleOrder = function() {
        $scope.$broadcast("angucomplete-alt:clearInput", "customers");
        $scope.disableQuickShipBox = [];
        $scope.editQuickShipBoxHideAndShow = [];
        $scope.singleorderData = {};
        $scope.singleorderData.billingAddressSameAsShipping = false;
        $scope.OrderMode = "";
        $scope.products = [];
        $scope.deliveryAddressArray = [];
        $scope.billingAddressArray = [];
        $scope.custName = null;
        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.billingAddressSelected = false;
        $scope.orderNumberEntered = false;
        $scope.isProductSelected = false;
        $scope.isCustomerSelected = false;
        $scope.isPriceEntered = false;
        $scope.isQuantityEntered = false;
        $scope.singleOrderMode = "add";
        $scope.customerid = null;

        $('#addOrderDialog').modal('hide');
        $('#confirmEditOrder').modal('hide');
    };

    $scope.deliveryAddresses = function(customerId) {
        var q = $q.defer();

        $scope.deliveryAddressArray = [];
        var deliveryAddressUrl = baseUrl + '/omsservices/webapi/customers/' + customerId + '/shippingaddress';
        $http.get(deliveryAddressUrl).success(function(data) {
            console.log(data);
            $scope.deliveryAddArray = data;
            $scope.deliveryAddressArray = [];
            for (var i = 0; i < $scope.deliveryAddArray.length; i++) {
                $scope.deliveryAddressArray.push($scope.deliveryAddArray[i].tableAddress);
            }
            console.log($scope.deliveryAddressArray);
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    }

    $scope.billingAddresses = function(customerId) {
        var q = $q.defer();

        $scope.billingAddressArray = [];
        var billingAddressUrl = baseUrl + '/omsservices/webapi/customers/' + customerId + '/billingaddress';
        $http.get(billingAddressUrl).success(function(data) {
            console.log(data);
            $scope.billingAddArray = data;
            $scope.billingAddressArray = [];
            for (var i = 0; i < $scope.billingAddArray.length; i++) {
                $scope.billingAddressArray.push($scope.billingAddArray[i].tableAddress);
            }
            console.log($scope.billingAddressArray);
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    }


    $scope.createHeaderList = function(headers) {
        console.log(headers);
        $scope.notApplicableCounter = 1;
        $scope.arrayHeaderList = [];
        console.log(headers[0]);
        var a = headers[0];

        angular.forEach(headers[0], function(value, key) {
            console.log(key);
            $scope.arrayHeaderList.push(key);
            $scope.list1 = $scope.arrayHeaderList;
        });

        if($scope.arrayHeaderList.length < $scope.arrayList.length )
        {
            var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;

            for(var counter = 1; counter <= extra;counter++ ) {
                $scope.arrayHeaderList.push('Not Applicable' + counter);
                $scope.list1 = $scope.arrayHeaderList;
            }
            $scope.notApplicableCounter = counter;
        }
    }

    $scope.generateHeaders = function() {
        $scope.arrayList = [];
        var omsColUrl = baseUrl + '/omsservices/webapi/bulkuploadomscol';

        $http.get(omsColUrl).success(function(data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                $scope.arrayList.push(data[i].tableSalesChannelBulkUploadOmsColString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }
    $scope.changeIndex = function(index) {
        console.log(index);
    }

    $scope.stateTrials = function(saleordskus) {
        console.log(saleordskus);
        console.log(saleordskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            console.log(i);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tableSaleOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };

    $scope.priceEntered = function(price) {
        if (price) {
            $scope.isPriceEntered = false;
        } else {
            $scope.isPriceEntered = true;
        }
		
		var str = price.toString().replace(',', "").split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
    }
	
	$scope.singleorderData.priceProd = str.join('.');	
    };

    



    //=======================================================================================//
    //======================================   Draft Order      ========================================//
    //=======================================================================================//

    //================== DeleteDraft order ==================== //


    $scope.getAllocatedWarehouse = function (order, sku,key) {

        var orderId = order.idtableSaleOrderId;
        var skuId = sku.idtableSaleOrderSkusId;

        var url = baseUrl + "/omsservices/webapi/orders/" + orderId + "/skus/" + skuId;

        var allocatedwarehouse = "Not Available";

        $http({
            method: 'GET',
            url: url
        }).success(function (res) {
            console.log(res);
            if (res) {
                allocatedwarehouse = res.tableWarehouseDetailsLongname;
                $scope.skuWarehouses[key] = allocatedwarehouse;
            }
            else{
                $scope.skuWarehouses[key] = "Not Available";
            }
        }).error(function (error, status) {
            allocatedwarehouse = "Not Available Right Now";
        });

        //return allocatedwarehouse;
    }

    $scope.Drafted = function (value) { //...... Creating Draft ..
        console.log(value);
        $scope.checkOrderNumber($scope.singleorderData.orderNo, value).then(
            function (v) {
                if (v) {
                    if ($scope.singleorderData.channelObject == undefined || $scope.singleorderData.channelObject == null) {
                        $scope.salesChannelSelected = true;
                        growl.error("Please choose a sales channel!");
                        return;
                    } else if ($scope.products.length < 1) {
                        growl.error("Please add atleast one Product!");
                        $scope.isProductSelected = true;
                        return;
                    } else if (!$scope.singleorderData.customerObj) {
                        $scope.isCustomerSelected = true;
                        growl.error("Please choose a Customer!");
                        return;
                    } else if ($scope.singleorderData.deliveryAddressName == undefined || $scope.singleorderData.deliveryAddressName  == null) {
                        $scope.deliveryAddressSelected = true;
                        growl.error("Please choose a delivery address!");
                        return;
                    }
                    else
                    {
                        if($scope.singleorderData.billingAddress == undefined || $scope.singleorderData.billingAddress == null)
                        {
                            growl.error("Please choose a billing address!");
                            return;
                        }
                    }

                    if (!$scope.singleorderData.paymentObject) {
                        $scope.paymentTypeSelected = true;
                        growl.error("Please choose a payment type!");
                        return;
                    } else if (!$scope.singleorderData.tableSaleOrderScDateTime) {
                        growl.error("Please enter sales channel date");
                        return;
                    } else {
                        var shipmentDate = null;
                        var deliveryDate = null;
                        if ($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined) {
                            shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
                        }
                        if ($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined)
                        {
                            deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
                        }
                        var OrderPost = {
                            "idtableSaleOrderId": 1,
                            "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
                            "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
                            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
                            "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
                            "tableCustomer": $scope.singleorderData.customerObj,
                            "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
                            "tableSaleOrderSkuses": $scope.products,
                            "tableSaleOrderRemarks": $scope.singleorderData.tableSaleOrderRemarks,
                            "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
                            "tableSaleOrderLatestDeliveryDate": deliveryDate,
                            "tableSaleOrderLatestShippngDate": shipmentDate
                        };

                        console.log(OrderPost);
                        var PostDataUrl,requestMethod;
                        if (value == 'EditDraft')
                        {
                            PostDataUrl = baseUrl + '/omsservices/webapi/orders/' + $scope.DraftOrderID.OrderedId + '/editdraft';
                            requestMethod = 'PUT';

                        }
                        else
                        {
                            PostDataUrl = baseUrl + '/omsservices/webapi/orders/draft';
                            requestMethod = 'POST';
                        }
                        $http({
                            method: requestMethod,
                            url: PostDataUrl,
                            data: OrderPost,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function (res) {
                            console.log(res);
                            if (res) {
                                $scope.cancelSingleOrder();
                                postData = null;
                                $scope.listOfStatesCount($scope.defaultTab);
                                if(value == 'EditDraft')
                                {
                                    growl.success("Draft updated successfully");
                                }
                                else
                                {
                                    growl.success("Draft created successfully");
                                }

                                $('#addOrderDialog').modal('hide');

                                console.log($scope.products);
                            }
                        }).error(function (error, status) {
                            console.log(error);
                            console.log(status);

                            if (status == 400) {
                                $scope.showBackEndStatusMessage(error);
                                return;
                            }
                            else{
                                growl.error("Failed to edit draft");
                            }

                        });
                    }
                }
            });
    };

    $scope.showBackEndStatusMessage = function(errorMessage){ // Show Backend Error Messages.....
        growl.error(errorMessage.errorMessage);
    }




    $scope.SendDraft = function(){
        if ($scope.singleorderData.orderNo == undefined || $scope.singleorderData.orderNo == null) {
            $scope.orderNumberEntered = true;
            growl.error("Please enter an Order Number!");
            return;
        }
        else
        {
                $scope.checkOrderNumber($scope.singleorderData.orderNo).then(
                    function (v) {
                        if (v) {
                            if ($scope.singleorderData.channelObject == undefined || $scope.singleorderData.channelObject == null) {
                                $scope.salesChannelSelected = true;
                                growl.error("Please choose a sales channel!");
                                return;
                            } else if ($scope.products.length < 1) {
                                growl.error("Please add atleast one Product!");
                                $scope.isProductSelected = true;
                                return;
                            } else if (!$scope.singleorderData.customerObj) {
                                $scope.isCustomerSelected = true;
                                growl.error("Please choose a Customer!");
                                return;
                            } else if ($scope.singleorderData.deliveryAddressName == undefined || $scope.singleorderData.deliveryAddressName == null) {
                                $scope.deliveryAddressSelected = true;
                                growl.error("Please choose a delivery address!");
                                return;
                            }
                            else
                            {
                                if($scope.singleorderData.billingAddress == undefined || $scope.singleorderData.billingAddress == null)
                                {
                                    growl.error("Please choose a billing address!");
                                    return;
                                }
                            }

                            if (!$scope.singleorderData.paymentObject) {
                                $scope.paymentTypeSelected = true;
                                growl.error("Please choose a payment type!");
                                return;
                            } else if (!$scope.singleorderData.tableSaleOrderScDateTime) {
                                growl.error("Please enter sales channel date");
                                return;
                            } else {
                                var shipmentDate = null;
                                var deliveryDate = null;
                                if ($scope.singleorderData.tableSaleOrderLatestShippngDate != null && $scope.singleorderData.tableSaleOrderLatestShippngDate != undefined) {
                                    shipmentDate = moment.utc($scope.singleorderData.tableSaleOrderLatestShippngDate).format();
                                }
                                if ($scope.singleorderData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderData.tableSaleOrderLatestDeliveryDate != undefined) {
                                    deliveryDate = moment.utc($scope.singleorderData.tableSaleOrderLatestDeliveryDate).format();
                                }
                                var OrderPost = {
                                    "idtableSaleOrderId": 1,
                                    "tableSaleOrderClientOrderNo": $scope.singleorderData.orderNo,
                                    "tableSalesChannelValueInfo": $scope.singleorderData.channelObject,
                                    "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderData.deliveryAddressName,
                                    "tableAddressByTableSaleOrderBillToAddressId" : $scope.singleorderData.billingAddress,
                                    "tableCustomer": $scope.singleorderData.customerObj,
                                    "tableSaleOrderPaymentType": $scope.singleorderData.paymentObject,
                                    "tableSaleOrderSkuses": $scope.products,
                                    "tableSaleOrderRemarks": $scope.singleorderData.tableSaleOrderRemarks,
                                    "tableSaleOrderScDateTime": moment.utc($scope.singleorderData.tableSaleOrderScDateTime).format(),
                                    "tableSaleOrderLatestDeliveryDate": deliveryDate,
                                    "tableSaleOrderLatestShippngDate": shipmentDate
                                };

                                console.log(OrderPost);
                                var PostDataUrl;
                                    PostDataUrl = baseUrl + '/omsservices/webapi/orders/'+$scope.DraftOrderID.OrderedId+'/confirmdraft';

                                $http({
                                    method: 'POST',
                                    url: PostDataUrl,
                                    data: OrderPost,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }).success(function (res) {
                                    console.log(res);
                                    if (res) {
                                        $scope.cancelSingleOrder();
                                        postData = null;
                                        $scope.listOfStatesCount($scope.defaultTab);
                                        growl.success("Order Added Successfully");

                                        $('#addOrderDialog').modal('hide');
                                        console.log($scope.products);
                                    }
                                }).error(function (error, status) {
                                    console.log(error);
                                    console.log(status);

                                    if (status == 400) {
                                        $scope.showBackEndStatusMessage(error);
                                        return;
                                    }
                                    growl.error("Order Cant be Added");
                                });
                            }
                        }
                    });

        }
    }

    $scope.DeleteDraft = function(data){  //..... Deleting Drafted Order
        console.log(data);

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/orders/' + data.idtableSaleOrderId + '/deletedraft'
        }).success(function (data) {
            console.log(data);
            growl.success('Draft Order deleted successfully.');
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function (data) {
            console.log(data);
        });
    };




    //=======================================================================================//
    //======================================   Ends Here    ========================================//
    //=======================================================================================//


    // adding the product in table one by one
    $scope.addProduct = function( tableSaleOrderSkusSkuQuantity, id, price) {

        if($scope.singleorderData.productObject) {
            if ($scope.singleorderData.productObject.tableSkuStatusType.idtableSkuStatusTypeId == 2 ||$scope.singleorderData.productObject.tableSkuStatusType.idtableSkuStatusTypeId == 3)
            {
                growl.error("Selected product is either inactive or in deleted state!");
                $scope.isProductSelected = true;
                $scope.singleorderData.productObject = null;
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                return;
            }
        }
        if (!$scope.singleorderData.productObject) {
            growl.error("Please select a Product first!");
            $scope.isProductSelected = true;
            return;
        } else if (!price) {
            growl.error("Please enter the Product's Price!");
            $scope.isPriceEntered = true;
            return;
        } else if (price < 1) {
            growl.error("Please enter a valid Product's Price!");
            $scope.isPriceEntered = true;
            return;
        } else if (!tableSaleOrderSkusSkuQuantity) {
            growl.error("Please enter the Product's Quantity!");
            $scope.isQuantityEntered = true;
            return;
        } else if (tableSaleOrderSkusSkuQuantity < 1) {
            growl.error("Please enter a valid Product's Quantity!");
            $scope.isQuantityEntered = true;
            return;
        } else {
            console.log(tableSaleOrderSkusSkuQuantity);
            tableSku = $scope.singleorderData.productObject;

            var tempObject = {
                tableSku: $scope.singleorderData.productObject,
                tableSaleOrderSkusSkuQuantity: tableSaleOrderSkusSkuQuantity,
                tableSaleOrderSkusChargeses: [{
                    "tableSaleOrderSkusChargesValue": price,
                    "tableSaleOrderSkuChargesType": {
                        "idtableSaleOrderSkuChargesTypeId": 1,
                        "tableSaleOrderSkuChargesTypeString": "Item Price"
                    }
                }]
            };

            var dirty = false;

            for (var i = 0; i < $scope.products.length; i++) {
                if ($scope.products[i].tableSku.idtableSkuId == tableSku.idtableSkuId) {
                    dirty = true;
                }
            }


            if (dirty) {
                growl.error("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                $scope.isProductSelected = true;
                return;
            } else {
                $scope.products.push(tempObject);
                console.log($scope.products);
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                tableSku = null;
                tableSaleOrderSkusSkuQuantity = null;
                $scope.singleorderData.productObj = null;
                $scope.singleorderData.quantityNo = null;
                $scope.singleorderData.priceProd = null;
                $scope.isProductSelected = false;
                $scope.isPriceEntered = false;
                $scope.isQuantityEntered = false;
                $scope.singleorderData.productObject = undefined;
            }
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.products.splice(index, 1);
    };
    //load the warehouses from backenf for select warehouse in timeline feature.
    $scope.loadWareHouses = function(orderId, tableSaleOrderId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        var wareHousesUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/warehouses';
        $http.get(wareHousesUrl).success(function(data)
        {
            $scope.wareHousesArray = [];
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesArray.push(data[i]);
                console.log($scope.wareHousesArray);
                q.resolve(true);
            }
        }).error(function(error, status) {
            q.resolve(false);
            console.log(error);
            $scope.warehouseError = error;
            $('#helpWRModal').modal('show');
            console.log(status);

        });
        return q.promise;
    }

    $scope.clearHelpDialog = function(){
        $('#helpWRModal').modal('hide');
    }

    //load the return warehouses from backend for select return warehouse in timeline feature.
    $scope.loadReturnWareHouses = function(orderId, tableSaleOrderId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        orderId = 1;
        tableSaleOrderId = 1;
        console.log("Hello");
        $scope.returnwareHousesArray = [];
        var returnwareHousesUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/returnwarehouses';
        $http.get(returnwareHousesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.returnwareHousesArray.push(data[i]);
            }
            q.resolve(true);
            console.log($scope.returnwareHousesArray);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    }

    //load the shipping carriers from backend in timeline feature.
    $scope.loadShippingCarriers = function(orderId, tableSaleOrderId, tableSkuData, saleChannelId) {
        var q = $q.defer();
        console.log(orderId);
        console.log(tableSaleOrderId);
        if (saleChannelId != 1) {
            $scope.shippingCarrierArray = [];
            var shippingCarrierUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.get(shippingCarrierUrl).success(function(data) {
                console.log(data);
                $scope.shippingCarrierArray = data.availableShippingServices;
                console.log($scope.shippingCarrierArray);
                q.resolve(true);
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                q.reject(false);

            });
            return q.promise;
        }

        if (saleChannelId == 1) {
            $scope.shippingCarrierArray = [];
            var shippingCarrierUrl = baseUrl + '/omsservices/webapi/orders/schedulepickup/' + orderId + '/' + tableSaleOrderId;
            $http({
                method: 'GET',
                url: shippingCarrierUrl,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            }).success(function(res) {
                console.log(res);
                $scope.redirectToFileUploadUrl = function() {
                    $window.open('https://www.google.com', '_blank');
                };
                $scope.redirectToFileUploadUrl();
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

                $scope.redirectToFileUploadUrl = function() {
                    $window.open('https://www.google.com', '_blank');
                };
                $scope.redirectToFileUploadUrl();
            });
        }
    }

    $scope.redirectToFileUploadUrl = function() {
        $window.open('https://sellercentral.amazon.in/gp/transactions/uploadSchedulePickup.html', '_blank');
    };
    // $scope.redirectToFileUploadUrl();

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = baseUrl + '/omsservices/webapi/saleordercancelreasons';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.list1 = $scope.arrayHeaderList;
    $scope.list = [];

    $scope.sortableOptions = {
        // placeholder: "app",
        // connectWith: ".apps-container",
        cursor: "move",
        update: function(e, ui) {
            fromIndex = ui.item.sortable.index;
            toIndex = ui.item.sortable.dropindex;
            console.log(fromIndex);
            console.log(toIndex);
            var a = $scope.arrayHeaderList;
            $scope.arrayHeaderList = arraymove(a, fromIndex, toIndex);
        }
    };

    $scope.ansortableOptions = {
        placeholder: "app",
        connectWith: ".apps-container"
    };

    $scope.deleteFunc = function(index) {
        console.log(index);
        $scope.arrayHeaderList.splice(index, 1);
        if($scope.arrayList.length > $scope.arrayHeaderList.length )
        {
            $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
            $scope.notApplicableCounter = $scope.notApplicableCounter + 1;
        }
    }

    function arraymove(arr, fromIndex, toIndex) {
        if (fromIndex <= arr.length && toIndex <= arr.length) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
            console.log(arr);
            return arr;
        } else {
            console.log("No Choice");
            return arr;
        }
    }

    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
    //action after selecting warehouse in the timeline feature(active state)
    $scope.selectWareHouseAction = function(orderId, tableSaleOrderId, wareHouseObject) {
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(wareHouseObject);
        if (wareHouseObject == undefined) {
            growl.error("Warehouse Cannot Be Allocated");
            return;
        }
        if (wareHouseObject != undefined) {
            var wareHousesUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/warehouse';
            $http.put(wareHousesUrl, wareHouseObject).success(function(data) {
                console.log(data);
                if (data) {
                    growl.success("Warehouse Allocated Successfully");
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else{
                    growl.error("Warehouse Cannot Be Allocated");
                }
            });
            $mdDialog.hide();
        }
    }

    //action after selecting shipping carrier in the timeline feature(active state)
    $scope.selectShippingCarrierAction = function(orderId, tableSaleOrderId, shippingObject) {
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(shippingObject);
        if (shippingObject == undefined) {
            growl.error("Shipping Carrier cannot be allocated");
            return;
        }
        if (shippingObject != undefined) {
            var shippingAllocateUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.put(shippingAllocateUrl, shippingObject).success(function(data) {
                console.log(data);
                if (data) {
                    growl.success("Shipping Carrier Allocated Successfully");
                    // $scope.listOfOrders($scope.defaultTab, 0);
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    for (var i = 0; i < $scope.orderLists.length; i += 1) {
                        $scope.dayDataCollapse[i] = false;
                    }
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else{
                    growl.error("Shipping Carrier cannot be allocated");
                }
            });
            $mdDialog.hide();
        }
    }

    $scope.LoadNewRason = {};

    //action after cancel warehouse in the timeline feature(active state)
    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks,otherReasonRemarks) {
        if (!remarks)
        {
            growl.error("Please select a reason for cancellation");
            return;
        }
        else
        {
            console.log(orderId);
            console.log(tableSaleOrderId);
            console.log(remarks);
            console.log(otherReasonRemarks)
                if (remarks != undefined && remarks=='other') {
                    if(!otherReasonRemarks)
                    {
                        $scope.otherReasonNotFiled = true;
                        growl.error("Please enter the reason!")
                        return;
                    }
                    else if(otherReasonRemarks.length>128)
                    {
                        $scope.otherReasonNotFiled = true;
                        growl.error("Entered Reason should be less than or equal to 128 characters.")
                        return;
                    }
                    else
                    {
                        if(remarks == 'other'){
                            //var UserRemarks = otherReasonRemarks;
                            if($scope.LoadNewRason.ReasonCheckBox == true){
                                console.log($scope.LoadNewRason.reasonData);
                                var postDataReason;
                                postDataReason = {
                                    "tableSaleOrderCancelReasonString": $scope.LoadNewRason.reasonData
                                };
                                $http({
                                    method: 'POST',
                                    url: baseUrl + '/omsservices/webapi/saleordercancelreasons',
                                    data: postDataReason,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }).success(function(data)
                                {
                                    console.log(data);
                                    $scope.loadCancelReasons();
                                    growl.success('Cancel reason added successfully');
                                }).error(function(data){
                                    console.log(data);
                                });
                            }
                        }
                        var cancelUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
                        $http.put(cancelUrl).success(function(data) {
                            console.log(data);
                            $mdDialog.hide();
                            if (data) {
                                growl.success("Order Cancelled Successfully");
                            // $scope.listOfOrders($scope.defaultTab, 0);
                            $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                                $scope.dayDataCollapse[i] = false;
                            }
                        }
                    }).error(function(error, status) {
                        console.log(error);
                        console.log(status);
                        if(status == 400){
                            growl.error(error.errorMessage);
                        }

                        else{
                            growl.error("Order Cannot Be Cancelled");
                        }
                    });
                }
            }
            if (remarks != undefined && remarks!='other') {
                var cancelUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
                $http.put(cancelUrl).success(function(data) {
                    console.log(data);
                    $mdDialog.hide();
                    if (data) {
                        growl.success("Order Cancelled Successfully");
                        // $scope.listOfOrders($scope.defaultTab, 0);
                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        for (var i = 0; i < $scope.orderLists.length; i += 1) {
                            $scope.dayDataCollapse[i] = false;
                        }
                    }
                }).error(function(error, status) {
                    console.log(error);
                    console.log(status);
                    if(status == 400){
                        growl.error(error.errorMessage);
                    }
                    else{
                        growl.error("Order Cannot Be Cancelled");
                    }
                });
            }
        }
    }


    //Bulk Upload Functionality Starts

    //getting date formats from bulk uploads settings backend
    $scope.dateFormatsBulkUpload = function() {
            $scope.dateFormatsArray = [];
            var dateFormatsUrl = baseUrl + '/omsservices/webapi/dateformat';
            $http.get(dateFormatsUrl).success(function(data) {
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                    $scope.dateFormatsArray.push(data[i].tableSalesChannelDateFormatString);
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });
        }
        //getting date format ends here

    //saving bulk upload settings
    $scope.bulkUploadsSettingSave = function() {
        var mappingCols = [];
        console.log($scope.bulkOrderSettingData);
        console.log($scope.arrayHeaderList.length);
        for (var i = 0; i < $scope.arrayHeaderList.length; i++) {
            mappingCols.push({
                tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
            });
        }
        console.log(mappingCols);
        var postData = {
            "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
            "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
            "tableSalesChannelBulkUploadMapCols": mappingCols
        }


        console.log(postData);
        var channelId = $scope.bulkOrderSettingData.channelId;
        delete $scope.bulkOrderSettingData.channelId;

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/bulkuploadsettings',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                growl.success("Bulk Order Map Setting Added Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Bulk Order Map Setting Cannot Be Added");
            }

        });
    }

    //editing bulk upload settings
    $scope.bulkUploadsSettingEdit = function() {
        console.log($scope.bulkUploadSettingId);
        var mappingCols = [];
        console.log($scope.bulkOrderSettingData);
        console.log($scope.arrayHeaderList.length);
        for (var i = 0; i < $scope.arrayHeaderList.length; i++) {
            mappingCols.push({
                tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
            });
        }
        console.log(mappingCols);
        var putData = {
            "idtableSalesChannelBulkUploadSettingsId": $scope.bulkUploadSettingId,
            "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
            "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
            "tableSalesChannelBulkUploadMapCols": mappingCols
        }


        console.log(putData);

        $http({
            method: 'PUT',
            // url : baseUrl+'/omsservices/webapi/saleschannels/'+channelId+'/bulkuploadsetting',
            url: baseUrl + '/omsservices/webapi/bulkuploadsettings/' + $scope.bulkUploadSettingId,
            data: putData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                growl.success("Bulk Order Map Setting Edited Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Bulk Order Map Setting Cannot Be Edited");
            }
        });
    }


    $scope.AddBulkOrderMapFormValidationMsg = function(BulkChanelId,Dateformat,mappingName){
        if(BulkChanelId == null || BulkChanelId == undefined)
        {
            growl.error('Sales Channel Name is a mandatory');
            return false;
        }
        if(mappingName == null || mappingName == undefined)
        {
            growl.error('Mapping Name is Required');
            return false;
        }
        if(Dateformat == null || Dateformat == undefined || Dateformat == "")
        {
            growl.error('Date Format is Required');
            return false;
        }
        return true;


    }


    //saving bulk upload settings channel wise
    $scope.savebulkUploadSettingChannelWise = function(bulkOrderchannelId) {
        console.log($scope.arrayHeaderList);
        console.log($scope.bulkOrderchannelId);
        console.log($scope.dateFormat);
        console.log($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName);

        var channelId = bulkOrderchannelId;
        // delete $scope.bulkOrderSettingData.channelId;
        var mappingCols = [];
        // console.log($scope.bulkOrderSettingData);
        console.log(channelId);
        if($scope.AddBulkOrderMapFormValidationMsg($scope.bulkOrderchannelId,$scope.dateFormat,$scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName) == false){
            return;
        }

            $http.get(baseUrl + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {
                // console.log(data);

                // console.log($scope.arrayHeaderList.length);
                for (var i = 0; i < $scope.arrayHeaderList.length; i++) {

                    if ($scope.arrayHeaderList[i].indexOf("Not Applicable") >= 0)
                    {
                        $scope.arrayHeaderList[i] = null;
                        continue;
                    }
                    mappingCols.push({
                        tableSalesChannelBulkUploadMapOmsCol: $scope.arrayList[i],
                        tableSalesChannelBulkUploadMapScCol: $scope.arrayHeaderList[i]
                    });
                }
                // console.log(mappingCols);
                var putData = {
                    "idtableSalesChannelBulkUploadSettingsId": $scope.bulkUploadSettingId,
                    "tableSalesChannelBulkUploadSettingsName": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName,
                    "tableSalesChannelBulkUploadSettingsDateFormat": $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat,
                    "tableSalesChannelBulkUploadMapCols": mappingCols
                }


                // console.log(putData);
                if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName != null) {
                    data.tableSalesChannelBulkUploadSettings = putData;
                }
                if ($scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName == null) {
                    data.tableSalesChannelBulkUploadSettings = null;
                }
                console.log(data);
                $http({
                    method: 'PUT',
                    url: baseUrl + '/omsservices/webapi/saleschannels/' + channelId,
                    // url : baseUrl+ '/omsservices/webapi/bulkuploadsettings',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    console.log(res);
                    $scope.arrayList = [];
                    $scope.bulkOrderMapFile = null;
                    $scope.arrayHeaderList = [];
                    $scope.bulkOrderSettingData = null;
                    $scope.dateFormat = null;
                    $scope.bulkOrderchannelId = null;
                    $scope.bulkOrderSettingData = "";
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
                    $scope.bulkUploadMapElemClicked = false;
                    $scope.arrayHeaderList = [];
                    $scope.dateFormat = "";

                    $('#myModal2').modal('hide');
                    growl.success("Bulk upload mapping saved Successfully");
                }).error(function(error, status) {
                    console.log(error);
                    console.log(status);
                    if(status == 400){
                        growl.error(error.errorMessage);
                    }
                    else{
                        growl.error("Error in saving bulk upload mapping !!");
                    }
                    $scope.arrayHeaderList = [];
                    $scope.bulkOrderSettingData = null;
                    $scope.dateFormat = null;
                    $scope.bulkOrderchannelId = null;
                    $scope.bulkOrderSettingData = "";
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
                    $scope.bulkUploadMapElemClicked = false;
                    $scope.arrayHeaderList = [];
                    $scope.dateFormat = "";

                });
            });


    };

    //singleOrder Tab Mode
    $scope.singleOrderTabMode = function() {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkOrderTabMode = function() {
        $scope.singleOrderTab = false;
        $scope.bulkOrderTab = true;
    }

    $('#addOrderDialog').on('show.bs.modal' , function (e)
    {
        $( "#ordertabs a:first"  ).tab('show');
    });

    $scope.uploadFile = function() {
        console.log($scope.bulkOrderSettingData.channelId);
        var file = $scope.myFile;
        console.log('file is ');
        console.dir(file);
        var uploadUrl = baseUrl + '/omsservices/webapi/saleschannels/' + $scope.bulkOrderSettingData.channelId + '/uploadbulkorders';
        // fileUpload1.uploadFileToUrl(file,uploadUrl);

        var fd = new FormData();
        fd.append('uploadFile', file);
        console.log(uploadUrl);
        console.log('uploadFile' + file);
        console.log('fd' + fd);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                // $scope.listOfOrders($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                growl.success("Bulk Order Uploaded successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.bulkOrderSettingData = "";
            angular.element("input[type='file']").val(null);
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Error in Uploading Bulk Order");
            }
        });
    }

    //dialog box to open warehouse selection dialog box
    $scope.openWareHouseBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.loadWareHouses(orderId, tableSaleOrderId).then(
            function(v) {
                if(v){
                    $scope.orderNo = orderNo;
                    console.log($scope.wareHousesArray);
                    if($scope.wareHousesArray.length!=0){
                        $mdDialog.show({
                            templateUrl: 'dialog1.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: false,
                            scope: $scope.$new()
                        })
                    }
                }
            });
    }

    $scope.onvalue = function(radio) {
        // console.log(radio);
        $scope.wareHouseObject = JSON.parse(radio);
    }

    //dialog box to open shipping selection dialog box
    $scope.openShippingCarrierBox = function(ev, orderId, tableSaleOrderId, tableSkuData, orderNo, saleChannelId) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        console.log(tableSkuData);
        $scope.loadShippingCarriers(orderId, tableSaleOrderId, tableSkuData, saleChannelId).then(function(v){
            if(v){
                $scope.orderNo = orderNo;
                if (saleChannelId != 1) {
                    $mdDialog.show({
                        templateUrl: 'dialog2.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        scope: $scope.$new()
                    })
                }
            }
        })
    }

    $scope.cancelWarehouseSelection = function() {
        $scope.genericData.splitCost = false;
        $scope.genericData.quantity = null;
        $mdDialog.hide();
    }

    $scope.onvalue1 = function(radio1) {
        console.log(radio1);
        $scope.shippingObject = JSON.parse(radio1);
        console.log($scope.shippingObject);
    }

    //dialog box to open cancel order dialog box
    $scope.cancelSaleOrderBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $mdDialog.show({
                templateUrl: 'dialog3.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }

    //info box to show full state trials for the order
    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableSaleOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableSaleOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleOrderSkuStateType.tableSaleOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableSaleOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $mdDialog.show({
                templateUrl: 'infoDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }

    $scope.cancelInfoBox = function() {
            $mdDialog.hide();
        }
        //testing 123
    $scope.testObj = function(selected) {
        if (selected != undefined || selected != null) {
            $scope.bulkUploadSettingMode = "edit";
            console.log(selected);
            console.log(selected.originalObject.tableSalesChannelBulkUploadMapCols);
            var uploadMapcols = selected.originalObject.tableSalesChannelBulkUploadMapCols;
            $scope.dateFormat = selected.originalObject.tableSalesChannelBulkUploadSettingsDateFormat;
            $scope.bulkUploadSettingId = selected.originalObject.idtableSalesChannelBulkUploadSettingsId;
            $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = selected.originalObject.tableSalesChannelBulkUploadSettingsName;
            console.log($scope.dateFormat);
            $scope.notApplicableCounter = 1;
            for (var i = 0; i < $scope.arrayList.length; i++) {
                var found = false;
                for(var j=0; j< uploadMapcols.length; j++) {
                    if(arrayList[i] === uploadMapcols[j].tableSalesChannelBulkUploadMapOmsCol) {
                        $scope.arrayHeaderList.push(uploadMapcols[j].tableSalesChannelBulkUploadMapScCol);
                        $scope.list1 = $scope.arrayHeaderList;
                        found = true;
                        break;
                    }
                }
                if(found == false)
                {
                    $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
                    $scope.list1 = $scope.arrayHeaderList;
                    $scope.notApplicableCounter++ ;
                }
            }

            if($scope.arrayHeaderList.length < $scope.arrayList.length )
            {
                var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;
                for(var counter = 1; counter <= extra;counter++ ) {
                    $scope.arrayHeaderList.push('Not Applicable' + counter);
                    $scope.list1 = $scope.arrayHeaderList;
                }
                $scope.notApplicableCounter = counter;
            }
        }
    };

    $scope.inputChanged = function(str) {
        $scope.console10 = str;
        console.log($scope.console10);
        $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = $scope.console10;
        console.log($scope.bulkOrderSettingData);
        if ($scope.console10.length < 4) {
            $scope.bulkOrderSettingData = "";
            $scope.dateFormat = "";
            $scope.arrayHeaderList = [];
            $scope.list1 = $scope.arrayHeaderList;
            $scope.bulkUploadSettingMode = "add";
        }
    }

    //getting price of Product
    $scope.getPriceOfProduct = function(skuId, saleChannelId) {
        $http({
            method: 'GET',
            url: baseUrl + '/omsservices/webapi/skus/' + skuId + '/saleschannel/' + saleChannelId + '/price',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $scope.singleorderData.priceProd = res;
        }).error(function(error, status) {
            $scope.singleorderData.priceProd = 0;
            console.log(status);

        });
    }

    $scope.getChannelId = function()
    {
        if (!$scope.singleorderData.channelObject) {
            $scope.salesChannelSelected = true;
        }
        else
        {
            console.log($scope.singleorderData.productObject);
            if ($scope.singleorderData.productObject != undefined && $scope.singleorderData.channelObject != undefined) {
                $scope.getPriceOfProduct($scope.singleorderData.productObject.idtableSkuId, $scope.singleorderData.channelObject.idtableSalesChannelValueInfoId);
            }
            $scope.salesChannelSelected = false;
        }
    };

    //opening and closing bulk upload order fields accordian
    $scope.selectinvRow = function() {
        console.log($scope.bulkUploadOrderFielsClicked);
        if ($scope.bulkUploadOrderFielsClicked == false) {
            $scope.bulkUploadOrderFielsClicked = true;
        }

    }

    $scope.selectotherRow = function() {
        if ($scope.bulkUploadOrderFielsClicked == true) {
            $scope.bulkUploadOrderFielsClicked = false;
        }
    }

    //opening and closing bulk upload map elem fields accordian
    $scope.selectmapElemRow = function() {
        console.log($scope.bulkUploadMapElemClicked);
        if ($scope.bulkUploadMapElemClicked == false) {
            $scope.bulkUploadMapElemClicked = true;
        }

    }

    $scope.selectothermapElemRow = function() {
        if ($scope.bulkUploadMapElemClicked == true) {
            $scope.bulkUploadMapElemClicked = false;
        }
    }

    $scope.checkbulkMappingSettingsAvailable = function(channelId) {
        console.log(channelId);
        $http.get(baseUrl + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {
            console.log(data.tableSalesChannelBulkUploadSettings);
            if (data.tableSalesChannelBulkUploadSettings == null) {
                $scope.csvTrue = false;
            }
            if (data.tableSalesChannelBulkUploadSettings != null && data.tableSalesChannelBulkUploadSettings.tableSalesChannelBulkUploadMapCols.length > 0) {
                $scope.csvTrue = true;
            }
        });
    };

    $scope.setMappingName = function(channelId) {
        $scope.arrayList = [];
        $scope.arrayHeaderList = [];

        $scope.generateHeaders();



        console.log(channelId);
        $http.get(baseUrl + "/omsservices/webapi/saleschannels/" + channelId).success(function(data) {

            var settings = data.tableSalesChannelBulkUploadSettings;
            if(settings != null)
            {
                var mapCols = settings.tableSalesChannelBulkUploadMapCols;
                if (mapCols != null && mapCols.length > 0) {
                    console.log(data.tableSalesChannelBulkUploadSettings);
                    $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = settings.tableSalesChannelBulkUploadSettingsName;
                    $scope.bulkUploadSettingId = settings.idtableSalesChannelBulkUploadSettingsId;
                    $scope.dateFormat = settings.tableSalesChannelBulkUploadSettingsDateFormat;
                    $scope.notApplicableCounter = 1;
                    for (var i = 0; i < $scope.arrayList.length; i++)
                    {
                        var found = false;
                        for(var j=0; j< mapCols.length; j++)
                        {
                            if($scope.arrayList[i] === mapCols[j].tableSalesChannelBulkUploadMapOmsCol)
                            {
                                $scope.arrayHeaderList.push(mapCols[j].tableSalesChannelBulkUploadMapScCol);
                                $scope.list1 = $scope.arrayHeaderList;
                                found = true;
                                break;
                            }
                        }
                        if(found == false)
                        {
                            $scope.arrayHeaderList.push('Not Applicable' + $scope.notApplicableCounter);
                            $scope.list1 = $scope.arrayHeaderList;
                            $scope.notApplicableCounter++ ;
                        }
                    }

                    if ($scope.arrayHeaderList.length < $scope.arrayList.length) {
                        var extra = $scope.arrayList.length - $scope.arrayHeaderList.length;
                        for(var counter = 1; counter <= extra;counter++ ) {
                            $scope.arrayHeaderList.push('Not Applicable' + counter);
                            $scope.list1 = $scope.arrayHeaderList;
                        }
                        $scope.notApplicableCounter = counter;
                    }
                }
            }
            else
            {
                $scope.arrayHeaderList = [];
                $scope.notApplicableCounter = 1;
                $scope.dateFormat = null;
            }
        });
    };

    function setFocus() {
        document.getElementById("settingName").focus();
    }

    function setBlur() {
        document.getElementById("settingName").blur();
    }
    $scope.closebulkOrderUploadCsv = function() {
        $scope.csvTrue = false;
        $scope.bulkSelectChannel = false;
        $scope.bulkSelectFile = false;
        $mdDialog.hide();

    }

    $scope.closebulkOrderMapSettings = function() {
        $scope.bulkOrderMapFile = null;
        $scope.bulkOrderchannelId = null;
        $scope.bulkOrderSettingData = "";
        $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsDateFormat = "";
        $scope.bulkOrderSettingData.tableSalesChannelBulkUploadSettingsName = "";
        $scope.arrayHeaderList = [];
        $scope.arrayList = [];
        $scope.dateFormat = "";
        $scope.bulkUploadMapElemClicked = false;
        $scope.notApplicableCounter = 1;

    }

    //Number Validation not allowing -,+,e
    $scope.Num = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            '.': 46
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    //Number Validation not allowing -,+,e,.
    $scope.Num1 = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    $scope.cancelSingleOrders = function(){

        $scope.shippingDetails.SkuType = null;
        $scope.shippingDetails.VehicleType = null;
        $scope.shippingDetails.DriverName = null;
        $scope.shippingDetails.DriverNumber = null;
        $scope.shippingDetails.VehicleNumber = null;
        $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;
        $scope.Packing.Length = null;
        $scope.Packing.Breadth = null;
        $scope.Packing.Height = null;
        $scope.Packing.Weight = null;
        $scope.Packing.LengthUnit = null;
        $scope.Packing.WeightUnit = null;
        $scope.blurred = true;
        $scope.tableSalesOrderSkuQuantityDetails = [];


        $mdDialog.hide();
    };

    //Start Date and End Date Validations Starts Here
    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();
    $scope.filter.start1Date = null;
    $scope.filter.end1Date = null;

    $scope.sendStartDate = function(date)
    {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function(date)
    {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
    }

    $scope.getFileType = function(file)
    {
        console.log(file);
    }
    $scope.DraftOrderID = {};
    $scope.OrderMode = "";
    $scope.editOrder = function(orderId,mode, ev) {
        $scope.OrderMode = mode;
        $scope.singleOrderMode = mode;
        $scope.updateOrderId = orderId;
        $scope.DraftOrderID.OrderedId = orderId;
        $scope.bulkUploadTabShow = false;

        $scope.fetchOrderDataForEdit(orderId).then(
            function () {
                $('#addOrderDialog').modal('show');
            }, 
            function () {
                growl.error("There is some issue in fetching order data. Please try after sometime.")
            }
        )

    };


    $scope.fetchOrderDataForEdit = function(orderId){

        var q = $q.defer();

        var editOrderUrl = baseUrl + '/omsservices/webapi/orders/' + orderId;
        $http({
            method: 'GET',
            url: editOrderUrl
        }).success(function(res) {
            if (res)
            {
                console.log(res);
                $scope.singleorderData.tableSaleOrderRemarks = res.tableSaleOrderRemarks;
                $scope.singleorderData.orderNo = res.tableSaleOrderClientOrderNo;
                $scope.singleorderData.channelObject = initializeDropdowns($scope.channelNamesData, 'idtableSalesChannelValueInfoId', res.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                $scope.singleorderData.paymentObject = initializeDropdowns($scope.paymentNamesData, 'idtableSaleOrderPaymentTypeId', res.tableSaleOrderPaymentType.idtableSaleOrderPaymentTypeId);
                $scope.custDataObj = {};
                if(res.tableSaleOrderLatestDeliveryDate!=null)
                {
                    $scope.singleorderData.tableSaleOrderLatestDeliveryDate = new Date(res.tableSaleOrderLatestDeliveryDate);
                }

                if(res.tableSaleOrderLatestShippngDate!=null)
                {
                    $scope.singleorderData.tableSaleOrderLatestShippngDate = new Date(res.tableSaleOrderLatestShippngDate);
                }
                if(res.tableSaleOrderScDateTime!=null)
                {
                    $scope.singleorderData.tableSaleOrderScDateTime = new Date(res.tableSaleOrderScDateTime);
                }

                $scope.singleorderData.tableSaleOrderRemarkses = res.tableSaleOrderRemarkses;

                $scope.singleorderData.customerObj = angular.copy(res.tableCustomer);
                $scope.$broadcast("angucomplete-alt:changeInput", "customers" , $scope.singleorderData.customerObj);

                for (var i = 0; i < res.tableSaleOrderSkuses.length; i++) {
                    $scope.products.push({
                        tableSku: res.tableSaleOrderSkuses[i].tableSku,
                        tableSaleOrderSkusSkuQuantity: res.tableSaleOrderSkuses[i].tableSaleOrderSkusSkuQuantity,
                        tableSaleOrderSkusChargeses: [{
                            "tableSaleOrderSkusChargesValue": res.tableSaleOrderSkuses[i].tableSaleOrderSkusChargeses[0].tableSaleOrderSkusChargesValue,
                            "tableSaleOrderSkuChargesType": {
                                "idtableSaleOrderSkuChargesTypeId": 1,
                                "tableSaleOrderSkuChargesTypeString": "Item Price"
                            }
                        }]
                    });
                }
                $scope.singleorderData.deliveryAddressName = res.tableAddressByTableSaleOrderShipToAddressId;
                $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;

                q.resolve(res);

            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            q.reject();

            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("There is some error in fetching order Data.");
            }
        });

        return q.promise;
    }


    $scope.copyOrder = function(orderId, ev) {
        $scope.singleOrderMode = "copy";
        $scope.updateOrderId = orderId;
        $scope.bulkUploadTabShow = false;
        var copyOrderUrl = baseUrl + '/omsservices/webapi/orders/' + orderId;
        $http({
            method: 'GET',
            url: copyOrderUrl
        }).success(function(res) {
            if (res) {
                console.log(res);
                $scope.singleorderData.channelObject = initializeDropdowns($scope.channelNamesData, 'idtableSalesChannelValueInfoId', res.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                $scope.singleorderData.paymentObject = initializeDropdowns($scope.paymentNamesData, 'idtableSaleOrderPaymentTypeId', res.tableSaleOrderPaymentType.idtableSaleOrderPaymentTypeId);
                $scope.custDataObj = {};
                $scope.custDataObj.originalObject = res.tableCustomer;
                $scope.customerObj($scope.custDataObj).then(
                    function(v) {
                        console.log(res.tableSaleOrderSkuses);
                        $scope.products = res.tableSaleOrderSkuses;
                        $scope.singleorderData.deliveryAddressName = res.tableAddressByTableSaleOrderShipToAddressId;
                        $scope.singleorderData.billingAddress = res.tableAddressByTableSaleOrderBillToAddressId;
                        $scope.singleorderData.tableSaleOrderRemarkses = [];
                    },
                    function(err) {}

                );
                $('#addOrderDialog').modal('show');
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Order Cannot Be Copied");
            }
        })
    };

    $scope.concatenateAddresses = function(addr1, addr2, addr3) {
        return addr1 + ", " + addr2 + ", " + addr3;
    };

    function initializeDropdowns(lists, prop, code) {
        lists = lists || [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (list[prop] === code) {
                return list;
            }
        };
        return null;
    }

    $scope.orderNumberChanged = function(orderNo) {
        if (orderNo) {
            $scope.orderNumberEntered = false;
        } else {
            $scope.orderNumberEntered = true;
        }
    };

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,value)
    {
        var q = $q.defer();
        if(value && value == 'EditDraft')
        {
            q.resolve(true);
        }
        else
        {
            console.log(orderNo);
            if (orderNo == undefined || orderNo == null || orderNo == "") {
                q.resolve(true);
            }
            else {
                var checkOrderNo = baseUrl + "/omsservices/webapi/orders/clientordernumber?clientorderno=" + orderNo;
                $http.get(checkOrderNo).success(function (data) {
                    console.log(data);
                    if (data != "") {
                        growl.error("Order ref. no. already exists");
                        $('#ordernumberId').val('');
                        $scope.isOrderNoValid = true;
                        $scope.orderNumberEntered = true;
                        q.resolve(false);
                    }

                    if (data == "") {
                        $scope.isOrderNoValid = false;
                        $scope.orderNumberEntered = false;
                        q.resolve(true);
                    }
                });

            }
        }
        return q.promise;
    }

    //dialog box to add new delivery address
    $scope.addShippingAddress = function(customerId) {
        console.log(customerId);

        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + customerId;
        $http.get(customersByIDUrl).success(function(data) {

            $scope.customerId = data.idtableCustomerId;

            $scope.customersData = data;
            $scope.shippingAddress.tableAddressContactPerson1 = data.tableCustomerFullName;
            $scope.shippingAddress.tableAddressEmail1 = data.tableCustomerEmail;
            $scope.shippingAddress.tableAddressPhone1 = data.tableCustomerPhone;

        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
        $('#orderShippingAddressModal').modal('show');
    };

    //dialog box to add new billing address
    $scope.addBillingAddress = function(customerId) {

        $scope.billAddressMode = 'add';
        $scope.customerAddress = {};
        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + customerId;
        $http.get(customersByIDUrl).success(function(data)
        {
            $scope.customersData = data;
            $scope.customerId = data.idtableCustomerId;
            $scope.billingAddress.tableAddressContactPerson1 = data.tableCustomerFullName;
            $scope.billingAddress.tableAddressEmail1 = data.tableCustomerEmail;
            $scope.billingAddress.tableAddressPhone1 = data.tableCustomerPhone;
        }).error(function(error) {
            console.log(error);
        });

        $('#billingAddressModal').modal('show');
    };

    // dialog box to add new invoice template
    $scope.uploadFileBulkOrder = function(ev) {
        $('#addOrderDialog').modal('hide');
        $mdDialog.show({
                templateUrl: 'bulkorder.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    $scope.tableSorting = function(sortType, sortReverse, defaultTab) {
        console.log(sortType);
        console.log(sortReverse);
        $scope.sortType = sortType;
        console.log($scope.directionType);
        if (sortReverse == true) {
            $scope.directionType = 'desc';
        }
        if (sortReverse == false) {
            $scope.directionType = 'asc';
        }
        console.log($scope.directionType);
        $scope.sortReverse = !sortReverse;

        var page = undefined;
        $scope.listOfStatesCount(defaultTab, page);
    }
    //    ======================================= quick ship ================================== //

    $scope.Packing = {};
    $scope.Packing.containerQuantity = [];
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipData = function(data){
        console.log(data);
        $('#QuickShipDialog').modal('show');
        //$scope.Packing.containerQuantity
        $scope.quickShipDataTable = data.tableSaleOrderSkuses;
        $scope.quickShipDataTable.orderID = data.idtableSaleOrderId;
    };
    $scope.quickShipDataDialog = function(ev,data){
        $scope.disableQuickShip = false;
        $mdDialog.show({
            templateUrl: 'SOquickOperation.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        //$scope.Packing.containerQuantity
	$scope.quickShipDataTable = [];
        angular.forEach(data.tableSaleOrderSkuses, function(value)
        {
            if(value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9
                || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11 || value.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13){
                $scope.quickShipDataTable.push(value);
            }
        });

        $scope.quickShipDataTable.orderID = data.idtableSaleOrderId;
    }

    $scope.validateAlphaNum = function (val)
    {

        var letterNumber = /^[0-9a-zA-Z]+$/;
        if(val.match(letterNumber))
        {
        }
        else
        {
            growl.error("Only alphabets and numbers are allowed")
        }
    }

    $scope.validateAlpha = function (val) {

        var letters = /^[A-Za-z ]+$/;
        if(val.match(letters))
        {
        }
        else
        {
            growl.error("Only alphabets are allowed")
        }
    }
	
	$scope.shippingDetails = {};
	$scope.resetAllQuickShipFields = function () {
			$scope.shippingDetails.VehicleType = null;
			$scope.shippingDetails.DriverName = null;
			$scope.shippingDetails.DriverNumber = null;
			$scope.shippingDetails.VehicleNumber = null;
			$scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;
        
    }
	

    $scope.validateNumber = function (val)
    {
        if(isNaN(val)){
            growl.error("Only numbers are allowed");
        }
    }

    $scope.ShippingDetailsBtn = function(value){
        if (value.SkuType == 'Heavy') {

            if(value.VehicleType == '' || value.VehicleType == undefined){
                growl.error('Vehicle type is required.');
                return false;
            }
            if (value.DriverName == '' || value.DriverName == undefined){
                growl.error('Driver name is required.');
                return false;
            }
            if(value.VehicleNumber == '' || value.VehicleNumber == undefined){
                growl.error('Vehicle number is required.');
                return false;
            }
            if($scope.validateAlpha(value.DriverName) == false){
                return false;
            }
            if($scope.validateAlphaNum(value.VehicleNumber) == false){
                return false;
            }
            if(value.DriverNumber != null  && value.DriverNumber != undefined && value.DriverNumber != ''  && $scope.validateNumber(value.DriverNumber) == false){
                return false;
            }

        }
       else if(value.SkuType == 'Parcel')
       {
            if (value.tableSaleOrderShippingDetailsMasterAwb == '' || value.tableSaleOrderShippingDetailsMasterAwb == undefined)
            {
                growl.error('AWB number is required.');
                return false;
            }
        }
    };



    $scope.SelectVehicleType = function(){
        var vehicletypeUrl = baseUrl+'/omsservices/webapi/vehicletypes';
        $http.get(vehicletypeUrl).success(function(data) {
            $scope.SKUvehicleType = data;
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.sum = function(items, prop){
        console.log(items);
        return items.reduce( function(a, b){
            return parseInt(a) + parseInt(b[prop]);
        }, 0);
    };

    $scope.PackingContainerNumber = function(value,dimensions,shippedDetails,IndexValue)
    {

        if(dimensions.Length == null || dimensions.Length == undefined)
        {
            growl.error('Enter length');
            return;
        }

        if(dimensions.Breadth == null || dimensions.Breadth == undefined)
        {
            growl.error('Enter Width');
            return;
        }

        if(dimensions.Height == null || dimensions.Height == undefined)
        {
            growl.error('Enter height');
            return;
        }

        if(dimensions.Weight == null || dimensions.Weight == undefined)
        {
            growl.error('Enter weight');
            return;
        }

        if(dimensions.LengthUnit == null || dimensions.LengthUnit == undefined)
        {
            growl.error('Enter dimension unit');
            return;
        }

        if(dimensions.WeightUnit == null || dimensions.WeightUnit == undefined)
        {
            growl.error('Enter weight unit');
            return;
        }

        if(shippedDetails.SkuType == 'Parcel' && !$scope.shipping.awbnumber)
        {
            growl.error('Enter AWB No');
            return;
        }

        if(value == null || value == undefined || value.length == 0 )
        {
            growl.error('Add package to the list');
            return;
        }

		
        console.log('array value:',value);
        console.log('array value:',shippedDetails);
        console.log('array value:',IndexValue);
        console.log('dimensions:',dimensions);
		var tableSkus =[];
		var quantity = 0;
		angular.forEach(value,function(source){
               if(source.tableSkusSkuQuantity)
			   {
				   quantity += source.tableSkusSkuQuantity;
                   source.tableSaleOrderShippingDetailsShippingAwb = $scope.shipping.awbnumber;
				   tableSkus.push(source);
			   }
			   else
               {
                   source.tableSkusSkuQuantity = 0;
               }
            });
		if(quantity == 0){
			growl.error('Please Enter Quantity');
            		return;
		}
        dimensions.tableSaleOrderSkus = tableSkus;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

            $scope.tableSalesOrderSkuQuantityDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tableSaleOrderShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};

        console.log($scope.tableSalesOrderSkuQuantityDetails);
        angular.forEach($scope.tableSalesOrderSkuQuantityDetails,function(source){
            $scope.TotalInputQuantity = $scope.sum(source.tableSaleOrderSkus,'tableSkusSkuQuantity');

        });
        console.log(typeof $scope.TotalInputQuantity);
        console.log($scope.TotalInputQuantity);
    };

    $scope.LengthMeasureUnitDropDown = function(){
        var UnitUrl = baseUrl+'/omsservices/webapi/skuuodmtypes';
        var WeightUnitUrl = baseUrl+'/omsservices/webapi/skuuowmtypes';
        $http.get(UnitUrl).success(function(data) {
            console.log(data);
            $scope.lengthUnitDropdown = data;
        }).error(function(data){
            console.log(data);
            });
        $http.get(WeightUnitUrl).success(function(data) {
            console.log(data);
            $scope.weightUnitDropdown = data;
        }).error(function(data){
            console.log(data);
        });
    };

    var SalesOrderSkuID;
    $scope.AddPacckingDetails = function(data)
    {
        $scope.disableQuickShip = true;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if($scope.tableSalesOrderSkuQuantityDetails == ""){
            growl.error("You need to add container, Click '+ Add This Container'");
            return;
        }else{
        angular.forEach(data, function (value)
        {
            var SKUcarrierValue = null;
            var SkuDriverName = null;
            var SkuDriverNumber = null;
            var SkuVehicleNumber = null;
            var SkuVehicleType = null;
            SalesOrderSkuID = value.SalesorderID;

            if (value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb == null || value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb == undefined)
            {
                SKUcarrierValue = null;
            }
            else
            {
                SKUcarrierValue = value.SKUcarrierDetails.tableSaleOrderShippingDetailsMasterAwb;
            }
            if (value.SKUcarrierDetails.DriverName == null || value.SKUcarrierDetails.DriverName == undefined)
            {
                SkuDriverName = null;
            }
            else
            {
                SkuDriverName = value.SKUcarrierDetails.DriverName
            }
            if (value.SKUcarrierDetails.DriverNumber == null || value.SKUcarrierDetails.DriverNumber == undefined)
            {
                SkuDriverNumber = null;
            }
            else
            {
                SkuDriverNumber = value.SKUcarrierDetails.DriverNumber
            }
            if (value.SKUcarrierDetails.VehicleNumber)
            {
                SkuVehicleNumber = value.SKUcarrierDetails.VehicleNumber;
            }
            else
            {
                SkuVehicleNumber = null;
            }

            if (value.SKUcarrierDetails.VehicleType)
            {
                SkuVehicleType = value.SKUcarrierDetails.VehicleType;
            }
            else
            {
                SkuVehicleType = null;
            }

            angular.forEach(value.tableSaleOrderSkus, function (response)
            {
                console.log(response);
                SKUDto = _.omit(response, 'tableSkusSkuQuantity', 'tableSaleOrderShippingDetailsShippingAwb', 'SalesorderID');
                SKuQuanity = response.tableSkusSkuQuantity;
                if(SKuQuanity && SKuQuanity != 0)
                {
                    if (SKUcarrierValue == 'undefined' || SKUcarrierValue == null) {
                        var vehicleDriverMap = {
                            "tableClientShippingCarrierDriverDetails": {
                                "tableClientShippingCarrierDriverDetailsName": SkuDriverName,
                                "tableClientShippingCarrierDriverDetailsPhoneNo": SkuDriverNumber
                            },
                            "tableClientShippingCarrierVehicle": {
                                "tableClientShippingCarrierVehicleRegNo": SkuVehicleNumber,
                                "tableClientShippingCarrierVehicleType": SkuVehicleType
                            }
                        };
                    }
                    newSkupackingData = {
                        'tableSaleOrderSkus': SKUDto,
                        'skuQuantity': SKuQuanity,
                        'tableSaleOrderPackingDetails': {
                            'tableSaleOrderPackingDetailsLength': value.Length,
                            'tableSaleOrderPackingDetailsWidth': value.Breadth,
                            'tableSaleOrderPackingDetailsHeight': value.Height,
                            'tableSaleOrderPackingDetailsWeight': value.Weight,
                            "tableSkuUodmType": value.LengthUnit,
                            "tableSkuUowmType": value.WeightUnit,
                            "tableSaleOrderShippingDetails": {
                                "tableSaleOrderShippingDetailsMasterAwb": SKUcarrierValue,
                                "tableSaleOrderShippingDetailsShippingAwb": response.tableSaleOrderShippingDetailsShippingAwb,
                                "tableClientShippingCarrierVehicleDriverMap": vehicleDriverMap
                            }
                        },
                        "boxSequenceNo": $scope.boxSequenceNo
                    };
                    QuickShipTable.push(newSkupackingData);
                }
                });
            $scope.boxSequenceNo++;

        });
        console.log(QuickShipTable);

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/orders/' + SalesOrderSkuID + '/packinginfo',
            data: QuickShipTable,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            console.log(data);

            $scope.shippingDetails.SkuType = null;
            $scope.shippingDetails.VehicleType = null;
            $scope.shippingDetails.DriverName = null;
            $scope.shippingDetails.DriverNumber = null;
            $scope.shippingDetails.VehicleNumber = null;
            $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;
            $scope.Packing.Length = null;
            $scope.Packing.Breadth = null;
            $scope.Packing.Height = null;
            $scope.Packing.Weight = null;
            $scope.Packing.LengthUnit = null;
            $scope.Packing.WeightUnit = null;
            $scope.tableSalesOrderSkuQuantityDetails = [];

            $scope.disableQuickShipBox = [];
            $scope.editQuickShipBoxHideAndShow = [];
            $mdDialog.hide();
            growl.success('Quick ship success');
            $scope.cancelSingleOrders();
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function (data)
        {
            $scope.disableQuickShip = false;
            growl.error(data.errorMessage);
        })
    }
    };


    $scope.blurred = true;
    $scope.skuPackingDisable =function(shippingDetailsType)
    {
        if($scope.ShippingDetailsBtn(shippingDetailsType)==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function(index){
        console.log(index);
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
        console.log($scope.tableSalesOrderSkuQuantityDetails);
    };


    $scope.shippingDetails  = {};

    $scope.closeBulkUploadDialog = function(){
        $('#addOrderDialog').modal('hide');
        $cookies.put('BulkUploadData','order');
        $cookies.put('ActiveTab','Orders');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    };
    var orderDataForReplacingData;
	$scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
		$scope.editRemarkModalOrderId = order.idtableSaleOrderId;
        $scope.modalRemarks = null;
		if(order.tableSaleOrderRemarkses == null || order.tableSaleOrderRemarkses == undefined){
			$scope.modalRemarks = null;
		}
		else{
            if(order.tableSaleOrderRemarkses.length>0){
                $scope.modalRemarks = order.tableSaleOrderRemarkses;
            }
		}
		$scope.orderIndex = index;
		$('#editRemarkModal').modal('show');
	};

	$scope.cancelEditRemarksModal = function(){
		$scope.editRemarkModalOrderId = null;
		$scope.genericData.newModalRemarks = null;
		$scope.modalRemarks = null;
		$scope.orderIndex = null;
		$('#editRemarkModal').modal('hide');
	};
	
	$scope.updateRemarks = function(newRemarks){
		var remarks = newRemarks;
		var index = $scope.orderIndex;
		if(newRemarks == null || newRemarks == undefined || newRemarks == ""){
			growl.error("Please provide remarks");
			return;
		}
		 $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/orders/' + $scope.editRemarkModalOrderId +'/editremarks',
                data: remarks
            }).success(function(data) {
                 var checkUpdatedRemarksDataUrl = baseUrl + "/omsservices/webapi/orders/"+orderDataForReplacingData.idtableSaleOrderId;
                 $http({
                     method: 'GET',
                     url: checkUpdatedRemarksDataUrl
                 }).success(function(response){
                     var dataIndex = $scope.orderLists.indexOf(orderDataForReplacingData);
                     $scope.orderLists[dataIndex] = response;
                     growl.success("Remarks updated successfully");
                 }).error(function(err){
                     console.log(err);
                 });
                $scope.orderLists[index].tableSaleOrderRemarks = data;

            }).error(function(error, status) {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error("Failed to update remarks");
                }
             });
		$scope.cancelEditRemarksModal();
	}
    //$scope.shippingDetails.SkuType = 'Parcel';


//    =============================== show order level action ========================== //

    $scope.showOrderLevelAction = function(value){
        console.log(value);
    }
    $scope.getShippingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
                if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16)) {
                    b = true;
                }
        });
        return b;
    }

    $scope.getPackingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16)){
                b = true;
            }
        });
        return b;
    };
    $scope.getmanifestLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 14 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15)){
                b = true;
            }
        });
        return b;
    };
    $scope.getInvoiceLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16)){
                b = true;
            }
        });
        return b;
    };
    $scope.getQuickShipLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)){
                b = true;
            }
        });
        return b;
    };
	
	$scope.genericData = {};
	$scope.genericData.skuSelectedArray = [];
	$scope.genericData.quantity = 0;
	//updated code By UV - start
	$scope.getSplitLabelButton = function(data){
        var b = false;	   
	   //alert("Value is :"+ data.tableSalesChannelMetaInfo);
	   
		if(data.tableSalesChannelValueInfoSkuLevelSplitAllowed == true){
			b = true;
		}else if(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoSkuLevelSplitAllowed == true){
			b = true;
		}
	   
	    if($scope.genericData.skuArray.length == 1){
		   b = false;
		}

		var check = 0;
		for(var i = 0; i < $scope.genericData.skuArray.length ; i++){
		    if($scope.genericData.skuArray[i].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId > 12){
		        check++;
            }
        }

        if(check == $scope.genericData.skuArray.length){
		    return false;
        }

        return b;
    };
	
		$scope.getSplitLabelButtonForQuantity = function(data, sku){
        var b = false;	   
	   //alert("Value is :"+ data.tableSalesChannelMetaInfo);
	   
		if(data.tableSalesChannelValueInfoSkuQuantityLevelSplitAllowed == true){
			b = true;
		}else if(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoSkuQuantityLevelSplitAllowed == true){
			b = true;

		}

		if(sku.tableSaleOrderSkusSkuQuantity < 2){
		    return false;
        }

		if(sku.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId > 12){
		    return false;
        }

        return b;
    };
	

    $scope.orderLevelActionRow = function(data, data2){

		$scope.genericData.skuArray = data;
        var shippingLabelButn = $scope.getShippingLabelButton(data);
        var packingLabelButton = $scope.getPackingLabelButton(data);
        var manifestLabelButton = $scope.getmanifestLabelButton(data);
        var InvoiceLabelButton = $scope.getInvoiceLabelButton(data);
        var QuickShipButton = $scope.getQuickShipLabelButton(data);
		var SplitOrderButton = $scope.getSplitLabelButton(data2);
        if(shippingLabelButn == true || packingLabelButton == true || manifestLabelButton == true || InvoiceLabelButton == true || QuickShipButton == true || SplitOrderButton == true){
            return true;
        }else{
            return false;
        }

    };
	
	
	
	$scope.masterSkuDialog = function(ev, check){		
		
		mastersService.fetchSkus(baseUrl).then(function(data){
			$scope.genericData.skusListFiltered = data;
			
			$timeout(function () {
			
				$mdDialog.show({
		            templateUrl: 'dialogmastersku.tmpl.html',
		            parent: angular.element(document.body),
		            targetEvent: ev,
		            clickOutsideToClose: false,
		            scope: $scope.$new()
		        });	
				
			}, 500);
		});
		
		$scope.genericData.check = check;
		
		if(check == true){
            $('#addOrderDialog').modal('hide');

            console.log($scope.singleorderData);
		}
				
        	
		
	}
	
	$scope.masterCustomerDialog = function(ev, check){		
		
		mastersService.fetchCustomers(baseUrl).then(function(data){
			$scope.genericData.customerListFiltered = data;
			
			$timeout(function () {
				
				 $mdDialog.show({
			            templateUrl: 'dialogmastercustomer.tmpl.html',
			            parent: angular.element(document.body),
			            targetEvent: ev,
			            clickOutsideToClose: false,
			            scope: $scope.$new()
			        });	
				
			}, 500);
			
		})
		
		$scope.genericData.check = check;
		
		if(check == true){
            $('#addOrderDialog').modal('hide');

        }
	}
	
	$scope.selectSku = function(id, ev){
						
		 $http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
         console.log(data);
         
         if($scope.genericData.check == false){
        	 $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
		 }else{			 
			 $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		 }         
         
        }).error(function(error, status) {
            console.log(error);
			
        });
		
		$scope.cancelmastersDialog(ev);	
			
		
	}
	
	$scope.selectCustomer = function(id, ev){
		
		$scope.customerid = id;
		
		 $http.get(baseUrl + '/omsservices/webapi/customers/'+id).success(function(data) {
         console.log(data);
         
         if($scope.genericData.check == false){
        	 $scope.$broadcast("angucomplete-alt:changeInput", "customersfilter", data);        	 
         }else{
        	 $scope.$broadcast("angucomplete-alt:changeInput", "customers", data);
         }
         
		 
        }).error(function(error, status) {
            console.log(error);			
        });	
		
		$scope.cancelmastersDialog(ev);		
	}
	
	$scope.cancelmastersDialog = function(ev){
		$mdDialog.hide({
            templateUrl: 'dialogmastersku.tmpl.html'
        });
		
		$mdDialog.hide({
            templateUrl: 'dialogmastercustomer.tmpl.html'
        });
		

		if($scope.genericData.check == true){						
			$scope.showAddOrderModalWithValues(ev);
		}
		
	}
	
	$scope.showAddOrderModalWithValues = function(ev){
        $('#addOrderDialog').modal('show');
	}
	
	
	$scope.splitOrderBySkuDialog = function(ev, data, orderid){
		$scope.skusListForOrderSplit = data;
		$scope.genericData.orderId = orderid;
		
        $mdDialog.show({
            templateUrl: 'splitOrderSku.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
		
	}

	$scope.genericData.splitCost = false;

	$scope.splitOrderBySkuByQuantityDialog = function(ev, data, orderid,skuquantity){
		$scope.genericData.skuid = data;
		$scope.genericData.orderId = orderid;
		$scope.genericData.skuquantity =skuquantity;

        $mdDialog.show({
            templateUrl: 'splitOrderSkubyquantity.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
		
	}
	
	$scope.updateSkuArray = function(data){

        var idx = $scope.genericData.skuSelectedArray.indexOf(data);
        console.log(idx);
        // is currently selected
        if (idx > -1) {
            $scope.genericData.skuSelectedArray.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.genericData.skuSelectedArray.push(data);
        }
        console.log($scope.genericData.skuSelectedArray);
	}
	
	$scope.splitOrderBySkus = function(){
		var arr = $scope.genericData.skuSelectedArray;
		var skuArrayLength = arr.length;
		var totalSkusLength = $scope.skusListForOrderSplit.length;
		if(skuArrayLength >= totalSkusLength){
			growl.error("You cannot select all the SKUs.");
			return;
		}
		 $http({
                        method: 'PUT',
                        url: baseUrl + '/omsservices/webapi/orders/' + $scope.genericData.orderId +'/splitorder?splitCost='+$scope.genericData.splitCost,
                        data: arr
                    }).success(function() {
						//$scope.orderLists[index].tableSaleOrderRemarks = remarks;
                       growl.success("Order split successful");
					   $mdDialog.hide();
					   
                    }).error(function(error, status) {
						if(status == 400)
						{
							growl.error(error.errorMessage);
						}
						else
                        {
							growl.error("Order split failed.");
						}
                       

                    });
					
					
	}
	
	$scope.splitOrderBySkusByQuantity = function()
    {
        if($scope.genericData.quantity == undefined || $scope.genericData.quantity == null){
            growl.error("Enter quantity first");
            return;
        }
		if($scope.genericData.quantity <=0 || $scope.genericData.quantity >= $scope.genericData.skuquantity){
            growl.error("quantity can not be zero or greater than or equal to ordered sku quantity");
            return;
        }
		 $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/orders/' + $scope.genericData.orderId +'/splitorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity+'&splitCost='+$scope.genericData.splitCost,

         }).success(function()
         {
           growl.success("Order splitted successfully");
           $mdDialog.hide();

        }).error(function(error, status)
         {
             if(status == 400)
             {
                growl.error(error.errorMessage);
             }
             else
             {
                growl.error("Order split has failed.");
             }


            });
					
					
	}

    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.customersData.tableCustomerReturnValue = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.customersData.tableCustomerReturnQuantity = null;
        }
    }

    $scope.checkNumber = checkNumber;

    $scope.editContainerPackage = function (index) {
        console.log(index);
        $scope.disableQuickShipBox[index] = true;
        $scope.editQuickShipBoxHideAndShow[index] = true;
    };

    $scope.disableContainerPackage = function (index) {
        console.log(index);
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
    };

    $scope.downloadOrdertemplate = function(){
        $http({
            method: 'GET',
            url: $scope.downloadOrderTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_Order_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tableSaleOrderSkusSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

}

