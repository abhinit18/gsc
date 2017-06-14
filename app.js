var myApp = angular.module('tableApp', ['ngRoute', 'ngMaterial', 'ngCsvImport',
                                        'dndLists', 'ui.sortable' , 'ngStepwise', 'angucomplete-alt', 'angucomplete-alt-long',
                                        'angular-growl', 'ngAnimate','angular-loading-bar', 'ngFileUpload',
                                        'nvd3', 'ui.tinymce', 'ngCookies', 'offClick', 'ui.bootstrap','rzModule','ui.select','ngSanitize'
]);

var ip = {
    'baseUrlSource':'https://devbackend.gscmaven.com:8443',
    's3':'https://s3-us-west-2.amazonaws.com/glmetadata/'
};


myApp.constant('filePathUrl',ip.baseUrlSource+'/omsservices/webapi/saleschannels/file?path=');
myApp.constant('commonPathUrl',ip.baseUrlSource+'/omsservices/webapi/common/file?path=');
myApp.constant('baseUrl', ip.baseUrlSource);
myApp.constant('downloadSTOTemplateUrl', ip.baseUrlSource+'/omsservices/webapi/stock/transfer/gettemplateforstocktransfer');
myApp.constant('downloadOrderTemplateUrl', ip.baseUrlSource+'/omsservices/webapi/orders/bulkuploadtemplate');
myApp.constant('downloadSkuTemplateUrl', ip.s3+'templates/Glaucus_SKU_Bulk_Upload_Template.xls');
myApp.constant('downloadMastersTemplateUrl', ip.s3+'templates/Glaucus_Masters_SKU_Customer_Vendor_Bulk_Upload_Template.xls');
myApp.constant('downloadCustomersTemplateUrl', ip.s3+'templates/Glaucus_Customer_Bulk_Upload_Template.xls');
myApp.constant('downloadVendorsTemplateUrl', ip.s3+'templates/Glaucus_Vendor_Bulk_Upload_Template.xls');
myApp.constant('downloadPOTemplateUrl', ip.s3+'templates/Glaucus_PO_Bulk_Upload_Template.xls');
myApp.constant('downloadBulkCancelTemplateUrl', ip.s3+'templates/Glaucus_Sale_Order_Bulk_Cancel_Template.xls');
myApp.constant('downloadAWBTemplateUrl', ip.s3+'templates/Glaucus_Awb_Bulk_Upload_Template.xls');
myApp.constant('downloadRatesTemplateUrl', ip.s3+'templates/Glaucus_Rate_Matrix_Upload_Template.xls');
myApp.constant('downloadSkuSalesChannelMapTemplateUrl',ip.baseUrlSource+'/omsservices/webapi/saleschannels/skusaleschannelmapuploadtemplate');
myApp.constant('formsUrl', ip.s3+'forms/');

myApp.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function($routeProvider, $httpProvider, $locationProvider) {
        $httpProvider.defaults.withCredentials = true;
        $routeProvider.when('/signUp/', {
            templateUrl: 'signUp/signUp.view.html?version=1.0.0',
            controller: 'signUpController'
        }).when('/signUpSuccess/', {
            templateUrl: 'signUp/signUpSuccess/signUpSuccess.view.html?version=1.0.0',
            controller: 'signUpSuccess'
        }).when('/login/', {
            templateUrl: 'login/login.view.html?version=1.0.0',
            controller: 'loginController'
        }).when('/forgotPassword/', {
            templateUrl: 'forgotPassword/forgotPassword.view.html?version=1.0.0',
            controller: 'forgotPasswordController'
        }).when('/resetpassword', {
            templateUrl: 'resetPassword/resetPassword.view.html?version=1.0.0',
            controller: 'resetPasswordController'
        }).when('/order/', {
            templateUrl: 'order/order.view.html?version=1.0.0',
            controller: 'orderController',
            requireAuth: true
        }).when('/order/customer/:customerId', {
            templateUrl: 'order/order.view.html?version=1.0.0',
            controller: 'orderController',
            requireAuth: true
        }).when('/po/', {
            templateUrl: 'po/po.view.html?version=1.0.0',
            controller: 'poController'
        }).when('/inventory/', {
            templateUrl: 'inventory/inventory.view2.html?version=1.0.0',
            controller: 'inventoryController'
        }).when('/sku/', {
            templateUrl: 'sku/sku.view.html?version=1.0.0',
            controller: 'skuController'
        }).when('/sku/:skuLabel', {
            templateUrl: 'sku/sku.view.html?version=1.0.0',
            controller: 'skuController'
        }).when('/customer/', {
            templateUrl: 'customer/customer.view.html?version=1.0.0',
            controller: 'customerController'
        }).when('/vendor/', {
            templateUrl: 'vendor/vendor.view.html?version=1.0.0',
            controller: 'vendorController'
        }).when('/verifySuccess', {
            templateUrl: 'verify/success.html?version=1.0.0',
            controller: 'verifyUserController'
        }).when('/verifyFail', {
            templateUrl: 'verify/failure.html?version=1.0.0',
            controller: 'verifyUserController'
        }).when('/forgotPasswordSuccess/', {
            templateUrl: 'forgotPassword/forgotPasswordSuccess/forgotPasswordSuccess.view.html?version=1.0.0',
            controller: 'forgotPwdSuccessController'
        }).when('/error/', {
            templateUrl: 'errorPage/errorPage.view.html?version=1.0.0',
            controller: 'errorPageController'
        }).when('/analytics/', {
            templateUrl: 'analytics/analytics.view.html?version=1.0.0',
            controller: 'analyticsController'
        }).when('/warehouses/', {
            templateUrl: 'settings/warehouses/warehouses.view.html?version=1.0.0',
            controller: 'warehousesController'
        }).when('/saleschannels/', {
            templateUrl: 'settings/saleschannels/saleschannels.view.html?version=1.0.0',
            controller: 'saleschannelsController'
        }).when('/templates/', {
            templateUrl: 'settings/templates/templates.view.html?version=1.0.0',
            controller: 'templatesController'
        }).when('/shippingpartners/', {
            templateUrl: 'settings/shippingpartners/shippingpartners.view.html?version=1.0.0',
            controller: 'shippingpartnersController'
        }).when('/useradmin/', {
            templateUrl: 'settings/useradmin/useradmin.view.html?version=1.0.0',
            controller: 'useradminController'
        }).when('/bulkuploads/', {
            templateUrl: 'wops/bulkuploads/bulkuploads.view.html?version=1.0.0',
            controller: 'bulkuploadsController'
        }).when('/Dashboard/', {
            templateUrl: 'Dashboard/dashboard.view.html?version=1.0.0',
            controller: 'dashboardController'
        }).when('/vas/', {
            templateUrl: 'workOrderVas/workOrderTabs.view2.html?version=1.0.0',
            controller: 'workOrderVasController'
        }).when('/inventorypassbook/', {
            templateUrl: 'inventoryPassbook/passbook.view.html?version=1.0.0',
            controller: 'inventoryPassbookController'
        })
        .when('/export/', {
           templateUrl: 'wops/export/export.view.html?version=1.0.0',
            controller: 'exportController'
            })
        .when('/category/', {
                templateUrl: 'category/category.html?version=1.0.0',
                controller: 'categoryController'
        })
        .when('/inbound/', {
                templateUrl: 'wops/inbound/inbound.html?version=1.0.0',
                controller: 'inbound'
            })
        .when('/outbound/', {
                templateUrl: 'wops/outbound/outbound.html?version=1.0.0',
                controller: 'outbound'
            })
        .when('/wopsinventory/', {
                templateUrl: 'wops/wopsinventory/wopsinventory.html?version=1.0.0',
                controller: 'wopsinventory'
            })
        .when('/stocktransfer/', {
                templateUrl: 'stockTransfer/stockTransfer.html?version=1.0.0',
                controller: 'stockTransfer'
            })
        .when('/taxation/', {
                templateUrl: 'taxation/taxation.html?version=1.0.0',
                controller: 'taxationController'
        })
        .when('/discount/', {
                templateUrl: 'Discount/Discount.view.html?version=1.0.0',
                controller: 'DiscountController'
            })
         .when('/salereturn/', {
                templateUrl: 'Salereturn/salereturn.view.html?version=1.0.0',
                controller: 'salereturnController'
          })
        .when('/purchaseReturn/', {
                templateUrl: 'purchaseReturn/purchaseReturn.view.html?version=1.0.0',
                controller: 'purchaseReturnController'
        })
            .when('/returnableGoodsOrder/', {
            templateUrl: 'returnableGoodsOrder/returnableGoodsOrder.view.html?version=1.0.0',
            controller: 'returnableGoodsOrderController'
        })
        .when('/maintenance/', {
                templateUrl: 'maintenance/maintenance.html?version=1.0.0'

            })
            .when('/clientprofile/', {
                templateUrl: 'settings/clientprofile/clientprofile.view.html?version=1.0.0',
                controller: 'clientprofileController'
            })
         .otherwise({
            redirectTo: '/login'
        });

        $locationProvider.html5Mode(false);
    }
]);


myApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }]);

/*
 * =================================
 * Directive to trim thr empty space so that user can not use spave in input field
 * =================================*/
myApp.directive('trimSpace',function(){
    return {
        require:'ngModel',
        link:function(scope,el,attrs,ngModel){

//change event is fired when file is selected
            el.bind('keyup',function(){
                scope.$apply(function(){
                    ngModel.$setViewValue(el.val().trim());
                    ngModel.$render();
                })
            })
        }
    }
});
//====================================== directive for number only ===================== //
angular.module('tabsDemoDynamicHeight', ['ngMaterial']);
myApp.directive('numbersOnly', function(){
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
// this next if is necessary for when using ng-required on your input.
// In such cases, when a letter is typed first, this parser will be called
// again, and the 2nd time, the value will be undefined
                if (inputValue == undefined) return ''
                var transformedInput = inputValue.replace(/[^0-9]/g, '');
                if (transformedInput!=inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
});

//========================= first capital letter only ============= //

myApp.directive('caps', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            if (modelCtrl) {
                var capitalize = function (inputValue) {
                    if (inputValue == undefined) {
                        return '';
                    }
                    String(inputValue).trim();
                    var capitalized = String(inputValue).charAt(0).toUpperCase() +
                            String(inputValue).substring(1);
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                };
                var model = $parse(attrs.ngModel);
                modelCtrl.$parsers.push(capitalize);
                capitalize(model(scope));
            }
        }
    };
});

myApp.directive('percentage', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            };

            var toModel = function (val)
            {
                if(val)
                {

                    origval = val
                    val = val.replace(/[^0-9.]/g, '');

                    if(origval == val)
                    {
                        var percentageRegEx = new RegExp("^\\d{0,2}(\\.\\d{0,2})?$|^100$");

                        var matchedValue = percentageRegEx.exec(val);
                        if(matchedValue == null)
                        {
                            val = val.substring(0, val.length - 1);
                        }

                    }

                    updateView(val);
                    var newVal = parseFloat(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});


myApp.directive('floating', function ()
{
    return {
        require: 'ngModel',
        scope: {
           precision : '='
        },
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            };

            var toModel = function (val)
            {
                if(val)
                {

                    origval = val
                    val = val.replace(/[^0-9.]/g, '');

                    if(origval == val)
                    {
                        var floatingRegEx = new RegExp("^\\d{0,9}(\\.\\d{0,"+scope.precision+"})?$");

                        var matchedValue = floatingRegEx.exec(val);
                        if(matchedValue == null)
                        {
                            val = val.substring(0, val.length - 1);
                        }

                    }

                    updateView(val);
                    var newVal = parseFloat(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive('floating2', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            };

            var toModel = function (val)
            {
                if(val)
                {

                    origval = val
                    val = val.replace(/[^0-9.]/g, '');

                    if(origval == val)
                    {
                        var floatingRegEx = new RegExp("^\\d{0,9}(\\.\\d{0,2})?$");

                        var matchedValue = floatingRegEx.exec(val);
                        if(matchedValue == null)
                        {
                            val = val.substring(0, val.length - 1);
                        }

                    }

                    updateView(val);
                    var newVal = parseFloat(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive('capitalizeFirst', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority:1,
        link: function (scope, element, attrs, modelCtrl) {
            if (modelCtrl) {
                var capitalize = function (inputValue) {
                    if (inputValue == undefined) {
                        return '';
                    }
                    String(inputValue).trim();
                    var inputStringArray = String(inputValue).split(" ");
                    var arrlength = inputStringArray.length;
                    var capitalized = "";
                    for (var i=0; i<arrlength; i++) {
                        inputStringArray[i] = String(inputStringArray[i]).charAt(0).toUpperCase() +
                            String(inputStringArray[i]).substring(1);
                    }
                    capitalized = inputStringArray.join(" ");
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                };
                var model = $parse(attrs.ngModel);
                modelCtrl.$parsers.push(capitalize);
                capitalize(model(scope));
            }
        }
    };
});

myApp.directive('tolowercase', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (ngModel) {

                var lowerize = function (inputValue) {
                    if (!inputValue) {
                        return inputValue;
                    }
                    var lowerized = inputValue.toLowerCase();
                    if (lowerized !== inputValue) {
                        ngModel.$setViewValue(lowerized);
                        ngModel.$render();
                    }
                    return lowerized;
                };
                var model = $parse(attrs.ngModel);
                ngModel.$parsers.push(lowerize);
                lowerize(model(scope));
            }
        }
    };
});
myApp.directive('demoMap', function() {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            myModel: '=ngModel'
        },
        link: function(scope, element, attrs, ngModel) {

            var mapOptions;
            var googleMap;
            var searchMarker;
            var searchLatLng;

            ngModel.$render = function() {
                searchLatLng = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

                mapOptions = {
                    center: searchLatLng,
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                googleMap = new google.maps.Map(element[0], mapOptions);
                searchMarker = new google.maps.Marker({
                    position: searchLatLng,
                    map: googleMap,
                    draggable: true
                });

                google.maps.event.addListener(searchMarker, 'idle', function() {
                    scope.$apply(function() {
                        scope.myModel.latitude = searchMarker.getPosition().lat();
                        scope.myModel.longitude = searchMarker.getPosition().lng();
                    });
                }.bind(this));

                $('#billingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#shippingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#orderShippingAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });
                $('#vendorAddressModal').on('shown.bs.modal', function(e) {
                    var currentCenter = googleMap.getCenter(); // Get current center before resizing
                    google.maps.event.trigger(googleMap, "resize");
                    googleMap.setCenter(currentCenter); // Re-set previous center
                });

            };

            scope.$watch('myModel', function(value) {
                var myPosition = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);
                searchMarker.setPosition(myPosition);
            }, true);
        }
    }
});

myApp.config(['growlProvider', function(growlProvider) {
    growlProvider.globalReversedOrder(true);
    growlProvider.globalTimeToLive({
        success: 3000,
        error: 3000,
        warning: 3000,
        info: 3000
    });
    growlProvider.globalDisableCountDown(true);
    growlProvider.globalPosition('top-center');
}]);


myApp.config(['$httpProvider' , '$locationProvider', 'growlProvider',  function ($httpProvider, $locationProvider , growlProvider) {
    $httpProvider.interceptors.push(function ($q , $location, growl, $cookies,$rootScope) {
        return {
            'response': function (response) {
                return response;
            },
            'responseError': function (rejection) {
                if(rejection.status === 401) {
                    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
                        console.log(current);
                        console.log(next);
                        $('.modal').modal('hide');
                    });
                    growl.error('Your session is expired. Please login again.');
                    $cookies.put('isLoggedIn', false);
                    $location.path('/login');
                }
    /*            if(rejection && rejection.status == -1 )
                {
                    $cookies.put('isLoggedIn', false);
                    $location.path('/maintenance');
                }*/
                return $q.reject(rejection);
            }
        };
    });
}]);

myApp.run(['$rootScope', '$route','AuthService' ,function ($rootScope, $route,AuthService) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        if(next.$$route)
        {
            switch (next.$$route.controller) {
                case 'inventoryController':
                    $rootScope.access = AuthService.getMenuAccess('Inventory');
                    $rootScope.pagename = "Inventory";
                    break;
                case 'skuController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','SKU');
                    $rootScope.pagename = "SKU";
                    break;
                case 'categoryController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','Category');
                    $rootScope.pagename = "Category";
                    break;
                case 'analyticsController':
                    $rootScope.access = AuthService.getMenuAccess('Analytics');
                    $rootScope.pagename = "Analytics";
                    break;
                case 'customerController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','Customers');
                    $rootScope.pagename = "Customers";
                    break;
                case 'dashboardController':
                    $rootScope.access = AuthService.getMenuAccess('Dashboard');
                    $rootScope.pagename = "Dashboard";
                    break;
                case 'DiscountController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','Discount');
                    $rootScope.pagename = "Discount";
                    break;
                case 'inventoryPassbookController':
                    $rootScope.access = AuthService.getMenuAccess('Inventory Passbook');
                    $rootScope.pagename = "Inventory Passbook";
                    break;
                case 'orderController':
                    $rootScope.access = AuthService.getSubMenuAccess('Orders','Sale Order');
                    $rootScope.pagename = "Sale Order";
                    break;
                case 'poController':
                    $rootScope.access = AuthService.getMenuAccess('P.O.');
                    $rootScope.pagename = "PO";
                    break;
                case 'purchaseReturnController':
                    $rootScope.access = AuthService.getSubMenuAccess('Orders','Purchase Return');
                    $rootScope.pagename = "Purchase Return";
                    break;
                case 'returnableGoodsOrderController':
                    $rootScope.access = AuthService.getSubMenuAccess('Orders','Returnable Goods');
                    $rootScope.pagename = "Returnable Goods";
                    break;
                case 'salereturnController':
                    $rootScope.access = AuthService.getSubMenuAccess('Orders','Sale Return');
                    $rootScope.pagename = "Sale Return";
                    break;
                case 'clientprofileController':
                    $rootScope.access = AuthService.getSubMenuAccess('Settings','Client Profile');
                    $rootScope.pagename = "Client Profile";
                    break;
                case 'saleschannelsController':
                    $rootScope.access = AuthService.getSubMenuAccess('Settings','Sales Channels');
                    $rootScope.pagename = "Sales Channels";
                    break;
                case 'useradminController':
                    $rootScope.access = AuthService.getSubMenuAccess('Settings','User Administration');
                    $rootScope.pagename = "User Administration";
                    break;
                case 'warehousesController':
                    $rootScope.access = AuthService.getSubMenuAccess('Settings','Warehouses');
                    $rootScope.pagename = "Warehouses";
                    break;
                case 'stockTransfer':
                    $rootScope.access = AuthService.getMenuAccess('Stock Transfer');
                    $rootScope.pagename = "Stock Transfer";
                    break;
                case 'taxationController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','Tax');
                    $rootScope.pagename = "Tax";
                    break;
                case 'vendorController':
                    $rootScope.access = AuthService.getSubMenuAccess('Masters','Vendors');
                    $rootScope.pagename = "Vendors";
                    break;
                case 'bulkuploadsController':
                    $rootScope.access = AuthService.getSubMenuAccess('WOPS','Bulk Uploads');
                    $rootScope.pagename = "Bulk Uploads";
                    break;
                case 'exportController':
                    $rootScope.access = AuthService.getSubMenuAccess('WOPS','Export');
                    $rootScope.pagename = "Export";
                    break;
                case 'inbound':
                    $rootScope.access = AuthService.getSubMenuAccess('WOPS','Inbound');
                    $rootScope.pagename = "Inbound";
                    break;
                case 'outbound':
                    $rootScope.access = AuthService.getSubMenuAccess('WOPS','Outbound');
                    $rootScope.pagename = "Outbound";
                    break;
                case 'wopsinventory':
                    $rootScope.access = AuthService.getSubMenuAccess('WOPS','WOPS Inventory');
                    $rootScope.pagename = "WOPS Inventory";
                    break;

            }
        }
    });
}])

myApp.filter('utcToLocal' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return;
        }

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy", timezone );
    };
})

myApp.filter('utcToLocalOrHyphen' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return "-";
        }

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy", timezone );
    };
})

myApp.filter('utcToLocalTimeOrHyphen' , function utcToLocal($filter,$cookies) {
    return function (utcDateString, format) {
        if (!utcDateString) {
            return "-";
        }

        // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
        if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
            utcDateString += 'Z';
        }

        var timezone = 'Asia/Calcutta';
        if($cookies.get('timezone'))
        {
            timezone = $cookies.get('timezone');
        }

        return $filter('date')(utcDateString, "dd/MM/yyyy hh:mm:ss a", timezone );
    };
})

myApp.directive('timezonedDate', function ($cookies)
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority: 1,
        link: function (scope, elem, attrs, ngModel)
        {

            attrs.timezone = $cookies.get('timezone');
            if(!attrs.timezone)
            {
                attrs.timezone = 'Asia/Calcutta';
            }

            var toView = function (val)
            {
                if(val) {
                    var offset = moment(val).utcOffset();
                    var date = new Date(moment(val).subtract(offset, 'm'));
                    var newOffset = moment.tz.zone(attrs.timezone).offset(date);
                    return new Date(moment(date).subtract(newOffset, 'm').unix() * 1000);
                }
                else
                {
                    return null;
                }
            };

            var toModel = function (val)
            {
                if(val) {
                    var m = moment(val);
                    m.set({hour: 0, minute: 0, second: 0, millisecond: 0});
                    var offset = m.utcOffset();
                    var date = new Date(m.add(offset, 'm'));
                    var timeZone = moment.tz.zone(attrs.timezone);
                    var newOffset = timeZone.offset(date);
                    return moment(date).add(newOffset, 'm').unix() * 1000;
                }
                else {
                    return null;
                }
            };

            ngModel.$formatters.push(toView);
            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive('price', [function () {
    return {
        require: 'ngModel',
        priority: 1,
        link: function (scope, element, attrs, ngModel) {
            attrs.$set('ngTrim', "false");

            var formatter = function(str, isNum) {
                str = String( Number(str || 0) / (isNum?1:100) );
                str = (str=='0'?'0.0':str).split('.');
                str[1] = str[1] || '0';
                return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length==1?str[1]+'0':str[1]);
            }
            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }
            var parseNumber = function(val)
            {
                if(val == null || val == undefined)
                {
                    return;
                }
                var modelString = formatter(ngModel.$modelValue, true);
                var sign = {
                    pos: /[+]/.test(val),
                    neg: /[-]/.test(val)
                }
                sign.has = sign.pos || sign.neg;
                sign.both = sign.pos && sign.neg;

                if (!val || sign.has && val.length==1 || ngModel.$modelValue && Number(val)===0) {
                    var newVal = (!val || ngModel.$modelValue && Number()===0?'':val);
                    if (ngModel.$modelValue !== newVal)
                        updateView(newVal);

                    return '';
                }
                else {
                    var valString = String(val || '');
                    var newSign = (sign.both && ngModel.$modelValue>=0 || !sign.both && sign.neg?'-':'');
                    var newVal = valString.replace(/[^0-9]/g,'');
                    var viewVal = newSign + formatter(angular.copy(newVal));

                    if (modelString !== valString)
                        updateView(viewVal);

                    return (Number(newSign + newVal) / 100) || 0;
                }
            }
            var formatNumber = function(val) {
                if (val) {
                    var str = String(val).split('.');
                    str[1] = str[1] || '0';
                    val = str[0] + '.' + (str[1].length==1?str[1]+'0':str[1]);
                }
                else
                {
                    return;
                }
                return parseNumber(val);
            }

            ngModel.$parsers.push(parseNumber);
            ngModel.$formatters.push(formatNumber);
        }
    };
}]);

myApp.filter('priceOrHyphen' , function ()
{
    return function (price) {
        if (!price || isNaN(price) )
        {
            return "-";
        }

        var formatter = function(str, isNum) {
            str = String( Number(str || 0) / (isNum?1:100) );
            str = (str=='0'?'0.0':str).split('.');
            str[1] = str[1] || '0';
            return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length==1?str[1]+'0':str[1]);
        }


        var toView = function(val) {
            if (val)
            {
                var str = String(val).split('.');
                str[1] = str[1] || '0';
                val = str[0] + '.' + (str[1].length==1?str[1]+'0':str[1]);
            }
            return formatter(val, true);
        }

        return toView(price);


    };
})

myApp.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        if(date) {
            var formatteddate = new Date(moment(date)).format("dd/mm/yyyy");
            return formatteddate;
        }
        else {
            return null;
        }
    };
});

myApp.directive('richtext', [function() {
    return {
        scope: {
            bodyText: '='
        },
        template: '<p ng-bind-html="teste"></p>',
        controller: function($scope,  $sce){

            $scope.$watch('bodyText', function(value)
            {
                if(value == null || value == undefined || value == '')
                {
                    $scope.teste = $sce.trustAsHtml('No remarks');
                }
                else
                {
                    $scope.teste = $sce.trustAsHtml(value);
                }
            })

        }
    };
}]);

myApp.directive('richerrortext', [function() {
    return {
        scope: {
            bodyText: '='
        },
        template: '<p ng-bind-html="teste"></p>',
        controller: function($scope,  $sce){

            $scope.$watch('bodyText', function(value)
            {
                if(value == null || value == undefined || value == '')
                {
                    $scope.teste = $sce.trustAsHtml('');
                }
                else
                {
                    $scope.teste = $sce.trustAsHtml(value);
                }
            })

        }
    };
}]);

myApp.directive('onlyInteger', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^0-9]/g, '');
                    updateView(val);
                    var newVal = parseInt(val);
                    return newVal;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive('alphaWithspace', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority:5,
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^A-Za-z ]/g, '');
                    updateView(val);
                    return val;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive('alphanum', function ()
{
    return {
        require: 'ngModel',
        restrict: 'A',
        priority:5,
        link: function (scope, elem, attrs, ngModel)
        {

            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }

            var toModel = function (val)
            {
                if(val)
                {
                    val = val.replace(/[^0-9a-zA-Z]/g, '');
                    updateView(val);
                    return val;
                }
                else
                {
                    return null;
                }
            };

            ngModel.$parsers.push(toModel);
        }
    };

});

myApp.directive("preventTypingLesser", function() {
    return {
        link: function(scope, element, attributes)
        {
            var oldVal = null;
            element.on("keydown keyup", function(e)
            {
                if(element.val() == null)
                {
                    return;
                }
                if (Number(element.val()) < Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                )
                {
                    e.preventDefault();
                    element.val(oldVal);
                }
                else
                {
                    oldVal = Number(element.val());
                }
            });
        }
    };
});

myApp.directive("preventTypingGreater", function() {
    return {
        link: function(scope, element, attributes) {
            var oldVal = null;
            element.on("keydown keyup", function(e)
            {
                if(element.val() == null)
                {
                    return;
                }
                if (Number(element.val()) > Number(attributes.max) &&
                    e.keyCode != 46 // delete
                    &&
                    e.keyCode != 8 // backspace
                ) {
                    e.preventDefault();
                    element.val(oldVal);
                } else {
                    oldVal = Number(element.val());
                }
            });
        }
    };
});

myApp.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        ip.baseUrlSource+'/omsservices/webapi/**'
    ]);

    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([
        'http://myapp.example.com/clickThru**'
    ]);
});

myApp.config(['$provide', function ($provide) {
    $provide.decorator('ngClickDirective',['$delegate','$timeout', function ($delegate,$timeout) {
        var original = $delegate[0].compile;
        var delay = 500;
        $delegate[0].compile = function (element, attrs, transclude) {

            var disabled = false;
            function onClick(evt) {
                if (disabled) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                } else {
                    disabled = true;
                    $timeout(function () { disabled = false; }, delay, false);
                }
            }
            //   scope.$on('$destroy', function () { iElement.off('click', onClick); });
            element.on('click', onClick);

            return original(element, attrs, transclude);
        };
        return $delegate;
    }]);
}]);

myApp.factory('PagerService', PagerService)

function PagerService() {
    // service definition
    var service = {};

    service.GetPager = GetPager;

    return service;

    // service implementation
    function GetPager(totalItems, currentPage, pageSize) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 5
        pageSize = pageSize || 5;

        // calculate total pages
        var totalPages = Math.ceil(totalItems / pageSize);
        var startPage, endPage;
        if (totalPages <= 5) {
            // less than 5 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 5 total pages so calculate start and end pages
            if (currentPage <= 3) {
                startPage = 1;
                endPage = 5;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 4;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        var pages = _.range(startPage, endPage + 1);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}

myApp.service('AuthService', ['$http', '$location','growl', function ($http, $location,growl)
{

    this.getSubMenuAccess = function(menu,submenu){
            var menubar = JSON.parse(localStorage.getItem("menu"));
            var showpage = false;
            var response ;
            angular.forEach(menubar, function (value) {
                if(value.name == menu){
                    angular.forEach(value.subMenu, function (sub) {
                        if(sub.name == submenu) {
                            showpage = true;
                            response =sub;
                        }
                    });
                }
            });

            if(showpage == false)
            {
                growl.error("You do not have access to "+menu +" , Redirecting to " + localStorage.getItem('defaultpage')+" Please contact system administrator for accesses");
                $location.path( localStorage.getItem('defaultpage'));
            }
            else{
                return response;
            }
        }

        this.getMenuAccess = function(menu){
            var menubar = JSON.parse(localStorage.getItem("menu"));

            var showpage = false;
            var response;
            angular.forEach(menubar, function (value) {
                if(value.name == menu){
                    showpage = true;
                    response= value;
                }
            });

            if(showpage == false)
            {
                growl.error("You do not have access to "+menu +" , Redirecting to " + localStorage.getItem('defaultpage')+" Please contact administrator for accesses");
                $location.path( localStorage.getItem('defaultpage'));
            }
            else{
                return response;
            }
        }
    }]);