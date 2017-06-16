myApp.controller("bulkuploadsController", bulkuploadsController);

bulkuploadsController.$inject = ['$rootScope', 'downloadSkuSalesChannelMapTemplateUrl', 'PagerService',"$scope", "$http", "$location", "baseUrl", "$mdDialog", "$mdMedia", "growl", "$window", "Upload", "PagerService", "$q",  "$routeParams", "$cookies", "downloadOrderTemplateUrl","downloadSkuTemplateUrl","downloadMastersTemplateUrl","downloadCustomersTemplateUrl","downloadVendorsTemplateUrl","downloadPOTemplateUrl", "downloadBulkCancelTemplateUrl" ,"downloadSTOTemplateUrl", "$timeout",'filePathUrl','$cookies'];

function bulkuploadsController($rootScope, downloadSkuSalesChannelMapTemplateUrl, PagerService,$scope, $http, $location, baseUrl, $mdDialog, $mdMedia, growl, $window, Upload, PagerService, $q, $routeParams, $cookies,downloadOrderTemplateUrl,downloadSkuTemplateUrl,downloadMastersTemplateUrl,downloadCustomersTemplateUrl,downloadVendorsTemplateUrl,downloadPOTemplateUrl,downloadBulkCancelTemplateUrl,downloadSTOTemplateUrl,$timeout,filePathUrl,$cookies) {
    
    $scope.searchSuccessClicked = false;

    $scope.genericData = {};
    $scope.genericData.downloadSkuSalesChannelMapTemplateUrl = downloadSkuSalesChannelMapTemplateUrl;
    $scope.downloadOrderTemplateUrl = downloadOrderTemplateUrl;
    $scope.downloadSkuTemplateUrl = downloadSkuTemplateUrl;
    $scope.downloadMastersTemplateUrl = downloadMastersTemplateUrl;
    $scope.downloadCustomersTemplateUrl = downloadCustomersTemplateUrl;
    $scope.downloadVendorsTemplateUrl = baseUrl+'/omsservices/webapi/vendors/vendorbulkuploadtemplate';
    $scope.downloadPOTemplateUrl = downloadPOTemplateUrl;
    $scope.downloadBulkCancelTemplateUrl = downloadBulkCancelTemplateUrl;
    $scope.downloadSTOTemplateUrl = downloadSTOTemplateUrl;
    $scope.downloadInventoryTemplateUrl = baseUrl+'/omsservices/webapi/inventory/gettemplateforInventoryupload';
    $scope.downloadPurchaseOrderTemplateUrl = baseUrl+"/omsservices/webapi/purchase/order/bulkuploadtemplate";
    $scope.downloadVendorSkuMapTemplateUrl = baseUrl + "/omsservices/webapi/vendors/vendorskumapbulkuploadtemplate";
    $scope.bulkPurchaseReturnWithIdUrl = baseUrl + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithpo';
    $scope.bulkPurchaseReturnWithoutIdUrl = baseUrl + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithoutpo';
	$scope.downloadSaleReturnTemplateUrl = "";

    $scope.filePathUrl = filePathUrl;
    $scope.selectedTab = 0;

    $scope.startSuccess = 0;
    $scope.sizeSuccess = 5;
    $scope.startError = 0;
    $scope.sizeError = 5;

    //======================================= datepicker filter logic ===================== //

    $scope.clearStartDate = function() {
        $scope.startDate = "";
        $scope.start1Date = null;
        if($scope.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else
        {
            $scope.sendEndDate($scope.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function() {
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

//Start Date and End Date Validations Starts Here
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


    //=========================== ends here =========================//





    $scope.$on('$routeChangeSuccess', function() {
        $scope.checkAccess();
        $scope.loadBulkReporting($scope.defaultState);
    });

    $scope.isActive = function(tab) {
        if ($scope.activeTab == tab) {
            return true;
        }
        return false;
    };

    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = baseUrl + "/omsservices/webapi/saleschannels";
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

    $scope.clearFilter = function(){
        $scope.start1Date = null;
        $scope.end1Date = null;
        $scope.loadBulkReporting($scope.defaultState);
    };

    $scope.toggleSearchSuccessUploads = function() {
        $scope.searchSuccessClicked = !$scope.searchSuccessClicked;
    };

    $scope.showBulkUploadDialog = function() {
        if($scope.SaleReturnTabCheckforRefNo == 'salereturn'){
            $('#confirmSaleOrderReturnDialog').modal('show');
        }else{
            $("#bulkUploadDialog").modal("show");
        }

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

    $scope.genericData = {};
    $scope.onSaleReferenceNumberOptionChanged = function (salerefknown)
    {
        $scope.genericData.saleRefKnown = salerefknown;
        $('#confirmSaleOrderReturnDialog').modal('hide');
        $('#bulkUploadDialog').modal('show');
    };

    $scope.showBulkUploadFileDialog = function() {
        $("#bulkUploadFileDialog").modal("show");
    };

    $scope.closeBulkUploadDialog = function() {
        $("#bulkUploadDialog").modal("hide");
    };
    $scope.closeBulkUploadFileDialog = function() {
        $("#bulkUploadFileDialog").modal("hide");
    };

        $scope.closeBulkUploadDialogModal = function(){
        console.log("I MA HER");
        $("#bulkUploadDialog").modal("hide");
         $("#bulkUploadFileDialog").modal("hide");
         $cookies.put('BulkUploadData',$scope.defaultState);
         $cookies.put('ActiveTab',$scope.activeTab);
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    };

    $scope.bulkOrderSettingData = {}
    $scope.DownloadInventoryBulkUploadTemp = function(){
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

    $scope.DownloadSaleReturnBulkUploadTemp = function(){
        if($scope.genericData.saleRefKnown == true){
            $scope.downloadSaleReturnTemplateUrl = baseUrl+'/omsservices/webapi/salereturn/templateforreturnuploadwithsaleorder';
        }else{
            $scope.downloadSaleReturnTemplateUrl = baseUrl+'/omsservices/webapi/salereturn/templateforreturnuploadwithoutsaleorder';
        }
        $http({
            method: 'GET',
            url: $scope.downloadSaleReturnTemplateUrl,
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
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(data){
                console.log(data);
            });
    };

    $scope.uploadBulkFile = function(bulkOrderUploadfile, activeTab) {
        if(bulkOrderUploadfile == undefined || bulkOrderUploadfile == null || bulkOrderUploadfile == ""){
            growl.error("Select File first");
            return;
        }
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(activeTab);

        if(activeTab=='SKU')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/skus/skubulkupload';
        }
        if(activeTab=='Masters')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/masterbulkupload';
        }

        if(activeTab=='Customers')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/customers/customersbulkupload';
        }

        if(activeTab=='Vendors')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/vendors/vendorbulkupload';
        }
        if(activeTab=='Orders')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/saleschannels/' + $scope.bulkOrderSettingData.channelId + '/uploadbulkorders';
        }

        if(activeTab=='PO')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/purchase/order/pobulkupload';
        }
        if(activeTab=='Cancel')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/orders/uploadbulkcancelledorders';
        }
        if(activeTab=='Stocktransfer')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/stock/transfer/stbulkupload';
        }
        if(activeTab=='Inventory')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/inventory/inventorybulkupload';
        }
        if(activeTab=='Salereturn' && $scope.genericData.saleRefKnown == true)
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithsaleorder';
        }
        if(activeTab=='Salereturn' && $scope.genericData.saleRefKnown == false)
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithoutsaleorder';
        }
        if(activeTab=='vendorSkuMap')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/vendors/vendorskumapbulkupload';
        }
        if(activeTab=='Purchase Return With ID')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithsaleorder';
        }
        if(activeTab=='Purchase Return Without ID')
        {
            var uploadUrl = baseUrl + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithoutpurchaseorder';
        }
        if (file) {
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);

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
                    growl.success(activeTab +"Bulk Uploaded successfully");
                    $scope.closeBulkUploadFileDialog();
                    $('#bulkUploadDialog').modal('hide');
                    $scope.loadBulkReporting($scope.state);
                }, function(resp) {
                    console.log(resp);
                    growl.error(resp.data.errorMessage);
                }, function(evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
    };

    //fetching list of customers count
    $scope.loadBulkCounting = function(page,state) {
        var successCountUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/filtercount?status=success&entity='+state
        var errorCountUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/filtercount?status=error&entity='+state
        var existingCountUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/filtercount?status=existing&entity='+state
        var duplicateCountUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/filtercount?status=duplicate&entity='+state
        var inprogressCountUrl = baseUrl + '/omsservices/webapi/bulkuploadreports/filtercount?status=inprogress&entity='+state
        if (!$scope.start1Date) {
            successCountUrl += "&startDate"+$scope.start1Date;
            errorCountUrl += "&startDate"+$scope.start1Date;
            existingCountUrl += "&startDate"+$scope.start1Date;
            duplicateCountUrl += "&startDate"+$scope.start1Date;
            inprogressCountUrl += "&startDate"+$scope.start1Date;
        }
        if (!$scope.end1Date) {
            successCountUrl += "&startDate"+$scope.end1Date;
            errorCountUrl += "&startDate"+$scope.end1Date;
            existingCountUrl += "&startDate"+$scope.end1Date;
            duplicateCountUrl += "&startDate"+$scope.end1Date;
            inprogressCountUrl += "&startDate"+$scope.end1Date;
        }
        console.log("SUCCESS COUNT URL");
        console.log(successCountUrl);
        console.log("ERROR COUNT URL");
        console.log(errorCountUrl);

        console.log("EXISTING COUNT URL");
        console.log(existingCountUrl);


        console.log("DUPLICATE COUNT URL");
        console.log(duplicateCountUrl);

        console.log("INPROGRESS COUNT URL");
        console.log(inprogressCountUrl);

        $http.get(successCountUrl).success(function(successData) {
            console.log(successData)
            $scope.successCount = successData;
            if(successData)
            {
                var vm = this;

                vm.dummyItemsSuccess = _.range(0, $scope.successCount); // dummy array of items to be paged
                vm.pagerSuccess = {};
                // vm.setPage = setPage;
                function setPageSuccess(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pagerSuccess = PagerService.GetPager(vm.dummyItemsSuccess.length, page);
                    console.log(vm.pagerSuccess);
                    $scope.vmPagerSuccess = vm.pagerSuccess;
                    console.log($scope.vmPagerSuccess);
                    $scope.startSuccess = (vm.pagerSuccess.currentPage - 1) * 5;
                    $scope.sizeSuccess = $scope.startSuccess + 5;
                    console.log($scope.startSuccess);
                    console.log($scope.sizeSuccess);
                   
                }
                if (page == undefined) {
                    setPageSuccess(1);
                }
                if (page != undefined) {
                    setPageSuccess(page);
                }
        }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });
    };

    $scope.generateCategoryTemplate = function(){
        $("#generateTemp").modal('show');
    };
    $scope.cancelGenerateTemplateDialog = function(){
        $("#generateTemp").modal('hide');
    };
	
    $scope.downloadSkuMaptemplate = function(){
    	
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
    	
    }
    
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

    $scope.downloadVendorSkuMapTemplate = function(){
        $http({
            method: 'GET',
            url: $scope.downloadVendorSkuMapTemplateUrl,
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
            a.download = "Glaucus_Vendor_SKU_Map_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function(data){
            console.log(data);
        });
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

    $scope.SaleReturnTabCheckforRefNo = "";
    $scope.loadBulkReporting = function(state){
        $scope.SaleReturnTabCheckforRefNo = state;
        $cookies.remove('BulkUploadData');
        $cookies.remove('ActiveTab');
        $scope.state = state;
        var successUrl = baseUrl + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=success&entity='+state
        var errorUrl = baseUrl + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=error&entity='+state
        var existingUrl = baseUrl + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=existing&entity='+state
        var duplicateUrl = baseUrl + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=duplicate&entity='+state
        var inprogressUrl = baseUrl + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=inprogress&entity='+state
        if ($scope.start1Date) {
            $scope.start1Date = moment($scope.start1Date).format("YYYY-MM-DD");
            successUrl += "&startDate="+$scope.start1Date;
            errorUrl += "&startDate="+$scope.start1Date;
            existingUrl += "&startDate="+$scope.start1Date;
            duplicateUrl += "&startDate="+$scope.start1Date;
            inprogressUrl += "&startDate="+$scope.start1Date;
        }
        if ($scope.end1Date) {
            $scope.end1Date = moment($scope.end1Date).format("YYYY-MM-DD");
            successUrl += "&endDate="+$scope.end1Date;
            errorUrl += "&endDate="+$scope.end1Date;
            existingUrl += "&endDate="+$scope.end1Date;
            duplicateUrl += "&endDate="+$scope.end1Date;
            inprogressUrl += "&endDate="+$scope.end1Date;
        }
        console.log(successUrl);
        console.log(errorUrl);
        console.log(existingUrl);
        console.log(duplicateUrl);
        console.log(inprogressUrl);
        $http.get(successUrl).success(function(successdata) {
            console.log(successdata);
            $scope.successdata = successdata;
            $('#ordertabs > li.active').removeClass('active');
            $('.tab-content div.active').removeClass('active');
            $('#ordertabs li:first').addClass('active');
            $('.tab-content div:first').addClass('active');

        });
        $http.get(errorUrl).success(function(errordata) {
            console.log(errordata);
            $scope.errordata = errordata;
        });
        $http.get(existingUrl).success(function(existingdata) {
            console.log(existingdata);
            $scope.existingdata = existingdata;
        });
        $http.get(duplicateUrl).success(function(duplicatedata) {
            console.log(duplicatedata);
            $scope.duplicatedata = duplicatedata;
        });
        $http.get(inprogressUrl).success(function(inProgressData) {
            console.log(inProgressData);
            $scope.inProgressData = inProgressData;
        });
    }

    $scope.downloadPurchaseReturnTemplateWithID = function (flag) {

        if (flag == true) {

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
        if (flag == false) {

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
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
            });
        }
    };

    $scope.menubar = JSON.parse(localStorage.getItem("menu"));
    $scope.mastersAccess = {};
    $scope.skuAccess = {};
    $scope.inventoryAccess = {};
    $scope.stockTransferAccess = {};
    $scope.customerAccess = {};
    $scope.vendorAccess = {};
    $scope.saleOrderAccess = {};
    $scope.poAccess = {};
    $scope.saleReturnAccess = {};
    $scope.vendorsAccess = {};
    $scope.purchaseReturnAccess = {};

    $scope.checkAccess = function(page)
    {
        $scope.skuAccess = $scope.getSubMenuAccess('Masters','SKU');
        $scope.inventoryAccess = $scope.getMenuAccess('Inventory');
        $scope.stockTransferAccess = $scope.getMenuAccess('Stock Transfer');
        $scope.customerAccess = $scope.getSubMenuAccess('Masters','Customers');
        $scope.vendorAccess = $scope.getSubMenuAccess('Masters','Vendors');
        $scope.saleOrderAccess = $scope.getSubMenuAccess('Orders','Sale Order');
        $scope.poAccess = $scope.getMenuAccess('P.O.');
        $scope.saleReturnAccess = $scope.getSubMenuAccess('Orders','Sale Return')
        $scope.purchaseReturnAccess = $scope.getSubMenuAccess('Orders','Purchase Return');

        if($scope.customerAccess  != null && $scope.vendorAccess != null)
        {
            if($scope.customerAccess.createAccess == true && $scope.vendorAccess.createAccess == true)
            {
                $scope.mastersAccess = $scope.customerAccess;
            }
        }

        if ($cookies.get('BulkUploadData'))
        {
            $scope.defaultState = $cookies.get('BulkUploadData');
            $scope.activeTab = $cookies.get('ActiveTab');
            if($rootScope.growlmessage) {
                $rootScope.growlmessage.destroy();
            }
        }
        else
        {

            if($scope.mastersAccess.readAccess)
            {
                $scope.defaultState = "master";
                $scope.activeTab = "Masters";
                /*  $cookies.put('BulkUploadData','master');
                 $cookies.put('ActiveTab','Masters');*/
            }
            else if($scope.skuAccess.readAccess)
            {
                $scope.defaultState = "sku";
                $scope.activeTab = "SKU";
                /* $cookies.put('BulkUploadData','sku');
                 $cookies.put('ActiveTab','SKU');*/
            }
            else if($scope.inventoryAccess.readAccess)
            {
                $scope.defaultState = "inventory";
                $scope.activeTab = "Inventory";
                /*$cookies.put('BulkUploadData','inventory');
                 $cookies.put('ActiveTab','Inventory');*/
            }
            else if($scope.stockTransferAccess.readAccess)
            {
                $scope.defaultState = "stocktransfer";
                $scope.activeTab = "Stocktransfer";
                /* $cookies.put('BulkUploadData','stocktransfer');
                 $cookies.put('ActiveTab','Stocktransfer');*/
            }
            else if($scope.customerAccess.readAccess)
            {
                $scope.defaultState = "customer";
                $scope.activeTab = "Customers";
                /* $cookies.put('BulkUploadData','customer');
                 $cookies.put('ActiveTab','Customers');*/
            }
            else if($scope.vendorAccess.readAccess)
            {
                $scope.defaultState = "vendor";
                $scope.activeTab = "Vendors";
                /*$cookies.put('BulkUploadData','vendor');
                 $cookies.put('ActiveTab','Vendors');*/
            }
            else if($scope.saleOrderAccess.readAccess)
            {
                $scope.defaultState = "orders";
                $scope.activeTab = "Orders";
                /* $cookies.put('BulkUploadData','orders');
                 $cookies.put('ActiveTab','Orders');*/
            }
            else if($scope.poAccess.readAccess)
            {
                $scope.defaultState = "po";
                $scope.activeTab = "PO";
                /*$cookies.put('BulkUploadData','po');
                 $cookies.put('ActiveTab','PO');*/
            }
            else if($scope.saleReturnAccess.readAccess)
            {
                $scope.defaultState = "salereturn";
                $scope.activeTab = "Salereturn";
                /* $cookies.put('BulkUploadData','salereturn');
                 $cookies.put('ActiveTab','Salereturn');*/
            }
            else if($scope.purchaseReturnAccess.readAccess)
            {
                $scope.defaultState = "purchasereturnwithid";
                $scope.activeTab = "Purchase Return With ID";
                /* $cookies.put('BulkUploadData','purchasereturnwithid');
                 $cookies.put('ActiveTab','Purchase Return With ID');*/
            }
        }

    }

    $scope.getMenuAccess = function(menu){
        var response = {};
        angular.forEach($scope.menubar, function (value) {
            if(value.name == menu){
                response = value;
            }
        });
        return response;
    }

    $scope.getSubMenuAccess = function(menu,submenu){
        var response = {};
        angular.forEach($scope.menubar, function (value) {
            if(value.name == menu){
                angular.forEach(value.subMenu, function (sub) {
                    if(sub.name == submenu) {
                        response = sub;
                    }
                });
            }
        });
    return response;
    }

    $scope.hasUploadAccess = function() {

        var activeTab = $scope.activeTab;

        if (activeTab == 'Masters') {
            return $scope.mastersAccess.createAccess;
        }
        else if (activeTab == 'SKU' || activeTab == 'skuMap')
        {
            return $scope.skuAccess.createAccess;
        }
        else if (activeTab == 'Inventory')
        {
            return $scope.inventoryAccess.createAccess;
        }
        else if (activeTab == 'Stocktransfer')
        {
            return $scope.stockTransferAccess.createAccess;
        }
        else if (activeTab == 'Customers')
        {
            return $scope.customerAccess.createAccess;
        }
        else if (activeTab == 'Vendors')
        {
            return $scope.vendorAccess.createAccess;
        }
        else if (activeTab == 'Orders' || activeTab == 'Cancel')
        {
            return $scope.saleOrderAccess.createAccess;
        }
        else if (activeTab == 'PO')
        {
            return $scope.poAccess.createAccess;
        }
        else if (activeTab == 'Salereturn' || activeTab == 'SalereturnWithoutId')
        {
            return $scope.saleReturnAccess.createAccess;
        }
        else if (activeTab == 'Purchase Return With ID' || activeTab == 'Purchase Return Without ID')
        {
            return $scope.purchaseReturnAccess.createAccess;
        }
    }

}
