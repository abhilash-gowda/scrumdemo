// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
    .module("starter", ["ionic" , "ionic-toast"])

    .run(function($ionicPlatform, $rootScope, $ionicLoading, $window) {
        $ionicPlatform.ready(function() {
            var isPaused = false;
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            $rootScope.$on("$cordovaNetwork:online", function(event, networkState) {
                $ionicLoading.hide();
            });
            $rootScope.$on("$cordovaNetwork:offline", function(event, networkState) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner><div>Waiting for network connection...',
                    animation: "fade-in",
                    showBackdrop: false
                });
            });

            

            $ionicPlatform.registerBackButtonAction(function(e) {
                if ($state.is("dashboard")) {
                    if (confirm("Are you sure you want to Exit?")) {
                        ionic.Platform.exitApp();
                        return false;
                    } else {
                        e.preventDefault();
                        return false;
                    }
                } else if ($state.is("timeSheetEntry")) {
                    e.preventDefault();
                    $rootScope.$broadcast("show-save-dialog");
                }
            }, 100);
        });

        $rootScope.$on("loading:show", function() {
            $ionicLoading.show({
                template: '<ion-spinner icon="android"></ion-spinner>',
                animation: "fade-in",
                showBackdrop: false
            });
        });

        $rootScope.$on("loading:hide", function() {
            $ionicLoading.hide();
        });
    })
    .config(function(
        $stateProvider,
        $urlRouterProvider,
        $httpProvider,
        $ionicConfigProvider,
        $locationProvider
    ) {
        $ionicConfigProvider.tabs.position("top");
        // $ionicConfigProvider.platform.android.tabs.position("bottom");
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $httpProvider.interceptors.push(function($rootScope) {
            return {
                request: function(config) {
                    $rootScope.$broadcast("loading:show");
                    return config;
                },
                requestError: function(requestError) {
                    $rootScope.$broadcast("loading:hide");
                    return requestError;
                },
                response: function(response) {
                    $rootScope.$broadcast("loading:hide");
                    return response;
                },
                responseError: function(rejection) {
                    $rootScope.$broadcast("loading:hide");
                    return rejection;
                }
            };
        });

        $stateProvider
            .state("dashboard", {
                // url: "/dashboard/:associateId/:accessToken",
                url: "/dashboard/:associateId",
                cache: false,
                templateUrl: "app/dashboard/Dashboard.html",
                controller: "DashboardController"
            })
            .state("login", {
                url: "/login",
                cache: false,
                templateUrl: "app/login/Login.html",
                controller: "LoginController"
            }).state("home", {
                url: "/home",
                cache: false,
                templateUrl: "app/home/Home.html",
                controller: "HomeController"
            });

        $urlRouterProvider.otherwise("/login");
    });