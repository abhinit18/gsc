/**
 * Created by angularpc on 03-03-2017.
 */
myApp.controller('salereturnController', salereturnController);

salereturnController.$inject = ['$rootScope','$scope', '$http', '$location', '$filter', 'baseUrl','commonPathUrl', '$mdDialog', '$mdMedia','$sce', 'growl', '$window', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies','$timeout','$controller' , 'mastersService'];

function salereturnController($rootScope,$scope, $http, $location, $filter , baseUrl,commonPathUrl, $mdDialog, $mdMedia,$sce, growl, $window, Upload, PagerService, $q,  $routeParams, $cookies,$timeout,$controller, mastersService) {

    // Initialize the super class and extend it.

    $scope.addDeliveryClicked = false;
    $scope.genericData = {};
    $scope.claimObj = {};
    $scope.genericData.saleOrderRefNo = "";
    $scope.saleReturnFormData = {};
    $scope.singleorderReturnData = {};
    $scope.endminDateDelivery = new Date();
    $scope.cancelInfoBox = function() {
        $mdDialog.hide();
    };
    $scope.cancelSingleOrdersReturnDialog = function(){
        $mdDialog.hide();
    };

    $scope.downloadSaleReturnTemplate = function () {

        if($scope.genericData.saleRefKnown == true) {

            var tempDownloadSaleReturnTemplateUrl = $scope.downloadSaleReturnTemplateUrl + 'templateforreturnuploadwithsaleorder';

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data)
            {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
        if($scope.genericData.saleRefKnown == false) {

            var tempDownloadSaleReturnTemplateUrl = $scope.downloadSaleReturnTemplateUrl + 'templateforreturnuploadwithoutsaleorder';

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data)
            {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
    };

    $scope.uploadBulkOrderReturnFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;

    };

    $scope.uploadSaleReturnBulkUpload = function (){
        var uploadUrl;
        if($scope.genericData.saleRefKnown == true)
        {
            uploadUrl = baseUrl + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithsaleorder';

        }
        if($scope.genericData.saleRefKnown == false) {
            uploadUrl = baseUrl + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithoutsaleorder';
        }
        console.log($scope.genericData.bulkOrderUploadfile);
        file = $scope.genericData.bulkOrderUploadfile;
        if (file) {
            if (!file.$error)
            {

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
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    $cookies.put('BulkUploadData','salereturn');
                    $cookies.put('ActiveTab','Salereturn');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.cancelBulkUpload();
                    $('#addOrderModal').modal('hide');

                }, function(resp) {
                    $scope.cancelBulkUpload();
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');
        
        
    }
    $scope.cancelBulkUpload = function(){
        $scope.fileName = null;
        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');

    };

    $scope.initSingleOrderReturnData = function ()
    {
        $scope.genericData = {};
        $scope.genericData.saleOrderRefNo = "";
        $scope.singleorderReturnData = {};
        $scope.singleorderReturnData.tableSaleReturnSkus = [];
        $scope.singleorderReturnData.tableShippingOwnership = {};
        $scope.singleorderReturnData.tableCustomer = {};
        $scope.singleorderReturnData.tableSalesChannelValueInfo = null;
        $scope.singleorderReturnData.tableSaleReturnScRefNo = "";
        $scope.singleorderReturnData.tableSaleReturnRemarks = "";
        $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
        $scope.singleorderReturnData.tableSaleReturnDropDateTime = "";
        $scope.singleorderReturnData.tableSaleReturnPickUpDateTime = "";
    }

    $scope.getSaleOrderInfo = function () {
        var saleOrderUrl = baseUrl+'/omsservices/webapi/orders/systemorderno?systemorderno=' + $scope.genericData.saleOrderRefNo;
        $http({
            method: 'GET',
            url: saleOrderUrl
        }).success(function(response)
        {
            if(response == "" || response == null){
                growl.error("No Order found");
            }
            else
            {
                //Check if the order contains at least one item that is in shipped state
                var shippedfound = false;
                for(var skuindex=0; skuindex < response.tableSaleOrderSkuses.length;skuindex++)
                {
                    if(response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 17
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 18
                        || response.tableSaleOrderSkuses[skuindex].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 19)
                    {
                        shippedfound = true;
                    }
                }
                if(shippedfound == false)
                {
                    growl.error("There are no items in this order that are in shipped state");
                    return;
                }
                $scope.populateReturnOrderFromSaleOrder(response);
            }

        }).error(function(status, error)
        {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to get order");
            }
        });
    }

    $scope.hideeditbutton = function(orderdata){
        for(var j=0; j< orderdata.tableSaleReturnSkus.length ; j += 1){
            var ordersku = orderdata.tableSaleReturnSkus[j];
            if(ordersku.tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId == 1 || ordersku.tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId == 2){
                return false;
            }
        }
        return true;
    }



    $scope.populateReturnOrderFromSaleOrder = function (response)
    {
        //populate data here
        $scope.genericData.saleOrderSkus = response.tableSaleOrderSkuses;
        $scope.genericData.foundReturnable = false;
        $scope.singleorderReturnData.tableAddress = response.tableAddressByTableSaleOrderShipToAddressId;
        $scope.singleorderReturnData.tableCustomer = response.tableCustomer ;
        $scope.singleorderReturnData.tableSaleOrder = response ;
        $scope.singleorderReturnData.tableSalesChannelValueInfo = response.tableSalesChannelValueInfo ;
        $scope.singleorderReturnData.tableSaleReturnSkus = [];

        $scope.genericData.returnedQuantity = [];

        var getReturnedSkus = baseUrl + '/omsservices/webapi/salereturnsku?orderid=' + $scope.genericData.saleOrderRefNo;
        $http({
            method: 'GET',
            url: getReturnedSkus
        }).success(function(tableSaleReturnSkus)
        {

            var returnedQuantity = 0;
            for(var orderSkuCounter = 0; orderSkuCounter < response.tableSaleOrderSkuses.length ; orderSkuCounter++)
            {


                var shipped = false;
                if(response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 16
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 17
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 18
                    || response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 19)
                {
                    shipped = true;
                }

                if(shipped == true)
                {
                    //check if there is already some return quantity
                    if (tableSaleReturnSkus && tableSaleReturnSkus.length>0)
                    {
                        for(var returnindex = 0; returnindex < tableSaleReturnSkus.length; returnindex++)
                        {
                            if(tableSaleReturnSkus[returnindex].tableSku.idtableSkuId == response.tableSaleOrderSkuses[orderSkuCounter].tableSku.idtableSkuId)
                            {
                                returnedQuantity = tableSaleReturnSkus[returnindex].tableSaleReturnSkuQuantity;
                            }
                        }
                    }

                    $scope.genericData.returnedQuantity.push(returnedQuantity);
                    $scope.singleorderReturnData.tableSaleReturnSkus.push(
                        {
                            "tableSku": response.tableSaleOrderSkuses[orderSkuCounter].tableSku,
                            "tableSaleReturnSkuQuantity": response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkusSkuQuantity - returnedQuantity
                        }
                    )

                    if(response.tableSaleOrderSkuses[orderSkuCounter].tableSaleOrderSkusSkuQuantity - returnedQuantity > 0 && $scope.singleOrderReturnMode != "edit")
                    {
                        $scope.genericData.foundReturnable = true;
                    }
                    if($scope.singleOrderReturnMode == "edit")
                    {
                        $scope.genericData.foundReturnable = true;
                    }
                }
            }

            if($scope.genericData.foundReturnable == false && $scope.singleOrderReturnMode != "edit")
            {
                growl.error('There is no quantity left in this order that can be returned. Provide another reference');
                $scope.initSingleOrderReturnData();
            }

        }).error(function(error, status)
        {

        });



    }

    $scope.initSingleOrderReturnData();

    $scope.bulkOrderSettingData = "";
    $scope.defaultTab = "all";
    $scope.warehouseError = {};
    $scope.notApplicableCounter = 1;

    $scope.filter = {};
    $scope.filter.start1Date = null;
    $scope.filter.end1Date = null;

    $scope.start = 0;
    $scope.orderSize = 5;
    var currentUrl,UrlName;
    currentUrl = window.location.href;
    UrlName = currentUrl.search('salereturn');
    console.log(UrlName);
    if(UrlName == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }

    $scope.products = [];

    $scope.orderLevelAction = {};
    $scope.array = [];
    $scope.singleOrderReturnTab = true;
    $scope.singleOrderReturnMode = "add";
    $scope.bulkOrderReturnTab = false;
    $scope.incrVar = false;
    $scope.decrVar = false;
    $scope.arrayHeaderList = [];
    $scope.arrayList = [];
    $scope.myList = [];
    $scope.bulkUploadOrderFielsClicked = false;
    $scope.bulkUploadMapElemClicked = false;
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/customers/search?search=';
    $scope.downloadSaleReturnTemplateUrl = baseUrl + '/omsservices/webapi/salereturn/';
    $scope.baseSchedulePickUpUrl = baseUrl + "/omsservices/webapi/orders/schedulepickup";

    $scope.sortType = "tableSaleReturnSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.bulkSelectChannel = false;
    $scope.bulkSelectFile = false;

    $scope.otherReasonNotFiled = false;
    $scope.reasonData = null ;

    //Start Date and End Date Validations Starts Here

    $scope.endmaxDate = new Date();

    $scope.startmaxDate = new Date();

    $scope.sendStartDate = function()
    {
        $scope.startDateData = new Date($scope.filter.start1Date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function(date)
    {
        $scope.endDateData = new Date($scope.filter.end1Date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
        if(date){
            $scope.endminDateDelivery = new Date(date);
        }

    }

    $scope.clearStartDate = function()
    {
        $scope.filter.startDate = null;
        $scope.filter.start1Date = null;
        if($scope.filter.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate();
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.filter.endDate = null;
        $scope.filter.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.filter.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate();
        }
    }

    $scope.openCustomerMode = function($event)
    {
        $('#addOrderModal').modal('hide');
        $scope.orderTotalMode = "new";
        $scope.addCustomer($event);
    };

    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = baseUrl + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename
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

    $scope.listOfChannels();


    if($cookies.get('orderid') != null){
        $scope.filter.orderid = $cookies.get('orderid');
        $cookies.remove('orderid')
    }

    //Start Date and End Date Validations Starts Here for Individual Work Orders
    $scope.callMinStartMaxStartDelivery = function() {
        $scope.todayDateDelivery = new Date();
        $scope.startminDateDelivery = new Date(
            $scope.todayDateDelivery.getFullYear(),
            $scope.todayDateDelivery.getMonth(),
            $scope.todayDateDelivery.getDate());
    };
    $scope.callMinStartMaxStartDelivery();

    $scope.validateEmail = function(emailCase) {
        if (emailCase == false) {
            growl.error("Please Enter Valid Email Id");
            document.myForm.custEmail.focus();
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

    $scope.listOfVendors = function() {
        $scope.vendorsData = [];
        var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors";
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
    }
    $scope.listOfVendors();
    //============================================= GRN for sale return order ============================= //
    $scope.SkuDetails = {};
    $scope.SaleReturnGrnInventory = {};
    $scope.showSaleReturnGRNDialog = function(ev,file,soData)
    {
        $scope.disableSubmitGrn = false;
        $scope.SaleReturnGrnInventory = {};
        console.log(file);
        console.log(soData);
        $mdDialog.show({
            templateUrl: 'SaleReturnGRNdata.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

        $scope.SkuDetails.GRnData = file;
        $scope.SkuDisabled = true;
        $scope.SkuDetails.ProductModel = file.tableSku.tableSkuDescription;
        $scope.SkuDetails.skuClientCode = file.tableSku.tableSkuClientSkuCode;
        $scope.SaleReturnGrnInventory.tableSku = file.tableSku;
        $scope.SaleReturnGrnInventory.tableWarehouseDetails = soData.tableWarehouseDetails;
        //if(soData.tableVendor.tableVendorName != null){
        //    $scope.SaleReturnGrnInventory.tableVendor = soData.tableVendor;
        //}
        $scope.SaleReturnGrnInventory.tableSkuInventoryExpectedInwardCount = file.tableSaleReturnSkuQuantity;
        //console.log(file.tablePurchaseOrderSkusSkuQuantity);

        console.log($scope.SaleReturnGrnInventory);

    };

    $scope.checkMspGrtMrp = function(mrp, msp) {
        if (msp > mrp) {
            growl.error("MSP Must Be Less than MRP")
            $scope.SaleReturnGrnInventory.tableSkuInventoryMinSalePrice = null;
        }
    };

    $scope.calcQCFailed = function () {

        if($scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == undefined)
        {
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == undefined)
        {
            return;
        }

        $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount - $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount ;
        if($scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount < 0 ) {
            growl.error('QC Passed quantity cannot be greater than received quantity');
            $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount = null;
            $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = null;
        }
    }

    $scope.SubmitGrn = function()
    {
        $scope.disableSubmitGrn = true;

        if($scope.SaleReturnGrnInventory.tableSkuInventoryMaxRetailPrice == null || $scope.SaleReturnGrnInventory.tableSkuInventoryMaxRetailPrice == undefined)
        {
            growl.error('MRP is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount == undefined)
        {
            growl.error('Actual quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == null || $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount == undefined)
        {
            growl.error('QC Passed quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }
        if($scope.SaleReturnGrnInventory.tableWarehouseDetails == null || $scope.SaleReturnGrnInventory.tableWarehouseDetails == undefined)
        {
            growl.error('Warehouse is required');
            $scope.disableSubmitGrn = false;
            return;
        }
        else
        {
            if($scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount > $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount )
            {
                growl.error('QC Passed quantity cannot be greater than actual received quantity');
                $scope.disableSubmitGrn = false;
                return;
            }
            else
            {
                $scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount = $scope.SaleReturnGrnInventory.tableSkuInventoryActualInwardCount - $scope.SaleReturnGrnInventory.tableSkuInventoryAvailableCount;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 1)
        {
            if($scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate == null || $scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate == undefined)
            {
                growl.error('Manufacturing date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
            if($scope.SaleReturnGrnInventory.tableSkuInventoryShelfLifeInDays == null || $scope.SaleReturnGrnInventory.tableSkuInventoryShelfLifeInDays == undefined)
            {
                growl.error('Shelf life is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 2) {
            if ($scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate == null || $scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate == undefined) {
                growl.error('Expiry date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        $scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate = moment($scope.SaleReturnGrnInventory.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
        $scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate = moment($scope.SaleReturnGrnInventory.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");
        console.log($scope.SaleReturnGrnInventory);

        var Postdata = $scope.SaleReturnGrnInventory;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/salereturnsku/'+$scope.SkuDetails.GRnData.idtableSaleReturnSkuId+'/quickgrn',
            data: Postdata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            console.log(data);
            if($scope.SaleReturnGrnInventory.tableSkuInventoryInwardQcFailedCount > 0){
                $mdDialog.show({
                    templateUrl: 'ConfirmClaimGrnDialog.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    scope: $scope.$new()
                });
            }else{
                $mdDialog.hide();
                growl.success('GRN successful');
                $scope.SaleReturnGrnInventory ={};
                $scope.listOfStatesCount($scope.defaultTab);

                for (var i = 0; i < $scope.orderLists.length; i += 1) {
                    $scope.dayDataCollapse[i] = false;
                }
            }
        }).error(function(data){
            $scope.disableSubmitGrn = false;
            console.log(data);
        });
    };

    $scope.showRaiseClaimDialog = function (tableSaleReturnSku , mode)
    {
        $scope.claimObj = {};
        $scope.genericData.skuForClaim = tableSaleReturnSku;
        $scope.genericData.claimMode = mode;
        $scope.SkuDetails.GRnData = {};
        $scope.SkuDetails.GRnData   = tableSaleReturnSku;
        $scope.SaleReturnGrnInventory = tableSaleReturnSku.tableSkuInventory;
        if(mode == 'edit')
        {
            $scope.claimObj = tableSaleReturnSku.tableSaleReturnClaims[0];
        }

        $mdDialog.show({
            templateUrl: 'ClaimGrnDataDialog.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }


    //========================== claim for bad quantity grn ======================================== //

    $scope.ClaimConformationAction = function(confirmationValue)
    {

        if(confirmationValue == true)
        {
            $scope.genericData.claimMode = 'add';
            $mdDialog.show({
                templateUrl: 'ClaimGrnDataDialog.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }
        else
        {
            $mdDialog.hide();
        }
    };

    //================================================= ends here =========================================== //

    $scope.cancelSingleOrdersReturnClaimDialog = function(){
        $mdDialog.hide();
        $scope.claimObj = {};
    };

    $scope.ViewDownloadBtn = 'success';
    $scope.downloadLink = function(value) {
        console.log(value);
        $scope.ViewDownloadBtn = value;
    };


    $scope.ClaimSku = function(skuDetails,skuInventory,ClaimEntity)
    {
        var claimSkuUrl,Postdata,method;

        Postdata = $scope.claimObj;
        if($scope.genericData.claimMode == 'add')
        {
            claimSkuUrl = baseUrl+"/omsservices/webapi/salereturnsku/" + skuDetails.idtableSaleReturnSkuId + "/salereturnclaim?claimfrom=" + ClaimEntity;
            $http({
                method: 'POST',
                url: claimSkuUrl,
                data: Postdata,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data)
            {
                growl.success('Claim raised successfully');
                $mdDialog.hide();
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function(error, status)
            {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error('Failed to raise claim');
                }
            });
        }
        if($scope.genericData.claimMode == 'edit')
        {
            claimSkuUrl = baseUrl+"/omsservices/webapi/salereturnsku/" + skuDetails.idtableSaleReturnSkuId + "/salereturnclaim/" + $scope.claimObj.idtableSaleReturnClaimId + "?claimfrom="+ClaimEntity;
            $http({
                method: 'PUT',
                url: claimSkuUrl,
                data: Postdata,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data)
            {
                growl.success('Claim updated successfully');
                $mdDialog.hide();
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function(error, status)
            {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error('Failed to update claim');
                }
            });
        }

    };


    // fetching count details of states of different orders.
    $scope.listOfStatesCount = function(tabsValue, page, action) {
        console.log(tabsValue);
        console.log(page);
        console.log($scope.filter);

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;

        var newCountUrl = baseUrl + "/omsservices/webapi/salereturn/filtercount?state=new&uipagename="+$scope.pagename;
        var qcCountUrl = baseUrl + "/omsservices/webapi/salereturn/filtercount?state=qccomplete&uipagename="+$scope.pagename;
        var grnCountUrl = baseUrl + "/omsservices/webapi/salereturn/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = baseUrl + "/omsservices/webapi/salereturn/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var allCountUrl = baseUrl + "/omsservices/webapi/salereturn/filtercount?uipagename="+$scope.pagename;

        if (!$scope.filter.saleChannel)
        {
            newCountUrl += "&saleschannelid=0";
            qcCountUrl += "&saleschannelid=0";
            grnCountUrl += "&saleschannelid=0";
            cancelledCountUrl += "&saleschannelid=0";
            allCountUrl += "saleschannelid=0";
        }
        else
        {
            var salechannelqueryparam = "&salesChannel=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
            newCountUrl += salechannelqueryparam;
            qcCountUrl += salechannelqueryparam;
            grnCountUrl += salechannelqueryparam;
            cancelledCountUrl += salechannelqueryparam;
            allCountUrl += salechannelqueryparam;

        }
        if ($scope.filter.skuId)
        {
            var skuqueryparam = "&skuid=" + $scope.filter.skuId;
            newCountUrl += skuqueryparam;
            qcCountUrl += skuqueryparam;
            grnCountUrl += skuqueryparam;
            cancelledCountUrl += skuqueryparam;
            allCountUrl += skuqueryparam;

        }
        if ($scope.filter.customerid)
        {
            var customerqueryparam = "&customerid=" + $scope.filter.customerid;
            newCountUrl += customerqueryparam;
            qcCountUrl += customerqueryparam;
            grnCountUrl += customerqueryparam;
            cancelledCountUrl += customerqueryparam;
            allCountUrl += customerqueryparam;

        }
        if ($scope.filter.startDate)
        {
            var startdatequeryparam = "&startDate=" + $scope.filter.startDate;
            newCountUrl += startdatequeryparam;
            qcCountUrl += startdatequeryparam;
            grnCountUrl += startdatequeryparam;
            cancelledCountUrl += startdatequeryparam;
            allCountUrl += startdatequeryparam;

        }
        if ($scope.filter.endDate)
        {
            var enddatequeryparam = "&endDate=" + $scope.filter.endDate;
            newCountUrl += enddatequeryparam;
            qcCountUrl += enddatequeryparam;
            grnCountUrl += enddatequeryparam;
            cancelledCountUrl += enddatequeryparam;
            allCountUrl += enddatequeryparam;

        }
        if ($scope.filter.orderref)
        {
            var orderidqueryparam = "&orderref=" + $scope.filter.orderref;
            newCountUrl += orderidqueryparam;
            qcCountUrl += orderidqueryparam;
            grnCountUrl += orderidqueryparam;
            cancelledCountUrl += orderidqueryparam;
            allCountUrl += orderidqueryparam;

        }

        if ($scope.filter.orderid)
        {
            var orderidqueryparam = "&orderid=" + $scope.filter.orderid;
            newCountUrl += orderidqueryparam;
            qcCountUrl += orderidqueryparam;
            grnCountUrl += orderidqueryparam;
            cancelledCountUrl += orderidqueryparam;
            allCountUrl += orderidqueryparam;

        }

        console.log(newCountUrl);
        console.log(qcCountUrl);
        console.log(grnCountUrl);
        console.log(cancelledCountUrl);
        console.log(allCountUrl);

        $http.get(allCountUrl).success(function(data)
        {
            if (data != null)
            {
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

                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;

                        if (action == 'clearAction') {
                            $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrderReturn(tabsValue, $scope.start);
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
                            $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrderReturn(tabsValue, $scope.start);
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


        $http.get(qcCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.QCCount = data;
                if (tabsValue == 'qccomplete') {
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
                            $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrderReturn(tabsValue, $scope.start);
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


        $http.get(grnCountUrl).success(function(data) {
            $cookies.remove('Dashdata');
            if (data != null) {
                $scope.grnCount = data;
                if (tabsValue == 'grn') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.grnCount); // dummy array of items to be paged
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
                            $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrderReturn(tabsValue, $scope.start);
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
                            $scope.listOfOrderReturn(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrderReturn(tabsValue, $scope.start);
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

    };


    // getting all list of orders (all the orders)
    $scope.listOfOrderReturn = function(tabsValue, start, action) {
        console.log(tabsValue);
        console.log(start);
        console.log($scope.filter);
        if (tabsValue == 'all')
        {
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
            $scope.tabsColor = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }
        if (tabsValue == 'qccomplete') {
            $scope.tabsColor2 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }

        if (tabsValue == 'grn') {
            $scope.tabsColor3 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }
        if (tabsValue == 'cancelled') {
            $scope.tabsColor4 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }


        $scope.defaultTab = tabsValue;

        var orderListUrl = baseUrl + "/omsservices/webapi/salereturn?uipagename="+$scope.pagename;

        if ($scope.defaultTab == 'all')
            orderListUrl += "&start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            orderListUrl += "&start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        if (!$scope.filter.saleChannel) {
            orderListUrl += "&saleschannelid=0";
        } else {
            orderListUrl += "&saleschannelid=" + $scope.filter.saleChannel.idtableSalesChannelValueInfoId;
        }
        if ($scope.filter.skuId) {
            orderListUrl += "&skuid=" + $scope.filter.skuId;
        }
        if ($scope.filter.customerid) {
            orderListUrl += "&customerid=" + $scope.filter.customerid;
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
        if ($scope.filter.orderref) {
            orderListUrl += "&orderref=" + $scope.filter.orderref;
        }
        console.log(orderListUrl);
        $http.get(orderListUrl).success(function(data)
        {
            $scope.orderLists = data;
            $scope.showOrderLevelAction(data);

            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {

            console.log(status);

        });
    };

    $scope.listOfStatesCount($scope.defaultTab, 1);



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
    $scope.searchSaleReturnOrders = function(){
        $scope.submitAction();
    }
    $scope.submitAction = function() {
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        console.log($scope.filter);

        if ($scope.filter.start1Date != undefined) {
            $scope.filter.startDate = moment.utc($scope.filter.start1Date).format();
        }
        if ($scope.filter.end1Date != undefined) {
            $scope.filter.endDate = moment.utc($scope.filter.end1Date).format();
        }

        $scope.exportFile = true;
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = false;
        $scope.listOfStatesCount($scope.defaultTab, 1);
    };

    //clear filter for clearing applied filters
    $scope.clearAction = function() {
        $scope.sortType = "tableSaleReturnSystemOrderNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;

        $scope.clearStartDate();
        $scope.clearEndDate();

        $scope.filter = {};

        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
    }

    $scope.searchedProduct = function(selected) {
        if (selected != null) {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }
    };

    $scope.searchedProductForFilter = function(selected) {
        if (selected != null && selected != undefined)
        {
            $scope.filter.skuId = selected.originalObject.idtableSkuId;
        }else{
            $scope.filter.skuId = undefined;
        }
    };

    $scope.searchedCustomer = function(selected) {
        if (selected != null && selected != undefined) {
            $scope.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.customerid = undefined;
        }
    };

    $scope.searchedCustomerForFilter = function(selected)
    {
        if (selected != null && selected != undefined) {
            $scope.filter.customerid = selected.originalObject.idtableCustomerId;
        }else{
            $scope.filter.customerid = undefined;
        }
    };

    /*$scope.getTotal = function(tableSkuData) {
        var total = 0;
        for (var i = 0; i < tableSkuData.tableSaleOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tableSaleOrderSkusChargeses[i].tableSaleOrderSkusChargesValue;
            total += product;
        }
        return total;
    };*/

    $scope.exportOrderReturnDataFile = function(){
        $mdDialog.show({
            templateUrl: 'exportOrderReturnFile.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    };
    /*$scope.DownloadOrderReturnFileExport = function(){

        //use $scope.filter object here

        var exportUrl = baseUrl+'/omsservices/webapi/salereturn/export?';

        if (!$scope.channel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.channel;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.startDate) {
            exportUrl += "&startDate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            exportUrl += "&endDate=" + $scope.endDate;
        }
        if ($scope.orderref) {
            exportUrl += "&orderref=" + $scope.orderref;
        }
        if ($scope.orderid) {
            exportUrl += "&orderid=" + $scope.orderid;
        }

        $http.get(exportUrl).success(function(response) {
            console.log(response);
            $cookies.put('DownloadExportData','orders');
            console.log($cookies.get('DownloadExportData'));
            $cookies.put('ActiveTab','Orders');
            $rootScope.growlmessage = growl.success("Order Export requested successfully.<a href='#/export' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",{ttl: -1});
            $mdDialog.hide({
                templateUrl: 'exportFile.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }).error(function(data){
            console.log(data);
            growl.error(data.errorMessage);
        });
    };
    $scope.DownloadOrderReturnItemFileExport = function(saleChannelId, skuId, startDate, endDate, customerid,orderid){
        if (saleChannelId != undefined) {
            $scope.channel = saleChannelId;
        }
        if (skuId != undefined) {
            $scope.skuId = skuId;
        }
        if (startDate != undefined) {
            $scope.startDate = dateFormat(new Date(startDate), 'yyyy-mm-dd');
        }
        if (endDate != undefined) {
            $scope.endDate = dateFormat(new Date(endDate), 'yyyy-mm-dd');
        }
        if (customerid != undefined) {
            $scope.customerid = customerid;
        }
        if (orderid != undefined) {
            $scope.orderid = orderid;
        }
        var exportUrl = baseUrl+'/omsservices/webapi/orders/orderitem/export?';

        if (!$scope.channel) {
            exportUrl += "&salesChannel=0";
        } else {
            exportUrl += "&salesChannel=" + $scope.channel;
        }
        if ($scope.skuId) {
            exportUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.customerid) {
            exportUrl += "&customerid=" + $scope.customerid;
        }
        if ($scope.startDate) {
            exportUrl += "&startDate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            exportUrl += "&endDate=" + $scope.endDate;
        }
        if ($scope.orderref) {
            exportUrl += "&orderref=" + $scope.orderref;
        }
        if ($scope.orderid) {
            exportUrl += "&orderid=" + $scope.orderid;
        }
        $http.get(exportUrl).success(function(response) {
            $cookies.put('DownloadExportData','orderitems');
            $cookies.put('ActiveTab','orderitems');
            $rootScope.growlmessage = growl.success("Order Items Export requested successfully.<a href='#/export' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",{ttl: -1});
            $mdDialog.hide({
                templateUrl: 'exportFile.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                scope: $scope.$new()
            });
        }).error(function(data){
            console.log(data);
            growl.error(data.errorMessage);
        });
    };*/


    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableSaleReturnSkuQuantity;
            total += quantity;
        }
        return total;
    }

    $scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            for (var j = 0; j < allSkus[i].tableSaleReturnSkuCharges.length; j++) {
                var product = allSkus[i].tableSaleReturnSkuCharges[j].tableSaleReturnSkuChargeValue;
                total += product;
            }
            totalCostAmount += total * allSkus[i].tableSaleReturnSkuQuantity;
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


    $scope.selectTableRow = function(index) {
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

    $scope.cancelshippingNumberDialog = function(){
        $mdDialog.hide();
    };


    $scope.addDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = true;
    };

    $scope.chooseDeliveryAddressMode = function() {
        $scope.addDeliveryClicked = false;
    };

    $scope.customerObj = function(selected)
    {
        var q = $q.defer();
        if (selected != null) {
            console.log(selected);
            $scope.singleorderReturnData.tableCustomer = selected.originalObject;

            $scope.deliveryAddresses(selected.originalObject.idtableCustomerId).then(
                function(v) {
                    $scope.custName = selected.originalObject.tableCustomerFirstName;
                    if (selected.originalObject.tableCustomerLastName && selected.originalObject.tableCustomerLastName != null && selected.originalObject.tableCustomerLastName != null) {
                        $scope.custName += " " + selected.originalObject.tableCustomerLastName;
                    }
                    $scope.$broadcast("angucomplete-alt:changeInput", "customers", $scope.custName);
                    q.resolve(true);
                },
                function(err) {
                    q.reject(false);
                }
            );
        }
        return q.promise;
    }


    $scope.productObject = function(selected) {
        if (selected != null)
        {
            console.log(selected);
            $scope.isProductSelected = true;
            $scope.searchedSku = selected.originalObject;
        }
        else
        {
            $scope.isProductSelected = false;
        }
    };

    $scope.customerChanged = function(str) {
        console.log(str);
        if (str == '') {
            $scope.custName = null;
            $scope.deliveryAddressArray = null;
        }
    };
    $scope.showAddOrderReturnModal = function(ev) {
        $scope.addOrderForm.submitted = false;
        $scope.salesChannelSelected = false;
        $scope.deliveryAddressSelected = false;
        $scope.orderNumberEntered = false;
        $scope.singleorderReturnData.tableSalesChannelValueInfo = null;
        $('#confirmSaleOrderReturnDialog').modal('show');
        
    };

    $('#addSaleReturnDialogRefUnknown').on('show.bs.modal' , function (e){
        $( "#ordertabs a:first"  ).tab('show');
    });

    $('#addSaleReturnDialogRefKnown').on('show.bs.modal' , function (e){
        $( "#ordertabswithoutref a:first"  ).tab('show');
    });


    $scope.togglePaymentTypeSubmittedValue = function(paymentType) {
        if (paymentType) {
            $scope.paymentTypeSelected = false;
        } else {
            $scope.paymentTypeSelected = true;
        }
    };

    $scope.saveSingleOrderReturn = function()
    {
        console.log($scope.singleorderReturnData);

        $scope.checkOrderNumber($scope.singleorderReturnData.tableSaleReturnScRefNo).then(function () {
            if($scope.orderRefExists == false)
            {
                if ($scope.singleorderReturnData.tableSalesChannelValueInfo == null
                    || $scope.singleorderReturnData.tableSalesChannelValueInfo == undefined && $scope.genericData.saleRefKnown == false)
                {
                    growl.error("Please choose a sales channel!");
                    return;
                }
                if ($scope.singleorderReturnData.tableSaleReturnSkus.length < 1)
                {
                    growl.error("Please add at least one product!");
                    return;
                }
                if ($scope.singleorderReturnData.tableCustomer == null || $scope.singleorderReturnData.tableCustomer == undefined)
                {
                    growl.error("Select customer!");
                    return;
                }


                $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);
                if ($scope.singleorderReturnData.tableAddress == null || $scope.singleorderReturnData.tableAddress == undefined)
                {
                    growl.error("Please choose a pickup address!");
                    return;
                }


                if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime != null && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != undefined && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != "")
                {
                    $scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnPickUpDateTime).format();
                }
                if($scope.singleorderReturnData.tableSaleReturnDropDateTime != null && $scope.singleorderReturnData.tableSaleReturnDropDateTime != undefined && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != "")
                {
                    $scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnDropDateTime).format();
                }

                console.log($scope.singleorderReturnDataCopy);
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/salereturn',
                    data: $scope.singleorderReturnDataCopy,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res)
                {
                    console.log(res);
                    if (res)
                    {
                        $scope.singleOrderReturnMsg = 'Submitted successfully';
                        $scope.listOfStatesCount($scope.defaultTab, 1);
                        if ($scope.singleOrderReturnMode == "add") {
                            growl.success("Order Added Successfully");
                        } else if ($scope.singleOrderReturnMode == "copy") {
                            growl.success("Order Copied Successfully");
                        }
                        $scope.cancelSingleOrderReturn();
                    }
                }).error(function(error, status) {
                    console.log(error);
                    console.log(status);
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("Failed to add return order");
                    }
                });

            }

        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');


        }, function () {
            growl.error("There is some issue. Please try after sometime.")
        });

    };

    $scope.updateSingleOrderReturn = function()
    {
        var httpMethod,requestUrl;
        console.log($scope.singleorderReturnData);
        console.log($scope.singleOrderReturnMode);
        $scope.singleorderReturnDataCopy = angular.copy($scope.singleorderReturnData);
        if ($scope.singleorderReturnDataCopy.tableSalesChannelValueInfo == null
            || $scope.singleorderReturnDataCopy.tableSalesChannelValueInfo == undefined)
        {
            growl.error("Please choose a sales channel!");
            return;
        }
        if ($scope.singleorderReturnDataCopy.tableSaleReturnSkus.length < 1)
        {
            growl.error("Please add at least one product!");
            return;
        }
        if ($scope.singleorderReturnDataCopy.tableCustomer == null || $scope.singleorderReturnDataCopy.tableCustomer == undefined)
        {
            growl.error("Select customer!");
            return;
        }
        if ($scope.singleorderReturnDataCopy.tableAddress == null || $scope.singleorderReturnDataCopy.tableAddress == undefined)
        {
            growl.error("Please choose a pickup address!");
            return;
        }

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime != null && $scope.singleorderReturnData.tableSaleReturnPickUpDateTime != undefined)
        {
            $scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnPickUpDateTime).format();
        }
        if($scope.singleorderReturnData.tableSaleReturnDropDateTime != null && $scope.singleorderReturnData.tableSaleReturnDropDateTime != undefined)
        {
            $scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime = moment.utc($scope.singleorderReturnData.tableSaleReturnDropDateTime).format();
        }

        if($scope.singleOrderReturnMode == 'edit'){
            httpMethod = 'PUT';
            requestUrl = baseUrl + '/omsservices/webapi/salereturn/'+$scope.singleorderReturnData.idtableSaleReturnId;
        }else{
            httpMethod = 'POST';
            requestUrl = baseUrl + '/omsservices/webapi/salereturn';
        }
        console.log($scope.singleorderReturnDataCopy)
            $http({
                method: httpMethod,
                url: requestUrl,
                data: $scope.singleorderReturnDataCopy,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                console.log(res);
                if (res)
                {
                    $scope.singleOrderReturnMsg = 'Submitted successfully';
                    $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    if ($scope.singleOrderReturnMode == "add") {
                        growl.success("Order Added Successfully");
                    } else if ($scope.singleOrderReturnMode == "copy") {
                        growl.success("Order Copied Successfully");
                    }
                    if ($scope.singleOrderReturnMode == "edit") {
                        growl.success("Order Updated Successfully");
                    }
                    $scope.cancelSingleOrderReturn();
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if (status == 400) {
                    growl.error(error.errorMessage);
                }
                else {
                    growl.error("Failed to add return order");
                }
            })
        
    };

    $scope.onSaleReferenceNumberOptionChanged = function (salerefknown, ev)
    {
        $scope.initDateLimits();
        $scope.genericData.saleRefKnown = salerefknown;
        if($scope.genericData.saleRefKnown == true)
        {
            $('#addSaleReturnDialogRefKnown').modal('show');
        }
        if($scope.genericData.saleRefKnown == false)
        {
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $('#addSaleReturnDialogRefUnknown').modal('show');

        }
        $('#confirmSaleOrderReturnDialog').modal('hide');
    }

    $scope.updateSingleOrderReturnConfirmed = function() {
        var shipmentDate = null;
        var deliveryDate = null;
        if($scope.singleorderReturnData.tableSaleOrderLatestShippngDate != null && $scope.singleorderReturnData.tableSaleOrderLatestShippngDate != undefined){
            shipmentDate = moment.utc($scope.singleorderReturnData.tableSaleOrderLatestShippngDate).format();
        }
        if($scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate != null && $scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate != undefined){
            deliveryDate = moment.utc($scope.singleorderReturnData.tableSaleOrderLatestDeliveryDate).format();
        }
        var postData = {
            "idtableSaleOrderId": $scope.updateOrderId,
            "tableSaleOrderClientOrderNo": $scope.singleorderReturnData.orderNo,
            "tableSalesChannelValueInfo": $scope.singleorderReturnData.channelObject,
            "tableAddressByTableSaleOrderShipToAddressId": $scope.singleorderReturnData.deliveryAddress,
            "tableCustomer": $scope.singleorderReturnData.customerObj,
            "tableSaleOrderPaymentType": $scope.singleorderReturnData.paymentObject,
            "tableSaleOrderSkuses": $scope.products,
            "tableSaleOrderRemarks":$scope.singleorderReturnData.tableSaleOrderRemarks,
            "tableSaleOrderScDateTime":moment.utc($scope.singleorderReturnData.tableSaleOrderScDateTime).format(),
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
                $scope.singleOrderReturnMsg = 'Submitted successfully';
                $scope.orderNo = '';
                $scope.product = '';
                $scope.deliveryAddress = '';
                $scope.customer = '';
                $scope.popupChannel = '';
                $scope.payment = '';
                $scope.singleorderReturnData = {};
                postData = null;
                $scope.products = [];
                // $scope.listOfOrderReturn($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                growl.success("Order Updated Successfully");
                $scope.cancelSingleOrderReturn();
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Order Cant be Added");
            }
        });
    };

    //cancel single order
    $scope.cancelSingleOrderReturn = function() {

        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');
        $scope.$broadcast("angucomplete-alt:clearInput", "customers");


        $scope.initSingleOrderReturnData();
        $scope.deliveryAddressArray = [];
        $scope.custName = null;
        $scope.singleOrderReturnMode = "add";

    };

    $scope.deliveryAddresses = function(customerId) {
        var q = $q.defer();

        console.log("Hello");
        $scope.deliveryAddressArray = [];
        var deliveryAddressUrl = baseUrl + '/omsservices/webapi/customers/' + customerId + '/shippingaddress';
        $http.get(deliveryAddressUrl).success(function(data)
        {
            if(data != null)
            {
                for (var i = 0; i < data.length; i++) {
                    $scope.deliveryAddressArray.push(data[i].tableAddress);
                }
            }
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    };

    //======================= get total cost per sku ======================= //

    $scope.getTotal = function(tableSkuData) {

        var total = 0;
        for (var i = 0; i < tableSkuData.tableSaleReturnSkuCharges.length; i++) {
            var product = tableSkuData.tableSaleReturnSkuCharges[i].tableSaleReturnSkuChargeValue;
            total += product;
        }
        return total;
    };

    //============================ get total cost per Product ================== //

    $scope.totalCostPerProduct = function(tableSkuData) {
        // console.log(tableSkuData.tablePurchaseOrderSkusChargeses.length);
        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tableSaleReturnSkuCharges.length; i++) {
            var product = tableSkuData.tableSaleReturnSkuCharges[i].tableSaleReturnSkuChargeValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tableSaleReturnSkuQuantity.toFixed(2);

        return totalCost;
    }

    //================================= ends here ==================================== //


    $scope.changeIndex = function(index) {
        console.log(index);
    };

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
            var trials = saleordskus[i].tableSaleReturnSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableSaleReturnSkuStateType.idtableSaleReturnSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            console.log($scope.fullTrialsArray);
        }
    };


    // adding the product in table one by one
    $scope.addProduct = function(tableSku)
    {
        if (!$scope.searchedSku)
        {
            growl.error("Please search and select a product first!");
        }
        else if (!$scope.saleReturnFormData.returnQuantity)
        {
            growl.error("Please enter the product quantity!");
        }
        else if ($scope.saleReturnFormData.returnQuantity < 1)
        {
            growl.error("Please enter return quantity greater than 0!");
        }
        else
        {
            for (var i = 0; i < $scope.singleorderReturnData.tableSaleReturnSkus.length; i++)
            {
                if ($scope.singleorderReturnData.tableSaleReturnSkus[i].tableSku.idtableSkuId == tableSku.idtableSkuId)
                {
                    growl.error("The selected SKU is already part of the current order. Delete the existing item first to add updated quantity.");
                    return;
                }
            }
            var tempObject = {
                tableSku : $scope.searchedSku,
                tableSaleReturnSkuQuantity: $scope.saleReturnFormData.returnQuantity
            };

            $scope.singleorderReturnData.tableSaleReturnSkus.push(tempObject);
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.saleReturnFormData.returnQuantity = null;
            $scope.searchedSku = null;

        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.singleorderReturnData.tableSaleReturnSkus.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        growl.success('Item deleted successfully.');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };

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
    };

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


    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = baseUrl + '/omsservices/webapi/salereturncancelreason';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            console.log($scope.cancelReasonArray);
            $scope.LoadNewRason = {};
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.LoadNewRason = {};
        });
    }

    $scope.loadReturnReasons = function() {
        $scope.returnReasonArray = [];
        var returnReasonsUrl = baseUrl + '/omsservices/webapi/salereturnreason';
        $http.get(returnReasonsUrl).success(function(data) {
            console.log(data);
            $scope.returnReasonArray = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.loadReturnReasons();

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
        }
        if (wareHouseObject != undefined) {
            var wareHousesUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/orderskus/' + tableSaleOrderId + '/warehouse';
            $http.put(wareHousesUrl, wareHouseObject).success(function(data) {
                console.log(data);
                if (data) {
                    growl.success("Warehouse Allocated Successfully");
                    // $scope.listOfOrderReturn($scope.defaultTab, 0);
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
                }else {
                    growl.error("Warehouse Cannot Be Allocated");
                }
            });
            $mdDialog.hide();
        }
    }

    $scope.listOfShippingOwners = function(){
        $scope.shippingOwnersData = [];
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
    }

    $scope.listOfShippingOwners();

    //action after selecting shipping carrier in the timeline feature(active state)
    $scope.selectShippingCarrierAction = function(orderId, tableSaleOrderId, shippingObject) {
        console.log(orderId);
        console.log(tableSaleOrderId);
        console.log(shippingObject);
        if (shippingObject == undefined) {
            growl.error("Shipping Carrier cannot be allocated");
        }
        if (shippingObject != undefined) {
            var shippingAllocateUrl = baseUrl + '/omsservices/webapi/orders/' + orderId + '/shipping/' + tableSaleOrderId;
            $http.put(shippingAllocateUrl, shippingObject).success(function(data) {
                console.log(data);
                if (data) {
                    growl.success("Shipping Carrier Allocated Successfully");
                    // $scope.listOfOrderReturn($scope.defaultTab, 0);
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
                }else {
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
                }
                else if(otherReasonRemarks.length>128)
                {
                    $scope.otherReasonNotFiled = true;
                    growl.error("Entered Reason should be less than or equal to 128 characters.")
                }
                else
                {
                    if(remarks == 'other'){
                        //var UserRemarks = otherReasonRemarks;
                        if($scope.LoadNewRason.ReasonCheckBox == true){
                            console.log($scope.LoadNewRason.reasonData);
                            var postDataReason;
                            postDataReason = {
                                "tableSaleReturnReasonString": $scope.LoadNewRason.reasonData
                            };
                            $http({
                                method: 'POST',
                                url: baseUrl + '/omsservices/webapi/salereturncancelreason',
                                data: postDataReason,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function(data){
                                console.log(data);
                                $scope.loadCancelReasons();
                            }).error(function(data){
                                console.log(data);
                            });
                        }
                    }
                    var cancelUrl = baseUrl + '/omsservices/webapi/salereturn/' + orderId + '/cancel/?remarks=' + otherReasonRemarks;
                    $http.put(cancelUrl).success(function(data) {
                        console.log(data);
                        $mdDialog.hide();
                        if (data) {
                            growl.success("Order Cancelled Successfully");
                            // $scope.listOfOrderReturn($scope.defaultTab, 0);
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
                        }else {
                            growl.error("Order Cannot Be Cancelled");
                        }
                    });
                }
            }
            if (remarks != undefined && remarks!='other') {
                var cancelUrl = baseUrl + '/omsservices/webapi/salereturn/' + orderId + '/cancel/?remarks=' + remarks;
                $http.put(cancelUrl).success(function(data) {
                    console.log(data);
                    $mdDialog.hide();
                    if (data) {
                        growl.success("Order Cancelled Successfully");
                        // $scope.listOfOrderReturn($scope.defaultTab, 0);
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
                    }else {
                        growl.error("Order Cannot Be Cancelled");
                    }
                });
            }
        }
    }

    //Bulk Upload Functionality Starts

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
            }else {
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
            }else {
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
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Error in saving bulk upload mapping !!");
                }

            });
        });


    };

    //singleOrderReturn Tab Mode
    $scope.singleOrderReturnTabMode = function() {
        $scope.singleOrderReturnTab = true;
        $scope.bulkOrderReturnTab = false;
    };

    //bulkOrder Tab Mode
    $scope.bulkOrderReturnTabMode = function() {
        $scope.singleOrderReturnTab = false;
        $scope.bulkOrderReturnTab = true;
    };


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
                // $scope.listOfOrderReturn($scope.defaultTab, 0);
                $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                growl.success("Bulk Order Uploaded successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            $scope.bulkOrderSettingData = "";
            angular.element("input[type='file']").val(null);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
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
        $mdDialog.hide();
    }

    $scope.onvalue1 = function(radio1) {
        console.log(radio1);
        $scope.shippingObject = JSON.parse(radio1);
        console.log($scope.shippingObject);
    }

    //dialog box to open cancel order dialog box
    $scope.cancelSaleOrderReturnBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
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
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableSaleReturnSkuStateTrailDateTime);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableSaleReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableSaleReturnSkuStateType.tableSaleReturnSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableSaleReturnSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        $mdDialog.show({
            templateUrl: 'infoDialogSOR.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.cancelInfoBox = function() {
        $mdDialog.hide();
    }


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




    function setFocus() {
        document.getElementById("settingName").focus();
    }

    function setBlur() {
        document.getElementById("settingName").blur();
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

    $scope.cancelSingleOrderReturns = function(){

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


    $scope.initDateLimits = function () {
        $scope.minDateShipping = new Date();
        $scope.maxDateShipping = null;

        $scope.minDateDelivery = new Date();
        $scope.maxDateDelivery = null;

    }

    $scope.initDateLimits();
    $scope.onPickUpDateChange = function () {

        //Should be greater than equal to today's date and if delivery date is available then should be less than delivery date
        $scope.minDateShipping = new Date();

        if($scope.singleorderReturnData.tableSaleReturnDropDateTime)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableSaleReturnDropDateTime);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableSaleReturnPickUpDateTime);
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

        if($scope.singleorderReturnData.tableSaleReturnPickUpDateTime)
        {
            $scope.shippingDateData = new Date($scope.singleorderReturnData.tableSaleReturnPickUpDateTime);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderReturnData.tableSaleReturnDropDateTime)
        {
            $scope.deliveryDateData = new Date($scope.singleorderReturnData.tableSaleReturnDropDateTime);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };




    $scope.getFileType = function(file) {
        console.log(file);
    };
    $scope.DraftOrderID = {};
    $scope.editOrder = function(orderData,mode, ev) {


        $scope.singleOrderReturnMode = mode;
        if(orderData.tableSaleOrder == null)
        {
            console.log(orderData);
            $scope.singleorderReturnDataCopy = angular.copy(orderData);
            $scope.singleorderReturnData = $scope.singleorderReturnDataCopy;

            if ($scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime != null) {
                $scope.singleorderReturnData.tableSaleReturnPickUpDateTime = new Date($scope.singleorderReturnDataCopy.tableSaleReturnPickUpDateTime);
            }
            if ($scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime != null) {
                $scope.singleorderReturnData.tableSaleReturnDropDateTime = new Date($scope.singleorderReturnDataCopy.tableSaleReturnDropDateTime);
            }

            if($scope.singleOrderReturnMode == 'copy')
            {
                $scope.singleorderReturnData.tableSaleReturnScRefNo = null;
                $scope.singleorderReturnData.tableSaleReturnRemarks = "";
                $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
            }

            $scope.$broadcast("angucomplete-alt:changeInput", "customers", $scope.singleorderReturnData.tableCustomer);
            $('#addSaleReturnDialogRefUnknown').modal('show');

        }
        else
        {
            if($scope.singleOrderReturnMode == 'copy')
            {
                $scope.singleorderReturnData.tableSaleReturnRemarks = "";
                $scope.singleorderReturnData.tableSaleReturnRemarkses = [];
            }

            $scope.singleorderReturnData.tableSaleReturnScRefNo = orderData.tableSaleReturnScRefNo;
            $scope.singleorderReturnData.tableShippingOwnership = orderData.tableShippingOwnership;
            $scope.singleorderReturnData.tableSaleReturnPickUpDateTime = orderData.tableSaleReturnPickUpDateTime;
            $scope.singleorderReturnData.tableSaleReturnDropDateTime = orderData.tableSaleReturnDropDateTime;
            $scope.singleorderReturnData.tableSaleReturnReason = orderData.tableSaleReturnReason;
            $scope.singleorderReturnData.tableSaleReturnRemarkses = orderData.tableSaleReturnRemarkses;
            $scope.singleorderReturnData.idtableSaleReturnId = orderData.idtableSaleReturnId;

            $scope.populateReturnOrderFromSaleOrder(orderData.tableSaleOrder);
            $('#addSaleReturnDialogRefKnown').modal('show');
        }

    };

    $scope.copyOrder = function(orderId) {
        $scope.singleOrderReturnMode = "copy";
        $scope.updateOrderId = orderId;
        var copyOrderUrl = baseUrl + '/omsservices/webapi/salereturn/' + orderId;
        $http({
            method: 'GET',
            url: copyOrderUrl
        }).success(function(res)
        {
            if (res)
            {
                console.log(res);
                $scope.singleorderReturnData = res;
                $('#addOrderModal').modal('show');
            }
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Order Cannot Be Copied");
            }
        })
    };

    $scope.concatenateAddresses = function(addr1, addr2, addr3) {
        return addr1 + ", " + addr2 + ", " + addr3;
    };

    function initializeAddressDropdowns(lists, prop, code) {
        lists = lists || [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (list.tableAddress[prop] === code) {
                return list;
            }
        };
        return null;
    }

    //check Order Number
    $scope.checkOrderNumber = function(orderNo)
    {
        var q = $q.defer();
        console.log(orderNo);
        var checkOrderNo = baseUrl + "/omsservices/webapi/salereturn/clientordernumber?clientordernumber=" + orderNo;
        $http.get(checkOrderNo).success(function(data)
        {
            console.log(data);
            if (data == true)
            {
                growl.error("Order ref. no. already exists");
                $('#ordernumberId').val('');
                $scope.isOrderNoValid = true;
                $scope.orderNumberEntered = true;
                q.resolve(false);
                $scope.orderRefExists = true;
            }
            if (data == false)
            {
                $scope.isOrderNoValid = false;
                $scope.orderNumberEntered = false;
                q.resolve(true);
                $scope.orderRefExists = false;
            }
        });
        return q.promise;
    }

    //dialog box to add new delivery address
    $scope.addShippingAddress = function(customerId, customerTypeId) {
        console.log(customerTypeId);
        console.log(customerId);

        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + customerId;
        $http.get(customersByIDUrl).success(function(data) {
            $scope.customerId = data.idtableCustomerId;
            $scope.customerTypeId = customerTypeId;
            $scope.contactPersonName = data.tableCustomerFirstName + " " + data.tableCustomerLastName;
            $scope.contactEmail = data.tableCustomerEmail;
            $scope.contactPhone = data.tableCustomerPhone;

        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
        $('#orderShippingAddressModal').modal('show');
    };

    // dialog box to add new invoice template
    $scope.uploadFileBulkOrder = function(ev) {
        $('#addOrderModal').modal('hide');
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
        else if(value.SkuType == 'Parcel')
        {
            if (value.tableSaleOrderShippingDetailsMasterAwb == '' || value.tableSaleOrderShippingDetailsMasterAwb == undefined)
            {
                growl.error('AWB number is required.');
                return false;
            }
        }
    };




    $scope.blurred = true;
    $scope.skuPackingDisable =function()
    {
        if($scope.ShippingDetailsBtn()==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function(index){
        console.log(index);
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
        console.log($scope.tableSalesOrderSkuQuantityDetails);
    };


    $scope.shippingDetails  = {};

    $scope.closeBulkUploadDialog = function()
    {
        $('#addOrderModal').modal('hide');

        $('#addSaleReturnDialogRefUnknown').modal('hide');
        $('#addSaleReturnDialogRefKnown').modal('hide');

        
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
        console.log(order);
        $scope.modalRemarks = null;
        $scope.editRemarkModalOrderId = order.idtableSaleReturnId;
        if(order.tableSaleReturnRemarkses == null || order.tableSaleReturnRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else{
            if(order.tableSaleReturnRemarkses.length>0){
                $scope.modalRemarks = order.tableSaleReturnRemarkses;
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
        console.log(newRemarks,$scope.editRemarkModalOrderId);
        if(newRemarks == null || newRemarks == undefined || newRemarks == ""){
            growl.error("Please provide remarks");
            return;
        }
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/salereturn/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = baseUrl + "/omsservices/webapi/salereturn/"+orderDataForReplacingData.idtableSaleReturnId;
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
            $scope.cancelEditRemarksModal();

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
    };
    //$scope.shippingDetails.SkuType = 'Parcel';


//    =============================== show order level action ========================== //

    $scope.showOrderLevelAction = function(value){
        console.log(value);
    }
    $scope.getShippingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)) {
                b = true;
            }
        });
        return b;
    }

    $scope.getPackingLabelButton = function(data){
        var b = false;
        angular.forEach(data,function(resp){
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 8 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 9 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 11)){
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
            if(b == false && (resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 13 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 14 || resp.tableSaleOrderSkuStateType.idtableSaleOrderSkuStateTypeId == 15)){
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

    $scope.orderLevelActionRow = function(data){

        var shippingLabelButn = $scope.getShippingLabelButton(data);
        var packingLabelButton = $scope.getPackingLabelButton(data);
        var manifestLabelButton = $scope.getmanifestLabelButton(data);
        var InvoiceLabelButton = $scope.getInvoiceLabelButton(data);
        var QuickShipButton = $scope.getQuickShipLabelButton(data);
        if(shippingLabelButn == true || packingLabelButton == true || manifestLabelButton == true || InvoiceLabelButton == true || QuickShipButton == true){
            return true;
        }else{
            return false;
        }

    };
	
    $scope.masterSkuDialog = function(ev, check){		
		
		mastersService.fetchSkus(baseUrl).then(function(data){
			$scope.genericData.skusListFiltered = data;
			
			$timeout(function () {
			    $('#dialogmastersku').modal('show');
			}, 200);
		});
		
		$scope.genericData.check = check;
		
		if(check == true){

			console.log($scope.singleorderData);
		}
				
        	
		
	}
	
	$scope.masterCustomerDialog = function(ev, check){		
		
		mastersService.fetchCustomers(baseUrl).then(function(data){
			$scope.genericData.customerListFiltered = data;
			
			$timeout(function () {
				$('#dialogmastercustomer').modal('show');

			}, 200);
			
		});
		
		$scope.genericData.check = check;
		
		if(check == true){

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
        //$mdDialog.hide({
        //    templateUrl: 'dialogmastersku.tmpl.html'
        //});

        $('#dialogmastersku').modal('hide');
        $('#dialogmastercustomer').modal('hide');

		

		if($scope.genericData.check == true){						
			$scope.showAddOrderModalWithValues(ev);
		}
		
	}
	
	$scope.showAddOrderModalWithValues = function(ev){
		$('#addSaleReturnDialogRefUnknown').modal('show');

	}


}
