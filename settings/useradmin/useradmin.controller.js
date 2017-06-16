myApp.controller('useradminController', useradminController);

useradminController.$inject = ['$scope', '$http', '$location', 'baseUrl', 'growl','PagerService'];

function useradminController($scope, $http, $location, baseUrl, growl,PagerService) {

    $scope.searchUserClicked = false;
    $scope.usersCount = 0;
    $scope.currentPage = 1;
    $scope.newRoleClicked = false;
    $scope.userSize = 5;
    $scope.start = 0;
    $scope.EmailRegex = /^([a-zA-Z0-9]{1}[a-zA-Z0-9.​_-]+)@([a-zA-Z0-9._​-]+)([.]{1})([a-zA-Z0-9]+)$/;
    $scope.showadduserform = true;
    $scope.vendorsData = [];

    $scope.warehouse = {};
    $scope.sales = {};


    $scope.selected = {};

   $scope.toggleSearchRow = function() {
        console.log($scope.searchUserClicked);
       $scope.searchUserClicked = !$scope.searchUserClicked;
    }

    $scope.SearchUseradmin = {};

    $scope.clearAction = function(){
        $scope.SearchUseradmin.UserName = '';
        console.log($scope.SearchUseradmin);
        $scope.listOfUsers($scope.start);

    }
  //  $scope.SearchUseradmin = {};
    $scope.$on('$routeChangeSuccess', function () {
       // $scope.listOfUsers();
        $scope.listOfUserAdminCount();
        $scope.listOfVendors();
    });

//get another portions of data on page changed
//    $scope.pageChanged = function() {
//        console.log($scope.currentPage);
//        $scope.listOfUsers();
//    };



    // fetching list of sale channels from RestAPI OMS
    $scope.userDataCount = {};
    $scope.listOfUsers = function (pageNumber,SearchUserName){
        var usersUrl;
        if(SearchUserName == null || SearchUserName == undefined ){
            usersUrl = baseUrl+"/omsservices/webapi/omsusers?start="+pageNumber+"&size="+$scope.userSize;
        }else{
            usersUrl = baseUrl+"/omsservices/webapi/omsusers/search?search="+SearchUserName+"&start="+pageNumber+"&size="+$scope.userSize;
        }
        $http.get(usersUrl).success(function(data) {
            console.log(data.length);
            $scope.usersData = data;
            $scope.usersCount = data.length;
            $scope.invCount =  data.length;
            //$scope.userDataCount.Count = data.length;
            $http.get(baseUrl+"/omsservices/webapi/omsusers").success(function(reposnedata) {
                $scope.userDataCount.Count = reposnedata.length;
                console.log(reposnedata);
                console.log($scope.userDataCount.Count);
            }).error(function(responsedata,status){
				if(status == 400)
                {
                    $scope.showBackEndStatusMessage(responsedata);
                    return;
                }
            });
                //$scope.ListPagination();
            console.log(data);
        }).error(function(error,status){
            console.log(error);
			if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }

        });
    };

  //  $scope.searchedUser = function(data){
  //      console.log('userData',data);
  //  };

    $scope.listOfUserAdminCount = function(page) {
        var UserAdminCountUrl = baseUrl + "/omsservices/webapi/omsusers";

        $http.get(UserAdminCountUrl).success(function(data) {
            console.log(data);
            $scope.invCount = data.length;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.invCount); // dummy array of items to be paged
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

                    $scope.start = (vm.pager.currentPage - 1) * 5;
                    $scope.inventorySize = $scope.start + 5;


                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfUsers($scope.start);
                }
            }
        }).error(function(error, status) {
			if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }

        });
    };

    $scope.showAddNewUserModal = function() {
        $scope.RoleSubmission.$setPristine();
        $scope.EditUser = false;
        $scope.AddUserBtn = true;
        $('#addNewUserModal').modal('show');
    };

    //=================== creating new user ====================== //

    $scope.getUserGroup = function(){
        var roleUser = baseUrl+"/omsservices/webapi/omsusergroups";
        $http.get(roleUser).success(function(data){
            console.log(data);
            $scope.selectRole = data;
        }).error(function(error,status){
            console.log(error);
			if(status == 400)
                {
                    $scope.showBackEndStatusMessage(error);
                    return;
                }

        });
    };
    $scope.userRoleData = [];
    $scope.getUserRoles = function(groupid){
        var roleUser = baseUrl+"/omsservices/webapi/grouprolemap/group/"+groupid;
        $http.get(roleUser).success(function(data){
            $scope.userRoleData = data;
        }).error(function(error,status){
            console.log(error);
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
        });
    };

    $scope.getUserGroup();

    $scope.cancelAddNewRoleUserModal = function() {
        $('#AddUserNewRole').modal('hide');
        $scope.userRoleData = [];
        $scope.RoleSubmission.$setPristine();
    };

    $scope.EditRole = function(){
        var roletype = $scope.RoleType;

        if(roletype && !angular.equals({}, roletype)){
            $scope.editPermission = true;
            $scope.createPermission = false;
            $scope.getUserRoles(roletype.idtableOmsUserGroupId);
            $('#AddUserNewRole').modal('show');
        }
        else{
            growl.error("Select Role");
        }
    };

    $scope.addRole = function(){
        $scope.editPermission = false;
        $scope.createPermission = true;
        $scope.RoleType ={};
        $scope.getAllUserRoles();
    }

    $scope.getAllUserRoles = function(groupid){
        var roleUser = baseUrl+"/omsservices/webapi/grouprolemap/allroles";
        $http.get(roleUser).success(function(data){
            $scope.userRoleData = data;
        }).error(function(error,status){
            console.log(error);
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(error);
                return;
            }
        });
    };

    $scope.UserAdmin = {};

    $scope.selection = [];
    $scope.MyCategories = true;
    var idx;

    $scope.cancelAddNewUserModal = function() {
        $('#addNewUserModal').modal('hide');
        $scope.UserAdmin = {};
        $scope.RoleType ={};
        $scope.userRoleData = [];
        $scope.selectedchannels = [];
        $scope.selectedwarehouses = [];
        $scope.showadduserform = true;
        $scope.selectedvendor = {};
        $scope.warehouse = {};
        $scope.sales = {};
    };


    $scope.createRoles = function(checkedData){

    if(!$scope.RoleType.tableOmsUserGroupName){
        growl.error("Provide role name");
        return;
    }
      var postData = {};
      postData.tableOmsUserGroupRoles =$scope.userRoleData;
      postData.group = $scope.RoleType;
      var methodType ="";
      if($scope.createPermission){
          methodType = 'POST';
      }
      else{
          methodType = 'PUT';
      }
        $http({
            method: methodType,
            url: baseUrl + '/omsservices/webapi/grouprolemap',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            $scope.getUserGroup();
            $('#AddUserNewRole').modal('hide');
        }).error(function(data,status){
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(data);
                return;
            }
            console.log(data);
        })
    };

    $scope.listOfChannels = function() {
        $scope.channelNamesData = [];
        var channelListUrl = baseUrl + "/omsservices/webapi/saleschannels?uipagename="+$scope.pagename;
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function(data) {
            console.log(data);
            $scope.channelLists = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfChannels();

    $scope.selectedchannels = [];

    $scope.addChannel = function(){
        var saleschannel = $scope.sales.channel;
        if(!saleschannel){
            var allchannel = {
                tableSalesChannelValueInfo :{
                    tableSalesChannelValueInfoName :'All'
                }
            };
            $scope.selectedchannels =[];
            $scope.selectedchannels.push(allchannel);
        }
        else{
            var omssaleschannel = {};
            omssaleschannel.tableSalesChannelValueInfo = saleschannel;
            if($scope.selectedchannels.length > 0){
                    if($scope.selectedchannels[0].tableSalesChannelValueInfo.tableSalesChannelValueInfoName == 'All'){
                        growl.error("All sales channel selected");
                    }
                    else{
                        var keepGoing = true;
                        angular.forEach($scope.selectedchannels, function(channel){
                            if(keepGoing) {
                                if(omssaleschannel.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId == channel.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId){
                                    keepGoing = false;
                                }
                            }
                        });
                        if(keepGoing){
                            $scope.selectedchannels.push(omssaleschannel);
                        }
                    }
            }
            else{
                $scope.selectedchannels.push(omssaleschannel);
            }
        }
    }

    $scope.removeSalesChannel = function(index){
        $scope.selectedchannels.splice(index, 1);
    }


    $scope.getWarehouses = function() {
        $scope.wareHousesData = [];
        var warehouseUrl = baseUrl + "/omsservices/webapi/warehouses?uipagename="+$scope.pagename;
        $http.get(warehouseUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesData.push(data[i]);
            }
        }).error(function(error, status) {
        });
    };

    $scope.getWarehouses();

    $scope.selectedwarehouses = [];

    $scope.addWarehouse = function(){
        var warehouse = $scope.warehouse.details;
        if(!warehouse){
            var allwarehouse = {
                tableWarehouseDetails :{
                    tableWarehouseDetailsLongname :'All'
                }
            };
            $scope.selectedwarehouses =[];
            $scope.selectedwarehouses.push(allwarehouse);
        }
        else{
            var omswarehouse = {};
            omswarehouse.tableWarehouseDetails = warehouse;
            if($scope.selectedwarehouses.length > 0){
                if($scope.selectedwarehouses[0].tableWarehouseDetails.tableWarehouseDetailsLongname == 'All'){
                    growl.error("All warehouse selected");
                }
                else{
                    var keepGoing = true;
                    angular.forEach($scope.selectedwarehouses, function(warehousemap){
                        if(keepGoing) {
                            if(omswarehouse.tableWarehouseDetails.idtableWarehouseDetailsId == warehousemap.tableWarehouseDetails.idtableWarehouseDetailsId){
                                keepGoing = false;
                            }
                        }
                    });
                    if(keepGoing){
                        $scope.selectedwarehouses.push(omswarehouse);
                    }
                }
            }
            else{
                $scope.selectedwarehouses.push(omswarehouse);
            }
        }
    }

    $scope.removeWarehouse = function(index){
        $scope.selectedwarehouses.splice(index, 1);
    }

    $scope.addNewUser = function(){
        var roletype = $scope.RoleType;

        if(!roletype || angular.equals({}, roletype)){
            growl.error("Select Role");
            return;
        }
    console.log($scope.selected.vendor);
        if($scope.showadduserform == false)
        {
            $scope.UserAdmin.tableOmsUserFirstName = $scope.selected.vendor.tableVendorName;
            $scope.UserAdmin.tableOmsUserLastName = "";
            $scope.UserAdmin.tableOmsUserEmail = $scope.selected.vendor.tableVendorEmailId;
            $scope.UserAdmin.tableOmsUserPhoneNo = $scope.selected.vendor.tableVendorPhoneNumber;
            var allchannel = {
                tableSalesChannelValueInfo :{
                    tableSalesChannelValueInfoName :'All'
                }
            };

            var allwarehouse = {
                tableWarehouseDetails :{
                    tableWarehouseDetailsLongname :'All'
                }
            };

            $scope.selectedchannels =[];
            $scope.selectedchannels.push(allchannel);

            $scope.selectedwarehouses = [];
            $scope.selectedwarehouses.push(allwarehouse);
        }

        $scope.UserAdmin.tableOmsUserGroup = $scope.RoleType;
        if($scope.selectedchannels.length == 0){
            growl.error("Assign Sales Channels to User");
            return;
        }

        if($scope.selectedchannels.length == 1 && $scope.selectedchannels[0].tableSalesChannelValueInfo.tableSalesChannelValueInfoName == 'All'){
            $scope.selectedchannels = [];
        }

        if($scope.selectedwarehouses.length == 0){
            growl.error("Assign Warehouse to User");
            return;
        }

        if($scope.selectedwarehouses.length == 1 && $scope.selectedwarehouses[0].tableWarehouseDetails.tableWarehouseDetailsLongname == 'All'){
            $scope.selectedwarehouses = [];
        }


        $scope.UserAdmin.tableOmsUserSalesChannelMaps = $scope.selectedchannels;

        $scope.UserAdmin.tableOmsUserWarehouseMaps = $scope.selectedwarehouses;

        var methodtype = 'POST';
        if($scope.EditUser){
            methodtype = 'PUT';
        }

        $http({
            method: methodtype,
            url: baseUrl + '/omsservices/webapi/omsusers',
            data: $scope.UserAdmin,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            console.log(data);
            growl.success('User has been Created Successfully');
            $('#addNewUserModal').modal('hide');
            $scope.cancelAddNewUserModal();
            $scope.listOfUsers($scope.start);
            $scope.listOfUserAdminCount($scope.start);

        }).error(function(data,status){
            console.log(data);
            if(status == 400)
            {
                $scope.showBackEndStatusMessage(data);
                return;
            }

        });
    };

    $scope.activationLink  = function(data,action){

        ///omsservices/webapi/users/1/activate
        if(action == 'active'){
            $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/omsusers/'+data.idtableOmsUserId+'/activate'
            }).success(function(response){
                console.log(response);
                $scope.listOfUsers($scope.start);
            }).error(function(response,status){
                if(status == 400)
                {
                    $scope.showBackEndStatusMessage(response);
                    return;
                }
                console.log(response);
            });
        }else{
            $http({
                method: 'PUT',
                url: baseUrl + '/omsservices/webapi/omsusers/'+data.idtableOmsUserId+'/deactivate'
            }).success(function(response){
                console.log(response);
                $scope.listOfUsers($scope.start);
            }).error(function(response,status){
                console.log(response);
                if(status == 400)
                {
                    $scope.showBackEndStatusMessage(response);
                    return;
                }
            });
        }
        console.log(data.idtableUserId);
    }

    $scope.EditUserAdmin = function(data){
        console.log(data);
        $scope.EditUser = true;
        $scope.AddUserBtn = false;
        //$scope.currentUser = data;
        $scope.selectedchannels = data.tableOmsUserSalesChannelMaps;
        if($scope.selectedchannels.length == 0)
        {
            var allchannel = {
                tableSalesChannelValueInfo :{
                    tableSalesChannelValueInfoName :'All'
                }
            };
            $scope.selectedchannels.push(allchannel);
        }

        $scope.selectedwarehouses = data.tableOmsUserWarehouseMaps;

        if($scope.selectedwarehouses.length == 0)
        {
            var allwarehouse = {
                tableWarehouseDetails :{
                    tableWarehouseDetailsLongname :'All'
                }
            };
            $scope.selectedwarehouses.push(allwarehouse);
        }

        $scope.UserAdmin = data;

        if(data.tableOmsUserGroup.tableOmsUserGroupName == 'ROLE_VENDOR')
        {
            $scope.showadduserform = false;
            $scope.UserAdmin = {};
            $scope.selectedchannels = [];
            for(var i = 0 ; i < $scope.vendorsData.length;i++)
            {
                if($scope.vendorsData[i].tableVendorEmailId == data.tableOmsUserEmail)
                {
                    $scope.selected.vendor = $scope.vendorsData[i];
                    break;
                }
            }
        }

        $scope.RoleType = data.tableOmsUserGroup;
        $('#addNewUserModal').modal('show');


    };


    $scope.showBackEndStatusMessage = function(errorMessage){
        if(errorMessage.errorMessage != undefined && errorMessage.errorMessage != '' && errorMessage.errorMessage != null)
            growl.error(errorMessage.errorMessage);
        else
            growl.error(errorMessage.documentation);
    }

    $scope.createAccessClicked = function(index)
    {
        if($scope.userRoleData[index].tableGroupRoleMapCreateAccess){
            $scope.userRoleData[index].tableGroupRoleMapEditAccess = true;
            $scope.userRoleData[index].tableGroupRoleMapReadAccess =true;
        }
        else{
            $scope.userRoleData[index].tableGroupRoleMapEditAccess = false;
            $scope.userRoleData[index].tableGroupRoleMapReadAccess =false;
        }
    }

    $scope.editAccessClicked = function(index)
    {
        $scope.userRoleData[index].tableGroupRoleMapCreateAccess = false
        if($scope.userRoleData[index].tableGroupRoleMapEditAccess){
            $scope.userRoleData[index].tableGroupRoleMapReadAccess =true;
        }
        else{
            $scope.userRoleData[index].tableGroupRoleMapReadAccess =false;
        }
    }

    $scope.readAccessClicked = function(index)
    {
        $scope.userRoleData[index].tableGroupRoleMapCreateAccess = false
        $scope.userRoleData[index].tableGroupRoleMapEditAccess = false;
    }

    $scope.bucketElement = function(role,type)
    {
        if(type == 'Orders')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'Sale Order')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Sale Return')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Purchase Return')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Returnable Goods')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Stock Transfer')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'PO')
            {
                return true;
            }
        }

        else if(type == 'Masters')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'SKU')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Customers')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Vendors')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Category')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Tax')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Discount')
            {
                return true;
            }
        }
        else if(type == 'WOPS')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'Inbound')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Outbound')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'WOPS Inventory')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'BulkUploads')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Export')
            {
                return true;
            }
        }
        else if(type == 'Settings')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'Warehouses')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Sales Channels')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'User Administration')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Client Profile')
            {
                return true;
            }
        }
        else if(type == 'Inventory')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'Inventory')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Inventory Passbook')
            {
                return true;
            }
        }

        else if(type == 'Analytics')
        {
            if(role.tableOmsUserRole.tableOmsUserRoleName == 'Analytics')
            {
                return true;
            }
            else if(role.tableOmsUserRole.tableOmsUserRoleName == 'Dashboard')
            {
                return true;
            }
        }
    }

        $scope.isSystemDefinedRole = function()
        {
            if($scope.RoleType.tableOmsUserGroupName == 'ROLE_ADMIN' || $scope.RoleType.tableOmsUserGroupName == 'ROLE_VENDOR')
            {
                return true;
            }
        }

        $scope.checkRole = function () {
            if($scope.RoleType.tableOmsUserGroupName == 'ROLE_VENDOR')
            {
                $scope.showadduserform = false;
            }
            else
            {
                $scope.showadduserform = true;
            }
        }

        $scope.listOfVendors = function() {
            $scope.vendorsData = [];
            var vendorsListUrl = baseUrl + "/omsservices/webapi/vendors";
            $http.get(vendorsListUrl).success(function(data) {
                $scope.vendorsLists = data;
                for (var i = 0; i < $scope.vendorsLists.length; i++)
                {
                    $scope.vendorsData.push($scope.vendorsLists[i]);
                }
            }).error(function(error, status) {
                if(status == 400)
                {
                    growl.error(error.errorMessage);
                }
                else
                {
                    growl.error("Failed to load Vendor list");
                }
            });
        }

}
