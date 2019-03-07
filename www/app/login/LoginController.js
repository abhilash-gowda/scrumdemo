"use strict";

angular
    .module("starter")
    .controller("LoginController", function($scope, $stateParams, $ionicPopup, $timeout, LoginFactory, $q, $window, $state) {
        $scope.performLogin = function() {

            //$scope.authenticate(false);
            console.log("clicked");
            // window.config = {
            //     clientId: '6d87a008-e330-43c1-b280-6fdf0fb0c490',
            //     // redirectUri: 'https://login.microsoftonline.com/common/oauth2/nativeclient',
            //     popUp: true
            // };
            // var authContext = new AuthenticationContext(config);

            // var loginWindow;
            // loginWindow = window.open("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=6d87a008-e330-43c1-b280-6fdf0fb0c490&response_type=id_token+token&scope=openid%20https%3A%2F%2Fgraph.microsoft.com%2FSites.ReadWrite.All%20https%3A%2F%2Fgraph.microsoft.com%2Ftasks.ReadWrite.Shared%20https%3A%2F%2Fgraph.microsoft.com%2Fuser.read%20https%3A%2F%2Fgraph.microsoft.com%2FPeople.Read%20https%3A%2F%2Fgraph.microsoft.com%2FUser.ReadBasic.All&response_mode=fragment&state=12345&nonce=678910", "_self");
            // loginWindow.addEventListener('loadstart', function(evt) {
            //     console.log(evt);
            //     parser = $window.document.createElement('a');
            //     parser.href = evt.url;
            //     params = parser.search.split('&');

            //     angular.forEach(params, function (param) {
            //       if(param.indexOf('access_token') > -1) {
            //         token = param.substring(13);
            //         if(token) {
            //           $window.alert(token);
            //           loginWindow.close();
            //           localStorageService.set('beats-token', token);
            //           $state.transitionTo('app.feed');
            //         } else {
            //         }
            //     }
            // })

        

        var authority = "https://login.windows.net/cernerprod.onmicrosoft.com/";
        var resourceUri = "https://graph.microsoft.com";
        var clientId = "6d87a008-e330-43c1-b280-6fdf0fb0c490";

        var authContext = new $window.Microsoft.ADAL.AuthenticationContext(authority);

        authContext.acquireTokenAsync(resourceUri, clientId, "http://localhost:8100/")
            .then(function(authResponse) {
                console.log(authResponse)
                if (authResponse.accessToken) {
                    var uniqueId = authResponse.userInfo.uniqueId;
                    var userId = uniqueId.split("@");
                    console.log("true");
                   $scope.Id = userId[0];
                   console.log($scope.Id)
                   

                   
                //Check if logged member is associate
                   LoginFactory.getAssociate($scope.Id).then(
                    function(success) {

                     var IsAssociate = success.data.length;

                          //Check if logged member is Master
                    LoginFactory.getMaster($scope.Id).then(
                            function(success) {

                                var IsMaster = success.data.length;

                              if(IsAssociate || IsMaster )
                              {
                                $state.go('dashboard', { associateId: $scope.Id, accessToken: authResponse.accessToken });
                            }
                              else
                              {
                                $state.go('home');
                              }
                                
                            },
                            function(error) {
                                console.log(error);
                            }
                        );         
                    },
                    function(error) {
                        console.log(error);
                    }
                );


                    $state.go('dashboard', { associateId: userId[0], accessToken: authResponse.accessToken });
                }
                console.log("Token acquired: " + authResponse.accessToken);
                console.log("Token will expire on: " + authResponse.expiresOn);
            }, function(err) {
                console.log("Failed to authenticate: " + err);
            });
    }

        // var AzureB2C = {

        //     // ADAL AuthenticationContext instance, must not be set before cordova is ready
        //     authContext: null,

        //     // use this to make API requests after login
        //     authorizationHeader: null,

        //     // default to use
        //     redirectUrl: "urn:ietf:wg:oauth:2.0:oob",

        //     // default used by the updated ADAL libraries
        //     extraQueryParams: "nux=1",

        //     // ** required **
        //     authority: "https://login.microsoftonline.com/[YOUR_TENANT]",

        //     // ** required ** also sometimes called "App ID", looks something like this: f6dad784-f7d3-****-92bd-******
        //     clientId: "6d87a008-e330-43c1-b280-6fdf0fb0c490",

        //     // ** required **
        //     policy: "[YOUR_SIGNIN_POLICY]",

        //     // don't need to track this in most cases
        //     userId: null,

        //     // legacy - no longer needed in the updated ADALs libraries
        //     resourceUrl: ""
        // };

        // $scope.createContext = function() {
        //     window.config = {
        //         clientId: '6d87a008-e330-43c1-b280-6fdf0fb0c490',
        //         // redirectUri: 'https://login.microsoftonline.com/common/oauth2/nativeclient',
        //         popUp: true
        //     };
        //     $scope.authContext = new AuthenticationContext(config);
        //     console.log($scope.authContext);
        // };

        // $scope.authenticate = function(clear) {

        //     // if ($scope.authContext === null) {
        //     $scope.createContext();
        //     // }

        //     if (clear) {
        //         console.log("clearing cache before login...");
        //         $scope.authContext.tokenCache.clear();
        //     }

        //     var deferred = $q.defer();

        //     var loginSuccess = function(jwt) {
        //         console.log("login success: " + JSON.stringify(jwt, null, "\t"));
        //         AzureB2C.authorizationHeader = "Bearer " + jwt.token;
        //         deferred.resolve(jwt);
        //     };

        //     var loginError = function(error) {
        //         console.log("login error: " + JSON.stringify(error, null, "\t"));
        //         deferred.reject(error);
        //     };

        //     var loudSignIn = function() {
        //         AzureB2C.acquireTokenAsync()
        //             .then(loginSuccess, loginError);
        //     };

        //     var parseCache = function(items) {

        //         if (items.length > 0) {
        //             console.log("cache has items, attempting silent login");
        //             AzureB2C.acquireTokenSilentAsync()
        //                 .then(loginSuccess, loudSignIn);

        //         } else {
        //             console.log("cache is empty, attempting loud sign in");
        //             loudSignIn();
        //         }
        //     };
        //     console.log($scope.authContext.tokenCache);
        //     $scope.authContext.tokenCache.readItems()
        //         .then(parseCache, loudSignIn);

        //     return deferred.promise;
        // };


    });