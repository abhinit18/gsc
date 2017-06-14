myApp.controller('poController', poController);

poController.$inject = ['$rootScope','$scope', '$http', '$location', '$filter', 'baseUrl', '$mdDialog', '$mdMedia', 'growl','$sce', '$window', 'downloadPOTemplateUrl', 'Upload','PagerService', '$q' , '$cookies','$timeout' , 'mastersService'];

function poController($rootScope, $scope, $http, $location, $filter, baseUrl, $mdDialog, $mdMedia, growl,$sce, $window, downloadPOTemplateUrl, Upload,PagerService, $q, $cookies,$timeout, mastersService) {

    $scope.genericData = {};
    $scope.baseSkuUrl = baseUrl + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/vendors/search?search=';
    $scope.genericData.skuSelectedArray = [];
    $scope.vendorSkus = [];
    $scope.ClientOrderNo = "";
    $scope.systemOrderNo = "";
    $scope.grnInventory = {};
    $scope.products = [];
    $scope.start = 0;
    $scope.singleOrderTab = true;
    $scope.singleOrderMode = "add";
    $scope.bulkOrderTab = false;
    $scope.downloadPurchaseOrderTemplateUrl = baseUrl+"/omsservices/webapi/purchase/order/bulkuploadtemplate";
    $scope.bulkOrderSettingData = "";
    $scope.orderSize = 5;
    $scope.defaultTab = 'all';
    $scope.isSubmitDisabled = true;
    $scope.isResetFilter = true;
    $scope.baseCustomerUrl = baseUrl + '/omsservices/webapi/vendors/search?search=';
	
	$scope.sortType = "tablePurchaseOrderSystemOrderNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.totalGross = 0.00;
    $scope.totalDiscount = 0.00;
    $scope.totalNet = 0.00;
    $scope.totalTax = 0.00;

    $scope.isvendor = localStorage.getItem("isvendor");
	
    $scope.callDisabled = function(){
        $scope.isSubmitDisabled = false;
        $scope.isResetFilter = false;
    }

    var currentUrl,UrlName;
    currentUrl = window.location.href;
    UrlName = currentUrl.search('po');
    console.log(UrlName);
    if(UrlName == -1){
        $scope.defaultTab = "new";
    }else{
        $scope.defaultTab = "all";
    }


    $scope.onPageInitialize =  function () {
        if($cookies.get('orderid') != null){
            $scope.systemOrderNo = $cookies.get('orderid');
            $cookies.remove('orderid')
        }

        //$scope.getPoData();
        $scope.listOfStatesCount($scope.defaultTab);
        $scope.listOfWareHouses();
        $scope.listOfVendors();
        $scope.listOfPayments();
        $scope.listOfShippingOwners();
        $scope.listOfShippingCarriers();
	$scope.getItemLevelAdditionalGrossTypes();
	$scope.getInvoiceLevelAdditionalGrossTypes();
    }



    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";


    //-============================ download po template =================== //


    $scope.downloadPOtemplate = function(){
        $http({
            method: 'GET',
            url: $scope.downloadPurchaseOrderTemplateUrl,
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
            a.download = "Glaucus_PO_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
    };

    // getting all list of orders (all the orders)
    $scope.listOfOrders = function(tabsValue, start, action)
    {
        if (tabsValue == 'draft')
        {
            $scope.DeleteAndConfimData = true;
            $scope.singleOrderMode = 'editdraft';
        }
        else
        {
            $scope.DeleteAndConfimData = false;
            $scope.singleOrderMode = 'edit';
        }
        console.log(tabsValue);
        console.log(start);
        console.log($scope.channel);
        console.log($scope.singleorderData.skuId);
        console.log($scope.vendorId);
        console.log($scope.startDate);
        console.log($scope.endDate)
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

        if (tabsValue == 'inprocess') {
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
            $scope.tabsColor = {}
            $scope.tabsColor1 = {}
            $scope.tabsColor2 = {}
            $scope.tabsColor3 = {}
            $scope.tabsColor4 = {}
            $scope.tabsColor5 = {}
            $scope.tabsColor7 = {}
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

        var orderListUrl = baseUrl + "/omsservices/webapi/purchase/order";

        if ($scope.defaultTab == 'all')
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType;

        if ($scope.defaultTab != 'all')
            //orderListUrl += "?&state=" +  tabsValue;
            orderListUrl += "?start=" + start + "&size=5&sort=" + $scope.sortType + "&direction=" + $scope.directionType+"&state=" + tabsValue;

        orderListUrl += "&uipagename="+$scope.pagename;

        if ($scope.singleorderData.skuId) {
            orderListUrl += "&skuid=" + $scope.singleorderData.skuId;
        }
        if ($scope.vendorId) {
            orderListUrl += "&vendorid=" + $scope.vendorId;
        }
        if ($scope.ClientOrderNo) {
            orderListUrl += "&clientorderid=" + $scope.ClientOrderNo;
        }
        if ($scope.systemOrderNo) {
            orderListUrl += "&orderid=" + $scope.systemOrderNo;
        }
        if ($scope.channel) {
            orderListUrl += "&warehouseid=" + $scope.channel;
        }
        if ($scope.startDate) {
            orderListUrl += "&startdate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            orderListUrl += "&enddate=" + $scope.endDate;
        }
        console.log("ORDER LIST URL");
        console.log(orderListUrl);
        $http.get(orderListUrl).success(function(data) {
            console.log(data);
            $scope.orderLists = data;
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        }).error(function(error, status) {
            console.log(status);

        });
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

    //======================================= Drafting Orders ================================= //

    //check Order Number
    $scope.checkOrderNumber = function(orderNo,systemOrderNo)
    {
        var q = $q.defer();
        if(orderNo == undefined || orderNo == "" || orderNo == null){
            q.resolve(false);
        }
        else
        {
            var checkOrderNo = baseUrl + "/omsservices/webapi/purchase/order/clientordernumber?clientordernumber=" + orderNo;
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

    $scope.Drafted = function ()
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else {

                if ($scope.validateFormData() == false) {
                    return;
                }

                console.log($scope.singleorderData);
                console.log($scope.products);

                var purchaseOrderPost = {
                    "tablePurchaseOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tablePurchaseOrderRemarks": null,
                    "tablePurchaseOrderShippingCharges": 0,
                    "tablePurchaseOrderShippingTax": 0,
                    "tablePurchaseOrderHasParent": null,
                    "tablePurchaseOrderHasChildren": null,
                    "tablePurchaseOrderPickupDate": $scope.singleorderData.pickUpDate,
                    "tablePurchaseOrderDropDate": $scope.singleorderData.dropDate,
                    "tablePurchaseOrderSkuses": $scope.products,
                    "tablePurchaseOrderTags": [],
                    "tableAddress": $scope.singleorderData.pickupAddressName,
                    "tableCurrencyCode": {
                        "idtableCurrencyCodeId": 1,
                        "tableCurrencyCodeShortname": "INR",
                        "tableCurrencyCodeLongname": "Indian Rupee"
                    },
                    "tablePurchaseOrderPaymentType": $scope.singleorderData.payment,
                    "tableShippingCarrierServices": $scope.singleorderData.shipService,
                    "tableShippingOwnership": $scope.singleorderData.shipOwner,
                    "tableVendor": $scope.singleorderData.vendorData,
                    "tablePurchaseOrderRemarks": $scope.singleorderData.tablePurchaseOrderRemarks,
                    "tableWarehouseDetails": $scope.singleorderData.wareHouses
                };
                console.log(purchaseOrderPost);
                var PostDataUrl, requestedMethod;
                if ($scope.singleOrderMode == 'editdraft') {
                    PostDataUrl = baseUrl + '/omsservices/webapi/purchase/order/' + $scope.DraftOrderID.OrderId + '/editdraft';
                    requestedMethod = 'PUT';
                }
                else {
                    PostDataUrl = baseUrl + '/omsservices/webapi/purchase/order/draft';
                    requestedMethod = 'POST';
                }
                $http({
                    method: requestedMethod,
                    url: PostDataUrl,
                    data: purchaseOrderPost,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {

                        $scope.cancelSingleOrder();
                        purchaseOrderPost = null;
                        $scope.listOfStatesCount($scope.defaultTab);
                        if ($scope.singleOrderMode == 'add') {
                            growl.success("Draft created successfully");
                        }
                        if ($scope.singleOrderMode == 'editdraft') {
                            growl.success("Draft updated successfully");
                        }
                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        if ($scope.singleOrderMode == 'editdraft') {
                            growl.error("Failed to update draft");
                        }
                        if ($scope.singleOrderMode == 'add') {
                            growl.error("Failed to add draft");
                        }
                    }

                });
            }
        })

    };

    $scope.vendorskus = false;

    $scope.initAddOrderModal = function (ev)
    {
        $scope.vendorskus = true;
        $scope.singleOrderTab = true;
        $scope.bulkOrderTab = false;
        $scope.singleOrderMode = "add";
        $scope.initDateLimits();
        $scope.singleorderData = {};

        $mdDialog.show({
            templateUrl: 'addPodialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
        
    }

    $scope.DeleteDraft = function(data){
        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/purchase/order/' + data.idtablePurchaseOrderId + '/deletedraft'
        }).success(function (data) {
            console.log(data);
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function (data) {
            console.log(data);
        });
    };


    $scope.DraftOrderID = {};
    $scope.editDraft = function(order){
        $scope.singleOrderMode = 'editdraft';
        $scope.openEditAndReorderModal(order,"editdraft");
        $scope.DraftOrderID.OrderId = order.idtablePurchaseOrderId;

    };




    $scope.SendDraft = function(){

        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else {
                if ($scope.validateFormData() == false) {
                    return;
                }

                var timeValue1, StartOrderDate, timeValue2, EndOrderDate;


                if ($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined) {
                    StartOrderDate = null;
                    timeValue1 = null;
                }
                else {
                    timeValue1 = moment.utc($scope.singleorderData.pickUpDate).format();
                    StartOrderDate = moment(timeValue1);
                }
                if ($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined) {
                    timeValue2 = null;
                    EndOrderDate = null;
                }
                else {
                    timeValue2 = moment.utc($scope.singleorderData.dropDate).format();
                    EndOrderDate = moment(timeValue2);
                }

                console.log($scope.singleorderData);
                console.log($scope.products);

                var CurrentOrderDate = moment().utc();
                CurrentOrderDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
                if ($scope.products.length == 0) {
                    growl.error('Select a product and quantity to be ordered');
                }
                else if (CurrentOrderDate > StartOrderDate) {
                    growl.error("Pickup date can't be an older date");
                }
                else {
                    var purchaseOrderPost = {
                        "tablePurchaseOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tablePurchaseOrderRemarks": null,
                        "tablePurchaseOrderShippingCharges": 0,
                        "tablePurchaseOrderShippingTax": 0,
                        "tablePurchaseOrderHasParent": null,
                        "tablePurchaseOrderHasChildren": null,
                        "tablePurchaseOrderPickupDate": timeValue1,
                        "tablePurchaseOrderDropDate": timeValue2,
                        "tablePurchaseOrderSkuses": $scope.products,
                        "tablePurchaseOrderTags": [],
                        "tableAddress": $scope.singleorderData.pickupAddressName,
                        "tableCurrencyCode": {
                            "idtableCurrencyCodeId": 1,
                            "tableCurrencyCodeShortname": "INR",
                            "tableCurrencyCodeLongname": "Indian Rupee"
                        },
                        "tablePurchaseOrderPaymentType": $scope.singleorderData.payment,
                        "tableShippingCarrierServices": $scope.singleorderData.shipService,
                        "tableShippingOwnership": $scope.singleorderData.shipOwner,
                        "tableVendor": $scope.singleorderData.vendorData,
                        "tablePurchaseOrderRemarks": $scope.singleorderData.tablePurchaseOrderRemarks,
                        "tableWarehouseDetails": $scope.singleorderData.wareHouses
                    };
                    console.log(purchaseOrderPost);
                    $http({
                        method: 'POST',
                        url: baseUrl + '/omsservices/webapi/purchase/order/' + $scope.DraftOrderID.OrderId + '/confirmdraft',
                        data: purchaseOrderPost,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        console.log(res);
                        if (res) {

                            $scope.cancelSingleOrder();
                            purchaseOrderPost = null;
                            $scope.listOfStatesCount($scope.defaultTab);
                            growl.success("Order Added Successfully");
                            $mdDialog.hide({
                                templateUrl: 'addPodialog.tmpl.html'
                            });
                            console.log($scope.products);
                        }
                    }).error(function (error, status) {
                        console.log(error);
                        console.log(status);
                        if (status == 400) {
                            growl.error(error.errorMessage);
                        }
                        else {
                            growl.error("Order Cant be Added");
                        }
                    });
                }
            }
        })
    }




    //======================================== bulk po order upload ============================ //

    $scope.uploadFileBulkOrder = function(ev) {
        $mdDialog.hide({
            templateUrl: 'addPodialog.tmpl.html'
        });
        $mdDialog.show({
            templateUrl: 'PoBulkorder.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            scope: $scope.$new()
        })
    }

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
                var uploadUrl = baseUrl + '/omsservices/webapi/purchase/order/pobulkupload';

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
                    $cookies.put('BulkUploadData','po');
                    $cookies.put('ActiveTab','PO');
                    $rootScope.growlmessage = growl.success("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",{ttl: -1});
                    //$scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                    $scope.singleorderData.bulkOrderUploadfile = null;
                    $scope.closeBulkUploadDialog();

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

    //=================================== edit remarks ============================= //
    var orderDataForReplacingData;
    $scope.openEditRemarkModal = function(order,index){
        orderDataForReplacingData = order;
        $scope.editRemarkModalOrderId = order.idtablePurchaseOrderId;
        $scope.modalRemarks = null;
        if(order.tablePurchaseOrderRemarkses == null || order.tablePurchaseOrderRemarkses == undefined)
        {
            $scope.modalRemarks = null;
        }
        else
        {   if(order.tablePurchaseOrderRemarkses.length > 0){
                $scope.modalRemarks =  order.tablePurchaseOrderRemarkses;
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
            url: baseUrl + '/omsservices/webapi/purchase/order/' + $scope.editRemarkModalOrderId +'/editremarks',
            data: remarks
        }).success(function(data) {
            var checkUpdatedRemarksDataUrl = baseUrl + "/omsservices/webapi/purchase/order/"+orderDataForReplacingData.idtablePurchaseOrderId;
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

    $scope.getItemLevelAdditionalGrossTypes = function()
    {
        $scope.itemLevelAdditionalGrossTypes = [];
        var getURL = baseUrl + "/omsservices/webapi/grosstype/itemgrosstypes";
        $http.get(getURL).success(function(data)
        {
            console.log(data);
            $scope.itemLevelAdditionalGrossTypes = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.getInvoiceLevelAdditionalGrossTypes = function() {
        $scope.invoiceLevelAdditionalGrossTypes = [];
        var getURL = baseUrl + "/omsservices/webapi/grosstype/invoicegrosstypes";
        $http.get(getURL).success(function(data)
        {
            console.log(data);
            $scope.invoiceLevelAdditionalGrossTypes = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfWareHouses = function() {
		$scope.wareHousesData = [];
		var wareHousesListUrl = baseUrl + "/omsservices/webapi/warehouses?option=to&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function(data) {
        	console.log(data);
        	$scope.wareHousesLists = data;

        	for (var i = 0; i < $scope.wareHousesLists.length; i++) {
        		$scope.wareHousesData.push($scope.wareHousesLists[i]);
        	}
        }).error(function(error, status) {
        	console.log(error);
        	console.log(status);

        });
    };

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

    $scope.WareHouseList = function(){
        var warehouse =baseUrl+ '/omsservices/webapi/warehouses&uipagename='+$scope.pagename;
        $http.get(warehouse).success(function(data) {
            console.log(data);
            $scope.wareHousesData = data;

        }).error(function(data){
                console.log(data);
            });
    }

    $scope.listOfPayments = function() {
    	$scope.paymentNamesData = [];
    	var paymentListUrl = baseUrl + "/omsservices/webapi/purchaseorderpaymenttypes";
        $http.get(paymentListUrl).success(function(data) {
            $scope.paymentLists = data;
            for (var i = 0; i < $scope.paymentLists.length; i++) {
            	$scope.paymentNamesData.push($scope.paymentLists[i]);
            }
        }).error(function(error, status) {
        	console.log(error);
        	console.log(status);

        });
    }

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
    }

    $scope.listOfShippingCarriers = function(){
    	$scope.shippingCarriersData = [];
    	var shippingCarriersUrl = baseUrl + "/omsservices/webapi/carrierservices";
    	$http.get(shippingCarriersUrl).success(function(data) {
    		$scope.shippingCarriersLists = data;
    		for (var i = 0; i < $scope.shippingCarriersLists.length; i++) {
    			$scope.shippingCarriersData.push($scope.shippingCarriersLists[i]);
    		}
            console.log($scope.shippingCarriersData);
    	}).error(function(error, status) {
    		console.log(error);
    		console.log(status);

    	});
    };



    $scope.getVendorId = function(vendorData){
        console.log(vendorData);
        $scope.singleorderData.quantityNo = "";
        $scope.singleorderData.priceProd = "";
        $scope.products = [];
         producted = [];
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

    $scope.singleorderData = {};
    var producted = [];
    // adding the product in table one by one
    $scope.addProduct = function(tableSku, tablePurchaseOrderSkusSkuQuantity, id, price) {

        if(tableSku == null){
            growl.error('Please add product first.');
        }

        if (tablePurchaseOrderSkusSkuQuantity == undefined) {

            growl.error("Please give proper quantity.");
        }

        if (price == undefined || price <=0) {

            growl.error("Price should be greater than zero.");
        }

        if (price > 0 && tablePurchaseOrderSkusSkuQuantity > 0)
        {
            var tableSku = angular.copy(tableSku);
			var keepGoing = true;
			angular.forEach(producted, function(product){
				if(keepGoing) {
					if(product.tableSku.idtableSkuId == tableSku.idtableSkuId){
						keepGoing = false;
				}
			  }
			});
			if(keepGoing){
                producted.push({
                    tableSku: tableSku,
                    tablePurchaseOrderSkusSkuQuantity: tablePurchaseOrderSkusSkuQuantity,
                    tablePurchaseOrderSkusChargeses: [{
                        "tablePurchaseOrderSkusChargesValue": price,
                        "tablePurchaseOrderSkuChargesType": {
                            "idtablePurchaseOrderSkuChargesTypeId": 1,
                            "tablePurchaseOrderSkuChargesTypeString": "sku price"
                        }
                    }]
                });
			}
            else
            {
                growl.error("The selected product is already part of the current order. Delete the existing item first to add updated quantity.");
            }
            $scope.products = producted;

            console.log($scope.products);

            $scope.$broadcast('angucomplete-alt:clearInput', 'products');
            tableSku = null;
            tablePurchaseOrderSkusSkuQuantity = null;
            $scope.singleorderData.productObj = null;
            $scope.singleorderData.quantityNo = null;
            $scope.singleorderData.priceProd = null;
        }
    };

    //remove the product
    $scope.removeProduct = function(index) {
        $scope.products.splice(index, 1);
    };

    $scope.validateFormData = function() {

        if($scope.singleorderData.wareHouses == null || $scope.singleorderData.wareHouses == undefined)
        {
            growl.error('Select warehouse');
            return false;
        }

        if($scope.singleorderData.vendorData == null || $scope.singleorderData.vendorData == undefined)
        {
            growl.error('Select vendor');
            return false;
        }


        if($scope.products == null || $scope.products == undefined || $scope.products.length == 0)
        {
            growl.error('Add SKUs in the list');
            return false;
        }
        if($scope.singleorderData.shipOwner.idtableShippingOwnershipId == 2){
            if($scope.singleorderData.pickupAddressName == null || $scope.singleorderData.pickupAddressName == undefined)
            {
                growl.error('Select pickup address');
                return false;
            }
        }

        if($scope.singleorderData.payment == null || $scope.singleorderData.payment == undefined)
        {
            growl.error('Select payment type');
            return false;
        }

        if($scope.singleorderData.shipOwner == null || $scope.singleorderData.shipOwner == undefined)
        {
            growl.error('Select a shipping owner');
            return false;
        }


        if($scope.singleorderData.shipOwner.idtableShippingOwnershipId == 2){
            if($scope.singleorderData.pickUpDate == null || $scope.singleorderData.pickUpDate == undefined)
            {
                growl.error('Select pickup date');
                return false;
            }
        }

        if($scope.singleorderData.shipOwner.idtableShippingOwnershipId == 1){
            if($scope.singleorderData.dropDate == null || $scope.singleorderData.dropDate == undefined)
            {
                growl.error('Select expected delivery date');
                return false;
            }
        }

        return true;

    }
    $scope.purchaseOrderData = {};

    $scope.saveSingleOrder = function(ev) {

        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval)
        {
            if (retval == true) {
                return;
            }
            else
            {
                if($scope.validateFormData() == false)
                {
                    return false;
                }
                if($scope.products.length == 0){
                    growl.error('you need to add product and its quantity also')
                }else{
                    var postData = {
                        "tablePurchaseOrderClientOrderNo": $scope.singleorderData.orderNo,
                        "tablePurchaseOrderRemarks": null,
                        "tablePurchaseOrderShippingCharges": 0,
                        "tablePurchaseOrderShippingTax": 0,
                        "tablePurchaseOrderHasParent": null,
                        "tablePurchaseOrderHasChildren": null,
                        "tablePurchaseOrderPickupDate": $scope.singleorderData.pickUpDate,
                        "tablePurchaseOrderDropDate": $scope.singleorderData.dropDate,
                        "tablePurchaseOrderSkuses": $scope.products,
                        "tablePurchaseOrderTags": [],
                        "tableAddress": $scope.singleorderData.pickupAddressName,
                        "tableCurrencyCode": {
                            "idtableCurrencyCodeId": 1,
                            "tableCurrencyCodeShortname": "INR",
                            "tableCurrencyCodeLongname": "Indian Rupee"
                        },
                        "tablePurchaseOrderPaymentType": $scope.singleorderData.payment,
                        "tableShippingCarrierServices": null,
                        "tableShippingOwnership": $scope.singleorderData.shipOwner,
                        "tableVendor": $scope.singleorderData.vendorData,
                        "tablePurchaseOrderRemarks":$scope.singleorderData.tablePurchaseOrderRemarks,
                        "tableWarehouseDetails": $scope.singleorderData.wareHouses
                    }
                    console.log(postData);
                    $http({
                        method: 'POST',
                        url: baseUrl + '/omsservices/webapi/purchase/order',
                        data: postData,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(res) {
                        console.log(res);
                        if (res) {

                            $scope.cancelSingleOrder();
                            postData = null;
                            $scope.listOfStatesCount($scope.defaultTab);
                            growl.success("Order Added Successfully");
                            $mdDialog.hide({
                                templateUrl: 'addPodialog.tmpl.html'
                            });
                            console.log($scope.products);
                        }
                    }).error(function(error, status) {
                        console.log(error);
                        console.log(status);
                        if(status == 400){
                            growl.error(error.errorMessage);
                        }
                        else {
                            growl.error("Failed to save PO");
                        }
                    });
                }
            }
        }).catch(function (error)
        {
            console.log(error);
        })

    };

    $scope.submitAction = function(saleChannelId, skuId, startDate, endDate, vendorId,systemOrderNo) {
        //console.log(saleChannelId);
        if(saleChannelId != undefined && saleChannelId != ''){
            var wareID = JSON.parse(saleChannelId);
        }
        console.log(skuId);
        console.log(startDate);
        console.log(endDate);
        console.log(vendorId);
        console.log(systemOrderNo);
        if (wareID != undefined) {
            $scope.channel = wareID.idtableWarehouseDetailsId;
        }
		if(saleChannelId == ''){
			$scope.channel = null;
		}
        if (skuId != undefined) {
            $scope.singleorderData.skuId = skuId;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        if (vendorId != undefined) {
            $scope.vendorId = vendorId;
        }
        if(systemOrderNo != undefined){
		    $scope.systemOrderNo = systemOrderNo;
        }
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = false;
        $scope.listOfStatesCount($scope.defaultTab, 1);

    }

    $scope.clearAction = function() {
        // $scope.listOfOrders($scope.defaultTab, 0);
		$scope.wareHouseId = null;
        $scope.channel = "";
        $scope.systemOrderNo = "";
        $scope.skuId = "";
        $scope.vendorId = "";
        $scope.saleChannelId = undefined;
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = null;
        $scope.end1Date = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'vendorsfilter');
        $scope.isSubmitDisabled = true;
        $scope.isResetFilter = true;
        $scope.listOfStatesCount($scope.defaultTab, 1);
    };

    $scope.singleorderData = {};
    $scope.searchedProduct = function(selected) {
        if(selected!=null)
        {
            $scope.singleorderData.productObj = selected.originalObject;
            $scope.singleorderData.skuId = selected.originalObject.idtableSkuId;
        }
    }

    $scope.searchedProductForFilter = function(selected) {
        if(selected!=null && selected != undefined)
        {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }else{
            $scope.skuId = undefined;
        }
    }


    $scope.searchedVendor = function(selected) {
        console.log(selected);
        if(selected!=null && selected != undefined)
        {
            $scope.vendorId = selected.originalObject.idtableVendorId;
        }else{
            $scope.vendorId = undefined;
        }
    }


    $scope.getPriceOfProduct = function(skuId, saleChannelId,quantity) {

        if(skuId == null || skuId == undefined)
        {
            growl.error("Select a product. System will fetch the price offered for this product by this vendor.");
            return;
        }

        if(quantity == null || quantity == undefined)
        {
            growl.error("Enter some quantity value. System will fetch the price offered for this product and quantity by this vendor.");
            return;
        }

        if(saleChannelId  == null || saleChannelId == undefined)
        {
            growl.error("Select a vendor first");
            return;
        }

        $http({
            method: 'GET',
            url: baseUrl + '/omsservices/webapi/vendors/' + saleChannelId + '/skumap/sku/' + skuId + '/skuquantity/'+quantity+ '/price',
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
    };

    $scope.addShippingAddress = function(vendorId, customerTypeId) {
        console.log(customerTypeId);
        console.log(vendorId);

        var customersByIDUrl = baseUrl + "/omsservices/webapi/customers/" + vendorId;
        $http.get(customersByIDUrl).success(function(data) {
            $scope.vendorId = data.idtablevendorId;
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
    $scope.ReOrdered = function(){

        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval)
        {
            if (retval == true)
            {
                return;
            }
            else
            {
                if ($scope.validateFormData() == false)
                {
                    return;
                }

                console.log($scope.singleorderData);
                console.log($scope.products);
                console.log($scope.singleorderData.shipOwner);
                console.log($scope.singleorderData.pickupAddressName);
                var locateAddress = $scope.singleorderData.pickupAddressName;
                console.log(locateAddress);
                console.log($scope.singleorderData.payment);
                var postData = {
                    "tablePurchaseOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tablePurchaseOrderRemarks": "",
                    "tablePurchaseOrderShippingCharges": 0,
                    "tablePurchaseOrderShippingTax": 0,
                    "tablePurchaseOrderHasParent": null,
                    "tablePurchaseOrderHasChildren": null,
                    "tablePurchaseOrderPickupDate": $scope.singleorderData.pickUpDate,
                    "tablePurchaseOrderDropDate": $scope.singleorderData.dropDate,
                    "tablePurchaseOrderSkuses": $scope.products,
                    "tablePurchaseOrderTags": [],
                    "tableAddress": $scope.singleorderData.pickupAddressName,
                    "tableCurrencyCode": {
                        "idtableCurrencyCodeId": 1,
                        "tableCurrencyCodeShortname": "INR",
                        "tableCurrencyCodeLongname": "Indian Rupee"
                    },
                    "tablePurchaseOrderPaymentType": $scope.singleorderData.payment,
                    "tableShippingCarrierServices": $scope.singleorderData.shipService,
                    "tableShippingOwnership": $scope.singleorderData.shipOwner,
                    "tableVendor": $scope.singleorderData.vendorData,
                    "tablePurchaseOrderRemarks": $scope.singleorderData.tablePurchaseOrderRemarks,
                    "tableWarehouseDetails": $scope.singleorderData.wareHouses
                }
                console.log(postData);
                $http({
                    method: 'POST',
                    url: baseUrl + '/omsservices/webapi/purchase/order',
                    data: postData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {

                        postData = null;
                        $scope.cancelSingleOrder(); //Just to reset dialog box and values

                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        growl.success("PO reordered successfully");

                        console.log($scope.products);

                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("Failed to reorder PO");
                    }
                });
            }
        })
    };


//    =============================== deleting values from modal ======================== //

    $scope.cancelSingleOrder = function(){

        producted = [];
        $scope.vendorskus = false;
        $scope.OrderMode = "";
        $scope.deliveryAddressArray = [];
        $scope.orderNo = null;
        $scope.singleorderData.systemOrderNo = null;
        $scope.singleorderData.wareHouses = null;
        $scope.singleorderData.vendorData = null;
        $scope.products = [];
        $scope.singleorderData.pickupAddressName = null;
	    $scope.singleorderData.payment = null;
        $scope.bulkSelectChannel = false;
        $scope.bulkSelectFile = false;
        $scope.fileName = "";
	    $scope.singleorderData.shipOwner = null;
	    $scope.singleorderData.shipService = null;
	    $scope.singleorderData.pickUpDate = null;
	    $scope.singleorderData.dropDate = null;
        $scope.editOrderDisable = false;
        $scope.singleorderData.orderNo = null;
        $scope.singleorderData.skuId = null;
        $scope.vendorId = null;
        $scope.genericData.check = null;
        $scope.singleorderData.productObj = null;
        $scope.skuId = null;
        $scope.singleorderData.skuId = null;
        $mdDialog.hide({
            templateUrl: 'addPodialog.tmpl.html'
        });
        
    };

    $scope.cancelSingleOrders = function(){
        $mdDialog.hide();
    };
    $scope.cancelPurchaseOrderGrnModal = function(){
        $scope.grnInventory = {};
        $mdDialog.hide();
    };
    $scope.vendorId = "";

	$scope.openEditAndReorderModal = function(order,mode)
    {
        console.log(mode);
        console.log(order);
        $scope.singleOrderMode = mode;
        $scope.singleorderData.pickUpDate = order.tablePurchaseOrderPickupDate;
        $scope.singleorderData.dropDate = order.tablePurchaseOrderDropDate;
        if(mode == 'edit')
        {
            $scope.singleorderData.systemOrderNo = order.tablePurchaseOrderSystemOrderNo;
            $scope.singleorderData.orderNo = order.tablePurchaseOrderClientOrderNo;
            $scope.singleorderData.poID = order.idtablePurchaseOrderId;
            $scope.editOrderDisable = false;
        }
        if(mode == 'editdraft')
        {
            $scope.singleorderData.systemOrderNo = order.tablePurchaseOrderSystemOrderNo;
            $scope.singleorderData.orderNo = order.tablePurchaseOrderClientOrderNo;
            $scope.singleorderData.poID = order.idtablePurchaseOrderId;
            $scope.editOrderDisable = false;
        }
        if(mode == 'reorder')
        {
            $scope.singleorderData.systemOrderNo = null;
            $scope.singleorderData.orderNo = null;
            $scope.singleorderData.poID = null;
            $scope.editOrderDisable = false;
            $scope.singleorderData.pickUpDate = null;
            $scope.singleorderData.dropDate = null;
            $scope.singleorderData.tablePurchaseOrderRemarkses = [];
        }

		$scope.vendorId = order.tableVendor.idtableVendorId;
        var vendorAddress = baseUrl +"/omsservices/webapi/vendors/"+$scope.vendorId+"/address";
        $http({
            method:'GET',
            url:vendorAddress
        }).success(function(data)
        {
			    $scope.deliveryAddressArray = [];
			    $scope.vendoraddresses = data; // get data from json
                angular.forEach($scope.vendoraddresses, function(item)
                {
                    $scope.deliveryAddressArray.push(item.tableAddress);
                });
                $scope.singleorderData.shipOwner = order.tableShippingOwnership;
			    $scope.singleorderData.vendorData = order.tableVendor;
                $scope.singleorderData.wareHouses = order.tableWarehouseDetails;
		        $scope.products = [];
                angular.forEach(order.tablePurchaseOrderSkuses,function(data)
                {
                    data.tableGrns = null;
                    $scope.products.push(data);
                });
                $scope.singleorderData.payment = order.tablePurchaseOrderPaymentType;
                $scope.singleorderData.shipService = order.tableShippingCarrierServices;
                $scope.singleorderData.pickupAddressName = order.tableAddress;
                if(mode != 'reorder') {
                    $scope.singleorderData.tablePurchaseOrderRemarkses = order.tablePurchaseOrderRemarkses;
                }
                $mdDialog.show({
       			 	templateUrl: 'addPodialog.tmpl.html',
       			 	parent: angular.element(document.body),
       			 	clickOutsideToClose: false,
       			 	scope: $scope.$new()
                });
                
        }).error(function(data)
        {
            console.log(data);
        });
	 };

    $scope.cancelBulkUpload = function(){
        $scope.fileName = null;
        $mdDialog.hide({
			 	templateUrl: 'addPodialog.tmpl.html'			 	
        });
        
    }
	 
	 //    ==================================== edit po ================================= //
    $scope.EditOrder = function(order,buttonAction)
    {
        $scope.singleOrderMode = 'edit';
        $scope.openEditAndReorderModal(order,"edit");

    };
	
    $scope.EditOrdered = function()
    {
        $scope.checkOrderNumber($scope.singleorderData.orderNo,$scope.singleorderData.systemOrderNo).then(function (retval) {
            if (retval == true) {
                return;
            }
            else {
                if ($scope.validateFormData() == false) {
                    return;
                }

                var postData = {
                    "tablePurchaseOrderClientOrderNo": $scope.singleorderData.orderNo,
                    "tablePurchaseOrderRemarks": "",
                    "tablePurchaseOrderPickupDate": $scope.singleorderData.pickUpDate,
                    "tablePurchaseOrderDropDate": $scope.singleorderData.dropDate,
                    "tablePurchaseOrderSkuses": $scope.products,
                    "tablePurchaseOrderTags": [],
                    "tableAddress": $scope.singleorderData.pickupAddressName,
                    "tableCurrencyCode": {
                        "idtableCurrencyCodeId": 1,
                        "tableCurrencyCodeShortname": "INR",
                        "tableCurrencyCodeLongname": "Indian Rupee"
                    },
                    "tablePurchaseOrderPaymentType": $scope.singleorderData.payment,
                    "tableShippingCarrierServices": $scope.singleorderData.shipService,
                    "tableShippingOwnership": $scope.singleorderData.shipOwner,
                    "tableVendor": $scope.singleorderData.vendorData,
                    "tablePurchaseOrderRemarks": $scope.singleorderData.tablePurchaseOrderRemarks,
                    "tableWarehouseDetails": $scope.singleorderData.wareHouses
                };
                console.log(postData);
                $http({
                    method: 'PUT',
                    url: baseUrl + '/omsservices/webapi/purchase/order/' + $scope.singleorderData.poID + '/update',
                    data: postData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res) {
                        postData = null;
                        $scope.cancelSingleOrder(); //Just to reset the variables and dialog box

                        $scope.listOfStatesCount($scope.defaultTab, $scope.vmPager.currentPage);
                        growl.success("Order Added Successfully");
                        $mdDialog.hide({
                            templateUrl: 'addPodialog.tmpl.html'
                        });
                        console.log($scope.products);

                    }
                }).error(function (error, status) {
                    console.log(error);
                    console.log(status);
                    if (status == 400) {
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("Order Cant be Added");
                    }
                });
            }
        })

    };



//    ------============================ reorder --------------------------==============//
    $scope.reOrder = function(order,buttonAction) {

        $scope.singleOrderMode = 'reorder';
        $scope.singleorderData.orderNo = null;
        $scope.editOrderDisable = false;
        $scope.singleorderData.poID = null;
		$scope.openEditAndReorderModal(order,"reorder");

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

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];
        console.log($scope.orderLists);
        for (var i = 0; i < $scope.orderLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
            console.log(dayDatacollapse);
        }
    }
        //console.log($scope.orderLists);
//    ================================== table row expnsion ================================= //

    $scope.selectTableRow = function(index, storeId) {

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


    $scope.openInfoBox = function(ev, stateTrials) {
        $scope.steps = [];
        console.log(stateTrials);
        for (var i = 0; i < stateTrials.length; i++) {
            var a = stateTrials.length - 1;
            console.log(a);
            var fulldate = $filter('utcToLocalOrHyphen')(stateTrials[i].tablePurchaseOrderSkuStateTrailTimestamp);
            if (i < a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString,
                    active: true,
                    orderState: "Successful",
                    remarks: stateTrials[i].tablePurchaseOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
            if (i == a) {
                $scope.steps.push({
                    title: stateTrials[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString,
                    orderState: "In Process",
                    remarks: stateTrials[i].tablePurchaseOrderSkuStateTrailRemarks,
                    fulldate: fulldate
                });
            }
        }
        console.log($scope.steps);
        $mdDialog.show({
            templateUrl: 'infoDialogPO.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }


    $scope.cancelInfoBox = function() {
        $mdDialog.hide();
    }


    $scope.cancelSaleOrderBox = function(ev, orderId, tableSaleOrderId, orderNo) {
        $scope.orderId = orderId;
        $scope.tableSaleOrderId = tableSaleOrderId;
        $scope.orderNo = orderNo;
        $scope.LoadNewRason = {};
        $scope.loadCancelReasons();
        $mdDialog.show({
            templateUrl: 'dialog33.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            scope: $scope.$new()
        })
    }

    $scope.cancelWarehouseSelection = function(){
        $mdDialog.hide();
    }

    $scope.loadCancelReasons = function() {
        var cancelReasonsUrl = baseUrl + '/omsservices/webapi/purchaseordercancelreasons';
        $http.get(cancelReasonsUrl).success(function(data) {
            console.log(data);
            $scope.cancelReasonArray = data;
            //$scope.getPoData();
            console.log($scope.cancelReasonArray);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }


    $scope.selectCancelAction = function(orderId, tableSaleOrderId, remarks, otherReasonRemarks) {
        if (!remarks) {
            growl.error("Please select a reason for cancellation");
        }
        else {
            console.log(orderId);
            console.log(tableSaleOrderId);
            console.log(remarks);
            console.log(otherReasonRemarks)
            if (remarks != undefined && remarks == 'other')
            {
                if (!otherReasonRemarks)
                {
                    $scope.otherReasonNotFiled = true;
                    growl.error("Please enter the reason!")
                }
                else if (otherReasonRemarks.length > 128)
                {
                    $scope.otherReasonNotFiled = true;
                    growl.error("Reason should be less than or equal to 128 characters.")
                }
                else
                {
                    if (remarks == 'other')
                    {
                        if ($scope.LoadNewRason.ReasonCheckBox == true)
                        {
                            console.log($scope.LoadNewRason.reasonData);
                            var postDataReason;
                            postDataReason = {
                                "tablePurchaseOrderCancelReasonString": $scope.LoadNewRason.reasonData
                            };
                            $http({
                                method: 'POST',
                                url: baseUrl + '/omsservices/webapi/purchaseordercancelreasons',
                                data: postDataReason,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function (data) {
                                console.log(data);
                                $scope.loadCancelReasons();
                                growl.success('Cancel reason added successfully');
                            }).error(function (data) {
                                console.log(data);
                            });
                        }
                    }
                    var cancelUrl = baseUrl + '/omsservices/webapi/purchase/order/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + otherReasonRemarks;
                    $http.put(cancelUrl).success(function (data) {
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
                        if(status == 400){
                            growl.error(error.errorMessage);
                        }
                        else {
                            growl.error("Order cannot be cancelled");
                        }
                    });
                }
            }
            if (remarks != undefined && remarks != 'other') {
                var cancelUrl = baseUrl + '/omsservices/webapi/purchase/order/' + orderId + '/orderskus/' + tableSaleOrderId + '/cancel/?remarks=' + remarks;
                $http.put(cancelUrl).success(function (data) {
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
                    if(status == 400){
                        growl.error(error.errorMessage);
                    }
                    else {
                        growl.error("Order cannot be cancelled");
                    }
                });
            }
        }
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
        return parseFloat(totalCostAmount).toFixed(2);
    };


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


//=============================================== Searching po ========================== //

    $scope.listOfStatesCount = function(tabsValue, page, action) {
        console.log(tabsValue);
        console.log($scope.systemOrderNo);
        console.log(page);
        console.log(typeof $scope.channel);
        console.log($scope.channel);
        if(typeof $scope.channel == 'undefined' || $scope.channel == null || $scope.channel == ''){
            $scope.channels = "";

        }else{
            $scope.channels = JSON.parse($scope.channel);
        }
        console.log($scope.singleorderData.skuId);
        console.log($scope.vendorId);
        console.log($scope.startDate);
        console.log($scope.endDate);

        $scope.defaultTab = tabsValue;
        $scope.allCount = 0;
        $scope.newCount = 0;
        $scope.processCount = 0;
        $scope.holdCount = 0;
        $scope.returnCount = 0;
        $scope.cancelledCount = 0;
        $scope.shippingCount = 0;
        $scope.returnCount = 0;
        $scope.draftCount = 0;

        var newCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=new&uipagename="+$scope.pagename;
        var processCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=inprocess&uipagename="+$scope.pagename;
        var holdCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=intransit&uipagename="+$scope.pagename;
        var returnCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=grn&uipagename="+$scope.pagename;
        var cancelledCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=cancelled&uipagename="+$scope.pagename;
        var draftCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?state=draft&uipagename="+$scope.pagename;
        var allCountUrl = baseUrl + "/omsservices/webapi/purchase/order/filtercount?uipagename="+$scope.pagename;

        if (typeof $scope.channel == "undefined" || $scope.channel == null || $scope.channel == "") {


            newCountUrl;
            processCountUrl;
            holdCountUrl;
            returnCountUrl;
            cancelledCountUrl;
            allCountUrl;
        } else {
            newCountUrl += "&warehouseid=" + $scope.channels;
            processCountUrl += "&warehouseid=" + $scope.channels;
            holdCountUrl += "&warehouseid=" + $scope.channels;
            returnCountUrl += "&warehouseid=" + $scope.channels;
            cancelledCountUrl += "&warehouseid=" + $scope.channels;
            allCountUrl += "warehouseid=" + $scope.channels;
            draftCountUrl += "warehouseid=" + $scope.channels;
            //shippingCountUrl += "&warehouseid=" + $scope.channels;
            //deliveredCountUrl += "&warehouseid=" + $scope.channels;
        }
        if ($scope.singleorderData.skuId) {
            newCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            processCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            holdCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            returnCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            cancelledCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            allCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            draftCountUrl += "&skuid=" + $scope.singleorderData.skuId;
            //shippingCountUrl += "&skuid=" + $scope.skuId;
            //deliveredCountUrl += "&skuid=" + $scope.skuId;
        }
        if ($scope.vendorId) {
            newCountUrl += "&vendorid=" + $scope.vendorId;
            processCountUrl += "&vendorid=" + $scope.vendorId;
            holdCountUrl += "&vendorid=" + $scope.vendorId;
            returnCountUrl += "&vendorid=" + $scope.vendorId;
            cancelledCountUrl += "&vendorid=" + $scope.vendorId;
            allCountUrl += "&vendorid=" + $scope.vendorId;
            draftCountUrl += "&vendorid=" + $scope.vendorId;
        }
        if ($scope.ClientOrderNo) {
            newCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            processCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            holdCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            returnCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            cancelledCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            allCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
            draftCountUrl += "&clientorderid=" + $scope.ClientOrderNo;
        }
        if ($scope.systemOrderNo) {
            newCountUrl += "&orderid=" + $scope.systemOrderNo;
            processCountUrl += "&orderid=" + $scope.systemOrderNo;
            holdCountUrl += "&orderid=" + $scope.systemOrderNo;
            returnCountUrl += "&orderid=" + $scope.systemOrderNo;
            cancelledCountUrl += "&orderid=" + $scope.systemOrderNo;
            allCountUrl += "&orderid=" + $scope.systemOrderNo;
            draftCountUrl += "&orderid=" + $scope.systemOrderNo;
        }
        if ($scope.startDate) {
            newCountUrl += "&startdate=" + $scope.startDate;
            processCountUrl += "&startdate=" + $scope.startDate;
            holdCountUrl += "&startdate=" + $scope.startDate;
            returnCountUrl += "&startdate=" + $scope.startDate;
            cancelledCountUrl += "&startdate=" + $scope.startDate;
            allCountUrl += "&startdate=" + $scope.startDate;
            draftCountUrl += "&startdate=" + $scope.startDate;
            //shippingCountUrl += "&startDate=" + $scope.startDate;
            //deliveredCountUrl += "&startDate=" + $scope.startDate;
        }
        if ($scope.endDate) {
            newCountUrl += "&enddate=" + $scope.endDate;
            processCountUrl += "&enddate=" + $scope.endDate;
            holdCountUrl += "&enddate=" + $scope.endDate;
            returnCountUrl += "&enddate=" + $scope.endDate;
            cancelledCountUrl += "&enddate=" + $scope.endDate;
            allCountUrl += "&enddate=" + $scope.endDate;
            draftCountUrl += "&enddate=" + $scope.endDate;
            //shippingCountUrl += "&endDate=" + $scope.endDate;
            //deliveredCountUrl += "&endDate=" + $scope.endDate;
        }

        console.log("NEW COUNT URL");
        console.log(newCountUrl);
        console.log("PROCESS COUNT URL");
        console.log(processCountUrl);
        console.log("HOLD COUNT URL");
        console.log(holdCountUrl);
        console.log("RETURN COUNT URL");
        console.log(returnCountUrl);
        console.log("CSNCELLED COUNT URL");
        console.log(cancelledCountUrl);
        console.log("SHIPPING COUNT URL");
        //console.log(shippingCountUrl);
        console.log("draft COUNT URL");
        console.log(draftCountUrl);
        console.log("ALL COUNT URL");
        console.log(allCountUrl);

        $http.get(allCountUrl).success(function(data) {
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }


                vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                console.log(vm.pager);
                $scope.vmPager = vm.pager;

                $scope.start = (vm.pager.currentPage - 1) * 5;
                $scope.orderSize = $scope.start + 5;
                //$scope.start = 0;
                //$scope.channel = $scope.channel;
                //$scope.skuId = $scope.skuId;
                //$scope.vendorId = $scope.vendorId;
                //$scope.stateDate = $scope.stateDate;
                //$scope.endDate = $scope.endDate;
                //console.log($scope.start);
                //console.log($scope.orderSize);
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
                $scope.allCount = data;
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

        $http.get(newCountUrl).success(function(data) {
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }


                vm.pager = PagerService.GetPager(vm.dummyItems.length, page);
                console.log(vm.pager);
                $scope.vmPager = vm.pager;

                $scope.start = (vm.pager.currentPage - 1) * 5;
                $scope.orderSize = $scope.start + 5;
                //$scope.start = 0;
                //$scope.channel = $scope.channel;
                //$scope.skuId = $scope.skuId;
                //$scope.vendorId = $scope.vendorId;
                //$scope.stateDate = $scope.stateDate;
                //$scope.endDate = $scope.endDate;
                //console.log($scope.start);
                //console.log($scope.orderSize);
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
                $scope.newCount = data;
                if (tabsValue == 'new') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.newCount); // dummy array of items to be paged
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


        $http.get(processCountUrl).success(function(data) {
            //$cookies.remove('Dashdata');
            if (data != null) {
                $scope.processCount = data;
                if (tabsValue == 'inprocess') {
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
                        if (action == 'clearAction') {
                            $scope.listOfOrders(tabsValue, $scope.start, 'clearAction');
                        } else {
                            $scope.listOfOrders(tabsValue, $scope.start);
                        }
                    }
                }
            }
        });

        $http.get(holdCountUrl).success(function(data) {
            //$cookies.remove('Dashdata');
            if (data!=null) {
                $scope.holdCount = data;
                if (tabsValue == 'intransit') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.holdCount); // dummy array of items to be paged
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

        $http.get(returnCountUrl).success(function(data) {
            //$cookies.remove('Dashdata');
                $scope.returnCount = data;
                if (tabsValue == 'grn') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.returnCount); // dummy array of items to be paged
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

        $http.get(cancelledCountUrl).success(function(data) {
            //$cookies.remove('Dashdata');
            if (data!=null) {
                $scope.cancelledCount = data;
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

        $http.get(draftCountUrl).success(function(data) {
            //$cookies.remove('Dashdata');
            if (data!=null) {
                $scope.draftCount = data;
                if (tabsValue == 'draft') {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.draftCount); // dummy array of items to be paged
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
    }
    $scope.transitData = {};
    $scope.intransitData = function(data)
    {
        $scope.disableInTransit = false;
        $scope.transitData.orderID = data.idtablePurchaseOrderId;
    }
    $scope.intransitDataDialog = function(ev,data)
    {
        $scope.disableInTransit = false;
        $mdDialog.show({
            templateUrl: 'inTransitDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
        $scope.transitData.orderID = data.idtablePurchaseOrderId;
    }

    $scope.inTransit = function()
    {
        $scope.disableInTransit = true;

        ///omsservices/webapi/purchase/order/1/orderskus/1/intransit
                $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/purchase/order/'+$scope.transitData.orderID+'/intransit'
        }).success(function(data)
         {
            console.log(data);
            $('#intransit').modal('hide');
            growl.success('Successfully moved to In-Transit');
            $mdDialog.hide();
            $scope.listOfStatesCount($scope.defaultTab);
        }).error(function(data)
        {
            $scope.disableInTransit = false;
            console.log(data);
        });
    }


    //=============================== Print barcode Lables ================================== //

    $scope.printbarcodeLabel = function(value){
        console.log(value);
        $scope.previewTemp = baseUrl+'/omsservices/webapi/skus/'+value.tableSku.idtableSkuId+'/printskubarcode';
        window.open($scope.previewTemp);
        $http.get($scope.previewTemp, {
            responseType: 'arraybuffer'
        })
            .success(function(response) {
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


    //====================================== ends here ============================== //

//    ============================================== ADd GRN ====================================== //

    $scope.SkuDetails = {};

    $scope.showGRN = function(file){
        console.log(file);
        $scope.SkuDetails.Data = file;
        $scope.SkuDisabled = true;
        $scope.SkuDetails.ProductModel = file.tableSku.tableSkuName;
        $scope.SkuDetails.skuClientCode = file.tableSku.tableSkuClientSkuCode;
        $scope.SkuDetails.warehouseDetails = file.tableSkuInventory.tableWarehouseDetails.tableWarehouseDetailsShortname;
        if(file.tableSkuInventory.tableVendor.tableVendorName != null){
            $scope.SkuDetails.vendorDetails = file.tableSkuInventory.tableVendor.tableVendorName;
        }
        if(file.tableSkuInventory.tableSkuInventoryMaxRetailPrice != null){
            $scope.SkuDetails.tableSkuInventoryMaxRetailPrice = file.tableSkuInventory.tableSkuInventoryMaxRetailPrice;
        }
        if(file.tableSkuInventory.tableSkuInventoryMinSalePrice != null){
            $scope.SkuDetails.tableSkuInventoryMinSalePrice = file.tableSkuInventory.tableSkuInventoryMinSalePrice;

        }if(file.tableSkuInventory.tableSkuInventoryExpectedInwardCount != null){
            $scope.SkuDetails.ExpectedCount = file.tableSkuInventory.tableSkuInventoryExpectedInwardCount;
        }
        console.log(file.tableSkuInventory.tableSkuInventoryExpectedInwardCount);
        //SkuDetails.ExpectedCount, tableSkuInventoryExpectedInwardCount
        $('#AddGrn').modal('show');
    }

    //=============================================== Show SKU Inventory operation data =================================//

    $scope.showGRNoperation = function(ev,file,poData){
        console.log(file);
        $scope.disableSubmitGrn = false;
        $scope.SkuDetails.GRnData = file;
        $scope.SkuDisabled = true;
        $scope.SkuDetails.ProductModel = file.tableSku.tableSkuName;
        $scope.SkuDetails.skuClientCode = file.tableSku.tableSkuClientSkuCode;
        $scope.grnInventory.tableSku = file.tableSku;
        $scope.grnInventory.tableWarehouseDetails = poData.tableWarehouseDetails;
        if(poData.tableVendor.tableVendorName != null){
            $scope.grnInventory.tableVendor = poData.tableVendor;
        }
        $scope.grnInventory.tableSkuInventoryExpectedInwardCount = file.tablePurchaseOrderSkusSkuQuantity;
        console.log(file.tablePurchaseOrderSkusSkuQuantity);
        $mdDialog.show({
            templateUrl: 'GRNdata.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }

    $scope.calcQCFailed = function () {

        if(($scope.grnInventory.tableSkuInventoryActualInwardCount == null || $scope.grnInventory.tableSkuInventoryActualInwardCount == undefined)&& ($scope.grnInventory.tableSkuInventoryInwardQcFailedCount == null || $scope.grnInventory.tableSkuInventoryInwardQcFailedCount == undefined))
        {
            return;
        }

        if(($scope.grnInventory.tableSkuInventoryAvailableCount == null || $scope.grnInventory.tableSkuInventoryAvailableCount == undefined)&&($scope.grnInventory.tableSkuInventoryInwardQcFailedCount==null || $scope.grnInventory.tableSkuInventoryInwardQcFailedCount == undefined))
        {
            return;
        }

        $scope.grnInventory.tableSkuInventoryInwardQcFailedCount = $scope.grnInventory.tableSkuInventoryActualInwardCount - $scope.grnInventory.tableSkuInventoryAvailableCount ;
        if($scope.grnInventory.tableSkuInventoryInwardQcFailedCount < 0 ) {
            growl.error('QC Passed quantity cannot be greater than received quantity');
            $scope.grnInventory.tableSkuInventoryAvailableCount = null;
            $scope.grnInventory.tableSkuInventoryInwardQcFailedCount = null;
        }
    }

    $scope.SubmitGrn = function()
    {
        $scope.disableSubmitGrn = true;


        if($scope.grnInventory.tableSkuInventoryMaxRetailPrice == null || $scope.grnInventory.tableSkuInventoryMaxRetailPrice == undefined)
        {
            growl.error('MRP is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.grnInventory.tableSkuInventoryActualInwardCount == null || $scope.grnInventory.tableSkuInventoryActualInwardCount == undefined)
        {
            growl.error('Actual quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }

        if($scope.grnInventory.tableSkuInventoryAvailableCount == null || $scope.grnInventory.tableSkuInventoryAvailableCount == undefined)
        {
            growl.error('QC Passed quantity is required');
            $scope.disableSubmitGrn = false;
            return;
        }
        else
        {
            if($scope.grnInventory.tableSkuInventoryAvailableCount > $scope.grnInventory.tableSkuInventoryActualInwardCount )
            {
                growl.error('QC Passed quantity cannot be greater than actual received quantity');
                $scope.disableSubmitGrn = false;
                return;
            }
            else
            {
                $scope.grnInventory.tableSkuInventoryInwardQcFailedCount = $scope.grnInventory.tableSkuInventoryActualInwardCount - $scope.grnInventory.tableSkuInventoryAvailableCount;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 1)
        {
            if($scope.grnInventory.tableSkuInventoryMfgDate == null || $scope.grnInventory.tableSkuInventoryMfgDate == undefined)
            {
                growl.error('Manufacturing date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
            if($scope.grnInventory.tableSkuInventoryShelfLifeInDays == null || $scope.grnInventory.tableSkuInventoryShelfLifeInDays == undefined)
            {
                growl.error('Shelf life is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        if($scope.SkuDetails.GRnData.tableSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId == 2) {
            if ($scope.grnInventory.tableSkuInventoryExpiryDate == null || $scope.grnInventory.tableSkuInventoryExpiryDate == undefined) {
                growl.error('Expiry date is required');
                $scope.disableSubmitGrn = false;
                return;
            }
        }

        $scope.grnInventory.tableSkuInventoryMfgDate = moment($scope.grnInventory.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
        $scope.grnInventory.tableSkuInventoryExpiryDate = moment($scope.grnInventory.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");
        console.log($scope.grnInventory);

        var Postdata = $scope.grnInventory;

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/purchase/order/orderskus/'+$scope.SkuDetails.GRnData.idtablePurchaseOrderSkusId+'/quickgrn',
            data: Postdata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            console.log(data);
            $('#AddGrn').modal('hide');
            $scope.cancelPurchaseOrderGrnModal();
            growl.success('GRN successful and inventory has been updated');
            $scope.listOfStatesCount($scope.defaultTab);

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse[i] = false;
            }

        }).error(function(data){
            console.log(data);
            $scope.disableSubmitGrn = false;

        });
    }

	$scope.checkEditButton = function(podata) {
		var v = true;
        angular.forEach(podata.tablePurchaseOrderSkuses, function(item){
			var value = item.tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId;
                   if(value != 1 && value != 2 && value != 3){
					   v = false;
				   }
					   
               });
			   return v;
    }

    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();
    $scope.endminDate = new Date();



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

        if($scope.singleorderData.dropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.dropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

        //Delivery date should be greater than equal to shipping date

        if($scope.singleorderData.pickUpDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.pickUpDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }
    };

    $scope.onDeliveryDateChange = function ()
    {
        //should be greater than equal to today's date and if shipping date is there then should be greater than shipping date

        $scope.minDateDelivery = new Date();

        if($scope.singleorderData.pickUpDate)
        {
            $scope.shippingDateData = new Date($scope.singleorderData.pickUpDate);
            $scope.minDateDelivery = new Date(
                $scope.shippingDateData.getFullYear(),
                $scope.shippingDateData.getMonth(),
                $scope.shippingDateData.getDate());
        }

        if($scope.singleorderData.dropDate)
        {
            $scope.deliveryDateData = new Date($scope.singleorderData.dropDate);
            $scope.maxDateShipping = new Date(
                $scope.deliveryDateData.getFullYear(),
                $scope.deliveryDateData.getMonth(),
                $scope.deliveryDateData.getDate());
        }

    };


    $scope.clearStartDate = function()
    {
        $scope.startDate = "";
        $scope.start1Date = null;
        if($scope.end1Date == null)
        {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function()
    {
        $scope.endDate = "";
        $scope.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if($scope.start1Date == null)
        {
            $scope.endminDate = null;
        }
        else
        {
            $scope.sendStartDate($scope.start1Date);
        }
    }


    //===================================== Add Invoice =============================== //


    $scope.PurchaseOrderLevelActionRow = function(data, data2){
        return true;

    };

    $scope.splitOrderBySkuDialog = function(ev, data, orderid){
        $scope.skusListForOrderSplit = data;
        $scope.genericData.orderId = orderid;

        $mdDialog.show({
            templateUrl: 'splitPOSku.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });

    };

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
            url: baseUrl + '/omsservices/webapi/purchase/order/' + $scope.genericData.orderId +'/splitpurchaseorder',
            data: arr
        }).success(function() {
            $scope.listOfStatesCount($scope.defaultTab);
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

    $scope.cancelSplitOrderBySkuDialog = function(){
        $mdDialog.hide({
            templateUrl: 'splitPOSku.tmpl.html'
        });
    }


    $scope.splitPOBySkuByQuantityDialog = function(ev, data, orderid, quantity){
        $scope.genericData.skuid = data;
        $scope.genericData.orderId = orderid;
        $scope.genericData.totalskusQuantity = quantity;

        $mdDialog.show({
            templateUrl: 'splitPOSkubyquantity.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });
    }

    $scope.genericData.quantity = null;

    $scope.cancelPOSplitQuantityDialog = function(){

        $scope.genericData.quantity = null;
        $scope.genericData.totalskusQuantity = null;

        $mdDialog.hide({
            templateUrl: 'splitPOSkubyquantity.tmpl.html'
        });

    }

    $scope.splitPOBySkusByQuantity = function()
    {
        if($scope.genericData.quantity < 1){
            growl.error("Quantity can not be less than or equal to 1." );
            return;
        }

        if($scope.genericData.quantity >= $scope.genericData.totalskusQuantity){
            growl.error("Quantity can not be greater than or equal to "+ $scope.genericData.totalskusQuantity);
            return;
        }

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/purchase/order/' + $scope.genericData.orderId +'/splitpurchaseorderwithskuquantity/'+ $scope.genericData.skuid + '?skuquantity='+$scope.genericData.quantity

        }).success(function()
        {
            growl.success("Order splitted successfully");
            $scope.listOfStatesCount($scope.defaultTab);
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


    $scope.OpenAddInvoiceDialog = function(selectedPO)
    {
        $scope.tablePurchaseInvoice = {};
        $scope.tablePurchaseInvoice.tablePurchaseInvoiceIsTaxInclusive = true;
        $scope.startmaxDate = new Date();
        $scope.$broadcast('angucomplete-alt:clearInput', 'searchsku');

        $scope.singleorderData = selectedPO;

        $scope.tableInvoiceLineItems = [];
        $scope.tableInvoiceLineItems[0] = {};

        $scope.tableInvoiceLineItemNets  = [];
        $scope.tableInvoiceLineItemNets[0] = [];
        $scope.tableInvoiceLineItemNets[0][0] = 0;

        $scope.addMoreLineItemGross(0);

        $scope.tableGrosses = [];
        $scope.tableGrosses[0] = {};

        $scope.netInvoiceLevelAmounts = [];
        $scope.netInvoiceLevelAmounts[0] = 0;

        $scope.imageInputValue = {};
        $scope.multipleImagesList = [];

        $('#addPoInvoice').modal('show');

    }

    $scope.cancelPurchaseInvoice = function(ev)
    {
        $('#addPoInvoice').modal('hide');
    }

    $scope.invoielineitemindex = -1;
    $scope.selectedInvoiceLineItemIndex = function (invoielineitemindex) {
        $scope.invoielineitemindex = invoielineitemindex;
    }

    $scope.searchedProductForInvoice = function(selected)
    {
        if(selected != null && selected != undefined)
        {
            $scope.tableInvoiceLineItems[$scope.invoielineitemindex].tableSku = selected.originalObject;
        }
    }



    $scope.addPurchaseInvoiceLineElement = function()
    {
        $scope.tableInvoiceLineItems.push({});
        $scope.tableInvoiceLineItems[$scope.tableInvoiceLineItems.length -1].tableGrosses = [];
        $scope.tableInvoiceLineItems[$scope.tableInvoiceLineItems.length -1].tableGrosses[0] = {};
        $scope.tableInvoiceLineItemNets.push([0]);
        console.log($scope.tableInvoiceLineItems);
    };

    $scope.deleteLineItem = function(index)
    {
        console.log(index);
        $scope.tableInvoiceLineItems.splice(index,1);
        $scope.tableInvoiceLineItemNets.splice(index,1);
        $scope.calculateTotalValues();
    }

    $scope.deleteInvoiceChargesItem = function(index)
    {
        console.log(index);
        $scope.tableGrosses.splice(index,1);
        $scope.netInvoiceLevelAmounts.splice(index,1);
        $scope.calculateTotalValues();
    }

    $scope.addMoreLineItemGross = function(invoielineitemindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses.push({});
    };
    $scope.deleteLineItemGross = function(invoielineitemindex,grossindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses.splice(grossindex,1);
        $scope.tableInvoiceLineItemNets[invoielineitemindex].splice(grossindex,1);
        $scope.calculateTotalValues();
    };

    $scope.addMoreDiscount = function(invoielineitemindex,lineitemgrossindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts.push({});
    };

    $scope.deleteDiscount = function(invoielineitemindex,lineitemgrossindex,discountindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts.splice(discountindex,1);
        $scope.calculateTotalValues();
    };
    
    $scope.addMoreTax = function(invoielineitemindex,lineitemgrossindex)
    {
        if($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes == undefined)
        {
            $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes = [];
        }
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes.push({});
    };

    $scope.deleteTax = function(invoielineitemindex,lineitemgrossindex,taxindex)
    {
        $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableTaxes.splice(taxindex,1);
        $scope.calculateTotalValues();
    };

    $scope.calculateTotalValues = function ()
    {
        $scope.totalGross = 0.00;
        $scope.totalDiscount = 0.00;
        $scope.totalNet = 0.00;
        $scope.totalTax = 0.00;

        //totalGross
        for(var invoielineitemindex=0; invoielineitemindex<$scope.tableInvoiceLineItems.length;invoielineitemindex++)
        {
            var tableLineItemGrosses = $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses;
            for(var lineitemgrossindex=0; lineitemgrossindex<tableLineItemGrosses.length;lineitemgrossindex++)
            {
                if(isNaN(tableLineItemGrosses[lineitemgrossindex].tableGrossAmount) == false)
                {
                    $scope.totalGross += Number(tableLineItemGrosses[lineitemgrossindex].tableGrossAmount);
                }


                var tableDiscounts = tableLineItemGrosses[lineitemgrossindex].tableDiscounts;
                if(tableDiscounts)
                {
                    for(var discountindex=0; discountindex<tableDiscounts.length;discountindex++)
                    {
                        if(isNaN(tableDiscounts[discountindex].tableDiscountAmount) == false)
                        {
                            $scope.totalDiscount += Number(tableDiscounts[discountindex].tableDiscountAmount);
                        }
                    }

                }

                var tableTaxes = tableLineItemGrosses[lineitemgrossindex].tableTaxes;
                if(tableTaxes)
                {
                    for(var taxindex=0; taxindex<tableTaxes.length;taxindex++)
                    {
                        if(isNaN(tableTaxes[taxindex].tableTaxAmount) == false)
                        {
                            $scope.totalTax += Number(tableTaxes[taxindex].tableTaxAmount);
                        }
                    }

                }
            }

            if(isNaN(arraySum($scope.tableInvoiceLineItemNets[invoielineitemindex])) == false)
            {
                $scope.totalNet += Number(arraySum($scope.tableInvoiceLineItemNets[invoielineitemindex]));
            }
        }

        //totalGross
        var tableInvoiceGrosses = $scope.tableGrosses;
        if(tableInvoiceGrosses)
        {
            for (var invoicegrossindex = 0; invoicegrossindex < tableInvoiceGrosses.length; invoicegrossindex++) {

                if(isNaN(tableInvoiceGrosses[invoicegrossindex].tableGrossAmount) == false)
                {
                    $scope.totalGross += Number(tableInvoiceGrosses[invoicegrossindex].tableGrossAmount);
                }

                var tableDiscounts = tableInvoiceGrosses[invoicegrossindex].tableDiscounts;
                if (tableDiscounts)
                {
                    for (var discountindex = 0; discountindex < tableDiscounts.length; discountindex++)
                    {
                        if(isNaN(tableDiscounts[discountindex].tableDiscountAmount) == false)
                        {
                            $scope.totalDiscount += Number(tableDiscounts[discountindex].tableDiscountAmount);
                        }
                    }

                }

                var tableTaxes = tableInvoiceGrosses[invoicegrossindex].tableTaxes;
                if (tableTaxes) {
                    for (var taxindex = 0; taxindex < tableTaxes.length; taxindex++)
                    {
                        if(isNaN(tableTaxes[taxindex].tableTaxAmount) == false)
                        {
                            $scope.totalTax += Number(tableTaxes[taxindex].tableTaxAmount);
                        }
                    }

                }

                if(isNaN($scope.netInvoiceLevelAmounts[invoicegrossindex]) == false)
                {
                    $scope.totalNet += Number($scope.netInvoiceLevelAmounts[invoicegrossindex]);
                }
            }
        }

        $scope.totalGross = $scope.totalGross.toFixed(2);
        $scope.totalDiscount = $scope.totalDiscount.toFixed(2);
        $scope.totalNet = $scope.totalNet.toFixed(2);
        $scope.totalTax = $scope.totalTax.toFixed(2);

    }
    
    function arraySum(array) {
        var sum = array.reduce(function (total, num) {
            return Number(total) + Number(num);
        });
        return sum;
    }

    $scope.onLineItemDiscountChange = function (invoielineitemindex,lineitemgrossindex) {

        var tableDiscounts = $scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableDiscounts;
        var totalDiscount = 0;
        if(tableDiscounts)
        {

            for(var index = 0; index <  tableDiscounts.length; index++)
            {
                totalDiscount += tableDiscounts[index].tableDiscountAmount;
                if(isNaN(totalDiscount)){totalDiscount = 0;}
            }
        }
        $scope.tableInvoiceLineItemNets[invoielineitemindex][lineitemgrossindex] = ($scope.tableInvoiceLineItems[invoielineitemindex].tableGrosses[lineitemgrossindex].tableGrossAmount - totalDiscount).toFixed(2);
        $scope.calculateTotalValues();
    }

    $scope.onLineItemTaxChange = function (invoielineitemindex,lineitemgrossindex) {
        $scope.calculateTotalValues();
    }

    $scope.onInvoiceDiscountChange = function (invoicegrossindex) {

        var tableDiscounts = $scope.tableGrosses[invoicegrossindex].tableDiscounts;
        var totalDiscount = 0;
        if(tableDiscounts)
        {

            for(var index = 0; index <  tableDiscounts.length; index++)
            {
                totalDiscount += tableDiscounts[index].tableDiscountAmount;
            }
        }
        $scope.netInvoiceLevelAmounts[invoicegrossindex] = ($scope.tableGrosses[invoicegrossindex].tableGrossAmount - totalDiscount).toFixed(2);
        $scope.calculateTotalValues();
    }

    $scope.onInvoiceTaxChange = function (invoielineitemindex,lineitemgrossindex) {
        $scope.calculateTotalValues();
    }

    $scope.validateTax = function(tableTax)
    {
        if(tableTax.tableTaxType == null || tableTax.tableTaxType == undefined || tableTax.tableTaxType == "")
            return false;
        if(tableTax.tableTaxRatePercentage == null || tableTax.tableTaxRatePercentage == undefined || tableTax.tableTaxType == "")
            return false;
        if(tableTax.tableTaxAmount == null || tableTax.tableTaxAmount == undefined || tableTax.tableTaxAmount == "")
            return false;

        return true;
    }

    $scope.validateDiscount = function(tableDiscount)
    {
        if(tableDiscount.tableDiscountAmount == null || tableDiscount.tableDiscountAmount == undefined || tableDiscount.tableDiscountAmount == "")
            return false;
        return true;
    }

    $scope.validateGross = function(tableGross)
    {
        if(tableGross.tableGrossAmount == null || tableGross.tableGrossAmount == undefined || tableGross.tableGrossAmount == "")
            return false;
        var tableDiscounts = tableGross.tableDiscounts;
        if(tableDiscounts)
        {
            for (var index = 0; index < tableDiscounts.length; index++)
            {
                if ($scope.validateDiscount(tableDiscounts[index]) == false)
                {
                    return false;
                }
            }
        }
        var tableTaxes = tableGross.tableTaxes;
        if(tableTaxes)
        {
            for (var index = 0; index < tableTaxes.length; index++)
            {
                if ($scope.validateTax(tableTaxes[index]) == false)
                {
                    return false;
                }
            }
        }

        return true;
    }

    $scope.validateLineItem = function(tableInvoiceLineItem)
    {
        if(tableInvoiceLineItem.tableSku == null || tableInvoiceLineItem.tableSku == undefined || tableInvoiceLineItem.tableSku == "")
            return false;
        if(tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == null || tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == undefined || tableInvoiceLineItem.tableInvoiceLineItemSkuQuantity == "")
            return false;

        var tableGrosses = tableInvoiceLineItem.tableGrosses;
        if(tableGrosses)
        {
            for (var index = 0; index < tableGrosses.length; index++)
            {
                if ($scope.validateGross(tableGrosses[index]) == false) {
                    return false;
                }
            }
        }
        return true;
    }

    $scope.validateInvoice = function (tablePurchaseInvoice)
    {
        var tableInvoiceLineItems = tablePurchaseInvoice.tableInvoiceLineItems;
        if(tableInvoiceLineItems) {
            for (var index = 0; index < tableInvoiceLineItems.length; index++)
            {
                if ($scope.validateLineItem(tableInvoiceLineItems[index]) == false) {
                    return false;
                }
            }
        }

        var tableGrosses = tablePurchaseInvoice.tableGrosses;
        if(tableGrosses) {
            for (var index = 0; index < tableGrosses.length; index++)
            {
                if ($scope.validateGross(tableGrosses[index]) == false) {
                    return false;
                }
            }
        }
    }



    $scope.addMoreInvoiceGross = function(){
        $scope.tableGrosses.push({});
        $scope.netInvoiceLevelAmounts.push("");
    };



    $scope.addMoreInvoiceDiscount = function(grossindex)
    {
        if($scope.tableGrosses[grossindex].tableDiscounts == undefined)
        {
            $scope.tableGrosses[grossindex].tableDiscounts = [];
        }
        $scope.tableGrosses[grossindex].tableDiscounts.push({});

    };

    $scope.deleteInvoiceDiscount = function(grossindex, invoicediscountindex)
    {
        $scope.tableGrosses[grossindex].tableDiscounts.splice(invoicediscountindex,1);
        $scope.calculateTotalValues();
    };

    $scope.addMoreInvoiceTax = function(grossindex)
    {
        if($scope.tableGrosses[grossindex].tableTaxes == undefined)
        {
            $scope.tableGrosses[grossindex].tableTaxes = [];
        }
        $scope.tableGrosses[grossindex].tableTaxes.push({});

    };

    $scope.deleteInvoiceTax = function(grossindex,invoicetaxindex)
    {
        $scope.tableGrosses[grossindex].tableTaxes.splice(invoicetaxindex,1);
        $scope.calculateTotalValues();

    };


    $scope.savePurchaseInvoice = function(data)
    {
        //Validate data
        if($scope.tablePurchaseInvoice.tablePurchaseInvoiceNumber == null || $scope.tablePurchaseInvoice.tablePurchaseInvoiceNumber == undefined)
        {
            growl.error("Invoice number is mandatory");
            return;
        }

        if($scope.tablePurchaseInvoice.tablePurchaseInvoiceDateTime == null || $scope.tablePurchaseInvoice.tablePurchaseInvoiceDateTime == undefined)
        {
            growl.error("Invoice date is mandatory");
            return;
        }

        $scope.tablePurchaseInvoice.tableInvoiceLineItems = $scope.tableInvoiceLineItems;

        if($scope.tablePurchaseInvoice.tableInvoiceLineItems == null || $scope.tablePurchaseInvoice.tableInvoiceLineItems == undefined)
        {
            growl.error("There should be at least one invoice line item");
            return;
        }
        else
        {
            if($scope.tablePurchaseInvoice.tableInvoiceLineItems.length == 0)
            {
                growl.error("There should be at least one invoice line item");
                return;
            }
        }

        $scope.tablePurchaseInvoice.tableGrosses = $scope.tableGrosses;

        if($scope.validateInvoice($scope.tablePurchaseInvoice) == false)
        {
            growl.error("Some input fields are found empty, either fill or delete these fields");
            return;
        }


        if($scope.multipleImagesList == null || $scope.multipleImagesList == undefined)
        {
            growl.error("Add at least one image of invoice");
            return;
        }
        else
        {
            if($scope.multipleImagesList.length == 0)
            {
                growl.error("Add at least one image of invoice");
                return;
            }
        }

        var blobbedPdf;
        var doc = new jsPDF();
        var dimensions = [15, 40, 180, 160];
        var count = -250;
        angular.forEach($scope.multipleImagesList,function(imageUrl)
        {
            console.log(imageUrl);
            count+= 250;
            if(count > 0){
                doc.addPage();
            }
            doc.addImage(imageUrl.imgSrc, 'JPEG', dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
            blobbedPdf = doc.output('blob');
        });


        console.log($scope.tablePurchaseInvoice);

        var PostDataUrl = baseUrl+'/omsservices/webapi/purchase/order/'+$scope.singleorderData.idtablePurchaseOrderId+'/purchaseinvoice';

        $http({
            method: 'POST',
            url: PostDataUrl,
            data: $scope.tablePurchaseInvoice,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            var uploadUrl = baseUrl + '/omsservices/webapi/purchase/order/' + $scope.singleorderData.idtablePurchaseOrderId + '/purchaseinvoice/uploadinvoice?invoicenumber=' + res.tablePurchaseInvoiceNumber;

            var fd = new FormData();
            fd.append('uploadFile', blobbedPdf);
            var upload = Upload.http({
                url: uploadUrl,
                method: 'PUT',
                data: fd,
                headers: {
                    'Content-Type': undefined
                }
            });
            upload.then(function(resp)
            {
                growl.success("Invoice has been uploaded successfully");
                $scope.cancelPurchaseInvoice();

            }, function(resp)
            {
                growl.error(resp.data.errorMessage);

            }, function(evt) {
                // progress notify
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + blobbedPdf.name);
            });
        });

    };

    $scope.closeBulkUploadDialog = function(){

        $mdDialog.hide({
            templateUrl: 'addPodialog.tmpl.html'
        });
        $cookies.put('BulkUploadData','po');
        $cookies.put('ActiveTab','PO');
    }

    $scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }
	
	$scope.masterSkuDialog = function(ev, check){		

        if($scope.vendorskus == false) {
            mastersService.fetchOnlySkus(baseUrl).then(function (data) {
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
        else{
            if($scope.singleorderData.vendorData == null)
            {
                growl.error("Select vendor First")
                return;
            }
            mastersService.fetchVendorSkus(baseUrl, $scope.singleorderData.vendorData.idtableVendorId).then(function(data) {
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

            $scope.genericData.check = check;

            if(check == true){
                $mdDialog.hide({
                    templateUrl: 'addPodialog.tmpl.html'
                });
                console.log($scope.singleorderData);
            }
        }
	}
	
	$scope.masterVendorDialog = function(ev){		
		
		mastersService.fetchVendors(baseUrl).then(function(data){
			$scope.genericData.vendorsListFiltered = data;
		})
		
        $mdDialog.show({
            templateUrl: 'dialogmastervendor.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            scope: $scope.$new()
        });		
		
	}
	
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
	}
	
	$scope.selectSku = function(id, ev){		
			
		$http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
		 
		$scope.singleorderData.productObj = data;
        $scope.skuId = data.idtableSkuId;
        $scope.singleorderData.skuId = data.idtableSkuId;
		if($scope.genericData.check == true){
			$scope.$broadcast("angucomplete-alt:changeInput", "products", data);
		}else{
			$scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
		}
        }).error(function(error, status) {
            console.log(error);
			
        });

		$scope.cancelmastersDialog(ev);		
	}
	
	$scope.selectVendor = function(id, ev){
		
		$scope.vendorId = id;
		
		 $http.get(baseUrl + '/omsservices/webapi/vendors/'+id).success(function(data) {
         console.log(data);
		 $scope.$broadcast("angucomplete-alt:changeInput", "vendorsfilter", data);
        }).error(function(error, status) {
            console.log(error);
			
        });

		$scope.cancelmastersDialog(ev);		
	}
	
	$scope.showAddOrderModalWithValues = function(ev){
		
		$mdDialog.show({
			 templateUrl: 'addPodialog.tmpl.html',
		 parent: angular.element(document.body),
         targetEvent: ev,
         clickOutsideToClose: false,
         scope: $scope.$new()
         });

	}

    $scope.checkNumber = checkNumber;

    $scope.imageInputValue = {};
    $scope.multipleImagesList = [];
    $scope.getImageValue = function(){
        if(($scope.multipleImagesList == '' || $scope.multipleImagesList == null)&&($scope.imageInputValue.imageValue == null || $scope.imageInputValue.imageValue == undefined)){
            return;
        }else{
            var keepGoing = true;
            angular.forEach($scope.multipleImagesList, function(product){
                if(keepGoing) {
                    if(product.imgSrc == $scope.imageInputValue.imageValue){
                        keepGoing = false;
                        growl.error('image is already added');
                    }
                }
            });
            if(keepGoing){
                $scope.multipleImagesList.push({
                    'imgSrc':$scope.imageInputValue.imageValue
                });
            }

            console.log($scope.multipleImagesList);
        }
    };
    $scope.removeImageItem = function(index){
        $scope.multipleImagesList.splice(index,1);
        console.log($scope.multipleImagesList);
    };
    $scope.uploadFileInput = function(input){
        console.log(input);
        var UrlAttr;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.imageInputValue.imageValue = e.target.result;
            };

            //Renders Image on Page
            reader.readAsDataURL(input.files[0]);
        }
        console.log(UrlAttr);
    }
}
