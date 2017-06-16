/**
 * Created by angularpc on 01-03-2017.
 */
myApp.controller('DiscountController', DiscountController);

DiscountController.$inject = ['$scope', '$http', '$location', 'baseUrl', 'commonPathUrl', '$mdDialog', '$mdMedia', '$sce', 'growl', '$window', 'downloadOrderTemplateUrl', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies', '$timeout', '$controller', 'mastersService'];

function DiscountController($scope, $http, $location, baseUrl, commonPathUrl, $mdDialog, $mdMedia, $sce, growl, $window, downloadOrderTemplateUrl, Upload, PagerService, $q, $routeParams, $cookies, $timeout, $controller, mastersService) {

//    ======================= global object ============================= //

    $scope.categorySearchUrl = baseUrl + "/omsservices/webapi/skunode/search?search=";
    $scope.skuSearchUrl = baseUrl + "/omsservices/webapi/skus/search?search=";

    $scope.genericData = {};
    $scope.exportFilterData = {};
    $scope.exportFilterData.tableDiscountSalesChannelInclusions = [];
    $scope.exportFilterData.tableDiscountSkuInclusions = [];
    $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
    $scope.genericData.salesChannelClicked = false;
    $scope.genericData.entityClicked = false;
    $scope.genericData.dialogMode = 'add';

    $scope.allDiscountRulesSizeStart = 0;
    $scope.discountRulesCount = 0;
    $scope.allDiscountRulesPageSize = 5;

    $scope.discountRules = [];

    $scope.initAddDiscountRuleModalData = function () {
        $scope.entitySearchUrl = $scope.categorySearchUrl;
        $scope.discountData = {};
        $scope.genericData.selectedSalesChannel = "";
        $scope.discountData.tableDiscountRuleName = "";
        $scope.discountData.tableDiscountRuleSelectedEntity = null;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountSalesChannelExclusions = [];
        $scope.discountData.tableDiscountSkuExclusions = [];
        $scope.discountData.tableDiscountSkuCategoryExclusions = [];
        $scope.discountData.tableDiscountRuleAllScSelected = false;
        $scope.discountData.tableDiscountRuleAllSkuSelected = false;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountRuleStartDate = null;
        $scope.discountData.tableDiscountRuleEndDate = null;
        $scope.discountData.tableDiscountRuleMinQuantity = 1;
        $scope.discountData.tableDiscountRuleDiscount = 0.01;
        $scope.discountData.tableDiscountRuleRemarks = "";
        $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
        $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    };

    $scope.reInitAddDiscountRuleModalData = function () {
        $scope.entitySearchUrl = $scope.categorySearchUrl;

        $scope.genericData.selectedSalesChannel = "";
        $scope.discountData.tableDiscountRuleName = "";
        $scope.discountData.tableDiscountRuleSelectedEntity = 'Category';
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountSalesChannelExclusions = [];
        $scope.discountData.tableDiscountSkuExclusions = [];
        $scope.discountData.tableDiscountSkuCategoryExclusions = [];
        $scope.discountData.tableDiscountRuleAllScSelected = false;
        $scope.discountData.tableDiscountRuleAllSkuSelected = false;
        $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        $scope.discountData.tableDiscountRuleStartDate = null;
        $scope.discountData.tableDiscountRuleEndDate = null;
        $scope.discountData.tableDiscountRuleMinQuantity = 1;
        $scope.discountData.tableDiscountRuleDiscount = 0.01;
        $scope.discountData.tableDiscountRuleRemarks = "";
        $scope.discountData.tableDiscountRuleSalesChannelExclusion = false;
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
        $scope.discountData = {};
        $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    };

    $scope.initAddDiscountRuleModalData();

    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.discountRules.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";


    $scope.selectTableRow = function (index) {
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

    $scope.getDiscountRules = function (start) {

        $scope.discountRules = [];
        var discountRulesURL = baseUrl + "/omsservices/webapi/discountrules?start=" + start + "&size=" + $scope.allDiscountRulesPageSize;
        $http.get(discountRulesURL).success(function (data) {
            console.log(data);
            $scope.discountRules = data;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });

    };

    $scope.getDiscountRulesCount = function (page) {

        $scope.discountRules = [];
        var discountRulesCountURL = baseUrl + "/omsservices/webapi/discountrules/count";
        $http.get(discountRulesCountURL).success(function (data) {
            console.log(data);
            $scope.discountRulesCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.discountRulesCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = PagerService.GetPager(vm.dummyItems.length, page);

                    $scope.vmPager = vm.pager;

                    $scope.allDiscountRulesSizeStart = (vm.pager.currentPage - 1) * $scope.allDiscountRulesPageSize;
                    $scope.discountRulesSize = $scope.allDiscountRulesSizeStart + $scope.allDiscountRulesPageSize;


                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.getDiscountRules($scope.allDiscountRulesSizeStart);
                }

                if (page == undefined) {
                    setPage(1);
                }
                if (page != undefined) {
                    setPage(page);
                }
            }

        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });

    };

    $scope.getDiscountRules($scope.allDiscountRulesSizeStart);

    $scope.getDiscountRulesCount(1);

    $scope.getSalesChannels = function () {
        $scope.salesChannels = [];
        var channelListUrl = baseUrl + "/omsservices/webapi/saleschannels";
        $http.get(channelListUrl).success(function (data) {
            console.log(data);
            $scope.salesChannels = data;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };


    $scope.getSalesChannels();

    $scope.searchedEntitySelected = function (selected) {

        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && selected != null) {
            $scope.searchedCategory = selected.originalObject;
            $scope.searchedSKU = null;
        }

        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && selected != null) {
            $scope.searchedSKU = selected.originalObject;
            $scope.searchedCategory = null;
        }
    };

    $scope.addEntityToDiscountRule = function () {
        
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && ($scope.genericData.searchedCategory == undefined || $scope.genericData.searchedCategory == null)) {
            growl.error('Search and select category first');
        }
        else {
            var b = true;
            if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category') {
                angular.forEach($scope.discountData.tableDiscountSkuCategoryExclusions,function(data){
                    if(data.tableSkuNode.idskuNodeId == $scope.genericData.searchedCategory.idskuNodeId){
                        b = false;
                    }
                });
                if(b == false){
                    growl.error('Category is already added in the list.');
                    return;
                }
                $scope.discountData.tableDiscountSkuCategoryExclusions.push(
                    {"tableSkuNode": $scope.genericData.searchedCategory}
                );
            }
        }
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && ($scope.searchedSKU == undefined || $scope.searchedSKU == null)) {
            growl.error('Search and select SKU first');
        } else {
            var DuplicateSkuEntityCheck = true;
            if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU') {
                angular.forEach($scope.discountData.tableDiscountSkuExclusions,function(dataSku){
                    if(dataSku.tableSku.idtableSkuId == $scope.searchedSKU.idtableSkuId){
                        DuplicateSkuEntityCheck = false;
                    }
                });
                if(DuplicateSkuEntityCheck == false){
                    growl.error('SKU is already added.');
                    return;
                }
                $scope.discountData.tableDiscountSkuExclusions.push(
                    {"tableSku": $scope.searchedSKU}
                );
            }
        }
    }

    $scope.removeEntityFromDiscountRule = function (removedEntity) {
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.discountData.tableDiscountSkuCategoryExclusions.splice(removedEntity, 1);
        }
        if ($scope.discountData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.discountData.tableDiscountSkuExclusions.splice(removedEntity, 1);
        }
    }

    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;
    }

    $scope.initDateLimits();

    $scope.initDateLimitsForExport = function () {
        $scope.minDateShipping = null;
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = null;
        $scope.maxDateDelivery = null;
    }

    $scope.initDateLimitsForExport();

    $scope.onShippingDateChangeForExport = function () {

        if($scope.exportFilterData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.exportFilterData.tableDiscountRuleEndDate);
                $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.exportFilterData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.exportFilterData.tableDiscountRuleStartDate);
                $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onShippingDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.discountData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.discountData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.discountData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.discountData.tableDiscountRuleStartDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    }

    $scope.onDeliveryDateChangeForExport = function ()
    {
        if($scope.exportFilterData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.exportFilterData.tableDiscountRuleStartDate);
                $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.exportFilterData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.exportFilterData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.discountData.tableDiscountRuleStartDate)
        {
            $scope.shippingDateData = new Date($scope.discountData.tableDiscountRuleStartDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.discountData.tableDiscountRuleEndDate)
        {
            $scope.deliveryDateData = new Date($scope.discountData.tableDiscountRuleEndDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    }

    $scope.allCategorySelectionChanged = function () {
        $scope.discountData.tableDiscountRuleSkuCategoryExclusion = false;
    }

    $scope.allSkuSelectionChanged = function () {
        $scope.discountData.tableDiscountRuleSkuExclusion = false;
    };

    $scope.clickChangeValue = function (data) {
        console.log(data);
        $scope.discountData.tableDiscountRuleSelectedEntity = data;
        if (data == "Category") {
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.discountData.tableDiscountSkuExclusions = [];
            $scope.genericData.searchedCategory = "";
            $scope.discountData.tableDiscountRuleAllSkuSelected = false;
        }
        if (data == "SKU") {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.discountData.tableDiscountSkuCategoryExclusions = [];
            $scope.discountData.tableDiscountRuleAllCategorySelected = false;
        }
    };

//    ================================= Category array type ================================== //4

    $scope.categoryTypeArray = function() {
        var categoryTypeUrl = baseUrl + "/omsservices/webapi/skunode?selected=true";
        $http.get(categoryTypeUrl).success(function(data) {
            $scope.categoryTypeLists = data;
        }).error(function(error, status) {

        });
    };

    $scope.categoryTypeArray();
//    ============================== Activate and deactivate rule ============================== //

    $scope.deactivateRule = function (discountDataObject, ev)
    {
        $scope.discountData.ruleID = discountDataObject.idtableDiscountRuleId;
        console.log(discountDataObject);
        $mdDialog.show({
            templateUrl: 'deactivateRule.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            escapeToClose: false,
            clickOutsideToClose: false,
            scope: $scope.$new()
        }).then(function (answer)
        {
        },function ()
        {
        });
    }

    //    ============================== Activate and deactivate rule ============================== //

    $scope.openConflictingRuleDialog = function ()
    {
        $mdDialog.show({
            templateUrl: 'conflictingRule.tmpl.html',
            parent: angular.element(document.body),
            escapeToClose: false,
            clickOutsideToClose: false,
            scope: $scope.$new()
        }).then(function (answer)
        {
        },function ()
        {
        });
    }

    $scope.deactivateDiscountRule = function ()
    {
        var activateDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules/" + $scope.discountData.ruleID + "/deactivate";
        $http({
            method: 'PUT',
            url: activateDiscountRuleURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            $mdDialog.hide();
            $scope.getDiscountRulesCount();
            growl.success('Discount rule deactivated successfully !')
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.activateRule = function (discountDataObject, ev) {
        console.log(discountDataObject);
        $scope.discountData.ruleID = discountDataObject.idtableDiscountRuleId;
        $mdDialog.show({
            templateUrl: 'activateRule.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            escapeToClose: false,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.activateDiscountRule = function () {
        var activateDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules/" + $scope.discountData.ruleID + "/activate";
        $http({
            method: 'PUT',
            url: activateDiscountRuleURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            $mdDialog.hide();
            $scope.getDiscountRulesCount();
            growl.success('Discount rule activated successfully !')
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.cancelDiscountRuleData = function () {
        $mdDialog.hide();
    }

//    ==================== show discount rule modal ================================== //

    $scope.showAddDiscountRuleModal = function (ev) {
        $scope.initAddDiscountRuleModalData();
        $scope.genericData.dialogMode = 'add';
        $scope.initDateLimits();
        
        $mdDialog.show({
			 templateUrl: 'addDiscountDialog.tmpl.html',
		 parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        scope: $scope.$new()
        });
        
    };

//    ============================= close discount dialog box =========================== //

    $scope.cancelDiscountRuleDialog = function () {
        $scope.reInitAddDiscountRuleModalData();
        
        $mdDialog.hide({
			 templateUrl: 'addDiscountDialog.tmpl.html'		 
       });
        
        $scope.discountData = "";
    };

    $scope.setSelectedChannel = function (selectedSalesChannel) {
        $scope.genericData.selectedSalesChannel = selectedSalesChannel;
    }

    $scope.addSalesChannelToList = function () {

        console.log($scope.genericData.selectedSalesChannel);
        if ($scope.genericData.selectedSalesChannel == "" || $scope.genericData.selectedSalesChannel == undefined) {
            growl.error('Select a sales channel first');
        } else {
            var salesChannelListing = true;
            angular.forEach($scope.discountData.tableDiscountSalesChannelExclusions,function(value){
                console.log(value);
                if(value.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId == $scope.genericData.selectedSalesChannel.idtableSalesChannelValueInfoId){
                    salesChannelListing = false;
                }
            });
            if(salesChannelListing == false){
                growl.error('Sales Channel is already added in the list.');
                return;
            }
            $scope.discountData.tableDiscountSalesChannelExclusions.push(
                {"tableSalesChannelValueInfo": $scope.genericData.selectedSalesChannel}
            );
            $scope.checkB2BForQuantity();
        }
    }

    $scope.checkB2BForQuantity = function () {
        $scope.enableQuantity = false;
        //check for exclusion and all selected flags
        if ($scope.tableDiscountRuleAllScSelected == true) {

            for (var channelCounter = 0; channelCounter < $scope.discountData.salesChannels.length; channelCounter++) {
                //check b2b flag at channel value info and meta info level
                if ($scope.discountData.salesChannels[channelCounter].tableCustomerType.idtableCustomerTypeId == 2
                    || $scope.discountData.salesChannels[channelCounter].tableSalesChannelMetaInfo.tableCustomerType.idtableCustomerTypeId == 2) {
                    $scope.enableQuantity = true;
                }

            }

        }
        if ($scope.tableDiscountRuleSalesChannelExclusion == false) {
            for (var channelCounter = 0; channelCounter < $scope.discountData.tableDiscountSalesChannelExclusions.length; channelCounter++) {
                //check b2b flag at channel value info and meta info level
                if ($scope.discountData.tableDiscountSalesChannelExclusions[channelCounter].tableSalesChannelValueInfo.tableCustomerType.idtableCustomerTypeId == 2
                    || $scope.discountData.tableDiscountSalesChannelExclusions[channelCounter].tableSalesChannelValueInfo.tableSalesChannelMetaInfo.tableCustomerType.idtableCustomerTypeId == 2) {
                    $scope.enableQuantity = true;
                }
            }
        }

        if ($scope.tableDiscountRuleSalesChannelExclusion == true) {
            //prepare a separate array of inclusions
            var tableDiscountSalesChannelInclusions = [];

            for (var channelCounter = 0; channelCounter < $scope.discountData.salesChannels.length; channelCounter++) {
                var excluded = false;
                for (var exclusionsChannelCounter = 0; exclusionsChannelCounter < $scope.discountData.tableDiscountSalesChannelExclusions.length; exclusionsChannelCounter++) {
                    if ($scope.discountData.tableDiscountSalesChannelExclusions[exclusionsChannelCounter].tableSalesChannelValueInfo.idtableSalesChannelValueInfoId
                        == $scope.discountData.salesChannels[channelCounter].idtableSalesChannelValueInfoId) {
                        excluded = true;
                    }
                }
                if (excluded == false) {
                    tableDiscountSalesChannelInclusions.push($scope.discountData.tableDiscountSalesChannelExclusions[exclusionsChannelCounter].tableSalesChannelValueInfo);
                }

            }

            for (var channelCounter = 0; channelCounter < $scope.discountData.tableDiscountSalesChannelInclusions.length; channelCounter++) {
                //check b2b flag at channel value info and meta info level
                if ($scope.discountData.tableDiscountSalesChannelInclusions[channelCounter].tableCustomerType.idtableCustomerTypeId == 2
                    || $scope.discountData.tableDiscountSalesChannelInclusions[channelCounter].tableCustomerType.idtableCustomerTypeId == 2) {
                    $scope.enableQuantity = true;
                }
            }
        }
    }


    $scope.removeSalesChannelFromList = function (removedSalesChannel) {

        $scope.discountData.tableDiscountSalesChannelExclusions.splice(removedSalesChannel, 1);

    }

    $scope.validateDiscountData = function () {

        console.log($scope.discountData);

        if($scope.discountData.tableDiscountRuleDiscount > 100.00 || $scope.discountData.tableDiscountRuleDiscount < 0.01)
        {
            growl.error("Discount percentage value shall be between 0.01 and 100.00");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleName == null || $scope.discountData.tableDiscountRuleName == undefined || $scope.discountData.tableDiscountRuleName == "") {
            growl.error("Discount rule name is mandatory");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleDiscount == null || $scope.discountData.tableDiscountRuleDiscount == undefined || $scope.discountData.tableDiscountRuleName == "0") {
            growl.error("Discount percentage is mandatory and should be greater than 0");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleAllScSelected == false && $scope.discountData.tableDiscountSalesChannelExclusions.length == 0) {
            growl.error("Sales channel is required and at least one sales channel is required in list");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleSelectedEntity == null)
        {
            growl.error("Configure SKU/Categories for this rule");
            return false;
        }

        if ($scope.discountData.tableDiscountRuleAllCategorySelected == false && $scope.discountData.tableDiscountRuleSelectedEntity == 'Category' && $scope.discountData.tableDiscountSkuCategoryExclusions.length == 0) {
            growl.error("Category is required and at least one category is required in list ");
            return false;
        }
        if ($scope.discountData.tableDiscountRuleAllSkuSelected == false && $scope.discountData.tableDiscountRuleSelectedEntity == 'SKU' && $scope.discountData.tableDiscountSkuExclusions.length == 0) {
            growl.error('SKU is required and at least one SKU is required in the list');
            return false;
        }
        return true;
    };

//    ====================================== post discount data ================================= //

    $scope.AddDiscountRule = function () {
        console.log($scope.discountData);


        if ($scope.validateDiscountData() == false) {
            return;
        }



        $scope.discountDataCopy = angular.copy($scope.discountData);
        if($scope.discountData.tableDiscountRuleStartDate != null && $scope.discountData.tableDiscountRuleStartDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleStartDate = moment.utc($scope.discountData.tableDiscountRuleStartDate).format();
        }
        if($scope.discountData.tableDiscountRuleEndDate != null && $scope.discountData.tableDiscountRuleEndDate != undefined){
            $scope.discountDataCopy.tableDiscountRuleEndDate = moment.utc($scope.discountData.tableDiscountRuleEndDate).format();
        }

        var addDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules";

        var checkConflictDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules/checkconflicts";

        if ($scope.discountDataCopy.tableDiscountRuleAllScSelected == false && $scope.discountDataCopy.tableDiscountRuleSalesChannelExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllScSelected = null;
        }

        if ($scope.discountDataCopy.tableDiscountRuleAllCategorySelected == false && $scope.discountDataCopy.tableDiscountRuleSkuCategoryExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllCategorySelected = null;
        }

        if ($scope.discountDataCopy.tableDiscountRuleAllSkuSelected == false && $scope.discountDataCopy.tableDiscountRuleSkuExclusion.length == 0) {
            $scope.discountDataCopy.tableDiscountRuleAllSkuSelected = null;
        }

        $http({
            method: 'POST',
            url: checkConflictDiscountRuleURL,
            data: $scope.discountDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(res != null && res.length > 0 )
            {
                $scope.genericData.conflictingRules = [];
                $scope.genericData.conflictingRules =  res;
                $scope.openConflictingRuleDialog();
            }
            else
            {
                $http({
                    method: 'POST',
                    url: addDiscountRuleURL,
                    data: $scope.discountDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    $scope.discountRules.push(res);
                    
                    $mdDialog.hide({
           			 templateUrl: 'addDiscountDialog.tmpl.html'		 
                    });
                    
                    $scope.initAddDiscountRuleModalData();
                    $scope.getDiscountRulesCount();
                    growl.success('Discount rule added successfully !')
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);

                });
            }


        }).error(function (error, status)
        {
            console.log(error);
            console.log(status);
        });


    };

    //    ====================================== PUT discount data ================================= //

    $scope.updateDiscountRule = function ()
    {
        console.log($scope.discountData);


        if ($scope.validateDiscountData() == false) {
            return;
        }

        $scope.discountDataCopy = angular.copy($scope.discountData);

        if($scope.discountData.tableDiscountRuleStartDate != null && $scope.discountData.tableDiscountRuleStartDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleStartDate = moment.utc($scope.discountData.tableDiscountRuleStartDate).format();
        }
        if($scope.discountData.tableDiscountRuleEndDate != null && $scope.discountData.tableDiscountRuleEndDate != undefined)
        {
            $scope.discountDataCopy.tableDiscountRuleEndDate = moment.utc($scope.discountData.tableDiscountRuleEndDate).format();
        }

        var updateDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules/" + $scope.discountDataCopy.idtableDiscountRuleId;

        var checkConflictDiscountRuleURL = baseUrl + "/omsservices/webapi/discountrules/checkconflicts";

        $http({
            method: 'POST',
            url: checkConflictDiscountRuleURL,
            data: $scope.discountDataCopy,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res)
        {
            if(res != null && res.length > 0 )
            {
                $scope.genericData.conflictingRules = [];
                $scope.genericData.conflictingRules =  res;
                $scope.openConflictingRuleDialog();
            }
            else
            {
                $http({
                    method: 'PUT',
                    url: updateDiscountRuleURL,
                    data: $scope.discountDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    $scope.discountRules.push(res);
                    $mdDialog.hide({
              			 templateUrl: 'addDiscountDialog.tmpl.html'		 
                       });
                    $scope.initAddDiscountRuleModalData();
                    $scope.getDiscountRulesCount();
                    growl.success('Discount rule updated successfully !')
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);

                });
            }


        }).error(function (error, status)
        {
            console.log(error);
            console.log(status);
        });


    };

    $scope.cancelConflictingRulesDialog = function () {

    }

    $scope.editDiscountRule = function (discountRule, ev) {
        console.log(discountRule);
        $scope.genericData.dialogMode = 'edit';
        $scope.discountData = angular.copy(discountRule);
        if (discountRule.tableDiscountRuleStartDate != null) {
            $scope.discountData.tableDiscountRuleStartDate = new Date(discountRule.tableDiscountRuleStartDate);
        }
        if (discountRule.tableDiscountRuleEndDate != null) {
            $scope.discountData.tableDiscountRuleEndDate = new Date(discountRule.tableDiscountRuleEndDate);
        }

        $mdDialog.show({
            templateUrl: 'addDiscountDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

    }

    $scope.salesChannelClickedRow = function () {
        $scope.genericData.salesChannelClicked = !$scope.genericData.salesChannelClicked;
    }

    $scope.entityClickedRow = function () {
        $scope.genericData.entityClicked = !$scope.genericData.entityClicked;
    }

    //Updated Code By UV
    $scope.cancelmastersDialog = function(ev){
		$mdDialog.hide({
            templateUrl: 'dialogmastersku.tmpl.html'
        });
		
		$mdDialog.hide({
            templateUrl: 'dialogmastervendor.tmpl.html'
        });
		
		if($scope.genericData.check == true){						
			$scope.showAddOrderModalWithValues(ev);

		}

		if($scope.genericData.checker == true){
            $scope.showExportDiscountDialog(ev);
        }
	}
	
	$scope.selectSku = function(id, ev){		
			
		$http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
	
			$scope.$broadcast("angucomplete-alt-long:changeInput", "category", data);

        }).error(function(error, status) {
            console.log(error);
			
        });	
		
		$scope.cancelmastersDialog(ev);		
	}
	
	
	$scope.showAddOrderModalWithValues = function(ev){
		
		$mdDialog.show({
			 templateUrl: 'addDiscountDialog.tmpl.html',
		 parent: angular.element(document.body),
         targetEvent: ev,
         clickOutsideToClose: false,
         scope: $scope.$new()
         });	
		
	}
    

    $scope.masterSkuDialog = function (ev, check) {

        mastersService.fetchSkus(baseUrl).then(function (data) {
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

        if (check == true) {
            $mdDialog.hide({
                //templateUrl: 'addDiscountDialog.tmpl.html'
            });
            console.log($scope.singleorderData);
        }

    }

    $scope.masterSkuDialogForFilter = function (ev, check) {

        mastersService.fetchSkus(baseUrl).then(function (data) {
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

        //$scope.genericData.check = check;
        $scope.genericData.checker = check;

        if (check == true) {
            $mdDialog.hide({
                //templateUrl: 'addDiscountDialog.tmpl.html'
            });
           // console.log($scope.singleorderData);
        }

    }

    $scope.selectSku = function(id, ev){

        $http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            $scope.$broadcast("angucomplete-alt-long:changeInput", "category", data);

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog(ev);
    }





    $scope.showExportDiscountDialog = function (ev) {

        $scope.initDateLimitsForExport();

        $mdDialog.show({
            templateUrl: 'exportDiscountDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }

    $scope.cancelDiscountExportDialog = function(){

	    $scope.exportFilterData = {};
        $scope.exportFilterData.tableDiscountRuleAllScSelected = false;
        $scope.exportFilterData.tableDiscountSalesChannelInclusions =[];
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];

        $mdDialog.hide({
            templateUrl: 'exportDiscountDialog.tmpl.html'
        });
    }

    $scope.clearActionForExportFilter = function(saleChannelId, skuId, startDate, endDate, customerid,orderid) {
        $scope.exportFilterData.tableDiscountRuleStartDate = null;
        $scope.exportFilterData.tableDiscountRuleEndDate = null;
        $scope.exportFilterData.selectedSalesChannel = null;
        $scope.exportFilterData.tableDiscountRuleAllScSelected = false;
        $scope.exportFilterData.tableDiscountSalesChannelInclusions = [];
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
        $scope.exportFilterData.tableDiscountRuleSelectedEntity = null;
        $scope.exportFilterData.tableDiscountRuleAllSkuSelected = false;
        $scope.exportFilterData.tableDiscountRuleAllCategorySelected = false;
        $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
        $scope.initDateLimitsForExport();

    }


    $scope.exportFilterData.selectedSalesChannel = null;
    $scope.setSelectedChannelForFilter = function (selectedSalesChannel) {
        $scope.exportFilterData.selectedSalesChannel = selectedSalesChannel;
        //alert($scope.exportFilterData.selectedSalesChannel);
    }

    $scope.addSalesChannelToListForFilter = function () {

        console.log($scope.exportFilterData.selectedSalesChannel);
        if ($scope.exportFilterData.selectedSalesChannel == "" || $scope.exportFilterData.selectedSalesChannel == undefined) {
            growl.error('Select a sales channel first');
        } else {
            var salesChannelListing = true;
            angular.forEach($scope.exportFilterData.tableDiscountSalesChannelInclusions,function(value){
                console.log(value);
                if(value.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId == $scope.exportFilterData.selectedSalesChannel.idtableSalesChannelValueInfoId){
                    salesChannelListing = false;
                }
            });
            if(salesChannelListing == false){
                growl.error('Sales Channel is already added in the list.');
                return;
            }
            $scope.exportFilterData.tableDiscountSalesChannelInclusions.push(
                {"tableSalesChannelValueInfo" : $scope.exportFilterData.selectedSalesChannel}
            );

        }
    }

    $scope.removeSalesChannelFromListForFilter = function (removedSalesChannel) {

        $scope.exportFilterData.tableDiscountSalesChannelInclusions.splice(removedSalesChannel, 1);

    }
    $scope.exportFilterData.tableDiscountRuleAllSkuSelected = true;

    $scope.clickChangeValueForFilter = function (data) {
        console.log(data);
        $scope.exportFilterData.tableDiscountRuleSelectedEntity = data;
        if (data == "Category") {
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.exportFilterData.tableDiscountSkuInclusions = [];
            $scope.exportFilterData.searchedCategory = "";
            $scope.exportFilterData.tableDiscountRuleAllSkuSelected = false;
        }
        if (data == "SKU") {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
            $scope.exportFilterData.tableDiscountRuleAllCategorySelected = false;
        }
    };

    //$scope.exportFilterData.tableDiscountRuleSkuCategoryInclusion = true;
   /* $scope.allCategorySelectionChangedForFilter = function () {
        $scope.exportFilterData.tableDiscountRuleSkuCategoryInclusion = false;
        $scope.exportFilterData.tableDiscountSkuCategoryInclusions = [];
    }

    $scope.allSkuSelectionChangedForFilter = function () {
        $scope.exportFilterData.tableDiscountRuleSkuInclusion = false;
        $scope.exportFilterData.tableDiscountSkuInclusions = [];
    };*/
    $scope.exportFilterData.tableDiscountRuleAllScSelected = false;
    $scope.allSalesChannelSelectionChangedForFilter = function () {
        $scope.exportFilterData.tableDiscountRuleAllScSelected = true;
    }

    $scope.addEntityToDiscountRuleForFilter = function () {

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category' && ($scope.exportFilterData.searchedCategory == undefined || $scope.exportFilterData.searchedCategory == null)) {
            growl.error('Search and select category first');
        }
        else {
            var b = true;
            if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
                angular.forEach($scope.exportFilterData.tableDiscountSkuCategoryInclusions,function(data){
                    if(data.tableSkuNode.idskuNodeId == $scope.exportFilterData.searchedCategory.idskuNodeId){
                        b = false;
                    }
                });
                if(b == false){
                    growl.error('Category is already added in the list.');
                    return;
                }
                $scope.exportFilterData.tableDiscountSkuCategoryInclusions.push(
                    {"tableSkuNode" : $scope.exportFilterData.searchedCategory}
                );
            }
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU' && ($scope.searchedSKU == undefined || $scope.searchedSKU == null)) {
            growl.error('Search and select SKU first');
        } else {
            var DuplicateSkuEntityCheck = true;
            if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
                angular.forEach($scope.exportFilterData.tableDiscountSkuInclusions,function(dataSku){
                    if(dataSku.tableSku.idtableSkuId == $scope.searchedSKU.idtableSkuId){
                        DuplicateSkuEntityCheck = false;
                    }
                });
                if(DuplicateSkuEntityCheck == false){
                    growl.error('SKU is already added.');
                    return;
                }
                $scope.exportFilterData.tableDiscountSkuInclusions.push(
                    {"tableSku": $scope.searchedSKU}
                );
            }
        }
    }

    $scope.removeEntityFromDiscountRuleForFilter = function (removedEntity) {
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions.splice(removedEntity, 1);
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.exportFilterData.tableDiscountSkuInclusions.splice(removedEntity, 1);
        }
    }

    $scope.removeEntityFromDiscountRuleForFilter = function (removedEntity) {
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category') {
            $scope.exportFilterData.tableDiscountSkuCategoryInclusions.splice(removedEntity, 1);
        }
        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU') {
            $scope.exportFilterData.tableDiscountSkuInclusions.splice(removedEntity, 1);
        }
    }

    $scope.searchedEntitySelectedForFilter = function (selected) {

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'Category' && selected != null) {
            $scope.searchedCategory = selected.originalObject;
            $scope.searchedSKU = null;
        }

        if ($scope.exportFilterData.tableDiscountRuleSelectedEntity == 'SKU' && selected != null) {
            $scope.searchedSKU = selected.originalObject;
            $scope.searchedCategory = null;
        }
    };

    $scope.downloadDiscountRules = function () {

        var saleChannels = [];
        var categories = [];
        var skus = [];

        var check = false;

        if($scope.exportFilterData.tableDiscountRuleAllScSelected == false && $scope.exportFilterData.tableDiscountSalesChannelInclusions.length == 0){
            check = true;
            growl.error("Please fill required filters.");
        }

        if($scope.exportFilterData.tableDiscountRuleSelectedEntity == null){
            check = true;
            growl.error("Select category or SKU filters.");
        }

        if (!check) {
            if ($scope.exportFilterData.tableDiscountRuleAllScSelected == true) {
                saleChannels = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSalesChannelInclusions.length; i++) {
                    saleChannels.push($scope.exportFilterData.tableDiscountSalesChannelInclusions[i].tableSalesChannelValueInfo.idtableSalesChannelValueInfoId);
                }
            }

            if ($scope.exportFilterData.tableDiscountRuleAllCategorySelected == true) {
                categories = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSkuCategoryInclusions.length; i++) {
                    categories.push($scope.exportFilterData.tableDiscountSkuCategoryInclusions[i].tableSkuNode.idskuNodeId);
                }
            }

            if ($scope.exportFilterData.tableDiscountRuleAllSkuSelected == true) {
                skus = [];
            } else {
                for (var i = 0; i < $scope.exportFilterData.tableDiscountSkuInclusions.length; i++) {
                    skus.push($scope.exportFilterData.tableDiscountSkuInclusions[i].tableSku.idtableSkuId);
                }
            }

            var filterObject = {
                "startDate": $scope.exportFilterData.tableDiscountRuleStartDate,
                "endDate": $scope.exportFilterData.tableDiscountRuleEndDate,
                "saleChannelIds": saleChannels,
                "skuIds": skus,
                "categoryIds": categories
            }

            var orderListUrl = baseUrl + "/omsservices/webapi/discountratematrixs/export";

            $http({
                method: 'POST',
                url: orderListUrl,
                data: filterObject,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'

            })
                .success(function (data, status) {
                    console.log(data);
                    if (status == '204') {
                        growl.error("Discounts are not available for current filter values.");
                    } else {
                        var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                        var downloadUrl = URL.createObjectURL(blob);
                        var a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = "Glaucus_Discount_Rule_Matrix.xls";
                        document.body.appendChild(a);
                        a.click();
                        $scope.cancelDiscountExportDialog();
                    }
                    ;


                }).error(function (error, status) {
                if (status == 400) {
                    growl.error(data.errorMessage);
                }
                else {
                    growl.error("Discount Export request failed");
                }

            });
        }
    }
}
