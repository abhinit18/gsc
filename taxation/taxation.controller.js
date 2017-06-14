myApp.controller('taxationController', taxationController);

taxationController.$inject = ['$scope', '$http', '$location', 'baseUrl','commonPathUrl', '$mdDialog', '$mdMedia','$sce', 'growl', '$window', 'downloadOrderTemplateUrl', 'Upload', 'PagerService', '$q', '$routeParams', '$cookies','$timeout','$controller', 'mastersService'];

function taxationController($scope, $http, $location, baseUrl,commonPathUrl, $mdDialog, $mdMedia,$sce, growl, $window, downloadOrderTemplateUrl, Upload, PagerService, $q,  $routeParams, $cookies,$timeout,$controller, mastersService) {

    $scope.categorySearchUrl = baseUrl + "/omsservices/webapi/skunode/search?search=";
    $scope.skuSearchUrl = baseUrl + "/omsservices/webapi/skus/search?search=";
    $scope.entitySearchUrl = $scope.categorySearchUrl;
    $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    $scope.ScopeTypeRule = 'Category';
    $scope.taxData = {};
    $scope.countryTaxClasses = [];
    $scope.stateTaxClasses = [];
    $scope.taxClasses = [];
    $scope.addModalMode = 'add';
    $scope.taxRule = {};
    $scope.selectedTaxClass = "";
    $scope.taxRule.tableTaxRuleClassMaps = [];
    $scope.allTaxClassSizeStart = 0;
    $scope.allTaxClassPageSize = 5;
    $scope.taxClassTabValue = 'state';

    $scope.setActiveEntity = function (activeEntity) {
        console.log(activeEntity);
        $scope.clickedEntity = activeEntity;
    };

    $scope.isActive = function(clickedEntity) {
        if ($scope.clickedEntity == clickedEntity) {
            return true;
        }
        return false;
    };
    $scope.genericData = {};
    $scope.sendSearchUrl = function(data)
    {
        console.log(data);
        $scope.ScopeTypeRule = data;
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.genericData.selectedTaxClass = null;
        if(data == 'Category')
        {
            $scope.entitySearchUrl = $scope.categorySearchUrl;
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.searchedSKU = null;
            $scope.taxRule.tableSku = null;
        }
        else
        {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.taxRule.tableSkuNode = null;
            $scope.searchedCategory = null;

        }
    };

    $scope.searchedEntitySelected = function (selected) {
        console.log(selected);
        if($scope.ScopeTypeRule == 'Category' && selected != null)
        {
            $scope.searchedCategory = selected.originalObject;
            $scope.taxRule.tableSkuNode = selected.originalObject;
            $scope.searchedSKU = null;
            $scope.taxRule.tableSku = null;
        }

        if($scope.ScopeTypeRule == 'SKU' && selected != null)
        {
            $scope.searchedSKU = selected.originalObject;
            $scope.taxRule.tableSku = selected.originalObject;
            $scope.taxRule.tableSkuNode = null;
            $scope.searchedCategory = null;
        }
    };
    
    $scope.addTaxClassToTaxRule = function (selectedTaxClass) {
        console.log(selectedTaxClass);
        if(selectedTaxClass == "" || selectedTaxClass == undefined || selectedTaxClass == null){
            growl.error('Please select tax class name.');
            return false;
        }else{
            $scope.genericData.selectedTaxClass = selectedTaxClass;
            if ($scope.taxRule.tableTaxRuleClassMaps.filter(function(e) { return e.tableTaxClass == $scope.genericData.selectedTaxClass; }).length > 0) {
                growl.error('Tax class already selected');
                return;
            }
            $scope.taxRule.tableTaxRuleClassMaps.push(
                { 'tableTaxClass' : $scope.genericData.selectedTaxClass }
            )
        }
    };
    $scope.removeTaxClassFromTaxRule = function (index) {
        $scope.taxRule.tableTaxRuleClassMaps.splice(index,1);
    };


    $scope.showAddTaxClassModal = function(){
        $scope.taxData = {};
        $scope.genericData.disableButton = false;
        $scope.addModalMode = 'add';
        $('#addNewTaxClass').modal('show');
    };



    $scope.showEditTaxClassModal = function (taxClass) {
        console.log(taxClass);
        $scope.genericData.disableButton = false;
        $scope.addModalMode = 'edit';
        $scope.taxData = taxClass;
        $('#addNewTaxClass').modal('show');
    }

    $scope.cancelTaxClassModal = function(){
        $scope.taxData = {};
        $('#addNewTaxClass').modal('hide');
    };


    //CountryScopeTabMode Tab Mode
    $scope.CountryScopeTabMode = function() {
        $scope.taxClassTabValue = 'country';
        $scope.listOfTaxCount(1);
    };

    //StateScopeTabMode Tab Mode
    $scope.StateScopeTabMode = function() {
        $scope.taxClassTabValue = 'state';
        $scope.listOfTaxCount(1);
    };

    //CategoryScopeTabMode Tab Mode
    $scope.taxTabMode = 'category';
    $scope.CategoryScopeTabMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'category';
        $scope.ScopeTypeRule = "Category";
    };

    //SkuScopeTabMode Tab Mode
    $scope.SkuScopeTabMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'sku';
        $scope.ScopeTypeRule = "SKU";
    };

    $scope.serviceTaxMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'service';
        $scope.ScopeTypeRule = "Service";
    };

    $scope.ShowAddNewTaxRule = function(){
        $scope.genericData.disableButton=false;
        $scope.getTaxClasses();
        $scope.taxRule = {};
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.taxRule.tableTaxRuleCascadeClass = false;
        $mdDialog.show({
            templateUrl: 'addNewTaxRule.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    };

    $scope.cancelTaxRuleModal = function(){
        $scope.genericData.selectedTaxClass = "";
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.taxRule.tableSkuNode = "";
        $mdDialog.hide();
    };

//    ============================================= get tax scope ======================================= //

    $scope.getTaxScope = function () {
        $scope.taxScopes = [];
        var taxScopeUrl = baseUrl + "/omsservices/webapi/taxclass/gettaxscopes";
        $http.get(taxScopeUrl).success(function (data) {
            $scope.taxScopes = data;
            console.log($scope.taxScopes);
        }).error(function (error, status) {
            console.log(error);
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to get tax scopes");
            }
        });
    };
    $scope.getTaxScope();

    //========================================== get tax types ==================================== //

    $scope.getTaxType = function () {
        $scope.taxTypes = [];
        var taxTypeUrl = baseUrl + "/omsservices/webapi/taxclass/gettaxtypes";
        $http.get(taxTypeUrl).success(function (data) {
            $scope.taxTypes = data;
            console.log($scope.taxTypes);
        }).error(function (error, status) {
            console.log(error);
            if (status == 400) {
                growl.error(error.errorMessage);
            }
            else {
                growl.error("Failed to get tax types");
            }
        });
    };
    $scope.getTaxType();
// ================================================ get states  =================================== //

    $scope.regionsStatesData = function() {
        var q = $q.defer();
        $scope.regionsStatesArray = [];
        var regionsStatesUrl = baseUrl + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data) {
            console.log(data);
            $scope.regionsStatesArray = data;
            q.resolve(true);
            console.log($scope.regionsStatesArray);
        }).error(function(error, status) {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.regionsStatesData();

    //============================ validation for adding tax rule ========================= //

    $scope.validateTaxRuleFormData = function() {
        console.log($scope.ScopeTypeRule);
        if($scope.ScopeTypeRule == 'Category' && $scope.taxRule.tableSkuNode == undefined)
        {
            growl.error('Category is a mandatory');
            return false;
        }
        if($scope.ScopeTypeRule == 'SKU' && $scope.searchedSKU == undefined)
        {
            growl.error('SKU is a mandatory');
            return false;
        }
        if($scope.ScopeTypeRule == 'Service' && $scope.taxRule.tableGrossTaxType == undefined)
        {
            growl.error('Service is a mandatory');
            return false;
        }
        if($scope.taxRule.tableTaxRuleClassMaps.length == 0){
            growl.error('Tax Class is a mandatory. At least one tax rule is required.');
            return false;
        }
        return true;

    };



    //======================add tax rule =======================//

    $scope.AddTaxRule = function () {

        if($scope.genericData.disableButton==true)
        {
            //a request is already in process
            return;
        }
        $scope.genericData.disableButton=true;

        console.log($scope.taxRule);
        if( $scope.validateTaxRuleFormData() == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxRuleUrl = baseUrl + "/omsservices/webapi/taxrule";

            $http({
                method: 'POST',
                url: addTaxRuleUrl,
                data: $scope.taxRule,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                if($scope.ScopeTypeRule == "Category") {
                    $scope.getCategoryTaxRules();
                    activaTab('taxTab1');
                    $scope.CategoryScopeTabMode();
                }
                if($scope.ScopeTypeRule == "SKU") {
                    $scope.getSkuTaxRules();
                    activaTab('taxTab2');
                    $scope.SkuScopeTabMode();
                }
                if($scope.ScopeTypeRule == "Service") {
                    $scope.getServiceTaxRules();
                    activaTab('taxTab3');
                    $scope.serviceTaxMode();
                }
                $scope.cancelTaxRuleModal();
                growl.success('Tax rule added successfully !')
            }).error(function(error, status) {
                $scope.genericData.disableButton=false;
                console.log(error);
                console.log(status);

            });
        }
    };
    
    //======================add tax rule ends =================//

    //    =========================================== update tax rule ==================================== //
    $scope.updateTaxRule = function () {

        if($scope.genericData.disableButton == true)
        {
            return;
        }
        $scope.genericData.disableButton = true;

        console.log($scope.taxRule);
        var updateTaxRuleUrl = baseUrl + "/omsservices/webapi/taxrule";

        $http({
            method: 'PUT',
            url: updateTaxRuleUrl,
            data: $scope.taxRule,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            if($scope.ScopeTypeRule == "Category") {
                $scope.categoryTaxRules.splice($scope.taxRule,1);
                $scope.categoryTaxRules.push(res);
            }
            if($scope.ScopeTypeRule == "SKU") {
                $scope.skuTaxRules.splice($scope.taxRule,1);
                $scope.skuTaxRules.push(res);
            }
            if($scope.ScopeTypeRule == "SKU") {
                $scope.serviceTaxRules.splice($scope.taxRule,1);
                $scope.serviceTaxRules.push(res);
            }
            $mdDialog.hide();
            growl.success('Tax rule updated successfully !')
        }).error(function(error, status) {
            $scope.genericData.disableButton = false;
            console.log(error);
            console.log(status);

        });
    }

    //===========get category wise rules =====================//
    $scope.getCategoryTaxRules = function() {
        var q = $q.defer();
        $scope.categoryTaxRules = [];
        var getTaxRuleUrl = baseUrl + "/omsservices/webapi/taxrule/taxrulesforcategory";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.categoryTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getCategoryTaxRules();

    //===========get sku wise rules =====================//
    $scope.getSkuTaxRules = function() {
        var q = $q.defer();
        $scope.skuTaxRules = [];
        var getTaxRuleUrl = baseUrl + "/omsservices/webapi/taxrule/taxrulesforsku";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.skuTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getSkuTaxRules();

    //===========get sku wise rules =====================//
    $scope.getServiceTaxRules = function() {
        var q = $q.defer();
        $scope.serviceTaxRules = [];
        var getTaxRuleUrl = baseUrl + "/omsservices/webapi/taxrule/taxrulesforservice";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.serviceTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getServiceTaxRules();

//    ========================================== Validation for adding tax class ===================== //

    $scope.validateTaxClassFormData = function(value){
        console.log(value);
        console.log($scope.taxData);

        if(value.tableTaxClassName == '' || value.tableTaxClassName == undefined)
            {
                growl.error('Tax Class Name is a mandatory');
                return false;
            }
            if(value.tableTaxClassScope == '' || value.tableTaxClassScope == undefined)
            {
                growl.error('Tax scope is a mandatory');
                return false;
            }
            if(value.tableTaxClassScope == "State")
            {
                if(value.tableState == null || value.tableState == undefined){
                    growl.error('State is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassTaxType == null || value.tableTaxClassTaxType == undefined){
                    growl.error('Intrastate tax type is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassTaxValue == '' || value.tableTaxClassTaxValue == null || value.tableTaxClassTaxValue == undefined){
                    growl.error('Intrastate tax value is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassTaxValue < 0.01 || value.tableTaxClassTaxValue > 100.00 )
                    {
                        growl.error('Intrastate tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }

                }
                if(value.tableTaxClassSurcharge != '' && value.tableTaxClassSurcharge != null && value.tableTaxClassSurcharge != undefined)
                {
                    if(value.tableTaxClassSurcharge < 0.00 || value.tableTaxClassSurcharge > 100.00 )
                    {
                        growl.error('Intrastate tax surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }
                }
                if(value.tableTaxClassInterstateTaxType == null || value.tableTaxClassInterstateTaxType == undefined){
                    growl.error('Interstate tax type is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassInterstateTaxValue == null || value.tableTaxClassInterstateTaxValue == undefined){
                    growl.error('Interstate tax value is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassInterstateTaxValue < 0.01 || value.tableTaxClassInterstateTaxValue > 100.00 )
                    {
                        growl.error('Interstate tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }
                }

                if(value.tableTaxClassInterstateSurcharge != '' && value.tableTaxClassInterstateSurcharge != null && value.tableTaxClassInterstateSurcharge == undefined)
                {
                    if(value.tableTaxClassInterstateSurcharge < 0.00 || value.tableTaxClassInterstateSurcharge > 100.00 )
                    {
                        growl.error('Interstate surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }
                }


            }
            if(value.tableTaxClassScope == 'Country')
            {
                if(value.tableTaxClassTaxType == "" || value.tableTaxClassTaxType == undefined){
                    growl.error('Tax Class Type is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassTaxValue == "" || value.tableTaxClassTaxValue == undefined){
                    growl.error('Tax percentage is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassTaxValue < 0.01 || value.tableTaxClassTaxValue > 100.00 )
                    {
                        growl.error('Tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }

                }

                if(value.tableTaxClassSurcharge != ''  && value.tableTaxClassSurcharge != null && value.tableTaxClassSurcharge != undefined)
                {
                    if(value.tableTaxClassSurcharge < 0.00 || value.tableTaxClassSurcharge > 100.00 )
                    {
                        growl.error('Tax surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }

                }
            }
            return true;
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

    //    ================================= Category array type ================================== //4

    $scope.getServiceTypes = function() {
        var serviceTypeUrl = baseUrl + "/omsservices/webapi/grosstaxtype";
        $http.get(serviceTypeUrl).success(function(data) {
            $scope.tableGrossTaxTypes = data;
        }).error(function(error, status) {

        });
    };

    $scope.getServiceTypes();

//    =========================================== add tax class ==================================== //

    $scope.AddTaxClass = function(data){
        $scope.validateTaxClassInputValues(data).then(function (response) {

            if(response == true){
                growl.error("Tax Class Name already exists.");
                return;
            }

        if($scope.genericData.disableButton==true)
        {
            //a request is already in process
            return;
        }
        $scope.genericData.disableButton=true;

        if( $scope.validateTaxClassFormData(data) == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxClassUrl = baseUrl + "/omsservices/webapi/taxclass";
            $http({
                method: 'POST',
                url: addTaxClassUrl,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                $scope.taxData = {};
                $scope.listOfTaxCount(1);
                $('#addNewTaxClass').modal('hide');
                $scope.genericData.disableButton=false;
                $scope.getTaxClasses();

                growl.success('Tax class added successfully !');
                if(data.tableTaxClassScope == 'State'){
                    activaTab("tab1");
                    $scope.StateScopeTabMode();
                }
                else{
                    activaTab("tab2");
                    $scope.CountryScopeTabMode()
                }

            }).error(function(error, status) {
                $scope.genericData.disableButton=false;
                console.log(error);
                console.log(status);

            });
        }
        });
    };

    //    =========================================== add tax class ==================================== //

    $scope.updateTaxClass = function(data)
    {
        if($scope.genericData.disableButton == true)
        {
            return;
        }
        $scope.genericData.disableButton = true;
        console.log(data);
        if( $scope.validateTaxClassFormData(data) == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxClassUrl = baseUrl + "/omsservices/webapi/taxclass/" + data.idtableTaxClassId;

            $http({
                method: 'PUT',
                url: addTaxClassUrl,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                console.log("Watch out");
                $scope.listOfTaxCount(1);
                $scope.taxData = {};
                growl.success('Tax class updated successfully !')
                $('#addNewTaxClass').modal('hide');
            }).error(function (error, status) {
                $scope.genericData.disableButton=false;

            });
        }

    }



    $scope.listOfTaxCount = function(page)
    {
        if($scope.taxClassTabValue == 'state') {
            $scope.stateCount = 0;
            var taxClassStateCountUrl = baseUrl + "/omsservices/webapi/taxclass/count?scope=State";
            console.log(taxClassStateCountUrl);
            $http.get(taxClassStateCountUrl).success(function(data) {
                $scope.stateCount = data;
                if (data != null) {

                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.stateCount); // dummy array of items to be paged
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

                        $scope.vmPager = vm.pager;

                        $scope.taxClassStart = (vm.pager.currentPage - 1) * $scope.allTaxClassPageSize;
                        $scope.taxClassbyScopeSize = $scope.taxClassStart + $scope.allTaxClassPageSize;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.getStateTaxClasses($scope.taxClassStart);
                    }

                }
            }).error(function(error, status) {

            });
        }
        if($scope.taxClassTabValue == 'country') {
            $scope.countryCount = 0;
            var taxClassCountryCountUrl = baseUrl + "/omsservices/webapi/taxclass/count?scope=Country";
            console.log(taxClassCountryCountUrl);
            $http.get(taxClassCountryCountUrl).success(function(data) {
                $scope.countryCount = data;
                if (data != null) {

                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.countryCount); // dummy array of items to be paged
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

                        $scope.vmPager = vm.pager;

                        $scope.taxClassStart = (vm.pager.currentPage - 1) * $scope.allTaxClassPageSize ;
                        $scope.taxClassbyScopeSize = $scope.taxClassStart + $scope.allTaxClassPageSize ;


                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.getCountryTaxClasses($scope.taxClassStart);
                    }

                }
            }).error(function(error, status) {

            });
        }
    };

    $scope.listOfTaxCount(1);

    //===========get tax classes =====================//
    $scope.getCountryTaxClasses = function(start) {
        var q = $q.defer();
        $scope.countryTaxClasses = [];
        var getTaxClassUrl = baseUrl + "/omsservices/webapi/taxclass?scope=Country&start=" + start + "&size=" + $scope.allTaxClassPageSize;
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.countryTaxClasses = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getCountryTaxClasses($scope.allTaxClassSizeStart);

    //===========get state tax classes =====================//
    $scope.getStateTaxClasses = function(start) {
        var q = $q.defer();
        $scope.stateTaxClasses = [];
        var getTaxClassUrl = baseUrl + "/omsservices/webapi/taxclass?scope=State&start=" + start + "&size=" + $scope.allTaxClassPageSize;
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.stateTaxClasses = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getStateTaxClasses($scope.allTaxClassSizeStart);

    //===========get tax classes =====================//
    $scope.getTaxClasses = function() {
        var q = $q.defer();
        $scope.taxClasses = [];
        var getTaxClassUrl = baseUrl + "/omsservices/webapi/taxclass";
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.taxClasses = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getTaxClasses();


//    ======================================= add tax rule by type ================================ //

    $scope.showAddClassToExistingRuleDialog = function(){
        $mdDialog.show({
            templateUrl: 'addClassToTaxRule.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }
    $scope.closeAddClassToExistingRuleDialog = function(){
        $scope.genericData.selectedTaxClass=null;
        $mdDialog.hide();
    };

    //    ====================================== remove tax rules data ======================== //

    $scope.removeTaxClassFromExistingTaxRule  = function(data){
        console.log(data);

        var deleteURL = baseUrl + "/omsservices/webapi/taxruleclassmap/" + data.idtableTaxRuleClassMapId;

        $http({
            method: 'DELETE',
            url: deleteURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {

            if($scope.ScopeTypeRule == 'Category')
            {
                for (var entityCounter = 0; entityCounter < $scope.categoryTaxRules.length; entityCounter++) {
                    if ($scope.categoryTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.categoryTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            if($scope.ScopeTypeRule == 'SKU')
            {
                for (var entityCounter = 0; entityCounter < $scope.skuTaxRules.length; entityCounter++) {
                    if ($scope.skuTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.skuTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            if($scope.ScopeTypeRule == 'Service')
            {
                for (var entityCounter = 0; entityCounter < $scope.serviceTaxRules.length; entityCounter++) {
                    if ($scope.serviceTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.serviceTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            $mdDialog.hide();
            growl.success('Tax class deleted from this rule!')
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });

    }

    $scope.cancelAddClassToExistingTaxRule = function () {
        $scope.selectedTaxClass = null;
        $mdDialog.hide();
    }

    $scope.addTaxClassToExistingTaxRule = function (selectedTaxClass) {


        /*if($scope.genericData.disableButton == true)
        {
            return;
        }*/
        $scope.genericData.disableButton = true;

        console.log($scope.clickedEntity);
        console.log(selectedTaxClass);

        var addTaxClassToExistingRuleUrl = baseUrl + "/omsservices/webapi/taxrule/" + $scope.clickedEntity.idtableTaxRuleId + "/taxclass/" + selectedTaxClass.idtableTaxClassId ;

        $http({
            method: 'POST',
            url: addTaxClassToExistingRuleUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.clickedEntity.tableTaxRuleClassMaps.push(res);
            $scope.closeAddClassToExistingRuleDialog();
            growl.success('Tax class added successfully !')
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to add Tax Class");
            }

        });
    }

    $scope.validateTaxClassInputValues = function (taxData) {
        var q = $q.defer();
        if(taxData.tableTaxClassName){
            $http({
                method: 'GET',
                url: baseUrl + "/omsservices/webapi/taxclass/validatetaxclassname?taxClassName="+taxData.tableTaxClassName
            })
                .success(function (data, status) {
                    console.log(data);
                    q.resolve(data);

                }).error(function(error,status){
                if(status == 400){
                    growl.error(data.errorMessage);
                }
                q.reject(error);
            });
        }
        return q.promise;
    }


    $scope.downloadTaxes = function () {

        var orderListUrl = baseUrl + "/omsservices/webapi/tax/export";

        $http({
            method: 'GET',
            url: orderListUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data, status) {
                console.log(data);
                if(status == '204'){
                    growl.error("Tax are not available.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Glaucus_Tax_Matrix.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
                growl.error(data.errorMessage);
            }
            else{
                growl.error("Taxes Export request failed");
            }

        });

    }


    $scope.masterSkuDialog = function(ev, check){

        mastersService.fetchSkus(baseUrl).then(function(data){
            $scope.genericData.skusListFiltered = data;

        });

        $('#dialogmastersku').modal('show');

        $scope.genericData.check = check;

        if(check == true){

            console.log($scope.singleorderData);
        }

    }

    $scope.selectSku = function(id, ev){

        $http.get(baseUrl + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            if($scope.genericData.check == false){
                $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
            }else{
                $scope.$broadcast("angucomplete-alt:changeInput", "category", data);
            }

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog();
    }

    $scope.cancelmastersDialog = function(){
        $('#dialogmastersku').modal('hide');
    }

}
function activaTab(tab){
    $('.nav-tabs a[data-target="#' + tab + '"]').tab('show');
    console.log(tab);
};