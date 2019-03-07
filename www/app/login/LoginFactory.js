'use strict';

angular.module('starter').factory("LoginFactory", function($q, $http) {
	 var factory = {
    };

    factory.getAssociate = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/associates?associate_id='+obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            // factory.teamList = success.data.documents;
            d.resolve(success)
                // alert(success)

            //alert("User has created Successfully" + success)
        }, function(error) {
            d.reject(error)
                // alert("Error. while created user Try Again!" + success);
        });
        return d.promise;
    };

    factory.getMaster= function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/masters?associateId='+obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            // factory.teamList = success.data.documents;
            d.resolve(success)
                // alert(success)

            //alert("User has created Successfully" + success)
        }, function(error) {
            d.reject(error)
                // alert("Error. while created user Try Again!" + success);
        });
        return d.promise;
    };

    return {
        set: function(key, value) {
            return localStorage.setItem(key, JSON.stringify(value));
        },
        get: function(key) {
            return JSON.parse(localStorage.getItem(key));
        },
        destroy: function(key) {
            return localStorage.removeItem(key);
        },
    };
    


    
});