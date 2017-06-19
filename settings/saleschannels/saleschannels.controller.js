myApp.controller('saleschannelsController', saleschannelsController);

saleschannelsController.$inject = ['$scope', '$http', '$location', 'baseUrl', 'growl','$cookies'];

function saleschannelsController($scope, $http, $location, baseUrl, growl,$cookies) {
    $scope.addNewSaleChannelClicked = false;
    $scope.showVerifyIntegration = false;
    $scope.integrationVerified = false;
    $scope.integrationNotVerified = false;

    $scope.saleChannelMode = 'add';

    $scope.verificationmessage = '';

    $scope.genericData = {};
    $scope.returnTypes = [];

    $scope.returnTypes.push(
        {
            "returnTypeString" : 'valuebased',
            "returnTypeDisplayString" : '% Value'
        },
        {
            "returnTypeString" : 'quantitybased',
            "returnTypeDisplayString" : '% Quantity'
        }
    )

    $scope.genericData.returnType = "";

    $scope.checkNumber = checkNumber;

    $scope.toggleSaleChannelRow = function() {
        console.log($scope.addNewSaleChannelClicked);
        $scope.addNewSaleChannelClicked = !$scope.addNewSaleChannelClicked;
    }

    $scope.clientprofile = {}
    $scope.getClientProfile = function(){
        var clientProfileUrl =baseUrl +"/omsservices/webapi/clientprofiles/1"
        $http.get(clientProfileUrl).success(function(data) {
            $scope.clientprofile = data;
        }).error(function(error, status) {
            if(status == 400){
                growl.error(error.errorMessage);
            }
            else{
                growl.error("Failed to get client profile")
            }
            console.log(error);

        });
    }

    $scope.$on('$routeChangeSuccess', function() {
        $scope.listOfSaleChannel();
        $scope.getClientProfile();
    });

    $scope.cancelAddNewSalesChannelDialog = function(){
      $('#AddNewSalesChannelDialog').modal('hide');
    };

    // fetching list of sale channels from RestAPI OMS
    $scope.listOfSaleChannel = function() {
        var saleChannelUrl = baseUrl + "/omsservices/webapi/saleschannelmetadata";
        $http.get(saleChannelUrl).success(function(data) {
            $scope.saleChannelData = data;
            console.log(data);
        }).error(function(error, status) {

            console.log(error);

        });
    }

    $scope.isActive = function(clickedSalesChannel) {
        if ($scope.channelName == clickedSalesChannel) {
            return true;
        }
        return false;
    };

    $scope.listOfSubSaleChannels = function(channelData) {
        $scope.showVerifyIntegration = false;
        $scope.integrationVerified = false;
        $scope.integrationNotVerified = false;
        console.log(channelData);

        $scope.subChannelData = [];
        $scope.addNewSaleChannelClicked = false;
        console.log(channelData);
        $scope.metaInfoValues = [];
        $scope.metaChannelData = [];
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField1);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField2);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField3);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField4);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField5);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField6);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField7);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField8);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField9);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField10);
        console.log($scope.metaInfoValues);
        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: null
                })
            }
        }
        $scope.isKeyEntered = [];
        for (var i = 0; i < $scope.metaChannelData.length; i++) {
            if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                $scope.isKeyEntered[i] = false;
            }
        }
        $scope.channelData = channelData;
        $scope.channelName = channelData.tableSalesChannelMetaInfoName;
        var subSaleChannelUrl = baseUrl + "/omsservices/webapi/saleschannelmetadata/" + channelData.idtableSalesChannelMetaInfoId + "/saleschannels";
        $http.get(subSaleChannelUrl).success(function(data) {
            $scope.subSaleChannelData = data;
            console.log(data);
        }).error(function(error, status) {

            console.log(error);

        });
    }

    $scope.channelNameEntered = function(tableSalesChannelValueInfoName) {
        if (!tableSalesChannelValueInfoName) {
            $scope.isChannelNameEntered = true;
        } else {
            $scope.isChannelNameEntered = false;
        }
    };

    $scope.saleschannelexist = true;
    $scope.isSalesChannelExist = function(){
        var name = $scope.subChannelData.tableSalesChannelValueInfoName;
        if(!name){
            
            return;
        }
        var mode = $scope.saleChannelMode;
        if(mode == 'add'){
            $http({
                method: 'POST',
                url: baseUrl + '/omsservices/webapi/saleschannels/checkname?name='+name,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if(res == true){
                    growl.error("Sales Channel already exist with the name "+name);
                    $scope.saleschannelexist = true;
                }
                else{
                    $scope.saleschannelexist = false;
                }
            }).error(function(error, status) {

                console.log(error);
                if(status == 400){
                    growl.error(error.errorMessage);
                }else {
                    growl.error("Failed to check sales channel exists");
                }
            });
        }
    }

    $scope.saveSubChannel = function(subChannelData, channelData, metaChannelData) {

        var isOkToSave = true;

        if (!$scope.subChannelData) {
            growl.error("Please Enter the Channel Name");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        } else if (!$scope.subChannelData.tableSalesChannelValueInfoName) {
            growl.error("Please Enter the Channel Name");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        } else if ($scope.subChannelData.tableSalesChannelValueInfoName.length > 45) {
            growl.error("Channel Name is exceeding the 45 characters limit!");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
            growl.error("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }

        if (isOkToSave) {
            if (!$scope.metaChannelData) {
                growl.error("Please enter the " + $scope.metaChannelData[0].tableSalesChannelValueMetaValue + "!");
                $scope.isKeyEntered[0] = true;
                isOkToSave = false;
            } else if ($scope.metaChannelData.length > 0) {
                for (var i = 0; i < $scope.metaChannelData.length; i++) {
                    if (!$scope.metaChannelData[i].tableSalesChannelValueInfoValue)
                    {
                        //Skip user name and password for Amazon
                        if(channelData.idtableSalesChannelMetaInfoId == 1) //Amazon - skip username and password checks
                        {
                            if($scope.metaChannelData[i].tableSalesChannelValueMetaValue == "User Name" || $scope.metaChannelData[i].tableSalesChannelValueMetaValue == "Password")
                            {
                                continue;
                            }
                        }
                        growl.error("Please enter the " + $scope.metaChannelData[i].tableSalesChannelValueMetaValue + "!");
                        $scope.isKeyEntered[i] = true;
                        isOkToSave = false;
                        break;
                    }
                }
            }
        }
        if (isOkToSave) {
            if($scope.genericData.returnType == 'quantitybased'){
                subChannelData.tableSalesChannelValueInfoReturnValue = null;
            }else if($scope.genericData.returnType == 'valuebased'){
                subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
            }
            if (channelData.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                if ($scope.saleChannelMode == "add") {
                    $scope.saveSubChannelData(subChannelData, channelData, metaChannelData);
                } else if ($scope.saleChannelMode == "edit") {
                    $scope.editSubChannel(subChannelData, channelData, metaChannelData);
                }
            } else if ($scope.showVerifyIntegration) {
                growl.error("Please verify the integration!");
            } else if ($scope.integrationNotVerified) {
                growl.error("Verification has failed! Please verify the integration again!");
                $scope.showVerifyIntegration = true;
                $scope.integrationNotVerified = false;
                $scope.integrationVerified = false;
            } else if ($scope.integrationVerified) {
                if ($scope.saleChannelMode == "add") {
                    $scope.saveSubChannelData(subChannelData, channelData, metaChannelData);
                } else if ($scope.saleChannelMode == "edit") {
                    $scope.editSubChannel(subChannelData, channelData, metaChannelData);
                }
            }
        }
    };

    $scope.saveSubChannelData = function(subChannelData, channelData, metaChannelData) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[i].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }


        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/saleschannels',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                growl.success("New Sales Channel Added for " + channelData.tableSalesChannelMetaInfoName);
                $scope.listOfSubSaleChannels(channelData);
                $scope.addNewSaleChannelClicked = false;
                $scope.cancelAddNewSalesChannelDialog();
            }
        }).error(function(error, status) {

            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Sale Channel Cannot Be Added");
            }
        });
    };
    $scope.subChannelData = {};
    $scope.openChannel = function() {
        $scope.subChannelData = {};
        $scope.addNewSaleChannelClicked = true;
        $scope.genericData.returnType = "";
        $scope.saleChannelMode = 'add';
        $scope.metaChannelData = [];
        $scope.integrationVerified = false;
        $scope.isChannelNameEntered = false;
        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: null
                })
            }
        }
        $scope.showVerifyIntegration = false;
        $scope.isKeyEntered = [];
        for (var i = 0; i < $scope.metaChannelData.length; i++) {
            if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                $scope.isKeyEntered[i] = false;
            }
        }
        $('#AddNewSalesChannelDialog').modal('show');
    };

    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
    };

    $scope.editSaleChannelConfig = function(configid) {
        $scope.saleChannelMode = 'edit';
        //$scope.authTokenEntered(0);
        $scope.integrationVerified = true;
        $scope.verificationmessage = "Verified";
        $scope.addNewSaleChannelClicked = true;
        var saleChannelConfigUrl = baseUrl + "/omsservices/webapi/saleschannels/" + configid;
        $http.get(saleChannelConfigUrl).success(function(data)
        {
            if (data != null)
            {
                $scope.subChannelData = data;
                $scope.genericData.returnType = "";
                if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.subChannelData.tableSalesChannelValueInfoReturnValue)
                {
                    $scope.genericData.returnType = 'valuebased';
                }

                console.log(data);
                $scope.metaInfoValues = [];
                $scope.metaChannelData = [];
                $scope.metaValues = [];
                console.log(data.tableSalesChannelMetaInfo);


                $scope.metaValues.push(data.tableSalesChannelValueInfoValue1);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue2);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue3);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue4);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue5);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue6);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue7);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue8);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue9);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue10);

                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField1);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField2);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField3);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField4);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField5);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField6);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField7);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField8);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField9);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField10);


                console.log($scope.metaInfoValues);
                for (var i = 0; i < $scope.metaInfoValues.length; i++) {
                    if ($scope.metaInfoValues[i] != null) {
                        $scope.metaChannelData.push({
                            tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                            tableSalesChannelValueInfoValue: $scope.metaValues[i]
                        })
                    }
                }
                $scope.isKeyEntered = [];
                for (var i = 0; i < $scope.metaChannelData.length; i++) {
                    if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                        $scope.isKeyEntered[i] = false;
                    }
                }
                $('#AddNewSalesChannelDialog').modal('show');
            }
        }).error(function(error, status) {

            console.log(error);
            console.log(status);

        });
    }

    $scope.editSubChannel = function(subChannelData, channelData, metaChannelData) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }

        console.log(postSubChannelData);

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/saleschannels/' + subChannelData.idtableSalesChannelValueInfoId,
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                growl.success("Sale Channel Updated for " + channelData.tableSalesChannelMetaInfoName);
                $scope.listOfSubSaleChannels(channelData);
                $scope.addNewSaleChannelClicked = false;
                $scope.cancelAddNewSalesChannelDialog();
            }
        }).error(function(error, status) {

            console.log(error);

            if(status == 400)
            {
                growl.error(error.errorMessage);
                return;
            }
            else
            {
                growl.error("Sales channel cannot be updated");
            }
        });
    }

    $scope.authTokenEntered = function(index) {
        if($scope.saleschannelexist == false || $scope.saleChannelMode == 'edit'){
            $scope.showVerifyIntegration = true;
            $scope.integrationVerified = false;
            $scope.integrationNotVerified = false;
            $scope.isKeyEntered[index] = false;
        }
        else{
            $scope.showVerifyIntegration = true;
        }
    };
    $scope.cancelData = function(channelData) {
        $scope.addNewSaleChannelClicked = false;
        $scope.saleChannelMode = 'add';
        $scope.listOfSubSaleChannels(channelData)
    }

    $scope.verifyIntegration = function(subChannelData, channelData, metaChannelData) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;


        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[i].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;

        }

        if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }


        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/saleschannels/checkserviceavailability',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res != null) {
                $scope.showVerifyIntegration = false;
                console.log(res);
                if (res) {
                    $scope.integrationVerified = true;
                    $scope.verificationmessage = 'Verified Successfully';
                    growl.success("Verified Successfully!");
                }
                if (!res) {
                    $scope.integrationNotVerified = true;
                    growl.error("Verification Failed!");
                }
            }
        }).error(function(error, status) {

            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Sale Channel could not Be updated at this time");
            }
        });
    }

    $scope.openHelpModal = function(channelId) {
        console.log(channelId);

        if (channelId == 1) {
            $('#helpAmazonModal').modal('show');
        }
        if (channelId == 3) {
            $('#helpMagentoModal').modal('show');
        }
        if (channelId == 4) {
            $('#helpFlipkartModal').modal('show');
        }
        if (channelId == 5) {
            $('#helpftpModal').modal('show');
        }
    }

    $scope.clearHelpDialog = function() {
        $('#helpMagentoModal').modal('hide');
        $('#helpAmazonModal').modal('hide');
        $('#helpftpModal').modal('hide');
        $('#helpFlipkartModal').modal('hide');
        $('#viewCredentials').modal('hide');
    }

    $scope.viewftpcred = function(){
        $scope.metaRESChannelData = [];
        console.log($scope.metaInfoValues);
        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaRESChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: $scope.metaValues[i]
                })
            }
        }

        console.log($scope.metaRESChannelData);

        $('#viewCredentials').modal('show');
    }
    $scope.saveSubChannelMetaId5 = function(subChannelData,channelData,metaChannelData){
        console.log(subChannelData,channelData,metaChannelData);
        if (!$scope.subChannelData.tableSalesChannelValueInfoName) {
            growl.error("Please Enter the Channel Name");
            return;
        }
        if($scope.genericData.returnType == 'quantitybased'){
            subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }else if($scope.genericData.returnType == 'valuebased'){
            subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
            growl.error("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }
        console.log(metaChannelData);
        if(subChannelData.tableCustomerType != null && subChannelData.tableCustomerType !='undefined'){
            if(subChannelData.tableCustomerType.tableCustomerTypeString == 'B2C'){
                subChannelData.tableCustomerType= {
                    "idtableCustomerTypeId": 1,
                    "tableCustomerTypeString" : "B2C"
                };
            }else if(subChannelData.tableCustomerType.tableCustomerTypeString == 'B2B'){
                subChannelData.tableCustomerType= {
                    "idtableCustomerTypeId": 2,
                    "tableCustomerTypeString" : "B2B"
                };
            }
        }

        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;

        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: baseUrl + '/omsservices/webapi/saleschannels',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                growl.success("New Sales Channel Added for " + channelData.tableSalesChannelMetaInfoName);
                $scope.listOfSubSaleChannels(channelData);
                
                $scope.metaRESValues = [];
                $scope.metaRESInfoValues = [];
                $scope.metaRESChannelData = [];

                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue1);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue2);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue3);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue4);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue5);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue6);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue7);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue8);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue9);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue10);

                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField1);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField2);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField3);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField4);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField5);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField6);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField7);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField8);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField9);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField10);


                console.log($scope.metaRESInfoValues);
                for (var i = 0; i < $scope.metaRESInfoValues.length; i++) {
                    if ($scope.metaRESInfoValues[i] != null) {
                        $scope.metaRESChannelData.push({
                            tableSalesChannelValueMetaValue: $scope.metaRESInfoValues[i],
                            tableSalesChannelValueInfoValue: $scope.metaRESValues[i]
                        })
                    }
                }

                console.log($scope.metaRESChannelData);

                $('#viewCredentials').modal('show');
            }
        }).error(function(error, status) {

            console.log(error);
            if(status == 400){
                growl.error(error.errorMessage);
            }else {
                growl.error("Sale Channel Cannot Be Added");
            }
        });        

    }

    $scope.updateSubChannelMetaId5 = function(subChannelData,channelData){
        if(!$scope.subChannelData.tableSalesChannelValueInfoName){
            growl.error("Please Enter the Channel Name");
            return;
        }
        if($scope.genericData.returnType == 'quantitybased'){
            subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }else if($scope.genericData.returnType == 'valuebased'){
            subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
            growl.error("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
            growl.error("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }
        if(subChannelData.tableCustomerType != null && subChannelData.tableCustomerType !='undefined'){
            if(subChannelData.tableCustomerType.tableCustomerTypeString == 'B2C'){
                subChannelData.tableCustomerType= {
                    "idtableCustomerTypeId": 1,
                    "tableCustomerTypeString" : "B2C"
                };
            }else if(subChannelData.tableCustomerType.tableCustomerTypeString == 'B2B'){
                subChannelData.tableCustomerType= {
                    "idtableCustomerTypeId": 2,
                    "tableCustomerTypeString" : "B2B"
                };
            }
        }
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        console.log(postSubChannelData);

        $http({
            method: 'PUT',
            url: baseUrl + '/omsservices/webapi/saleschannels/' + subChannelData.idtableSalesChannelValueInfoId,
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                $scope.saleChannelMode = "add";
                growl.success("Sales Channel Updated for " + channelData.tableSalesChannelMetaInfoName);
                $scope.listOfSubSaleChannels(channelData);
            }
        }).error(function(error, status)
        {
            $scope.saleChannelMode = "add";
            console.log(error);
            if(status == 400)
            {
                growl.error(error.errorMessage);
                return;
            }
            else
            {
                growl.error("Sales channel cannot be updated");
            }
        });

    }
    $scope.getCustomerTypes = function () {
        $scope.customerTypes = [];
        var customersTypesUrl = baseUrl + "/omsservices/webapi/customertypes";
        $http.get(customersTypesUrl).success(function(data)
        {
            $scope.customerTypes = data;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });
    }

    $scope.getCustomerTypes();

}
