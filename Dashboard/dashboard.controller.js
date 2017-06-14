/**
 * Created by angularpc on 26-10-2016.
 */
myApp.controller('dashboardController', dashboardController);

dashboardController.$inject = ['$rootScope','$scope', '$http', '$location', 'baseUrl','$cookies', '$mdDialog', '$mdMedia', 'growl', '$window', 'downloadOrderTemplateUrl', 'Upload'];

function dashboardController($rootScope, $scope, $http, $location, baseUrl,$cookies, $mdDialog, $mdMedia, growl, $window, downloadOrderTemplateUrl, Upload) {


    $scope.saleOrderCount = {};
    $scope.inventorySummary = {};
    $scope.inventorySummary.totalValue = '-';
    $scope.inventorySummary.totalQuantity = '-';
    $scope.inventorySummary.totalSkus = '-';
    $scope.saleOrderFilter = {};
    $scope.saleOrderHoldFilter = {};
    $scope.saleOrderChannelWiseFilter = {};

    $scope.inwardInventory = {};
    $scope.outwardInventory = {};

    $scope.reasonWiseHoldList = [];
    $scope.channelWiseOrdersList = [];
    $scope.sortType     = 'channel'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.searchFish   = '';     // set the default search/filter term

    $scope.analytics = localStorage.getItem('analytics');
    $scope.clickDisable = function(data){
      console.log(data);
        var disableActive = $(".tabbable-line > .nav-tabs > li.active").attr('class');
        if(disableActive == 'active'){
            $scope.DisableActiveBtn = true;
        }
    };


    $scope.getSaleOrderCount = function (daterange)
    {
        var today = new Date();
        today.setHours(0,0,0,0);
        var startDate       =  moment.utc(today).format();
        var endDate         =  moment.utc(today).format();

        $scope.saleOrderFilter.end1Date = endDate;
        $scope.saleOrderFilter.endDate = endDate;

        switch(daterange)
        {
            case "today":
                break;
            case "yesterday":
                startDate   =  moment.utc(today).subtract(1,'days').format();
                break;
            case "lastweek":
                startDate   =  moment.utc(today).subtract(7,'days').format();
                break;
            case "lastmonth":
                startDate   =  moment.utc(today).subtract(30,'days').format();
                break;
        }

        $scope.saleOrderFilter.start1Date = startDate;
        $scope.saleOrderFilter.startDate = startDate;

        $scope.dateRangeOrdersURL = baseUrl + "/omsservices/webapi/orders/filtercount?startDate=" + startDate + "&endDate=" + endDate ;

        var newOrdersURL = $scope.dateRangeOrdersURL + "&state=new";
        var inProcessOrdersURL = $scope.dateRangeOrdersURL + "&state=process";
        var shippedOrdersURL = $scope.dateRangeOrdersURL + "&state=shipping";


        $http({
            method: 'GET',
            url: newOrdersURL
        }).success(function(data)
        {
            $scope.saleOrderCount.newCount = data;
        }).error(function(data){
            $scope.saleOrderCount.newCount = "-";
        });

        $http({
            method: 'GET',
            url: inProcessOrdersURL
        }).success(function(data)
        {
            $scope.saleOrderCount.inProcessCount = data;
        }).error(function(data){
            $scope.saleOrderCount.inProcessCount = "-";
        });

        $http({
            method: 'GET',
            url: shippedOrdersURL
        }).success(function(data)
        {
            $scope.saleOrderCount.shippedCount = data;
        }).error(function(data){
            $scope.saleOrderCount.shippedCount = "-";
        });
    }

    $scope.getHoldOrderCount = function (daterange)
    {
        $scope.reasonWiseHoldList = [];

        var today = new Date();
        today.setHours(0,0,0,0);
        var startDate       =  moment.utc(today).format();
        var endDate         =  moment.utc(today).format();

        $scope.saleOrderHoldFilter.end1Date = endDate;
        $scope.saleOrderHoldFilter.endDate = endDate;

        switch(daterange)
        {
            case "today":
                break;
            case "yesterday":
                startDate   =  moment.utc(today).subtract(1,'days').format();
                break;
            case "lastweek":
                startDate   =  moment.utc(today).subtract(7,'days').format();
                break;
            case "lastmonth":
                startDate   =  moment.utc(today).subtract(30,'days').format();
                break;
        }

        $scope.saleOrderHoldFilter.start1Date = startDate;
        $scope.saleOrderHoldFilter.startDate = startDate;

        $scope.dateRangeOrdersURL = baseUrl + "/omsservices/webapi/orders/counthold?startdate=" + startDate + "&enddate=" + endDate ;

        $http({
            method: 'GET',
            url: $scope.dateRangeOrdersURL
        }).success(function(data)
        {
            $scope.reasonWiseHoldList = data;
        }).error(function(data){
            $scope.reasonWiseHoldList = [];
        });
    }

    $scope.getChannelWiseOrders = function (daterange) {

        $scope.channelWiseOrdersList = [];

        var today = new Date();
        today.setHours(0,0,0,0);
        var startDate       =  moment.utc(today).format();
        var endDate         =  moment.utc(today).format();

        $scope.saleOrderChannelWiseFilter.end1Date = endDate;
        $scope.saleOrderChannelWiseFilter.endDate = endDate;

        switch(daterange)
        {
            case "today":
                break;
            case "yesterday":
                startDate   =  moment.utc(today).subtract(1,'days').format();
                break;
            case "lastweek":
                startDate   =  moment.utc(today).subtract(7,'days').format();
                break;
            case "lastmonth":
                startDate   =  moment.utc(today).subtract(30,'days').format();
                break;
        }

        $scope.saleOrderChannelWiseFilter.start1Date = startDate;
        $scope.saleOrderChannelWiseFilter.startDate = startDate;

        $scope.dateRangeOrdersURL = baseUrl + "/omsservices/webapi/orders/countsaleschannelwise?startdate=" + startDate + "&enddate=" + endDate ;

        $http({
            method: 'GET',
            url: $scope.dateRangeOrdersURL
        }).success(function(data)
        {
            $scope.channelWiseOrdersList = data;
        }).error(function(data){
            $scope.channelWiseOrdersList = [];
        });
    }

    $scope.getSaleOrderCount("today");
    $scope.getHoldOrderCount("today");
    $scope.getChannelWiseOrders("today");



    $scope.getInventorySummary = function()
    {
        $http({
            method: 'GET',
            url: baseUrl + '/omsservices/webapi/inventory/inventorysummary'
        }).success(function(data)
        {
            console.log(data);
            if(data.totalvalue == null || data.totalvalue == '' || data.totalvalue == undefined)
            {
                $scope.inventorySummary.totalValue = 0;
            }
            else
            {
                $scope.inventorySummary.totalValue = data.totalvalue;
            }
            if(data.totalquantity == '' || data.totalquantity == null || data.totalquantity == undefined)
            {
                $scope.inventorySummary.totalQuantity = 0;
            }
            else
            {
                $scope.inventorySummary.totalQuantity = data.totalquantity;
            }
            if(data.totalsku == '' || data.totalsku == null || data.totalsku == undefined)
            {
                $scope.inventorySummary.totalSkus = 0;
            }
            else
            {
                $scope.inventorySummary.totalSkus = data.totalsku;
            }
        }).error(function(error,status)
        {
            $scope.inventorySummary.totalValue = '-';
            $scope.inventorySummary.totalQuantity = '-';
            $scope.inventorySummary.totalSkus = '-';
            console.log(data);
        })
    }

    $scope.getInventorySummary();

    $scope.getOutwardInventory = function(daterange)
    {
        var today = new Date();
        today.setHours(0,0,0,0);
        var startDate       =  moment.utc(today).format();
        var endDate         =  moment.utc(today).format();

        switch(daterange)
        {
            case "today":
                break;
            case "yesterday":
                startDate   =  moment.utc(today).subtract(1,'days').format();
                break;
            case "lastweek":
                startDate   =  moment.utc(today).subtract(7,'days').format();
                break;
            case "lastmonth":
                startDate   =  moment.utc(today).subtract(30,'days').format();
                break;
        }

        $scope.outwardUrl = baseUrl + '/omsservices/webapi/inventory/outwardinventory?startdate='+startDate+'&enddate='+endDate;
        $http({
            method: 'GET',
            url: $scope.outwardUrl
        }).success(function(data)
        {
            console.log(data);
            $scope.outwardInventory.totalValue = data.totalvalue;
            $scope.outwardInventory.totalQuantity = data.totalquantity;
            $scope.outwardInventory.totalSkus = data.totalsku;
        }).error(function(error,status){

            $scope.outwardInventory.totalValue = '-';
            $scope.outwardInventory.totalQuantity = '-';
            $scope.outwardInventory.totalSkus = '-';
        });
    }

    $scope.getInwardInventory = function(daterange){

        var today = new Date();
        today.setHours(0,0,0,0);
        
        var startDate       =  moment.utc(today).format();
        var endDate         =  moment.utc(today).format();

        switch(daterange)
        {
            case "today":
                break;
            case "yesterday":
                startDate   =  moment.utc(today).subtract(1,'days').format();
                break;
            case "lastweek":
                startDate   =  moment.utc(today).subtract(7,'days').format();
                break;
            case "lastmonth":
                startDate   =  moment.utc(today).subtract(30,'days').format();
                break;
        }

        $scope.inwardUrl = baseUrl + '/omsservices/webapi/inventory/inwardinventory?startdate='+startDate+'&enddate='+endDate;
        $http({
            method: 'GET',
            url: $scope.inwardUrl
        }).success(function(data)
        {
            console.log(data);
            $scope.inwardInventory.totalValue = data.totalvalue;
            $scope.inwardInventory.totalQuantity = data.totalquantity;
            $scope.inwardInventory.totalSkus = data.totalsku;
        }).error(function(error,status){

            $scope.inwardInventory.totalValue = '-';
            $scope.inwardInventory.totalQuantity = '-';
            $scope.inwardInventory.totalSkus = '-';
        });

    }

    $scope.getInventory = function(daterange){
        $scope.getOutwardInventory(daterange);
        $scope.getInwardInventory(daterange);
    }

    $scope.getInventory('today');

    $scope.switchToOrders = function(state)
    {
        $rootScope.defaultTab = state;
        $rootScope.saleOrderFilterObj = $scope.saleOrderFilter;

        $location.path('/order');
    }

    $scope.switchToHoldOrders = function()
    {
        $rootScope.defaultTab = "hold";
        $rootScope.saleOrderFilterObj = $scope.saleOrderHoldFilter;

        $location.path('/order');
    }

    $scope.switchToChannelWiseOrders = function(channelobj,state)
    {
        $scope.saleOrderChannelWiseFilter.saleChannel = channelobj;

        $rootScope.defaultTab = state;
        $rootScope.saleOrderFilterObj = $scope.saleOrderChannelWiseFilter;

        $location.path('/order');
    }

}
