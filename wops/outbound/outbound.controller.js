/**
 * Created by angularpc on 23-12-2016.
 */
myApp.controller('outbound', outbound);

outbound.$inject = ['$scope', '$http', '$location', 'fileUpload', '$mdDialog', '$mdMedia', 'baseUrl', 'growl', 'PagerService', '$q', '$cookies', 'downloadOrderTemplateUrl', '$routeParams'];

function outbound($scope, $http, $location, fileUpload, $mdDialog, $mdMedia, baseUrl, growl, PagerService, $q, $cookies, downloadOrderTemplateUrl, $routeParams) {
    console.log('outbound controller found');
    $scope.activeTab = 'tab1';
    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;
    }
}
