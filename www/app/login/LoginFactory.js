'use strict';

angular.module('starter').factory("LoginFactory", function ($q, $http) {
    var factory = {
    };

    var url = "https://ctsgreetingsbeta.cerner.com";

    factory.getAssociate = function (obj) {
          const options = {
            method: 'GET',
          };
          var d = $q.defer();
          cordova.plugin.http.sendRequest(url + '/associates?associate_id=' + obj, options, function(response) {
            d.resolve(response)
          }, function(response) {
            d.reject(response.error)
          });
        return d.promise;
    };

    factory.getMaster = function (obj) {
        var d = $q.defer();
        const options = {
            method: 'GET',
          };
        cordova.plugin.http.sendRequest(url + '/masters?associateId=' + obj, options, function(response) {
            // prints 200
            console.log(response);
            d.resolve(response)
          }, function(response) {
            // prints 403
            console.log(response.status);
            d.reject(response.error)
            //prints Permission denied
            console.log(response.error);
          });
        return d.promise;
    };


    return factory;
});