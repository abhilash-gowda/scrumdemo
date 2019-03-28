'use strict';

angular.module('starter').factory("LoginFactory", function ($q, $http) {
    var factory = {
    };

    var url = "https://ctsgreetingsbeta.cerner.com";

    factory.getAssociates = function () {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url + '/associates',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            d.resolve(success)
        }, function (error) {
            d.reject(error)
        });
        return d.promise;
    };

    factory.getAssociate = function (obj) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url + '/associates?associate_id=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            d.resolve(success)
        }, function (error) {
            d.reject(error)
        });
        return d.promise;
    };

    factory.getMaster = function (obj) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url + '/masters?associateId=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            d.resolve(success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });
        return d.promise;
    };

    factory.getAgilePriciples = function () {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url + '/agileprinciples?_sort=principleId:ASC',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            d.resolve(success)
        }, function (error) {
            d.reject(error)
        });

        return d.promise;
    };


    return factory;
});