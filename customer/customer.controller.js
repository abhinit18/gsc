myApp.controller('customerController', customerController);

customerController.$inject = ['$scope', '$http', '$location', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService', '$q', '$cookies','downloadCustomersTemplateUrl','Upload','$timeout','$cookies','$rootScope', 'mastersService'];

function customerController($scope, $http, $location, $mdDialog, $mdMedia, baseUrl, growl, PagerService, $q, $cookies,downloadCustomersTemplateUrl,Upload,$timeout,$cookies,$rootScope, mastersService) {

    $scope.genericData = {};
    $scope.customerVatTin = {};
    $scope.billingAddressGstin = {};
    $scope.genericData.enableSorting =  true;
    $scope.genericData.shipAddrBillAddrSame = false;
    $scope.billingAddress = {};
    $scope.shippingAddress = {};
    $scope.searchCustomerClicked = false;
    $scope.customersData = {};
    $scope.genericData.customerMode = "add";
    $scope.shipAddressMode = "add";
    $scope.billAddressMode = "add";
    $scope.singleCustomerTab = true;
    $scope.bulkCustomerTab = false;
    $scope.start = 0;
    $scope.customerSize = 5;
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';
    $scope.tinMode = "";
    $scope.downloadCustomersTemplateUrl = downloadCustomersTemplateUrl;


    $scope.modeCustomer = "normal";

    $scope.sortType = "tableCustomerSystemNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.isSubmitDisabledMutual = true;
    $scope.isResetDisabledMutual = true;

    $scope.isSubmitDisabledSku = true;
    $scope.isResetDisabledSku = true;
    $scope.shipAddrClicked = false;
	$scope.billingAddrClicked = false;
    $scope.returnParamsClicked = false;

    $scope.genericData.returnType = "";

    $scope.returnTypes = [];

    $scope.gstTypes = [];

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



    $scope.callDisabledMutual = function() {
        $scope.isSubmitDisabledMutual = false;
    }

    $scope.callDisabledSku = function() {
        $scope.isSubmitDisabledSku = false;
    }

    $scope.$on('$routeChangeSuccess', function() {
        // $scope.listOfCustomers($scope.start);
        $scope.listOfCustomerCount();
        $scope.regionsStatesData();
        $scope.getGstTypes();
    });

    $rootScope.$on("CallParentMethod", function(){
        console.log("HELLO1");
         $scope.addCustomer(event);
    });


    //Submit Customer Action
    //submit Action for Customer screen when clicking on submit button in main customer screen
    $scope.submitCustomerAction = function(cityid, districtid, stateid) {

        console.log(cityid);
        console.log(districtid);
        console.log(stateid);
        $scope.cityid = cityid;
        $scope.districtid = districtid;
        $scope.stateid = stateid;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        var page = undefined;
        // $scope.listOfCustomers();
        $scope.listOfCustomerCount(page);
    };

    //clear action for vendor mutual search
    $scope.clearMutualcustomerAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        // $scope.listOfCustomers();
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfCustomerCount(page);
    }

    $scope.clearMutualSkuAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.start = 0;
        $scope.modeCustomer = "normal";
        $scope.skuFullId = null;
        var page = undefined;
        $scope.listOfCustomerCount(page);
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
    }

    $scope.clearStateDistCitycustomerAction = function() {
        $scope.start = 0;
        $scope.cityid = null;
        $scope.districtid = null;
        $scope.stateid = null;
        $scope.modeCustomer = "normal";
        var page = undefined;
        $scope.listOfCustomerCount(page);
    }

    $scope.searchedProduct = function(selected) {
        if (selected != null) {
            console.log(selected);
            $scope.skuFullId = selected.originalObject.idtableSkuId;
            $scope.callDisabledSku();
        }
    }

    $scope.searchLocation = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    };
	$scope.searchLocationBilling = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    };

    //submit customer action mutual customer
    $scope.submitcustomerSearchAction = function(wordSearch) {
        if(wordSearch == null || wordSearch == undefined || wordSearch == '')
        {
            growl.error('At least 3 characters are required for search');
            return;
        }
        if(wordSearch.length < 3)
        {
            growl.error('At least 3 characters are required for search');
            return;
        }
        $scope.genericData.enableSorting =  false;
        $scope.sortType = "tableCustomerSystemNo";
        $scope.directionType = "desc";
        $scope.wordSearch = wordSearch;
        $scope.modeCustomer = "mutual";
        $scope.sortReverse = true;
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfMutualCustomersCount(page);
    }

    //submit customer action sku wise
    $scope.submitSkuSearchAction = function() {
        if($scope.skuFullId == null || $scope.skuFullId == undefined)
        {
            growl.error('Select SKU first');
            return;
        }
        $scope.genericData.enableSorting =  false;
        $scope.sortType = "tableCustomerSystemNo";
        $scope.directionType = "desc";
        $scope.modeCustomer = "skuFull";
        $scope.sortReverse = true;
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfMutualSkuCount(page);
    }

    $scope.tableSorting = function(sortType, sortReverse) {
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

        if ($scope.modeCustomer == 'normal') {
            var page = undefined;
            $scope.listOfCustomerCount(page);
        }

        if ($scope.modeCustomer == 'mutual') {
            var page = undefined;
            $scope.listOfMutualCustomersCount(page);
        }

        if ($scope.modeCustomer == 'skuFull') {
            var page = undefined;
            $scope.listOfMutualSkuCount(page);
        }
    };

    $scope.showResult = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocation = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocation);
        }
        return true;
    };
	$scope.showResultForBilling = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocationBilling = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocationBilling);
        }
        return true;
    };

    $scope.getLatitudeLongitude = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.customerAddress) {
            if ($scope.customerAddress.adLine1) {
                address = address + $scope.customerAddress.adLine1;
            }
            if ($scope.customerAddress.adLine2) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.adLine2;
                } else {
                    address = $scope.customerAddress.adLine2;
                }
            }
            if ($scope.customerAddress.adLine3) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.adLine3;
                } else {
                    address = $scope.customerAddress.adLine3;
                }
            }
            if ($scope.cityVal && !$scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.cityVal;
                } else {
                    address = $scope.cityVal;
                }
            }
            if ($scope.district && (!$scope.cityVal && !$scope.customerAddress.pincode)) {
                if (address != "") {
                    address = address + ", " + $scope.district;
                } else {
                    address = $scope.district;
                }
            }
            if ($scope.state && !$scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.state;
                } else {
                    address = $scope.state;
                }
            }
            if ($scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.pincode;
                } else {
                    address = $scope.customerAddress.pincode;
                }
            }
        }

        console.log(address);
        if (address != "") {
            // Initialize the Geocoder
            geocoder = new google.maps.Geocoder();
            console.log(geocoder);
            if (geocoder) {
                geocoder.geocode({
                    'address': address.toString()
                }, function(results, status) {
                    console.log(status);
                    console.log(results);
                    if (status == google.maps.GeocoderStatus.OK) {
                        q.resolve(callback(results[0]));
                    } else {
                        q.resolve(callback(results[0]));
                        // growl.error("Exact location cannot be fetched from the entered address")
                    }
                });
            }
        }
        return q.promise;
    };
	 $scope.getLatitudeLongitudeForBilling = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.customerAddress) {
            if ($scope.customerAddress.billingAddLine1) {
                address = address + $scope.customerAddress.billingAddLine1;
            }
            if ($scope.customerAddress.billingAddLine2) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.billingAddLine2;
                } else {
                    address = $scope.customerAddress.billingAddLine2;
                }
            }
            if ($scope.customerAddress.billingAddLine3) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.billingAddLine3;
                } else {
                    address = $scope.customerAddress.billingAddLine3;
                }
            }
            if ($scope.cityValForBilling && !$scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.cityValForBilling;
                } else {
                    address = $scope.cityValForBilling;
                }
            }
            if ($scope.districtForBilling && (!$scope.cityValForBilling && !$scope.customerAddress.pincodeBilling)) {
                if (address != "") {
                    address = address + ", " + $scope.districtForBilling;
                } else {
                    address = $scope.districtForBilling;
                }
            }
            if ($scope.stateForBilling && !$scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.stateForBilling;
                } else {
                    address = $scope.stateForBilling;
                }
            }
            if ($scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.pincodeBilling;
                } else {
                    address = $scope.customerAddress.pincodeBilling;
                }
            }
        }

        console.log(address);
        if (address != "") {
            // Initialize the Geocoder
            geocoder = new google.maps.Geocoder();
            console.log(geocoder);
            if (geocoder) {
                geocoder.geocode({
                    'address': address.toString()
                }, function(results, status) {
                    console.log(status);
                    console.log(results);
                    if (status == google.maps.GeocoderStatus.OK) {
                        q.resolve(callback(results[0]));
                    } else {
                        q.resolve(callback(results[0]));
                        // growl.error("Exact location cannot be fetched from the entered address")
                    }
                });
            }
        }
        return q.promise;
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

    //opening and closing search accordian
    $scope.toggleSearchRow = function() {
        console.log($scope.searchCustomerClicked);
        $scope.searchCustomerClicked = !$scope.searchCustomerClicked;
    };
    //opening and closing search accordian ends here


    // fetching list of customers from RestAPI OMS
    $scope.listOfCustomers = function(start) {

        var customersListUrl = baseUrl + "/omsservices/webapi/customers";
        customersListUrl += "?start=" + start + '&size=5&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        if ($scope.cityid) {
            customersListUrl += "&city=" + $scope.cityid;
        }
        if ($scope.districtid) {
            customersListUrl += "&district=" + $scope.districtid;
        }
        if ($scope.stateid) {
            customersListUrl += "&state=" + $scope.stateid;
        }
        console.log(customersListUrl);
        $http.get(customersListUrl).success(function(data) {
            $scope.customersLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //fetching list of customers count
    $scope.listOfCustomerCount = function(page) {
        var customerCountUrl = baseUrl + "/omsservices/webapi/customers/filtercount?sort=idtableCustomerId&direction=desc";
        if ($scope.cityid) {
            customerCountUrl += "&city=" + $scope.cityid;
        }
        if ($scope.districtid) {
            customerCountUrl += "&district=" + $scope.districtid;
        }
        if ($scope.stateid) {
            customerCountUrl += "&state=" + $scope.stateid;
        }
        console.log("CUSTOMER COUNT URL");
        console.log(customerCountUrl);
        $http.get(customerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                // vm.setPage = setPage;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.customerSize = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfCustomers($scope.start);
                }
                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    //fetchng list of customer count ends here

    //fetching list of mutual customers from mutually exlusive search string customers
    $scope.listOfMutualCustomers = function(start) {
        var customersListUrl = baseUrl + "/omsservices/webapi/customers/search?search=" + $scope.wordSearch;
        customersListUrl += '&start=' + start + '&size=5&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        console.log(customersListUrl);
        $http.get(customersListUrl).success(function(data) {
            console.log(data);
            $scope.customersLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //fetching list of mutual customers count
    $scope.listOfMutualCustomersCount = function(page) {
        var customerCountUrl = baseUrl + "/omsservices/webapi/customers/searchcount?search=" + $scope.wordSearch;
        console.log("customers MAIN COUNT URL");
        console.log(customerCountUrl);
        $http.get(customerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    initController();

                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                }

                if (page != undefined) {
                    vm.setPage(page);

                }

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.customerSize = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfMutualCustomers($scope.start);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //fetching list of mutual customers from mutually exlusive search string customers
    $scope.listOfSkuCustomers = function(start) {
        var skucustomersListUrl = baseUrl + "/omsservices/webapi/customers/skus/" + $scope.skuFullId;
        skucustomersListUrl += "?start=" + start + '&size=5&sort=' + $scope.sortType + '&direction=' + $scope.directionType;
        console.log(skucustomersListUrl);
        $http.get(skucustomersListUrl).success(function(data) {
            console.log(data);
            $scope.customersLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.customersLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //fetching list of mutual customers count
    $scope.listOfMutualSkuCount = function(page) {
        var skucustomerCountUrl = baseUrl + "/omsservices/webapi/customers/skuscount/" + $scope.skuFullId;
        console.log("sku customers MAIN COUNT URL");
        console.log(skucustomerCountUrl);
        $http.get(skucustomerCountUrl).success(function(data) {
            $scope.customerCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.customerCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    initController();

                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                }

                if (page != undefined) {
                    vm.setPage(page);

                }

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.customerSize = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.customerSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfSkuCustomers($scope.start);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    //fetchng list of vendors mutual count ends here


    //expansion and collapsing of customer rows data
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.customersLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };


    $scope.selectTableRow = function(index, storeId) {

        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }

        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" && $scope.storeIdExpanded === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.storeIdExpanded = storeId;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index && $scope.storeIdExpanded === storeId) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.storeIdExpanded = "";
                $scope.dayDataCollapse[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.storeIdExpanded = storeId;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

    //expansion and collapsing of customer rows data ends here

    //Creation Source Api Data from saleschannel API
    $scope.creationSourceData = function(saleChannelType) {
        var q = $q.defer();
        $scope.creationSourceArray = [];
        var salesChannelUrl = baseUrl + "/omsservices/webapi/saleschannels";
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

    //Regions Data from region states generic API - For Shipping
    $scope.regionsStatesDistrictData = function(stateData) {
        $scope.state = stateData.tableStateLongName;
        $scope.getLatitudeLongitude($scope.showResult).then(
            function(v) {
                if (v || !v) {
                    console.log(v);
                    console.log(stateData);
                    $scope.stateId = stateData.idtableStateId;
                    $scope.regionsStatesDistrictArray = [];
                    var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                    $http.get(regionsStatesDistrictUrl).success(function(data) {
                        if (data != null) {
                            for (var i = 0; i < data.length; i++) {
                                $scope.regionsStatesDistrictArray.push(data[i]);
                            }
                            console.log($scope.regionsStatesDistrictArray);
                            $scope.customerAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', stateData.idtableDistrictId);
                            console.log($scope.customerAddress.districtData);
                        }
                    }).error(function(error, status) {
                        console.log(error);
                        console.log(status);
                    });
                }
            },
            function(err) {}
        );
    };
	// For billing address
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

    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        if (districtData) {
            $scope.district = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        $scope.regionsStatesDistrictsCityArray = [];
                        $scope.districtId = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data)
                        {
                            $scope.regionsStatesDistrictsCityArray = data;
                            $scope.billingAddress.tableCity = initializeDropdowns($scope.regionsStatesDistrictsCityArrayForBilling, 'idtableDistrictId', stateData.idtableDistrictId);
                        }).error(function(error, status) {
                            console.log(error);

                        });
                    }
                },
                function(err) {}
            );
        }
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
    $scope.changeCity = function(city) {
        if (city) {
            $scope.cityVal = city.tableCityLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {},
                function(err) {}
            );
        }
    };
	$scope.changeCityForBilling = function(city) {
        if (city) {
            $scope.cityValForBilling = city.tableCityLongName;
            $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
                function(v) {},
                function(err) {}
            );
        }
    };

    // dialog box to add new customer
    $scope.showCustomerBox = function(ev) {
        $mdDialog.show({
            templateUrl: 'dialog222.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new(),
            escapeToClose: false
        })
    };

    $scope.checkVat = function(customerid,stateid)
    {
        var q = $q.defer();
        var vatCheckURL = baseUrl + '/omsservices/webapi/customers/' + customerid+ '/vats/checkvat/' + stateid;
        $http.get(vatCheckURL).success(function(data)
        {
            if(data)
            {
                if($scope.billingaddress == true)
                {
                    $scope.billingAddressGstin = data;
                }
                else
                {
                    $scope.customerVatTin = data;
                }
            }
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
            q.resolve(true);
        });
        return q.promise;
    }


    $scope.addStateWiseVat = function(stateWiseVat,customerid,mode) {
        var q = $q.defer();
        //Add state wise VAT/TIN if customer is B2B and VAT/TIN is provided
        var methodType;
        var url;
        if (mode == 'edit')
        {
            methodType = 'PUT';
            url = baseUrl + '/omsservices/webapi/customers/' + customerid + '/vats/' +stateWiseVat.idtableCustomerStateWiseVatId;
        }
        else
        {
            methodType = 'POST';
            url = baseUrl + '/omsservices/webapi/customers/' + customerid + '/vats';
        }

        if(stateWiseVat.tableCustomerStateWiseVatNo != null && stateWiseVat.tableCustomerStateWiseVatNo != undefined && stateWiseVat.tableCustomerStateWiseVatNo != '')
        {
            $http({
                method: methodType,
                url: url,
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


    $scope.saveCustomer = function(customersData,shippingAddress,billingAddress,stateWiseVat,billingAddressGstin)
    {
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
                    if($scope.customersData.tableGstType.idtableGstTypeId != 1)
                    {
                        $scope.addStateWiseVat(stateWiseVat,res.idtableCustomerId,'add').then(function(retval)
                        {
                            if(billingAddressGstin)
                            {
                                $scope.addStateWiseVat(billingAddressGstin,res.idtableCustomerId,'add').then(function(retval)
                                {
                                    $scope.customercreatedsuccessfully();
                                });
                            }
                            else
                            {
                                $scope.customercreatedsuccessfully();
                            }
                        })
                    }
                    else
                    {
                        $scope.customercreatedsuccessfully();
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


    $scope.customercreatedsuccessfully = function()
    {
        if ($scope.modeCustomer == 'normal')
        {
            $scope.listOfCustomerCount($scope.vmPager.currentPage);
        }
        if ($scope.modeCustomer == 'mutual')
        {
            $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
        }
        if ($scope.modeCustomer == 'skuFull')
        {
            $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
        }
        $scope.cancelCustomerData();
    }

    // Edit Customer Data to backend OMS Customer API
    $scope.editCustomerData = function(customersData)
    {
        var putCustomerData = customersData ;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/customers/' + customersData.idtableCustomerId,
            data: putCustomerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res)
            {
                growl.success("Customer updated successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
                $scope.cancelCustomerData();
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to update customer detail");
            }
        });
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

        if (!customersData.tableGstType) {
            growl.error("Select Nature of Customer");
            return false;
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
        if(customersData.tableCustomerLastName){
        if (customersData.tableCustomerLastName.length > 45)
        {
            growl.error("Last name cannot be greater than 45 characters");
            return false;
        }}
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
            growl.error("Please enter a Valid Address Line 1");
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
        if($scope.customersData.tableGstType.idtableGstTypeId != 1)
        {
            if(!$scope.customerVatTin.tableCustomerStateWiseVatNo)
            {
                growl.error("Enter GSTIN");
                return false;
            }
        }
    return true;
    }

    $scope.validateAddressMin = function (address,supportdata,GSTIN)
    {

        if (!address.tableAddress1)
        {
            growl.error("Please enter a valid Address Line 1");
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
        if($scope.customersData.tableGstType.idtableGstTypeId != 1)
        {
            if(!GSTIN)
            {
                growl.error("Enter GSTIN");
                return false;
            }
        }
    return true;
    }

    // ADD Customer Data to backend OMS Customer API
    $scope.saveCustomerData = function(customersData, customerMode)
    {

        if($scope.validateCustomerData(customersData) == true)
        {
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
                                        if($scope.customersData.tableCustomerReturnValue != 'undefined' && $scope.customersData.tableCustomerReturnValue != null && ($scope.customersData.tableCustomerReturnValue > 100 || $scope.customersData.tableCustomerReturnValue < 0)){
                                            growl.error("Return value percentage can not be more than 100 OR less than 0");
                                            return;
                                        }

                                        if($scope.customersData.tableCustomerReturnQuantity != 'undefined' && $scope.customersData.tableCustomerReturnQuantity != null && ($scope.customersData.tableCustomerReturnQuantity > 100 || $scope.customersData.tableCustomerReturnQuantity < 0)){
                                            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
                                            return;
                                        }
                                        if (customerMode == "add") {
                                            if ($scope.validateAddressMin($scope.shippingAddress, $scope.customerAddress,$scope.customerVatTin.tableCustomerStateWiseVatNo) == false) {
                                                return false;
                                            }
                                            if ($scope.genericData.shipAddrBillAddrSame == false) {
                                                if ($scope.validateAddressMin($scope.billingAddress, $scope.customerAddress,$scope.billingAddressGstin.tableCustomerStateWiseVatNo) == false) {
                                                    return false;
                                                }
                                            }
                                            else {
                                                $scope.billingAddress = $scope.shippingAddress;
                                            }
                                            $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
                                            $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

                                            var statewisevat = {};
                                            statewisevat.tableCustomerStateWiseVatNo = $scope.customerVatTin.tableCustomerStateWiseVatNo;
                                            statewisevat.tableState = $scope.customerAddress.stateData;
                                            if($scope.genericData.billingStateData && $scope.customerAddress.stateData.idtableStateId != $scope.genericData.billingStateData.idtableStateId)
                                            {
                                                var billingAddressGstin = {};
                                                billingAddressGstin.tableCustomerStateWiseVatNo = $scope.billingAddressGstin.tableCustomerStateWiseVatNo;
                                                billingAddressGstin.tableState = $scope.genericData.billingStateData;
                                            }

                                            $scope.saveCustomer(customersData, $scope.shippingAddress, $scope.billingAddress, statewisevat,billingAddressGstin);

                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else if (customerMode == "edit"){
                $scope.editCustomerData(customersData);
            }
        }
    };

    //Blacklist customer
    $scope.blacklistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/blacklist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                growl.success("Customer blacklisted successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Error while updating blacklist");
            }
        });
    };

    $scope.whitelistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/whitelist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                growl.success("Customer whitelisted successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Error while updating whiltelist");
            }
        });
    };

    //Closing Add Customer Dialog Box
    $scope.cancelCustomerData = function()
    {
        $mdDialog.hide();
        $scope.customersData = null;
        $scope.genericData.shipAddrBillAddrSame = false;
        $scope.shippingAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddrClicked=false;
        $scope.genericData.billingStateData={};
        $scope.genericData.billingDistrictData={};
        $scope.billingAddressGstin = {}
        $scope.customerVatTin = {};

    };

    //dialog box to add new shipping address
    $scope.addShippingAddress = function(customerData) {

        $scope.customersData = customerData;
        $scope.shipAddressMode = 'add';
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $scope.customerVatTin = {};
        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + $scope.customersData.idtableCustomerId;
        $http.get(customersByIDUrl).success(function(data)
        {
            $scope.customersData = data;
            $scope.shippingAddress.tableAddressContactPerson1 = data.tableCustomerFullName;
            $scope.shippingAddress.tableAddressEmail1 = data.tableCustomerEmail;
            $scope.shippingAddress.tableAddressPhone1 = data.tableCustomerPhone;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });

        $('#shippingAddressModal').modal('show');
    };

    //dialog box to add new billing address
    $scope.addBillingAddress = function(customerData) {

        $scope.customersData = customerData;
        $scope.billAddressMode = 'add';
        $scope.customerAddress = {};
        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + customerData.idtableCustomerId;
        $http.get(customersByIDUrl).success(function(data)
        {
            $scope.customersData = data;
            $scope.customerId = data.idtableCustomerId;
            $scope.customerAddress.contactPersonName = data.tableCustomerFullName;
            $scope.customerAddress.contactEmail = data.tableCustomerEmail;
            $scope.customerAddress.contactPhone = data.tableCustomerPhone;
        }).error(function(error) {
            console.log(error);
        });

        $('#billingAddressModal').modal('show');
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
        statewisevat.tableCustomerStateWiseVatNo = $scope.customerVatTin.tableCustomerStateWiseVatNo;
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
            $scope.shipAddressMode = "add";
            $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'add').then(function(retval)
            {
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
        if($scope.validateAddressMin($scope.billingAddress,$scope.customerAddress,$scope.billingAddressGstin.tableCustomerStateWiseVatNo) == false)
        {
            return;
        }

        var postBillingAddressData = {};
        postBillingAddressData.tableAddress = $scope.billingAddress;

        var statewisevat = {};
        statewisevat.tableCustomerStateWiseVatNo = $scope.billingAddressGstin.tableCustomerStateWiseVatNo;
        statewisevat.tableState = $scope.customerAddress.stateData;

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress',
            data: postBillingAddressData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'add').then(function(retval)
            {
                growl.success("Billing address added successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
                $scope.cancelBillingAddress();
            })


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

    //EDIT shipping address data based on customer id and ship address id
    $scope.editShippingAddressData = function()
    {
        if($scope.validateAddress($scope.shippingAddress,$scope.customerAddress) == false)
        {
            return;
        }
        var statewisevat;
        if($scope.customersData.tableGstType.idtableGstTypeId != 1)
        {
            if($scope.customerVatTin.idtableCustomerStateWiseVatId)
            {
                statewisevat = $scope.customerVatTin;
            }
            else
            {
                statewisevat.tableCustomerStateWiseVatNo = $scope.customerVatTin.tableCustomerStateWiseVatNo;
                statewisevat.tableState = $scope.customerAddress.stateData;
            }
        }

        $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
        $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

        var putShippingAddressData = {};
        putShippingAddressData.tableAddress = $scope.shippingAddress;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/shippingaddress/' + $scope.addressId,
            data: putShippingAddressData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            console.log(res);
            if (res)
            {
                if($scope.customersData.tableGstType.idtableGstTypeId != 1)
                {
                    if($scope.customerVatTin.idtableCustomerStateWiseVatId)
                    {
                        $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'edit');
                    }
                    else
                    {
                        $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'add');
                    }
                }
                growl.success("Shipping address updated");
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
            }
        }).error(function(error,status) {
            console.log(error);
            $scope.cancelShippingAddress();
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Customer Shipping Address Cannot Be Edited");
            }

        });
    }


    //EDIT billing address data based on customer id and ship address id
    $scope.editBillingAddressData = function()
    {
        if($scope.validateAddressMin($scope.billingAddress,$scope.customerAddress,$scope.billingAddressGstin.tableCustomerStateWiseVatNo) == false)
        {
            return;
        }

        var putBillingAddressData = {};
        var statewisevat = {};
        putBillingAddressData.tableAddress = $scope.billingAddress;
        if($scope.customersData.tableGstType.idtableGstTypeId != 1)
        {
            if($scope.billingAddressGstin.idtableCustomerStateWiseVatId)
            {
                statewisevat = $scope.billingAddressGstin;
            }
            else
            {
                statewisevat.tableCustomerStateWiseVatNo = $scope.billingAddressGstin.tableCustomerStateWiseVatNo;
                statewisevat.tableState = $scope.customerAddress.stateData;
            }
        }

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress/' + $scope.addressId,
            data: putBillingAddressData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                if($scope.customersData.tableGstType.idtableGstTypeId != 1)
                {
                    if($scope.billingAddressGstin.idtableCustomerStateWiseVatId)
                    {
                        $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'edit');
                    }
                    else
                    {
                        $scope.addStateWiseVat(statewisevat,$scope.customersData.idtableCustomerId,'add');
                    }
                }

                growl.success("Billing address updated");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
                $scope.cancelBillingAddress();

            }
        }).error(function(error,status) {
            console.log(error);
            $scope.cancelBillingAddress();
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to update billing address");
            }
        });
    }


    //=============================== bulk add customer ======================= //

    $scope.singleCustomerTabMode = function() {
        $scope.singleCustomerTab = true;
        $scope.bulkCustomerTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkCustomerTabMode = function() {
        $scope.singleCustomerTab = false;
        $scope.bulkCustomerTab = true;
    }

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

    $scope.editCustomer = function(ev, customerId) {
        $scope.genericData.customerMode = "edit";
        $scope.returnParamsClicked = false;
        $http.get(baseUrl + '/omsservices/webapi/customers/' + customerId).success(function(response) {
            console.log(response);
            $scope.customersData = response;
            console.log($scope.creationSourceArray);

            $scope.valueInfoId = response.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId;

            if ($scope.customersData != null)
            {
                if($scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.customersData.tableCustomerReturnValue)
                {
                    $scope.genericData.returnType = 'valuebased';
                }
                if(!$scope.customersData.tableCustomerReturnValue && !$scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = "";
                }
                $scope.showCustomerBox(ev);
            }
        });
    };

    $scope.editShippingAddressCustomer = function(customerData, addressId)
    {
        $scope.customersData = customerData;
        $scope.addressId = addressId;
        $scope.shipAddressMode = 'edit';
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $http.get(baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/shippingaddress/' + addressId).success(function(response)
        {
            var stateid = response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId;
            $scope.customerAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', stateid);
            $scope.billingaddress = false;
            $scope.checkVat($scope.customersData.idtableCustomerId,stateid);
            $scope.regionsStatesDistrictArray = [];
            var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateid + "/districts";
            $http.get(regionsStatesDistrictUrl).success(function(data)
            {
                if (data != null)
                {
                    for (var i = 0; i < data.length; i++)
                    {
                        $scope.regionsStatesDistrictArray.push(data[i]);
                        $scope.state = data[i].tableState.tableStateLongName;
                    }
                    $scope.customerAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
                    $scope.shippingAddress = response.tableAddress;
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });

            $scope.regionsStatesDistrictsCityArray = [];
            var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + $scope.customerAddress.stateData.idtableStateId + "/districts/" + response.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities";
            $http.get(regionsStatesDistrictsCityUrl).success(function(data1)
            {
                if (data1 != null)
                {
                    for (var i = 0; i < data1.length; i++)
                    {
                        $scope.regionsStatesDistrictsCityArray.push(data1[i]);
                        $scope.district = data1[i].tableDistrict.tableDistrictLongName;
                    }
                    $scope.shippingAddress.tableCity = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
                    $scope.cityVal = response.tableAddress.tableCity.tableCityLongName;
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });

            $scope.searchLocation = {
                latitude: response.tableAddress.tableAddressLatitude,
                longitude: response.tableAddress.tableAddressLongitude
            }

        });
        $('#shippingAddressModal').modal('show');
    };

    $scope.billingaddress = false;

    $scope.editBillingAddressCustomer = function(customerData, addressId) {
        $scope.customersData = customerData;
        $scope.billAddressMode = 'edit';
        $scope.addressId = addressId;
        $scope.customerAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddressGstin = {};
        $scope.billingaddress = true;
        $http.get(baseUrl + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress/' + addressId).success(function(response) {
            console.log(response);
            var stateid = response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId;
            $scope.checkVat($scope.customersData.idtableCustomerId,stateid);
            $scope.billingAddress = response.tableAddress;
            $scope.customerAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId);
            $scope.regionsStatesDistrictArray = [];
            var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + $scope.customerAddress.stateData.idtableStateId + "/districts";
            $http.get(regionsStatesDistrictUrl).success(function(data)
            {
                if (data != null) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.regionsStatesDistrictArray.push(data[i]);
                        $scope.state = data[i].tableState.tableStateLongName;
                    }
                    console.log($scope.regionsStatesDistrictArray);
                    $scope.customerAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
                    console.log($scope.customerAddress.districtData);
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });

            $scope.regionsStatesDistrictsCityArray = [];
            var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + $scope.customerAddress.stateData.idtableStateId + "/districts/" + response.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities";
            $http.get(regionsStatesDistrictsCityUrl).success(function(data1) {
                if (data1 != null) {
                    for (var i = 0; i < data1.length; i++) {
                        $scope.regionsStatesDistrictsCityArray.push(data1[i]);
                        $scope.district = data1[i].tableDistrict.tableDistrictLongName;
                    }
                    console.log($scope.regionsStatesDistrictsCityArray);
                    $scope.billingAddress.tableCity = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
                    $scope.cityVal = $scope.billingAddress.tableCity.tableCityLongName;
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });

            $('#billingAddressModal').modal('show');

        });
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
    };

    $scope.cancelShippingAddress = function()
    {
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $scope.customerVatTin = {};
        $('#shippingAddressModal').modal('hide');
    };

    $scope.cancelBillingAddress = function()
    {
        $scope.customerAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddressGstin = {};
        $('#billingAddressModal').modal('hide');
    };

    $scope.validatePhone = function(phoneCase) {
        growl.error("Please Enter Valid Phone Number");
        document.myForm.phNo.focus();
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


    $scope.checkEmail = function (customeremail) {
        if(!customeremail){
            growl.error("Please Enter correct Email ID");
            return;
        }
        var q = $q.defer();
        var checkEmailUrl = baseUrl + "/omsservices/webapi/customers/checkemail?email=" + customeremail ;
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

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile) {
        console.log(bulkOrderUploadfile);
        growl.info("Upload is being processed in the background");
        file = bulkOrderUploadfile;
        if (file) {
            if (!file.$error) {
                var uploadUrl = baseUrl + '/omsservices/webapi/customers/customersbulkupload';

                var fd = new FormData();
                fd.append('uploadFile', file);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function(resp) {
                    console.log(resp);
                    if ($scope.modeCustomer == 'normal') {
                        var page = undefined;
                        //$scope.listOfCustomerCount(page);
                    }

                    if ($scope.modeCustomer == 'mutual') {
                        var page = undefined;
                        //$scope.listOfMutualCustomersCount(page);
                    }

                    if ($scope.modeCustomer == 'skuFull') {
                        var page = undefined;
                        //$scope.listOfMutualSkuCount(page);
                    }
                    $mdDialog.hide();
                    $cookies.put('BulkUploadData','customer');
                    $cookies.put('ActiveTab','Customers');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                }, function(error, status)
                {
                    if(status == 400)
                    {
                        growl.error(error.errorMessage);
                    }
                    else
                    {
                        growl.error("Failed to upload file.");
                    }
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };

    $scope.closeBulkUploadDialog = function(){
        console.log("I MA HER");
        $mdDialog.hide();
        $cookies.put('BulkUploadData','customer');
        $cookies.put('ActiveTab','Customers');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }
    

	$scope.masterSkuDialog = function(ev) {

		mastersService.fetchSkus(baseUrl).then(function(data) {
			$scope.genericData.skusListFiltered = data;
			$timeout(function() {
				$mdDialog.show({
					templateUrl : 'dialogmastersku.tmpl.html',
					parent : angular.element(document.body),
					targetEvent : ev,
					clickOutsideToClose : false,
					scope : $scope.$new()
				});
			}, 500);
		});

	}
	
	$scope.selectSku = function(id, ev){		
		
		$http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
	
			$scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		
        }).error(function(error, status) {
            console.log(error);
			
        });	
		
		$scope.cancelmastersDialog(ev);		
	}
	
	$scope.cancelmastersDialog = function(ev){
		$mdDialog.hide({
            templateUrl: 'dialogmastersku.tmpl.html'
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

    $scope.exportCustomers = function () {

        var orderListUrl = baseUrl + "/omsservices/webapi/customers/export";

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
                    growl.error("There is some error in downloading template. Please try after some time.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Customers.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
                growl.error(data.errorMessage);
            }
            else{
                growl.error("There is some error is downloading template. Please try after some time.");
            }

        });

    }


    $scope.downloadCustomerBulkUploadTemplate = function () {

        var orderListUrl = baseUrl + "/omsservices/webapi/customers/bulkuploadtemplate";

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
                    growl.error("There is some error in downloading template. Please try after some time.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Glaucus_Customer_Bulk_Upload_Template.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
                growl.error(data.errorMessage);
            }
            else{
                growl.error("There is some error is downloading template. Please try after some time.");
            }

        });

    }

    $scope.getGstTypes = function()
    {
        $scope.gstTypes = [];
        var gstTypesUrl = baseUrl + "/omsservices/webapi/gsttypes";
        $http.get(gstTypesUrl).success(function(data)
        {
            $scope.gstTypes = data;
        }).error(function(error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to get GST Types");
            }
        });
    }


}
