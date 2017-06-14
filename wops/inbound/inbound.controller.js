/**
 * Created by angularpc on 23-12-2016.
 */
myApp.controller('inbound', inbound);

inbound.$inject = ['$scope', '$http', '$location', 'fileUpload', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService', '$q', '$cookies', 'downloadOrderTemplateUrl', '$routeParams'];

function inbound($scope, $http, $location, fileUpload, $mdDialog, $mdMedia, baseUrl, growl, PagerService, $q, $cookies, downloadOrderTemplateUrl,  $routeParams) {
    console.log('inbound controller found');
    $scope.activeTab = 'tab1';
    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;
    }
}
