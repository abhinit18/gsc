/**
 * Created by angularpc on 08-02-2017.
 */
myApp.controller('categoryController', categoryController);

categoryController.$inject = ['$scope', '$http', '$location', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService', '$q', '$cookies', 'downloadCustomersTemplateUrl', 'Upload', '$timeout', '$cookies', '$rootScope'];

function categoryController($scope, $http, $location, $mdDialog, $mdMedia, baseUrl, growl, PagerService, $q, $cookies, downloadCustomersTemplateUrl, Upload, $timeout, $cookies, $rootScope) {

    //==================================== Blank arrays and global variable=========================== //

    $scope.categorySearchUrl = baseUrl + "/omsservices/webapi/skunode/search?search=";
    $scope.menuItems = [];
    $scope.activeMenu = [];
    $scope.SecondChildMenuItems = [];
    $scope.FirstChildMenuItems = [];
    $scope.ChildMenuItems = [];
    $scope.FinalList = [];
    $scope.selection = [];
    $scope.selecteNodeToManageAttributes = {};
    $scope.manageAttributeMode = "add";
    var numberVariable = 5;
    $scope.firstChildAddCategory = false;
    $scope.secondChildAddCategory = false;
    $scope.thirdChildAddCategory = false;
    $scope.SkuCategoryData = {};
    $scope.genericData = {};

    $scope.categoryMasterTypes = [];

    $scope.categoryMasterTypes.push(
        {
            "tableCategoryMasterTypeString" : 'Standard'
        },
        {
            "tableCategoryMasterTypeString" : 'Amazon'
        }
    )

    $scope.onCategoryMasterSelected = function ()
    {
        var setCategoryMasterURL = baseUrl + "/omsservices/webapi/clientprofiles/categorymaster?option=" + $scope.genericData.selectedCategoryMaster;

        $http({
            method: 'PUT',
            url: setCategoryMasterURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
        {
            $('#askCateogryMaster').modal('hide');
            if($scope.genericData.selectedCategoryMaster == 'Standard') {
                growl.success('GS1 ' + $scope.genericData.selectedCategoryMaster + ' has been configured as default category master');
            }
            if($scope.genericData.selectedCategoryMaster == 'Amazon') {
                growl.success($scope.genericData.selectedCategoryMaster + ' has been configured as default category master');
            }
            $scope.getAllNodes();


        }).error(error,status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error('Failed to set ' + $scope.genericData.selectedCategoryMaster + ' as default category master  ');
            }
        }
    }

    $scope.getCategoryMasterFlag = function () {

        var getCategoryMasterFlagURL = baseUrl + "/omsservices/webapi/clientprofiles/askcategorymaster";

        $http.get(getCategoryMasterFlagURL).success(function(data)
        {

            if(data == true)
            {
                $('#askCateogryMaster').modal('show');
            }
            else
            {
                $scope.getAllNodes();
            }

        }).error(function(error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to get category master");
            }
        });
    }

    $scope.getCategoryMasterFlag();

    $scope.setSelected = function (selected) {
        $scope.genericData.selectedCategory = selected;

        //TODO:
        //Send a backend request to get all parents and set them selected //use {nodeid}/parents
        //traverse in reverse order
    }

    //======================== cancel generate template dialog =============== //

    $scope.cancelGenerateTemplateDialog = function(){
    $scope.selection = [];
    };


    //========================On category selected ===========================//
    
    $scope.searchedCategorySelected = function (selected) {
        if(selected != null)
        {
            $scope.searchedCategory = selected;
        }
    }

    //========================On category selected ===========================//

    //=============================== fist time data whethter its selected or not ===================== //

    $scope.LoadSelectedSkuNode = function(){
        var SelectedNodeUrl = baseUrl + "/omsservices/webapi/skunode?selected=true";
        $http.get(SelectedNodeUrl).success(function (data) {
            console.log(data);
            $scope.FinalList = data;
            angular.forEach($scope.FinalList, function (node)
            {
                node.skuNodePathName = node.skuNodePathName.split(',');
            });

        }).error(function (error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to get selected categories.");
            }
        });
    };
    $scope.LoadSelectedSkuNode();

    //====================================== ends here  ============================ //

    $scope.setActive = function (menuItem, nodeType) {
        console.log(menuItem);
        var crumbPath = menuItem.skuNodePathName.split(',');
        $scope.activeMenu = [];
        $scope.activeMenu = crumbPath;
        console.log($scope.activeMenu);
        if (nodeType == 'parent') {
            $scope.parentMenu = menuItem;
        }
        if (nodeType == 'first') {
            $scope.firstMenu = menuItem;
        }
        if (nodeType == 'second') {
            $scope.secondMenu = menuItem;
        }
        if (nodeType == 'third') {
            $scope.thirdMenu = menuItem;
        }
    };


    //=========================== list of parent nodes ================== //

    $scope.getAllNodes = function () {
        var NodeUrl = baseUrl + "/omsservices/webapi/skunode/parentnodes";
        $http.get(NodeUrl).success(function (data) {
            console.log(data);
            $scope.menuItems = data;
        }).error(function (error, status) {
            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to get parent nodes");
            }
        });
    };


    //======================= selected parent Node ====================== //


    $scope.variablePath = [];
    $scope.ActiveParentNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        $scope.SecondChildMenuItems = [];
        $scope.FirstChildMenuItems = [];
        $scope.ChildMenuItems = [];
        var childNodeUrl = baseUrl +"/omsservices/webapi/skunode/"+$scope.SkuCategoryData.idskuNodeId+"/childnodes";
        $http.get(childNodeUrl).success(function (data) {
            console.log(data);
            $scope.firstChildAddCategory = true;
            $scope.secondChildAddCategory = false;
            $scope.thirdChildAddCategory = false;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });
            $scope.ChildMenuItems = data;

        }).error(function (error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to get child categories for selected category.");
            }
        });
    };


//    ================================== first child Nodes =================================== //

    $scope.firstChildNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        $scope.SecondChildMenuItems = [];
        $scope.FirstChildMenuItems = [];
        var firstChildNodeUrl = baseUrl +"/omsservices/webapi/skunode/"+$scope.SkuCategoryData.idskuNodeId+"/childnodes";
        $http.get(firstChildNodeUrl).success(function (data) {
            console.log(data);
            $scope.secondChildAddCategory = true;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });

            $scope.FirstChildMenuItems = data;

        }).error(function (error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to get child categories for selected category.");
            }
        });
    };


//    ====================================== second Child node ===================== //

    $scope.secondChildNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        var secondChildNodeUrl = baseUrl +"/omsservices/webapi/skunode/"+$scope.SkuCategoryData.idskuNodeId+"/childnodes";
        $http.get(secondChildNodeUrl).success(function (data) {
            console.log(data);
            $scope.thirdChildAddCategory = true;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });

            $scope.SecondChildMenuItems = data;

        }).error(function (error, status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to get child categories for selected category.");
            }
        });
    };

    $scope.CategoryDeleteObj = {};
    $scope.CategoryDeleteConfirmation = function(data,index){
        $scope.CategoryDeleteObj.categoryItemData = data;
        $scope.CategoryDeleteObj.categoryItemDataIndex = index;
        $('#DeleteCategoryModal').modal('show');
    };
    $scope.DeleteSelectedItemFromCategoryList = function(){
        $scope.SelectThirdChildNode($scope.CategoryDeleteObj.categoryItemData,'delete',$scope.CategoryDeleteObj.categoryItemDataIndex);
    };
    $scope.cancelDeleteCategoryModal = function(){
        $('#DeleteCategoryModal').modal('hide');
    };
    $scope.SelectThirdChildNode = function (data,buttonAction,index) {

        if(data == null || data == undefined)
        {
            growl.error('Select a category first');
            return;
        }
        $scope.SkuCategoryData = data;
        console.log(data);
        console.log(index);
        console.log(buttonAction);

        if(buttonAction == 'select')
        {
            for(var nodeCounter  = 0; nodeCounter < $scope.FinalList.length; nodeCounter++)
            {
                if ($scope.FinalList[nodeCounter].idskuNodeId == data.idskuNodeId)
                {
                    growl.error('Category already selected');
                    if($scope.searchedCategory != null)
                    {
                        $scope.searchedCategory = null;
                        $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
                    }
                    return ;
                }
            }
        }

        if(buttonAction == 'delete')
        {
            var childSelectionUrl = baseUrl + '/omsservices/webapi/skunode/'+$scope.SkuCategoryData.idskuNodeId+"/select?selected="+false;
        }
        else
        {
            childSelectionUrl = baseUrl + '/omsservices/webapi/skunode/'+$scope.SkuCategoryData.idskuNodeId+"/select?selected="+true;
        }
        $http({
            method: 'PUT',
            url: childSelectionUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
        {
            console.log(response);
            if(buttonAction == 'select')
            {
                data.skuNodePathName = data.skuNodePathName.split(',');
                $scope.FinalList.push(data);
                $scope.searchedCategory = null;
                $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
                growl.success('Category added successfully');
                console.log($scope.FinalList);
            }
            else
            {
                $scope.FinalList.splice(index,1);
                $('#DeleteCategoryModal').modal('hide');
                growl.success('Category removed successfully');
            }

        }).error(function(error,status)
        {
            if(status == 400)
            {
                growl.error(error.errorMessage);
            }
            else
            {
                growl.error("Failed to remove category.");
            }

        });
        console.log($scope.FinalList);
    };

//    ==================================== function for generating template ============================ //

    $scope.PostTemplateData = function(data){
        console.log($scope.selection);
        var postTemplateData = [];
        postTemplateData = angular.copy(data);
        angular.forEach(postTemplateData, function (value)
        {
            console.log(value);
            value.skuNodePathName = value.skuNodePathName.join();
        });

        if(postTemplateData.length > numberVariable)
        {
            growl.error('You are not allowed to select more than '+ numberVariable +' categories for template generation.');
            return;
        }
        if(postTemplateData.length < 1)
        {
            growl.error('Select at least one category.');
            return;
        }
        else
        {
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/skus/gettemplateforskuupload',
                data: postTemplateData,
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
                a.download = "Glaucus_SKU_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
                growl.success('Template generated successfully.');
                $("#generateTemp").modal('hide');
                $scope.cancelGenerateTemplateDialog();
            }).error(function (error,status)
            {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error("Failed to generate template.");
                }
            });
        }

    };

//    ============================================= generate template ================================== //

    $scope.bitchange = function(site){

        var idx = $scope.selection.indexOf(site);
        console.log(idx);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(site);
        }
        console.log($scope.selection);

    };

    $('#generateTemp').on('show.bs.modal' , function (e){

        $scope.LoadSelectedSkuNode();
    });

    $scope.GenerateTemplate = function (data) {
        console.log(data);

        if(data.length <= numberVariable){
            $scope.PostTemplateData(data);
        }
        else
        {
            data = [];
            $scope.selection = [];
            $('#generateTemp').modal('show');
        }
    };
    $scope.SendTemplate = function(){
        $scope.PostTemplateData($scope.selection);
    };

//    ========================================== add categories -================================ //

    var addCategoryUrl;
    $scope.addCategories = function(value){
        $scope.addCategorybtnType = value;
        if($scope.addCategorybtnType == 'parent'){
            addCategoryUrl = baseUrl + '/omsservices/webapi/skunode';
        }else{
            addCategoryUrl = baseUrl + '/omsservices/webapi/skunode/'+$scope.SkuCategoryData.idskuNodeId +'/addchild';
        }
        $('#AddCategoryTemp').modal('show');
    };
    $scope.SendCategoryName = function()
    {
        if($scope.categoryName == null || $scope.categoryName == undefined || $scope.categoryName == ""){
            growl.error('Category name is required.');
            return;
        }
        else
        {
            if($scope.addCategorybtnType == 'third')
            {
                $scope.SkuCategoryData.skuNodeHasChild = false;
            }
            else
            {
                $scope.SkuCategoryData.skuNodeHasChild = true;
            }
            var postcategoryData = {
                "skuNodeName": $scope.categoryName,
                "skuNodeHasChild" : $scope.SkuCategoryData.skuNodeHasChild,
                "skuNodeBrowseNodeId": null,
                "skuNodePathName": null,
                "skuNodeIsSelected": false,
                "skuNodeIsStandard": false,
                "tableSkuNodeAttributeTypes": []
            };
            $http({
                method: 'POST',
                url: addCategoryUrl,
                data: postcategoryData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data){
                console.log(data);
                if($scope.addCategorybtnType == 'parent'){
                    $scope.menuItems.push(data);
                }if($scope.addCategorybtnType == 'first'){
                    $scope.ChildMenuItems.push(data);
                }if($scope.addCategorybtnType == 'second'){
                    $scope.FirstChildMenuItems.push(data);
                }if($scope.addCategorybtnType == 'third'){
                    $scope.SecondChildMenuItems.push(data);
                }
                $scope.categoryName = "";
                $('#AddCategoryTemp').modal('hide');
                growl.success('Category added successfully.');
            }).error(function(error,status)
            {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error("Failed to add category.");
                }
            });
        }
    }

//    ================================================== Manage attribute ========================================== //

    $scope.LoadAttribute = function(data)
    {
        $scope.attrDetails = data.tableSkuNodeAttributeTypes;
    };

    $scope.attributeValues = [];
    $scope.attributeValues[0] = {};
    $scope.addElement = function(){
        $scope.attributeValues.push({});
        console.log($scope.attributeValues);
    };
    $scope.manageAttr = function(data){
        $scope.selecteNodeToManageAttributes = data;

        var attrUrl = baseUrl + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.selecteNodeToManageAttributes.idskuNodeId;
        $http.get(attrUrl).success(function(response)
        {
            $scope.selecteNodeToManageAttributes.tableSkuNodeAttributeTypes = response;
            console.log(data);
            $scope.LoadAttribute(data);
            $('#AttributeTemp').modal('show');
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error('Error while getting attributes for this category')
            }
        });
    }

    $scope.editSkuNodeAttribute = function (index)
    {
        $scope.manageAttributeMode = "edit";
        $scope.attributeIndex = index;

        $scope.newAttributeType = $scope.attrDetails[index];

        var attrPossibleValues = $scope.attrDetails[index].tableSkuNodeAttributePossibleValueses
        if(attrPossibleValues == null || attrPossibleValues.length == 0)
        {
            $scope.attributeValues[0] = {};
        }
        else
        {
            $scope.attributeValues = [];
            $scope.attributeValues = attrPossibleValues;
        }


    }

    $scope.saveNewAttributeAndValues = function()
    {
        if($scope.newAttributeType == undefined || $scope.newAttributeType.attributeTypeString == '' || $scope.newAttributeType.attributeTypeString == null ||  $scope.newAttributeType.attributeTypeString == undefined)
        {
            growl.error("Attribute name is mandatory");
            return;
        }
        if(isNaN(parseFloat($scope.newAttributeType.attributeTypeString)) == false){
            growl.error("Attribute name can not be digits");
            return;
        }

        var foundvalidval = false;
        for(var attrValCounter = 0; attrValCounter <  $scope.attributeValues.length ; attrValCounter++)
        {
            if($scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != null && $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != undefined && $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != '')
            {
                foundvalidval = true;
                $scope.attributeType = 'select';
            }
        }
        if(foundvalidval == false)
        {
            $scope.attributeType = 'text';
        }


        console.log($scope.selecteNodeToManageAttributes);
        console.log($scope.newAttributeType);
        console.log($scope.attributeValues);

        var attributeValsList = [];

        for(var attrValCounter = 0; attrValCounter <  $scope.attributeValues.length ; attrValCounter++)
        {
            if($scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == null || $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == undefined || $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == '')
            {
                continue;
            }
            else
            {
                if($scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard == null || $scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard == undefined)
                {
                    $scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard = false;
                }
                attributeValsList.push($scope.attributeValues[attrValCounter]);
            }
        }

        var saveAttributeTypeURL =  baseUrl + '/omsservices/webapi/skunode/' + $scope.selecteNodeToManageAttributes.idskuNodeId + '/attributetypes';
        if($scope.newAttributeType.attributeTypeIsStandard == null || $scope.newAttributeType.attributeTypeIsStandard == undefined )
        {
            $scope.newAttributeType.attributeTypeIsStandard = false;
        }
        $scope.newAttributeType.tableSkuNodeAttributePossibleValueses = attributeValsList;
        $scope.newAttributeType.attributeType = $scope.attributeType;
        var postData = $scope.newAttributeType;

        var httpmethod = '';
        if($scope.manageAttributeMode == 'add')
        {
            httpmethod = "POST";
        }
        if($scope.manageAttributeMode == 'edit')
        {
            httpmethod = "PUT";
        }

        $http({
            method: httpmethod,
            url: saveAttributeTypeURL,
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                if($scope.manageAttributeMode == 'add')
                {
                    growl.success("Attribute added successfully");
                    $scope.attrDetails.push(res);
                }
                if($scope.manageAttributeMode == 'edit')
                {
                    $scope.attrDetails.splice($scope.attributeIndex);
                    $scope.attrDetails.push(res);
                    growl.success("Attribute updated successfully");
                }
                $scope.cancelManageAttributes();
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400){
                growl.error(error.errorMessage);
                return;
            }
            if($scope.manageAttributeMode == 'add')
            {
                growl.error("Failed to add attribute");
            }
            if($scope.manageAttributeMode == 'edit') {
                growl.error("Failed to update attribute");
            }
        });



    }

    $scope.hideManageAttributeDialog = function () {
        $('#AttributeTemp').modal('hide');
    }



    $scope.cancelManageAttributes = function () {

        $scope.attributeIndex = null;
        $scope.newAttributeType = {};
        $scope.attributeValues = [];
        $scope.attributeValues[0] = {}; //Need one for placeholder
        $scope.manageAttributeMode = "add";

    }

}
