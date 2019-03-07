'use strict';

angular.module('starter').factory("LoginFactory", function($q, $http) {
	 var factory = {
    };

    factory.getAssociate = function(obj) {
		console.log(obj)
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/associates',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            d.resolve(success)
        }, function(error) {
            d.reject(error)
        });
        return d.promise;
    };

    factory.getMaster= function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/masters',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            d.resolve(success)
        }, function(error) {
            d.reject(error)
                // alert("Error. while created user Try Again!" + success);
        });
        return d.promise;
    };


    return factory;
});