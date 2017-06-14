myApp.controller('vendorController', vendorController);

vendorController.$inject = ['$rootScope', '$scope', '$http', '$location', 'fileUpload', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService', '$q','downloadVendorsTemplateUrl','Upload','$timeout','$cookies', 'mastersService'];

function vendorController($rootScope, $scope, $http, $location, fileUpload, $mdDialog, $mdMedia, baseUrl, growl, PagerService, $q,downloadVendorsTemplateUrl,Upload,$timeout,$cookies, mastersService) {


    $scope.genericData = {};
	$scope.addressData = {};
    $scope.vendorAddress = {};
    $scope.genericData.enableSorting =  true;
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';
    $scope.searchVendorClicked = false;
    $scope.singleVendorTab = true;
    $scope.singleVendorMode = "add";
    $scope.bulkVendorTab = false;
    //Vendor No
    $scope.firstVendorNo = 1;
    $scope.secVendorNo = 2;
    $scope.thirdVendorNo = 3;
    $scope.fourthVendorNo = 4;
    $scope.fifthVendorNo = 5;

    $scope.downloadVendorsTemplateUrl = baseUrl+'/omsservices/webapi/vendors/vendorbulkuploadtemplate';

    $scope.vendorMode = "add";
    $scope.vendorAddressMode = "add";
    $scope.start = 0;
    $scope.vendorSize = 5;

    $scope.uFirstMode = true;
    $scope.uSecMode = false;
    $scope.uThirdMode = false;
    $scope.uFourthMode = false;
    $scope.uFifthMode = false;
    $scope.pricingtierDetailsClicked = false;
    $scope.unitquantityClicked = false;
    $scope.pricingTiers = [];
    $scope.selectedList = [];
	$scope.mapList = [];
    $scope.vendorSkuMapMode = "add";

    $scope.companyNameEntered = false;
    $scope.personNameEntered = false;
    $scope.phoneNumberEntered = false;
    $scope.emailEntered = false;
	$scope.isVendorSkuCodeEntered = false;

    $scope.isSubmitDisabledMutual = true;
    $scope.isResetDisabledMutual = true;

    $scope.isSubmitDisabledSku = true;
    $scope.isResetDisabledSku = true;

    $scope.isOqmStringValid = false;
    $scope.isMultipierValid = false;
    $scope.isOqmTypeValid = false;

    $scope.sortType = "tableVendorSystemNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.isProductSelected = false;
    $scope.vendorSkuCodeEntered = false;
    $scope.minOrderQtyEntered = false;
    $scope.leadTimeEntered = false;
    $scope.isPTMinQtyEntered = false;
    $scope.isPTMaxQtyEntered = false;
    $scope.isPTPriceEntered = false;
    $scope.leadTimeEntered = false;
    $scope.vendorTypeSelected = false;

    //Shipping/Billing Address Validators
    $scope.isvendorAddressNameValid = false;
    $scope.isvendorAddressEmailValid = false;
    $scope.isvendorAddressPhoneValid = false;
    $scope.isvendorAddressAdLine1Valid = false;
    $scope.isvendorAddressStateValid = false;
    $scope.isvendorAddressDistrictValid = false;
    $scope.isvendorAddressCityValid = false;
    $scope.isvendorAddressPinValid = false;
    $scope.isvendorAddressTinValid = false;
	$scope.isvendorAddressCountryValid = false;

    $scope.skuMapClicked = false;
    $scope.returnParamsClicked = false;
    $scope.shipAddrClicked = false;

    //$scope.genericData = {};
    $scope.genericData.returnType = "";

    $scope.skuMapClickedRow = function(){
        $scope.skuMapClicked = !$scope.skuMapClicked;
    }
    $scope.returnParamsClickedRow = function() {
        $scope.returnParamsClicked = !$scope.returnParamsClicked;
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


    $scope.callDisabledMutual = function() {
        $scope.isSubmitDisabledMutual = false;
    }

    $scope.callDisabledSku = function() {
        $scope.isSubmitDisabledSku = false;
    }

    $scope.vendorSkuData = {
        tableVendorSystemSkuMapIsActive: false,
        tableVendorSystemSkuMapEnableBackOrder: false
    };


    $scope.$on('$routeChangeSuccess', function() {
        // $scope.listOfVendors($scope.start);
        $scope.listOfVendorsCount();
       //$scope.regionsStatesData();
        $scope.qcTrueLists();
		$scope.countriesData();
    });

    $scope.pricingtierDetailRow = function() {
        console.log($scope.pricingtierDetailsClicked);
        $scope.pricingtierDetailsClicked = !$scope.pricingtierDetailsClicked;
    }

    $scope.unittierDetailRow = function() {
        console.log($scope.unitquantityClicked);
        $scope.unitquantityClicked = !$scope.unitquantityClicked;
    }

    $scope.modeVendor = "normal";

    $scope.searchLocation = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    }

    $scope.qcTrueLists = function() {
        $scope.oqmTypes = [];
        $http.get(baseUrl + '/omsservices/webapi/skuuoqmtypes').success(function(response) {
            console.log(response);
            for (var i = 0; i < response.length; i++) {
                $scope.oqmTypes.push(response[i]);
            }
        });
    }

    $scope.searchedProduct = function(selected) {
        console.log(selected);
        $scope.optionsList = [];
        if (selected != null) {
            $scope.isProductSelected = false;
            $scope.skuSelected = selected;
            $scope.skuId = selected.originalObject.idtableSkuId;
            $http.get(baseUrl + '/omsservices/webapi/skus/' + $scope.skuSelected.originalObject.idtableSkuId + '/uoqmconfigs').success(function(response) {
                console.log(response);
                for (var i = 0; i < response.length; i++) {
                    $scope.optionsList.push({
                        oqmStr: response[i].tableSkuUoqmType.tableSkuUoqmTypeString,
                        oqmData: response[i]
                    });
                }
            });
            $scope.callDisabledSku();
        } else {
            $scope.isProductSelected = true;
        }
        
    }

    $scope.searchedProductForFilter = function(selected)
    {
        if (selected != null)
        {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }

    }
	
	$scope.productObject = function(selected) {
        if (selected != null) {
            console.log(selected);
            $scope.isProductSelected = false;
            $scope.genericData.productObject = selected.originalObject;            
        } else {
            $scope.isProductSelected = true;
        }
    }
	
	//remove the product
    $scope.removeMap = function(index) {
        $scope.mapList.splice(index, 1);
    };
	
	// adding the product in table one by one
    $scope.createMap = function(tableSku, vendorSkuCode) {
		
		if (!tableSku) {
            growl.error("Please select a Product first!");
            $scope.isProductSelected = true;
        } else if (!vendorSkuCode) {
            growl.error("Please enter vendor SKU code");
            $scope.isVendorSkuCodeEntered = true;
        }else{
	
		tableSku = $scope.genericData.productObject;
	
		var tempObject = {
                    
                    "tableSku": tableSku,
                    "tableVendor": null,
					"tableVendorSystemSkuMapVendorSkuCode": vendorSkuCode,
					"tableVendorSystemSkuMapMinOrderQty" : 0,
					"tableVendorSystemSkuMapLeadTime" : 0,
					"tableVendorSystemSkuMapIsActive" : true,
					"tableVendorSystemSkuMapEnableBackOrder" : false,
					"tableVendorSkuPricingTierses" : [],
					"tableVendorSkuUoqmses" : []					
                };
		
		
		var dirty = false;

            for (var i = 0; i < $scope.mapList.length; i++) {
                if ($scope.mapList[i].tableSku.idtableSkuId == tableSku.idtableSkuId) {
                    dirty = true;
                }
            }


            if (dirty) {
                growl.error("The selected SKU is already part of the current vendor.");
                $scope.isProductSelected = true;
            } else {
                $scope.mapList.push(tempObject);
                console.log($scope.mapList);
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                tableSku = null;
                $scope.genericData.productObj = null;
                $scope.genericData.vendorSkuCode = null;
                $scope.isProductSelected = false;
                $scope.isVendorSkuCodeEntered = false;
                $scope.genericData.productObject = undefined;
            }

		}
    };

    $scope.saveOqmConfig = function(m, t, s) {
        if (!m) {
            growl.error("Please enter the Oqm Config Multiplier Value.");
            $scope.isMultipierValid = true;
        } else {
            $scope.isMultipierValid = false;
            $scope.multiplier = m;
            if (!t) {
                growl.error("Please enter the Oqm Type.");
                $scope.isOqmTypeValid = true;
            } else {
                $scope.isOqmTypeValid = false;
                console.log(m, t, s);
                var data = {
                    "tableSkuUoqmConfigBaseMultiplier": m,
                    "tableSkuUoqmType": JSON.parse(t)
                }

                console.log(data);
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/skus/' + s.originalObject.idtableSkuId + '/uoqmconfigs',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    console.log(res);
                    if (res != null) {
                        growl.success("New Configuraton Added Successfully");
                        $scope.searchedProduct(s);
                    }
                    $('#myModal1').modal('hide');
                });
            }
        }
    }

    $scope.saveOqmString = function(oqmString) {
        if (!oqmString) {
            growl.error("Please enter the Oqm Type String");
            $scope.isOqmStringValid = true;
        } else {
            var data = {
                "tableSkuUoqmTypeString": oqmString
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/skuuoqmtypes',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res != null) {
                    growl.success("New Oqm Type Sting Added Successfully");
                    $scope.isOqmStringValid = false;
                    $scope.qcTrueLists();
                }
                $('#myModal2').modal('hide');
            });
        }
    }

    $scope.addVendorSkuGetId = function(id) {
        $scope.vendorSkuMapMode = "add";
        $scope.PT = [];
        $scope.vendorId = id;
    };

    $scope.removeProduct = function(index) {
        $scope.pricingTiers.splice(index, 1);
    };

    $scope.addPricingtier = function() {
        if (!$scope.PT) {
            growl.error("Please enter the Minimum Quantity");
            $scope.isPTMinQtyEntered = true;
        } else {
            var min = $scope.PT.tableVendorSkuPricingTiersQtyMin;
            var max = $scope.PT.tableVendorSkuPricingTiersQtyMax;
            var price = $scope.PT.tableVendorSkuPricingTiersPrice;

            if (!min) {
                growl.error("Please enter the Minimum Quantity");
                $scope.isPTMinQtyEntered = true;
            } else if (min < 1) {
                growl.error("Minimum Quantity should be greater than 0");
                $scope.isPTMinQtyEntered = true;
            }else if (max < min) {
                growl.error("Maximum Quantity should be greater than the Minimum Quantity");
                $scope.isPTMaxQtyEntered = true;
            } else if (!price) {
                growl.error("Please enter the Price");
                $scope.isPTPriceEntered = true;
            } else if (price < 1) {
                growl.error("Price should be greater than 0");
                $scope.isPTPriceEntered = true;
            } else {
                $scope.pricingTiers.push({
                    "tableVendorSkuPricingTiersQtyMin": min,
                    "tableVendorSkuPricingTiersQtyMax": max,
                    "tableVendorSkuPricingTiersPrice": price
                });
                growl.success("Pricing Tier Added");
                $scope.PT = [];
            }
        }
    };

    // fetching list of vendors from RestAPI OMS
    $scope.listOfVendors = function(start) {
        console.log($scope.start);
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors";
        vendorsListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            $scope.vendorsLists = data;
            console.log(data);
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);

        });
    }

    $scope.listOfVendorsCount = function(page) {
        console.log(page);
        var vendorCountUrl = baseUrl + "/omsservices/webapi/vendors/count";
        $http.get(vendorCountUrl).success(function(data) {
            $scope.vendorCount = data;
            console.log($scope.vendorCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }
                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.vendorstart = (vm.pager.currentPage - 1) * 5;
                    $scope.vendorsize = $scope.vendorstart + 5;
                    console.log($scope.vendorstart);
                    console.log($scope.vendorSize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfVendors($scope.vendorstart);
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

        });
    }


    //fetching list of mutual vendors from mutually exlusive search string vendor
    $scope.listOfMutualVendors = function(start) {
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors/search?search=" + $scope.wordSearch;
        vendorsListUrl += "&start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);

        });
    }

    //fetching list of mutual vendors count
    $scope.listOfMutualVendorsCount = function(page) {
            var vendorCountUrl = baseUrl + "/omsservices/webapi/vendors/searchcount?search=" + $scope.wordSearch;
            console.log("Vendor MAIN COUNT URL");
            console.log(vendorCountUrl);
            $http.get(vendorCountUrl).success(function(data) {
                $scope.vendorCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
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

                        $scope.vendorstart = (vm.pager.currentPage - 1) * 5;
                        $scope.vendorsize = $scope.vendorstart + 5;
                        console.log($scope.vendorstart);
                        console.log($scope.vendorSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfMutualVendors($scope.vendorstart);
                    }
                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        //fetchng list of vendors mutual count ends here

    //fetching list of skumap vendors
    $scope.listOfSkuMapVendors = function(start) {
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors/0/skumap/" + $scope.skuId + "/vendorsearch";
        vendorsListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            $scope.vendorsLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(error);

        });
    }

    //fetching list of skumap vendors count
    $scope.listOfSkuMapVendorsCount = function(page) {
            var vendorCountUrl = baseUrl + "/omsservices/webapi/vendors/0/skumap/" + $scope.skuId + "/vendorsearchcount";
            console.log("Vendor MAIN COUNT URL");
            console.log(vendorCountUrl);
            $http.get(vendorCountUrl).success(function(data) {
                console.log(data);
                $scope.vendorCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
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

                        $scope.vendorstart = (vm.pager.currentPage - 1) * 5;
                        $scope.vendorsize = $scope.vendorstart + 5;
                        console.log($scope.vendorstart);
                        console.log($scope.vendorSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfSkuMapVendors($scope.vendorstart);
                    }
                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        //fetchng list of kumap vendors count ends here

    //clear action for vendor mutual search
    $scope.clearMutualVendorAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.vendorstart = 0;
        $scope.modeVendor = "normal";
        // $scope.listOfVendors($scope.vendorstart);
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfVendorsCount(page);
    }

    $scope.clearSkuMapVendorAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.vendorstart = 0;
        $scope.modeVendor = "normal";
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfVendorsCount(page);
    }

    //submit vendor action mutual sku
    $scope.submitvendorAction = function(wordSearch) {

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
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false; // set the default sort order
        $scope.wordSearch = wordSearch;
        $scope.modeVendor = "mutual";
        // $scope.listOfMutualVendors();
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfMutualVendorsCount(page);
    }

    $scope.submitSkuMapCendorAction = function(skuId)
    {
        if($scope.skuId == null || $scope.skuId == undefined)
        {
            growl.error('Select SKU first');
            return;
        }
        console.log(skuId);
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false; // set the default sort order
        $scope.skuId = skuId;
        $scope.modeVendor = "skumap";
        // $scope.listOfSkuMapVendors();
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfSkuMapVendorsCount(page);
    }

    $scope.newChanged = function(str) {
        console.log(str);
        if (str != null) {
            $scope.isSubmitDisabledSku = true;
        }
    }
        //opening and closing search accordian
    $scope.toggleSearchRow = function() {
            console.log($scope.searchVendorClicked);
            $scope.searchVendorClicked = !$scope.searchVendorClicked;
        }
        //opening and closing search accordian ends here

    //expansion and collapsing of vendor rows data
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";
    
    $scope.tableRowExpanded1 = false;
    $scope.tableRowIndexExpandedCurr1 = "";
    $scope.tableRowIndexExpandedPrev1 = "";
    $scope.storeIdExpanded1 = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.selectTableRow = function(index, storeId) {
        console.log(storeId);
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
    //expansion and collapsing of vendor rows data ends here
	$scope.regionsStatesArray = [];
    //Regions Data from region generic API
    $scope.regionsStatesData = function(countryid) {        
        var regionsStatesUrl = baseUrl + "/omsservices/webapi/countries/"+countryid+"/states";
        $http.get(regionsStatesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.regionsStatesArray.push(data[i]);
            }
            console.log($scope.regionsStatesArray);
        }).error(function(error, status) {
            console.log(error);

        });
    };
	
	 $scope.countriesData = function() {
        $scope.countriesArray = [];
        var countriesUrl = baseUrl + "/omsservices/webapi/countries";
        $http.get(countriesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.countriesArray.push(data[i]);
            }
            console.log($scope.countriesArray);
        }).error(function(error, status) {
            console.log(error);

        });
    };

	$scope.countriesStatesData = function(countryData){
	    if(!countryData){
            $scope.countryChanged(countryData);
        }
        else{
            $scope.countryChanged(countryData);
            $scope.countryChanged(countryData);
            $scope.regionsStatesArray = [];
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictsCityArray = [];

            $scope.regionsStatesData(countryData.idtableCountryId);
        }

	}
	
	$scope.regionsStatesDistrictArray = [];
    //Regions Data from region states generic API
    $scope.regionsStatesDistrictData = function(stateData,vendorId) {
        if(!stateData){
            $scope.stateChanged(stateData);
        }
        else{
            $scope.stateChanged(stateData);
            $scope.stateChanged(stateData);
            $scope.state = stateData.tableStateLongName;
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.getLatitudeLongitude($scope.showResult ).then(function(v) {
                    if (v || !v) {
                        console.log(v);
                        console.log(stateData);
                        $scope.stateId = stateData.idtableStateId;

                        var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                        $http.get(regionsStatesDistrictUrl).success(function(data) {
                            if (data != null) {
                                for (var i = 0; i < data.length; i++) {
                                    $scope.regionsStatesDistrictArray.push(data[i]);
                                }
                                console.log($scope.regionsStatesDistrictArray);
                                $scope.vendorAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', stateData.idtableDistrictId);
                                console.log($scope.vendorAddress.districtData);
                                if(vendorId) $scope.getTinNo(vendorId, stateData);

                            }
                        }).error(function(error, status) {
                            console.log(error);
                            console.log(status);

                        });
                    }
                },
                function(err) {}
            );
        }

    };
	$scope.regionsStatesDistrictsCityArray = [];
    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        if (districtData) {
            $scope.districtChanged(districtData);
            $scope.district = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        
                        $scope.districtId = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data) {
                            for (var i = 0; i < data.length; i++) {
                                $scope.regionsStatesDistrictsCityArray.push(data[i]);
                            }
                            console.log($scope.regionsStatesDistrictsCityArray);

                        }).error(function(error, status) {
                            console.log(error);

                        });
                    }
                },
                function(err) {}
            );
        }
        else{
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.districtChanged(districtData);
        }
    };

    $scope.changeCity = function(city) {
        if (city) {
            $scope.cityChanged(city);
            $scope.cityVal = city.tableCityLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {},
                function(err) {}
            );
        }
        else{
            $scope.cityChanged(city);
        }
    };

    //vendor add dialog box
    $scope.showvendorAddBox = function(ev) {
        $scope.singleVendorTab = true;
        $scope.bulkVendorTab = false;
        $scope.companyNameEntered = false;
        $scope.personNameEntered = false;
        $scope.phoneNumberEntered = false;
        $scope.emailEntered = false;
        if ($scope.vendorMode == 'add') {
            $scope.vendorsData = null;
        }
        $mdDialog.show({
                templateUrl: 'dialog2.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })

    };
	
	$scope.showVendorAddressEntityDialog = function(ev, entity){		
			
		var check = 0;
			
		if(entity == 'State' && $scope.vendorAddress.countryData == null){
			growl.error("Select country first.");
			check = 1;
		}else if(entity == 'District' && $scope.vendorAddress.stateData == null){
			growl.error("Select state first.");
			check = 1;
		}else if(entity == 'City' && $scope.vendorAddress.districtData == null){
			growl.error("Select district first.");
			check = 1;
		}
			
		if(check == 0){
		
			$scope.addressEntity = entity;
		
			$('#vendorAddressModal').modal('hide');
		
			$mdDialog.show({
                templateUrl: 'dialog4.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
		}
	}
	
	$scope.saveAddressEntity = function(addressData){

        if (addressData == null || addressData.entity == null || addressData.entity.length == 0) {
            growl.error($scope.addressEntity + " can't be empty.");
        } else {
            if ($scope.addressEntity == 'Country') {
                var countryObj = {
                    "idtableCountryId": 1,
                    "tableCountryShortName": $scope.addressData.entity,
                    "tableCountryLongName": $scope.addressData.entity,
                    "tableSkus": [],
                    "tableStates": []
                }

                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/countries',
                    data: countryObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        growl.success("Country added successfully.");

                        $scope.addressData.countryObjectID = res.idtableCountryId;

                        $scope.countriesArray.push(res);
                        $scope.vendorAddress.countryData = res;
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("There is some error in adding country. Please try again!");
                    }
                });

            } else if ($scope.addressEntity == 'State') {

                if ($scope.vendorAddress.countryData == null) {
                    growl.error("Please select country first.");
                }

                var stateObj = {
                    "idtableStateId": 1,
                    "tableCountry": $scope.vendorAddress.countryData,
                    "tableStateShortName": $scope.addressData.entity,
                    "tableStateLongName": $scope.addressData.entity,
                    "tableStateTags": null,
                    "tableDistricts": [],
                    "tableClientWarehouseStateMappings": [],
                    "tableVendorStateWiseVats": [],
                    "tableClientStateWiseVats": [],
                    "tableTaxClasses": []
                }

                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/countries/1/states',
                    data: stateObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        growl.success("State added successfully.");

                        $scope.addressData.stateObjectID = res.idtableStateId;

                        $scope.regionsStatesArray.push(res);
                        $scope.vendorAddress.stateData = res;
                        console.log($scope.vendorAddress.stateData);
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("There is some error in adding state. Please try again!");
                    }
                });
            } else if ($scope.addressEntity == 'District') {

                if ($scope.vendorAddress.stateData == null) {
                    growl.error("Please select state first.");
                }

                var districtObj = {
                    "idtableDistrictId": 1,
                    "tableState": $scope.vendorAddress.stateData,
                    "tableDistrictShortName": $scope.addressData.entity,
                    "tableDistrictLongName": $scope.addressData.entity,
                    "tableDistrictTags": null,
                    "tableCities": []
                }

                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/countries/1/states/1/districts',
                    data: districtObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        growl.success("District added successfully.");

                        $scope.addressData.districtObjectID = res.idtableDistrictId;

                        $scope.regionsStatesDistrictArray.push(res);
                        $scope.vendorAddress.districtData = res;
                        console.log($scope.vendorAddress.districtData);
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("There is some error in adding district. Please try again!");
                    }
                });

            } else if ($scope.addressEntity == 'City') {

                if ($scope.vendorAddress.districtData == null) {
                    growl.error("Please select district first.");
                }

                var cityObj = {
                    "idtableCityId": 1,
                    "tableDistrict": $scope.vendorAddress.districtData,
                    "tableCityShortName": $scope.addressData.entity,
                    "tableCityLongName": $scope.addressData.entity,
                    "tableCityTags": null,
                    "tableAddresses": [],
                    "tablePincodes": []
                }

                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/countries/1/states/1/districts/1/cities',
                    data: cityObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        growl.success("City added successfully.");

                        $scope.addressData.cityObjectID = res.idtableCityId;

                        $scope.regionsStatesDistrictsCityArray.push(res);
                        $scope.vendorAddress.city = res;
                        console.log($scope.vendorAddress.city);
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("There is some error in adding City. Please try again!");
                    }
                });

            }

            $scope.addressData.entity = '';
            $('#vendorAddressModal').modal('show');
        }
	}
	
	$scope.cancelAddressData = function(){
		
		$scope.addressData = null;
		
		$mdDialog.hide({
		templateUrl: 'dialog4.tmpl.html'});
		
		$('#vendorAddressModal').modal('show');
		
	}
	
	$scope.showSkuMapWithVendorDialog = function(ev, vendorId, indexOfvendor){
		$scope.genericData.vendorId = vendorId;
		$scope.genericData.index = indexOfvendor;
		$mdDialog.show({
                templateUrl: 'dialog3.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
	}
	
    //vendor add dialog box ends here

    $scope.companyNameChanged = function(val) {
        if (val) {
            $scope.companyNameEntered = false;
        } else {
            $scope.companyNameEntered = true;
        }
    };

    $scope.vendorTypeChanged = function(val) {
        if (val) {
            $scope.vendorTypeSelected = false;
        } else {
            $scope.vendorTypeSelected = true;
        }
    };

    $scope.personNameChanged = function(val) {
        if (val) {
            $scope.personNameEntered = false;
        } else {
            $scope.personNameEntered = true;
        }
    };

    $scope.phoneNumberChanged = function(val) {
        if (val) {
            $scope.phoneNumberEntered = false;
        } else {
            $scope.phoneNumberEntered = true;
        }
    };
    $scope.addressLineChanged = function(val) {
        if (val) {
            $scope.addressLineEntered = false;
        } else {
            $scope.addressLineEntered = true;
        }
    };
    $scope.countryChanged = function(val) {
        if (val) {
            $scope.countryEntered = false;
        } else {
            $scope.countryEntered = true;
        }
    };
    $scope.stateChanged = function(val) {
        if (val) {
            $scope.stateEntered = false;
        } else {
            $scope.stateEntered = true;
        }
    };
    $scope.districtChanged = function(val) {
        if (val) {
            $scope.districtEntered = false;
        } else {
            $scope.districtEntered = true;
        }
    };
    $scope.cityChanged = function(val) {
        if (val) {
            $scope.cityEntered = false;
        } else {
            $scope.cityEntered = true;
        }
    };
    $scope.pincodeChanged = function(val) {
        if (val) {
            $scope.pincodeEntered = false;
        } else {
            $scope.pincodeEntered = true;
        }
    };
    $scope.tinnoChanged = function(val) {
        if (val) {
            $scope.tinnoEntered = false;
        } else {
            $scope.tinnoEntered = true;
        }
    };

    $scope.leadTimeChanged = function(val) {
        if (val) {
            $scope.leadTimeEntered = false;
        } else {
            $scope.leadTimeEntered = true;
        }
    }

    $scope.emailChanged = function(val) {
        if (val) {
            $scope.emailEntered = false;
        } else {
            $scope.emailEntered = true;
        }
    };

    //add vendor data to database OMS Api
    $scope.savevendorData = function(vendorsData) {
        if (!vendorsData) {
            growl.error("Please enter a Vendor Code!");
        } else {
            $scope.checkVendorCode(vendorsData.tableVendorClientVendorCode).then(
                function(v) {
                    if (v) {
                        if (!vendorsData.tableVendorName) {
                            $scope.companyNameEntered = true;
                            growl.error("Please enter a Company Name!");
                        } else {
                            $scope.checkCompany(vendorsData.tableVendorName).then(
                                function(v) {
                                    if (v) {
                                        if (!vendorsData.tableVendorContactPerson) {
                                            $scope.personNameEntered = true;
                                            growl.error("Please enter a Contact Person Name!");
                                        }
                                         else if (!vendorsData.tableVendorEmailId) {
                                            $scope.emailEntered = true;
                                            growl.error("Please enter Valid Email Id!");
                                        } else if (!vendorsData.tableVendorPhoneNumber) {
                                            $scope.phoneNumberEntered = true;
                                            growl.error("Please enter a valid 10-12 digit Phone Number!");
                                        } else if (vendorsData.tableVendorPhoneNumber.length < 10 || vendorsData.tableVendorPhoneNumber.length > 12) {
                                            $scope.phoneNumberEntered = true;
                                            growl.error("Please enter a valid 10-12 digit Phone Number!");
                                        } else if (!$scope.vendorsTypeData.tableVendorType){
                                            $scope.vendorTypeSelected = true;
                                            growl.error("Please select vendor type!");
                                        } else if (!$scope.vendorAddress.adLine1 && $scope.vendorMode != 'edit'){
                                            $scope.addressLineEntered = true;
                                            growl.error("Please enter a valid address!");
                                        } else if (!$scope.vendorAddress.countryData && $scope.vendorMode != 'edit'){
                                            $scope.countryEntered = true;
                                            growl.error("Please select your country!");
                                        } else if (!$scope.vendorAddress.stateData && $scope.vendorMode != 'edit'){
                                            $scope.stateEntered = true;
                                            growl.error("Please select your state!");
                                        } else if (!$scope.vendorAddress.districtData && $scope.vendorMode != 'edit'){
                                            $scope.districtEntered = true;
                                            growl.error("Please select your district!");
                                        } else if (!$scope.vendorAddress.city && $scope.vendorMode != 'edit'){
                                            $scope.cityEntered = true;
                                            growl.error("Please select your city!");
                                        }  else if (!$scope.vendorAddress.pincode && $scope.vendorMode != 'edit') {//check here for alphanumeric pincode
                                            $scope.pincodeEntered = true;
                                            growl.error("Please enter Pin Code!");

                                            //$scope.isvendorAddressPinValid = true;
                                        } else if (!$scope.vendorAddress.tinNo && $scope.vendorMode != 'edit') {
                                            $scope.tinnoEntered = true;
                                            growl.error("Please enter valid Tin No!");
                                            //$scope.isvendorAddressTinValid = true;
                                        }
                                        //else if (!vendorsData.tableVendorDefaultLeadTimeDays) {
                                        //     $scope.leadTimeEntered = true;
                                        //     growl.error("Please enter a valid Lead Time in Days!");
                                        // } 
                                        else {
                                            $scope.checkPhone(vendorsData.tableVendorPhoneNumber).then(
                                                function(v) {
                                                    if (v) {
                                                        if(vendorsData.tableVendorReturnValuePercentage != 'undefined' && vendorsData.tableVendorReturnValuePercentage != null && (vendorsData.tableVendorReturnValuePercentage > 100 || vendorsData.tableVendorReturnValuePercentage < 0)){
                                                            growl.error("Return value percentage can not be more than 100 OR less than 0");
                                                            return;
                                                        }

                                                        if(vendorsData.tableVendorReturnQuantity != 'undefined' && vendorsData.tableVendorReturnQuantity != null && (vendorsData.tableVendorReturnQuantity > 100 || vendorsData.tableVendorReturnQuantity < 0)){
                                                            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
                                                            return;
                                                        }
                                                        if ($scope.vendorMode == "add") {
                                                            $scope.saveVendor(vendorsData);
                                                        } else if ($scope.vendorMode == "edit") {
                                                            $scope.editVendorData(vendorsData);
                                                        }
                                                    }
                                                },
                                                function(err) {}
                                            );
                                        }
                                    }
                                },
                                function(err) {}
                            );
                        }


                    }
                },
                function(err) {}
            );
        }

    };
    //add vendor data to database OMS Api ends here

    $scope.getAllVendorTypes = function () {
        $scope.vendorsTypes = [];
        var vendorsTypeListUrl = baseUrl + "/omsservices/webapi/vendors/vendortypes/";
        // console.log(channelListUrl);
        $http.get(vendorsTypeListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsTypesLists = data;
            for (var i = 0; i < $scope.vendorsTypesLists.length; i++) {
                $scope.vendorsTypes.push($scope.vendorsTypesLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });
    }

    $scope.getAllVendorTypes();

    $scope.vendorsTypeData = {};

    $scope.saveVendor = function(vendorsData) {
        var postVendorData = vendorsData;
        postVendorData.tableCreditDays= {
                "idtableCreditDaysId": 1,
                "tableCreditDaysString": "1 week",
                "tableCreditDaysNoOfDays": 7
            };
        postVendorData.tableCurrencyCode= {
                "idtableCurrencyCodeId": 1,
                "tableCurrencyCodeShortname": "INR",
                "tableCurrencyCodeLongname": "Indian Rupee"
            };
        postVendorData.tableVendorStatusType = {
                "idtableVendorStatusTypeId": 1,
                "tableVendorStatusTypeString": "Active"
            };

        postVendorData.tableVendorType = $scope.vendorsTypeData.tableVendorType;

        $scope.vendorAddress.contactPersonName = postVendorData.tableVendorContactPerson;
        $scope.vendorAddress.contactEmail = postVendorData.tableVendorEmailId;
        $scope.vendorAddress.contactPhone = postVendorData.tableVendorPhoneNumber;

        console.log(postVendorData.tableVendorType);

        console.log(postVendorData);

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/vendors',
            data: postVendorData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                console.log($scope.vendorstart);
                $scope.vendorMode = 'add';
                $scope.vendorsData = null;
                growl.success("New Vendor Added Successfully")
                if ($scope.modeVendor == "normal") {
                    // $scope.listOfVendors($scope.vendorstart);`
                    $scope.listOfVendorsCount($scope.vmPager.currentPage);
                }
                if ($scope.modeVendor == "mutual") {
                    // $scope.listOfMutualVendors($scope.vendorstart);
                    $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                }
                if ($scope.modeVendor == "skumap") {
                    // $scope.listOfSkuMapVendors($scope.vendorstart);
                    $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                }
               
				$scope.genericData.vendorObject = res;

                if($scope.mapList.length != 0) {
                    $scope.makeSkusMapWithVendor($scope.genericData.vendorObject.idtableVendorId, $scope.mapList);
                }
                $scope.vendorId = $scope.genericData.vendorObject.idtableVendorId;



                $scope.saveShippingAddressData();
					// $mdDialog.hide();
				$scope.cancelvendorData();
            }
        }).error(function(error, status) {
            console.log(error);

            $mdDialog.hide();
        });
    };
	
	$scope.makeSkusMapWithVendor = function(vendorId, listOfSkusObjects){
		 
		 //alert(listOfSkusObjects);
		 
		 $http({
						method: 'POST',
						url: baseUrl + '/omsservices/webapi/vendors/'+$scope.genericData.vendorObject.idtableVendorId+'/skumap/createmaps',
						data: listOfSkusObjects,
						headers: {
									'Content-Type': 'application/json'
								}
						}).success(function(res) {	
						
						growl.success("New Vendor SKU created Successfully");
						
						});
						
						
	}
	
	$scope.makeSkusMapWithVendor2 = function(vendorId, listOfSkusObjects, index){
		 
		 //alert(listOfSkusObjects);
		 
		 $http({
						method: 'POST',
						url: baseUrl + '/omsservices/webapi/vendors/'+vendorId+'/skumap/createnewmaps',
						data: listOfSkusObjects,
						headers: {
									'Content-Type': 'application/json'
								}
						}).success(function(res) {	
						
						growl.success("New Vendor SKU created Successfully");
						
						$scope.cancelvendorData();
						$scope.selectTableRow(index, vendorId);
						
						}).error(function(error, status) {
										console.log(error);
										mdDialog.hide();
									});
						
						
	}
	
	

    //opening dialog box in edit mode
    $scope.editVendor = function(ev, vendorId) {

            $scope.vendorMode = "edit";
            $http.get(baseUrl + '/omsservices/webapi/vendors/' + vendorId).success(function(response)
            {
                console.log(response);

                $scope.vendorsData = response;
                $scope.vendorsTypeData.tableVendorType =  response.tableVendorType;

                if($scope.vendorsData.tableVendorReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.vendorsData.tableVendorReturnValuePercentage)
                {
                    $scope.genericData.returnType = 'valuebased';
                }
                if(!$scope.vendorsData.tableVendorReturnValuePercentage && !$scope.vendorsData.tableVendorReturnQuantity)
                {
                    $scope.genericData.returnType = "";
                }
                $scope.mapList = response.tableVendorSystemSkuMaps;
                $scope.originalVendorCode = response.tableVendorClientVendorCode;
                $scope.originalCompanyName = response.tableVendorName;
                $scope.originalContactPersonName = response.tableVendorContactPerson;
                $scope.originalPhoneNumber = response.tableVendorPhoneNumber;
                if ($scope.vendorsData != null) {
                    $scope.showvendorAddBox(ev);
                }
            });
        }
        //opening dialog box in edit mode ends here

    // Edit Vendor Data when clicking on update button to backend OMS Customer API
    $scope.editVendorData = function(vendorsData) {
        console.log(vendorsData);
        console.log(vendorsData.idtableVendorId);
        vendorsData.tableVendorAddresses = [];
        vendorsData.tableVendorStateWiseVats = [];
        vendorsData.tableVendorWarehouseLists = [];
        vendorsData.tableVendorDocLists = [];
        vendorsData.tableSkuInventories = [];
        vendorsData.tablePurchaseOrders = [];
        vendorsData.tableVendorSystemSkuMaps = [];
        var putVendorData = vendorsData;
        putVendorData.tableCreditDays= {
            "idtableCreditDaysId": 1,
            "tableCreditDaysString": "1 week",
            "tableCreditDaysNoOfDays": 7
        };
        putVendorData.tableCurrencyCode= {
            "idtableCurrencyCodeId": 1,
            "tableCurrencyCodeShortname": "INR",
            "tableCurrencyCodeLongname": "Indian Rupee"
        };
        putVendorData.tableVendorStatusType = {
            "idtableVendorStatusTypeId": 1,
            "tableVendorStatusTypeString": "Active"
        };
        putVendorData.tableVendorType = $scope.vendorsTypeData.tableVendorType;
            console.log(putVendorData);

            $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/vendors/' + vendorsData.idtableVendorId,
                data: putVendorData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.vendorMode = 'add';
                    $scope.vendorsData = null;
                    growl.success("Vendor Edited Successfully");
                    if ($scope.modeVendor == "normal") {
                        // $scope.listOfVendors($scope.vendorstart);`
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        // $scope.listOfMutualVendors($scope.vendorstart);
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        // $scope.listOfSkuMapVendors($scope.vendorstart);
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }

                    $scope.genericData.vendorObject = res;

                    if($scope.mapList.length != 0) {
                        $scope.makeSkusMapWithVendor($scope.genericData.vendorObject.idtableVendorId, $scope.mapList);
                    }
                    // $mdDialog.hide();
                    $scope.cancelvendorData();
                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        // Edit Vendor Data when clicking on update button to backend OMS Customer API ends here

    $scope.cancelvendorData = function() {
        $scope.vendorMode = 'add';
        $scope.vendorsData = null;
		$scope.genericData.vendorId = null;
		$scope.genericData.index = null;
		$scope.mapList = [];
        $mdDialog.hide();
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isProductSelected = false;
        $scope.vendorAddress = {};
    }

    //VENDOR ADDRESS SCREEN CONTROLLER CODE

    //dialog box to add new shipping address
    $scope.addAddress = function(vendorId) {
        console.log(vendorId);

        $scope.vendorAddress = {};
        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        $scope.vendorId = vendorId;
        if ($scope.vendorAddressMode == 'add') {
            var customersByIDUrl = baseUrl + "/omsservices/webapi/vendors/" + vendorId;
            $http.get(customersByIDUrl).success(function(data) {
                $scope.vendorId = data.idtableVendorId;
                $scope.vendorAddress.contactPersonName = data.tableVendorContactPerson;
                $scope.vendorAddress.contactEmail = data.tableVendorEmailId;
                $scope.vendorAddress.contactPhone = data.tableVendorPhoneNumber;
            }).error(function(error, status) {
                console.log(error);

            });
        }
        $('#vendorAddressModal').modal('show');
    }

    //saving shipping address data based on customer id
    $scope.saveShippingAddressData = function() {
        var latitude = $scope.searchLocation.latitude;
        var longitude = $scope.searchLocation.longitude;
        var tinMode = $scope.tinMode;
        var vatNo = $scope.vendorAddress.tinNo;
        var stateData = $scope.vendorAddress.stateData;
		
		var countryData = $scope.vendorAddress.countryData;
		
        console.log(tinMode);
        if (!$scope.vendorAddress) {
            growl.error("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactPersonName) {
            growl.error("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactEmail) {
            growl.error("Please enter a valid Email Address");
            $scope.isvendorAddressEmailValid = true;
        } else if (!$scope.vendorAddress.contactPhone) {
            $scope.isvendorAddressPhoneValid = true;
            growl.error("Please enter a valid 10-12 digit Phone Number!");
        } else if ($scope.vendorAddress.contactPhone.length < 10 || $scope.vendorAddress.contactPhone.length > 12) {
            $scope.isvendorAddressPhoneValid = true;
            growl.error("Please enter a valid 10-12 digit Phone Number!");
        } else if (!$scope.vendorAddress.adLine1) {
            growl.error("Please enter a valid Address");
            $scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.stateData) {
            growl.error("Please choose state from the available states!");
            $scope.isvendorAddressStateValid = true;
        } else if (!$scope.vendorAddress.districtData) {
            growl.error("Please choose district from the available districts!");
            $scope.isvendorAddressDistrictValid = true;            
        } else if (!$scope.vendorAddress.city) {
            growl.error("Please choose city from the available cities!");
            $scope.isvendorAddressCityValid = true;            
        } else if (!$scope.vendorAddress.pincode) {//check here for alphanumeric pincode
            growl.error("Please enter Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        } else if (!$scope.vendorAddress.tinNo) {
            growl.error("Please enter valid Tin No!");
            $scope.isvendorAddressTinValid = true;            
        }
        else 
        {
            var postShippingAddressData = {
                "tableAddress": {
                    "idtableAddressId": 1,
                    "tableAddress1": $scope.vendorAddress.adLine1,
                    "tableAddress2": $scope.vendorAddress.adLine2,
                    "tableAddress3": $scope.vendorAddress.adLine3,
                    "tableAddress4": null,
                    "tableAddressPin": $scope.vendorAddress.pincode,
                    "tableAddressFax": null,
                    "tableAddressContactPerson1": $scope.vendorAddress.contactPersonName,
                    "tableAddressPhone1": $scope.vendorAddress.contactPhone,
                    "tableAddressEmail1": $scope.vendorAddress.contactEmail,
                    "tableAddressLatitude": latitude,
                    "tableAddressLongitude": longitude,
                    "tableAddressType": {
                        "idtableAddressTypeId": 1,
                        "tableAddressTypeString": "Shipping"
                    },
                    "tableCity": $scope.vendorAddress.city
                }
            }

            console.log(postShippingAddressData);

            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/address',
                data: postShippingAddressData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    if (tinMode == 'post') {
                        var tinPostData = {
                            "idtableVendorStateWiseVatId": 1,
                            "tableVendorStateWiseVatNo": vatNo,
                            "tableState": stateData
                        }
                        $http({
                            method: 'POST',
                            url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/vats',
                            data: tinPostData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(res) {
                            if (res) {
                                console.log(res);
                                growl.success("TIN NO Added Successfully");
                            }
                        }).error(function(error,status) {
                            console.log(error);
                            if (status == 400) {
                                growl.error(error.errorMessage);
                            }
                            else {
                                growl.error("TIN/VAT cannot be added");
                            }
                        });
                    }


                    if (tinMode == 'put') {
                        var tinPutData = {
                            "tableVendorStateWiseVatNo": vatNo,
                            "tableState": stateData
                        }

                        $http({
                            method: 'PUT',
                            url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/vats/' + $scope.tinVatId,
                            data: tinPutData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(res) {
                            if (res) {
                                console.log(res);
                            }
                        }).error(function(error) {
                            console.log(error);
                        });
                    }

                    growl.success("Address added successfully");
                    $scope.vendorAddress = {};
                    $scope.state = "";
                    $scope.district = "";
                    $scope.cityVal = "";
                    $scope.vendorAddressMode = "add";
                    if ($scope.modeVendor == "normal") {
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }
                }
            }).error(function(error, status) {
                console.log(error);

        });
            $scope.cancelAddress();
        }
		
		$mdDialog.hide({
		templateUrl: 'dialog4.tmpl.html'});
    }


    //EDIT shipping address data based on customer id and ship address id
    $scope.editShippingAddressData = function() {
        var latitude = $scope.searchLocation.latitude;
        var longitude = $scope.searchLocation.longitude;
        console.log($scope.tinMode);
        var tinMode = $scope.tinMode;
        console.log($scope.vendorAddress.tinNo);
        var vatNo = $scope.vendorAddress.tinNo;
        console.log($scope.vendorAddress.stateData);
        var stateData = $scope.vendorAddress.stateData;
        console.log(tinMode);
        if (!$scope.vendorAddress) {
            growl.error("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactPersonName) {
            growl.error("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactEmail) {
            growl.error("Please enter a valid Email Address");
            $scope.isvendorAddressEmailValid = true;
        } else if (!$scope.vendorAddress.contactPhone) {
            $scope.isvendorAddressPhoneValid = true;
            growl.error("Please enter a valid 10-12 digit Phone Number!");
        } else if ($scope.vendorAddress.contactPhone.length < 10 || $scope.vendorAddress.contactPhone.length > 12) {
            $scope.isvendorAddressPhoneValid = true;
            growl.error("Please enter a valid 10-12 digit Phone Number!");
        } else if (!$scope.vendorAddress.adLine1) {
            growl.error("Please enter a valid Address");
            $scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.countryData) {
            growl.error("Please choose a country from the available countries!");
            //$scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.stateData) {
            growl.error("Please choose state from the available states!");
            $scope.isvendorAddressStateValid = true;            
        } else if (!$scope.vendorAddress.districtData) {
            growl.error("Please choose district from the available districts!");
            $scope.isvendorAddressDistrictValid = true;            
        } else if (!$scope.vendorAddress.city) {
            growl.error("Please choose city from the available cities!");
            $scope.isvendorAddressCityValid = true;            
        } else if (!$scope.vendorAddress.pincode) {
            growl.error("Please enter valid 6 digit Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        } else if ($scope.vendorAddress.pincode.length < 6 || $scope.vendorAddress.pincode.length>6) {
            growl.error("Please enter valid 6 digit Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        } else if (!$scope.vendorAddress.tinNo) {
            growl.error("Please enter valid Tin No!");
            $scope.isvendorAddressTinValid = true;            
        }
        else {
            var putShippingAddressData = {
                "tableAddress": {
                    "idtableAddressId": 1,
                    "tableAddress1": $scope.vendorAddress.adLine1,
                    "tableAddress2": $scope.vendorAddress.adLine2,
                    "tableAddress3": $scope.vendorAddress.adLine3,
                    "tableAddress4": null,
                    "tableAddressPin": $scope.vendorAddress.pincode,
                    "tableAddressFax": null,
                    "tableAddressContactPerson1": $scope.vendorAddress.contactPersonName,
                    "tableAddressPhone1": $scope.vendorAddress.contactPhone,
                    "tableAddressEmail1": $scope.vendorAddress.contactEmail,
                    "tableAddressLatitude": latitude,
                    "tableAddressLongitude": longitude,
                    "tableAddressType": {
                        "idtableAddressTypeId": 1,
                        "tableAddressTypeString": "Shipping"
                    },
                    "tableCity": $scope.vendorAddress.city
                }
            }

            console.log(putShippingAddressData);

            $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/address/' + $scope.addressId,
                data: putShippingAddressData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    if (tinMode == 'post') {
                        var tinPostData = {
                            "idtableVendorStateWiseVatId": 1,
                            "tableVendorStateWiseVatNo": vatNo,
                            "tableState": stateData
                        }
                        $http({
                            method: 'POST',
                            url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/vats',
                            data: tinPostData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(res) {
                            if (res) {
                                console.log(res);
                                growl.success("TIN NO Added Successfully");
                            }
                        }).error(function(error,status) {
                            console.log(error);
                            if (status == 400) {
                                growl.error(error.errorMessage);
                            }
                            else {
                                growl.error("TIN/VAT cannot be added");
                            }
                        });
                    }


                    if (tinMode == 'put') {
                        var tinPutData = {
                            "tableVendorStateWiseVatNo": vatNo,
                            "tableState": stateData
                        }
                        console.log(tinPutData);
                        $http({
                            method: 'PUT',
                            url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/vats/' + $scope.tinVatId,
                            data: tinPutData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(res) {
                            if (res) {
                                console.log(res);
                            }
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                    growl.success("Address updated successfully");

                    $scope.vendorAddress = {};
                    $scope.state = "";
                    $scope.district = "";
                    $scope.cityVal = "";
                    $scope.vendorAddressMode = "add";
                    if ($scope.modeVendor == "normal") {
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }
                }
            }).error(function(error, status) {
                console.log(error);

        });
            $scope.cancelAddress();
        }
    }

    $scope.editShippingAddressVendor = function(vendorId, addressId) {
	    var addressResponse = {};
        $scope.vendorAddressMode = 'edit';
        $http.get(baseUrl + '/omsservices/webapi/vendors/' + vendorId + '/address/' + addressId)
        .then(function(response) {
            addressResponse = response.data;
            return $http.get(baseUrl + "/omsservices/webapi/countries/");
        })
        .then(function(response) {
            $scope.countriesArray = [];
            $scope.vendorAddress = {};
            $scope.countriesArray = response.data;
            $scope.vendorAddress.countryData = initializeDropdowns($scope.countriesArray, 'idtableCountryId', addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId);
            return $http.get(baseUrl + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states");
        })
        .then(function (response) {
            $scope.regionsStatesArray = [];
            $scope.regionsStatesArray = response.data;
            $scope.addressId = addressId;
            $scope.vendorId = vendorId;
            $scope.vendorAddress.contactPersonName = addressResponse.tableAddress.tableAddressContactPerson1;
            $scope.vendorAddress.contactEmail = addressResponse.tableAddress.tableAddressEmail1;
            $scope.vendorAddress.contactPhone = addressResponse.tableAddress.tableAddressPhone1;
            $scope.vendorAddress.adLine1 = addressResponse.tableAddress.tableAddress1;
            $scope.vendorAddress.adLine2 = addressResponse.tableAddress.tableAddress2;
            $scope.vendorAddress.adLine3 = addressResponse.tableAddress.tableAddress3;
            $scope.vendorAddress.pincode = parseInt(addressResponse.tableAddress.tableAddressPin);
            $scope.vendorAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', addressResponse.tableAddress.tableCity.tableDistrict.tableState.idtableStateId);
            $scope.district = addressResponse.tableAddress.tableCity.tableDistrict.tableDistrictLongName;
            $scope.state = addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableStateLongName;

            return $http.get(baseUrl + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states/" + addressResponse.tableAddress.tableCity.tableDistrict.tableState.idtableStateId + "/districts");



            // $scope.regionsStatesDistrictArray = [];
            // var regionsStatesDistrictUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId + "/districts";
            // $http.get(regionsStatesDistrictUrl).success(function(data) {
            //     if (data != null) {
            //         for (var i = 0; i < data.length; i++) {
            //             $scope.regionsStatesDistrictArray.push(data[i]);
            //         }
            //         console.log($scope.regionsStatesDistrictArray);
            //         $scope.vendorAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
            //         console.log($scope.vendorAddress.districtData);
            //     }
            // }).error(function(error, status) {
            //     console.log(error);
            //
            // });
            //
            // $scope.regionsStatesDistrictsCityArray = [];
            // var regionsStatesDistrictsCityUrl = baseUrl + "/omsservices/webapi/countries/1/states/" + $scope.vendorAddress.stateData.idtableStateId + "/districts/" + response.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities";
            // $http.get(regionsStatesDistrictsCityUrl).success(function(data1) {
            //     if (data1 != null) {
            //         for (var i = 0; i < data1.length; i++) {
            //             $scope.regionsStatesDistrictsCityArray.push(data1[i]);
            //         }
            //         console.log($scope.regionsStatesDistrictsCityArray);
            //         $scope.vendorAddress.city = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
            //         console.log($scope.vendorAddress.city);
            //         $scope.cityVal = $scope.vendorAddress.city.tableCityLongName;
            //     }
            // }).error(function(error, status) {
            //     console.log(error);
            //
            // });
            //
            // if(vendorId) $scope.getTinNo(vendorId, $scope.vendorAddress.stateData);
            //
            //
            // $scope.searchLocation = {
            //     latitude: addressResponse.tableAddress.tableAddressLatitude,
            //     longitude: addressResponse.tableAddress.tableAddressLongitude
            // }
            //
            // $('#vendorAddressModal').modal('show');
        })
        .then(function (response) {
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictArray = response.data;
            console.log($scope.regionsStatesDistrictArray);
            $scope.vendorAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', addressResponse.tableAddress.tableCity.tableDistrict.idtableDistrictId);
            console.log($scope.vendorAddress.districtData);

            return $http.get(baseUrl + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states/" + $scope.vendorAddress.stateData.idtableStateId + "/districts/" + addressResponse.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities");
        })
        .then(function (response) {
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.regionsStatesDistrictsCityArray = response.data;

            console.log($scope.regionsStatesDistrictsCityArray);
            $scope.vendorAddress.city = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', addressResponse.tableAddress.tableCity.idtableCityId);
            console.log($scope.vendorAddress.city);
            $scope.cityVal = $scope.vendorAddress.city.tableCityLongName;


            if(vendorId) $scope.getTinNo(vendorId, $scope.vendorAddress.stateData);


            $scope.searchLocation = {
                latitude: addressResponse.tableAddress.tableAddressLatitude,
                longitude: addressResponse.tableAddress.tableAddressLongitude
            }

            $('#vendorAddressModal').modal('show');
        });
    }

    $scope.cancelAddress = function() {
        $scope.vendorAddressMode = 'add';

        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        $scope.vendorAddress = {};
        $scope.isvendorAddressNameValid = false;
        $scope.isvendorAddressEmailValid = false;
        $scope.isvendorAddressPhoneValid = false;
        $scope.isvendorAddressAdLine1Valid = false;
        $scope.isvendorAddressStateValid = false;
        $scope.isvendorAddressDistrictValid = false;
        $scope.isvendorAddressCityValid = false;
        $scope.isvendorAddressPinValid = false;
        $scope.isvendorAddressTinValid = false;


        $('#vendorAddressModal').modal('hide');
    }

    $scope.validateEmail = function(emailCase) {
        if (emailCase == false) {
            growl.error("Please Enter Valid Email Id");
            document.vendForm.vendEmail.focus();
        }
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

    $scope.getTinNo = function(vendorId, stateData) {
        console.log(vendorId);
        console.log(stateData.idtableStateId);
        var getTinurl = baseUrl + "/omsservices/webapi/vendors/" + vendorId + "/vats/checkvat/" + stateData.idtableStateId;
        $http.get(getTinurl).success(function(data1) {
            console.log(data1);
            if (data1) {
                $scope.tinMode = "put";
                if (!$scope.vendorAddress) {
                    $scope.vendorAddress = {};
                }
                $scope.tinVatId = data1.idtableVendorStateWiseVatId;
                $scope.vendorAddress.tinNo = data1.tableVendorStateWiseVatNo;
            }
            if(data1==''){
                console.log('hi');
                $scope.tinMode = "post";
            }
        }).error(function(error) {
            // console.log(error);
        });
    }

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

    $scope.checkPhone = function(phone) {
        var q = $q.defer();
        if ($scope.vendorMode == "edit") {
            if ($scope.originalPhoneNumber == phone) {
                q.resolve(true);
            } else {
                var checkPhone = baseUrl + "/omsservices/webapi/vendors/checkphone?phone=" + phone;
                $http.get(checkPhone).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        growl.error(data.statusMessage);
                        $scope.phoneNumberEntered = true;
                        q.resolve(false);
                    } else if (data.status == true) {
                        $scope.phoneNumberEntered = false;
                        q.resolve(true);
                    }
                });
            }
        } else if ($scope.vendorMode == "add") {
            var checkPhone = baseUrl + "/omsservices/webapi/vendors/checkphone?phone=" + phone;
            $http.get(checkPhone).success(function(data) {
                console.log(data);
                if (data.status == false) {
                    growl.error(data.statusMessage);
                    $scope.phoneNumberEntered = true;
                    q.resolve(false);
                } else if (data.status == true) {
                    $scope.phoneNumberEntered = false;
                    q.resolve(true);
                }
            });
        }
        return q.promise;
    };

    $scope.checkCompany = function(company) {
        var q = $q.defer();
        if ($scope.vendorMode == "edit") {
            if ($scope.originalCompanyName == company) {
                q.resolve(true);
            } else {
                var checkCompany = baseUrl + "/omsservices/webapi/vendors/checkcompany?company=" + company;
                $http.get(checkCompany).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        growl.error(data.statusMessage);
                        $scope.companyNameEntered = true;
                        q.resolve(false);
                    } else if (data.status == true) {
                        $scope.companyNameEntered = false;
                        q.resolve(true);
                    }
                });
            }
        } else if ($scope.vendorMode == "add") {
            var checkCompany = baseUrl + "/omsservices/webapi/vendors/checkcompany?company=" + company;
            $http.get(checkCompany).success(function(data) {
                console.log(data);
                if (data.status == false) {
                    growl.error(data.statusMessage);
                    $scope.companyNameEntered = true;
                    q.resolve(false);
                } else if (data.status == true) {
                    $scope.companyNameEntered = false;
                    q.resolve(true);
                }
            });
        }
        return q.promise;
    };

    $scope.checkVendorCode = function(vendorcode) {
        var q = $q.defer();
        if(vendorcode == "" || vendorcode == undefined || vendorcode == null){
            q.resolve(true);
        }
        else{
            if ($scope.vendorMode == "edit") {
                if ($scope.originalVendorCode == vendorcode) {
                    q.resolve(true);
                } else {
                    var checkVendorCode = baseUrl + "/omsservices/webapi/vendors/checkvendorcode?vendorcode=" + vendorcode;
                    console.log(checkVendorCode);
                    $http.get(checkVendorCode).success(function(data) {
                        console.log(data);
                        if (data.status == false) {
                            growl.error(data.statusMessage);
                            q.resolve(false);
                        } else if (data.status == true) {
                            q.resolve(true);
                        }
                    });
                }
            } else if ($scope.vendorMode == "add") {
                var checkVendorCode = baseUrl + "/omsservices/webapi/vendors/checkvendorcode?vendorcode=" + vendorcode;
                console.log(checkVendorCode);
                $http.get(checkVendorCode).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        growl.error(data.statusMessage);
                        q.resolve(false);
                    } else if (data.status == true) {
                        q.resolve(true);
                    }
                });
            }
        }
        return q.promise;
    };

    $scope.callVendorSkuMapRepeatData = function(vendorId) {
        console.log(vendorId);
        var callSkuMapUrl = baseUrl + "/omsservices/webapi/vendors/" + vendorId + "/skumap/";
        $http.get(callSkuMapUrl).success(function(data) {

            if (data != null) {
                $scope.skuMapData = data;
                console.log($scope.skuMapData);
            }
        })
    }

    $scope.editVendorSkuMap = function(vendorId, skuMapId) {
        $scope.vendorSkuMapMode = "edit";
        var editSkuMapUrl = baseUrl + "/omsservices/webapi/vendors/" + vendorId + "/skumap/" + skuMapId;
        $http.get(editSkuMapUrl).success(function(data) {
            if (data != null) {
                $scope.pricingTiers = [];
                $scope.PT = [];
                $scope.vendorSkuData = data;
                $scope.vendorId = vendorId;
                console.log($scope.vendorSkuData);
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data.tableSku.tableSkuName);
                $scope.skuSelected = {
                    originalObject: data.tableSku
                };
                for (var i = 0; i < data.tableVendorSkuPricingTierses.length; i++) {
                    $scope.pricingTiers.push({
                        "tableVendorSkuPricingTiersQtyMin": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersQtyMin,
                        "tableVendorSkuPricingTiersQtyMax": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersQtyMax,
                        "tableVendorSkuPricingTiersPrice": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersPrice
                    })
                }
                for (var i = 0; i < data.tableVendorSkuUoqmses.length; i++) {
                    $scope.selectedList.push({
                        oqmStr: data.tableVendorSkuUoqmses[i].tableSkuUoqmConfig.tableSkuUoqmType.tableSkuUoqmTypeString,
                        oqmData: data.tableVendorSkuUoqmses[i].tableSkuUoqmConfig
                    });
                }
                $('#addVendorSku').modal('show');
            }
        })
    };

    $scope.cancelCleanData = function() {
        $scope.vendorSkuData = null;
        $scope.pricingTiers = [];
        $scope.selectedList = [];
        $scope.pricingtierDetailsClicked = false;
        $scope.unitquantityClicked = false;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isProductSelected = false;
        $scope.vendorSkuCodeEntered = false;
        $scope.minOrderQtyEntered = false;
        $scope.leadTimeEntered = false;
        $scope.isPTMinQtyEntered = false;
        $scope.isPTMaxQtyEntered = false;
        $scope.isPTPriceEntered = false;
        $('#addVendorSku').modal('hide');
    }

    $scope.vendorSkuCodeChanged = function(val) {
        if (val) {
            $scope.vendorSkuCodeEntered = false;
        } else {
            $scope.vendorSkuCodeEntered = true;
        }
    };

    $scope.minOrderQtyChanged = function(val) {
        if (val) {
            $scope.minOrderQtyEntered = false;
        } else {
            $scope.minOrderQtyEntered = true;
        }
    };

    $scope.leadTimeChanged = function(val) {
        if (val) {
            $scope.leadTimeEntered = false;
        } else {
            $scope.leadTimeEntered = true;
        }
    };

    $scope.PTMinQtyChanged = function(val) {
        if (val) {
            $scope.isPTMinQtyEntered = false;
        } else {
            $scope.isPTMinQtyEntered = true;
        }
    };

    $scope.PTMaxQtyChanged = function(val) {
        if (val) {
            $scope.isPTMaxQtyEntered = false;
        } else {
            $scope.isPTMaxQtyEntered = true;
        }
    };

    $scope.PTPriceChanged = function(val) {
        if (val) {
            $scope.isPTPriceEntered = false;
        } else {
            $scope.isPTPriceEntered = true;
        }
    };


    //===================== add bulk vendor tab action ========== //

    $scope.singleVendorTabMode = function() {
        $scope.singleVendorTab = true;
        $scope.bulkVendorTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkVendorTabMode = function() {
        $scope.singleVendorTab = false;
        $scope.bulkVendorTab = true;
    }

    //====================== ends here ============================== //



    $scope.saveVendorSkuMap = function() {

        if (!$scope.skuSelected) {
            growl.error("Please select a Product");
            $scope.isProductSelected = true;
        } else if (!$scope.skuSelected.originalObject) {
            growl.error("Please select a Product");
            $scope.isProductSelected = true;
        } else if (!$scope.vendorSkuData.tableVendorSystemSkuMapVendorSkuCode) {
            growl.error("Please enter the Vendor SKU Code");
            $scope.vendorSkuCodeEntered = true;
        } else if (!$scope.vendorSkuData.tableVendorSystemSkuMapMinOrderQty) {
            growl.error("Please enter the Minimum Order Quantity");
            $scope.minOrderQtyEntered = true;
        } else if (!$scope.vendorSkuData.tableVendorSystemSkuMapLeadTime) {
            growl.error("Please enter the Lead Time (In Days)");
            $scope.leadTimeEntered = true;
        }  else {

            if ($scope.vendorSkuMapMode == "add") {
                var data = $scope.vendorSkuData;
                data.tableSku = $scope.skuSelected.originalObject;
                $scope.oqmses = [];
                console.log($scope.selectedList);
                for (var i = 0; i < $scope.selectedList.length; i++) {
                    $scope.oqmses.push({
                        'tableSkuUoqmConfig': $scope.selectedList[i].oqmData
                    });
                }
                data.tableVendorSkuPricingTierses = $scope.pricingTiers;
                data.tableVendorSkuUoqmses = $scope.oqmses;
                console.log(data);
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/skumap',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    console.log(res);
                    if (res != null)
                    {
                        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                        growl.success("New Vendor Sku Map Added Successfully");
                        $scope.vendorSkuMapMode = "add";
                        $scope.callVendorSkuMapRepeatData($scope.vendorId);
                        $scope.cancelCleanData();
                    }
                });
            } else if ($scope.vendorSkuMapMode == "edit") {
                $scope.updateVendorSkuMap();
            }
        }
    };

    $scope.updateVendorSkuMap = function() {
        var data = $scope.vendorSkuData;
        data.tableSku = $scope.skuSelected.originalObject;
        $scope.oqmses = [];
        console.log($scope.selectedList);
        for (var i = 0; i < $scope.selectedList.length; i++) {
            $scope.oqmses.push({
                'tableSkuUoqmConfig': $scope.selectedList[i].oqmData
            });
        }
        data.tableVendorSkuPricingTierses = $scope.pricingTiers;
        data.tableVendorSkuUoqmses = $scope.oqmses;
        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/vendors/' + $scope.vendorId + '/skumap/' + data.idtableVendorSystemSkuMapId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res != null)
            {
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                growl.success("Vendor Sku Updated Successfully");
                $scope.vendorSkuMapMode = "add";
                $scope.callVendorSkuMapRepeatData($scope.vendorId);
                $scope.cancelCleanData();
            }
        });
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

    $scope.getLatitudeLongitude = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.vendorAddress) {
            if ($scope.vendorAddress.adLine1) {
                address = address + $scope.vendorAddress.adLine1;
            }
            if ($scope.vendorAddress.adLine2) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.adLine2;
                } else {
                    address = $scope.vendorAddress.adLine2;
                }
            }
            if ($scope.vendorAddress.adLine3) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.adLine3;
                } else {
                    address = $scope.vendorAddress.adLine3;
                }
            }
            if ($scope.cityVal && !$scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.cityVal;
                } else {
                    address = $scope.cityVal;
                }
            }
            if ($scope.district && (!$scope.cityVal && !$scope.vendorAddress.pincode)) {
                if (address != "") {
                    address = address + ", " + $scope.district;
                } else {
                    address = $scope.district;
                }
            }
            if ($scope.state && !$scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.state;
                } else {
                    address = $scope.state;
                }
            }
            if ($scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.pincode;
                } else {
                    address = $scope.vendorAddress.pincode;
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

        if ($scope.modeVendor == "normal") {
            var page = undefined;
            $scope.listOfVendorsCount(page);
        }
        if ($scope.modeVendor == "mutual") {
            var page = undefined;
            $scope.listOfMutualVendorsCount(page);
        }
        if ($scope.modeVendor == "skumap") {
            var page = undefined;
            $scope.listOfSkuMapVendorsCount(page);
        }

    }

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


    $scope.VendorTemplateDownload = function(){
        console.log('test')
        $http({
            method: 'GET',
            url: $scope.downloadVendorsTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Vendor_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(data){
            console.log(data);
        });
    };

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile) {
        console.log(bulkOrderUploadfile);
        growl.info("Upload is being processed in the background");
        file = bulkOrderUploadfile;
        if (file) {
            if (!file.$error) {
                var uploadUrl = baseUrl + '/omsservices/webapi/vendors/vendorbulkupload';

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
                    if ($scope.modeVendor == "normal") {
                        var page = undefined;
                        $scope.listOfVendorsCount(page);
                    }
                    if ($scope.modeVendor == "mutual") {
                        var page = undefined;
                        $scope.listOfMutualVendorsCount(page);
                    }
                    if ($scope.modeVendor == "skumap") {
                        var page = undefined;
                        $scope.listOfSkuMapVendorsCount(page);
                    }
                    $cookies.put('BulkUploadData','vendor');
                    $cookies.put('ActiveTab','Vendors');
                    $mdDialog.hide();
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                }, function(resp) {
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };

    $scope.closeBulkUploadDialog = function(){
        console.log("I MA HER");

        $cookies.put('BulkUploadData','vendor');
        $cookies.put('ActiveTab','Vendors');
        $mdDialog.hide();
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }

    $scope.shipAddrClickedRow = function() {
        $scope.shipAddrClicked = !$scope.shipAddrClicked;
    };
	$scope.masterSkuDialog = function(ev, check) {

		mastersService.fetchOnlySkus(baseUrl).then(function(data) {
			$scope.genericData.skusListFiltered = data;
			$timeout(function() {
			$("#dialogmastersku").modal('show');
			}, 200);
		});

        $scope.genericData.check = check;


	}
	
	$scope.selectSku = function(id, ev){		
		
		$http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
            $scope.genericData.productObject = {};
                if ($scope.genericData.check == false) {
                    $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
                } else {
                    $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
                    // $scope.productObject(data);
                }

        }).error(function(error, status) {
            console.log(error);
			
        });

		$scope.cancelmastersDialog(ev);

	}
	
	$scope.cancelmastersDialog = function(ev){
	$("#dialogmastersku").modal('hide');
	}

    $scope.showAddVendorModalWithValues = function(ev){
        $mdDialog.show({
            templateUrl: 'dialog2.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }

	
	$scope.showVendorHistory = function(ev, vendorCode){
		
		$scope.genericData.vendorCodeForDialogue = vendorCode;
		
		$http.get(baseUrl + '/omsservices/webapi/purchase/order/poforvendor/'+$scope.genericData.vendorCodeForDialogue).success(function(data) {
            console.log(data);            
            $scope.genericData.poList = data;
            $scope.genericData.poLength = data.length;
            
            $scope.dayDataCollapse1 = [];

            for (var i = 0; i < $scope.genericData.poLength; i += 1) {
                $scope.dayDataCollapse1.push(false);
            }
            
            
            console.log(data);   
        }).error(function(error, status) {
            growl.error("There is some issue.");

        });;
		
        $timeout(function() {
        	$mdDialog.show({
				templateUrl : 'vendorPoDialog.tmpl.html',
				parent : angular.element(document.body),
				targetEvent : ev,
				clickOutsideToClose : false,
				scope : $scope.$new()
			});
		}, 500);
		
	}
	
	$scope.dayDataCollapseFn1 = function() {
        $scope.dayDataCollapse1 = [];

        for (var i = 0; i < $scope.genericData.poLength; i += 1) {
            $scope.dayDataCollapse1.push(false);
        }
    };
	
	$scope.cancelpoDialog = function(){
		$mdDialog.hide({
			templateUrl : 'vendorPoDialog.tmpl.html'
		});
	}
	
	$scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }
	
	$scope.getTotal = function(tableSkuData) {

        var total = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }
        return total;
    };
    
    $scope.totalCostPerProduct = function(tableSkuData) {
        // console.log(tableSkuData.tablePurchaseOrderSkusChargeses.length);
        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tablePurchaseOrderSkusSkuQuantity;

        return totalCost;
    }
    
	$scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            //console.log(allSkus[i]);
            for (var j = 0; j < allSkus[i].tablePurchaseOrderSkusChargeses.length; j++) {
                var product = allSkus[i].tablePurchaseOrderSkusChargeses[j].tablePurchaseOrderSkusChargesValue;
                total += product;
            }
            totalCostAmount += total * allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
    };
    
    $scope.selectTableRow1 = function(index, storeId) {

        console.log(index);
        console.log(storeId);
        if (typeof $scope.dayDataCollapse1 === 'undefined') {
            $scope.dayDataCollapseFn1();
        }

        if ($scope.tableRowExpanded1 === false && $scope.tableRowIndexExpandedCurr1 === "" && $scope.storeIdExpanded1 === "") {
            $scope.tableRowIndexExpandedPrev1 = "";
            $scope.tableRowExpanded1 = true;
            $scope.tableRowIndexExpandedCurr1 = index;
            $scope.storeIdExpanded1 = storeId;
            $scope.dayDataCollapse1[index] = true;
        } else if ($scope.tableRowExpanded1 === true) {
            if ($scope.tableRowIndexExpandedCurr1 === index && $scope.storeIdExpanded1 === storeId) {
                $scope.tableRowExpanded1 = false;
                $scope.tableRowIndexExpandedCurr1 = "";
                $scope.storeIdExpanded1 = "";
                $scope.dayDataCollapse1[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev1 = $scope.tableRowIndexExpandedCurr1;
                $scope.tableRowIndexExpandedCurr1 = index;
                $scope.storeIdExpanded1 = storeId;
                $scope.dayDataCollapse1[$scope.tableRowIndexExpandedPrev1] = false;
                $scope.dayDataCollapse1[$scope.tableRowIndexExpandedCurr1] = true;
            }
        }

    };

    $scope.stateTrials = function(saleordskus) {
        console.log(saleordskus);
        console.log(saleordskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        $scope.StateArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            console.log(i);
            console.log(saleordskus[i]);
            $scope.StateArray.push(saleordskus[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
            console.log($scope.StateArray);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tablePurchaseOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            //console.log($scope.fullTrialsArray);
        }
    }
    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.vendorsData.tableVendorReturnValuePercentage = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.vendorsData.tableVendorReturnQuantity = null;
        }

    }

    $scope.checkNumber = checkNumber;
	
}
