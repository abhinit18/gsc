myApp.controller('inventoryController', inventoryController);
inventoryController.$inject = ['$rootScope', '$scope', '$http', '$location', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService','$controller','$cookies','Upload','$timeout', 'mastersService', '$q'];

function inventoryController($rootScope, $scope, $http, $location, $mdDialog, $mdMedia, baseUrl, growl, PagerService,$controller,$cookies,Upload,$timeout, mastersService, $q) {

    // Initialize the super class and extend it.
    // $.extend(this, $controller('templatesController', {$scope: $scope}));
    $scope.genericData = {};
    $scope.filterObjectData = {};
    $scope.sortType = "skuId"; // set the default sort type
    $scope.sortReverse = true; // set the default sort order
    $scope.directionTypeAll =  'desc';
    $scope.selectedWarehouse = {};
    $scope.pricingTiers = [];
    $scope.selectedList = [];
    $scope.searchItem = ""; // set the default search/filter term
    $scope.searchInventoryClicked = false;
    $scope.inventoryData = {};
    $scope.wIdSticker = "";
    $scope.mode = "add";
    $scope.start = 0;
    $scope.inventorySize = 5;
    $scope.singleOrderMode = "add";
    $scope.singleorderData = {};
    $scope.inventoryLists = [];
    $scope.csvTrue = true;
    $scope.singleOrderTab = true;
    $scope.bulkOrderTab = false;
    $scope.downloadInventoryTemplateUrl = baseUrl+'/omsservices/webapi/inventory/gettemplateforInventoryupload';

    $scope.selectedSku = null;
    $scope.skuClientCode = null;
    $scope.TableSkuName = null;
    // $scope.optionsList = [];
    $scope.products = [];
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';

    $scope.items = ["Poisonous", "Stackable", "Fragile", "Saleable", "USN required" , "Consumable", "Hazardous", "High value", "QC required", "Temperature controlled", "Returnable"];
    $scope.selected = [];
    $scope.inventorypassbook = localStorage.getItem('inventorypassbook');
    $scope.isvendor = localStorage.getItem("isvendor");


    //================================= table sorting ================================ //

    $scope.tableSorting = function(sortTypeAll, sortReverseAll) {
        console.log($scope.sortType);
        console.log(sortTypeAll);
        console.log(sortReverseAll);
        $scope.sortType = sortTypeAll;
        $scope.sortReverse = sortReverseAll;
        console.log($scope.directionTypeAll);
        if (sortReverseAll == true) {
            $scope.directionTypeAll = 'desc';
        }
        if (sortReverseAll == false) {
            $scope.directionTypeAll = 'asc';
        }
        console.log($scope.directionTypeAll);
        $scope.sortReverse = !sortReverseAll;

        var page = undefined;
        console.log($scope.sortType);
        $scope.listOfInventoriesCount(page);
    }


    //Inv No
    $scope.firstInvNo = 1;
    $scope.secInvNo = 2;
    $scope.thirdInvNo = 3;
    $scope.fourthInvNo = 4;
    $scope.fifthInvNo = 5;


    //dialog bog variable
    $scope.dialogBoxKit = 'add';
    $scope.dialogBoxSplit = 'add';
    $scope.dialogBoxFreeMailer = 'add';
    $scope.dialogBoxQC = 'add';
    $scope.dialogBoxStock = 'add';
    $scope.dialogBoxSticker = 'add';

    $scope.validAvblQty = false;

    $scope.selectedTab1 = 0;
    $scope.mdSelectedTab = 0;

    $scope.isSubmitDisabledInv = true;
    $scope.isResetDisabledInv = true;

    $scope.isSubmitDisabledListWo = true;
    $scope.isResetDisabledListWo = true;

    $scope.isSubmitDisabledKit = true;
    $scope.isResetDisabledKit = true;

    $scope.isSubmitDisabledSplit = true;
    $scope.isResetDisabledSplit = true;

    $scope.isSubmitDisabledMailer = true;
    $scope.isResetDisabledMailer = true;

    $scope.isSubmitDisabledQc = true;
    $scope.isResetDisabledQc = true;

    $scope.isSubmitDisabledStock = true;
    $scope.isResetDisabledStock = true; 

    $scope.isSubmitDisabledSticker = true;
    $scope.isResetDisabledSticker = true; 

    $scope.stickermode = "add";
    $scope.openStickeMode = function()
    {
        $scope.stickerTotalMode = "new";
    }

    $scope.navigatePassbook = function(){
        console.log("heelo")
        $location.path('/inventorypassbook');
    };

    $scope.$on('$routeChangeSuccess', function()
    {
        $scope.listOfInventories($scope.start);
        $scope.listOfInventoriesCount();
        $scope.getWarehouses();        
    });

    $scope.checkValidAvblQty = function(val) {
        if (val && val > 0) {
            $scope.validAvblQty = false;
        }
    };

    $scope.callDisabled = function(){
        $scope.isSubmitDisabledInv = false;
    }

    $scope.callDisabledListWo = function(){
        $scope.isSubmitDisabledListWo = false;
    }

    $scope.callDisabledKit = function(){
        $scope.isSubmitDisabledKit = false;
    }

    $scope.callDisabledSplit = function(){
        $scope.isSubmitDisabledSplit = false;
    }

    $scope.callDisabledMailer = function(){
        $scope.isSubmitDisabledMailer = false;
    }

    $scope.callDisabledQc = function(){
        $scope.isSubmitDisabledQc = false;
    }

    $scope.callDisabledStock = function(){
        $scope.isSubmitDisabledStock = false;
    }

    $scope.callDisabledSticker = function(){
        $scope.isSubmitDisabledSticker = false;
    }                

    $scope.searchedProduct = function(selected)
    {
        $scope.selectedSku = selected.originalObject;
        $scope.skuClientCode = selected.originalObject.tableSkuClientSkuCode;
        $scope.TableSkuName = selected.originalObject.tableSkuName;
        $scope.callDisabled();

        $scope.listOfVendors(selected.originalObject.idtableSkuId);
    };

    $scope.searchedProductForFilter = function(selected)
    {
        $scope.skuid = selected.originalObject.idtableSkuId;
        $scope.callDisabled();
    };

    $scope.PT = {};
    $scope.listOfVendors = function(skuID) {
        $scope.vendorsData = [];
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors/vendorsforsku/"+skuID;
        // console.log(channelListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsLists = data;
            for (var i = 0; i < $scope.vendorsLists.length; i++) {
                $scope.vendorsData.push($scope.vendorsLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });
    };

    $scope.listOfAllVendors = function() {
        $scope.allVendorsData = [];
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors/";
        // console.log(channelListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            console.log(data);
            $scope.allVendorsLists = data;
            for (var i = 0; i < $scope.allVendorsLists.length; i++) {
                $scope.allVendorsData.push($scope.allVendorsLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });
    };


    //========================================== View Sku Details from Inventory Table =================================== //

    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
    $scope.SkuDataDetailedView = {};
    $scope.ViewSkuDataDetails = function(data)
    {

        $http.get(baseUrl + '/omsservices/webapi/skus/' + data.skuId)
        .success(function(response)
        {
            $scope.SkuDataDetailedView = response;

            $scope.selected = [];

            $scope.getSkuImages(data.skuId);


            if (response.tableSkuIsPoisonous == true) {
                $scope.selected.push("Poisonous");
            }

            if (response.tableSkuIsStackable == true) {
                $scope.selected.push("Stackable");
            }

            if (response.tableSkuIsFragile == true) {
                $scope.selected.push("Fragile");
            }

            if (response.tableSkuIsSaleable == true) {
                $scope.selected.push("Saleable");
            }

            if (response.tableSkuIsUsnRequired == true) {
                $scope.selected.push("USN required");
            }

            if (response.tableSkuIsConsumable == true) {
                $scope.selected.push("Consumable");
            }

            if (response.tableSkuIsHazardous == true) {
                $scope.selected.push("Hazardous");
            }

            if (response.tableSkuIsHighValue == true) {
                $scope.selected.push("High value");
            }

            if (response.tableSkuIsQcRequired == true) {
                $scope.selected.push("QC required");
            }

            if (response.tableSkuIsReturnable == true) {
                $scope.selected.push("Returnable");
            }

            if (response.tableSkuIsTemperatureControlled == true) {
                $scope.selected.push("Temperature controlled");
            }

                $mdDialog.show({
                    templateUrl: 'SkuDetailedView.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    scope: $scope.$new()
                })

            }).error(function(error, status)
            {

            });

    };

    $scope.getSkuImages = function(id) {
        var q = $q.defer();

        $scope.skuImgUrl1 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl2 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl3 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl4 = "images/svg/add_image_active.svg"

        $http.get(baseUrl + "/omsservices/webapi/skus/" + id + "/images").success(function(responseImages) {
            if (responseImages != null) {
                if (responseImages[0] != null) {
                    $scope.skuImgUrl1 = responseImages[0].tableSkuImageUrl;
                    $scope.img1PresentId = responseImages[0].idtableSkuImageImageId;
                }
                if (responseImages[1] != null) {
                    $scope.skuImgUrl2 = responseImages[1].tableSkuImageUrl;
                    $scope.img2PresentId = responseImages[1].idtableSkuImageImageId;
                }
                if (responseImages[2] != null) {
                    $scope.skuImgUrl3 = responseImages[2].tableSkuImageUrl;
                    $scope.img3PresentId = responseImages[2].idtableSkuImageImageId;
                }
                if (responseImages[3] != null) {
                    $scope.skuImgUrl4 = responseImages[3].tableSkuImageUrl;
                    $scope.img4PresentId = responseImages[3].idtableSkuImageImageId;
                }
                q.resolve(true);
            }
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    };



    //========================================== Mapping vendor sku  ======================================= //


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

    $scope.vendorSkuData = {
        tableVendorSystemSkuMapIsActive: false,
        tableVendorSystemSkuMapEnableBackOrder: false
    };

    $scope.leadTimeChanged = function(val) {
        if (val) {
            $scope.leadTimeEntered = false;
        } else {
            $scope.leadTimeEntered = true;
        }
    };

    $scope.AddVendorSkuMap = function(ev){

        $scope.listOfAllVendors();
        $mdDialog.show({
            templateUrl: 'VendorSkuMapDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    };

    $scope.pricingtierDetailRow = function() {
        console.log($scope.pricingtierDetailsClicked);
        $scope.pricingtierDetailsClicked = !$scope.pricingtierDetailsClicked;
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
    $scope.vendorSkuData = {};
    $scope.saveVendorSkuMap = function() {                // api request for vendor sku request
            console.log("hello");
        if (!$scope.selectedSku) {
            growl.error("Please select a Product");
            $scope.isProductSelected = true;
        } else if (!$scope.selectedSku) {
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
            var data = $scope.vendorSkuData;
            data.tableSku = $scope.selectedSku;
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
            //console.log($scope.inventoryData.tableVendor.idtableVendorId);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/vendors/' + $scope.inventoryData.tableVendor.idtableVendorId+ '/skumap',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res != null) {
                    growl.success("New Vendor Sku Map Added Successfully");
                    $scope.vendorSkuData = {};
                    $scope.cancelCleanData();
                }
            }).error(function(error,status){
	    if(status == 400){
                growl.error(error.errorMessage);
	    }else{
	                    growl.error("Failed to update vendor sku map");
	    }

            });
        }
    };

    $scope.cancelCleanData = function() {

        $scope.pricingTiers = [];
        $scope.selectedList = [];
        $scope.TableSkuName = null;
        $scope.inventoryData.tableVendor = null;
        $scope.pricingtierDetailsClicked = false;
        $scope.unitquantityClicked = false;
        $scope.isProductSelected = false;
        $scope.vendorSkuCodeEntered = false;
        $scope.minOrderQtyEntered = false;
        $scope.leadTimeEntered = false;
        $scope.isPTMinQtyEntered = false;
        $scope.isPTMaxQtyEntered = false;
        $scope.isPTPriceEntered = false;
        $mdDialog.hide({
            templateUrl: 'VendorSkuMapDialog.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        $mdDialog.show({
            templateUrl: 'dialog1.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    };
    //============================================ ends here =============================================== //

        $scope.tableRowExpanded = false;
        $scope.tableRowIndexExpandedCurr = "";
        $scope.tableRowIndexExpandedPrev = "";
        $scope.storeIdExpanded = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.inventoryLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }

    };
    $scope.selectTableRow = function(index, storeId) {
        $scope.warehouseInventoryData = [];
        console.log("hello !!");
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

    //fetching list of inventories count
    $scope.listOfInventoriesCount = function(page)
    {
            var inventoryCountUrl = baseUrl + "/omsservices/webapi/inventory/filtercount?sort="+$scope.sortType+"&direction="+$scope.directionTypeAll;
            if ($scope.filterObjectData.tableWarehouseDetails) {
                inventoryCountUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
            }
            if ($scope.skuid) {
                inventoryCountUrl += "&skuid=" + $scope.skuid;
            }

            $http.get(inventoryCountUrl).success(function(data) {
                $scope.invCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.invCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
            
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * 5;
                        $scope.inventorySize = $scope.start + 5;
            
            
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfInventories($scope.start);
                    }

                    if (page == undefined) {
                        setPage(1);
                    }
                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        }
        //fetchng list of inv count ends here

    // fetching list of inventories from RestAPI OMS
    $scope.listOfInventories = function(start) {
        var sortData,directionData;
        if($scope.sortType == undefined || $scope.sortType == "" || $scope.sortType == null){
            sortData = "skuId";
        }else{
            sortData = $scope.sortType;
        }
        if($scope.directionTypeAll == undefined || $scope.directionTypeAll == "" || $scope.directionTypeAll == null){
            directionData = "asc";
        }else{
            directionData = $scope.directionTypeAll;
        }
            var inventoryListUrl = baseUrl + "/omsservices/webapi/inventory?";
            inventoryListUrl += "start=" + start + '&size=5&sort='+sortData+'&direction='+directionData;

            if ($scope.filterObjectData.tableWarehouseDetails) {
                inventoryListUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
            }
            if ($scope.skuid) {
                inventoryListUrl += "&skuid=" + $scope.skuid;
            }

            $http.get(inventoryListUrl).success(function(data) {
                console.log(data);
                $scope.inventoryLists = data;

                $scope.dayDataCollapseFn();

            }).error(function(error, status) {

            });
        }
        //inventory code ends here

    //==================================== Bulk Inventory Upload =============================== //


    $scope.singleOrderTabMode = function() {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkOrderTabMode = function() {
        $scope.singleOrderTab = false;
        $scope.bulkOrderTab = true;
    };

    $scope.InventoryTemplateDownload = function(){
        $http({
            method: 'GET',
            url: $scope.downloadInventoryTemplateUrl,
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
            a.download = "Glaucus_Inventory_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;

    };

    $scope.uploadInventoryBulkUpload = function(bulkOrderUploadfile){
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        if (file) {
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);
                var uploadUrl = baseUrl + '/omsservices/webapi/inventory/inventorybulkupload';

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
                upload.then(function(resp)
                {
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    $cookies.put('BulkUploadData','inventory');
                    $cookies.put('ActiveTab','Inventory');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    $mdDialog.hide();

                }, function(error, status)
                {
                    $scope.cancelBulkUpload();
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
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
    };


    //========================================= ends here ===================================== //


    //================================= load personal warehouse data ========================== //

    $scope.loadNewWareHouse = function(){
        var inventoryWarehouse = baseUrl + "/omsservices/webapi/warehouses?option=sourceonly&uipagename="+$scope.pagename;
        $http.get(inventoryWarehouse).success(function (data) {
            console.log(data);
            $scope.InventorywareHousesData = data;
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.loadNewWareHouse();

    $scope.LoadSkuData = function(SkuInventoryData)
    {
        $scope.warehouseInventoryData = [];
        var inventorySkuListUrl =  baseUrl + '/omsservices/webapi/inventory/warehouseinventory?uipagename='+$scope.pagename;
        if ($scope.filterObjectData.tableWarehouseDetails)
        {
            inventorySkuListUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if (SkuInventoryData.skuId)
        {
            inventorySkuListUrl += "&skuid=" + SkuInventoryData.skuId;
        }

        $http.get(inventorySkuListUrl).success(function (data) {
            console.log(data);
            $scope.warehouseInventoryData = data;
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.cancelViewInventory = function(ev){
        $mdDialog.hide({
            templateUrl: 'ViewInventory.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    };

    //======================================= bulk upload button navigation ===================== //

    $scope.closeBulkUploadDialog = function(){
        $mdDialog.hide();
        $cookies.put('BulkUploadData','inventory');
        $cookies.put('ActiveTab','Inventory');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    };


    $scope.ShowInventoryDetails = function(value,SkuValue,ev){
        console.log(value);
        console.log(SkuValue);
        $scope.selectedWarehouse.skuName = SkuValue.skuName;
        $scope.selectedWarehouse.skuDescription = SkuValue.skuDescription;
        $scope.selectedWarehouse.skuCode = SkuValue.skuCode;
        var  viewSkuInventoryDataTable = baseUrl + '/omsservices/webapi/inventory/sku/'+SkuValue.skuId+'/warehouse/'+value.warehouseId;

        $http.get(viewSkuInventoryDataTable).success(function (data) {
            console.log(data);
            $scope.viewDataTableList = data;
            $mdDialog.show({
                templateUrl: 'ViewInventory.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }).error(function(data){
            console.log(data);
        });

    };

    //Different Submit Actions for Inventories,Work Order Types..
    //submit Action for Inventory screen when clicking on submit button in main inventory screen
    $scope.submitInventoryAction = function() {

        $scope.start = 0;
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;
        $scope.listOfInventoriesCount(page);
    }

    $scope.DownloadInventoryFileExport = function(){

        var exportUrl = baseUrl+'/omsservices/webapi/inventory/export?';

        if ($scope.skuid) {
            exportUrl += "&skuid=" + $scope.skuid;
        }
        if ($scope.filterObjectData.tableWarehouseDetails) {
            exportUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
        }

        $http.get(exportUrl).success(function(response, status) {
            console.log(response);
            $cookies.put('DownloadExportData','inventory');
            console.log($cookies.get('DownloadExportData'));
            $cookies.put('ActiveTab','Inventory');
            if (status == 204) {
                growl.error("No records Available.");
            } else {
                $rootScope.growlmessage = growl.success("Inventory Export requested successfully.<br><a href='#/export' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>", {ttl: -1});

            }
            }).error(function(error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to submit the request for inventory export.");
            }
        });
    };

    $scope.clearActionInv = function() {
        $scope.filterObjectData = {};
        $scope.warehouseid = undefined;
        $scope.skuid = "";
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.start = 0;
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;        
        $scope.listOfInventoriesCount(page);
    }

    // dialog box to add new inventory
    $scope.showAdvanced = function(ev)
    {
        $scope.selectedSku = null;
        $scope.skuClientCode = null;
        $scope.TableSkuName = null;
        $scope.callMainMinStartMaxStart();
        $mdDialog.show({
            templateUrl: 'dialog1.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        $scope.validAvblQty = false;
    };

    $scope.onvalue = function(radio) {
        $scope.radio = JSON.parse(radio);
    };


    $scope.AddInventoryFormValidationMsg = function(data)
    {
            console.log(data);
            data.tableWarehouseDetails = $scope.InventorywareHousesData[0];
            if(data.tableSku == null || data.tableSku == undefined)
            {
                growl.error('Product Name is a mandatory');
                return false;
            }

            if(data.tableWarehouseDetails == null || data.tableWarehouseDetails == undefined)
            {
                growl.error('Warehouse is Required');
                return false;
            }

            if(data.tableVendor == null || data.tableVendor == undefined)
            {
                growl.error('Vendor is required');
                return false;
            }

            if(data.tableSkuInventoryMaxRetailPrice == null || data.tableSkuInventoryMaxRetailPrice == undefined || data.tableSkuInventoryMaxRetailPrice == 0)
            {
                growl.error('MRP is required');
                return false;
            }

            if (data.tableSkuInventoryMaxRetailPrice != null &&  data.tableSkuInventoryMinSalePrice != null) {
                if(data.tableSkuInventoryMinSalePrice > data.tableSkuInventoryMaxRetailPrice)
                {
                    growl.error("MSP Must Be Less than MRP")
                    $scope.inventoryData.tableSkuInventoryMinSalePrice = null;
                    return false;
                }
            }

            if(data.tableSkuInventoryAvailableCount == null || data.tableSkuInventoryAvailableCount == undefined)
            {
                growl.error('Available count is required');
                return false;
            }

            if(data.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 1)
            {
                if(data.tableSkuInventoryMfgDate == null || data.tableSkuInventoryMfgDate == undefined)
                {
                    growl.error('Manufacturing date is required');
                    return false;
                }
                if(data.tableSkuInventoryShelfLifeInDays == null || data.tableSkuInventoryShelfLifeInDays == undefined)
                {
                    growl.error('Shelf life is required');
                    return false;
                }
            }

            if(data.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 2) {
                if (data.tableSkuInventoryExpiryDate == null || data.tableSkuInventoryExpiryDate == undefined) {
                    growl.error('Expiry date is required');
                    return false;
                }
            }

            return true;


    }

    //add inventory dialog box code ends here

    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.toggleInvSearchRow = function() {
        $scope.searchInventoryClicked = !$scope.searchInventoryClicked;
    };

    // getting the list of warehouses from backend
    $scope.getWarehouses = function() {
        $scope.wareHousesData = [];
        var warehouseUrl = baseUrl + "/omsservices/webapi/warehouses?uipagename="+$scope.pagename;
        $http.get(warehouseUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesData.push(data[i]);
            }
        }).error(function(error, status) {
        });
    };
    //getting warehouses list ends here


    // add inventory code using restOMS Api of inventory
    $scope.addInventory = function(inventoryData) {
        console.log(inventoryData);
        if($scope.AddInventoryFormValidationMsg(inventoryData) == false){
            return false;
        }
        if (!inventoryData.tableSkuInventoryAvailableCount || inventoryData.tableSkuInventoryAvailableCount == 0) {
            $scope.validAvblQty = true;
            growl.error("Please enter a valid available quantity");
        } else {
            var mfgDate = "";
            var expDate = "";
            if (inventoryData.tableSkuInventoryMfgDate != null) {
                mfgDate = moment(inventoryData.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
            }
            if (inventoryData.tableSkuInventoryExpiryDate != null) {
                expDate = moment(inventoryData.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");
            }

            var postInventoryData = {
                "idtableSkuInventoryId": 1,
                "tableSkuInventoryMaxRetailPrice": inventoryData.tableSkuInventoryMaxRetailPrice,
                "tableSkuInventoryBatchNo": inventoryData.tableSkuInventoryBatchNo,
                "tableSkuInventoryMfgDate": mfgDate,
                "tableSkuInventoryExpiryDate": expDate,
                "tableSkuInventoryRateTotal":inventoryData.tableSkuInventoryRateTotal,
                "tableSkuInventoryShelfLifeInDays": parseInt(inventoryData.tableSkuInventoryShelfLifeInDays),
                "tableSkuInventoryMinSalePrice": inventoryData.tableSkuInventoryMinSalePrice,
                "tableSkuInventoryAvailableCount": parseInt(inventoryData.tableSkuInventoryAvailableCount),
                "tableSkuInventoryInwardQcFailedCount": parseInt(inventoryData.tableSkuInventoryInwardQcFailedCount),
                "tableSku": inventoryData.tableSku,
                "tableWarehouseDetails": inventoryData.tableWarehouseDetails,
                "tableWorkOrders": [],
                "tableSaleOrderSkuInventoryMaps": []
            }
            if (inventoryData.tableVendor != undefined) {
                postInventoryData.tableVendor = inventoryData.tableVendor;
            }

            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/inventory?skuid='+inventoryData.tableSku.idtableSkuId ,
                data: postInventoryData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    growl.success("Inventory Added Successfully");
                    $scope.inventoryData = {};
                    $scope.skuid = "";
                    $scope.skuClientCode = "";
                    postInventoryData = null;
                    $scope.listOfInventoriesCount($scope.vmPager.currentPage);
                    $scope.mode = 'add';
                    $scope.selectedSku = null;
                    $scope.skuClientCode = null;
                    $scope.TableSkuName = null;
                    $scope.skuid = null;
                    $mdDialog.hide();
                    
                }
            }).error(function(error, status) {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else {
                    growl.error("Inventory Cannot be Added");
                }
            });
        }
        
        $scope.genericData.check = null;
        
    };

    //cancel - closing inventory Dialog
    $scope.cancelInventory = function() {
        $scope.availableQuantityMode = false;
        $scope.wData = null;
        $scope.inventoryData = "";
        $scope.kitData = "";
        $scope.splitData = "";
        $scope.freeMailerData = "";
        $scope.qcData = "";
        $scope.stockData = "";
        $scope.stickerData = "";
        $scope.initialSelected = "";
        $scope.freeMailertableWorkOrderSkuQuantity = "";
        $scope.initialSelected1 = "";
        $scope.selectedList = "";
        $scope.invStickerLists = "";
        $scope.radio = "";
        $scope.skuId = "";
        $scope.mode = 'add';
        $scope.dialogBoxKit = 'add';
        $scope.dialogBoxSplit = 'add';
        $scope.dialogBoxFreeMailer = 'add';
        $scope.dialogBoxQC = 'add';
        $scope.dialogBoxStock = 'add';
        $scope.dialogBoxSticker = 'add';
        $scope.products = [];
        $scope.selectedSku = null;
        $scope.skuClientCode = null;
        $scope.TableSkuName = null;
        $scope.skuid = null;
        $mdDialog.hide();
    };

    //Available Quantity Function to get data base on sku id and warehouse id
    $scope.availableQuantity = function(wareHousesData, skuid) {
        if (wareHousesData != null && skuid != null) {
            var wData = wareHousesData;

            $http.get(baseUrl + '/omsservices/webapi/warehouses/' + wData.idtableWarehouseDetailsId + '/skus/' + skuid + '/inventory/inventorycount').success(function(response) {
    
                if (response != null) {
                    $scope.availableQuantityMode = true;
                    $scope.freeMailertableWorkOrderSkuQuantity = response;
                }
                if (response == null || response == '') {
                    $scope.availableQuantityMode = false;
                }
            });
        }
    };


    $scope.checkQuantityAvail = function(quantity, availableQuantity) {
        if (quantity > availableQuantity) {
            growl.error("Please Enter Quantity which is less than or equal to Available Quantity");
            $scope.isDisabled = true;
        }
        if (quantity <= availableQuantity) {
            $scope.isDisabled = false;
        }
    }

    $scope.nullQuantity = function() {
        $scope.freeMailertableWorkOrderSkuQuantity = null;
    };

    //adding list of product for stock audit
    $scope.addProduct = function(tableSku) {

        $scope.products.push({
            tableSku: tableSku.originalObject
        });

        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        tableSku = null;
        $scope.stockData.productObj = null;
    };

    //Start Date and End Date Validations Starts Here for Individual Work Orders
    $scope.callMinStartMaxStart = function() {
        $scope.todayDate = new Date();
        $scope.startminDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.endminDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());
    }
    $scope.callMinStartMaxStart();
    $scope.sendStartDate = function(date) {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate() + 1);
    }

    $scope.sendEndDate = function(date) {
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate() - 1);
    };
    //Start Date and End Date Validations Ends Here

    //Start Date and End Date Validations Starts Here for Main Inventory and Work Orders Screen Starts Here
    $scope.callMainMinStartMaxStart = function() {
        $scope.warehouseid = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.todayDate = new Date();
        $scope.mainstartmaxDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.mainendmaxDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate());

        $scope.invMinDate = new Date(
            $scope.todayDate.getFullYear(),
            $scope.todayDate.getMonth(),
            $scope.todayDate.getDate() + 1);
    };

    $scope.callMainMinStartMaxStart();

    $scope.mainsendStartDate = function(date) {
        $scope.mainstartDateData = new Date(date);
        $scope.mainendminDate = new Date(
            $scope.mainstartDateData.getFullYear(),
            $scope.mainstartDateData.getMonth(),
            $scope.mainstartDateData.getDate());
    };

    $scope.mainsendEndDate = function(date) {
        $scope.mainendDateData = new Date(date);
        $scope.mainstartmaxDate = new Date(
            $scope.mainendDateData.getFullYear(),
            $scope.mainendDateData.getMonth(),
            $scope.mainendDateData.getDate());
    };
    //Start Date and End Date Validations Starts Here for Main Inventory and Work Orders Screen Ends Here

    //Number Validation not allowing -,+,e
    //$scope.Num = function(event) {
    //    var keys = {
    //        '0': 48,
    //        '1': 49,
    //        '2': 50,
    //        '3': 51,
    //        '4': 52,
    //        '5': 53,
    //        '6': 54,
    //        '7': 55,
    //        '8': 56,
    //        '9': 57
    //    };
    //    for (var index in keys) {
    //        if (!keys.hasOwnProperty(index)) continue;
    //        if (event.charCode == keys[index] || event.keyCode == keys[index]) {
    //            return; //default event
    //        }
    //    }
    //    //event.preventDefault();
    //};
    //
    //$scope.Num1 = function(event) {
    //    var keys = {
    //        '0': 48,
    //        '1': 49,
    //        '2': 50,
    //        '3': 51,
    //        '4': 52,
    //        '5': 53,
    //        '6': 54,
    //        '7': 55,
    //        '8': 56,
    //        '9': 57,
    //        '.': 46
    //    };
    //    for (var index in keys) {
    //        if (!keys.hasOwnProperty(index)) continue;
    //        if (event.charCode == keys[index] || event.keyCode == keys[index]) {
    //            return; //default event
    //        }
    //    }
    //    //event.preventDefault();
    //};

    //MSP MRP Validation
    $scope.checkMspGrtMrp = function(mrp, msp) {
        if (msp > mrp) {
            growl.error("MSP Must Be Less than MRP")
            $scope.inventoryData.tableSkuInventoryMinSalePrice = null;
        }
    };

    $scope.validateAvBl = function(block, available) {
        if (block > available) {
            growl.error("�\Blocked Count�\ Must be less than equal to �\Available Count�\.");
            $scope.inventoryData.tableSkuInventoryBlockedCount = "";
        }
    };

    //selecting and calling api
    $scope.stickerProductObj = function(selected) {
        if ((selected != undefined || selected != null) && $scope.wIdSticker != "") {

            var skuIdSticker = selected.originalObject.idtableSkuId;
            $scope.skuProduct = selected.originalObject;
            $http.get(baseUrl + '/omsservices/webapi/warehouses/' + $scope.wIdSticker + '/skus/' + skuIdSticker + '/inventory').success(function(response) {
                $scope.invStickerLists = response;
    
            });
        }
    };

    $scope.allWHouse = function(warehouse) {
        var warehouse = warehouse;
        $scope.wIdSticker = warehouse.idtableWarehouseDetailsId;
    };

    // dialog box to add new kit
    $scope.cancelWorkOrder = function(workOrderId, workOrderData, ev) {
        $scope.workOrderId = workOrderId;
        $scope.workOrderData = workOrderData;
        $mdDialog.show({
                templateUrl: 'dialog333.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    };

    //cancel work order action
    $scope.cancelWorkOrderApi = function(workOrderId, workOrderData, remarks) {
        workOrderData.tableWorkOrderStatusType = {
            "idtableWorkOrderStatusTypeId": 5,
            "tableWorkOrderStatusTypeString": "Cancelled"
        }

        workOrderData.tableWorkOrderRemark = remarks;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/workorder/' + workOrderId + '/cancel',
            data: workOrderData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                growl.success("Work Order Cancelled Successfully");
                $scope.availableQuantityMode = false;
                $scope.wData = null;
                $scope.inventoryData = "";
                $scope.kitData = "";
                $scope.splitData = "";
                $scope.freeMailerData = "";
                $scope.qcData = "";
                $scope.stockData = "";
                $scope.stickerData = "";
                $scope.initialSelected = "";
                $scope.freeMailertableWorkOrderSkuQuantity = "";
                $scope.initialSelected1 = "";
                $scope.selectedList = "";
                $scope.invStickerLists = "";
                $scope.radio = "";
                $scope.skuId = "";
                $scope.mode = 'add';
                $scope.dialogBoxKit = 'add';
                $scope.dialogBoxSplit = 'add';
                $scope.dialogBoxFreeMailer = 'add';
                $scope.dialogBoxQC = 'add';
                $scope.dialogBoxStock = 'add';
                $scope.dialogBoxSticker = 'add';
                $scope.products = [];
                // $scope.listOfWorkOrders();
                $scope.listOfWorkOrderCount($scope.vmPagerWoStart.currentPage);
                $mdDialog.hide();
            }
        }).error(function(error, status) {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Work Order Cannot be Cancelled");
            }
        });
    };

    $scope.fullproductObj = function(selected) {
        if (selected != null) {
            $scope.skuId = selected.originalObject.tableSkuClientSkuCode;
            $scope.skuFullId = selected.originalObject.idtableSkuId;
            $scope.productObj = selected.originalObject;
            if ($scope.wData != null) {
                $scope.availableQuantityMode = true;
                $scope.availableQuantity($scope.wData, selected.originalObject.idtableSkuId);
            }
        }
    };

    $scope.fullmailerObj = function(selected) {
        $scope.skuFullId = selected.originalObject.idtableSkuId;
        if (selected != null) {
            $scope.mailerObj = selected.originalObject;
            if ($scope.wData != null) {
                $scope.availableQuantity($scope.wData, selected.originalObject.idtableSkuId);
            }
        }
    };

    $scope.loadWareHousesData = function(wData) {
        $scope.wData = wData;
        if ($scope.skuFullId != null) {
            $scope.availableQuantityMode = true;
            $scope.availableQuantity($scope.wData, $scope.skuFullId);
        }
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

    //add new qc code
    $scope.addQc = function(qcName) {
        var postNewQcData = {
            "tableSkuQcParameterTypeString": qcName,
            "tableSkuQcParameterTypeIsAdditional": true
        }

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/skuqctypes',
            data: postNewQcData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                growl.success("New QC Type Added Successfully");
                $scope.qcName = null;
                qcName = null;
                $scope.qcTrueLists();
            }
        }).error(function(error, status) {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("New QC Type Cannot be Added");
            }
        });
    };

    $scope.callInitialTabDisabled = function(){
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = true;
    }

//Updated Code By UV
	
	$scope.cancelmastersDialog = function(){
		$mdDialog.hide({
            templateUrl: 'dialogmastersku.tmpl.html'
        });
		
		if($scope.genericData.check == true){
			$mdDialog.show({
	            templateUrl: 'dialog1.tmpl.html',
	            parent: angular.element(document.body),
	            clickOutsideToClose: false,
	            scope: $scope.$new()
	        });
			
		}
	}

	
	$scope.masterSkuDialog = function(ev, check){

	    if($scope.isvendor == true)
        {
            mastersService.fetchVendorSkus(baseUrl,localStorage.getItem("vendorid")).then(function(data){
                $scope.genericData.skusListFiltered = data;
            })
        }
        else
        {
            mastersService.fetchOnlySkus(baseUrl).then(function(data){
                $scope.genericData.skusListFiltered = data;
            })
        }

		$scope.genericData.check = check;
		
		if(check == true){
			$mdDialog.hide({
	            templateUrl: 'dialog1.tmpl.html'});
		}
		
        $mdDialog.show({
            templateUrl: 'dialogmastersku.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
		
	}
	
	$scope.selectSku = function(id){	
		
		$http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
        
        if ($scope.genericData.check == false) {
        	$scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
        } else {
        	$scope.$broadcast("angucomplete-alt:changeInput", "products", data);
        }     
		
		 
		$scope.selectedSku = data;
        $scope.skuClientCode = data.tableSkuClientSkuCode;
        $scope.TableSkuName = data.tableSkuName;
        $scope.skuid = data.idtableSkuId;
		 
        }).error(function(error, status) {
            console.log(error);
			
        });	
		
		$scope.cancelmastersDialog();		
	}

}
//Dialog Controller
function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $scope.selectedSku = null;
        $scope.skuClientCode = null;
        $scope.TableSkuName = null;
        $scope.skuid = null;
        $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
