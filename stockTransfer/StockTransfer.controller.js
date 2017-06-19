/**
 * Created by angularpc on 07-12-2016.
 */
myApp.controller('stockTransfer', stockTransfer);

stockTransfer.$inject = ['$rootScope','$scope', '$http' , '$location','$filter', 'fileUpload', '$mdDialog', '$mdMedia', 'baseUrl', '$sce', 'growl', 'PagerService', '$q', '$cookies', 'downloadSTOTemplateUrl','$timeout',  '$routeParams','Upload', 'mastersService'];

function stockTransfer($rootScope, $scope, $http,  $location,$filter, fileUpload, $mdDialog, $mdMedia, baseUrl, $sce, growl, PagerService, $q, $cookies, downloadSTOTemplateUrl,$timeout, $routeParams,Upload , mastersService) {

	$scope.genericData = {};
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.genericData  = {};
    $scope.genericData.orderDialogMode = "addnew";

    $scope.filterObj = {};
    $scope.filterObj.fromWarehouse = null;
    $scope.filterObj.toWarehouse = null;
    $scope.filterObj.systemOrderNo = "";
    $scope.filterObj.stRefNo = "";
    $scope.filterObj.start1Date = null;
    $scope.filterObj.end1Date = null;

    $scope.products = [];
    $scope.shippingDetails = '';
    $scope.Packing = '';
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipDataTable = [];
    $scope.quantityTypes = [
        'Good',
        'Bad'
    ]
    $scope.downloadSTOTemplateUrl = downloadSTOTemplateUrl;
    $scope.ClientOrderNo = '';
    $scope.start = 0;
    $scope.orderSize = 5;
    $scope.defaultTab = 'all';
    $scope.singleOrderTab = true;
    $scope.bulkOrderTab = false;
    $scope.singleOrderMode = "add";
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/vendors/search?search=';
	
	$scope.sortType = "tableStockXferOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.disableQuickShipBox = [];
    $scope.editQuickShipBoxHideAndShow = [];
    $scope.shipping = {};
    var currentUrl,UrlName;
    currentUrl = window.location.href;
    UrlName = currentUrl.search('stocktransfer');
    console.log(UrlName);
    if(UrlName == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }


    $scope.onPageInitialize = function () {
        if($cookies.get('orderid') != null){
            $scope.filterObj.systemOrderNo = $cookies.get('orderid');
            $cookies.remove('orderid')
        }
        $scope.listOfStatesCount($scope.defaultTab);
        $scope.listOfWareHouses();
        $scope.getToWarehouses();
        $scope.listOfShippingOwners();
        $scope.listOfShippingCarriers();
    }

    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";




    //    ====================================== single and bulk order tab ================== //

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

    $scope.cancelBulkUpload = function(){
        $scope.fileName = null;
        $mdDialog.hide();

    }
    $scope.closeBulkUploadDialog = function(){
        console.log('sto');
        $mdDialog.hide();
        $cookies.put('BulkUploadData','stocktransfer');
        $cookies.put('ActiveTab','Stocktransfer');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
        
        $scope.genericData.check = null;

    };

    $scope.downloadSTOtemplate = function(){
        $http({
            method: 'GET',
            url: downloadSTOTemplateUrl,
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
            a.download = "Glaucus_StockTransfer_Order_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };

    //=================================== edit remarks ============================= //
    var orderDataForReplacingData;
    $scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
        $scope.editRemarkModalOrderId = order.idtableStockXferOrderId;
        $scope.modalRemarks = null;
        if(order.tableStockXferOrderRemarkses == null || order.tableStockXferOrderRemarkses == undefined){
            $scope.modalRemarks = null;
        }
        else
        {
            if(order.tableStockXferOrderRemarkses.length > 0) {
                $scope.modalRemarks = order.tableStockXferOrderRemarkses;
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
            url: baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = baseUrl + "/omsservices/webapi/stock/transfer/"+orderDataForReplacingData.idtableStockXferOrderId;
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


    //============================================================================== //

    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile, bulkOrderSettingData) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;

    };

    $scope.uploadPoBulkUpload = function(bulkOrderUploadfile){
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        if (file) {
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);
                var uploadUrl = baseUrl + '/omsservices/webapi/stock/transfer/stbulkupload';

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
                    $cookies.put('BulkUploadData','stocktransfer');
                    $cookies.put('ActiveTab','Stocktransfer');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    //$scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.cancelBulkUpload();
                    $mdDialog.hide();

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
    };



    // getting all list of orders (all the orders)
    $scope.listOfOrders = function (tabsValue, start, action) {
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
        }
        else
        {
            $scope.DeleteAndConfimData = false;
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
            $scope.tabsColor = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {};
            $scope.tabsColor7 = {};
        }
        if (tabsValue == 'intransit') {
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

        if (tabsValue == 'process') {
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
        if (tabsValue == 'grn') {
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
        if (tabsValue == 'draft') {
            $scope.tabsColor7 = {
                "background-color": "#E9EEEF",
                "outline": "none"
            }
            $scope.tabsColor = {};
            $scope.tabsColor1 = {};
            $scope.tabsColor2 = {};
            $scope.tabsColor3 = {};
            $scope.tabsColor4 = {};
            $scope.tabsColor5 = {};
            $scope.tabsColor6 = {}
        }


        $scope.defaultTab = tabsValue;

        var orderListUrl = baseUrl + "/omsservices/webapi/stock/transfer";

        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType + "&state=" + tabsValue;

        orderListUrl +="&uipagename="+$scope.pagename;

        if ($scope.skuId) {
            orderListUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.filterObj.stRefNo) {
            orderListUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
        }
        if ($scope.filterObj.systemOrderNo) {
            orderListUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
        }
        if ($scope.filterObj.fromWarehouse) {
            orderListUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.toWarehouse) {
            orderListUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.startDate) {
            orderListUrl += "&startdate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            orderListUrl += "&enddate=" + $scope.filterObj.endDate;
        }
        console.log(orderListUrl);
        $http.get(orderListUrl).success(function (data) {
            console.log(data);
            $scope.orderLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function (error, status) {

            console.log(status);

        });
    }
    $scope.getTotal = function (tableSkuData) {

        var total = 0;
        for (var i = 0; i < tableSkuData.tableStockXferOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tableStockXferOrderSkusChargeses[i].tableStockXferOrderSkusChargesValue;
            total += product;
        }
        return total;
    };

    $scope.totalCostPerProduct = function (tableSkuData) {

        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tableStockXferOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tableStockXferOrderSkusChargeses[i].tableStockXferOrderSkusChargesValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tableStockXferOrderSkusSkuQuantity;

        return totalCost;
    }

    $scope.listOfWareHouses = function () {
        $scope.wareHousesData = [];
        var wareHousesListUrl = baseUrl + "/omsservices/webapi/warehouses?option=from&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function (data)
        {
            console.log(data);
            $scope.wareHousesData = data;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
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

    $scope.getToWarehouses = function ()
    {
        $scope.toWarehouses = [];
        var wareHousesListUrl = baseUrl + "/omsservices/webapi/warehouses?option=to&uipagename="+$scope.pagename;
        // console.log(channelListUrl);
        $http.get(wareHousesListUrl).success(function (data) {
            console.log(data);
            $scope.toWarehouses = data;
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };


    $scope.WareHouseList = function () {
        var warehouse = baseUrl + '/omsservices/webapi/warehouses?uipagename='+$scope.pagename;
        $http.get(warehouse).success(function (data) {
            console.log(data);
            $scope.wareHousesData = data;

        }).error(function (data) {
            console.log(data);
        });
    }


    $scope.listOfShippingOwners = function () {
        $scope.shippingOwnersData = []
        var shippingOwnersUrl = baseUrl + "/omsservices/webapi/shippingowner";
        $http.get(shippingOwnersUrl).success(function (data) {
            $scope.shippingOwnersLists = data;
            for (var i = 0; i < $scope.shippingOwnersLists.length; i++) {
                $scope.shippingOwnersData.push($scope.shippingOwnersLists[i]);
            }
            console.log($scope.shippingOwnersData);
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfShippingCarriers = function () {
        $scope.shippingCarriersData = [];
        var shippingCarriersUrl = baseUrl + "/omsservices/webapi/carrierservices";
        $http.get(shippingCarriersUrl).success(function (data) {
            $scope.shippingCarriersLists = data;
            for (var i = 0; i < $scope.shippingCarriersLists.length; i++) {
                $scope.shippingCarriersData.push($scope.shippingCarriersLists[i]);
            }
            console.log($scope.shippingCarriersData);
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //$scope.sendShipOwner = function (shipOwner) {
    //    console.log(shipOwner);
    //    var shipOwners;
    //    if (typeof shipOwner == 'string') {
    //        shipOwners = JSON.parse(shipOwner);
    //    } else {
    //        shipOwners = shipOwner
    //    }
    //
    //    $scope.shipOwnerId = shipOwners.idtableShippingOwnershipId;
    //    console.log($scope.shipOwnerId);
    //}



    $scope.singleorderData = {};
    var producted = [];
    // adding the product in table one by one
    $scope.addProduct = function (tableStockXferOrderSkusSkuQuantity, id, price) {
        if($scope.tableSku == null || $scope.tableSku == undefined)
        {
            growl.error("Please provide product details");
            return;
        }

        if (tableStockXferOrderSkusSkuQuantity == undefined)
        {
            growl.error("Please give proper quantity.");
            return;
        }
        if($scope.singleorderData.FromwareHousesData == "" || $scope.singleorderData.FromwareHousesData == undefined)
        {
            growl.error('Please select source warehouse');
            return;
        }
        if (tableStockXferOrderSkusSkuQuantity > 0)
        {
            var tableSku = $scope.tableSku;
            var keepGoing = true;
            angular.forEach(producted, function(product)
            {
                if(keepGoing)
                {
                    if(product.tableSku.idtableSkuId == tableSku.idtableSkuId)
                    {
                        keepGoing = false;
                    }
                }
            });
            if(keepGoing)
            {
                producted.push({
                    tableSku: tableSku,
                    tableStockXferOrderSkusSkuQuantity: tableStockXferOrderSkusSkuQuantity,
                    "tableStockXferOrderSkusChargeses": [],
                    "tableStockXferOrderSkuStateTrails": []
                });
            }
            else
            {
                growl.error("The selected product is already added. Delete the existing product first to update quantity.");
            }

            $scope.products = producted;
            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            $scope.tableSku = null;
            tableStockXferOrderSkusSkuQuantity = null;
            $scope.singleorderData.productObj = null;
            $scope.singleorderData.quantityNo = null;
            $scope.singleorderData.priceProd = null;
            $scope.singleorderData.productObject = undefined;
            $scope.singleorderData.AvailableData = "";
        }
    };

    $scope.clearProductList = function () {
        $scope.products = [];
    }
    
    $scope.WareHouseCheck = function () {
        console.log($scope.singleorderData.TowareHousesData);
        console.log($scope.singleorderData.FromwareHousesData);
        if ($scope.singleorderData.TowareHousesData != undefined && $scope.singleorderData.FromwareHousesData != undefined) {
            if ($scope.singleorderData.TowareHousesData.idtableWarehouseDetailsId == $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId) {
                $scope.WareHouseMatch = true;
            } else {
                $scope.WareHouseMatch = false;
            }
        }
    };

    $scope.HideError = function () {
        $scope.WareHouseMatch = false;
    };
    //remove the product
    $scope.removeProduct = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    $scope.deleteSelectedItem = function(){
        $scope.products.splice($scope.genericData.deleteItemIndex, 1);
        $scope.cancelmasterDeleteDialog();
        growl.success('Item deleted successfully.');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };
    $scope.validateFormData = function() {

        if($scope.singleorderData.FromwareHousesData == null || $scope.singleorderData.FromwareHousesData == undefined)
        {
            growl.error('Select the "From Warehouse"');
            return false;
        }

        if($scope.singleorderData.TowareHousesData == null || $scope.singleorderData.TowareHousesData == undefined)
        {
            growl.error('Select the "To Warehouse"');
            return false;
        }

        if($scope.singleorderData.quantityType == null || $scope.singleorderData.quantityType == undefined)
        {
            growl.error('Select quantity type');
            return false;
        }

        if($scope.products == null || $scope.products == undefined || $scope.products.length == 0)
        {
            growl.error('Add SKUs in the list');
            return false;
        }

        return true;

    }

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
        {
            var checkOrderNo = baseUrl + "/omsservices/webapi/stock/transfer/clientordernumber?clientordernumber=" + orderNo;
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

    $scope.saveSingleOrder = function () {

        $scope.checkOrderNumber($scope.singleorderData.orderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    return;
                }
                var startDate, endDate;
                console.log($scope.products);
                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }


                if ($scope.products.length == 0) {
                    growl.error('you need to add product and its quantity also')
                } else {
                    var StoPost = {
                        //"tableShippingCarrierServices": $scope.singleorderData.shipService,
                        //"tableShippingOwnership": $scope.singleorderData.shipOwner,
                        "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                        "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                        "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tableStockXferOrderDate": null,
                        "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                        "tableStockXferOrderShippingCharges": 0,
                        "tableStockXferOrderShippingTax": 0,
                        "tableStockXferOrderHasParent": null,
                        "tableStockXferOrderHasChildren": null,
                        "tableStockXferOrderPickupDatetime": startDate,
                        "tableStockXferOrderDropDatetime": endDate,
                        "tableStockXferOrderTags": [],
                        "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                        "tableStockXferOrderSkuses": $scope.products,

                        "tableStockXferOrder": null,
                        "tableStockXferOrders": []
                    };

                    console.log(StoPost);
                    $http({
                        method: 'POST',
                        url: baseUrl + '/omsservices/webapi/stock/transfer',
                        data: StoPost,
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
                            $mdDialog.hide({
                                templateUrl: 'stockTransfer.tmpl.html'
                            });
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
        })
    };

    $scope.showBackEndStatusMessage = function(errorMessage){
        growl.error(errorMessage.errorMessage);
    }

    $scope.submitAction = function () {

        console.log($scope.filterObj);


        if ($scope.filterObj.start1Date != undefined)
        {
            $scope.filterObj.startDate = moment.utc($scope.filterObj.start1Date).format();
        }
        if ($scope.filterObj.end1Date != undefined)
        {
            $scope.filterObj.endDate = moment.utc($scope.filterObj.end1Date).format();
        }

        $scope.listOfStatesCount($scope.defaultTab, 1);
    }

    $scope.clearAction = function ()
    {
        $scope.filterObj = {};
        $scope.skuId = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.listOfStatesCount($scope.defaultTab, 1, 'clearAction');
    };

    $scope.tableSku = null;
    $scope.searchedProduct = function (selected)
    {
        if (selected != null) {
            $scope.tableSku = selected.originalObject;
            $scope.getPriceOfProduct();
        }
    };

    $scope.searchedProductForFilter = function (selected)
    {
        if (selected != null && selected != undefined) {
            $scope.skuId = selected.originalObject.idtableSkuId;
            $scope.getPriceOfProduct();
        }else{
            $scope.skuId = undefined;
        }
    };

    $scope.checkQuantityType = function () {
        $scope.products = [];
        $scope.getPriceOfProduct();
    }
    $scope.getPriceOfProduct = function () {

        if($scope.tableSku == null || $scope.tableSku == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderData != null)
        {
            if ($scope.singleorderData.FromwareHousesData == null || $scope.singleorderData.FromwareHousesData == undefined)
            {
                //No sufficient information to fetch quantity
                return;
            }
        }
        if($scope.singleorderData.quantityType == null || $scope.singleorderData.quantityType == undefined)
        {
            //No sufficient information to fetch quantity
            return;
        }

        if($scope.singleorderData.quantityType == "Good") {
            $http({
                method: 'GET',
                url: baseUrl + '/omsservices/webapi/inventory/' + $scope.tableSku.idtableSkuId + '/inventoriescount?fromwarehouseid='
                            + $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId + '&towarehouseid='
                            + $scope.singleorderData.TowareHousesData.idtableWarehouseDetailsId ,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res) {
                console.log(res);
                $scope.singleorderData.AvailableData = res.totalInventory + res.contextualBlocked;
            }).error(function (error, status) {
                $scope.singleorderData.AvailableData = 0;
                console.log(status);

            });
        }
        if($scope.singleorderData.quantityType == "Bad") {
            $http({
                method: 'GET',
                url: baseUrl + '/omsservices/webapi/inventory/sku/' + $scope.tableSku.idtableSkuId + '/warehouse/' + $scope.singleorderData.FromwareHousesData.idtableWarehouseDetailsId + '/badcount',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                $scope.singleorderData.AvailableData = res;
            }).error(function (error, status)
            {
                $scope.singleorderData.AvailableData = 0;
            });
        }
    };

//    ====================================== Quantity alert if greater than available value ========= //

    $scope.getQuantityProduct = function(available,InsertedQty){
      if(available < InsertedQty){
          growl.error('Required quantity cannot be greater than available quantity.')
      }
    };

//    =============================== deleting values from modal ======================== //

    $scope.cancelSingleOrder = function () {
		producted = [];
        $scope.disableQuickShipBox = [];
        $scope.editQuickShipBoxHideAndShow = [];
        $scope.OrderMode = "";
        $scope.singleorderData.wareHouses = null;
        $scope.products = [];
        $scope.BlockSkuAdd = false;
        $scope.pickupAddressName = null;
        $scope.singleorderData.orderNo = '';
        $scope.singleorderData.systemOrderNo = '';
        $scope.singleorderData.payment = null;
        $scope.singleorderData.FromwareHousesData = null;
        $scope.singleorderData.TowareHousesData = null;
        $scope.singleorderData.pickUpDate = null;
        $scope.singleorderData.dropDate = null;
        $scope.singleorderData.Remarks = null;
        $scope.singleorderData.quantityType = null;
        $scope.AwareMsg = false;
        $scope.fileName = "";
        $scope.skuId = null;
        $scope.tableSku = null;

        $mdDialog.hide({
            templateUrl: 'stockTransfer.tmpl.html'});
        
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
        $scope.skuId = null;
        $scope.tableSku = null;
        $mdDialog.hide();
    };

    $scope.cancelWarehouseSelection = function(){
        $mdDialog.hide();
    }

    $scope.openEditAndReorderModal = function (order, screen, ev)
    {
        $scope.singleOrderMode = screen;
        var OutDate,InDate,DropDate=null,PickupDate=null;

        if($scope.genericData.orderDialogMode == 'editdraft' || $scope.genericData.orderDialogMode == 'edit')
        {
            $scope.singleorderData.orderNo = order.tableStockXferOrderClientOrderNo;
            $scope.singleorderData.systemOrderNo = order.tableStockXferOrderSystemOrderNo;
        }

        if(order.tableStockXferOrderPickupDatetime != null && order.tableStockXferOrderPickupDatetime != undefined)
        {
            $scope.singleorderData.pickUpDate = new Date(order.tableStockXferOrderPickupDatetime);
            $scope.sendAddStartDate($scope.singleorderData.pickUpDate);
        }
        else
        {
            $scope.startaddminDate = new Date();
            $scope.singleorderData.pickUpDate = null;
        }

        if(order.tableStockXferOrderDropDatetime != null && order.tableStockXferOrderDropDatetime != undefined)
        {
            $scope.singleorderData.dropDate = new Date(order.tableStockXferOrderDropDatetime);
            $scope.sendAddEndDate($scope.singleorderData.dropDate);
        }
        else
        {
            $scope.endaddminDate = new Date();
            $scope.singleorderData.dropDate = null;

        }

        $scope.singleorderData.Remarks = order.tableStockXferOrderRemarks;
        $scope.singleorderData.FromwareHousesData = order.tableWarehouseDetailsByTableStockXferOrderFromLocation;
        $scope.singleorderData.TowareHousesData = order.tableWarehouseDetailsByTableStockXferOrderToLocation;
        $scope.singleorderData.quantityType = order.tableStockXferOrderQuantityType;
        $scope.singleorderData.tableStockXferOrderRemarkses = order.tableStockXferOrderRemarkses;
        $scope.products = [];
        angular.forEach(order.tableStockXferOrderSkuses, function (data)
        {
            $scope.products.push(data);
        });

        //$('#addOrderModal').modal('show');
        $mdDialog.show({
            templateUrl: 'stockTransfer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

    };

    $scope.initAddOrderModal = function (ev)
    {
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.singleOrderMode = "add";
        $scope.genericData.orderDialogMode = 'addnew';
        $scope.singleorderData.AvailableData = "";
        $scope.singleorderData.pickUpDate = null;
        $scope.singleorderData.dropDate = null;
        $scope.singleorderData = {};
        
        $mdDialog.show({
            templateUrl: 'stockTransfer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    };

    //    ==================================== edit ST ================================= //
    $scope.EditOrder = function (order, ev)
    {
        $scope.genericData.orderDialogMode = 'edit';
        for(var stSkuCounter = 0; stSkuCounter < order.tableStockXferOrderSkuses.length ; stSkuCounter++)
        {
            if(order.tableStockXferOrderSkuses[stSkuCounter].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId == 16)
            {
                $scope.genericData.orderDialogMode = 'editdraft';
            }
        }

        $scope.singleorderData.StID = order.idtableStockXferOrderId;
        $scope.openEditAndReorderModal(order, $scope.genericData.orderDialogMode, ev);

    };

    $scope.EditOrdered = function ()
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval)
        {
            if (retval == true) {
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    return;
                }

                console.log($scope.singleorderData);

                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }

                var postData = {
                    "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                    "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                    "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                    "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tableStockXferOrderDate": null,
                    "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                    "tableStockXferOrderShippingCharges": 0,
                    "tableStockXferOrderShippingTax": 0,
                    "tableStockXferOrderHasParent": null,
                    "tableStockXferOrderHasChildren": null,
                    "tableStockXferOrderPickupDatetime": startDate,
                    "tableStockXferOrderDropDatetime": endDate,
                    "tableStockXferOrderTags": [],
                    "tableStockXferOrderSkuses": $scope.products,
                    "tableStockXferOrder": null,
                    "tableStockXferOrders": []
                };
                console.log(postData);
                $http({
                    method: 'PUT',
                    url: baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/update',
                    data: postData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {

                        $scope.cancelSingleOrder();
                        postData = null;
                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        growl.success("Order updated successfully");
                        $mdDialog.hide({
                            templateUrl: 'stockTransfer.tmpl.html'
                        });
                        console.log($scope.products);
                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);

                    if (status == 400) {
                        $scope.showBackEndStatusMessage(error);
                        return;
                    }
                    growl.error("Failed to update order !!");
                });
            }
        })
    };

    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];
        console.log($scope.orderLists);
        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
            console.log(dayDatacollapse);
        }
    }
//    ================================== table row expnsion ================================= //

    $scope.selectTableRow = function (index, storeId) {

        console.log(index);
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

    $scope.stateTrials = function (saleordskus) {
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
            $scope.StateArray.push(saleordskus[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
            console.log($scope.StateArray);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tableStockXferOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

        }
    }


    $scope.openInfoBox = function (ev, stateTrials) {
        console.log(stateTrials);
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tableStockXferOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tableStockXferOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tableStockXferOrderSkuStateType.tableStockXferOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tableStockXferOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $mdDialog.show({
            templateUrl: 'infoDialogST.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }


    $scope.cancelInfoBox = function () {
        $mdDialog.hide();
    };

    $scope.cancelSaleOrderBox = function (ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $mdDialog.show({
            templateUrl: 'dialog333.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.loadCancelReasons = function () {
        var cancelReasonsUrl = baseUrl + '/omsservices/webapi/stockxfercancelreasons';
        $http.get(cancelReasonsUrl).success(function (data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            //$scope.getPoData();
            console.log($scope.cancelReasonArray);
        }).error(function (error, status) {
            console.log(error);
            console.log(status);

        });
    };

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
                    growl.error("Reason should be less than or equal to 128 characters.")
                }
                else
                {
                    if(remarks == 'other'){
                        //var UserRemarks = otherReasonRemarks;
                        if($scope.LoadNewRason.ReasonCheckBox == true){
                            console.log($scope.LoadNewRason.reasonData);
                            var postDataReason;
                            postDataReason = {
                                "tableStockXferCancelReasonString": $scope.LoadNewRason.reasonData
                            };
                            $http({
                                method: 'POST',
                                url: baseUrl + '/omsservices/webapi/stockxfercancelreasons',
                                data: postDataReason,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function(data){
                                console.log(data);
                                $scope.loadCancelReasons();
                                growl.success('Cancel reason added successfully');
                            }).error(function(data){
                                console.log(data);
                            });
                        }
                    }
                    var cancelUrl = baseUrl + '/omsservices/webapi/stock/transfer/skus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
                    $http.put(cancelUrl).success(function(data) {
                        console.log(data);
                        $mdDialog.hide();
                        if (data) {
                            growl.success("Order cancelled");
                            $scope.listOfStatesCount($scope.defaultTab);
                            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                                $scope.dayDataCollapse[i] = false;
                            }
                        }
                    }).error(function (error, status) {
                        console.log(error);
                        console.log(status);

                        growl.error("Order cannot be cancelled");
                    });
                }
            }
            if (remarks != undefined && remarks!='other') {
                var cancelUrl = baseUrl + '/omsservices/webapi/stock/transfer/skus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
                $http.put(cancelUrl).success(function(data) {
                    console.log(data);
                    $mdDialog.hide();
                    if (data) {
                        growl.success("Order cancelled");
                        $scope.listOfStatesCount($scope.defaultTab);
                        for (var i = 0; i < $scope.orderLists.length; i += 1) {
                            $scope.dayDataCollapse[i] = false;
                        }
                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);

                    growl.error("Order cannot be cancelled");
                });
            }
        }
    }


    $scope.totalCostAmount = function (allSkus) {
        //console.log(allSkus);
        var totalCost = 0;
        var totalCostAmount = 0;
        //var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            for (var j = 0; j < allSkus[i].tableStockXferOrderSkuInventoryMaps.length; j++) {
				var inventoryMap = allSkus[i].tableStockXferOrderSkuInventoryMaps[j];
				var count = 0;
				if(inventoryMap.tableStockXferOrderSkuInventoryMapQuantity == null){
					if(inventoryMap.tableStockXferOrderSkuBadInwardQuantity != null){
						count +=inventoryMap.tableStockXferOrderSkuBadInwardQuantity;
					}
					if(inventoryMap.tableStockXferOrderSkuBadOutwardQuantity != null){
						count += inventoryMap.tableStockXferOrderSkuBadOutwardQuantity;
					}
				}
				else{
					count += inventoryMap.tableStockXferOrderSkuInventoryMapQuantity;
				}
                totalCostAmount += (inventoryMap.tableSkuInventoryByTableStockXferOrderSkuInventoryMapFromInventory.tableSkuInventoryMaxRetailPrice * count);
            }
            //totalCostAll.push(totalCostAmount);
        }
        return parseFloat(totalCostAmount).toFixed(2);
    };

//=============================================== Searching po ========================== //
    var toWareHouse;
    $scope.listOfStatesCount = function (tabsValue, page, action) {

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;

        var newCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=new&uipagename="+$scope.pagename;
        var processCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=process&uipagename="+$scope.pagename;
        var intransitCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=intransit&uipagename="+$scope.pagename;
        var grnCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var draftCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?state=draft&uipagename="+$scope.pagename;
        var allCountUrl = baseUrl + "/omsservices/webapi/stock/transfer/filtercount?uipagename="+$scope.pagename;

        if ($scope.filterObj.fromWarehouse != undefined || $scope.filterObj.fromWarehouse != null) {


            newCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            processCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            intransitCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            grnCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            cancelledCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            allCountUrl += "fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
            draftCountUrl += "&fromwarehouseid=" + $scope.filterObj.fromWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.skuId) {
            newCountUrl += "&skuid=" + $scope.skuId;
            processCountUrl += "&skuid=" + $scope.skuId;
            intransitCountUrl += "&skuid=" + $scope.skuId;
            grnCountUrl += "&skuid=" + $scope.skuId;
            cancelledCountUrl += "&skuid=" + $scope.skuId;
            allCountUrl += "&skuid=" + $scope.skuId;
            draftCountUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.filterObj.toWarehouse) {
            newCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            processCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            intransitCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            grnCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            cancelledCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            allCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
            draftCountUrl += "&towarehouseid=" + $scope.filterObj.toWarehouse.idtableWarehouseDetailsId;
        }
        if ($scope.filterObj.systemOrderNo) {
            newCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            processCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            intransitCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            grnCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            cancelledCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            allCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
            draftCountUrl += "&orderid=" + $scope.filterObj.systemOrderNo;
        }
        if ($scope.filterObj.stRefNo) {
            newCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            processCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            intransitCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            grnCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            cancelledCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            allCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
            draftCountUrl += "&clientorderid=" + $scope.filterObj.stRefNo;
        }
        if ($scope.filterObj.startDate) {
            newCountUrl += "&startdate=" + $scope.filterObj.startDate;
            processCountUrl += "&startdate=" + $scope.filterObj.startDate;
            intransitCountUrl += "&startdate=" + $scope.filterObj.startDate;
            grnCountUrl += "&startdate=" + $scope.filterObj.startDate;
            cancelledCountUrl += "&startdate=" + $scope.filterObj.startDate;
            allCountUrl += "&startdate=" + $scope.filterObj.startDate;
            draftCountUrl += "&startDate=" + $scope.filterObj.startDate;
        }
        if ($scope.filterObj.endDate) {
            newCountUrl += "&enddate=" + $scope.filterObj.endDate;
            processCountUrl += "&enddate=" + $scope.filterObj.endDate;
            intransitCountUrl += "&enddate=" + $scope.filterObj.endDate;
            grnCountUrl += "&enddate=" + $scope.filterObj.endDate;
            cancelledCountUrl += "&enddate=" + $scope.filterObj.endDate;
            allCountUrl += "&enddate=" + $scope.filterObj.endDate;
            draftCountUrl += "&endDate=" + $scope.filterObj.endDate;
        }

        $http.get(allCountUrl).success(function (data) {
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }


                vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                console.log(vm.pager);
                $scope.vmPager = vm.pager;

                $scope.start = (vm.pager.currentPage - 1) * 5;
                $scope.orderSize = $scope.start + 5;

                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;

                if (action == 'clearAction') {
                    $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.listOfOrders(tabsValue, $scope.start);
                }
            }
            if (data != null) {
                if(data == null){
                    $scope.allCount = 0;
                }else{
                    $scope.allCount = data;
                }

                if (tabsValue == 'all') {
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

        $http.get(newCountUrl).success(function (data) {
            function setPage(page) {
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
                    $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.listOfOrders(tabsValue, $scope.start);
                }
            }
            if (data != null) {
                if(data == null){
                    $scope.newCount = 0;
                }else{
                    $scope.newCount = data;
                }

                if (tabsValue == 'new') {
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


        $http.get(processCountUrl).success(function (data) {
            console.log(tabsValue);
            function setPage(page) {
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
                    $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                } else {
                    $scope.listOfOrders(tabsValue, $scope.start);
                }
            }
            if (data != null) {
                if(data == null){
                    $scope.processCount = 0;
                }else{
                    $scope.processCount = data;
                }

                if (tabsValue == 'process') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.processCount); // dummy array of items to be paged
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
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        console.log(tabsValue);
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }
                }
            }
        });

        $http.get(intransitCountUrl).success(function (data) {
            if (data != null) {

                if(data == null){
                    $scope.intransitCount = 0;
                }else{
                    $scope.intransitCount = data;
                }

                if (tabsValue == 'intransit') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.intransitCount); // dummy array of items to be paged
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
                        $scope.orderSize = $scope.start + 5;
                        console.log($scope.start);
                        console.log($scope.orderSize);
                        // get current page of items
                        //vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        //$scope.vmItems = vm.items;
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }
                }
            }
        });

        $http.get(grnCountUrl).success(function (data) {
            if(data == null){
                $scope.grnCount = 0;
            }else{
                $scope.grnCount = data;
            }

            if (tabsValue == 'grn') {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.grnCount); // dummy array of items to be paged
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
            }
        });

        $http.get(cancelledCountUrl).success(function (data) {
            //$cookies.remove('Dashdata');
            if (data != null) {
                if(data == null){
                    $scope.cancelledCount = 0;
                }else{
                    $scope.cancelledCount = data;
                }

                if (tabsValue == 'cancelled') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.cancelledCount); // dummy array of items to be paged
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
                }
            }
        });
        $http.get(draftCountUrl).success(function (data) {
            //$cookies.remove('Dashdata');
            if (data != null) {
                if(data == null){
                    $scope.DraftCount = 0;
                }else{
                    $scope.DraftCount = data;
                }

                if (tabsValue == 'draft') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.DraftCount); // dummy array of items to be paged
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
                }
            }
        });

    };


    //=========================================== Print Labels ====================================== //

    $scope.printLabel = function(value){
        console.log(value);
       $scope.previewTemp = baseUrl+'/omsservices/webapi/skus/'+value.tableSku.idtableSkuId+'/printskubarcode';
        window.open($scope.previewTemp);
        $http.get($scope.previewTemp, {
            responseType: 'arraybuffer'
        }).success(function(response) {
                console.log(response);
                var file = new Blob([(response)], {
                    type: 'application/pdf'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
        }).error(function(data){
                console.log(data);
        });
    };

    //========================================== Ends Here ======================================== //


    $scope.Drafted = function ()
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else {

                if ($scope.validateFormData() == false) {
                    return;
                }
                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }

                var StoPost = {
                    "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                    "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                    "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                    "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tableStockXferOrderDate": null,
                    "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                    "tableStockXferOrderShippingCharges": 0,
                    "tableStockXferOrderShippingTax": 0,
                    "tableStockXferOrderHasParent": null,
                    "tableStockXferOrderHasChildren": null,
                    "tableStockXferOrderPickupDatetime": startDate,
                    "tableStockXferOrderDropDatetime": endDate,
                    "tableStockXferOrderTags": [],
                    "tableStockXferOrderSkuses": $scope.products,
                    "tableStockXferOrder": null,
                    "tableStockXferOrders": []
                };
                var PostDataUrl, requestMethod, successMessage, failedMessage;
                if ($scope.genericData.orderDialogMode == 'editdraft') {
                    successMessage = 'Draft updated successfully';
                    failedMessage = 'Failed to update draft';
                    PostDataUrl = baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/editdraft';
                    requestMethod = 'PUT';
                }
                if ($scope.genericData.orderDialogMode == 'addnew') {
                    successMessage = 'Draft created successfully';
                    failedMessage = 'Failed to create draft';
                    PostDataUrl = baseUrl + '/omsservices/webapi/stock/transfer/draft';
                    requestMethod = 'POST';
                }
                $http({
                    method: requestMethod,
                    url: PostDataUrl,
                    data: StoPost,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    if (res) {
                        $scope.cancelSingleOrder();
                        postData = null;
                        $scope.listOfStatesCount($scope.defaultTab);
                        growl.success(successMessage);
                        $mdDialog.hide();
                    }
                }).error(function (error, status) {
                    if (status == 400) {
                        $scope.showBackEndStatusMessage(error);
                    }
                    else {
                        growl.error(failedMessage);
                    }
                });
            }
        })
    };

    //================== DeleteDraft order ==================== //

    $scope.DeleteDraft = function(data)
    {
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/stock/transfer/' + data.idtableStockXferOrderId + '/deletedraft'
        }).success(function (data)
        {
            $scope.listOfStatesCount($scope.defaultTab);

        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
            }
            else
            {
                growl.error('Failed to delete draft');
            }
        });
    };

    $scope.SendDraft = function()
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else
            {
                if ($scope.validateFormData() == false) {
                    return;
                }
                var startDate, endDate;

                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    startDate = null;
                }
                else {
                    startDate = moment.utc($scope.singleorderData.pickUpDate).format();
                }

                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    endDate = null;
                }
                else {
                    endDate = moment.utc($scope.singleorderData.dropDate).format();
                }
                var StartOrderDate = moment(startDate);
                var EndOrderDate = moment(endDate);
                var CurrentOrderDate = moment().subtract(1, 'days');

                if (CurrentOrderDate > StartOrderDate) {
                    growl.error("Order date can't be older than today. ");
                }
                else {
                    var StoPost = {
                        "tableWarehouseDetailsByTableStockXferOrderFromLocation": $scope.singleorderData.FromwareHousesData,
                        "tableWarehouseDetailsByTableStockXferOrderToLocation": $scope.singleorderData.TowareHousesData,
                        "tableStockXferOrderQuantityType": $scope.singleorderData.quantityType,
                        "tableStockXferOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tableStockXferOrderDate": null,
                        "tableStockXferOrderRemarks": $scope.singleorderData.Remarks,
                        "tableStockXferOrderShippingCharges": 0,
                        "tableStockXferOrderShippingTax": 0,
                        "tableStockXferOrderHasParent": null,
                        "tableStockXferOrderHasChildren": null,
                        "tableStockXferOrderPickupDatetime": startDate,
                        "tableStockXferOrderDropDatetime": endDate,
                        "tableStockXferOrderTags": [],
                        "tableStockXferOrderSkuses": $scope.products,

                        "tableStockXferOrder": null,
                        "tableStockXferOrders": []
                    };
                    $http({
                        method: 'POST',
                        url: baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.singleorderData.StID + '/confirmdraft',
                        data: StoPost,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        console.log(res);
                        if (res) {

                            $scope.cancelSingleOrder();
                            StoPost = null;
                            $scope.listOfStatesCount($scope.defaultTab);
                            growl.success("Order Added Successfully");
                            $mdDialog.hide({
                                templateUrl: 'stockTransfer.tmpl.html'
                            });
                            console.log($scope.products);
                        }
                    }).error(function (error, status) {
                        if (status == 400) {
                            $scope.showBackEndStatusMessage(error);
                            return;
                        }
                        growl.error("Failed to confirm draft");
                    });
                }
            }
        })
    }

//    ============================================== ADd GRN ====================================== //

    $scope.quickGRNSkuDetails = {};
    
    $scope.getDateFormat = function (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + "-" + monthIndex + "-"+year;
    }

    $scope.showGRNDialog = function (ev, orderSkusList)
    {
        $scope.disableSubmitGrn = false;
        $scope.quickGRNSkuDetails.tableSkuInventoryRecords = [];
        console.log(orderSkusList);
        $scope.quickGRNSkuDetails.GRnData = orderSkusList;

        for(var orderSkuCounter = 0; orderSkuCounter < orderSkusList.length ; orderSkuCounter++)
        {
            var orderSku;
            orderSku = orderSkusList[orderSkuCounter];
            $scope.SkuDisabled = true;
            for(var skuInventoryRecordsCount = 0; skuInventoryRecordsCount < orderSku.tableStockXferOrderSkuInventoryMaps.length; skuInventoryRecordsCount++)
            {
                orderSku.tableStockXferOrderSkuInventoryMaps[skuInventoryRecordsCount].tableSku = orderSku.tableSku;

            }
            if($scope.quickGRNSkuDetails.tableSkuInventoryRecords == null || $scope.quickGRNSkuDetails.tableSkuInventoryRecords == undefined )
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = orderSku.tableStockXferOrderSkuInventoryMaps;
            }
            else
            {
                $scope.quickGRNSkuDetails.tableSkuInventoryRecords = $scope.quickGRNSkuDetails.tableSkuInventoryRecords.concat(orderSku.tableStockXferOrderSkuInventoryMaps);
            }
        }
        $mdDialog.show({
            templateUrl: 'STinGRNdata.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })

    };

    $scope.cancelQuickGRN = function(){

        $mdDialog.hide();
        $scope.quickGRNSkuDetails = {};
    }

    $scope.postGRN = function(orderskuid, grndata)
    {
        var deferred = $q.defer();

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/stock/transfer/skus/' + orderskuid + '/quickgrn',
            data: grndata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            console.log(data);
            growl.success('Quick GRN successful');
            $scope.listOfStatesCount($scope.defaultTab);

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse[i] = false;
            }

            deferred.resolve(data);
            $mdDialog.hide({
                templateUrl: 'STinGRNdata.tmpl.html'
            });
        }).error(function (data)
        {
            $scope.disableSubmitGrn = false;
            console.log(data);
            if (status == 400) {
                $scope.showBackEndStatusMessage(error);
                return;
            }

            growl.error('Quick GRN failed');
            $mdDialog.hide({
                templateUrl: 'STinGRNdata.tmpl.html'
            });

        });

        return deferred.promise;
    }

    $scope.SubmitGrn = function (data)
    {
        $scope.disableSubmitGrn = true;
        console.log(data);

        for(var inventoryMapCounter = 0; inventoryMapCounter < data.length;inventoryMapCounter++)
        {
            if(data[inventoryMapCounter].tableSkuInventoryByTableStockXferOrderSkuInventoryMapToInventory.tableSkuInventoryActualInwardCount == null)
            {
                growl.error('Enter a valid value in Actual quantity');
                $scope.disableSubmitGrn = false;
                return;
            }
        }
        for(var orderSKUCounter = 0; orderSKUCounter < $scope.quickGRNSkuDetails.GRnData.length;orderSKUCounter++)
        {
            var skuInventoryMap = [];
            for(var inventoryMapCounter = 0; inventoryMapCounter < data.length; inventoryMapCounter++)
            {
                if(data[inventoryMapCounter].tableSku != null && data[inventoryMapCounter].tableSku != undefined) {
                    if ($scope.quickGRNSkuDetails.GRnData[orderSKUCounter].tableSku.idtableSkuId == data[inventoryMapCounter].tableSku.idtableSkuId) {
                        delete(data[inventoryMapCounter]["tableSku"]);
                        skuInventoryMap.push(data[inventoryMapCounter]);
                    }
                }
            }
            var Postdata = skuInventoryMap;
            $scope.postGRN($scope.quickGRNSkuDetails.GRnData[orderSKUCounter].idtableStockXferOrderSkusId, skuInventoryMap)

        }
    };

    $scope.checkEditButton = function (Stdata)
    {
        var v = true;
        angular.forEach(Stdata.tableStockXferOrderSkuses, function (item) {
            var value = item.tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId;
            if (value != 1 && value != 2 && value != 3 && value != 4 && value != 5 && value != 6 && value != 7) {
                v = false;
            }
        });
        return v;
    };

    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();

    $scope.clearStartDate = function() {
        $scope.filterObj.startDate = "";
        $scope.filterObj.start1Date = null;
        if($scope.filterObj.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.filterObj.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function() {
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

    $scope.sendStartDate = function(date) {
        console.log(date);
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    //================= for adding startDate in add dialog ======================= //


    $scope.sendEndDate = function(date)
    {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());

    }

    $scope.startaddminDate = new Date();
    $scope.endaddminDate = new Date();

    $scope.sendAddStartDate = function(date) {
        console.log(date);
        $scope.startDateData = new Date(date);
        $scope.endaddminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());

        $scope.endaddmaxDate = "";
    }

    //================= for adding startDate in add dialog ======================= //


    $scope.sendAddEndDate = function(date)
    {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startaddmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
        $scope.startaddminDate = new Date();
    }



    //    ======================================= quick ship ================================== //

    $scope.Packing = {};
    $scope.Packing.containerQuantity = [];
    $scope.tableSalesOrderSkuQuantityDetails = [];
    $scope.quickShipData = function (data)
    {
        $('#QuickShipDialog').modal('show');
        $scope.quickShipDataTable = data.tableStockXferOrderSkuses;
        $scope.quickShipDataTable.orderID = data.idtableStockXferOrderId;
    };
    $scope.quickShipDataDialog = function (ev,data)
    {
        $scope.disableQuickShip = false;
        $scope.blurred = true;
        $mdDialog.show({
            templateUrl: 'SToutQS.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
        $scope.quickShipDataTable = data.tableStockXferOrderSkuses;
        $scope.quickShipDataTable.orderID = data.idtableStockXferOrderId;
    };

    $scope.validateAlphaNum = function (val)
    {

        var letterNumber = /^[0-9a-zA-Z]+$/;
        if(val.match(letterNumber))
        {
        }
        else
        {
            growl.error("Only alphabets and numbers are allowed");
            return false;
        }
    }

    $scope.validateAlpha = function (val) {

        var letters = /^[A-Za-z ]+$/;
        if(val.match(letters))
        {
        }
        else
        {
            growl.error("Only alphabets are allowed");
            return false;
        }
    }

    $scope.validateNumber = function (val)
    {
        if(isNaN(val)){
            growl.error("Only numbers are allowed");
            return false;
        }
    }
    
    $scope.ShippingDetailsBtn = function (value)
    {
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

        }
        else if (value.SkuType == 'Parcel')
        {
            if (value.tableSaleOrderShippingDetailsMasterAwb == '' || value.tableSaleOrderShippingDetailsMasterAwb == undefined)

            {
                growl.error('AWB number is required.');
                return false;
            }
        }
    };


    $scope.SelectVehicleType = function ()
    {
        var vehicletypeUrl = baseUrl + '/omsservices/webapi/vehicletypes';
        $http.get(vehicletypeUrl).success(function (data) {
            $scope.SKUvehicleType = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
            growl.error("Failed to get vehicle types");
        });
    };
    $scope.SelectVehicleType();

    $scope.sum = function (items, prop) {
        console.log(items);
        return items.reduce(function (a, b) {
            return parseInt(a) + parseInt(b[prop]);
        }, 0);
    };


    $scope.PackingContainerNumber = function (value, dimensions, shippedDetails) {

        if(dimensions.Length == null || dimensions.Length == undefined)
        {
            growl.error('Enter length');
            return;
        }

        if(dimensions.Breadth == null || dimensions.Breadth == undefined)
        {
            growl.error('Enter breadth');
            return;
        }

        if(dimensions.Height == null || dimensions.Height == undefined)
        {
            growl.error('Enter height');
            return;
        }

        if(dimensions.LengthUnit == null || dimensions.LengthUnit == undefined)
        {
            growl.error('Enter dimension unit');
            return;
        }

        if(dimensions.Weight == null || dimensions.Weight == undefined)
        {
            growl.error('Enter weight');
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

        console.log('array value:', value);
        console.log('array value:', shippedDetails);
        console.log('dimensions:', dimensions);
		
		
		
	var quantity = 0;
	angular.forEach(value,function(source){
	    if(source.tableSkusSkuQuantity)
        {
            quantity += source.tableSkusSkuQuantity;
            source.tableSaleOrderShippingDetailsShippingAwb = $scope.shipping.awbnumber;
        }
        else
        {
            source.tableSkusSkuQuantity = 0;
        }
	});

	if(quantity == 0){
		growl.error('Enter Quantity');
    		return;
	}

        dimensions.tableSaleOrderSkus = value;
        dimensions.SKUcarrierDetails = shippedDetails;
        dimensions.SalesorderID = value.orderID;

        $scope.tableSalesOrderSkuQuantityDetails.push(angular.copy(dimensions));

        angular.forEach($scope.quickShipDataTable, function (res) {
            res.tableSaleOrderShippingDetailsShippingAwb = null;
            res.tableSkusSkuQuantity = null;
        });
        $scope.shipping = {};
        console.log($scope.tableSalesOrderSkuQuantityDetails);
        angular.forEach($scope.tableSalesOrderSkuQuantityDetails, function (source) {
            $scope.TotalInputQuantity = $scope.sum(source.tableSaleOrderSkus, 'tableSkusSkuQuantity');
        });
        console.log(typeof $scope.TotalInputQuantity);
        console.log($scope.TotalInputQuantity);
    };

    $scope.LengthMeasureUnitDropDown = function () {
        var UnitUrl = baseUrl + '/omsservices/webapi/skuuodmtypes';
        var WeightUnitUrl = baseUrl + '/omsservices/webapi/skuuowmtypes';
        $http.get(UnitUrl).success(function (data) {
            console.log(data);
            $scope.lengthUnitDropdown = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
            growl.error("Failed to dimensions");
        });
        $http.get(WeightUnitUrl).success(function (data) {
            console.log(data);
            $scope.weightUnitDropdown = data;
        }).error(function (error, status)
        {
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
            growl.error("Failed to get weight units");
        });
    };

    $scope.LengthMeasureUnitDropDown();
    var StockOrderSkuID;
    $scope.AddPacckingDetails = function (data)
    {
        $scope.disableQuickShip = true;
        $scope.boxSequenceNo = 1;
        var QuickShipTable = [];

        var SKUDto, SKuQuanity, newSkupackingData;
        if($scope.tableSalesOrderSkuQuantityDetails == "")
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
                StockOrderSkuID = value.SalesorderID;
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
                            'tableStockXferOrderSkus': SKUDto,
                            'skuQuantity': SKuQuanity,
                            'tableStockXferOrderPackingDetails': {
                                'tableStockXferOrderPackingDetailsLength': value.Length,
                                'tableStockXferOrderPackingDetailsWidth': value.Breadth,
                                'tableStockXferOrderPackingDetailsHeight': value.Height,
                                'tableStockXferOrderPackingDetailsWeight': value.Weight,
                                "tableSkuUodmType": value.LengthUnit,
                                "tableSkuUowmType": value.WeightUnit,
                                "tablePackingType": null,
                                "tableStockXferOrderShippingDetails": {
                                    "tableStockXferOrderShippingDetailsMasterAwb": SKUcarrierValue,
                                    "tableStockXferOrderShippingDetailsShippingAwb": response.tableSaleOrderShippingDetailsShippingAwb,
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
                url: baseUrl + '/omsservices/webapi/stock/transfer/' + StockOrderSkuID + '/packinginfo',
                data: QuickShipTable,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {

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

                console.log(data);
                growl.success("Quick ship successful");
                $mdDialog.hide();
                $scope.disableQuickShipBox = [];
                $scope.editQuickShipBoxHideAndShow = [];
	    	    $scope.cancelSingleOrders();
                $scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = "";
                $scope.listOfStatesCount($scope.defaultTab);
            }).error(function (error, status)
            {
                $scope.disableQuickShip = false;
                if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }
                growl.error("Quick Ship failed");
            });
        }

    };

    $scope.blurred = true;
    $scope.skuPackingDisable = function (shippingDetails)
    {
        if($scope.ShippingDetailsBtn(shippingDetails)==false)
        {
            return;
        }
        $scope.blurred = false;
    };

    $scope.RemoveContainerPackage = function (index) {
        console.log(index);
        $scope.disableQuickShipBox[index] = false;
        $scope.editQuickShipBoxHideAndShow[index] = false;
        $scope.tableSalesOrderSkuQuantityDetails.splice(index, 1);
        console.log($scope.tableSalesOrderSkuQuantityDetails);
    };

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

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tableStockXferOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }
	
	$scope.shippingDetails = {};
	$scope.resetAllQuickShipFields = function () {
		$scope.shippingDetails.VehicleType = null;
		$scope.shippingDetails.DriverName = null;
		$scope.shippingDetails.DriverNumber = null;
		$scope.shippingDetails.VehicleNumber = null;
		$scope.shippingDetails.tableSaleOrderShippingDetailsMasterAwb = null;
        
    }
	//Updated By UV
	$scope.masterSkuDialog = function(ev, check){		
		
		$scope.genericData.check = check;
		if(check == true){			
			$mdDialog.hide({
	            templateUrl: 'stockTransfer.tmpl.html'
	        });
		}		
		
		mastersService.fetchOnlySkus(baseUrl).then(function(data){
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
	}
	
	$scope.cancelmastersDialog = function(ev){
		$mdDialog.hide({
            templateUrl: 'dialogmastersku.tmpl.html'
        });
		
		if($scope.genericData.check == true){
			$mdDialog.show({
	            templateUrl: 'stockTransfer.tmpl.html',
	            parent: angular.element(document.body),
	            targetEvent: ev,
	            clickOutsideToClose: false,
	            scope: $scope.$new()
	        });	
		}		
	}
	
	$scope.selectSku = function(id, ev){
		
		 $http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
         console.log(data);
		 $scope.skuId = data.idtableSkuId;      
		 $scope.tableSku = data;
		 if($scope.genericData.check == true){
		 $scope.getPriceOfProduct();}
		 if($scope.genericData.check == true){
			 $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		 }else{
			 $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
		 }
        }).error(function (error, status)
         {
             if(status == 400)
             {
                 $scope.showBackEndStatusMessage(error);
                 return;
             }
             growl.error("Failed to get skus");
         });
		
		$scope.cancelmastersDialog(ev);		
	}

	$scope.shipAll = function(){
        if($scope.shipping.shipallchecked){
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = response.tableStockXferOrderSkusSkuQuantity;
            })
        }
        else{
            angular.forEach($scope.quickShipDataTable, function (response)
            {
                response.tableSkusSkuQuantity = undefined;
            })
        }
    }

    $scope.splitOrderBySkuDialog = function(ev, data, orderid){
        $scope.skusListForOrderSplit = data;
        $scope.genericData.orderId = orderid;

        $mdDialog.show({
            templateUrl: 'splitStockTransferSku.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

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

    $scope.genericData.splitCost = false;

    $scope.splitOrderBySkuByQuantityDialog = function(ev, data, orderid,skuquantity){
        $scope.genericData.skuid = data;
        $scope.genericData.orderId = orderid;
        $scope.genericData.skuquantity =skuquantity;

        $mdDialog.show({
            templateUrl: 'splitStockTransferbyquantity.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })

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
            url: baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.genericData.orderId +'/splitorder?splitCost='+$scope.genericData.splitCost,
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
            url: baseUrl + '/omsservices/webapi/stock/transfer/' + $scope.genericData.orderId +'/splitxferorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity+'&splitCost='+$scope.genericData.splitCost,

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

    $scope.orderLevelActionRow = function(data){

        $scope.genericData.skuArray = data;

        var SplitOrderButton = $scope.getSplitLabelButton();
        if(SplitOrderButton == true){
            return true;
        }else{
            return false;
        }

    };
    $scope.genericData.skuArray = [];
    $scope.getSplitLabelButton = function(){
        var b = true;

        if($scope.genericData.skuArray.length == 1){
            b = false;
        }

        var check = 0;
        for(var i = 0; i < $scope.genericData.skuArray.length ; i++){
            if($scope.genericData.skuArray[i].tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId > 7){
                check++;
            }
        }

        if(check == $scope.genericData.skuArray.length){
            return false;
        }

        return b;
    };

    $scope.getSplitLabelButtonForQuantity = function(sku){
        var b = true;
        //alert("Value is :"+ data.tableSalesChannelMetaInfo);

        if(sku.tableStockXferOrderSkuStateType.idtableStockXferOrderSkuStateTypeId > 7){
            return false;
        }

        if(sku.tableStockXferOrderSkusSkuQuantity < 2){
            return false;
        }

        return b;
    };

}
