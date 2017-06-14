myApp.controller('templatesController', templatesController);

// myApp.factory('methodFactory', function () {
//     return { myMethod: function () {
//             console.log("methodFactory - myMethod");
//     }
// }
// });
templatesController.$inject = ['$scope', '$http', '$location', 'baseUrl', 'growl', '$window', '$mdDialog', '$mdMedia', '$sce', '$q', 'PagerService', '$cookies','$rootScope'];

function templatesController($scope, $http, $location, baseUrl, growl, $window, $mdDialog, $mdMedia, $sce, $q, PagerService, $cookies,$rootScope) {



    $scope.invoicemode = "add";
    $scope.manifestmode = "add";
    $scope.emailmode = "add";
    $scope.packingmode = "add";
    $scope.shippingmode = "add";
    $scope.stickermode = "add";
    $scope.isTemplateNameEntered = false;

    $scope.start = 0;
    $scope.size = 5;


    $scope.showCtrl1 = false;
    $scope.$on("myEvent", function (event, args) {
        console.log("hello");
        $scope.showCtrl1 = !$scope.showCtrl1;
        $scope.value = args.value;
    });


    $scope.$on('$routeChangeSuccess', function() {
        $scope.getPackingTemplates();
        $scope.getCompanyTmpGroup();
        $scope.getSaleChannelTmpGroup();
        $scope.getCustomerTmpGroup();
        $scope.getOrderTmpGroup();
        $scope.getShippingTmpGroup();
        $scope.getOrderItemsTmpGroup();
        $scope.getVendorTmpGroup();
        $scope.getWarehouseTmpGroup();
        $scope.getPoTmpGroup();
        $scope.getSTTmpGroup();
        $scope.listOfInvoiceTemplates($scope.start);
        $scope.listOfInvoiceTemplatesCount();
        $scope.closeAllAccordions();
        $scope.getBarCodeTmpGroup();
        $scope.invoicetemplatesData = "";
        $scope.manifesttemplatesData = "";
        $scope.emailtemplatesData = "";
        $scope.packingtemplatesData = "";
        $scope.shippingtemplatesData = "";
    });

    $scope.currentTab = "invoice";

    $scope.closeAllAccordions = function() {
        console.log($scope.orderTotalMode);
        if ($scope.stickerTotalMode == 'new') {
            $scope.showAddStickerDialog(event);
        }
        $scope.headerClicked = false;
        $scope.itemsHeaderClicked = false;
        $scope.itemsClicked = false;
        $scope.footerClicked = false;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
        $scope.isEditable = false;
        $scope.invoicemode = 'add';
        $scope.manifestmode = 'add';
        $scope.emailmode = 'add';
        $scope.packingmode = "add";
        $scope.shippingmode = "add";
        $scope.stickermode = "add";
        $mdDialog.hide();
    }

    $scope.listOfInvoiceTemplates = function(start) {
        $scope.currentTab = "invoice";
        var invoiceTemplateUrl = baseUrl + '/omsservices/webapi/invoicetemplates/';
        invoiceTemplateUrl += "?start=" + start + '&size=5&sort=idtableSalesChannelClientInvoiceTemplateId&direction=asc';
        $http.get(invoiceTemplateUrl).success(function(data) {
            console.log(data);
            if (data) {
                $scope.invoicetemplatesList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfInvoiceTemplatesCount = function(page) {
        console.log(page);
        var invoiceTemplatesCountUrl = baseUrl + "/omsservices/webapi/invoicetemplates/count";
        $http.get(invoiceTemplatesCountUrl).success(function(data) {
            $scope.invoiceTemplatesCount = data;
            console.log($scope.invoiceTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.invoiceTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfInvoiceTemplates($scope.start);
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

    $scope.listOfPackingTemplates = function(start) {
        $scope.currentTab = "packing";
        var packingTemplateUrl = baseUrl + '/omsservices/webapi/packingtemplates/';
        packingTemplateUrl += "?start=" + start + '&size=5&sort=idtableSalesChannelClientPackingTemplateId&direction=asc';
        $http.get(packingTemplateUrl).success(function(data) {
            if (data) {
                $scope.packingtemplatesList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfPackingTemplatesCount = function(page) {
        console.log(page);
        var packingtemplatesCountUrl = baseUrl + "/omsservices/webapi/packingtemplates/count";
        $http.get(packingtemplatesCountUrl).success(function(data) {
            $scope.packingTemplatesCount = data;
            console.log($scope.packingTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.packingTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfPackingTemplates($scope.start);
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

    $scope.listOfEmailTemplates = function(start) {
        $scope.currentTab = "email";
        var emailTemplateUrl = baseUrl + '/omsservices/webapi/emailtemplates/';
        emailTemplateUrl += "?start=" + start + '&size=5&sort=idtableSalesChannelClientEmailTemplateId&direction=asc';
        $http.get(emailTemplateUrl).success(function(data) {
            if (data) {
                $scope.emailtemplatesList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfEmailTemplatesCount = function(page) {
        console.log(page);
        var emailtemplatesCountUrl = baseUrl + "/omsservices/webapi/emailtemplates/count";
        $http.get(emailtemplatesCountUrl).success(function(data) {
            $scope.emailTemplatesCount = data;
            console.log($scope.emailTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.emailTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfEmailTemplates($scope.start);
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

    $scope.listOfShippingTemplates = function(start) {
        $scope.currentTab = "shipping";
        var shippingTemplateUrl = baseUrl + '/omsservices/webapi/shippingtemplates/';
        shippingTemplateUrl += "?start=" + start + '&size=5&sort=idtableClientShippingLabelTemplateId&direction=asc';
        console.log(shippingTemplateUrl);
        $http.get(shippingTemplateUrl).success(function(data) {
            if (data) {
                $scope.shippingtemplatesList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfShippingTemplatesCount = function(page) {
        console.log(page);
        var shippingtemplatesCountUrl = baseUrl + "/omsservices/webapi/shippingtemplates/count";
        $http.get(shippingtemplatesCountUrl).success(function(data) {
            $scope.shippingTemplatesCount = data;
            console.log($scope.shippingTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.shippingTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfShippingTemplates($scope.start);
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


    $scope.listOfStickerTemplates = function(start) {
        $scope.currentTab = "sticker";
        var stickerTemplateUrl = baseUrl + '/omsservices/webapi/stickertemplates/';
        stickerTemplateUrl += "?start=" + start + '&size=5&sort=idtableStickerTemplateId&direction=asc';
        $http.get(stickerTemplateUrl).success(function(data) {
            if (data) {
                $scope.stickertemplatesList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.listOfStickerTemplatesCount = function(page) {
        console.log(page);
        var stickertemplatesCountUrl = baseUrl + "/omsservices/webapi/stickertemplates/count";
        $http.get(stickertemplatesCountUrl).success(function(data) {
            $scope.stickerTemplatesCount = data;
            console.log($scope.stickerTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.stickerTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfStickerTemplates($scope.start);
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

    $scope.getPackingTemplates = function() {
        $scope.packingTemplateData = [];
        var packingTemplateUrl = baseUrl + '/omsservices/webapi/packingtemplates/1';
        $http.get(packingTemplateUrl).success(function(data) {
            if (data) {
                $scope.packingTemplateData.push(data.tableSalesChannelClientPackingTemplateOrderHeader);
                $scope.packingTemplateData.push(data.tableSalesChannelClientPackingTemplateOrderItemsHeader);
                $scope.packingTemplateData.push(data.tableSalesChannelClientPackingTemplateOrderItems);
                $scope.packingTemplateData.push(data.tableSalesChannelClientPackingTemplateOrderFooter);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    // dialog box to add new invoice template
    $scope.showInvoiceAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        if ($scope.invoicemode == 'add') {
            $scope.invoicetemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'invoice.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }



    //==================== dialog for manifest templates ====================== //

    $scope.showManifestAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        if ($scope.manifestmode == 'add') {
            $scope.manifesttemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'manifest.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }


    // dialog box to add new email template
    $scope.showEmailAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        if ($scope.emailmode == 'add') {
            $scope.emailtemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'email.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }

    // dialog box to add new packing template
    $scope.showPackingAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        if ($scope.packingmode == 'add') {
            $scope.packingtemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'packing.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
    }

    // dialog box to add new shipping template
    $scope.showShippingAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        if ($scope.shippingmode == 'add') {
            $scope.shippingtemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'shipping.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })
            .then(function(answer) {
                console.log($scope.orderTotalMode);
                if($scope.orderTotalMode=='new'){
                    $('#addOrderModal').modal('show');
                }
            })
    }

    // dialog box to add new sticker template
    $scope.showStickerAddTemplate = function(ev) {
        $scope.isTemplateNameEntered = false;
        console.log($scope.stickerTotalMode);
        if ($scope.stickermode == 'add') {
            $scope.stickerTemplatesData = "";
        }
        $mdDialog.show({
                templateUrl: 'settings/templates/templatesDialog/stickerTemplateAddDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                scope: $scope.$new()
            })

    }

    $scope.tinymceOptions = {
        plugins: ['textcolor', 'image', 'table'],
        toolbar: 'undo redo | bold italic | fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor | image table',
        elementpath: false,
        menubar: false,
        statusbar: false,
        selector: '.tinyMce',
        mode: 'exact',
        min_height: 200,
        max_height: 200
    };

    $scope.isActive = function(data) {
        if (data == $scope.currentTab) {
            return true;
        }
        return false;
    };

    $scope.listOfTemplates = function(start) {
        $scope.currentTab = "manifest";

        console.log($scope.currentTab);
        var manifestTemplateUrl = baseUrl + '/omsservices/webapi/manifesttemplates/';
        manifestTemplateUrl += "?start=" + start + '&size=5&sort=idtableClientManifestTemplateId&direction=asc';
        $http.get(manifestTemplateUrl).success(function(data) {
            console.log(data);
            if (data) {
                $scope.manifestTemplateList = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
        // fetch template list based on input 'data'
    };

    $scope.listOfTemplatesCount = function(page) {
        console.log(page);
        var manifesttemplatesCountUrl = baseUrl + "/omsservices/webapi/manifesttemplates/count";
        $http.get(manifesttemplatesCountUrl).success(function(data) {
            $scope.manifestTemplatesCount = data;
            console.log($scope.manifestTemplatesCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.manifestTemplatesCount); // dummy array of items to be paged
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
                    $scope.size = $scope.start + 5;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfTemplates($scope.start);
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

    $scope.toggleHeaderAccordion = function() {
        $scope.headerClicked = !$scope.headerClicked;
        $scope.itemsHeaderClicked = false;
        $scope.itemsClicked = false;
        $scope.footerClicked = false;
    }

    $scope.toggleItemsHeaderAccordion = function() {
        $scope.itemsHeaderClicked = !$scope.itemsHeaderClicked;
        $scope.headerClicked = false;
        $scope.itemsClicked = false;
        $scope.footerClicked = false;
    }

    $scope.toggleItemsAccordion = function() {
        $scope.itemsClicked = !$scope.itemsClicked;
        $scope.itemsHeaderClicked = false;
        $scope.headerClicked = false;
        $scope.footerClicked = false;
    }

    $scope.toggleFooterAccordion = function() {
        $scope.footerClicked = !$scope.footerClicked;
        $scope.itemsHeaderClicked = false;
        $scope.itemsClicked = false;
        $scope.headerClicked = false;
    }

    $scope.fetchBarCode = function(id) {
        var barCodeUrl = baseUrl + '/omsservices/webapi/barcodeentitys/' + id + '/sampleimage';
        $http.get(barCodeUrl).success(function(data) {

            if (data != null) {
                var imgPv = data.previewLink;
                var img = "<img style='height:80px;width:80px' src=" + imgPv + " />";
                console.log(img);
                $scope.setContent(img);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });


        // var img = "<img style = 'height:80px;width:80px' src = 'images/svg/blue_add.svg' />";
        // $scope.setContent(img);
    }

    $scope.setContent = function setContent(content) {
        tinymce.execCommand('mceInsertContent', false, content);
    }

    //get customer template group
    $scope.getCompanyTmpGroup = function() {
        $scope.companyTemplateFields = [];
        var companyTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/1';
        $http.get(companyTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.companyTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for company template group
    $scope.toggleCompanyRow = function() {
        console.log($scope.companyClicked);
        $scope.companyClicked = !$scope.companyClicked;
        $scope.barCodeClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //accordion for company template group
    $scope.toggleBarCodeRow = function() {
        console.log($scope.barCodeClicked);
        $scope.barCodeClicked = !$scope.barCodeClicked;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get barcode template group
    $scope.getBarCodeTmpGroup = function() {
        $scope.barCodeTemplateFields = [];
        var barCodeTmpGroupUrl = baseUrl + '/omsservices/webapi/barcodeentitys';
        $http.get(barCodeTmpGroupUrl).success(function(data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                $scope.barCodeTemplateFields.push(data[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //get salechannel template group
    $scope.getSaleChannelTmpGroup = function() {
        $scope.salechannelTemplateFields = [];
        var salechannelTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/2';
        $http.get(salechannelTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.salechannelTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for salechannel template group
    $scope.toggleSaleChannelRow = function() {
        console.log($scope.salechannelClicked);
        $scope.salechannelClicked = !$scope.salechannelClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get customer template group
    $scope.getCustomerTmpGroup = function() {
        $scope.customerTemplateFields = [];
        var customerTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/3';
        $http.get(customerTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.customerTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for customer template group
    $scope.toggleCustomerRow = function() {
        console.log($scope.customerClicked);
        $scope.customerClicked = !$scope.customerClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get order template group
    $scope.getOrderTmpGroup = function() {
        $scope.orderTemplateFields = [];
        var orderTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/4';
        $http.get(orderTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.orderTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for customer template group
    $scope.toggleOrderRow = function() {
        console.log($scope.orderClicked);
        $scope.orderClicked = !$scope.orderClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get shipping template group
    $scope.getShippingTmpGroup = function() {
        $scope.shippingTemplateFields = [];
        var shippingTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/5';
        $http.get(shippingTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.shippingTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for shipping template group
    $scope.toggleShippingRow = function() {
        console.log($scope.shippingClicked);
        $scope.shippingClicked = !$scope.shippingClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get shipping template group
    $scope.getOrderItemsTmpGroup = function() {
        $scope.orderitemsTemplateFields = [];
        var orderitemsTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/6';
        $http.get(orderitemsTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.orderitemsTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for shipping template group
    $scope.toggleOrderItemsRow = function() {
        console.log($scope.orderitemsClicked);
        $scope.orderitemsClicked = !$scope.orderitemsClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get vendor template group
    $scope.getVendorTmpGroup = function() {
        $scope.vendorTemplateFields = [];
        var vendorTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/7';
        $http.get(vendorTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.vendorTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for vendor template group
    $scope.toggleVendorRow = function() {
        console.log($scope.vendorClicked);
        $scope.vendorClicked = !$scope.vendorClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get warehouse template group
    $scope.getWarehouseTmpGroup = function() {
        $scope.warehouseTemplateFields = [];
        var warehouseTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/8';
        $http.get(warehouseTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.warehouseTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for warehouse template group
    $scope.toggleWarehouseRow = function() {
        console.log($scope.warehouseClicked);
        $scope.warehouseClicked = !$scope.warehouseClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.poClicked = false;
        $scope.stClicked = false;
    }

    //get po template group
    $scope.getPoTmpGroup = function() {
        $scope.poTemplateFields = [];
        var poTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/9';
        $http.get(poTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.poTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //accordion for po template group
    $scope.togglePoRow = function() {
        console.log($scope.poClicked);
        $scope.poClicked = !$scope.poClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.stClicked = false;
    }

    //get st template group
    $scope.getSTTmpGroup = function() {
        $scope.stTemplateFields = [];
        var stTmpGroupUrl = baseUrl + '/omsservices/webapi/templategroup/10';
        $http.get(stTmpGroupUrl).success(function(data) {
            for (var i = 0; i < data.tableTemplateFields.length; i++) {
                $scope.stTemplateFields.push(data.tableTemplateFields[i].tableTemplateFieldString);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //accordion for st template group
    $scope.toggleSTRow = function() {
        console.log($scope.stClicked);
        $scope.stClicked = !$scope.stClicked;
        $scope.barCodeClicked = false;
        $scope.companyClicked = false;
        $scope.salechannelClicked = false;
        $scope.customerClicked = false;
        $scope.orderClicked = false;
        $scope.shippingClicked = false;
        $scope.orderitemsClicked = false;
        $scope.vendorClicked = false;
        $scope.warehouseClicked = false;
        $scope.poClicked = false;
    };

    //edit code for invoice templates
    $scope.openInvoiceTemplateBindedDataEdit = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/invoicetemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.tinymceModel = data.tableSalesChannelClientInvoiceTemplateOrderHeader;
                templateData.tinymceModel1 = data.tableSalesChannelClientInvoiceTemplateOrderItemsHeader;
                templateData.tinymceModel2 = data.tableSalesChannelClientInvoiceTemplateOrderItems;
                templateData.tinymceModel3 = data.tableSalesChannelClientInvoiceTemplateOrderFooter;
                templateData.idtableSalesChannelClientInvoiceTemplateId = data.idtableSalesChannelClientInvoiceTemplateId;
                console.log(templateData);
                if (data.tableSalesChannelClientInvoiceTemplateIsEditable == false) {
                    templateData.templateName = data.tableSalesChannelClientInvoiceTemplateName;
                    $scope.isEditable = true;
                }

                if (data.tableSalesChannelClientInvoiceTemplateIsEditable == true) {
                    templateData.templateName = data.tableSalesChannelClientInvoiceTemplateName;
                    $scope.isEditable = false;
                }
                $scope.invoicetemplatesData = templateData;
                if ($scope.invoicetemplatesData != null) {
                    $scope.invoicemode = 'edit';
                    $scope.showInvoiceAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //copy code for invoice templates
    $scope.openInvoiceTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/invoicetemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableSalesChannelClientInvoiceTemplateName + " Copy";
                templateData.tinymceModel = data.tableSalesChannelClientInvoiceTemplateOrderHeader;
                templateData.tinymceModel1 = data.tableSalesChannelClientInvoiceTemplateOrderItemsHeader;
                templateData.tinymceModel2 = data.tableSalesChannelClientInvoiceTemplateOrderItems;
                templateData.tinymceModel3 = data.tableSalesChannelClientInvoiceTemplateOrderFooter;
                console.log(templateData);
                $scope.invoicetemplatesData = templateData;
                if ($scope.invoicetemplatesData != null) {
                    $scope.invoicemode = 'copy';
                    $scope.showInvoiceAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.getInvoiceTemplateBindedData = function(id) {
        var q = $q.defer();
        var templateIdUrl = baseUrl + '/omsservices/webapi/invoicetemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {

            if (data) {
                var templateData = {};
                templateData.tinymceModel = data.tableSalesChannelClientInvoiceTemplateOrderHeader;
                templateData.tinymceModel1 = data.tableSalesChannelClientInvoiceTemplateOrderItemsHeader;
                templateData.tinymceModel2 = data.tableSalesChannelClientInvoiceTemplateOrderItems;
                templateData.tinymceModel3 = data.tableSalesChannelClientInvoiceTemplateOrderFooter;
                templateData.idtableSalesChannelClientInvoiceTemplateId = data.idtableSalesChannelClientInvoiceTemplateId;
                templateData.templateName = data.tableSalesChannelClientInvoiceTemplateName;
                console.log(templateData);
                $scope.isEditable = !data.tableSalesChannelClientInvoiceTemplateIsEditable;
                $scope.invoicetemplatesData = templateData;
                q.resolve(true);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            q.reject(false);

        });
        return q.promise;
    };


    //=========================================== created manifest template preview ======================== //

    $scope.openManifestTemplateBindedDataEdit = function(id, $event) {
            console.log(id);
            var templateIdUrl = baseUrl + '/omsservices/webapi/manifesttemplates/' + id;
            $http.get(templateIdUrl).success(function(data) {
                console.log(data);
                if (data) {
                    var templateData = {};
                    templateData.tinymceModel = data.tableClientManifestTemplateHeader;
                    templateData.tinymceModel1 = data.tableClientManifestTemplateItemsHeader;
                    templateData.tinymceModel2 = data.tableClientManifestTemplateItems;
                    templateData.tinymceModel3 = data.tableClientManifestTemplateFooter;
                    templateData.idtableSalesChannelClientInvoiceTemplateId = data.idtableClientManifestTemplateId;
                    console.log(templateData);
                    if (data.tableClientManifestTemplateIsEditable == false) {
                        templateData.templateName = data.tableClientManifestTemplateName;
                        $scope.isEditable = true;
                    }

                    if (data.tableClientManifestTemplateIsEditable == true) {
                        templateData.templateName = data.tableClientManifestTemplateName;
                        $scope.isEditable = false;
                    }
                    $scope.manifesttemplatesData = templateData;
                    if ($scope.manifesttemplatesData != null) {
                        $scope.manifestmode = 'edit';
                        $scope.showManifestAddTemplate($event);
                    }
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);

            });
        }
        //========================================= ends here ========================================== //

    //========================================= copy manifest template data ========================= //

    $scope.openManifestTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/manifesttemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            console.log(data);
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableClientManifestTemplateName + " Copy";
                templateData.tinymceModel = data.tableClientManifestTemplateHeader;
                templateData.tinymceModel1 = data.tableClientManifestTemplateItemsHeader;
                templateData.tinymceModel2 = data.tableClientManifestTemplateItems;
                templateData.tinymceModel3 = data.tableClientManifestTemplateFooter;
                console.log(templateData);
                $scope.manifesttemplatesData = templateData;
                if ($scope.manifesttemplatesData != null) {
                    console.log($scope.manifesttemplatesData)
                    $scope.manifestmode = 'copy';
                    $scope.showManifestAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //copy code for email templates
    $scope.openEmailTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/emailtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableSalesChannelClientEmailTemplateName + " Copy";
                templateData.tinymceModel = data.tableSalesChannelClientEmailTemplateSubject;
                templateData.tinymceModel1 = data.tableSalesChannelClientEmailTemplateMessage;
                console.log(templateData);
                $scope.emailtemplatesData = templateData;
                if ($scope.emailtemplatesData != null) {
                    $scope.emailmode = 'copy';
                    $scope.showEmailAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //edit code for email templates
    $scope.openEmailTemplateBindedDataEdit = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/emailtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.tinymceModel = data.tableSalesChannelClientEmailTemplateSubject;
                templateData.tinymceModel1 = data.tableSalesChannelClientEmailTemplateMessage;
                templateData.idtableSalesChannelClientEmailTemplateId = data.idtableSalesChannelClientEmailTemplateId;
                console.log(templateData);
                if (data.tableSalesChannelClientEmailTemplateIsEditable == false) {
                    templateData.templateName = data.tableSalesChannelClientEmailTemplateName;
                    $scope.isEditable = true;
                }

                if (data.tableSalesChannelClientEmailTemplateIsEditable == true) {
                    templateData.templateName = data.tableSalesChannelClientEmailTemplateName;
                    $scope.isEditable = false;
                }
                $scope.emailtemplatesData = templateData;
                if ($scope.emailtemplatesData != null) {
                    $scope.emailmode = 'edit';
                    $scope.showEmailAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //copy code for packing templates
    $scope.openPackingTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/packingtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableSalesChannelClientPackingTemplateName + " Copy";
                templateData.tinymceModel = data.tableSalesChannelClientPackingTemplateOrderHeader;
                templateData.tinymceModel1 = data.tableSalesChannelClientPackingTemplateOrderItemsHeader;
                templateData.tinymceModel2 = data.tableSalesChannelClientPackingTemplateOrderItems;
                templateData.tinymceModel3 = data.tableSalesChannelClientPackingTemplateOrderFooter;
                console.log(templateData);
                $scope.packingtemplatesData = templateData;
                if ($scope.packingtemplatesData != null) {
                    $scope.packingmode = 'copy';
                    $scope.showPackingAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //edit code for packing templates
    $scope.openPackingTemplateBindedDataEdit = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/packingtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.tinymceModel = data.tableSalesChannelClientPackingTemplateOrderHeader;
                templateData.tinymceModel1 = data.tableSalesChannelClientPackingTemplateOrderItemsHeader;
                templateData.tinymceModel2 = data.tableSalesChannelClientPackingTemplateOrderItems;
                templateData.tinymceModel3 = data.tableSalesChannelClientPackingTemplateOrderFooter;
                templateData.idtableSalesChannelClientPackingTemplateId = data.idtableSalesChannelClientPackingTemplateId;
                console.log(templateData);
                if (data.tableSalesChannelClientPackingTemplateIsEditable == false) {
                    templateData.templateName = data.tableSalesChannelClientPackingTemplateName;
                    $scope.isEditable = true;
                }

                if (data.tableSalesChannelClientPackingTemplateIsEditable == true) {
                    templateData.templateName = data.tableSalesChannelClientPackingTemplateName;
                    $scope.isEditable = false;
                }
                $scope.packingtemplatesData = templateData;
                if ($scope.packingtemplatesData != null) {
                    $scope.packingmode = 'edit';
                    $scope.showPackingAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //copy code for shipping templates
    $scope.openShippingTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/shippingtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableClientShippingLabelTemplateName + " Copy";
                templateData.tinymceModel = data.tableClientShippingLabelTemplateHeader;
                templateData.tinymceModel1 = data.tableClientShippingLabelTemplateBody;
                templateData.tinymceModel2 = data.tableClientShippingLabelTemplateFooter;
                console.log(templateData);
                $scope.shippingtemplatesData = templateData;
                if ($scope.shippingtemplatesData != null) {
                    $scope.shippingmode = 'copy';
                    $scope.showShippingAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //edit code for invoice templates
    $scope.openShippingTemplateBindedDataEdit = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/shippingtemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.tinymceModel = data.tableClientShippingLabelTemplateHeader;
                templateData.tinymceModel1 = data.tableClientShippingLabelTemplateBody;
                templateData.tinymceModel2 = data.tableClientShippingLabelTemplateFooter;
                templateData.idtableClientShippingLabelTemplateId = data.idtableClientShippingLabelTemplateId;
                console.log(templateData);
                if (data.tableClientShippingLabelTemplateIsEditable == false) {
                    templateData.templateName = data.tableClientShippingLabelTemplateName;
                    $scope.isEditable = true;
                }

                if (data.tableClientShippingLabelTemplateIsEditable == true) {
                    templateData.templateName = data.tableClientShippingLabelTemplateName;
                    $scope.isEditable = false;
                }
                $scope.shippingtemplatesData = templateData;
                if ($scope.shippingtemplatesData != null) {
                    $scope.shippingmode = 'edit';
                    $scope.showShippingAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //copy code for sticker templates
    $scope.openStickerTemplateBindedDataCopy = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/stickertemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.templateName = data.tableStickerTemplateName + " Copy";
                templateData.tableStickerTemplateHeightMm = data.tableStickerTemplateHeightMm;
                templateData.tableStickerTemplateWidthMm = data.tableStickerTemplateWidthMm;
                templateData.tinymceModel = data.tableStickerTemplateHeader;
                templateData.tinymceModel1 = data.tableStickerTemplateBody;
                templateData.tinymceModel2 = data.tableStickerTemplateFooter;
                console.log(templateData);
                $scope.stickerTemplatesData = templateData;
                if ($scope.stickerTemplatesData != null) {
                    $scope.stickermode = 'copy';
                    $scope.showStickerAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    //edit code for sticker templates
    $scope.openStickerTemplateBindedDataEdit = function(id, $event) {
        var templateIdUrl = baseUrl + '/omsservices/webapi/stickertemplates/' + id;
        $http.get(templateIdUrl).success(function(data) {
            if (data) {
                var templateData = {};
                templateData.tableStickerTemplateHeightMm = data.tableStickerTemplateHeightMm;
                templateData.tableStickerTemplateWidthMm = data.tableStickerTemplateWidthMm;
                templateData.tinymceModel = data.tableStickerTemplateHeader;
                templateData.tinymceModel1 = data.tableStickerTemplateBody;
                templateData.tinymceModel2 = data.tableStickerTemplateFooter;
                templateData.idtableStickerTemplateId = data.idtableStickerTemplateId;
                console.log(templateData);
                if (data.tableStickerTemplateIsEditable == false) {
                    templateData.templateName = data.tableStickerTemplateName;
                    $scope.isEditable = true;
                }

                if (data.tableStickerTemplateIsEditable == true) {
                    templateData.templateName = data.tableStickerTemplateName;
                    $scope.isEditable = false;
                }
                $scope.stickerTemplatesData = templateData;
                if ($scope.stickerTemplatesData != null) {
                    $scope.stickermode = 'edit';
                    $scope.showStickerAddTemplate($event);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    }

    $scope.templateNameChanged = function(templateName) {
        if (!templateName) {
            $scope.isTemplateNameEntered = true;
        } else {
            $scope.isTemplateNameEntered = false;
        }
    };

    //saveInvoiceTemplate to OMS Backend
    $scope.saveInvoiceTemplate = function(invdata) {
        $scope.invoicetemplatesData = invdata;
        console.log($scope.invoicetemplatesData);
        if (!$scope.invoicetemplatesData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!$scope.invoicetemplatesData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if ($scope.invoicetemplatesData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableSalesChannelClientInvoiceTemplateName": $scope.invoicetemplatesData.templateName,
                "tableSalesChannelClientInvoiceTemplateOrderHeader": $scope.invoicetemplatesData.tinymceModel,
                "tableSalesChannelClientInvoiceTemplateOrderItemsHeader": $scope.invoicetemplatesData.tinymceModel1,
                "tableSalesChannelClientInvoiceTemplateOrderItems": $scope.invoicetemplatesData.tinymceModel2,
                "tableSalesChannelClientInvoiceTemplateOrderFooter": $scope.invoicetemplatesData.tinymceModel3,
                "tableSalesChannelClientInvoiceTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/invoicetemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.invoicetemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfInvoiceTemplates();
                    $scope.listOfInvoiceTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Invoice Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Invoice Template Cannot be Added");
                }
            });
        }
    };

    $scope.previewInvoice = function(indata) {
        $scope.invoicetemplatesData = indata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableSalesChannelClientInvoiceTemplateName": $scope.invoicetemplatesData.templateName,
            "tableSalesChannelClientInvoiceTemplateOrderHeader": $scope.invoicetemplatesData.tinymceModel,
            "tableSalesChannelClientInvoiceTemplateOrderItemsHeader": $scope.invoicetemplatesData.tinymceModel1,
            "tableSalesChannelClientInvoiceTemplateOrderItems": $scope.invoicetemplatesData.tinymceModel2,
            "tableSalesChannelClientInvoiceTemplateOrderFooter": $scope.invoicetemplatesData.tinymceModel3,
            "tableSalesChannelClientInvoiceTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/invoicetemplates/invoiceslippreview',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $scope.respParameter = res.previewLink;


            $scope.previewTemp = baseUrl + '/omsservices/webapi/invoicetemplates/invoiceslippreviewfile?relativepath=' + $scope.respParameter;
            $('#PreviewInvoice').modal('show');
            console.log($scope.previewTemp);

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
                });

        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Invoice Template Cannot be Added");
            }
        });
    }




    //================================================= save and Preview Manifest Templates =========================== //

    $scope.saveManifestTemplate = function(invdata) {
        $scope.ManifesttemplatesData = invdata;
        console.log($scope.invoicetemplatesData);
        if (!$scope.ManifesttemplatesData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!$scope.ManifesttemplatesData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if ($scope.ManifesttemplatesData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableClientManifestTemplateName": $scope.ManifesttemplatesData.templateName,
                "tableClientManifestTemplateHeader": $scope.ManifesttemplatesData.tinymceModel,
                "tableClientManifestTemplateItemsHeader": $scope.ManifesttemplatesData.tinymceModel1,
                "tableClientManifestTemplateItems": $scope.ManifesttemplatesData.tinymceModel2,
                "tableClientManifestTemplateFooter": $scope.ManifesttemplatesData.tinymceModel3,
                "tableClientManifestTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/manifesttemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.manifesttemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfTemplates();
                    $scope.listOfTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Manifest Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Manifest Template Cannot be Added");
                }
            });
        }
    };

    $scope.previewManifest = function(indata) {
        $scope.manifesttemplatesData = indata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableClientManifestTemplateName": $scope.manifesttemplatesData.templateName,
            "tableClientManifestTemplateHeader": $scope.manifesttemplatesData.tinymceModel,
            "tableClientManifestTemplateItemsHeader": $scope.manifesttemplatesData.tinymceModel1,
            "tableClientManifestTemplateItems": $scope.manifesttemplatesData.tinymceModel2,
            "tableClientManifestTemplateFooter": $scope.manifesttemplatesData.tinymceModel3,
            "tableClientManifestTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/manifesttemplates/manifestslippreview',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            //growl.success("Manifest Template Saved Successfully");
            $scope.respParameter = res.previewLink;
            $scope.previewTemp = baseUrl + '/omsservices/webapi/manifesttemplates/manifestslippreviewfile?relativepath=' + $scope.respParameter;
            console.log($scope.previewTemp);
            $('#PreviewMenifest').modal('show');

            $http.get($scope.previewTemp, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {
                    var file = new Blob([(response)], {
                        type: 'application/pdf'
                    });
                    var fileURL = URL.createObjectURL(file);
                    $scope.content = $sce.trustAsResourceUrl(fileURL);
                });

        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Invoice Template Cannot be Added");
            }
        });
    }


    //============================================ packing preview template ============================ //


    $scope.previewpacking = function(indata) {

        $scope.invoicetemplatesData = indata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableSalesChannelClientPackingTemplateName": $scope.packingtemplatesData.templateName,
            "tableSalesChannelClientPackingTemplateOrderHeader": $scope.packingtemplatesData.tinymceModel,
            "tableSalesChannelClientPackingTemplateOrderItemsHeader": $scope.packingtemplatesData.tinymceModel1,
            "tableSalesChannelClientPackingTemplateOrderItems": $scope.packingtemplatesData.tinymceModel2,
            "tableSalesChannelClientPackingTemplateOrderFooter": $scope.packingtemplatesData.tinymceModel3,
            "tableSalesChannelClientPackingTemplateIsEditable": true
        }
        console.log(data);
        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/packingtemplates/packingslippreview',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $scope.respParameter = res.previewLink;


            $scope.previewTemp = baseUrl + '/omsservices/webapi/packingtemplates/packingslippreviewfile?relativepath=' + $scope.respParameter;
            $('#PreviewPacking').modal('show');

            $http.get($scope.previewTemp, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {

                    var file = new Blob([(response)], {
                        type: 'application/pdf'
                    });
                    var fileURL = URL.createObjectURL(file);
                    $scope.content = $sce.trustAsResourceUrl(fileURL);
                });

        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Invoice Template Cannot be Added");
            }
        });
    }

    //================================ ends ============================================//


    //=================================== preview sticker template ================================ //

    $scope.previewSticker = function(indata) {
        $scope.invoicetemplatesData = indata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableStickerTemplateName": $scope.packingtemplatesData.templateName,
            "tableStickerTemplateHeightMm": $scope.packingtemplatesData.tableStickerTemplateHeightMm,
            "tableStickerTemplateWidthMm": $scope.packingtemplatesData.tableStickerTemplateWidthMm,
            "tableStickerTemplateHeader": $scope.packingtemplatesData.tinymceModel,
            "tableStickerTemplateBody": $scope.packingtemplatesData.tinymceModel1,
            "tableStickerTemplateFooter": $scope.packingtemplatesData.tinymceModel2
        }

        console.log(data);
        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/packingtemplates/packingslippreview',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            $scope.respParameter = res.previewLink;


            $scope.previewTemp = baseUrl + '/omsservices/webapi/packingtemplates/packingslippreviewfile?relativepath=' + $scope.respParameter;
            $('#PreviewSticker').modal('show');


            $http.get($scope.previewTemp, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {
                    var file = new Blob([(response)], {
                        type: 'application/pdf'
                    });
                    var fileURL = URL.createObjectURL(file);
                    $scope.content = $sce.trustAsResourceUrl(fileURL);
                });

        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Invoice Template Cannot be Added");
            }
        });
    }

    //================================================== ends =============================================//




    $scope.editInvoiceTemplate = function(invdata) {
        $scope.invoicetemplatesData = invdata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableSalesChannelClientInvoiceTemplateName": $scope.invoicetemplatesData.templateName,
            "tableSalesChannelClientInvoiceTemplateOrderHeader": $scope.invoicetemplatesData.tinymceModel,
            "tableSalesChannelClientInvoiceTemplateOrderItemsHeader": $scope.invoicetemplatesData.tinymceModel1,
            "tableSalesChannelClientInvoiceTemplateOrderItems": $scope.invoicetemplatesData.tinymceModel2,
            "tableSalesChannelClientInvoiceTemplateOrderFooter": $scope.invoicetemplatesData.tinymceModel3,
            "tableSalesChannelClientInvoiceTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/invoicetemplates/' + $scope.invoicetemplatesData.idtableSalesChannelClientInvoiceTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.invoicetemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfInvoiceTemplates();
                $scope.listOfInvoiceTemplatesCount($scope.vmPager.currentPage);
                growl.success("Invoice Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Invoice Template Cannot be Updated");
            }
        });
    }



    $scope.editManifestTemplate = function(invdata) {
        $scope.invoicetemplatesData = invdata;
        console.log($scope.invoicetemplatesData);
        var data = {
            "tableClientManifestTemplateName": $scope.manifesttemplatesData.templateName,
            "tableClientManifestTemplateHeader": $scope.manifesttemplatesData.tinymceModel,
            "tableClientManifestTemplateItemsHeader": $scope.manifesttemplatesData.tinymceModel1,
            "tableClientManifestTemplateItems": $scope.manifesttemplatesData.tinymceModel2,
            "tableClientManifestTemplateFooter": $scope.manifesttemplatesData.tinymceModel3,
            "tableClientManifestTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/manifesttemplates/' + $scope.invoicetemplatesData.idtableSalesChannelClientInvoiceTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.manifesttemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfTemplates();
                $scope.listOfTemplatesCount($scope.vmPager.currentPage);
                growl.success("Manifest Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Manifest Template Cannot be Updated");
            }
        });
    }


    //savePackingTemplate to OMS Backend
    $scope.savePackingTemplate = function(packdata) {
        $scope.packingtemplatesData = packdata;
        if (!$scope.packingtemplatesData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!$scope.packingtemplatesData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if ($scope.packingtemplatesData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableSalesChannelClientPackingTemplateName": $scope.packingtemplatesData.templateName,
                "tableSalesChannelClientPackingTemplateOrderHeader": $scope.packingtemplatesData.tinymceModel,
                "tableSalesChannelClientPackingTemplateOrderItemsHeader": $scope.packingtemplatesData.tinymceModel1,
                "tableSalesChannelClientPackingTemplateOrderItems": $scope.packingtemplatesData.tinymceModel2,
                "tableSalesChannelClientPackingTemplateOrderFooter": $scope.packingtemplatesData.tinymceModel3,
                "tableSalesChannelClientPackingTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/packingtemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.packingtemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfPackingTemplates();
                    $scope.listOfPackingTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Packing Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Packing Template Cannot be Added");
                }
            });
        }
    }




    //===================================== end =======================================//


    $scope.editPackingTemplate = function(packdata) {
        $scope.packingtemplatesData = packdata;
        var data = {
            "tableSalesChannelClientPackingTemplateName": $scope.packingtemplatesData.templateName,
            "tableSalesChannelClientPackingTemplateOrderHeader": $scope.packingtemplatesData.tinymceModel,
            "tableSalesChannelClientPackingTemplateOrderItemsHeader": $scope.packingtemplatesData.tinymceModel1,
            "tableSalesChannelClientPackingTemplateOrderItems": $scope.packingtemplatesData.tinymceModel2,
            "tableSalesChannelClientPackingTemplateOrderFooter": $scope.packingtemplatesData.tinymceModel3,
            "tableSalesChannelClientPackingTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/packingtemplates/' + $scope.packingtemplatesData.idtableSalesChannelClientPackingTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.packingtemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfPackingTemplates();
                $scope.listOfPackingTemplatesCount($scope.vmPager.currentPage);
                growl.success("Packing Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Packing Template Cannot be Updated");
            }
        });
    }

    //saveEmailTemplate to OMS Backend
    $scope.saveEmailTemplate = function(emaildata) {
        $scope.emailtemplatesData = emaildata;
        if (!$scope.emailtemplatesData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!$scope.emailtemplatesData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if ($scope.emailtemplatesData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableSalesChannelClientEmailTemplateName": $scope.emailtemplatesData.templateName,
                "tableSalesChannelClientEmailTemplateSubject": $scope.emailtemplatesData.tinymceModel,
                "tableSalesChannelClientEmailTemplateMessage": $scope.emailtemplatesData.tinymceModel1,
                "tableSalesChannelClientEmailTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/emailtemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.emailtemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfEmailTemplates();
                    $scope.listOfEmailTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Email Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Email Template Cannot be Added");
                }
            });
        }
    };


    //$scope.previewemail = function(emaildata) {
    //    $scope.emailtemplatesData = emaildata;
    //    var data = {
    //        "tableSalesChannelClientEmailTemplateName": $scope.emailtemplatesData.templateName,
    //        "tableSalesChannelClientEmailTemplateSubject": $scope.emailtemplatesData.tinymceModel,
    //        "tableSalesChannelClientEmailTemplateMessage": $scope.emailtemplatesData.tinymceModel1,
    //        "tableSalesChannelClientEmailTemplateIsEditable": true
    //    }
    //
    //    console.log(data);
    //    $http({
    //        method: 'POST',
    //        url: baseUrl + '/omsservices/webapi/emailtemplates',
    //        data: data,
    //        headers: {
    //            'Content-Type': 'application/json'
    //        }
    //    }).success(function(res) {
    //        console.log(res);
    //        growl.success("Email Template Saved Successfully");
    //        //if (res) {
    //        //    $scope.emailtemplatesData = "";
    //        //    $scope.closeAllAccordions();
    //        //    $scope.listOfEmailTemplates();
    //        //    growl.success("Email Template Saved Successfully");
    //        //}
    //    }).error(function(error,status) {
    //        console.log(error);
    // console.log(status);
    // if (status == 401) {
    ////     $('#AuthError').modal('show');
    //growl.error('Your session has been expired. You need to Login again.');
    //$cookies.put('isLoggedIn',false);
    //     $location.path('/login');
    // }
    //        growl.error("Email Template Cannot be Added");
    //    });
    //}


    $scope.editEmailTemplate = function(emaildata) {
        $scope.emailtemplatesData = emaildata;
        var data = {
            "tableSalesChannelClientEmailTemplateName": $scope.emailtemplatesData.templateName,
            "tableSalesChannelClientEmailTemplateSubject": $scope.emailtemplatesData.tinymceModel,
            "tableSalesChannelClientEmailTemplateMessage": $scope.emailtemplatesData.tinymceModel1,
            "tableSalesChannelClientEmailTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/emailtemplates/' + $scope.emailtemplatesData.idtableSalesChannelClientEmailTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.emailtemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfEmailTemplates();
                $scope.listOfEmailTemplatesCount($scope.vmPager.currentPage);
                growl.success("Email Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Email Template Cannot be Updated");
            }
        });
    }

    //saveShippingTemplate to OMS Backend
    $scope.saveShippingTemplate = function(shipData) {
        $scope.shippingtemplatesData = shipData;
        if (!$scope.shippingtemplatesData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!$scope.shippingtemplatesData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if ($scope.shippingtemplatesData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableClientShippingLabelTemplateName": $scope.shippingtemplatesData.templateName,
                "tableClientShippingLabelTemplateHeader": $scope.shippingtemplatesData.tinymceModel,
                "tableClientShippingLabelTemplateBody": $scope.shippingtemplatesData.tinymceModel1,
                "tableClientShippingLabelTemplateFooter": $scope.shippingtemplatesData.tinymceModel2,
                "tableClientShippingLabelTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/shippingtemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.shippingtemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfShippingTemplates();
                    $scope.listOfShippingTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Shipping Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Shipping Template Cannot be Added");
                }
            });
        }
    };

    //editShippingTemplate to OMS Backend
    $scope.editShippingTemplate = function(shipData) {
        $scope.shippingtemplatesData = shipData;
        var data = {
            "tableClientShippingLabelTemplateName": $scope.shippingtemplatesData.templateName,
            "tableClientShippingLabelTemplateHeader": $scope.shippingtemplatesData.tinymceModel,
            "tableClientShippingLabelTemplateBody": $scope.shippingtemplatesData.tinymceModel1,
            "tableClientShippingLabelTemplateFooter": $scope.shippingtemplatesData.tinymceModel2,
            "tableClientShippingLabelTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/shippingtemplates/' + $scope.shippingtemplatesData.idtableClientShippingLabelTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.shippingtemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfShippingTemplates();
                $scope.listOfShippingTemplatesCount($scope.vmPager.currentPage);
                growl.success("Shipping Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Shipping Template Cannot be Updated");
            }
        });
    }

    //===================================== ends here  ========================================= //


    //saveShippingTemplate to OMS Backend
    $scope.saveStickerTemplate = function(templateData) {
        if (!templateData) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (!templateData.templateName) {
            growl.error("Please enter the Template Name");
            $scope.isTemplateNameEntered = true;
        } else if (templateData.templateName.length > 45) {
            growl.error("Template Name cannot be greater than 45 characters");
            $scope.isTemplateNameEntered = true;
        } else {
            var data = {
                "tableStickerTemplateName": templateData.templateName,
                "tableStickerTemplateHeightMm": templateData.tableStickerTemplateHeightMm,
                "tableStickerTemplateWidthMm": templateData.tableStickerTemplateWidthMm,
                "tableStickerTemplateHeader": templateData.tinymceModel,
                "tableStickerTemplateBody": templateData.tinymceModel1,
                "tableStickerTemplateFooter": templateData.tinymceModel2,
                "tableStickerTemplateIsEditable": true
            }

            console.log(data);
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/stickertemplates',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    if ($scope.stickerTotalMode == 'new') {
                        $scope.showAddStickerDialog(event);
                    }
                    $scope.stickerTemplatesData = "";
                    $scope.closeAllAccordions();
                    // $scope.listOfStickerTemplates();
                    $scope.listOfStickerTemplatesCount($scope.vmPager.currentPage);
                    growl.success("Sticker Template Saved Successfully");
                }
            }).error(function(error, status) {
                console.log(error);
                console.log(status);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Sticker Template Cannot be Added");
                }
            });
        }
    }

    //editShippingTemplate to OMS Backend
    $scope.editStickerTemplate = function(stickerData) {
        $scope.stickerTemplatesData = stickerData;
        var data = {
            "tableStickerTemplateName": $scope.stickerTemplatesData.templateName,
            "tableStickerTemplateHeightMm": $scope.stickerTemplatesData.tableStickerTemplateHeightMm,
            "tableStickerTemplateWidthMm": $scope.stickerTemplatesData.tableStickerTemplateWidthMm,
            "tableStickerTemplateHeader": $scope.stickerTemplatesData.tinymceModel,
            "tableStickerTemplateBody": $scope.stickerTemplatesData.tinymceModel1,
            "tableStickerTemplateFooter": $scope.stickerTemplatesData.tinymceModel2,
            "tableStickerTemplateIsEditable": true
        }

        console.log(data);
        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/stickertemplates/' + $scope.stickerTemplatesData.idtableStickerTemplateId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                if ($scope.stickerTotalMode == 'new') {
                    $scope.showAddStickerDialog(event);
                }
                $scope.stickerTemplatesData = "";
                $scope.closeAllAccordions();
                // $scope.listOfStickerTemplates();
                $scope.listOfStickerTemplatesCount($scope.vmPager.currentPage);
                growl.success("Sticker Template Updated Successfully");
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Sticker Template Cannot be Updated");
            }
        });
    }

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
}
