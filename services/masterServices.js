
myApp.service('mastersService', ['$http', 'growl','$q', function ($http, growl, $q)
{
   this.fetchSkus = function (baseUrl) {
		 
		 var q = $q.defer();
		 
		 $http.get(baseUrl + '/omsservices/webapi/masters/skus?onlySku=false').success(function(data) {
         console.log(data);
		 q.resolve(data);
        }).error(function(error, status) {
            console.log(error);
			q.reject();
        });
		
		return q.promise;
   }

    this.fetchVendorSkus = function (baseUrl, vendorid)
    {
        var q = $q.defer();
        $http.get(baseUrl +"/omsservices/webapi/vendors/"+vendorid+"/skumap/skus").success(function(data) {
            console.log(data);
            q.resolve(data);
        }).error(function(error, status) {
            console.log(error);
            q.reject();
        });
        return q.promise;
    }

    this.fetchOnlySkus = function (baseUrl)
    {
        var q = $q.defer();
        $http.get(baseUrl +'/omsservices/webapi/masters/skus?onlySku=true').success(function(data) {
            console.log(data);
            q.resolve(data);
        }).error(function(error, status) {
            console.log(error);
            q.reject();
        });
        return q.promise;
    }
	
	this.fetchVendors = function (baseUrl) {
		 
		 var q = $q.defer();
		 
		 $http.get(baseUrl + '/omsservices/webapi/masters/vendors').success(function(data) {
           
            q.resolve(data);
        }).error(function(error, status) {
            console.log(error);
			q.reject();
        });
		
		return q.promise;
    }
	
	this.fetchCustomers = function (baseUrl) {
		 
		  var q = $q.defer();
		 
		 $http.get(baseUrl + '/omsservices/webapi/masters/customers').success(function(data) {
            returnObject = data;
            q.resolve(data);
        }).error(function(error, status) {
            console.log(error);
			q.reject();
        });
		
		return q.promise;
    }


}]);


