"use strict";

angular.module("starter").controller("LoginController", function ($scope, DashboardFactory, LoginFactory, $window, $state, ionicToast) {
    $scope.performLogin = function () {

        //$scope.authenticate(false);

        // window.config = {
        //     clientId: '6d87a008-e330-43c1-b280-6fdf0fb0c490',
        //     // redirectUri: 'https://login.microsoftonline.com/common/oauth2/nativeclient',
        //     popUp: true
        // };
        // var authContext = new $window.Microsoft.ADAL.AuthenticationContext(config);

        // var loginWindow;
        // var loginWindow = window.open("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=6d87a008-e330-43c1-b280-6fdf0fb0c490&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F&response_mode=query&scope=openid%20People.Read%20Sites.ReadWrite.All%20Tasks.ReadWrite.Shared%20User.Read%20User.ReadBasic.All&state=12345", "_self");
        // console.log(loginWindow);
        //     loginWindow.addEventListener('loadstart', function(evt) {
        //         console.log(evt);
        //         parser = $window.document.createElement('a');
        //         parser.href = evt.url;
        //         params = parser.search.split('&');

        //         angular.forEach(params, function (param) {
        //           if(param.indexOf('access_token') > -1) {
        //             token = param.substring(13);
        //             if(token) {
        //               $window.alert(token);
        //               loginWindow.close();
        //               localStorageService.set('beats-token', token);
        //               $state.transitionTo('app.feed');
        //             } else {
        //             }
        //         }
        //     })
        // });
        DashboardFactory.getAgilePriciples().then(
            function (success) {
                if (success.status === 200) {
                    var authority = "https://login.windows.net/cernerprod.onmicrosoft.com";
                    var resourceUri = "https://graph.microsoft.com";
                    var clientId = "98244847-be00-4aa7-a781-05785722d11f";

                    var authContext = new $window.Microsoft.ADAL.AuthenticationContext(authority);

                    authContext.acquireTokenAsync(resourceUri, clientId, "https://login.microsoftonline.com/common/oauth2/nativeclient")
                        .then(function (authResponse) {
                            if (authResponse.accessToken) {
                                var uniqueId = authResponse.userInfo.uniqueId;
                                var userId = uniqueId.split("@");
                                $scope.Id = userId[0];
                                //Check if logged member is associate
                                LoginFactory.getAssociate($scope.Id).then(
                                    function (success) {
                                        var IsAssociate = success.data.length;

                                        //Check if logged member is Master
                                        LoginFactory.getMaster($scope.Id).then(
                                            function (success) {
                                                console.log(success)
                                                var IsMaster = success.data.length;
                                                if (IsAssociate === 1 || IsMaster === 1) {
                                                    $state.go('dashboard', { associateId: $scope.Id, accessToken: authResponse.accessToken });
                                                }
                                                else {
                                                    $state.go('home');
                                                }
                                            },
                                            function (error) {
                                                console.log(error);
                                            }
                                        );
                                    },
                                    function (error) {
                                        console.log(error);
                                    }
                                );
                            }
                        }, function (err) {
                            console.log("Failed to authenticate: " + err);
                        });
                }
                else {
                    ionicToast.show("Make sure you are in proper network", "bottom", false, 3500);
                }
            },
            function (error) {
                console.log(error);
            }
        );
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