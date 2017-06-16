myApp.controller('skuController', skuController);
myApp.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
/**
 *File Input - custom call when the file has changed
 */
myApp.directive('onFileChange', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.onFileChange);

            element.bind('change', function() {
                scope.$apply(function() {
                    var files = element[0].files;
                    if (files) {
                        onChangeHandler(files);
                    }
                });
            });

        }
    };
});
myApp.service('fileUpload',['$http', 'growl',function($http, growl) {
    this.uploadFileToUrl = function(file, uploadUrl) {
        var fd = new FormData();
        fd.append('uploadFile', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).success(function() {}).
        error(function(data,status) {
            growl.error("Image can't be uploaded.");
        });
    };
}]);
skuController.$inject = ['$rootScope','$scope', '$http', '$location', '$mdDialog', '$mdMedia', 'fileUpload', 'baseUrl', 'growl', 'downloadSkuTemplateUrl', 'Upload', 'PagerService', '$q', '$routeParams','$timeout','$cookies', 'downloadSkuSalesChannelMapTemplateUrl', 'mastersService'];

function skuController($rootScope, $scope, $http, $location, $mdDialog, $mdMedia, fileUpload, baseUrl, growl, downloadSkuTemplateUrl, Upload, PagerService, $q, $routeParams,$timeout,$cookies,downloadSkuSalesChannelMapTemplateUrl, mastersService) {
    $scope.productDimClicked = false;
    $scope.shelfLifeClicked = false;
    $scope.attributesClicked = false;
    $scope.propertiesClicked = false;
    $scope.kitDetailsClicked = false;
    $scope.virtualkitDetailsClicked = false;
    $scope.inventoryDetailsClicked = false;

    $scope.virtualKitEditable = false;

    $scope.genericData = {};
    $scope.genericData.enableSorting = true;

    $scope.selectedCategory = {};
    $scope.attributeListBindArray = [];
    $scope.attributeListSelectedValuesArray = {};

    $scope.dialogBoxSkuMode = "add";
    $scope.dialogBoxKitMode = "add";
    $scope.dialogBoxVirtualKitMode = "add";

    $scope.searchSKUClicked = false;
    $scope.searchNormalSKUClicked = false;
    $scope.searchKitSKUClicked = false;
    $scope.searchVKitSKUClicked = false;
    $scope.skuClassificationArray = [];

    $scope.skuData = {};
    $scope.skuKitList = [];
    $scope.skuvirtualKitList = [];
    $scope.kitData = {};
    $scope.virtualkitData = {};
    $scope.shelfTypeID = "";
    $scope.start = 0;
    $scope.skuSize = 5;
    $scope.normalSkuStart = 0;
    $scope.normalSkuSize = 5;
    $scope.kitSkuStart = 0;
    $scope.kitSkuSize = 5;
    $scope.virtualKitStart = 0;
    $scope.virtualKitSize = 5;
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';
    $scope.items = ["Poisonous", "Stackable", "Fragile", "Saleable", "USN required" , "Consumable", "Hazardous", "High value", "QC required", "Temperature controlled", "Returnable"];
    $scope.selected = [];
    $scope.brandName = "";
    $scope.categoryName = "";

    $scope.modeSku = "normal";
    $scope.modeNormalSku = "normal";
    $scope.modeKitSku = "normal";
    $scope.modeVKitSku = "normal";

    $scope.downloadSkuTemplateUrl = downloadSkuTemplateUrl;
    
    $scope.genericData.downloadSkuSalesChannelMapTemplateUrl = downloadSkuSalesChannelMapTemplateUrl;
    $scope.skuImageArray = [];
    $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
    $scope.skuImgUrl4 = "images/svg/add_image_active.svg";

    $scope.img1PresentId = 0;
    $scope.img2PresentId = 0;
    $scope.img3PresentId = 0;
    $scope.img4PresentId = 0;
    $scope.fromDelete1 = false;
    $scope.fromDelete2 = false;
    $scope.fromDelete3 = false;
    $scope.fromDelete4 = false;

    $scope.isSubmitDisabledAll = true;
    $scope.isResetDisabledAll = true;
    $scope.isSubmitDisabledSku = true;
    $scope.isResetDisabledSku = true;
    $scope.isSubmitDisabledKit = true;
    $scope.isResetDisabledKit = true;
    $scope.isSubmitDisabledVkit = true;
    $scope.isResetDisabledVkit = true;

    $scope.isProductSelected = false;
    $scope.isQuantityEntered = false;

    $scope.buttonBrandSaveDisable = false;

    $scope.selectedTab = "All";
    $scope.callDisabledAll = function () {
        $scope.isSubmitDisabledAll = false;
    }

    $scope.callDisabledSku = function () {
        $scope.isSubmitDisabledSku = false;
    }

    $scope.callDisabledKit = function () {
        $scope.isSubmitDisabledKit = false;
    }

    $scope.callDisabledVkit = function () {
        $scope.isSubmitDisabledVkit = false;
    }

    $scope.sortTypeAll = "tableSkuSystemNo";
    $scope.directionTypeAll = "desc";
    $scope.sortReverseAll = false;
    $scope.sortTypeNormal = "tableSkuSystemNo";
    $scope.directionTypeNormal = "desc";
    $scope.sortReverseNormal = false;
    $scope.sortTypeKit = "tableSkuSystemNo";
    $scope.directionTypeKit = "desc";
    $scope.sortReverseKit = false;
    $scope.sortTypeVKit = "tableSkuSystemNo";
    $scope.directionTypeVKit = "desc";
    $scope.sortReverseVKit = false;

    $scope.setClassifiactionvalues = function () {
        $scope.skuClassificationArray.push("A");
        $scope.skuClassificationArray.push("B");
        $scope.skuClassificationArray.push("C");
    }

    $scope.setClassifiactionvalues();

    $scope.skuClientCodeChanged = function (skuSellerId) {
        if (skuSellerId) {
            if ($scope.originalSellerSkuId == skuSellerId) {
                $scope.sellerSkuIdChangedFlag = false;
            } else {
                $scope.sellerSkuIdChangedFlag = true;
            }
            $scope.isSellerSkuIdEntered = false;
        } else {
            $scope.isSellerSkuIdEntered = true;
        }
    };

    $scope.skuNameChanged = function (skuName) {
        if (skuName) {
            $scope.isSkuNameEntered = false;
        } else {
            $scope.isSkuNameEntered = true;
        }
    };

    $scope.upcCodeChanged = function (upcCode) {
        if (upcCode) {
            if ($scope.originalupcCode == upcCode) {
                $scope.upcCodeChangedFlag = false;
            } else {
                $scope.upcCodeChangedFlag = true;
            }
            $scope.isUpcCodeEntered = false;
        }
    };

    $scope.skuCategoryChanged = function (catg) {
        $scope.selectedCategory = catg;
        if (catg) {
            $scope.isSkuCategorySelected = false;
            $scope.attributeArray();
        } else {
            $scope.isSkuCategorySelected = true;

        }
    };

    $scope.skuAttributeValueChanged = function (attribkey, attribval) {
        if (attribkey == null || attribkey == undefined || attribval == undefined || attribval == null) {
            return;
        }
        console.log(attribkey);
        console.log(attribval);
        $scope.attributeListBindArray.push(
            {
                "key": attribkey,
                "val": attribval
            })
        $scope.attributeListSelectedValuesArray[attribkey.attributeTypeString] = attribval;
    };

    $scope.skuAttributeValueAdded = function (attribkey, attribval) {
        if (attribkey == null || attribkey == undefined || attribval == undefined || attribval == null) {
            return;
        }
        console.log(attribkey);
        console.log(attribval);
        $scope.attributeListBindArray.push(
            {
                "key": attribkey,
                "val": attribval
            })
        $scope.attributeListSelectedValuesArray[attribkey.attributeTypeString] = attribval;
    };



    $scope.skuBrandChanged = function(brand) {
        if (brand) {
            $scope.isSkuBrandSelected = false;
        } else {
            $scope.isSkuBrandSelected = true;
        }
    };

    $scope.skuDescChanged = function(desc) {
        if (desc) {
            $scope.isSkuDescEntered = false;
        } else {
            $scope.isSkuDescEntered = true;
        }
    };

    $scope.skuLengthChanged = function(len) {
        if (len) {
            $scope.isSkuLengthEntered = false;
        } else {
            $scope.isSkuLengthEntered = true;
        }
    };

    $scope.skuWidthChanged = function(width) {
        if (width) {
            $scope.isSkuWidthEntered = false;
        } else {
            $scope.isSkuWidthEntered = true;
        }
    };

    $scope.skuHeightChanged = function(height) {
        if (height) {
            $scope.isSkuHeightEntered = false;
        } else {
            $scope.isSkuHeightEntered = true;
        }
    };

    $scope.skuWeightChanged = function(weight) {
        if (weight) {
            $scope.isSkuWeightEntered = false;
        } else {
            $scope.isSkuWeightEntered = true;
        }
    };

    $scope.dimUnitChanged = function(dimUnit) {
        if (dimUnit) {
            $scope.isDimUnitSelected = false;
        } else {
            $scope.isDimUnitSelected = true;
        }
    };

    $scope.weightUnitChanged = function(weightUnit) {
        if (weightUnit) {
            $scope.isWeightUnitSelected = false;
        } else {
            $scope.isWeightUnitSelected = true;
        }
    };

    $scope.shelfTypeChanged = function(shelfType) {
        if (shelfType) {
            $scope.isShelfTypeSelected = false;
            $scope.shelfTypeID = shelfType.idtableSkuShelfLifeTypeId;
        } else {
            $scope.isShelfTypeSelected = true;
        }
    };

    $scope.skuMrpChanged = function(mrp) {
        if (mrp) {
            $scope.isSkuMrpEntered = false;
        } else {
            $scope.isSkuMrpEntered = true;
        }
    };

    $scope.skuMspChanged = function(msp) {
        if (msp) {
            $scope.isSkuMspEntered = false;
        } else {
            $scope.isSkuMspEntered = true;
        }
    };

    $scope.batchNoChanged = function(batchNo) {
        if (batchNo) {
            $scope.isBatchNoEntered = false;
        } else {
            $scope.isBatchNoEntered = true;
        }
    };

    $scope.mfgDateSelected = function(mfgDate) {
        if (mfgDate) {
            $scope.isMfgDateSelected = false;
        } else {
            $scope.isMfgDateSelected = true;
        }
    };

    $scope.expDateSelected = function(expDate) {
        if (expDate) {
            $scope.isExpDateSelected = false;
        } else {
            $scope.isExpDateSelected = true;
        }
    };

    $scope.shelfLifeEntered = function(shelfLife) {
        if (shelfLife) {
            $scope.isShelfLifeEntered = false;
        } else {
            $scope.isShelfLifeEntered = true;
        }
    };

    $scope.$on('$routeChangeSuccess', function() {

        var skuLabel = $routeParams.skuLabel;
        if (skuLabel != null) {
            $scope.searchSKUClicked = true;
            $scope.skuString = skuLabel;
            $scope.submitMainSkuAction(skuLabel);
        }

        $scope.isSellerSkuIdEntered = false;
        $scope.isSkuNameEntered = false;
        $scope.isUpcCodeEntered = false;
        $scope.isSkuCategorySelected = false;
        $scope.isSkuBrandSelected = false;
        $scope.isSkuDescEntered = false;
        $scope.isSkuLengthEntered = false;
        $scope.isSkuWidthEntered = false;
        $scope.isSkuHeightEntered = false;
        $scope.isSkuWeightEntered = false;
        $scope.isDimUnitSelected = false;
        $scope.isWeightUnitSelected = false;
        $scope.isShelfTypeSelected = false;
        $scope.isSkuMrpEntered = false;
        $scope.isSkuMspEntered = false;
        $scope.isBatchNoEntered = false;
        $scope.isMfgDateSelected = false;
        $scope.isExpDateSelected = false;
        $scope.isShelfLifeEntered = false;
        $scope.sellerSkuIdChangedFlag = false;
        $scope.upcCodeChangedFlag = false;
        $scope.isNewCatgNameEntered = false;
        $scope.isNewBrandNameEntered = false;
        $scope.isNewAttributeNameEntered = false;
        $scope.originalSellerSkuId = "";
        $scope.originalupcCode = "";
        $scope.listOfSkusCount();
        $scope.listOfNormalSkusCount();
        $scope.listOfKitSkusCount();
        $scope.listOfVirtualKitSkusCount();
        $scope.dimensionsArray();
        $scope.weightArray();
        $scope.categoryTypeArray();
        $scope.shelfTypeArray();
        $scope.brandTypeArray();
    });

    $scope.skuImageHover1 = function() {
        if ($scope.skuImgUrl1 == "images/svg/add_image_active.svg") {
            $scope.skuImgUrl1 = "images/svg/add_image_hover.svg";
        } else if ($scope.skuImgUrl1 == "images/svg/add_image_hover.svg") {
            $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
        }
    };

    $scope.skuImageHover2 = function() {
        if ($scope.skuImgUrl2 == "images/svg/add_image_active.svg") {
            $scope.skuImgUrl2 = "images/svg/add_image_hover.svg";
        } else if ($scope.skuImgUrl2 == "images/svg/add_image_hover.svg") {
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
        }
    };

    $scope.skuImageHover3 = function() {
        if ($scope.skuImgUrl3 == "images/svg/add_image_active.svg") {
            $scope.skuImgUrl3 = "images/svg/add_image_hover.svg";
        } else if ($scope.skuImgUrl3 == "images/svg/add_image_hover.svg") {
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
        }
    };

    $scope.skuImageHover4 = function() {
        if ($scope.skuImgUrl4 == "images/svg/add_image_active.svg") {
            $scope.skuImgUrl4 = "images/svg/add_image_hover.svg";
        } else if ($scope.skuImgUrl4 == "images/svg/add_image_hover.svg") {
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
        }
    };

    $scope.changeSkuImgUrl1 = function(input) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.skuImgUrl1 = e.target.result;
            $scope.skuImgFile1 = input;
            $scope.fromDelete1 = false;
            $scope.skuImageArray[0] = e.target.result;
        }
        if (input) {
            reader.readAsDataURL(input);
        }
    };

    $scope.changeSkuImgUrl2 = function(input) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.skuImgUrl2 = e.target.result;
            $scope.skuImgFile2 = input;
            $scope.fromDelete2 = false;
            $scope.skuImageArray[1] = e.target.result;
        }
        if (input) {
            reader.readAsDataURL(input);
        }
    };

    $scope.changeSkuImgUrl3 = function(input) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.skuImgUrl3 = e.target.result;
            $scope.skuImgFile3 = input;
            $scope.fromDelete3 = false;
            $scope.skuImageArray[2] = e.target.result;
        }
        if (input) {
            reader.readAsDataURL(input);
        }
    };

    $scope.changeSkuImgUrl4 = function(input) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.skuImgUrl4 = e.target.result;
            $scope.skuImgFile4 = input;
            $scope.fromDelete4 = false;
            $scope.skuImageArray[3] = e.target.result;
        }
        if (input) {
            reader.readAsDataURL(input);
        }
    };

    $scope.showAddSkuModal = function ()
    {
        if($scope.categoryTypeLists.length == 0)
        {
            growl.warning("First select category using category master");
            return;
        }
        $("#addSkuModal").modal('show');
    }

    $scope.closeBulkUploadDialog = function(){
        $("#addSkuModal").modal('hide');
        $cookies.put('BulkUploadData','sku');
        $cookies.put('ActiveTab','SKU');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);        
    }
    $scope.uploadBulkOrderFile = function() {
        growl.info("Upload is being processed in the background");
        file = $scope.bulkOrderUploadfile;
        if (file) {
            if (!file.$error) {
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/skubulkupload';

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
                    if ($scope.modeSku == 'normal') {
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeSku == 'mutual') {
                        $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeNormalSku == 'normal') {
                        $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                    }
                    if ($scope.modeNormalSku == 'mutual') {
                        $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                    }
                    $cookies.put('BulkUploadData','sku');
                    $cookies.put('ActiveTab','SKU');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});

                    $scope.dialogBoxSkuMode = "add";
                    $scope.cancelSkuData();

                }, function(resp) {
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };

    $scope.callShelfId = function(shelfiD) {
        var a = JSON.parse(shelfiD);
        $scope.shelfTypeID = a.idtableSkuShelfLifeTypeId;
    };

    $scope.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };

    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

    // fetching list of skus from RestAPI OMS
    $scope.listOfSkus = function(start) {
        var skuListUrl = baseUrl + "/omsservices/webapi/skus?start=" + start + "&size=5&sort="+$scope.sortTypeAll+"&direction=" + $scope.directionTypeAll;
        console.log(skuListUrl);
        $http.get(skuListUrl).success(function(data) {
            console.log(data);
            $scope.skuLists = data;
        }).error(function(error, status) {

        });
    };
    //fetching all skus code ends here

    //fetching list of skus count
    $scope.listOfSkusCount = function(page) {
        var skuMainCountUrl = baseUrl + "/omsservices/webapi/skus/countbytype";
        $http.get(skuMainCountUrl).success(function(data) {
            $scope.skuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.skuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.skuSize = $scope.start + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfSkus($scope.start);
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
    };
    //fetchng list of skus count ends here

    //fetching list of skus from mutually exlusive search SKU
    $scope.listOfMutualSkus = function(start) {
        var skuListUrl = baseUrl + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch;
        skuListUrl += "&start=" + start + "&size=5&sort="+$scope.sortTypeAll+"&direction="+$scope.directionTypeAll;
        console.log(skuListUrl);
        $http.get(skuListUrl).success(function(data) {
            $scope.skuLists = data;
        }).error(function(error, status) {

        });
    };

    //fetching list of mutual skus count
    $scope.listOfMutualSkusCount = function(page) {
        var skuMainCountUrl = baseUrl + "/omsservices/webapi/skus/searchcount?search=" + $scope.wordSearch;
        $http.get(skuMainCountUrl).success(function(data) {
            $scope.skuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.skuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.skuSize = $scope.start + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfMutualSkus($scope.start);
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
    };
    //fetchng list of skus count ends here

    $scope.submitMainSkuAction = function(wordSearch) {
        // $scope.sortTypeAll = "tableSkuClientSkuCode";
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
        $scope.genericData.enableSorting = false;
        $scope.directionTypeAll = "desc";
        $scope.sortReverseAll = false;
        $scope.wordSearch = wordSearch;
        $scope.modeSku = "mutual";
        // $scope.listOfMutualSkus();
        $scope.isSubmitDisabledAll = true;
        $scope.isResetDisabledAll = false;
        var page = undefined;
        $scope.listOfMutualSkusCount(page);
    };

    //clear filter for clearing applied filters
    $scope.clearAllSkuAction = function() {
        $scope.genericData.enableSorting = true;
        $scope.sortTypeAll = "tableSkuSystemNo";
        $scope.directionTypeAll = "desc";
        $scope.modeSku = "normal";
        $scope.wordSearch = null;
        $scope.sortReverseAll = false;
        $scope.isSubmitDisabledAll = true;
        $scope.isResetDisabledAll = false;
        $scope.listOfSkusCount(1);
    }

    $scope.clearNormalSkuAction = function() {
        $scope.genericData.enableSorting = true;
        $scope.sortTypeNormal = "tableSkuSystemNo";
        $scope.directionTypeNormal = "desc";
        $scope.sortReverseNormal = false;
        $scope.modeNormalSku = "normal";
        $scope.wordSearch = null;
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        $scope.listOfNormalSkusCount(1);
    }

    $scope.clearKitSkuAction = function() {
        $scope.genericData.enableSorting = true;
        $scope.sortTypeKit = "tableSkuSystemNo";
        $scope.directionTypeKit = "desc";
        $scope.sortReverseKit = false;
        $scope.modeKitSku = "normal";
        $scope.wordSearch = null;
        $scope.isSubmitDisabledKit = true;
        $scope.isResetDisabledKit = false;
        $scope.listOfKitSkusCount(1);
    }

    $scope.clearVkitSkuAction = function() {
        $scope.genericData.enableSorting = true;
        $scope.sortTypeVKit = "tableSkuSystemNo";
        $scope.directionTypeVKit = "desc";
        $scope.sortReverseVKit = false;
        $scope.modeVKitSku = "normal";
        $scope.wordSearch = null;
        $scope.isSubmitDisabledVkit = true;
        $scope.isResetDisabledVkit = false;
        $scope.listOfVirtualKitSkusCount(1);
    }


    $scope.toggleAllSkuSearchRow = function() {
        $scope.searchSKUClicked = !$scope.searchSKUClicked;
    };

    //Fetching Normal SKU List from Normal SKU Rest API OMS
    $scope.listOfNormalSkus = function(start) {
        var normalskuListUrl = baseUrl + "/omsservices/webapi/skus?type=normal&start=" + start + "&size=5&sort="+$scope.sortTypeNormal+"&direction="+$scope.directionTypeNormal;
        $http.get(normalskuListUrl).success(function(data) {
            $scope.normalSkuLists = data;
        }).error(function(error, status) {

        });
    };
    //Fetching Normal SKU List from Normal SKU Rest API OMS Ends Here

    //fetching list of skus count
    $scope.listOfNormalSkusCount = function(page) {
        var normalskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/countbytype?type=normal";
        $http.get(normalskuMainCountUrl).success(function(data) {
            $scope.normalskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.normalskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerNormal = vm.pager;

                    $scope.normalSkuStart = (vm.pager.currentPage - 1) * 5;
                    $scope.normalSkuSize = $scope.normalSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfNormalSkus($scope.normalSkuStart);
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
    };
    //fetchng list of skus count ends here

    //fetching list of skus from mutually exlusive search SKU
    $scope.listOfNormalMutualSkus = function(start) {
        var normalskuListUrl = baseUrl + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=1";
        normalskuListUrl += "&start=" + start + "&size=5&sort="+$scope.sortTypeNormal+"&direction="+$scope.directionTypeNormal;
        $http.get(normalskuListUrl).success(function(data) {
            $scope.normalSkuLists = data;
        }).error(function(error, status) {

        });
    };

    //fetching list of mutual skus count
    $scope.listOfNormalMutualSkusCount = function(page) {
        var normalskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/searchcount?search=" + $scope.wordSearch + "&skutype=1";
        $http.get(normalskuMainCountUrl).success(function(data) {
            $scope.normalskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.normalskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerNormal = vm.pager;

                    $scope.normalSkuStart = (vm.pager.currentPage - 1) * 5;
                    $scope.normalSkuSize = $scope.normalSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfNormalMutualSkus($scope.normalSkuStart);
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
    };
    //fetchng list of skus count ends here

    $scope.submitNormalMainSkuAction = function(wordSearch) {
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
        $scope.genericData.enableSorting = false;
        $scope.wordSearch = wordSearch;
        $scope.modeNormalSku = "mutual";
        // $scope.listOfNormalMutualSkus();
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfNormalMutualSkusCount(page);
    };

    $scope.toggleNormalSkuSearchRow = function() {
        $scope.searchNormalSKUClicked = !$scope.searchNormalSKUClicked;
    };

    //Fetching Kit List from Kit SKU Rest API OMS
    $scope.listOfKitSkus = function(start) {
        var kitListUrl = baseUrl + "/omsservices/webapi/skus?type=kit&start=" + start + "&size=5&sort="+$scope.sortTypeKit+"&direction="+$scope.directionTypeKit;
        $http.get(kitListUrl).success(function(data) {
            $scope.kitSkuLists = data;
        }).error(function(error, status) {

        });
    };
    //Fetching Kit List from Kit SKU Rest API OMS Ends Here

    //fetching list of kit count
    $scope.listOfKitSkusCount = function(page) {
        var kitskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/countbytype?type=kit";
        $http.get(kitskuMainCountUrl).success(function(data) {
            $scope.kitskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.kitskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerKit = vm.pager;

                    $scope.kitSkuStart = (vm.pager.currentPage - 1) * 5;
                    $scope.kitSkuSize = $scope.kitSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfKitSkus($scope.kitSkuStart);
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
    };
    //fetchng list of skus count ends here

    //fetching list of skus from mutually exlusive search SKU
    $scope.listOfKitMutualSkus = function(start) {
        var kitskuListUrl = baseUrl + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=2";
        kitskuListUrl += "&start=" + start + "&size=5&sort="+$scope.sortTypeKit+"&direction="+$scope.directionTypeKit;
        $http.get(kitskuListUrl).success(function(data) {
            $scope.kitSkuLists = data;
        }).error(function(error, status) {

        });
    };

    //fetching list of mutual skus count
    $scope.listOfKitMutualSkusCount = function(page) {
        var kitskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/searchcount?search=" + $scope.wordSearch + "&skutype=2";
        $http.get(kitskuMainCountUrl).success(function(data) {
            $scope.kitskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.kitskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerKit = vm.pager;

                    $scope.kitSkuStart = (vm.pager.currentPage - 1) * 5;
                    $scope.kitSkuSize = $scope.kitSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfKitMutualSkus($scope.kitSkuStart);
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
    };
    //fetchng list of skus count ends here

    $scope.submitKitMainSkuAction = function(wordSearch) {
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
        $scope.genericData.enableSorting = false;
        $scope.wordSearch = wordSearch;
        $scope.modeKitSku = "mutual";
        // $scope.listOfKitMutualSkus();
        $scope.isSubmitDisabledKit = true;
        $scope.isResetDisabledKit = false;
        var page = undefined;
        $scope.listOfKitMutualSkusCount(page);
    };

    $scope.toggleKitSearchRow = function() {
        $scope.searchKitSKUClicked = !$scope.searchKitSKUClicked;
    };

    //Fetching Virtual Kit List from Virtual Kit SKU Rest API OMS
    $scope.listOfVirtualKitSkus = function(start) {
        var virtualkitListUrl = baseUrl + "/omsservices/webapi/skus?type=virtualkit&start=" + start + "&size=5&sort="+$scope.sortTypeVKit+"&direction="+$scope.directionTypeVKit;
        $http.get(virtualkitListUrl).success(function(data) {
            $scope.virtualkitSkuLists = data;
        }).error(function(error, status) {

        });
    };
    //Fetching Virtual Kit List from Virtual Kit SKU Rest API OMS Ends Here

    //fetching list of virtual kit count
    $scope.listOfVirtualKitSkusCount = function(page) {
        var virtualkitskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/countbytype?type=virtualkit";
        $http.get(virtualkitskuMainCountUrl).success(function(data) {
            $scope.virtualkitskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.virtualkitskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerVKit = vm.pager;

                    $scope.virtualKitStart = (vm.pager.currentPage - 1) * 5;
                    $scope.virtualKitSize = $scope.kitSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfVirtualKitSkus($scope.virtualKitStart);
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
    };
    //fetchng list of skus count ends here

    //fetching list of virtual kit from mutually exlusive search SKU
    $scope.listOfVirtualKitMutualSkus = function(start) {
        var virtualkitskuListUrl = baseUrl + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=3";
        virtualkitskuListUrl += "&start=" + start + "&size=5&sort="+$scope.sortTypeVKit+"&direction="+$scope.directionTypeVKit;
        $http.get(virtualkitskuListUrl).success(function(data) {
            $scope.virtualkitSkuLists = data;
        }).error(function(error, status) {

        });
    };

    //fetching list of mutual skus count
    $scope.listOfVirtualKitMutualSkusCount = function(page) {
        var virtualkitskuMainCountUrl = baseUrl + "/omsservices/webapi/skus/searchcount?search=" + $scope.wordSearch + "&skutype=3";
        $http.get(virtualkitskuMainCountUrl).success(function(data) {
            $scope.virtualkitskuMainCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.virtualkitskuMainCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                    $scope.vmPagerVKit = vm.pager;

                    $scope.virtualKitStart = (vm.pager.currentPage - 1) * 5;
                    $scope.virtualKitSize = $scope.kitSkuStart + 5;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfVirtualKitMutualSkus($scope.virtualKitStart);
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
    };
    //fetchng list of skus count ends here

    $scope.submitVirtualKitMainSkuAction = function(wordSearch) {
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
        $scope.genericData.enableSorting = false;
        $scope.wordSearch = wordSearch;
        $scope.modeVKitSku = "mutual";
        // $scope.listOfVirtualKitMutualSkus();
        $scope.isSubmitDisabledVkit = true;
        $scope.isResetDisabledVkit = false;
        var page = undefined;
        $scope.listOfVirtualKitMutualSkusCount(page);
    };

    $scope.toggleVirtualKitSearchRow = function() {
        $scope.searchVKitSKUClicked = !$scope.searchVKitSKUClicked;
    };

    // dialog box to add new sku
    $scope.showskuAddBox = function(ev,mode) {

        $scope.dialogBoxSkuMode = mode;
        if(mode == "add")
        {
            $scope.skuData = {};
        }
        if($scope.categoryTypeLists.length == 0)
        {
            growl.warning("First select category using category master");
            return;
        }
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
        if ($scope.dialogBoxSkuMode == 'add') {
            $scope.skuClientCode = "";
            $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
        }
        

        $('#addNormalSkuDialog').modal('show');

    };

    //dialog box to choose sku type
    $scope.showskuTypeBox = function(ev) {
        $mdDialog.show({
                templateUrl: 'dialog10.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })

    };
    //generic cancel to call everywhere.
    $scope.cancelGeneric = function() {
        $mdDialog.hide();
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

    $scope.getNormalSku = function(id) {
        var q = $q.defer();

        $http.get(baseUrl + '/omsservices/webapi/skus/' + id).success(function(response) {
            $scope.skuData = response;
            $scope.skuClientCode = response.idtableSkuId;
            $scope.originalSellerSkuId = response.idtableSkuId;
            $scope.originalupcCode = response.tableSkuPrimaryUpcEan;
            $scope.skuData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.tableSkuNode.idskuNodeId);
            $scope.skuData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.tableSkuBrandCode.idtableSkuBrandCodeId);
            if(response.tableSkuUodmType){
                $scope.skuData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.tableSkuUodmType.idtableSkuUodmTypeId);
            }
            else{
                $scope.skuData.tableSkuUodmType = null;
            }
            if(response.tableSkuUowmType){
                $scope.skuData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.tableSkuUowmType.idtableSkuUowmTypeId);
            }
            else{
                $scope.skuData.tableSkuUowmType = null;
            }
            $scope.skuData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
            $scope.skuData.tableSkuAbcClassification = response.tableSkuAbcClassification;
            $scope.attributeListArray = [];
            var attrUrl = baseUrl + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.skuData.tableSkuNode.idskuNodeId;
            $http.get(attrUrl).success(function(data)
            {
                $scope.attributeListArray = data;

                if (response.tableSkuAttributeses != null && response.tableSkuAttributeses.length != 0)
                {
                    for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                    {
                        var found = false;
                        for (var i = 0; i < response.tableSkuAttributeses.length; i++)
                        {
                            if ($scope.attributeListArray[superCount].idattributeTypeId == response.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId)
                            {
                                found = true;
                                $scope.attributeListBindArray.push(
                                    {
                                        "key": response.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                        "val": response.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
                                    }
                                );

                                for(var possibleValueCounter = 0 ; $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length ; possibleValueCounter++)
                                {
                                    if($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId)
                                    {
                                        $scope.attributeListSelectedValuesArray[response.tableSkuAttributeses[superCount].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
                                        break;
                                    }
                                }


                            }

                        }
                        if(found == false)
                        {
                            $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                        }
                    }
                }

                if (response.tableSkuAttributeses == null || (response.tableSkuAttributeses != null  && response.tableSkuAttributeses.length == 0)) {

                    for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                    {
                        $scope.attributeListSelectedValuesArray[!$scope.attributeListArray[superCount].tableSkuNodeAttributeType ? 0 : $scope.attributeListArray[superCount].tableSkuNodeAttributeType.attributeTypeString] = null;

                    }
                }

                $scope.pushPropertiesToArray(response);

            }).error(function(error, status)
            {

            });
            q.resolve(true);
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    };

    $scope.pushPropertiesToArray = function(response){
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
    }

    $scope.getSkuImages = function(id) {
        var q = $q.defer();

        $scope.skuImgUrl1 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl2 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl3 = "images/svg/add_image_active.svg"
        $scope.skuImgUrl4 = "images/svg/add_image_active.svg"

        $http.get(baseUrl + "/omsservices/webapi/skus/" + id + "/images").success(function(responseImages) {
            if (responseImages != null) {
                if (responseImages[0] != null) {
                    $scope.skuImgUrl1 = responseImages[0].tableSkuImageIconUrl;
                    $scope.img1PresentId = responseImages[0].idtableSkuImageImageId;
                }
                if (responseImages[1] != null) {
                    $scope.skuImgUrl2 = responseImages[1].tableSkuImageIconUrl;
                    $scope.img2PresentId = responseImages[1].idtableSkuImageImageId;
                }
                if (responseImages[2] != null) {
                    $scope.skuImgUrl3 = responseImages[2].tableSkuImageIconUrl;
                    $scope.img3PresentId = responseImages[2].idtableSkuImageImageId;
                }
                if (responseImages[3] != null) {
                    $scope.skuImgUrl4 = responseImages[3].tableSkuImageIconUrl;
                    $scope.img4PresentId = responseImages[3].idtableSkuImageImageId;
                }
                q.resolve(true);
            }
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    };

    $scope.getKit = function(id)
    {
        var q = $q.defer();

        $http.get(baseUrl + '/omsservices/webapi/skus/kit/' + id).success(function(response)
        {
            $scope.kitData = response.parentSku;
            $scope.skuClientCode = response.parentSku.idtableSkuId;
            $scope.originalSellerSkuId = response.parentSku.idtableSkuId;
            $scope.originalupcCode = response.parentSku.tableSkuPrimaryUpcEan;
            $scope.kitData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.parentSku.tableSkuNode.idskuNodeId);
            $scope.kitData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.parentSku.tableSkuBrandCode.idtableSkuBrandCodeId);
            if(response.parentSku.tableSkuUodmType){
                $scope.kitData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.parentSku.tableSkuUodmType.idtableSkuUodmTypeId);
            }
            else{
                $scope.kitData.tableSkuUodmType = null;
            }
            if(response.parentSku.tableSkuUowmType){
                $scope.kitData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.parentSku.tableSkuUowmType.idtableSkuUowmTypeId);
            }
            else{
                $scope.kitData.tableSkuUowmType = null;
            }
            $scope.kitData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.parentSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
            $scope.kitData.tableSkuAbcClassification = response.parentSku.tableSkuAbcClassification;
            $scope.attributeListArray = [];
            var attrUrl = baseUrl + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.kitData.tableSkuNode.idskuNodeId;
            $http.get(attrUrl).success(function(data)
            {
                $scope.attributeListArray = data;

                if (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length != 0)
                {
                    for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                    {
                        var found = false;
                        for (var i = 0; i < response.parentSku.tableSkuAttributeses.length; i++)
                        {
                            if ($scope.attributeListArray[superCount].idattributeTypeId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId)
                            {
                                found = true;
                                $scope.attributeListBindArray.push(
                                    {
                                        "key": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                        "val": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
                                    }
                                );

                                for(var possibleValueCounter = 0 ; $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length ; possibleValueCounter++)
                                {
                                    if($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId)
                                    {
                                        $scope.attributeListSelectedValuesArray[response.parentSku.tableSkuAttributeses[superCount].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
                                        break;
                                    }
                                }


                            }

                        }
                        if(found == false)
                        {
                            $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                        }
                    }
                }

                if (response.parentSku.tableSkuAttributeses == null || (response.parentSku.tableSkuAttributeses != null  && response.parentSku.tableSkuAttributeses.length == 0)) {

                    for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                    {
                        $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].tableSkuNodeAttributeType.attributeTypeString] = null;

                    }
                }

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

                //
                for (var i = 0; i < response.skuKitList.length; i++) {
                    $scope.skuKitList.push({
                        sku: response.skuKitList[i].skuname,
                        quantity: response.skuKitList[i].quantity
                    });
                }

            }).error(function(error) {

            });
            q.resolve(true);
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    }


    $scope.getVirtualKit = function(id) {
        var q = $q.defer();

        $http.get(baseUrl + '/omsservices/webapi/skus/virtualkit/' + id).success(function (response) {
            $scope.virtualkitData = response.parentSku;
            $scope.virtualKitEditable = response.editable;
            $scope.skuClientCode = response.parentSku.idtableSkuId;
            $scope.originalSellerSkuId = response.parentSku.idtableSkuId;
            $scope.originalupcCode = response.parentSku.tableSkuPrimaryUpcEan;
            $scope.virtualkitData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.parentSku.tableSkuNode.idskuNodeId);
            $scope.virtualkitData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.parentSku.tableSkuBrandCode.idtableSkuBrandCodeId);
            if($scope.virtualkitData.tableSkuUodmType){
                $scope.virtualkitData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.parentSku.tableSkuUodmType.idtableSkuUodmTypeId);
            }
            else{
                $scope.virtualkitData.tableSkuUodmType = null;
            }
            if($scope.virtualkitData.tableSkuUowmType){
                $scope.virtualkitData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.parentSku.tableSkuUowmType.idtableSkuUowmTypeId);
            }
            else{
                $scope.virtualkitData.tableSkuUowmType = null;
            }
            $scope.virtualkitData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.parentSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
            $scope.virtualkitData.tableSkuAbcClassification  = response.parentSku.tableSkuAbcClassification;
            $scope.attributeListArray = [];
            var attrUrl = baseUrl + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.virtualkitData.tableSkuNode.idskuNodeId;
            $http.get(attrUrl).success(function (data) {
                $scope.attributeListArray = data;

                if (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length != 0) {
                    for (var superCount = 0; superCount < $scope.attributeListArray.length; superCount++) {
                        var found = false;
                        for (var i = 0; i < response.parentSku.tableSkuAttributeses.length; i++) {
                            if ($scope.attributeListArray[superCount].idattributeTypeId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId) {
                                found = true;
                                $scope.attributeListBindArray.push(
                                    {
                                        "key": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                        "val": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
                                    }
                                );

                                for (var possibleValueCounter = 0; $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length; possibleValueCounter++) {
                                    if ($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId) {
                                        $scope.attributeListSelectedValuesArray[response.parentSku.tableSkuAttributeses[superCount].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
                                        break;
                                    }
                                }


                            }

                        }
                        if (found == false) {
                            $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                        }
                    }
                }

                if (response.parentSku.tableSkuAttributeses == null || (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length == 0)) {

                    for (var superCount = 0; superCount < $scope.attributeListArray.length; superCount++) {
                        $scope.attributeListSelectedValuesArray[!$scope.attributeListArray[superCount].tableSkuNodeAttributeType ? 0 : $scope.attributeListArray[superCount].tableSkuNodeAttributeType.attributeTypeString] = null;

                    }
                }

                if (response.parentSku.tableSkuIsPoisonous == true) {
                    $scope.selected.push("Poisonous");
                }

                if (response.parentSku.tableSkuIsStackable == true) {
                    $scope.selected.push("Stackable");
                }

                if (response.parentSku.tableSkuIsFragile == true) {
                    $scope.selected.push("Fragile");
                }

                if (response.parentSku.tableSkuIsSaleable == true) {
                    $scope.selected.push("Saleable");
                }

                if (response.parentSku.tableSkuIsUsnRequired == true) {
                    $scope.selected.push("USN required");
                }

                if (response.parentSku.tableSkuIsConsumable == true) {
                    $scope.selected.push("Consumable");
                }

                if (response.parentSku.tableSkuIsHazardous == true) {
                    $scope.selected.push("Hazardous");
                }

                if (response.parentSku.tableSkuIsHighValue == true) {
                    $scope.selected.push("High value");
                }

                if (response.parentSku.tableSkuIsQcRequired == true) {
                    $scope.selected.push("QC required");
                }

                if (response.parentSku.tableSkuIsReturnable == true) {
                    $scope.selected.push("Returnable");
                }

                if (response.parentSku.tableSkuIsTemperatureControlled == true) {
                    $scope.selected.push("Temperature controlled");
                }
                $scope.skuvirtualKitList = response.skuKitList;

                if (response.parentSku.tableSkuShelfLifeType == 1) {
                    $scope.shelfTypeID = 1;

                }

                if (response.parentSku.tableSkuShelfLifeType == 2) {
                    $scope.shelfTypeID = 2;
                }

                $scope.virtualkitData.tableSkuInventory = {};

                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMaxRetailPrice = response.tableSkuInventory.tableSkuInventoryMaxRetailPrice;
                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMinSalePrice = response.tableSkuInventory.tableSkuInventoryMinSalePrice;
                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryBatchNo = response.tableSkuInventory.tableSkuInventoryBatchNo;
                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryShelfLifeInDays = response.tableSkuInventory.tableSkuInventoryShelfLifeInDays;
                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate = response.tableSkuInventory.tableSkuInventoryMfgDate;
                $scope.virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate = response.tableSkuInventory.tableSkuInventoryExpiryDate;

            }).error(function (error)
            {

            });
            q.resolve(true);
        }).error(function(error) {
            q.reject(false);
        });
        return q.promise;
    }

        // dialog box to edit sku by id
    $scope.editSku = function(ev, id, type) {

        if (type == "Normal") {

            $scope.attributeListBindArray = [];
            $scope.getNormalSku(id).then(
                function(v) {
                    $scope.getSkuImages(id).then(
                        function(v) {
                            if (Object.keys($scope.skuData).length > 0) {
                                $scope.pushPropertiesToArray($scope.skuData);
                                $scope.showskuAddBox(ev,'edit');
                            }
                        },
                        function(err) {}
                    );
                },
                function(err) {}
            );
        }

        if (type == 'Kit') {
            $scope.dialogBoxKitMode = "edit";
            $scope.attributeListBindArray = [];
            $scope.getKit(id).then(
                function(v) {
                    $scope.getSkuImages(id).then(
                        function(v) {
                            if (Object.keys($scope.kitData).length > 0) {
                                $scope.pushPropertiesToArray($scope.kitData);
                                $scope.showkitAddBox(ev, 'edit');
                            }
                        },
                        function(err) {}
                    );
                },
                function(err) {}
            );
        }

        if (type == 'VirtualKit') {
            $scope.dialogBoxVirtualKitMode = "edit";
            $scope.attributeListBindArray = [];
            $scope.getVirtualKit(id).then(
                function(v) {
                    $scope.getSkuImages(id).then(
                        function(v) {
                            if (Object.keys($scope.virtualkitData).length > 0) {
                                $scope.pushPropertiesToArray($scope.virtualkitData);
                                $scope.showvirtualKitAddBox(ev, 'edit');
                            }
                        },
                        function(err) {}
                    );
                },
                function(err) {}
            );
        }
    };

    // dialog box to add new kit
    $scope.showkitAddBox = function(ev) {
        if($scope.categoryTypeLists.length == 0)
        {
            growl.warning("First select category using category master");
            return;
        }
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;

        if ($scope.dialogBoxKitMode == 'add') {
            $scope.skuKitList = [];
            $scope.skuClientCode = "";
            $scope.selected = [];
            $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
        }
        
        $('#addKitDialog').modal('show');

    };

    $scope.expDateMin = new Date();
    // dialog box to add new virtual kit
    $scope.showvirtualKitAddBox = function(ev) {
        if($scope.categoryTypeLists.length == 0)
        {
            growl.warning("First select category using category master");
            return;
        }
        var todayDate = new Date();
        $scope.mfgDateMax = new Date(
            todayDate.getFullYear(),
            todayDate.getMonth(),
            todayDate.getDate()
        );
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
        if ($scope.dialogBoxVirtualKitMode == 'add') {
            $scope.skuClientCode = "";
            $scope.selected = [];
            $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
        }
        
        $('#addVirtualKitDialog').modal('show');

    };

    //getting the dimensions from backend
    $scope.dimensionsArray = function() {
        var dimUrl = baseUrl + "/omsservices/webapi/skuuodmtypes"
        $http.get(dimUrl).success(function(data) {
            $scope.dimLists = data;
        }).error(function(error, status) {

        });
    };
    //ends here getting the dimensions from backend

    //getting the weight units from backend
    $scope.weightArray = function() {
        var wieghtUrl = baseUrl + "/omsservices/webapi/skuuowmtypes"
        $http.get(wieghtUrl).success(function(data) {
            $scope.weightLists = data;
        }).error(function(error, status) {

        });
    };
    //ends here - getting the weight unit from backend

    //getting the attributes from backend
    $scope.attributeArray = function() {
        var deferred = $q.defer();
        $scope.attributeListArray = [];
        var attrUrl = baseUrl + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.selectedCategory.idskuNodeId;
        $http.get(attrUrl).success(function(data) {
            $scope.attributeListArray = data;
            deferred.resolve(data);
        }).error(function(error, status) {
            deferred.reject(false);

        });

        return deferred.promise;

    };
    //ends here - getting the attributes from backend

    //getting the shelf types from backend
    $scope.shelfTypeArray = function() {
        var shelfTypeUrl = baseUrl + "/omsservices/webapi/skushelflifetypes"
        $http.get(shelfTypeUrl).success(function(data) {
            $scope.shelfTypeLists = data;
        }).error(function(error, status) {

        });
    };
    //ends here - getting the shelf types from backend

    //getting category types from backend
    $scope.categoryTypeArray = function() {
        var categoryTypeUrl = baseUrl + "/omsservices/webapi/skunode?selected=true";
        $http.get(categoryTypeUrl).success(function(data) {
            $scope.categoryTypeLists = data;
        }).error(function(error, status) {

        });
    };
    //ends here - getting the category types from backend

    //getting brand types from backend
    $scope.brandTypeArray = function() {
        var brandTypeUrl = baseUrl + "/omsservices/webapi/skubrandcodes";
        $http.get(brandTypeUrl).success(function(data) {
            $scope.brandTypeLists = data;
        }).error(function(error, status) {

        });
    };
    //ends here - getting the category types from backend

    //opening and closing search accordian for different properties and accordian
    $scope.productDiminvRow = function() {
        $scope.productDimClicked = !$scope.productDimClicked;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };

    $scope.attributesinvRow = function() {
        $scope.attributesClicked = !$scope.attributesClicked;
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };

    $scope.shelfLifeinvRow = function() {
        $scope.shelfLifeClicked = !$scope.shelfLifeClicked;
        $scope.productDimClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };

    $scope.propinvRow = function() {
        $scope.propertiesClicked = !$scope.propertiesClicked;
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };


    $scope.kitDetinvRow = function() {
        $scope.kitDetailsClicked = !$scope.kitDetailsClicked;
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };

    $scope.virtualkitDetinvRow = function() {
        $scope.virtualkitDetailsClicked = !$scope.virtualkitDetailsClicked;
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;
    };

    $scope.inventoryDetinvRow = function() {
        $scope.inventoryDetailsClicked = !$scope.inventoryDetailsClicked;
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
    };

    //opening and closing search accordian for different properties and accordian ends here

    //dynamic upload file code
    $scope.uploadFile = function() {
        var file = $scope.myFile;
    };

    $scope.onFilesSelected = function(files) {
        $scope.myFile = files[0];
    };

    $scope.onFilesSelected1 = function(files) {
        $scope.myFile1 = files[0];
    };

    $scope.onFilesSelected2 = function(files) {
        $scope.myFile2 = files[0];
    };

    $scope.onFilesSelected3 = function(files) {
        $scope.myFile3 = files[0];
    };
    //ends here dynamic file code ends here

    //code for adding kit details in table
    $scope.addKitDetails = function(tableSku, tableSaleOrderSkusSkuQuantity, id) {

        console.log(tableSku);
        if (!tableSku) {
            growl.error("Please select a Product first!");
            $scope.isProductSelected = true;
        } else if (!tableSaleOrderSkusSkuQuantity) {
            growl.error("Please enter the Product's Quantity!");
            $scope.isQuantityEntered = true;
        } else if (tableSaleOrderSkusSkuQuantity < 1) {
            growl.error("Please enter a valid Product's Quantity!");
            $scope.isQuantityEntered = true;
        }else{
            var dirty = false;

            for (var i = 0; i < $scope.skuKitList.length; i++) {
                if ($scope.skuKitList[i].sku.idtableSkuId == tableSku.originalObject.idtableSkuId) {
                    dirty = true;
                }
            }

            if (dirty) {
                growl.error("The selected SKU is already part of the current kits. Delete the existing item first to add new kit.");
                $scope.isProductSelected = true;
            }

            else{
                $scope.skuKitList.push({
                    sku: tableSku.originalObject,
                    quantity: tableSaleOrderSkusSkuQuantity
                });

                $scope.$broadcast('angucomplete-alt:clearInput', 'kits');
                tableSku = null;
                tableSaleOrderSkusSkuQuantity = null;
                $scope.kitData.productObj = null;
                $scope.isProductSelected = false;
                $scope.isQuantityEntered = false;

            }
        }



    }; //ends here


    //code for adding kit details in table
    $scope.addVirtualKitDetails = function(tableSku, tableSaleOrderSkusSkuQuantity, id) {

        console.log(tableSku);
        if (!tableSku) {
            growl.error("Please select a Product first!");
            $scope.isProductSelected = true;
        } else if (!tableSaleOrderSkusSkuQuantity) {
            growl.error("Please enter the Product's Quantity!");
            $scope.isQuantityEntered = true;
        } else if (tableSaleOrderSkusSkuQuantity < 1) {
            growl.error("Please enter a valid Product's Quantity!");
            $scope.isQuantityEntered = true;
        }else{
            var dirty = false;

            for (var i = 0; i < $scope.skuvirtualKitList.length; i++) {
                if ($scope.skuvirtualKitList[i].skuid == tableSku.originalObject.idtableSkuId) {
                    dirty = true;
                }
            }

            if (dirty) {
                growl.error("The selected SKU is already part of the current virtual kits. Delete the existing item first to add new virtual kit.");
                $scope.isProductSelected = true;
            }

            else{
                $scope.skuvirtualKitList.push({
                    skuid: tableSku.originalObject.idtableSkuId,
                    quantity: tableSaleOrderSkusSkuQuantity,
                    skuname:tableSku.originalObject.tableSkuName
                });

                $scope.$broadcast('angucomplete-alt:clearInput', 'virtualkits');
                tableSku = null;
                tableSaleOrderSkusSkuQuantity = null;
                $scope.isProductSelected = false;
                $scope.isQuantityEntered = false;

            }
        }



    }; //ends here

    //code for saving the sku data in skuspi to backend
    $scope.saveSkuDataInDb = function(skuData) {
        $scope.tableSkuAttributeses = [];

        for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
        {
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
        }
       $scope.bindProperties();

        var postSkuData = skuData;
        if(!postSkuData.tableSkuUodmType){
            postSkuData.tableSkuLength = null ;
            postSkuData.tableSkuWidth = null;
            postSkuData.tableSkuHeight = null;
        }
        if(!postSkuData.tableSkuUowmType){
            postSkuData.tableSkuWeight = null ;
        }

        postSkuData.tableSkuIsPoisonous = $scope.tableSkuIsPoisonous;
        postSkuData.tableSkuIsStackable = $scope.tableSkuIsStackable;
        postSkuData.tableSkuIsFragile = $scope.tableSkuIsFragile;
        postSkuData.tableSkuIsSaleable = $scope.tableSkuIsSaleable;
        postSkuData.tableSkuIsUsnRequired = $scope.tableSkuIsUsnRequired;
        postSkuData.tableSkuIsConsumable = $scope.tableSkuIsConsumable;
        postSkuData.tableSkuIsHazardous = $scope.tableSkuIsHazardous;
        postSkuData.tableSkuIsHighValue =  $scope.tableSkuIsHighValue;
        postSkuData.tableSkuIsQcRequired = $scope.tableSkuIsQcRequired;
        postSkuData.tableSkuIsTemperatureControlled = $scope.tableSkuIsTemperatureControlled;
        postSkuData.tableSkuIsReturnable = $scope.tableSkuIsReturnable;
        postSkuData.tableSkuAttributeses = $scope.tableSkuAttributeses;
        postSkuData.tableSkuStatusType = {
                                            "idtableSkuStatusTypeId": 1,
                                            "tableSkuStatusTypeString": "Active"
                                        };
        postSkuData.tableSkuType = {
                                        "idtableSkuTypeId": 1,
                                        "tableSkuTypeString": "Normal"
                                    }




        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/skus',
            data: postSkuData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {

            if (res) {
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + res.idtableSkuId + '/images/';
                $scope.uploadSkuImages(uploadUrl).then(
                    function(v) {
                        if ($scope.modeSku == 'normal') {
                            // $scope.listOfSkus();
                            $scope.listOfSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeSku == 'mutual') {
                            // $scope.listOfMutualSkus();
                            $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeNormalSku == 'normal') {
                            // $scope.listOfNormalSkus();
                            $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                        }
                        if ($scope.modeNormalSku == 'mutual') {
                            // $scope.listOfNormalMutualSkus();
                            $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                        }
                        $scope.dialogBoxSkuMode = "add";
                        $scope.cancelSkuData();
                        growl.success("Normal SKU Added Successfully");
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Normal SKU Cannot Be Added");
            }
            $scope.dialogBoxSkuMode = "add";
        });
    };
    //ends here-code for saving the sku data in skuspi to backend

    $scope.cancelSkuData = function(ev) {
        console.log($scope.skuKitTotalMode);

        if($scope.skuKitTotalMode=='new')
        {
            $scope.showAddKitDialog(ev);
        }
        $scope.skuData = {};

        $scope.kitData = {};
        $scope.virtualkitData = {};
        $scope.dialogBoxSkuMode = "add";
        $scope.dialogBoxKitMode = "add";
        $scope.dialogBoxVirtualKitMode = "add";
        $scope.selected = [];
        $scope.skuvirtualKitList = [];
        $scope.skuImageArray = [];
        $scope.selectedCategory = {};

        $scope.img1PresentId = 0;
        $scope.img2PresentId = 0;
        $scope.img3PresentId = 0;
        $scope.img4PresentId = 0;

        $scope.skuImgFile1 = undefined;
        $scope.skuImgFile2 = undefined;
        $scope.skuImgFile3 = undefined;
        $scope.skuImgFile4 = undefined;

        $scope.isSellerSkuIdEntered = false;
        $scope.isSkuNameEntered = false;
        $scope.isUpcCodeEntered = false;
        $scope.isSkuCategorySelected = false;
        $scope.isSkuBrandSelected = false;
        $scope.isSkuDescEntered = false;
        $scope.isSkuLengthEntered = false;
        $scope.isSkuWidthEntered = false;
        $scope.isSkuHeightEntered = false;
        $scope.isSkuWeightEntered = false;
        $scope.isDimUnitSelected = false;
        $scope.isWeightUnitSelected = false;
        $scope.isShelfTypeSelected = false;
        $scope.isSkuMrpEntered = false;
        $scope.isSkuMspEntered = false;
        $scope.isBatchNoEntered = false;
        $scope.isMfgDateSelected = false;
        $scope.isExpDateSelected = false;
        $scope.isShelfLifeEntered = false;
        $scope.sellerSkuIdChangedFlag = false;
        $scope.upcCodeChangedFlag = false;
        $scope.attributeListSelectedValuesArray={};
        $scope.originalSellerSkuId = "";
        $scope.originalupcCode = "";
        $scope.skuKitList = [];
        $mdDialog.hide();
        $('#addNormalSkuDialog').modal('hide');
        $('#addVirtualKitDialog').modal('hide');
        $('#addKitDialog').modal('hide');
    };

    $scope.saveKitData = function(kitData) {
        if (kitData) {
            if (kitData.tableSkuClientSkuCode) {
                $scope.checkClientCode(kitData.tableSkuClientSkuCode, "kit").then(
                    function(v) {
                        if (v) {
                            if (!kitData.tableSkuName) {
                                growl.error("Please enter the Name");
                                $scope.isSkuNameEntered = true;
                            } else {
                                $scope.checkUpcCode(kitData.tableSkuPrimaryUpcEan, "kit").then(
                                    function(v) {
                                        if (v) {
                                            if (!kitData.tableSkuNode) {
                                                growl.error("Please select a Category");
                                                $scope.isSkuCategorySelected = true;
                                            } else {
                                                if (kitData.tableSkuUodmType) {
                                                    if (!kitData.tableSkuLength) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        growl.error("Please enter the SKU Length");
                                                        $scope.isSkuLengthEntered = true;
                                                        return;
                                                    }
                                                    else if (!kitData.tableSkuWidth) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        growl.error("Please enter the SKU Width");
                                                        $scope.isSkuWidthEntered = true;
                                                        return;
                                                    }
                                                    else if (!kitData.tableSkuHeight) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        growl.error("Please enter the SKU Height");
                                                        $scope.isSkuHeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (kitData.tableSkuUowmType) {
                                                    if (!kitData.tableSkuWeight) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        growl.error("Please enter the SKU Weight");
                                                        $scope.isSkuWeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (!kitData.tableSkuShelfLifeType) {
                                                    $scope.productDimClicked = false;
                                                    $scope.shelfLifeClicked = true;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    growl.error("Please select the Shelf Type");
                                                    $scope.isShelfTypeSelected = true;
                                                }
                                                else if (!kitData.tableSkuBrandCode) {
                                                    growl.error("Please select a Brand");
                                                    $scope.isSkuBrandSelected = true;
                                                }
                                                else if (!kitData.tableSkuDescription) {
                                                    growl.error("Please enter the Description");
                                                    $scope.isSkuDescEntered = true;
                                                }
                                                else {
                                                    if ($scope.dialogBoxKitMode == "add") {
                                                        $scope.saveKitDataInDb(kitData);
                                                    } else if ($scope.dialogBoxKitMode == "edit") {
                                                        $scope.updateKitData(kitData, $scope.skuClientCode);
                                                    }
                                                }

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
            } else {
                growl.error("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        } else {
            growl.error("Please enter the Seller SKU ID");
            $scope.isSellerSkuIdEntered = true;
        }
    };

    //code for saving the kit data in kitapi to backend
    $scope.saveKitDataInDb = function(kitData) {
        $scope.setSkuAttributes();
        $scope.bindProperties();
        $scope.kitDetList = [];
        for (var i = 0; i < $scope.skuKitList.length; i++) {
            $scope.kitDetList.push({
                skuid: $scope.skuKitList[i].sku.idtableSkuId,
                quantity: parseInt($scope.skuKitList[i].quantity)
            });
        }

        var postKitData = {};
        postKitData.parentSku = kitData;
        if(!postKitData.parentSku.tableSkuUodmType){
            postKitData.parentSku.tableSkuLength = null ;
            postKitData.parentSku.tableSkuWidth = null;
            postKitData.parentSku.tableSkuHeight = null;
        }
        if(!postKitData.parentSku.tableSkuUowmType){
            postKitData.parentSku.tableSkuWeight = null ;
        }
        postKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
        postKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
        postKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
        postKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
        postKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
        postKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
        postKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
        postKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
        postKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
        postKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
        postKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
        postKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
        postKitData.parentSku.tableSkuStatusType ={
            "idtableSkuStatusTypeId": 1,
            "tableSkuStatusTypeString": "Active"
        };
        postKitData.parentSku.tableSkuType = {
            "idtableSkuTypeId": 2,
            "tableSkuTypeString": "Kit"
        };

        postKitData.skuKitList = $scope.kitDetList;


        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/skus/kit',
            data: postKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                kitData = null;
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + res.parentSku.idtableSkuId + '/images/';
                $scope.uploadSkuImages(uploadUrl).then(
                    function(v) {
                        $scope.skuKitList = [];
                        if ($scope.modeSku == 'normal') {
                            $scope.listOfSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeSku == 'mutual') {
                            $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeKitSku == 'normal') {
                            $scope.listOfKitSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeKitSku == 'mutual') {
                            $scope.listOfKitMutualSkusCount($scope.vmPager.currentPage);
                        }
                        $scope.dialogBoxKitMode = "add";
                        $scope.cancelSkuData();
                        growl.success("Kit Added Successfully");
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Kit cannot be Added");
            }
            $scope.dialogBoxKitMode = "add";
        });
    };
    //ends here-code for saving the kit data in kitapi to backend

    $scope.setSkuAttributes = function () {
        $scope.tableSkuAttributeses = [];

        for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
        {
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
        }
    }

    $scope.addVirtualKitToDb = function(virtualkitData) {
        // save virtual kit
        var mfgDate = "";
        var expDate = "";
       $scope.setSkuAttributes();

        if (virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate != null) {
            mfgDate = moment(virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
        }
        if (virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate != null) {
            expDate = moment(virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");
        }


        $scope.bindProperties();

        var postvirtualKitData = {};
        postvirtualKitData.parentSku = virtualkitData;
        if(!postvirtualKitData.parentSku.tableSkuUodmType){
            postvirtualKitData.parentSku.tableSkuLength = null ;
            postvirtualKitData.parentSku.tableSkuWidth = null;
            postvirtualKitData.parentSku.tableSkuHeight = null;
        }
        if(!postvirtualKitData.parentSku.tableSkuUowmType){
            postvirtualKitData.parentSku.tableSkuWeight = null ;
        }

        postvirtualKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
        postvirtualKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
        postvirtualKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
        postvirtualKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
        postvirtualKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
        postvirtualKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
        postvirtualKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
        postvirtualKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
        postvirtualKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
        postvirtualKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
        postvirtualKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
        postvirtualKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
        postvirtualKitData.tableSkuInventory = postvirtualKitData.parentSku.tableSkuInventory;
        postvirtualKitData.parentSku.tableSkuInventory = undefined;
        postvirtualKitData.parentSku.tableSkuStatusType = {
            "idtableSkuStatusTypeId": 1,
            "tableSkuStatusTypeString": "Active"
        };
        postvirtualKitData.parentSku.tableSkuType = {
            "idtableSkuTypeId": 3,
            "tableSkuTypeString": "VirtualKit"
        };

        postvirtualKitData.skuKitList = $scope.skuvirtualKitList;
        postvirtualKitData.tableSkuInventory.tableSkuInventoryMfgDate = mfgDate;
        postvirtualKitData.tableSkuInventory.tableSkuInventoryExpiryDate = expDate;
        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/skus/virtualkit',
            data: postvirtualKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {

            if (res) {
                virtualkitData = null;
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + res.parentSku.idtableSkuId + '/images/';
                $scope.uploadSkuImages(uploadUrl).then(
                    function(v) {
                        if ($scope.modeSku == 'normal') {
                            $scope.listOfSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeSku == 'mutual') {
                            $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeVKitSku == 'normal') {
                            $scope.listOfVirtualKitSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeVKitSku == 'mutual') {
                            $scope.listOfVirtualKitMutualSkusCount($scope.vmPager.currentPage);
                        }
                        $scope.dialogBoxVirtualKitMode = "add";
                        $scope.cancelSkuData();
                        growl.success("Virtual Kit Added Successfully");
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Virtual Kit Cannot Be Added");
            }
            $scope.dialogBoxVirtualKitMode = "add";
        });
    };

    //code for saving the virtual kit data in virtualkitapi to backend
    $scope.savevirtualKitData = function(virtualkitData) {
        if (virtualkitData) {
            if (virtualkitData.tableSkuClientSkuCode) {
                $scope.checkClientCode(virtualkitData.tableSkuClientSkuCode, "virtual").then(
                    function(v) {
                        if (v) {
                            if (!virtualkitData.tableSkuName) {
                                growl.error("Please enter the Name");
                                $scope.isSkuNameEntered = true;
                            } else {
                                $scope.checkUpcCode(virtualkitData.tableSkuPrimaryUpcEan, "virtual").then(
                                    function(v) {
                                        if (v) {
                                            if (virtualkitData.tableSkuUodmType) {
                                                if (!virtualkitData.tableSkuLength) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = false;
                                                    growl.error("Please enter the SKU Length");
                                                    $scope.isSkuLengthEntered = true;
                                                    return;
                                                }
                                                else if (!virtualkitData.tableSkuWidth) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = false;
                                                    growl.error("Please enter the SKU Width");
                                                    $scope.isSkuWidthEntered = true;
                                                    return;
                                                }
                                                else if (!virtualkitData.tableSkuHeight) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = false;
                                                    growl.error("Please enter the SKU Height");
                                                    $scope.isSkuHeightEntered = true;
                                                    return;
                                                }
                                            }
                                            if (virtualkitData.tableSkuUowmType) {
                                                if (!virtualkitData.tableSkuWeight) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = false;
                                                    growl.error("Please enter the SKU Weight");
                                                    $scope.isSkuWeightEntered = true;
                                                    return;
                                                }
                                            }
                                            if (!virtualkitData.tableSkuNode) {
                                                growl.error("Please select a Category");
                                                $scope.isSkuCategorySelected = true;
                                            }
                                            else if (!virtualkitData.tableSkuShelfLifeType) {
                                                $scope.productDimClicked = false;
                                                $scope.shelfLifeClicked = true;
                                                $scope.attributesClicked = false;
                                                $scope.propertiesClicked = false;
                                                $scope.kitDetailsClicked = false;
                                                $scope.virtualkitDetailsClicked = false;
                                                $scope.inventoryDetailsClicked = false;
                                                growl.error("Please select the Shelf Type");
                                                $scope.isShelfTypeSelected = true;
                                            }
                                            else if (!virtualkitData.tableSkuBrandCode) {
                                                growl.error("Please select a Brand");
                                                $scope.isSkuBrandSelected = true;
                                            }
                                            else if (!virtualkitData.tableSkuDescription) {
                                                growl.error("Please enter the Description");
                                                $scope.isSkuDescEntered = true;
                                            }
                                            else {
                                                if (virtualkitData.tableSkuInventory || $scope.dialogBoxVirtualKitMode == "edit") {
                                                    if (virtualkitData.tableSkuInventory && !virtualkitData.tableSkuInventory.tableSkuInventoryMaxRetailPrice && $scope.dialogBoxVirtualKitMode == "add") {
                                                        $scope.productDimClicked = false;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = true;
                                                        growl.error("Please enter the MRP");
                                                        $scope.isSkuMrpEntered = true;

                                                    } else {
                                                        if (!virtualkitData.tableSkuInventory.tableSkuInventoryMinSalePrice && $scope.dialogBoxVirtualKitMode == "add") {
                                                            $scope.productDimClicked = false;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.kitDetailsClicked = false;
                                                            $scope.virtualkitDetailsClicked = false;
                                                            $scope.inventoryDetailsClicked = true;
                                                            growl.error("Please enter the MSP");
                                                            $scope.isSkuMspEntered = true;

                                                        } else {
                                                            if (!virtualkitData.tableSkuInventory.tableSkuInventoryBatchNo && $scope.dialogBoxVirtualKitMode == "add") {
                                                                $scope.productDimClicked = false;
                                                                $scope.shelfLifeClicked = false;
                                                                $scope.attributesClicked = false;
                                                                $scope.propertiesClicked = false;
                                                                $scope.kitDetailsClicked = false;
                                                                $scope.virtualkitDetailsClicked = false;
                                                                $scope.inventoryDetailsClicked = true;
                                                                growl.error("Please enter the Batch No.");
                                                                $scope.isBatchNoEntered = true;

                                                            } else {
                                                                if ($scope.shelfTypeID == 1 && !virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate && $scope.dialogBoxVirtualKitMode == "add") {
                                                                    $scope.productDimClicked = false;
                                                                    $scope.shelfLifeClicked = false;
                                                                    $scope.attributesClicked = false;
                                                                    $scope.propertiesClicked = false;
                                                                    $scope.kitDetailsClicked = false;
                                                                    $scope.virtualkitDetailsClicked = false;
                                                                    $scope.inventoryDetailsClicked = true;
                                                                    growl.error("Please select the Mfg Date.");
                                                                    $scope.isMfgDateSelected = true;

                                                                } else {
                                                                    if ($scope.shelfTypeID == 2 && !virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate && $scope.dialogBoxVirtualKitMode == "add") {
                                                                        $scope.productDimClicked = false;
                                                                        $scope.shelfLifeClicked = false;
                                                                        $scope.attributesClicked = false;
                                                                        $scope.propertiesClicked = false;
                                                                        $scope.kitDetailsClicked = false;
                                                                        $scope.virtualkitDetailsClicked = false;
                                                                        $scope.inventoryDetailsClicked = true;
                                                                        growl.error("Please select the Exp Date.");
                                                                        $scope.isExpDateSelected = true;

                                                                    } else {
                                                                        if ($scope.shelfTypeID == 1 && !virtualkitData.tableSkuInventory.tableSkuInventoryShelfLifeInDays && $scope.dialogBoxVirtualKitMode == "add") {
                                                                            $scope.productDimClicked = false;
                                                                            $scope.shelfLifeClicked = false;
                                                                            $scope.attributesClicked = false;
                                                                            $scope.propertiesClicked = false;
                                                                            $scope.kitDetailsClicked = false;
                                                                            $scope.virtualkitDetailsClicked = false;
                                                                            $scope.inventoryDetailsClicked = true;
                                                                            growl.error("Please enter the Shelf Life");
                                                                            $scope.isShelfLifeEntered = true;

                                                                        } else {
                                                                            if ($scope.dialogBoxVirtualKitMode == "add") {
                                                                                $scope.addVirtualKitToDb(virtualkitData);
                                                                            } else if ($scope.dialogBoxVirtualKitMode == "edit") {
                                                                                $scope.updatevirtualKitData(virtualkitData, $scope.skuClientCode);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    $scope.productDimClicked = false;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = true;
                                                    growl.error("Please enter the MRP");
                                                    $scope.isSkuMrpEntered = true;
                                                }
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
            } else {
                growl.error("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        } else {
            growl.error("Please enter the Seller SKU ID");
            $scope.isSellerSkuIdEntered = true;
        }
    };
    //ends here-code for saving the kit data in kitapi to backend

    //code for saving the virtual kit data in virtualkitapi to backend
    $scope.saveSkuData = function(skuData) {
        if (skuData) {
            if (skuData.tableSkuClientSkuCode) {
                $scope.checkClientCode(skuData.tableSkuClientSkuCode, "normal").then(
                    function(v) {
                        if (v) {
                            if (!skuData.tableSkuName) {
                                growl.error("Please enter the Name");
                                $scope.isSkuNameEntered = true;
                            } else {
                                $scope.checkUpcCode(skuData.tableSkuPrimaryUpcEan, "normal").then(
                                    function(v) {
                                        if (v) {

                                            if (skuData.tableSkuUodmType) {
                                                if (!skuData.tableSkuLength) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    growl.error("Please enter the SKU Length");
                                                    $scope.isSkuLengthEntered = true;
                                                    return;
                                                }
                                                else if (!skuData.tableSkuWidth) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    growl.error("Please enter the SKU Width");
                                                    $scope.isSkuWidthEntered = true;
                                                    return;
                                                }
                                                else if (!skuData.tableSkuHeight) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    growl.error("Please enter the SKU Height");
                                                    $scope.isSkuHeightEntered = true;
                                                    return;
                                                }
                                            }
                                            if (skuData.tableSkuUowmType) {
                                                if (!skuData.tableSkuWeight) {
                                                    $scope.productDimClicked = true;
                                                    $scope.shelfLifeClicked = false;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    growl.error("Please enter the SKU Weight");
                                                    $scope.isSkuWeightEntered = true;
                                                    return;
                                                }
                                            }
                                            if (!skuData.tableSkuNode) {
                                                growl.error("Please select a Category");
                                                $scope.isSkuCategorySelected = true;
                                            }
                                            else if (!skuData.tableSkuShelfLifeType) {
                                                $scope.productDimClicked = false;
                                                $scope.shelfLifeClicked = true;
                                                $scope.attributesClicked = false;
                                                $scope.propertiesClicked = false;
                                                growl.error("Please select the Shelf Type");
                                                $scope.isShelfTypeSelected = true;
                                            }
                                            else if(!skuData.tableSkuBrandCode) {
                                                growl.error("Please select a Brand");
                                                $scope.isSkuBrandSelected = true;
                                            }
                                            else if(!skuData.tableSkuDescription) {
                                                growl.error("Please enter the Description");
                                                $scope.isSkuDescEntered = true;
                                            }
                                            else{
                                                if ($scope.dialogBoxSkuMode == "add") {
                                                    $scope.saveSkuDataInDb(skuData);
                                                }
                                                else if($scope.dialogBoxSkuMode == "edit") {
                                                    $scope.updateSkuData(skuData, $scope.skuClientCode);
                                                }
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
            } else {
                growl.error("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        } else {
            growl.error("Please enter the Seller SKU ID");
            $scope.isSellerSkuIdEntered = true;
        }
    };
    //ends here-code for saving the kit data in kitapi to backend

    $scope.addBrand = function(brandName) {
        $scope.buttonBrandSaveDisable = true;
        if (!brandName) {
            growl.error("Please enter the Brand Name");
            $scope.isNewBrandNameEntered = true;
            $scope.buttonBrandSaveDisable = false;
        } else {
            postBrandData = {
                "tableSkuBrandCodeString": brandName
            }

            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/skubrandcodes',
                data: postBrandData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                $scope.buttonBrandSaveDisable = false;
                if (res) {
                    growl.success("New Brand Added Successfully");
                    $scope.brandTypeArray();
                    $scope.closeBrandBox();
                }
            }).error(function(error, status) {

                $scope.buttonBrandSaveDisable = false;

                if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }
            });
        }
    };

    $scope.showBackEndStatusMessage = function(errorMessage){
        growl.error(errorMessage.errorMessage);
    }

    $scope.openBrandBox = function() {
        $("#addNewBrand").modal("show");
    }

    $scope.closeBrandBox = function() {
        $scope.buttonBrandSaveDisable = false;
        $scope.isNewBrandNameEntered = false;
        $("#addNewBrand").modal("hide");
    };

    $scope.newBrandNameChanged = function(brandName) {
        if (brandName) {
            $scope.isNewBrandNameEntered = false;
        } else {
            $scope.isNewBrandNameEntered = true;
        }
    };

    $scope.openCategoryBox = function() {
        $("#addNewCatg").modal("show");
    };

    $scope.closeCategoryBox = function() {
        $scope.isNewCatgNameEntered = false;
        $("#addNewCatg").modal("hide");
    };

    $scope.newCatgNameChanged = function(catgName) {
        if (catgName) {
            $scope.isNewCatgNameEntered = false;
        } else {
            $scope.isNewCatgNameEntered = true;
        }
    };

    $scope.openAttributeBox = function() {
        $("#addNewAttribute").modal("show");
    };

    $scope.closeAttributeBox = function() {
        $scope.isNewAttributeNameEntered = false;
        $("#addNewAttribute").modal("hide");
    };

    $scope.newAttributeNameChanged = function(attrName) {
        if (attrName) {
            $scope.isNewAttributeNameEntered = false;
        } else {
            $scope.isNewAttributeNameEntered = true;
        }
    };

    //check CLient Sku Code
    $scope.checkClientCode = function(sellerskuId, skuType) {
        var q = $q.defer();
        if (sellerskuId) {
            if (skuType == "virtual") {
                if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxVirtualKitMode == "add") {
                    var checkClientUrl = baseUrl + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                    $http.get(checkClientUrl).success(function(data) {
                        if (data == true) {
                            growl.error("Seller SKU ID already exists.");
                            var myEl = angular.element(document.querySelector('#sellerSkuId'));
                            myEl.empty();
                            $scope.isSellerSkuIdEntered = true;
                            document.skuForm.sellerSkuId.focus();
                            q.resolve(false);
                        } else {
                            $scope.isSellerSkuIdEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            } else if (skuType == "normal") {
                if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxSkuMode == "add") {
                    var checkClientUrl = baseUrl + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                    $http.get(checkClientUrl).success(function(data) {
                        if (data == true) {
                            growl.error("Seller SKU ID already exists.");
                            var myEl = angular.element(document.querySelector('#sellerSkuId'));
                            myEl.empty();
                            $scope.isSellerSkuIdEntered = true;
                            document.skuForm.sellerSkuId.focus();
                            q.resolve(false);
                        } else {
                            $scope.isSellerSkuIdEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            } else if (skuType == "kit") {
                if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxKitMode == "add") {
                    var checkClientUrl = baseUrl + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                    $http.get(checkClientUrl).success(function(data) {
                        if (data == true) {
                            growl.error("Seller SKU ID already exists.");
                            var myEl = angular.element(document.querySelector('#sellerSkuId'));
                            myEl.empty();
                            $scope.isSellerSkuIdEntered = true;
                            document.skuForm.sellerSkuId.focus();
                            q.resolve(false);
                        } else {
                            $scope.isSellerSkuIdEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            }
        } else {
            document.skuForm.sellerSkuId.focus();
            growl.error("Please enter the Seller SKU ID");
            $scope.isSellerSkuIdEntered = true;
            q.resolve(false);
        }
        return q.promise;
    };

    //check CLient UPC Code
    $scope.checkUpcCode = function(upcCode, skuType) {
        var q = $q.defer();
        if (upcCode) {
            if (skuType == "virtual") {
                if ($scope.upcCodeChangedFlag || $scope.dialogBoxVirtualKitMode == "add") {
                    var checkUPCUrl = baseUrl + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                    $http.get(checkUPCUrl).success(function(data) {
                        if (data == true) {
                            growl.error("ISBN/UPC/EAN already exists.");
                            var myEl1 = angular.element(document.querySelector('#upc'));
                            myEl1.empty();
                            document.skuForm.upc.focus();
                            $scope.isUpcCodeEntered = true;
                            q.resolve(false);
                        } else {
                            $scope.isUpcCodeEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            } else if (skuType == "normal") {
                if ($scope.upcCodeChangedFlag || $scope.dialogBoxSkuMode == "add") {
                    var checkUPCUrl = baseUrl + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                    $http.get(checkUPCUrl).success(function(data) {
                        if (data == true) {
                            growl.error("ISBN/UPC/EAN already exists.");
                            var myEl1 = angular.element(document.querySelector('#upc'));
                            myEl1.empty();
                            document.skuForm.upc.focus();
                            $scope.isUpcCodeEntered = true;
                            q.resolve(false);
                        } else {
                            $scope.isUpcCodeEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            } else if (skuType == "kit") {
                if ($scope.upcCodeChangedFlag || $scope.dialogBoxKitMode == "add") {
                    var checkUPCUrl = baseUrl + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                    $http.get(checkUPCUrl).success(function(data) {
                        if (data == true) {
                            growl.error("ISBN/UPC/EAN already exists.");
                            var myEl1 = angular.element(document.querySelector('#upc'));
                            myEl1.empty();
                            document.skuForm.upc.focus();
                            $scope.isUpcCodeEntered = true;
                            q.resolve(false);
                        } else {
                            $scope.isUpcCodeEntered = false;
                            q.resolve(true);
                        }
                    });
                } else {
                    q.resolve(true);
                }
            }
        } else {
            q.resolve(true);
            $scope.isUpcCodeEntered = false;
        }
        return q.promise;
    };

    //event to prevent neg integers
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

    $scope.deactivateSku = function(skuId, skuData, type, ev) {
        $scope.skuId = skuId;
        $scope.skuData = skuData;
        $scope.type = type;
        $mdDialog.show({
                templateUrl: 'dialog333.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose: false,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })

    };

    //deactiving sku code
    $scope.deactivateSkuApi = function(skuId, skuData, type) {

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/skus/' + skuId + '/deactivate',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                if (type == 'Normal') {
                    growl.success("Normal SKU Deactivated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                }
                if (type == 'Kit') {
                    growl.success("Kit Deactivated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfKitSkusCount($scope.vmPagerKit.currentPage);
                }
                if (type == 'VirtualKit') {
                    growl.success("Virtual Kit Deactivated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfVirtualKitSkusCount($scope.vmPagerVKit.currentPage);
                }
                $mdDialog.hide();
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                if (type == 'Normal') {
                    growl.error("Normal SKU Cannot Be Deactivated");
                }
                if (type == 'Kit') {
                    growl.error("Kit Cannot Be Deactivated");
                }
                if (type == 'VirtualKit') {
                    growl.error("Virtual Kit Cannot Be Deactivated");
                }
            }
            $mdDialog.hide();
        });
    };

    $scope.activateSku = function(skuId, skuData, type, ev) {
        $scope.skuId = skuId;
        $scope.skuData = skuData;
        $scope.type = type;
        $mdDialog.show({
                templateUrl: 'dialog334.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose: false,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })

    };

    $scope.SkuMapData = {};

    $scope.SkuMapping = function(DataValue,ev){
        console.log(DataValue);
        var checkMapUrl = baseUrl + "/omsservices/webapi/skus/"+DataValue.idtableSkuId+"/vendorsaleschannelskumap";
        $http.get(checkMapUrl).success(function(data) {
            console.log(data);
            $scope.SkuDetailes = data;
            $scope.SkuMapDataTableChannel = data.salesChannels;
            $scope.SkuMapDataTableVendor = data.vendors;
            $scope.SkuMapData.SkudataModal = DataValue;
            $mdDialog.show({
                templateUrl: 'dialog339.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose: false,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
        }).error(function(data){

            console.log(data);
        });

    }

    //deactiving sku code
    $scope.activateSkuApi = function(skuId, skuData, type) {

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/skus/' + skuId + '/activate',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                if (type == 'Normal') {
                    growl.success("Normal SKU Activated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                }
                if (type == 'Kit') {
                    growl.success("Kit Activated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfKitSkusCount($scope.vmPagerKit.currentPage);
                }
                if (type == 'VirtualKit') {
                    growl.success("Virtual Kit Activated Successfully");
                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                    $scope.listOfVirtualKitSkusCount($scope.vmPagerVKit.currentPage);
                }
                $mdDialog.hide();
            }
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                if (type == 'Normal') {
                    growl.error("Normal SKU Cannot Be Deactivated");
                }
                if (type == 'Kit') {
                    growl.error("Kit Cannot Be Deactivated");
                }
                if (type == 'VirtualKit') {
                    growl.error("Virtual Kit Cannot Be Deactivated");
                }
            }
            $mdDialog.hide();
        });
    };

    $scope.isFile1SelectDisabled = function() {
        if ($scope.isImg1Present()) {
            return true;
        } else if ($scope.fromDelete1) {
            $scope.fromDelete1 = false;
            return true;
        }
        return false;
    }

    $scope.isImg1Present = function() {
        if ($scope.img1PresentId != 0 || $scope.skuImgFile1) {
            return true;
        }
        return false;
    };

    $scope.isFile2SelectDisabled = function() {
        if ($scope.isImg2Present()) {
            return true;
        } else if ($scope.fromDelete2) {
            $scope.fromDelete2 = false;
            return true;
        }
        return false;
    }

    $scope.isImg2Present = function() {
        if ($scope.img2PresentId != 0 || $scope.skuImgFile2) {
            return true;
        }
        return false;
    };

    $scope.isFile3SelectDisabled = function() {
        if ($scope.isImg3Present()) {
            return true;
        } else if ($scope.fromDelete3) {
            $scope.fromDelete3 = false;
            return true;
        }
        return false;
    }

    $scope.isImg3Present = function() {
        if ($scope.img3PresentId != 0 || $scope.skuImgFile3) {
            return true;
        }
        return false;
    };

    $scope.isFile4SelectDisabled = function() {
        if ($scope.isImg4Present()) {
            return true;
        } else if ($scope.fromDelete4) {
            $scope.fromDelete4 = false;
            return true;
        }
        return false;
    }

    $scope.isImg4Present = function() {
        if ($scope.img4PresentId != 0 || $scope.skuImgFile4) {
            return true;
        }
        return false;
    };
    $scope.viewSkuImage = function (image) {
        $scope.showSkuImageContainer = true;
        $scope.viewedSkuImage = image;
    }
    $scope.closeSkuImageContainer = function () {
        $scope.showSkuImageContainer = false;
        $scope.viewedSkuImage = null;
    }
    $scope.changeSkuImage = function (image) {
        $scope.viewedSkuImage = null;
        $scope.viewedSkuImage = image;
    }
    $scope.nextSkuImage = function () {
        var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage), foundNext = false;
        $scope.skuImageArray.forEach(function (value,key) {
            if(value !== null && currentIndex < key && !foundNext){
                $scope.viewedSkuImage= value;
                foundNext = ! foundNext;
            }
        });
    }
    $scope.backSkuImage = function () {
        var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage), foundBack = false;
        $scope.skuImageArray.forEach(function (value,key) {
            if(value !== null && currentIndex > key ){
                $scope.viewedSkuImage= value;
                // foundBack = ! foundBack;
            }
        });

    }
    $scope.disableNextSku = function () {
        var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage),disableNext = false;
        if(currentIndex == 3){
            return  !disableNext;
        }
        for(var i =currentIndex;i<$scope.skuImageArray.length;i++){
            if($scope.skuImageArray[i] == null){
                disableNext = true;
            }
            else{
                if(disableNext){
                    disableNext = false;
                    break;
                }
            }
        }
        return  disableNext;
    }
    $scope.disableBackSku = function () {
        var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage),disableBack = false;
        if(currentIndex == 0){
            return  !disableBack;
        }
        for(var i =$scope.skuImageArray.length - 1;i>=0;i--){
            if($scope.skuImageArray[i] == null){
                disableBack = true;
            }
            else{
                if(disableBack){
                    disableBack = false;
                    break;
                }
            }
        }
        return  disableBack;
    }
    $scope.deleteSkuImage = function(imageNo) {
        var imgId = 0;
        if (imageNo == "1") {
            imgId = $scope.img1PresentId;
        } else if (imageNo == "2") {
            imgId = $scope.img2PresentId;
        } else if (imageNo == "3") {
            imgId = $scope.img3PresentId;
        } else if (imageNo == "4") {
            imgId = $scope.img4PresentId;
        }

        if (imgId != 0) {
            var delImgUrl = baseUrl + "/omsservices/webapi/skus/" + $scope.skuClientCode + "/images/" + imgId;
            console.log(delImgUrl);
            $http.delete(delImgUrl).success(function(data) {
                console.log(data);
            }).error(function(error, status) {

            });
        }
        if (imageNo == "1") {
            $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
            $scope.skuImageArray[0] = null;
            $scope.img1PresentId = 0;
            $scope.skuImgFile1 = undefined;
            $scope.fromDelete1 = true;
        } else if (imageNo == "2") {
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
            $scope.skuImageArray[1] = null;
            $scope.img2PresentId = 0;
            $scope.skuImgFile2 = undefined;
            $scope.fromDelete2 = true;
        } else if (imageNo == "3") {
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
            $scope.skuImageArray[2] = null;
            $scope.img3PresentId = 0;
            $scope.skuImgFile3 = undefined;
            $scope.fromDelete3 = true;
        } else if (imageNo == "4") {
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
            $scope.skuImageArray[3] = null;
            $scope.img4PresentId = 0;
            $scope.skuImgFile4 = undefined;
            $scope.fromDelete4 = true;
        }
    };

    $scope.deleteSkuImages = function(skuId) {
        var q = $q.defer();
        q.resolve(true);
        if ($scope.skuImgFile1 != undefined && $scope.img1PresentId != 0) {
            var delImgUrl = baseUrl + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img1PresentId;
            $http.delete(delImgUrl).success(function(data) {
                console.log(data);
                q.resolve(true);
            }).error(function(error, status) {
                q.reject(false);


            });
        }
        if ($scope.skuImgFile2 != undefined && $scope.img2PresentId != 0) {
            var delImgUrl = baseUrl + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img2PresentId;
            $http.delete(delImgUrl).success(function(data) {
                console.log(data);
                q.resolve(true);
            }).error(function(error, status) {
                q.reject(false);
                if(status == 400){
                    growl.error(error.errorMessage);
                }if (status == 401) {
                    growl.error("Your session has been expired. You need to Login again.");
                    $location.path("/login");
                    return;
                }
                else {
                    growl.error("Failed to delete image");
                }

            });
        }
        if ($scope.skuImgFile3 != undefined && $scope.img3PresentId != 0) {
            var delImgUrl = baseUrl + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img3PresentId;
            $http.delete(delImgUrl).success(function(data) {
                console.log(data);
                q.resolve(true);
            }).error(function(error, status) {

                q.reject(false);
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error("Failed to delete image");
                }

            });
        }
        if ($scope.skuImgFile4 != undefined && $scope.img4PresentId != 0) {
            var delImgUrl = baseUrl + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img4PresentId;
            $http.delete(delImgUrl).success(function(data) {
                console.log(data);
                q.resolve(true);
            }).error(function(error, status) {
                q.reject(false);

            });
        }
        return q.promise;
    };

    $scope.uploadSkuImages = function(uploadUrl) {
        var q = $q.defer();
        if ($scope.skuImgFile1 != undefined) {
            fileUpload.uploadFileToUrl($scope.skuImgFile1, uploadUrl);
        }
        if ($scope.skuImgFile2 != undefined) {
            fileUpload.uploadFileToUrl($scope.skuImgFile2, uploadUrl);
        }
        if ($scope.skuImgFile3 != undefined) {
            fileUpload.uploadFileToUrl($scope.skuImgFile3, uploadUrl);
        }
        if ($scope.skuImgFile4 != undefined) {
            fileUpload.uploadFileToUrl($scope.skuImgFile4, uploadUrl);
        }
        q.resolve(true);
        return q.promise;
    };

    //update Normal Sku Functionality
    $scope.updateSkuData = function(skuData, skuId) {
        $scope.tableSkuAttributeses = [];

        for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
        {
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
            if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                $scope.tableSkuAttributeses.push({
                    "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                    "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                })
            }
        }

        $scope.bindProperties();

        var putSkuData = skuData;
        if(!putSkuData.tableSkuUodmType){
            putSkuData.tableSkuLength = null ;
            putSkuData.tableSkuWidth = null;
            putSkuData.tableSkuHeight = null;
        }
        if(!putSkuData.tableSkuUowmType){
            putSkuData.tableSkuWeight = null ;
        }
        putSkuData.tableSkuIsPoisonous = $scope.tableSkuIsPoisonous;
        putSkuData.tableSkuIsStackable = $scope.tableSkuIsStackable;
        putSkuData.tableSkuIsFragile = $scope.tableSkuIsFragile;
        putSkuData.tableSkuIsSaleable = $scope.tableSkuIsSaleable;
        putSkuData.tableSkuIsUsnRequired = $scope.tableSkuIsUsnRequired;
        putSkuData.tableSkuIsConsumable = $scope.tableSkuIsConsumable;
        putSkuData.tableSkuIsHazardous = $scope.tableSkuIsHazardous;
        putSkuData.tableSkuIsHighValue = $scope.tableSkuIsHighValue;
        putSkuData.tableSkuIsQcRequired = $scope.tableSkuIsQcRequired;
        putSkuData.tableSkuIsReturnable = $scope.tableSkuIsReturnable;
        putSkuData.tableSkuIsTemperatureControlled = $scope.tableSkuIsTemperatureControlled;
        putSkuData.tableSkuAttributeses =$scope.tableSkuAttributeses;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/skus/' + skuId,
            data: putSkuData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + skuId + '/images/';
                $scope.deleteSkuImages(skuId).then(
                    function(v) {
                        $scope.uploadSkuImages(uploadUrl).then(
                            function(v) {
                                skuData = null;
                                if ($scope.modeSku == 'normal') {
                                    // $scope.listOfSkus();
                                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeSku == 'mutual') {
                                    // $scope.listOfMutualSkus();
                                    $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeNormalSku == 'normal') {
                                    // $scope.listOfNormalSkus();
                                    $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                                }
                                if ($scope.modeNormalSku == 'mutual') {
                                    // $scope.listOfNormalMutualSkus();
                                    $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                                }
                                $scope.dialogBoxSkuMode = 'add';
                                growl.success("SKU updated successfully");
                                $scope.cancelSkuData();
                            },
                            function(err) {}
                        );
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to update SKU");
            }
        });
    };

    $scope.updateKitData = function(kitData, skuId) {
        $scope.setSkuAttributes();
        $scope.kitDetList = [];
        for (var i = 0; i < $scope.skuKitList.length; i++) {
            $scope.kitDetList.push({
                skuid: $scope.skuKitList[i].sku.idtableSkuId,
                quantity: parseInt($scope.skuKitList[i].quantity)
            });
        }
        $scope.bindProperties();
        var putKitData = {};
        putKitData.parentSku = kitData;
        if(!putKitData.parentSku.tableSkuUodmType){
            putKitData.parentSku.tableSkuLength = null ;
            putKitData.parentSku.tableSkuWidth = null;
            putKitData.parentSku.tableSkuHeight = null;
        }
        if(!putKitData.parentSku.tableSkuUowmType){
            putKitData.parentSku.tableSkuWeight = null ;
        }
        putKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
        putKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
        putKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
        putKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
        putKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
        putKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
        putKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
        putKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
        putKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
        putKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
        putKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
        putKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
        putKitData.parentSku.tableSkuStatusType ={
            "idtableSkuStatusTypeId": 1,
            "tableSkuStatusTypeString": "Active"
        };
        putKitData.parentSku.tableSkuType = {
            "idtableSkuTypeId": 2,
            "tableSkuTypeString": "Kit"
        };

        putKitData.skuKitList = $scope.kitDetList;
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/skus/kit/' + skuId,
            data: putKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + skuId + '/images/';
                $scope.deleteSkuImages(skuId).then(
                    function(v) {
                        $scope.uploadSkuImages(uploadUrl).then(
                            function(v) {
                                kitData = null;
                                $scope.dialogBoxKitMode = "add";
                                if ($scope.modeSku == 'normal') {
                                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeSku == 'mutual') {
                                    $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeKitSku == 'normal') {
                                    $scope.listOfKitSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeKitSku == 'mutual') {
                                    $scope.listOfNormalMutualSkusCount($scope.vmPager.currentPage);
                                }
                                growl.success("Kit Updated Successfully");
                                $scope.cancelSkuData();
                            },
                            function(err) {}
                        );
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Kit cannot be Updated");
            }
        });
    };

    $scope.bindProperties = function() {
        $scope.tableSkuIsPoisonous = false;
        $scope.tableSkuIsUsnRequired = false;
        $scope.tableSkuIsStackable = false;
        $scope.tableSkuIsSaleable = false;
        $scope.tableSkuIsFragile = false;
        $scope.tableSkuIsHighValue = false;
        $scope.tableSkuIsTemperatureControlled = false;
        $scope.tableSkuIsHazardous = false;
        $scope.tableSkuIsConsumable = false;
        $scope.tableSkuIsQcRequired = false;
        $scope.tableSkuIsReturnable = false;


        for (var i = 0; i < $scope.selected.length; i++) {
            if ($scope.selected[i] == 'Poisonous') {
                $scope.tableSkuIsPoisonous = true;
            }

            if ($scope.selected[i] == 'Stackable') {
                $scope.tableSkuIsStackable = true;
            }

            if ($scope.selected[i] == 'Fragile') {
                $scope.tableSkuIsFragile = true;
            }

            if ($scope.selected[i] == 'Saleable') {
                $scope.tableSkuIsSaleable = true;
            }

            if ($scope.selected[i] == 'USN required') {
                $scope.tableSkuIsUsnRequired = true;
            }

            if ($scope.selected[i] == 'Consumable') {
                $scope.tableSkuIsConsumable = true;
            }

            if ($scope.selected[i] == 'Hazardous') {
                $scope.tableSkuIsHazardous = true;
            }

            if ($scope.selected[i] == 'High value') {
                $scope.tableSkuIsHighValue = true;
            }

            if ($scope.selected[i] == 'QC required') {
                $scope.tableSkuIsQcRequired = true;
            }

            if ($scope.selected[i] == 'Returnable') {
                $scope.tableSkuIsReturnable = true;
            }
            if ($scope.selected[i] == 'Temperature controlled') {
                $scope.tableSkuIsTemperatureControlled = true;
            }
        }
    }

    $scope.updatevirtualKitData = function(kitData, skuId) {
        $scope.setSkuAttributes();
        $scope.bindProperties();
        var putKitData = {};
        putKitData.parentSku = kitData;
        if(!putKitData.parentSku.tableSkuUodmType){
            putKitData.parentSku.tableSkuLength = null ;
            putKitData.parentSku.tableSkuWidth = null;
            putKitData.parentSku.tableSkuHeight = null;
        }
        if(!putKitData.parentSku.tableSkuUowmType){
            putKitData.parentSku.tableSkuWeight = null ;
        }
        putKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
        putKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
        putKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
        putKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
        putKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
        putKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
        putKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
        putKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
        putKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
        putKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
        putKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
        putKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
        putKitData.tableSkuInventory = kitData.tableSkuInventory;
        putKitData.parentSku.tableSkuInventory = undefined;
        putKitData.parentSku.tableSkuStatusType = {
                                                        "idtableSkuStatusTypeId": 1,
                                                        "tableSkuStatusTypeString": "Active"
                                                    };
        putKitData.parentSku.tableSkuType = {
                                                "idtableSkuTypeId": 3,
                                                "tableSkuTypeString": "VirtualKit"
                                            };

        putKitData.skuKitList = $scope.skuvirtualKitList;

        console.log(putKitData);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/skus/virtualkit/' + skuId,
            data: putKitData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res) {

                var uploadUrl = baseUrl + '/omsservices/webapi/skus/' + skuId + '/images/';
                $scope.deleteSkuImages(skuId).then(
                    function(v) {
                        $scope.uploadSkuImages(uploadUrl).then(
                            function(v) {
                                kitData = null;
                                $scope.dialogBoxVirtualKitMode = "add";
                                if ($scope.modeSku == 'normal') {
                                    // $scope.listOfSkus();
                                    $scope.listOfSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeSku == 'mutual') {
                                    // $scope.listOfMutualSkus();
                                    $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeKitSku == 'normal') {
                                    // $scope.listOfKitSkus();
                                    $scope.listOfVirtualKitSkusCount($scope.vmPager.currentPage);
                                }
                                if ($scope.modeKitSku == 'mutual') {
                                    // $scope.listOfNormalMutualSkus();
                                    $scope.listOfVirtualKitMutualSkusCount($scope.vmPager.currentPage);
                                }
                                $scope.cancelSkuData();
                                growl.success("Virtual Kit Updated Successfully");
                            },
                            function(err) {}
                        );;
                    },
                    function(err) {}
                );
            }
        }).error(function(error, status) {
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Kit cannot be Updated");
            }
        });
    };

    //splicing the kit list
    $scope.removeKit = function(index) {
        $scope.skuKitList.splice(index, 1);
    };

    //splicing the virtual kit list
    $scope.removeVirtualKit = function(index) {
        $scope.skuvirtualKitList.splice(index, 1);
    };

    $scope.tableSortingAll = function(sortTypeAll, sortReverseAll) {
        console.log(sortTypeAll);
        console.log(sortReverseAll);
        $scope.sortTypeAll = sortTypeAll;
        $scope.sortReverseAll = sortReverseAll;
        console.log($scope.directionTypeAll);
        if (sortReverseAll == true) {
            $scope.directionTypeAll = 'desc';
        }
        if (sortReverseAll == false) {
            $scope.directionTypeAll = 'asc';
        }
        console.log($scope.directionTypeAll);
        $scope.sortReverseAll = !sortReverseAll;

        var page = undefined;
        if($scope.wordSearch == null || $scope.wordSearch == undefined || $scope.wordSearch == '')
        {
            $scope.listOfSkusCount(page);
        }
        else
            {
            $scope.listOfMutualSkusCount(page);
        }

    }

    $scope.tableSortingNormal = function(sortTypeNormal, sortReverseNormal) {
        console.log(sortTypeNormal);
        console.log(sortReverseNormal);
        $scope.sortTypeNormal = sortTypeNormal;
        $scope.sortReverseNormal = sortReverseNormal;
        console.log($scope.directionTypeNormal);
        if (sortReverseNormal == true) {
            $scope.directionTypeNormal = 'desc';
        }
        if (sortReverseNormal == false) {
            $scope.directionTypeNormal = 'asc';
        }
        console.log($scope.directionTypeNormal);
        $scope.sortReverseNormal = !sortReverseNormal;

        var page = undefined;
        $scope.listOfNormalSkusCount(page);
    }    

    $scope.tableSortingKit = function(sortTypeKit, sortReverseKit) {
        console.log(sortTypeKit);
        console.log(sortReverseKit);
        $scope.sortTypeKit = sortTypeKit;
        $scope.sortReverseKit = sortReverseKit;
        console.log($scope.directionTypeKit);
        if (sortReverseKit == true) {
            $scope.directionTypeKit = 'desc';
        }
        if (sortReverseKit == false) {
            $scope.directionTypeKit = 'asc';
        }
        console.log($scope.directionTypeKit);
        $scope.sortReverseKit = !sortReverseKit;

        var page = undefined;
        $scope.listOfKitSkusCount(page);
    } 

    $scope.tableSortingVKit = function(sortTypeVKit, sortReverseVKit) {
        console.log(sortTypeVKit);
        console.log(sortReverseVKit);
        $scope.sortTypeVKit = sortTypeVKit;
        $scope.sortReverseVKit = sortReverseVKit;
        console.log($scope.directionTypeVKit);
        if (sortReverseVKit == true) {
            $scope.directionTypeVKit = 'desc';
        }
        if (sortReverseVKit == false) {
            $scope.directionTypeVKit = 'asc';
        }
        console.log($scope.directionTypeVKit);
        $scope.sortReverseVKit = !sortReverseVKit;

        var page = undefined;
        $scope.listOfVirtualKitSkusCount(page);
    }

    $scope.skuInventories = {};
    $scope.showInventory = function(skuid){
        var url = baseUrl + "/omsservices/webapi/inventory?skuid="+skuid;
        $http.get(url).success(function(data) {
            if(data.length > 0){
                $scope.skuInventories = data[0];
                $("#showskuinventory").modal('show');
            }
            else{
                growl.error("Inventory Not available");
            }
        });
    }

    $scope.generateSkuTemplate = function(){
        $("#generateTemp").modal('show');
    };

    $scope.cancelGenerateTemplateDialog = function(){
        $("#generateTemp").modal('hide');
    }

    $scope.showSkuSalesChannelMapModal = function(ev){
    
    	 $mdDialog.show({
             templateUrl: 'skuSalesChannelMapUploadDialog.tmpl.html',
             parent: angular.element(document.body),
             targetEvent: ev,
             escapeToClose: false,
             clickOutsideToClose: false,
             scope: $scope.$new()
         });    	
    }
    
    $scope.cancelSkuSalesChannelDialog = function(){
    	
    	$scope.genericData.fileName = null;
    	$scope.genericData.bulkOrderUploadfile = null;    	
    	 $mdDialog.hide({
             templateUrl: 'skuSalesChannelMapUploadDialog.tmpl.html'}); 
    	
    }
    
    $scope.BulkSKuSaleChannelMapUpload = function(bulkOrderUploadfile) {
        console.log(bulkOrderUploadfile);
        $scope.genericData.bulkOrderUploadfile = bulkOrderUploadfile;
        console.log($scope.genericData.bulkOrderUploadfile);
        console.log(bulkOrderUploadfile.fileName);
        $scope.genericData.fileName = bulkOrderUploadfile.name;
    };
    
    $scope.downloadSKUSalesChannelMaptemplate = function(){
        $http({
            method: 'GET',
            url: $scope.genericData.downloadSkuSalesChannelMapTemplateUrl,
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
            a.download = "Glaucus_SKU_SalesChannelMap_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };
    
    $scope.uploadSKUSalesChannelBulkUpload = function(bulkOrderUploadfile){
        //console.log(bulkOrderUploadfile);
        $scope.genericData.bulkOrderUploadfile = bulkOrderUploadfile;
        if ($scope.genericData.bulkOrderUploadfile) {
            if (!$scope.genericData.bulkOrderUploadfile.$error) {
                console.log('file is ');
                console.dir($scope.genericData.bulkOrderUploadfile);
                var uploadUrl = baseUrl + '/omsservices/webapi/skus/skusaleschannelmap';

                var fd = new FormData();
                fd.append('uploadFile', $scope.genericData.bulkOrderUploadfile);
                console.log(uploadUrl);
                console.log('uploadFile' + $scope.genericData.bulkOrderUploadfile);
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
                    console.log(resp);
                    console.log('file ' + $scope.genericData.fileName + 'is uploaded successfully. Response: ' + resp.data);
                    $cookies.put('BulkUploadData','skusaleschannelmap');
                    $cookies.put('ActiveTab','skuMap');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.cancelSkuSalesChannelDialog();
                }, function(resp) {
                    $scope.cancelSkuSalesChannelDialog();
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + $scope.genericData.fileName);
                });
            }
        }
    };


    $scope.masterSkuDialog = function(ev, check) {

        mastersService.fetchSkus(baseUrl).then(function(data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function() {
                $("#dialogmastersku").modal('show');
            }, 200);
        });

        $scope.genericData.check = check;
    }

    $scope.masterSkuDialogVirtual = function(ev, check) {

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
                $scope.$broadcast("angucomplete-alt:changeInput", "virtualkits", data);
            } else {
                $scope.$broadcast("angucomplete-alt:changeInput", "kits", data);
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
}
