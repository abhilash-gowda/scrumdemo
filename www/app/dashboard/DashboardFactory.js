'use strict';

angular.module('starter').factory("DashboardFactory", function($q, $http) {
    var factory = {
        teamList: [],
        checkedPin: null,
        loggedInUser: {},
        loggedInMaster: {}
    };

    //get associate details
    factory.getLoggedInUserDetails = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/associates/?associate_id=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.loggedInUser = success.data;
            d.resolve(success);
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };

     //get master details
    factory.getLoggedInMasterDetails = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/masters/?associateId=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.loggedInMaster = success.data;
            d.resolve(success);
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };


    // get associates of logged in users team
    factory.getAssociateDetails = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',

            url: 'http://10.182.234.181:1337/associates?team=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.loggedInUserTeam = success.data;
            d.resolve(success)
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };



    //Check if master or associate
     factory.checkUserType = function(loggedUserId) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/masters?associateId=' + loggedUserId,
            data: loggedUserId,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.loggedInMaster = success.data;
            d.resolve(success)
        }, function(error) {
            d.reject(error)
        });
        return d.promise;
    };

    // pin updation
    factory.updatePin = function(pin, team) {
        var obj = {
            "pin": pin
        }
        var d = $q.defer();
        console.log(obj + " " + team)
        $http({
            method: 'PUT',
            url: 'http://10.182.234.181:1337/teams/' + team.id,
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

    //get scrumpoints of logged in user's teams
    factory.getScrumPoints = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',

            url: 'http://10.182.234.181:1337/scrumpoints?associate=' + obj+'&_sort=point:ASC',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.loggedInUserTeam = success.data;
            d.resolve(success)
        }, function(error) {
            d.reject(error)
        });
        return d.promise;
    };
    
    //get last 3 months scrumpoints of logged in user
    factory.getScrumPointsByMonth = function(obj, month) {
        var d = $q.defer();
        var date = moment().subtract(1, 'days').format('DD');
        if (month === moment().format('YYYY-MM')) {
            var url = 'http://10.182.234.181:1337/scrumpoints?associate=' + obj + '&created_at_gte=' + month + '-01&_sort=created_at:ASC';
        } 
        else{
            var url = 'http://10.182.234.181:1337/scrumpoints?associate=' + obj + '&created_at_gte=' + month + '-01&created_at_lte=' + month +'-'+date;
        }
        $http({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };


    //get agile rewards assigen for a user
    factory.getAgileRewards = function(obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
               url: 'http://10.182.234.181:1337/rewards?toAssociate=' + obj,
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

    //get all agile principles
     factory.getAgilePriciples = function() {
        var d = $q.defer();
        $http({

            method: 'GET',
            
            url: 'http://10.182.234.181:1337/agileprinciples?_sort=principleId:ASC',
            headers: {
                'Content-Type': 'application/json'
            },
            
        }).then(function(success) {
            d.resolve(success)
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };

    //Assign rewards to associates
    factory.assignRewards = function(agileprinciple, fromAssociate, toAssociate) {
        var obj = {
            "agileprinciple": agileprinciple,
            "toAssociate": toAssociate,
            "fromAssociate": fromAssociate
        }
        var d = $q.defer();
        $http({
            method: 'POST',
            url: 'http://10.182.234.181:1337/rewards/',
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

    //Scrum points updation
    factory.updatePoints = function(scrumPoints, id) {
        var obj = {
                "point":scrumPoints,
                "associate": {
                            "id": id
                            }}
        var d = $q.defer();
        $http({
            method: 'POST',
            url: 'http://10.182.234.181:1337/scrumpoints/',
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


    //get rewards of particular user based of current month  
    factory.getAssociateNameRewards = function(obj, month) {
        var d = $q.defer();
        if (month === moment().format('YYYY-MM')) {
            var url = 'http://10.182.234.181:1337/rewards?toAssociate=' + obj + '&created_at_gte=' + month + '-01T00:00:00.000Z';
        } 
        $http({
            method: 'GET',
            url: url,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error)
        });

        return d.promise;
    };




    //search for associates 
    factory.getSearchPeopleDetails = function(accessToken, obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'https://graph.microsoft.com/v1.0/users?$filter=startswith(userPrincipalName,\'' + obj + '\')',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            console.log(error)
            d.reject(error)
        });

        return d.promise;
    };

    //add associates for a team
    factory.addAssociateToTeam = function(name, id, teamId) {
        var d = $q.defer();
        var obj = {
            "name": name,
            "associate_id": id,
            "team": teamId
        }
        $http({
            data: obj,
            method: 'POST',
            url: 'http://10.182.234.181:1337/associates',

        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            console.log(error)
            d.reject(error)
        });

        return d.promise;
    };
    
    //check if scrumpoints already updated today
	  factory.checkForPoints= function(obj,today) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: 'http://10.182.234.181:1337/scrumpoints?associate='+obj+'&created_at_gte='+today+'T00:00:00.000Z',
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
	
	
    return factory;
});