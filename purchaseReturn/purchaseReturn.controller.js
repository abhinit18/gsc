myApp.controller('purchaseReturnController', purchaseReturnController);
purchaseReturnController.$inject = ['$rootScope','$scope', '$http', '$location', '$filter', 'baseUrl','commonPathUrl', '$mdDialog', '$mdMedia','$sce', 'growl', '$window', 'downloadOrderTemplateUrl', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies','$timeout', 'mastersService'];

function purchaseReturnController($rootScope ,$scope, $http, $location, $filter, baseUrl, commonPathUrl, $mdDialog, $mdMedia,$sce, growl, $window, downloadOrderTemplateUrl, Upload, PagerService, $q,  $routeParams, $cookies,$timeout, mastersService)
{

    //================================= global variables ========================== //
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseVendorUrl = baseUrl + '/omsservices/webapi/vendors/search?search=';
    $scope.bulkPurchaseReturnWithIdUrl = baseUrl + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithpo';
    $scope.bulkPurchaseReturnWithoutIdUrl = baseUrl + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithoutpo';
    $scope.genericData = {};
    $scope.genericData.singlePurchaseOrderReturnMode = "add";
    $scope.genericData.selectedOrderForEditRemarks = {};

    $scope.sortType = "tablePurchaseReturnSystemOrderNo";
    $scope.directionType = "desc";

    $scope.filterObj = {};
    $scope.filterObj.tableWarehouseDetails = null;
    $scope.filterObj.tablePurchaseReturnRefNo = null;
    $scope.filterObj.tablePurchaseReturnSystemOrderNo = null;
    $scope.filterObj.tableSku = null;
    $scope.filterObj.tableVendor = null;
    $scope.filterObj.start1Date = null;
    $scope.filterObj.end1Date = null;

    $scope.bulkPurchaseOrderReturnTab = false;
    $scope.PurchaseOrderReturnTab = true;
    $scope.defaultTab = 'all';
    $scope.orderSize = 5;
    $scope.PurchaseOrderReturnData = {};

    $scope.boxDetails = [];
    $scope.shippingDetails = {};
    $scope.Packing = {};
    $scope.shipping = {};
    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];
    $scope.quickShipDataTable = [];
    $scope.Packing.containerQuantity = [];

    $scope.quantityTypes = [
        'Good',
        'Bad'
    ]

    if($cookies.get('orderid') != null){
        $scope.filterObj.tablePurchaseReturnSystemOrderNo = $cookies.get('orderid');
        $cookies.remove('orderid')
    }

    var currentUrl,UrlName;
    currentUrl = window.location.href;
    UrlName = currentUrl.search('purchaseReturn');
    console.log(UrlName);
    if(UrlName == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }

    $scope.genericData = {};

    $scope.initSingleOrderReturnData = function ()
    {
        $scope.genericData = {};
        $scope.genericData.returnQuantity = "";
        $scope.genericData.poRefNo = "";
        $scope.singleorderReturnData = {};
        $scope.singleorderReturnData.tablePurchaseReturnRefNo = "";
        $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        $scope.singleorderReturnData.tableShippingOwnership = null;
        $scope.singleorderReturnData.tableVendor = null;
        $scope.singleorderReturnData.tableWarehouseDetails = null;
        $scope.singleorderReturnData.tablePurchaseReturnQuantityType = "";
        $scope.singleorderReturnData.tablePurchaseReturnRemarks = "";
        $scope.singleorderReturnData.tablePurchaseReturnPickupDate = "";
        $scope.singleorderReturnData.tablePurchaseReturnDropDate = "";
        $scope.singleorderReturnData.tablePurchaseOrder = null;
        $scope.singleorderReturnData.tableAddress = null;
        $scope.fileName = null;
        $scope.genericData.bulkOrderUploadfile = null;
    }

    //============================ datepicker action change =============================== //


    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();

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



    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    };

    $scope.initDateLimits();



    $scope.onPickUpDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderReturnData.tablePurchaseReturnDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    };

    $scope.onDropDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderReturnData.tablePurchaseReturnDropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };


    $scope.clearStartDate = function()
    {
        $scope.filterObj.startDate = "";
        $scope.filterObj.start1Date = null;
        if($scope.filterObj.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filterObj.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.filterObj.endDate = "";
        $scope.filterObj.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filterObj.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.filterObj.start1Date);
        }
    }

    $scope.sendPickDate = function(date) {

    };

    $scope.sendDropDate = function(date) {

    };

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

    $scope.cancelEditRemarksModal = function ()
    {
        $('#editRemarkModal').modal('hide');
        $scope.genericData.selectedOrderForEditRemarks = {};
	    $scope.genericData.newRemarks = null;

    };

    $scope.openEditRemarkModal = function(order)
    {
        $scope.genericData.selectedOrderForEditRemarks = order ;
        $scope.modalRemarks = null;
        if(order.tablePurchaseReturnRemarkses == null || order.tablePurchaseReturnRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else
        {
            if(order.tablePurchaseReturnRemarkses.length > 0) {
                $scope.modalRemarks = order.tablePurchaseReturnRemarkses;
            }
        }
        $('#editRemarkModal').modal('show');
    };

    $scope.updateRemarks = function ()
    {

        var orderData = $scope.genericData.selectedOrderForEditRemarks;
        var newRemarks = $scope.genericData.newRemarks;
        var updateRemarksURL = baseUrl + '/omsservices/webapi/purchasereturn/' +  $scope.genericData.selectedOrderForEditRemarks.idtablePurchaseReturnId +'/editremarks';
        $http({
            method: 'PUT',
            url: updateRemarksURL,
            data: newRemarks
        }).success(function(data)
        {
            var checkUpdatedRemarksDataUrl = baseUrl + "/omsservices/webapi/purchasereturn/"+orderData.idtablePurchaseReturnId;
            $http({
                method: 'GET',
                url: checkUpdatedRemarksDataUrl
            }).success(function(response){
                var dataIndex = $scope.PurchaseOrderReturnDataLists.indexOf(orderData);
                $scope.PurchaseOrderReturnDataLists[dataIndex] = response;
                $scope.cancelEditRemarksModal();
                growl.success("Remarks updated successfully");

            }).error(function(err){
                console.log(err);
            });



        }).error(function(error, status)
        {
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
    
    $scope.showCancelPurchaseOrderItem = function (tablePurchaseReturn, tablePurchaseReturnSku)
    {
        $scope.genericData.cancelPurchaseReturnRef = tablePurchaseReturn;
        $scope.genericData.cancelPurchaseReturnSkuRef = tablePurchaseReturnSku;
        $scope.genericData.selectedCancelReason = null;
        $mdDialog.show({
            templateUrl: 'cancelPurchaseReturnItem.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.hideCancelOrderItemDialog = function () {
        $mdDialog.hide();
    }

    $scope.cancelPurchaseReturnItem = function ()
    {
        if(!$scope.genericData.selectedCancelReason){
            growl.error('Please select a reason from the list');
            return ;
        }
        var cancelReason = '';
        if($scope.genericData.selectedCancelReason.tablePurchaseReturnCancelReasonString == 'Other')
        {
            if($scope.genericData.newCancelReason){
                if($scope.genericData.newCancelReason.tablePurchaseReturnCancelReasonString!=null) {
                    cancelReason = $scope.genericData.newCancelReason.tablePurchaseReturnCancelReasonString;
                }
                else
                {
                    growl.error("Provide a cancel reason in text area");
                    return;
                }
            }
            else{
                growl.error("Provide a cancel reason in text area");
                return;
            }

        }
        else
        {
            cancelReason = $scope.genericData.selectedCancelReason.tablePurchaseReturnCancelReasonString;
        }
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/purchasereturn/'  + $scope.genericData.cancelPurchaseReturnRef.idtablePurchaseReturnId + '/purchasereturnsku/' + $scope.genericData.cancelPurchaseReturnSkuRef.idtablePurchaseReturnSkuId + '/cancel?remarks=' + cancelReason,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data)
        {
            growl.success('Purchase return cancelled');
            $scope.hideCancelOrderItemDialog();
            $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1);


        }).error(function(data)
        {
            console.log(data);
        });



        if($scope.genericData.addCancelReasonToList == true)
        {
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/purchasereturncancelreason',
                data: $scope.genericData.newCancelReason,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data)
            {
                growl.success('Cancel reason added to the list');
                $scope.loadCancelReasons();

            }).error(function(data)
            {
                console.log(data);
            });
        }
    }

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = baseUrl + '/omsservices/webapi/purchasereturncancelreason';
        $http.get(cancelReasonsUrl).success(function(data)
        {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadCancelReasons();

    $scope.getPurchaseOrderInfo = function ()
    {
        var poUrl = baseUrl+'/omsservices/webapi/purchase/order/systemorderno?systemorderno=' + $scope.genericData.poRefNo;
        $http.get(poUrl).success(function(response)
        {
            if(response != null && response != undefined && response != "")
            {
                var grnfound = false;
                var purchaseOrderSkuses = response.tablePurchaseOrderSkuses;
                for(var skuindex=0; skuindex < purchaseOrderSkuses.length;skuindex++)
                {
                    if(response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 7
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 8
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 9
                        || response.tablePurchaseOrderSkuses[skuindex].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId == 10)
                    {
                        grnfound = true;
                    }
                    else
                    {
                        response.tablePurchaseOrderSkuses.splice(skuindex,1);
                    }
                }
                if(grnfound == false)
                {
                    growl.error("There are no items in this order that are in grn state");
                    return;
                }
                $scope.populateReturnOrderFromPurchaseOrder(response);
            }
            else
            {
                growl.error("Can't find PO with this reference !!");
            }

        }).error(function(error, status)
        {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to get order");
            }
        });
    }

    $scope.populateReturnOrderFromPurchaseOrder = function (response)
    {
        $scope.genericData.availableQuantitys = [];
        $scope.genericData.OrderedQuantitys = [];
        $scope.genericData.skuInventories = [];
        $scope.getVendorAddress(response.tableVendor);

        //populate data here
        $scope.singleorderReturnData.tableAddress = response.tableAddress;
        $scope.singleorderReturnData.tableVendor = response.tableVendor ;
        $scope.singleorderReturnData.tablePurchaseOrder = response ;
        $scope.singleorderReturnData.tableWarehouseDetails = response.tableWarehouseDetails ;
        $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        $scope.singleorderReturnData.tablePurchaseReturnQuantityType = $scope.quantityTypes[0];

        for(var orderSkuCounter = 0; orderSkuCounter < response.tablePurchaseOrderSkuses.length ; orderSkuCounter++)
        {
            var availableQuantityOfPOurl = baseUrl+'/omsservices/webapi/purchase/order/' + response.idtablePurchaseOrderId +"/orderskus/"+ response.tablePurchaseOrderSkuses[orderSkuCounter].idtablePurchaseOrderSkusId +"/inventory";
            var tableSku =  response.tablePurchaseOrderSkuses[orderSkuCounter].tableSku;
            $scope.genericData.OrderedQuantitys.push(
                {
                    "tableSku" : tableSku,
                    "tablePurchaseReturnSkuQuantity" : response.tablePurchaseOrderSkuses[orderSkuCounter].tablePurchaseOrderSkusSkuQuantity
                }
            )

            $http.get(availableQuantityOfPOurl).success(function(data)
            {
                $scope.genericData.skuInventories.push(data);
                $scope.genericData.availableQuantitys.push(
                    {
                        "tableSku" : tableSku,
                        "tablePurchaseReturnSkuQuantity" : data.tableSkuInventoryAvailableCount
                    }
                )
                $scope.singleorderReturnData.tablePurchaseReturnSkus.push(
                    {
                        "tableSku" : tableSku,
                        "tablePurchaseReturnSkuQuantity" : data.tableSkuInventoryAvailableCount
                    }
                )

            }).error(function(error,status)
            {

            });

        }

    }

    $scope.getAvailableQuantitys = function ()
    {
        for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
        {
            if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Good") {
                $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryAvailableCount;
                $scope.singleorderReturnData.tablePurchaseReturnSkus[orderSkuCounter].tablePurchaseReturnSkuQuantity = $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryAvailableCount;
            }
            if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Bad") {
                var badcount = 0;
                if($scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryInwardQcFailedCount)
                {
                    badcount += $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryInwardQcFailedCount;
                }
                if($scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryOutwardQcFailedCount)
                {
                    badcount += $scope.genericData.skuInventories[orderSkuCounter].tableSkuInventoryOutwardQcFailedCount;
                }
                $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = badcount;
                $scope.singleorderReturnData.tablePurchaseReturnSkus[orderSkuCounter].tablePurchaseReturnSkuQuantity = badcount;
            }
        }
    }

    $scope.getAvailableQuantity = function (tableSku)
    {
        if(tableSku == null || tableSku == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if ($scope.singleorderReturnData.tableWarehouseDetails == null || $scope.singleorderReturnData.tableWarehouseDetails == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == null || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }


        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Good") {
            $http({
                method: 'GET',
                url: baseUrl + '/omsservices/webapi/inventory/' + tableSku.idtableSkuId + '/inventoriescount?fromwarehouseid='
                + $scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId ,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
                {
                    if($scope.genericData.availableQuantitys[orderSkuCounter].tableSku === tableSku )
                    {
                        $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = res.totalInventory-res.totalBlockedInventory;
                    }
                }
            }).error(function (error, status)
            {

            });
        }
        if($scope.singleorderReturnData.tablePurchaseReturnQuantityType == "Bad") {
            $http({
                method: 'GET',
                url: baseUrl + '/omsservices/webapi/inventory/sku/' + tableSku.idtableSkuId + '/warehouse/' + $scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId + '/badcount',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                for(var orderSkuCounter = 0; orderSkuCounter < $scope.genericData.availableQuantitys.length ; orderSkuCounter++)
                {
                    if($scope.genericData.availableQuantitys[orderSkuCounter].tableSku === tableSku )
                    {
                        $scope.genericData.availableQuantitys[orderSkuCounter].tablePurchaseReturnSkuQuantity = res;
                    }
                }
            }).error(function (error, status) {

            });
        }
    };


    $scope.loadReturnReasons = function() {
        $scope.returnReasonArray = [];
        var returnReasonsUrl = baseUrl + '/omsservices/webapi/purchasereturnreason';
        $http.get(returnReasonsUrl).success(function(data)
        {
            $scope.returnReasonArray = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadReturnReasons();

    $scope.onPOReferenceNumberOptionChanged = function (porefknown)
    {
        $scope.initSingleOrderReturnData();
        $scope.initDateLimits();
        $scope.genericData.singlePurchaseOrderReturnMode = "add";
        $scope.genericData.poRefKnown = porefknown;
        if($scope.genericData.poRefKnown == true)
        {
            $('#addPurchaseOrderReturnModal').modal('show');
        }
        if($scope.genericData.poRefKnown == false)
        {
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        $('#askPurchaseRefKnownModal').modal('hide');
    }

    $scope.showaAskPurchaseRefKnownModal = function () {
        $('#askPurchaseRefKnownModal').modal('show');

    }

//    ====================================== add quick ship details ======================================== //



    $scope.quickShipDataDialog = function (ev, data) {
        $scope.disableQuickShip = false;
        $mdDialog.show({
            templateUrl: 'PurchaseReturnquickOperation.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        $scope.quickShipDataTable = data.tablePurchaseReturnSkus;

        $scope.quickShipDataTable.orderID = data.idtablePurchaseReturnId;
        $scope.SelectVehicleType();
        $scope.LengthMeasureUnitDropDown();
    };

    $scope.cancelQuickShipModal = function(){

        $scope.blurred = true;
        $scope.boxDetails = [];
        $scope.shippingDetails = {};
        $scope.Packing = {};
        $scope.quickShipDataTable = [];


        $mdDialog.hide();
    };

    $scope.validateAlphaNum = function (val) {

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
        $scope.shippingDetails.tablePurchaseReturnShippingDetailsMasterAwb = null;

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
            if($scope.validateAlpha(value.DriverName) == false){
                return false;
            }
            if($scope.validateAlphaNum(value.VehicleNumber) == false){
                return false;
            }
            if($scope.validateNumber(value.DriverNumber) == false){
                return false;
            }
            if(value.VehicleNumber == '' || value.VehicleNumber == undefined){
                growl.error('Vehicle number is required.');
                return false;
            }
            else {
            }
        }
        else if (value.SkuType == 'Parcel') {
            if (value.tablePurchaseReturnShippingDetailsMasterAwb == '' || value.tablePurchaseReturnShippingDetailsMasterAwb == undefined) {
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

        if (dimensions.Weight == null || dimensions.Weight == undefined) {
            growl.error('Enter weight');
            return;
        }

        if (dimensions.LengthUnit == null || dimensions.LengthUnit == undefined) {
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
        var awbno = true;
        angular.forEach(value,function(source){
            if(source.tableSkusSkuQuantity)
            {
                quantity += source.tableSkusSkuQuantity;
                source.tablePurchaseReturnShippingDetailsShippingAwb = $scope.shipping.awbnumber;
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
        dimensions.tablePurchaseReturnSkus = tableSkus;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

        $scope.boxDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tablePurchaseReturnShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};


        console.log($scope.boxDetails);
        angular.forEach($scope.boxDetails, function (source) {
            $scope.TotalInputQuantity = $scope.sum(source.tablePurchaseReturnSkus, 'tableSkusSkuQuantity');

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
    $scope.AddPacckingDetails = function ()
    {
        $scope.disableQuickShip = true;
        var data = $scope.boxDetails;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if (data == "")
        {
            growl.error("You need to add container, Click '+ Add This Container'");
            $scope.disableQuickShip = false;
            return;
        }
        else
        {
            angular.forEach(data, function (value)
            {
                var SKUcarrierValue = null;
                var SkuDriverName = null;
                var SkuDriverNumber = null;
                var SkuVehicleNumber = null;
                var SkuVehicleType = null;

                    SalesOrderSkuID = value.SalesorderID;
                if (value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb == null || value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb == undefined)
                {
                    SKUcarrierValue = null;
                }
                else
                {
                    SKUcarrierValue = value.SKUcarrierDetails.tablePurchaseReturnShippingDetailsMasterAwb;
                }
                if (value.SKUcarrierDetails.DriverName == null || value.SKUcarrierDetails.DriverName == undefined)
                {
                    SkuDriverName = null;
                }
                else
                {
                    SkuDriverName = value.SKUcarrierDetails.DriverName;
                }
                if (value.SKUcarrierDetails.DriverNumber == null || value.SKUcarrierDetails.DriverNumber == undefined)
                {
                    SkuDriverNumber = null;
                }
                else
                {
                    SkuDriverNumber = value.SKUcarrierDetails.DriverNumber;
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

                angular.forEach(value.tablePurchaseReturnSkus, function (response)
                {
                    SKUDto = _.omit(response, 'tableSkusSkuQuantity', 'tablePurchaseReturnShippingDetailsShippingAwb', 'SalesorderID');
                    SKuQuanity = response.tableSkusSkuQuantity;
                    if(SKuQuanity && SKuQuanity != 0) {
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
                            'tablePurchaseReturnSku': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tablePurchaseReturnPackingDetails': {
                                'tablePurchaseReturnPackingDetailsLength': value.Length,
                                'tablePurchaseReturnPackingDetailsWidth': value.Breadth,
                                'tablePurchaseReturnPackingDetailsHeight': value.Height,
                                'tablePurchaseReturnPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit,
                                "tablePurchaseReturnShippingDetails": {
                                    "tablePurchaseReturnShippingDetailsMasterAwb": SKUcarrierValue,
                                    "tablePurchaseReturnShippingDetailsShippingAwb": response.tablePurchaseReturnShippingDetailsShippingAwb,
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
                url: baseUrl + '/omsservices/webapi/purchasereturn/' + SalesOrderSkuID + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                console.log(data);


                $mdDialog.hide();
                growl.success('Quick ship success');
                $scope.cancelQuickShipModal();
                $scope.listOfPurchaseReturnStatesCount($scope.defaultTab);
            }).error(function (error,status)
            {
                $scope.disableQuickShip = false;
                console.log(error);
                if(status == 400){
                    growl.error(error.errorMessage);
                }
                else {
                    growl.error("Failed to quick ship");
                }
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
        $scope.boxDetails.splice(index, 1);
    };


    $scope.shippingDetails  = {};



//    ====================================== add purchase order return dialog box ========================== /

    $scope.showAddPurchaseOrderReturnModal = function(){
        $('#addPurchaseOrderReturnModal').modal('show');
    };

    //============================= close purchase order return dialog ===================== //

    $scope.cancelSinglePurchaseOrderReturn = function(){
        if($scope.genericData.poRefKnown == true)
        {
            $('#addPurchaseOrderReturnModal').modal('hide');
        }
        if($scope.genericData.poRefKnown == false)
        {
            $('#addPurchaseOrderReturnModalRefUnknown').modal('hide');
        }
        $scope.initSingleOrderReturnData();
    };

    //============================= PurchaseOrderReturn Tab Mode ============================ //
    $scope.singlePurchaseOrderReturnTabMode = function() {
        $scope.PurchaseOrderReturnTab = true;
        $scope.bulkPurchaseOrderReturnTab = false;
    };

    //bulkOrder Tab Mode
    $scope.bulkPurchaseOrderReturnTabMode = function() {
        $scope.PurchaseOrderReturnTab = false;
        $scope.bulkPurchaseOrderReturnTab = true;
    };

    $('#addPurchaseOrderReturnModal').on('show.bs.modal' , function (e){
        $( "#ordertabs a:first"  ).tab('show');
    });

    $('#addPurchaseOrderReturnModalRefUnknown').on('show.bs.modal' , function (e){
        $( "#ordertabswithoutref a:first"  ).tab('show');
    });



    $scope.selectTableRow = function(index) {
        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }
        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" ) {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index ) {
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

    $scope.stateTrials = function(purchasereturnskus) {
        console.log(purchasereturnskus);
        console.log(purchasereturnskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        for (var i = 0; i < purchasereturnskus.length; i++) {
            console.log(i);
            console.log(purchasereturnskus[i]);
            var trials = purchasereturnskus[i].tablePurchaseReturnSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };


    //============================ vendor result object ==================================== //

    $scope.searchedProduct = function(selected) {
        if (selected != null)
        {
            $scope.searchedSku = selected.originalObject;
            $scope.getInventoryByVendorAndSKUAndWarehouse(selected);
        }
    };


    $scope.getInventoryByVendorAndSKUAndWarehouse = function(selected) {

        if(selected)
        {
            if(!$scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId)
            {
                growl.error("Select Warehouse");
                return;
            }
            if(!$scope.singleorderReturnData.tableVendor.idtableVendorId)
            {
                growl.error("Select Vendor");
                return;
            }

            var wareHousesListUrl = baseUrl + "/omsservices/webapi/inventory/warehouseinventory?skuid="+selected.originalObject.idtableSkuId
                +"&warehouseid="+$scope.singleorderReturnData.tableWarehouseDetails.idtableWarehouseDetailsId+"&vendorid="+$scope.singleorderReturnData.tableVendor.idtableVendorId;
            $http.get(wareHousesListUrl).success(function(data) {
                if(data.length > 0)
                {
                    if($scope.singleorderReturnData.tablePurchaseReturnQuantityType =="Bad")
                    {
                        $scope.availableQuantityOfSkuAndVendor = data[0].bad;
                    }
                    else
                    {
                        $scope.availableQuantityOfSkuAndVendor = data[0].available;
                    }
                }
                else
                {
                    $scope.availableQuantityOfSkuAndVendor = 0;
                }
            }).error(function(error, status)
            {
                console.log(error);
                console.log(status);

            });
        }
    }

    $scope.clearProductList = function()
    {
        $scope.availableQuantityOfSkuAndVendor = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
    }

    //============================ vendor result object ==================================== //

    $scope.searchedProductForFilter = function(selected) {
        if (selected != null && selected != undefined)
        {
            $scope.filterObj.tableSku = selected.originalObject;
        }else{
            $scope.filterObj.tableSku = undefined;
        }
    };

    $scope.searchedVendor = function(selected) {
        console.log(selected);
        if(selected!=null && selected != undefined)
        {
            $scope.filterObj.tableVendor = selected.originalObject;
        }else{
            $scope.filterObj.tableVendor = undefined;
        }
    };


//    -=============================== list of warehouse =========================== //

    $scope.listOfWareHouses = function() {
        $scope.wareHousesData = [];
        var wareHousesListUrl = baseUrl + "/omsservices/webapi/warehouses?option=towithoutfba&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function(data) {
            console.log(data);
            $scope.wareHousesData = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfWareHouses();

//    ========================================= llist of vendors ===================== //

    $scope.listOfVendors = function() {
        $scope.vendorsData = [];
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors";
        $http.get(vendorsListUrl).success(function(data)
        {
            console.log(data);
            $scope.vendorsData = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
        });
    };
    $scope.listOfVendors();

//===================================================== list of shipping owners ========================== //

    $scope.listOfShippingOwners = function(){
        $scope.shippingOwnersData = []
        var shippingOwnersUrl = baseUrl + "/omsservices/webapi/shippingowner";
        $http.get(shippingOwnersUrl).success(function(data) {
            $scope.shippingOwnersLists = data;
            for (var i = 0; i < $scope.shippingOwnersLists.length; i++) {
                $scope.shippingOwnersData.push($scope.shippingOwnersLists[i]);
            }
            console.log($scope.shippingOwnersData);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfShippingOwners();
//    ============================================ on change of vendor list =============================== //
    var producted = [];
    $scope.getVendorAddressesAndSkus = function(vendorData){
        console.log(vendorData);
        $scope.PurchaseOrderReturnData.quantityNo = "";
        $scope.PurchaseOrderReturnData.priceProd = "";
        $scope.products = [];
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        var vendor;
        if(typeof vendorData == 'string'){
            vendor = JSON.parse(vendorData);

        }else{
            vendor = vendorData;

        }
        console.log(vendor);
        $scope.vendorId = vendor.idtableVendorId;
        if($scope.vendorId > 0)
        {
            var vendorSkusUrl = baseUrl +"/omsservices/webapi/vendors/"+$scope.vendorId+"/skumap/skus";
            $http({
                method:'GET',
                url:vendorSkusUrl
            }).success(function(data,status){
                if(data.length > 0) {
                    $scope.vendorSkus = data;
                }
                else
                {
                    growl.general('The selected vendor does not have any SKUs mapped. Goto Vendors and create mapping first');
                }
                console.log(data);
            }).error(function(data){
                console.log(data);
            });
        }
        var vendorAddress = baseUrl +"/omsservices/webapi/vendors/"+$scope.vendorId+"/address";
        $http({
            method:'GET',
            url:vendorAddress
        }).success(function(data){
            console.log(data);
            $scope.deliveryAddressArray = [];
            $scope.vendoraddresses = data; // get data from json
            var giter = _.filter(data,function (value) {
                return value!==null;
            });
            console.log(giter);
            angular.forEach($scope.vendoraddresses, function(item){
                console.log(item.tableAddress);
                $scope.deliveryAddressArray.push(item.tableAddress);
            });
            //$scope.$apply();
        }).error(function(data){
            console.log(data);
        });
        console.log($scope.vendorId);
    };

//    ============================================= filter search submit action =============================== //

    $scope.getVendorAddress = function (tableVendor)
    {
        var vendorAddress = baseUrl +"/omsservices/webapi/vendors/"+tableVendor.idtableVendorId+"/address";
        $http({
            method:'GET',
            url:vendorAddress
        }).success(function(data)
        {
            console.log(data);
            $scope.deliveryAddressArray = [];
            $scope.vendoraddresses = data; // get data from json
            var giter = _.filter(data,function (value) {
                return value!==null;
            });
            console.log(giter);
            angular.forEach($scope.vendoraddresses, function(item){
                console.log(item.tableAddress);
                $scope.deliveryAddressArray.push(item.tableAddress);
            });
            //$scope.$apply();
        }).error(function(data)
        {
            console.log(data);
        });

    }
    $scope.searchPurchaseReturnOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function()
    {

        console.log($scope.filterObj);

        if ($scope.filterObj.start1Date != undefined) {
            $scope.filterObj.startDate = moment.utc($scope.filterObj.start1Date).format();


        }
        if ($scope.filterObj.end1Date != undefined) {
            $scope.filterObj.endDate = moment.utc($scope.filterObj.end1Date).format();
        }
        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1);

    }

    $scope.addProduct = function()
    {
        if (!$scope.searchedSku)
        {
            growl.error("Please search and select a product first!");
            return;
        }

        if (!$scope.genericData.returnQuantity)
        {
            growl.error("Please enter the product quantity!");
            return
        }

        if ($scope.genericData.returnQuantity < 1)
        {
            growl.error("Please enter return quantity greater than 0!");
            return;
        }
        else
        {
            for (var i = 0; i < $scope.singleorderReturnData.tablePurchaseReturnSkus.length; i++)
            {
                if ($scope.singleorderReturnData.tablePurchaseReturnSkus[i].tableSku.idtableSkuId == $scope.searchedSku.idtableSkuId)
                {
                    growl.error("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                    return;
                }
            }
            var tempObject = {
                tableSku : $scope.searchedSku,
                tablePurchaseReturnSkuQuantity: $scope.genericData.returnQuantity
            };

            $scope.singleorderReturnData.tablePurchaseReturnSkus.push(tempObject);
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.genericData.returnQuantity = "";
            $scope.searchedSku = null;
            $scope.availableQuantityOfSkuAndVendor = null;
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.singleorderReturnData.tablePurchaseReturnSkus.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        growl.success('Item deleted successfully.');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };
    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseReturnSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++)
        {
            if(allSkus[i].tablePurchaseReturnSkuInventoryMaps != null && allSkus[i].tablePurchaseReturnSkuInventoryMaps != undefined)
            {
                for (var j = 0; j < allSkus[i].tablePurchaseReturnSkuInventoryMaps.length; j++)
                {
                    var product = allSkus[i].tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                    total += product;
                }
                totalCostAmount += total * allSkus[i].tablePurchaseReturnSkuQuantity;
                totalCostAll.push(totalCostAmount);
                total = 0;
            }
        }
        return totalCostAmount;
    }


//    ============================================== api for purchase order list counts ====================== //


    $scope.listOfPurchaseReturnStatesCount = function(tabsValue, page, action)
    {

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.inProcessCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippedCount = 0;

        var allCountUrl = baseUrl + "/omsservices/webapi/purchasereturn/filtercount?state=all&uipagename="+$scope.pagename;
        var newCountUrl = baseUrl + "/omsservices/webapi/purchasereturn/filtercount?state=new&uipagename="+$scope.pagename;
        var inProcessCountUrl = baseUrl + "/omsservices/webapi/purchasereturn/filtercount?state=inprocess&uipagename="+$scope.pagename;
        var shippedCountUrl = baseUrl + "/omsservices/webapi/purchasereturn/filtercount?state=shipped&uipagename="+$scope.pagename;
        var cancelledCountUrl = baseUrl + "/omsservices/webapi/purchasereturn/filtercount?state=cancelled&uipagename="+$scope.pagename;

        if( $scope.filterObj.tableWarehouseDetails!=null)
        {
            allCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            newCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            inProcessCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            shippedCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
            cancelledCountUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku != null)
        {
            allCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            newCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            inProcessCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            shippedCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
            cancelledCountUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor != null)
        {
            allCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            newCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            inProcessCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            shippedCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
            cancelledCountUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;

        }
        if ($scope.filterObj.tablePurchaseReturnRefNo)
        {
            allCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            newCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            inProcessCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            shippedCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
            cancelledCountUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;

        }
        if ($scope.filterObj.tablePurchaseReturnSystemOrderNo)
        {
            allCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            newCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            inProcessCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            shippedCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
            cancelledCountUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;

        }
        if ($scope.filterObj.startDate)
        {
            allCountUrl += "&startDate=" + $scope.filterObj.startDate;
            newCountUrl += "&startDate=" + $scope.filterObj.startDate;
            inProcessCountUrl += "&startDate=" + $scope.filterObj.startDate;
            shippedCountUrl += "&startDate=" + $scope.filterObj.startDate;
            cancelledCountUrl += "&startDate=" + $scope.filterObj.startDate;

        }
        if ($scope.filterObj.endDate)
        {
            allCountUrl += "&endDate=" + $scope.filterObj.endDate;
            newCountUrl += "&endDate=" + $scope.filterObj.endDate;
            inProcessCountUrl += "&endDate=" + $scope.filterObj.endDate;
            shippedCountUrl += "&endDate=" + $scope.filterObj.endDate;
            cancelledCountUrl += "&endDate=" + $scope.filterObj.endDate;

        }

        $http.get(allCountUrl).success(function(data)
        {
            function setPage(page)
            {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }

                // get pager object from service
                vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                console.log(vm.pager);
                $scope.vmPager = vm.pager;
                //
                $scope.start = (vm.pager.currentPage - 1) * 5;
                $scope.orderSize = $scope.start + 5;
                console.log($scope.start);
                console.log($scope.orderSize);
                // get current page of items
                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;
                if (action == 'clearAction') {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                }
            }
            if (data != null)
            {
                $scope.allCount = data;
                if (tabsValue == 'all')
                {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.allCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        function initController() {
                            // initialize to page 1
                            vm.setPage(1);
                        }
                        initController();

                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }


                }
            }
        });

        $http.get(newCountUrl).success(function(data)
        {
            function setPage(page)
            {
                if (page < 1 || page > vm.pager.totalPages)
                {
                    return;
                }

                // get pager object from service
                vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                console.log(vm.pager);
                $scope.vmPager = vm.pager;
                //
                $scope.start = (vm.pager.currentPage - 1) * 5;
                $scope.orderSize = $scope.start + 5;
                console.log($scope.start);
                console.log($scope.orderSize);
                // get current page of items
                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;
                if (action == 'clearAction') {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                }
            }
            if (data != null)
            {
                $scope.newCount = data;
                if (tabsValue == 'new')
                {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCount); // dummy array of items to be paged
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


                }
            }
        });


        $http.get(inProcessCountUrl).success(function(data)
        {
            function setPage(page)
            {
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
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                }
            }
            //$cookies.remove('Dashdata');
            if (data != null) {
                $scope.inProcessCount = data;
                if (tabsValue == 'inprocess') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.inProcessCount); // dummy array of items to be paged
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


                }
            }
        });

        $http.get(shippedCountUrl).success(function(data) {
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
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                }
            }
            //$cookies.remove('Dashdata');
            $scope.shippedCount = data;
            if (tabsValue == 'shipped') {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.shippedCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                    initController();
                }

                if (page != undefined) {
                    vm.setPage(page);

                }


            }
        });

        $http.get(cancelledCountUrl).success(function(data) {
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
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.ListOfPurchaseReturnOrders(tabsValue, $scope.start);
                }
            }
            //$cookies.remove('Dashdata');
            if (data!=null) {
                $scope.cancelledCount = data;
                if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        function initController() {
                            // initialize to page 1
                            vm.setPage(1);
                        }
                        initController();
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }


                }
            }
        });
    };

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tablePurchaseReturnSkus.length ; j += 1){
            var ordersku = orderdata.tablePurchaseReturnSkus[j];
            if(ordersku.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 1 || ordersku.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 2){
                return false;
            }
        }
        return true;
    }

    $scope.editOrder = function(orderData,mode)
    {
        $scope.genericData.singlePurchaseOrderReturnMode = mode;
        $scope.singleorderReturnData = angular.copy(orderData);

        if($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined)
        {
            $scope.singleorderReturnData.tablePurchaseReturnPickupDate = new Date($scope.singleorderReturnData.tablePurchaseReturnPickupDate);
        }
        if($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined)
        {
            $scope.singleorderReturnData.tablePurchaseReturnDropDate = new Date($scope.singleorderReturnData.tablePurchaseReturnDropDate);
        }

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);

        if (orderData.tablePurchaseOrder == null)
        {
            $scope.genericData.poRefKnown = false;
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        else
        {
            $scope.genericData.poRefKnown = true;
            $('#addPurchaseOrderReturnModal').modal('show');
        }
    }

    $scope.getTotal = function(tableSkuData)
    {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        if(tableSkuData.tablePurchaseReturnSkuInventoryMaps != null && tableSkuData.tablePurchaseReturnSkuInventoryMaps != undefined)
        {
            for (var j = 0; j < tableSkuData.tablePurchaseReturnSkuInventoryMaps.length; j++)
            {
                var product = tableSkuData.tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                total += product;
            }
            totalCostAmount += total * tableSkuData.tablePurchaseReturnSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
    };

    //============================ get total cost per Product ================== //

    $scope.totalCostPerProduct = function(tableSkuData)
    {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        if(tableSkuData.tablePurchaseReturnSkuInventoryMaps != null && tableSkuData.tablePurchaseReturnSkuInventoryMaps != undefined)
        {
            for (var j = 0; j < tableSkuData.tablePurchaseReturnSkuInventoryMaps.length; j++)
            {
                var product = tableSkuData.tablePurchaseReturnSkuInventoryMaps[j].tableSkuInventory.tableSkuInventoryRateTotal;
                total += product;
            }
            totalCostAmount += total * tableSkuData.tablePurchaseReturnSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount/tableSkuData.tablePurchaseReturnSkuQuantity;
    }


    $scope.cancelInfoBox = function() {
        $mdDialog.hide();
    }


    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            console.log(a);
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tablePurchaseReturnSkuStateTrailDateTime);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tablePurchaseReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseReturnSkuStateType.tablePurchaseReturnSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tablePurchaseReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $mdDialog.show({
            templateUrl: 'infoDialogPurchaseReturn.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.copyOrder = function(orderData)
    {
        $scope.genericData.singlePurchaseOrderReturnMode = 'copy';
        $scope.singleorderReturnData = {};

        $scope.singleorderReturnDataCopy = angular.copy(orderData);
        $scope.singleorderReturnData = angular.copy($scope.singleorderReturnDataCopy);
        $scope.singleorderReturnData.tablePurchaseReturnSkus = [];
        $scope.singleorderReturnData.tablePurchaseReturnRemarkses = [];
        $scope.singleorderReturnData.tablePurchaseReturnRefNo = null;
        $scope.singleorderReturnData.tablePurchaseReturnSystemOrderNo = null;

        for(var skuCounter = 0 ; skuCounter < $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus.length ; skuCounter++)
        {
            $scope.singleorderReturnData.tablePurchaseReturnSkus.push(
                {
                    "tableSku" : $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus[skuCounter].tableSku,
                    "tablePurchaseReturnSkuQuantity" : $scope.singleorderReturnDataCopy.tablePurchaseReturnSkus[skuCounter].tablePurchaseReturnSkuQuantity
                }
            )
        }

        $scope.singleorderReturnData.tablePurchaseReturnPickupDate = null;
        $scope.singleorderReturnData.tablePurchaseReturnDropDate = null;

        $scope.initDateLimits();

        $scope.getVendorAddress($scope.singleorderReturnData.tableVendor);

        if (orderData.tablePurchaseOrder == null)
        {
            $scope.genericData.poRefKnown = false;
            $('#addPurchaseOrderReturnModalRefUnknown').modal('show');
        }
        else
        {
            $scope.genericData.poRefKnown = true;
            $('#addPurchaseOrderReturnModal').modal('show');
        }
    }

    //clear filter for clearing applied filters
    $scope.clearAction = function() {
        $scope.sortType = "tablePurchaseReturnSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;

        $scope.filterObj = {};
        $scope.filterObj.tableWarehouseDetails = null;
        $scope.filterObj.tablePurchaseReturnRefNo = null;
        $scope.filterObj.tablePurchaseReturnSystemOrderNo = null;
        $scope.filterObj.tableSku = null;
        $scope.filterObj.tableVendor = null;
        $scope.filterObj.start1Date = null;
        $scope.filterObj.end1Date = null;

        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsMain');
        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, 1, 'clearAction');
    }

    $scope.saveSingleOrderReturn = function()
    {
        console.log($scope.singleorderReturnData);
        $scope.checkOrderNumber($scope.singleorderReturnData.tablePurchaseReturnRefNo).then(function (retval) {
            if (retval == false) {
                if ($scope.singleorderReturnData.tableWarehouseDetails == null
                    || $scope.singleorderReturnData.tableWarehouseDetails == undefined)
                {
                    growl.error("Select warehouse!");
                    return;
                }
                if ($scope.singleorderReturnData.tableVendor == null
                    || $scope.singleorderReturnData.tableVendor == undefined)
                {
                    growl.error("Select vendor!");
                    return;
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnQuantityType == null
                    || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == undefined
                    || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == '')
                {
                    growl.error("Select quantity type!");
                    return;
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnSkus.length < 1)
                {
                    growl.error("Please add at least one product!");
                    return;
                }
                if ($scope.singleorderReturnData.tableShippingOwnership == null || $scope.singleorderReturnData.tableShippingOwnership == undefined)
                {
                    growl.error("Select shipping ownership!");
                    return;
                }
                $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);

                //if warehouse is glaucus and shipping owner is sender
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableAddress == null || $scope.singleorderReturnData.tableAddress == undefined) {
                        growl.error("Please choose a drop address!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is receiver
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 2)
                {
                    if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate == null || $scope.singleorderReturnData.tablePurchaseReturnPickupDate == undefined)
                    {
                        growl.error("Please choose a pick up date!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is sender
                if($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tablePurchaseReturnDropDate == null || $scope.singleorderReturnData.tablePurchaseReturnDropDate == undefined)
                    {
                        growl.error("Please choose a drop date!");
                        return;
                    }
                }

                if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != "" && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined)
                {
                    $scope.singleorderReturnDataCopy.tablePurchaseReturnPickupDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnPickupDate).format();
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != "" && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined)
                {
                    $scope.singleorderReturnDataCopy.tablePurchaseReturnDropDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnDropDate).format();
                }


                console.log($scope.singleorderReturnDataCopy);
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/purchasereturn',
                    data: $scope.singleorderReturnDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res)
                {
                    console.log(res);
                    if (res)
                    {
                        if ($scope.genericData.singlePurchaseOrderReturnMode == "add") {
                            growl.success("Order added successfully");
                        }
                        else if ($scope.genericData.singlePurchaseOrderReturnMode == "copy") {
                            growl.success("Order copied successfully");
                        }
                        $scope.cancelSinglePurchaseOrderReturn();
                        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);

                    }
                }).error(function(error, status) {
                    if(status == 400)
                    {
                        growl.error(error.errorMessage ? error.errorMessage : "Failed to add purchase return");
                    }
                    else
                    {
                        growl.error("Failed to add purchase return.");
                    }
                });

            }
            else
            {
                $scope.singleorderReturnData.tablePurchaseReturnRefNo = "";
            }
        })

    };

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
	{
        var checkOrderNo = baseUrl + "/omsservices/webapi/purchasereturn/clientordernumber?clientordernumber=" + orderNo;
        if(systemOrderNo != null )
        {
            checkOrderNo +="&systemordernumber=" + systemOrderNo;
        }
        $http.get(checkOrderNo).success(function(data)
        {
            if (data == true)
            {
                growl.error("Order ref. no. already exists");
                q.resolve(true);
            }
            if (data == false)
            {
                q.resolve(false);
            }
        });
        }
        return q.promise;
    }

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
        $scope.listOfPurchaseReturnStatesCount(defaultTab, page);
    }

    $scope.listOfPurchaseReturnStatesCount($scope.defaultTab,1);

    //============================================= list of purchase return order ======================================= //
    //  ===== have to use this for listing data ========= //
    $scope.ListOfPurchaseReturnOrders = function(tabsValue, start, action)
    {
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
            $scope.reEdit = false;
        }
        else
        {
            $scope.DeleteAndConfimData = false;
            $scope.reEdit = true;
        }

        if (tabsValue == 'all')
        {
            $scope.tabsColor1 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
            $scope.tabsColor8 = {}
        }

        if (tabsValue == 'new')
        {
            $scope.tabsColor2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor1 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
            $scope.tabsColor8 = {}
        }
        if (tabsValue == 'shipped')
        {
            $scope.tabsColor4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor2 = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
            $scope.tabsColor8 = {}
        }

        if (tabsValue == 'inprocess')
        {
            $scope.tabsColor3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
            $scope.tabsColor8 = {}
        }
        if (tabsValue == 'cancelled')
        {
            $scope.tabsColor5 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor6 = {}
            $scope.tabsColor7 = {}
            $scope.tabsColor8 = {}
        }

        $scope.defaultTab = tabsValue;

        var PurchaseOrderReturnListUrl = baseUrl + "/omsservices/webapi/purchasereturn";

        if ($scope.defaultTab == 'all')
            PurchaseOrderReturnListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            PurchaseOrderReturnListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        PurchaseOrderReturnListUrl += "&uipagename="+$scope.pagename;

        if ($scope.filterObj.tableWarehouseDetails != null) {
            PurchaseOrderReturnListUrl += "&warehouseid=" + $scope.filterObj.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.tableSku != null)
        {
            PurchaseOrderReturnListUrl += "&skuid=" + $scope.filterObj.tableSku.idtableSkuId;
        }
        if ($scope.filterObj.tableVendor != null) {
            PurchaseOrderReturnListUrl += "&vendorid=" + $scope.filterObj.tableVendor.idtableVendorId;
        }
        if ($scope.filterObj.tablePurchaseReturnRefNo) {
            PurchaseOrderReturnListUrl += "&prid=" + $scope.filterObj.tablePurchaseReturnRefNo;
        }

        if ($scope.filterObj.startDate) {
            PurchaseOrderReturnListUrl += "&startDate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            PurchaseOrderReturnListUrl += "&endDate=" + $scope.filterObj.endDate;
        }
        if ($scope.filterObj.tablePurchaseReturnSystemOrderNo) {
            PurchaseOrderReturnListUrl += "&systemorderno=" + $scope.filterObj.tablePurchaseReturnSystemOrderNo;
        }
        $http.get(PurchaseOrderReturnListUrl).success(function(data)
        {
            console.log(data);
            $scope.PurchaseOrderReturnDataLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.PurchaseOrderReturnDataLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status)
        {
            console.log(status);

        });
    }
	
	$scope.showCommonMasterSkuDialog = function (check)
    {
        var selectedVendor = null;
        if(check == true)
        {
            if ($scope.singleorderReturnData.tableVendor == null)
            {
                growl.error("Please select vendor first.");
                return;
            }
            else
            {
                selectedVendor = $scope.singleorderReturnData.tableVendor;
            }
        }

        if(check == false)
        {
            if($scope.filterObj.tableVendor == null)
            {

            }
            else
            {
                selectedVendor = $scope.filterObj.tableVendor;
            }
        }

        if(selectedVendor!=null) {
            mastersService.fetchVendorSkus(baseUrl, selectedVendor.idtableVendorId).then(function (data) {
                $scope.genericData.skusListFiltered = data;

                $timeout(function () {
                    $("#dialogmastersku").modal('show');
                }, 500);

            });
        }
        else
        {
            mastersService.fetchSkus(baseUrl).then(function (data)
            {
                $scope.genericData.skusListFiltered = data;

                $timeout(function ()
                {
                    $("#dialogmastersku").modal('show');
                }, 500);

            });
        }

        $scope.genericData.check = check;


    }

    $scope.selectSku = function(id){

        $http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            $scope.filterObj.tableSku = data;

            $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
        }).error(function(error, status) {
            console.log(error);

        });

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

        $scope.cancelmastersDialog();
    }
	
	$scope.masterVendorDialog = function(ev){		
		
		mastersService.fetchVendors(baseUrl).then(function(data){
			$scope.genericData.vendorsListFiltered = data;
		})

        $timeout(function () {
            $("#dialogmastervendor").modal('show');
        }, 500);
		
	}
	
	$scope.cancelmastersDialog = function(){
        $("#dialogmastersku").modal('hide');
        $("#dialogmastervendor").modal('hide');
	}
	

	
	$scope.selectVendor = function(id){
		
		 $http.get(baseUrl + '/omsservices/webapi/vendors/'+id).success(function(data) {
         console.log(data);
		 $scope.filterObj.tableVendor = data;
		 $scope.$broadcast("angucomplete-alt:changeInput", "vendorsMain", data);
        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog();
    }

    $scope.orderLevelActionRow = function (orderSkus) {

        var shippingLabelButn = $scope.getShippingLabelButton(orderSkus);
        if (shippingLabelButn == true) {
            return true;
        } else {
            return false;
        }

    };

    $scope.getShippingLabelButton = function (orderSkus) {
        var b = false;
        angular.forEach(orderSkus, function (resp) {
            if (b == false && (resp.tablePurchaseReturnSkuStateType.idtablePurchaseReturnSkuStateTypeId == 1)) {
                b = true;
            }
        });
        return b;
    };

    $scope.updateSingleOrderReturn = function()
    {
        $scope.checkOrderNumber($scope.singleorderReturnData.tablePurchaseReturnRefNo,$scope.singleorderReturnData.tablePurchaseReturnSystemOrderNo).then(function (retval) {
            if (retval == false) {
                if ($scope.singleorderReturnData.tableWarehouseDetails == null
                    || $scope.singleorderReturnData.tableWarehouseDetails == undefined) {
                    growl.error("Select warehouse!");
                    return;
                }
                if ($scope.singleorderReturnData.tableVendor == null
                    || $scope.singleorderReturnData.tableVendor == undefined) {
                    growl.error("Select vendor!");
                    return;
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnQuantityType == null
                    || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == undefined
                    || $scope.singleorderReturnData.tablePurchaseReturnQuantityType == '') {
                    growl.error("Select quantity type!");
                    return;
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnSkus.length < 1) {
                    growl.error("Please add at least one product!");
                    return;
                }
                if ($scope.singleorderReturnData.tableShippingOwnership == null || $scope.singleorderReturnData.tableShippingOwnership == undefined) {
                    growl.error("Select shipping ownership!");
                    return;
                }
                $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);

                //if warehouse is glaucus and shipping owner is sender
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tableAddress == null || $scope.singleorderReturnData.tableAddress == undefined) {
                        growl.error("Please choose a drop address!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is receiver
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 2) {
                    if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate == null || $scope.singleorderReturnData.tablePurchaseReturnPickupDate == undefined) {
                        growl.error("Please choose a pick up date!");
                        return;
                    }
                }
                //if warehouse is glaucus and shipping owner is sender
                if ($scope.singleorderReturnData.tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId == 1 && $scope.singleorderReturnData.tableShippingOwnership.idtableShippingOwnershipId == 1) //if shipping owner is glaucus
                {
                    if ($scope.singleorderReturnData.tablePurchaseReturnDropDate == null || $scope.singleorderReturnData.tablePurchaseReturnDropDate == undefined) {
                        growl.error("Please choose a drop date!");
                        return;
                    }
                }

                if ($scope.singleorderReturnData.tablePurchaseReturnPickupDate != null && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != "" && $scope.singleorderReturnData.tablePurchaseReturnPickupDate != undefined) {
                    $scope.singleorderReturnDataCopy.tablePurchaseReturnPickupDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnPickupDate).format();
                }
                if ($scope.singleorderReturnData.tablePurchaseReturnDropDate != null && $scope.singleorderReturnData.tablePurchaseReturnDropDate != "" && $scope.singleorderReturnData.tablePurchaseReturnDropDate != undefined) {
                    $scope.singleorderReturnDataCopy.tablePurchaseReturnDropDate = moment.utc($scope.singleorderReturnData.tablePurchaseReturnDropDate).format();
                }


                console.log($scope.singleorderReturnDataCopy);
                $http({
                    method: 'PUT',
                    url: baseUrl + '/omsservices/webapi/purchasereturn/' + $scope.singleorderReturnData.idtablePurchaseReturnId,
                    data: $scope.singleorderReturnDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {
                        if ($scope.genericData.singlePurchaseOrderReturnMode == "edit") {
                            growl.success("Order updated successfully");
                        }
                        else if ($scope.genericData.singlePurchaseOrderReturnMode == "copy") {
                            growl.success("Order copied successfully");
                        }
                        $scope.cancelSinglePurchaseOrderReturn();
                        $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);

                    }
                }).error(function (error, status) {
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("Failed to add purchase return.");
                    }
                });
            }
        })

    };

    $scope.downloadPurchaseReturnTemplateWithID = function () {

        if ($scope.genericData.poRefKnown == true) {

            var tempDownloadPurchaseReturnTemplateUrl = $scope.bulkPurchaseReturnWithIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadPurchaseReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
        if ($scope.genericData.poRefKnown == false) {

            var tempDownloadSaleReturnTemplateUrl = $scope.bulkPurchaseReturnWithoutIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
    };
    $scope.cancelBulkUpload = function(){
        $scope.fileName = null;
        $scope.progressOfUpload = null;
        $('#addPurchaseOrderReturnModalRefUnknown').modal('hide');
        $('#addPurchaseOrderReturnModal').modal('hide');

    }
    $scope.uploadBulkPurchaseReturnFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        console.log(bulkOrderUploadfile);
        var file = bulkOrderUploadfile;
        if(file){
            $scope.fileName = file.name;
        }
    };

    $scope.uploadPurchaseReturnBulkUpload = function () {
        var uploadUrl;
        if($scope.genericData.saleRefKnown)
        {
            uploadUrl = baseUrl + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithsaleorder';

        }
        else{
            uploadUrl = baseUrl + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithoutpurchaseorder';
        }
        console.log($scope.genericData.bulkOrderUploadfile);
        file = $scope.genericData.bulkOrderUploadfile;
        if (file) {
            if (!file.$error)
            {

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
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    $cookies.put('BulkUploadData','purchasereturnwithid');
                    $cookies.put('ActiveTab','Purchase Return With ID');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    $scope.listOfPurchaseReturnStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.cancelBulkUpload();
                    //$('#addOrderModal').modal('hide');

                }, function(resp) {
                    $scope.cancelBulkUpload();
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                    $scope.progressOfUpload = parseInt(100.0 * evt.loaded / evt.total) + '%';
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
        else{
            growl.error('Please upload the file');
        }
    }

    $scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tablePurchaseReturnSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

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

}
