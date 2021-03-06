"use strict";

angular.module("starter").controller("DashboardController", function ($scope, $stateParams, $ionicPopup, DashboardFactory, $ionicPopover, ionicToast, $ionicLoading) {

    var loggedUserId = $stateParams.associateId;
    $scope.isMaster = false;
    $scope.searchData = {};
    $scope.teamAssociateDetails = [];

    $scope.allAssociate = {
        allRewards: [],
    }

    //agile rewards graph data
    $scope.agileRewards = {
        agilePrinciple: []
    }

    //check logged user type [associate/master]
    $scope.loadDashBoardScreen = function () {
        DashboardFactory.checkUserType(loggedUserId).then(
            function (success) {
                $scope.loggedMaster = success.data[0];
                if ($scope.loggedMaster === undefined) {
                    $scope.isMaster = false;
                    $scope.getLoggedInUserDetails();

                } else {
                    $scope.isMaster = true;
                    $scope.getLoggedInMasterDetails();
                }
            },
            function (error) {
                console.log(error);
            }
        );
    };


    //get logged in associate details
    $scope.getLoggedInUserDetails = function () {
        DashboardFactory.getLoggedInUserDetails(loggedUserId).then(
            function (success) {
                $scope.loggedUserDetails = success.data[0];
                //Generate Dashboard graphs
                $scope.getLoggedInUserPointsForGraph();
                //Get History
                $scope.getHistory();
                $scope.getUserDataByTeam($scope.loggedUserDetails.team.id, $scope.loggedUserDetails.team.name);
                $scope.loadScrumGraph(0);
                $scope.getAgilePrinciplesByTeam($scope.loggedUserDetails.team.id)
            },
            function (error) {
                console.log(error);
            }
        );
    };

    //get logged in master details
    $scope.selected = {
        masterScrumTeam:null,
        masterRewardTeam:null
    }
    $scope.getLoggedInMasterDetails = function () {
        DashboardFactory.getLoggedInMasterDetails(loggedUserId).then(
            function (success) {
                var teamDetails = [];
                $scope.teamAssociateDetails = [];
                $scope.allAssociate = {
                    allRewards: [],
                };
                $scope.agileRewards = {
                    agilePrinciple: []
                }
                $scope.loggedMasterDetails = success.data[0];
                success.data[0].teams.forEach(function (element) {
                    $scope.getUserDataByTeam(element.id, element.name);
                    teamDetails.push(element);
                });
                $scope.teamAssociateDetails.teams = teamDetails;
                setTimeout(function(){
                console.log($scope.teamAssociateDetails);
                $scope.selected.masterRewardTeam = $scope.teamAssociateDetails.teams[0];
                $scope.selected.masterScrumTeam = $scope.teamAssociateDetails.teams[0];
                console.log($scope.selected.masterScrumTeam);
                $scope.loadScrumGraph(0);
                $scope.getAgilePrinciplesByTeam(success.data[0].teams[0].id);
                },50)
            },
            function (error) {
                console.log(error);
            }
        );
    };

    //get associates current months stats [scrumpoints, agile rewrads] based on teams
    $scope.getUserDataByTeam = function (teamId, teamName) {
        DashboardFactory.getAssociateDetails(teamId).then(
            function (success) {
                var associate = {
                    teamName: teamName,
                    associate: []
                };
                success.data.forEach(function (element) {
                    var eachAssociate = {
                        points: null,
                        name: null,
                        id: null,
                        rewards: [],
                    };

                    eachAssociate.name = element.name;
                    var memberID = element.id;
                    eachAssociate.id = element.id;

                    //get current month scrum points [TAB 2]
                    DashboardFactory.getScrumPoints(memberID).then(
                        function (success) {
                            var memberPoints = 0;
                            for (var eachPoint = 0; eachPoint < success.data.length; eachPoint++) {
                                var today = success.data[eachPoint].created_at;
                                if (moment().format("MM") === moment(today).format("MM"))
                                    memberPoints += parseInt(success.data[eachPoint].point);
                            }
                            eachAssociate.points = memberPoints;

                        },
                        function (error) {
                            console.log(error);
                        }
                    );

                    //get current month agile rewards [TAB 3]
                    DashboardFactory.getAgileRewards(memberID).then(
                        function (success) {
                            $scope.memberRewards = [];
                            for (var eachReward = 0; eachReward < success.data.length; eachReward++) {
                                var today = success.data[eachReward].created_at;
                                if (moment().format("MM") === moment(today).format("MM"))

                                    var reward = success.data[eachReward].agileprinciple.principleId;
                                if (reward != undefined) {
                                    eachAssociate.rewards.push(reward);
                                }
                                if (reward != null) {
                                    $scope.allAssociate.allRewards.push(reward);
                                }
                            }
                        },
                        function (error) {
                            console.log(error);
                        }
                    )
                    associate.associate.push(eachAssociate);
                });
                $scope.teamAssociateDetails.push(associate);
                var x = $scope.teamAssociateDetails.sort(function (a, b) {
                    var p = a.teamName.toLowerCase();
                    var q = b.teamName.toLowerCase();
                    if (p < q) { return -1; }
                    if (p > q) { return 1; }
                    return 0;
                });
                $scope.teamAssociateDetails = x;
                if ($scope.isMaster) {
                    var x = $scope.teamAssociateDetails.teams.sort(function (a, b) {
                        var p = a.name.toLowerCase();
                        var q = b.name.toLowerCase();
                        if (p < q) { return -1; }
                        if (p > q) { return 1; }
                        return 0;
                    });
                    $scope.teamAssociateDetails.teams = x;
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }

    // Add Users to teams -- Start   

    $scope.selectTeamForAddUsers = function () {
        $scope.data = {};
        var selectTeamForAddUsersPopup = null;
        // Custom popup for team selection
        selectTeamForAddUsersPopup = $ionicPopup.show({
            template: '<div class="list"><div class="item" ng-click="addUsersToTeam(team)" ng-repeat="team in teamAssociateDetails.teams" ">{{team.name}}</div></div>',
            title: "Select Team",
            scope: $scope,
            buttons: [{ text: "Cancel", type: "button-positive" }]
        });
    }

    var addUsersPopup = null;
    $scope.addUsersToTeam = function (team) {
        DashboardFactory.getLoggedUserPeopleDetails($stateParams.accessToken).then(
            function (success) {
                $scope.selectedTeamtoAdd = team;
                $scope.searchPeopleDetails = success.data.value;

                addUsersPopup = $ionicPopup.show({
                    template: '<label class="item-input-wrapper textbox-search"><i class="icon ion-ios7-search placeholder-icon"></i><input type="search" placeholder="Must have at least 3 characters" ng-model="searchData.value" ng-keyup="searchPeople()" style = "background-color: #eeeeee;"></label><div class="list"><div class="item" ng-click="addAssociateToTeam(eachPeople)" ng-repeat="eachPeople in searchPeopleDetails" ">{{eachPeople.displayName}}</div></div>',
                    title: "Search Associate",
                    subtitle: "Assocaite ID",
                    scope: $scope,
                    buttons: [{ text: "Cancel", type: "button-positive" }]
                });
            },
            function (error) {
                ionicToast.show(error, "bottom", false, 3500);
            }
        );
    }

    $scope.searchPeople = function () {
        if ($scope.searchData.value != null) {
            if ($scope.searchData.value.length > 2) {
                DashboardFactory.getSearchPeopleDetails($stateParams.accessToken, $scope.searchData.value).then(
                    function (success) {
                        $scope.searchPeopleDetails = success.data.value;
                    },
                    function (error) {
                        ionicToast.show(error, "bottom", false, 3500);
                    }
                );
            }
        }
    }

    $scope.addAssociateToTeam = function (user) {
        $scope.selectedTeamtoAdd;
        DashboardFactory.checkAssociateinTeam(user.userPrincipalName.split("@")[0]).then(
            function (success) {
                var IsAssociate = success.data.length;

                DashboardFactory.checkMasterinTeam(user.userPrincipalName.split("@")[0]).then(
                    function (success) {
                        var IsMaster = success.data.length;

                        if (IsAssociate === 0 && IsMaster === 0) {
                            var confirmPopUp = null;
                            // Custom popup to add user to team
                            confirmPopUp = $ionicPopup.show({
                                title: "Are you sure want to add " + user.displayName + " to " + $scope.selectedTeamtoAdd.name,
                                scope: $scope,
                                buttons: [
                                    { text: "NO" },
                                    {
                                        text: "<b>YES</b>",
                                        type: "button-positive",
                                        onTap: function (e) {
                                            console.log($scope.selectedTeamtoAdd)
                                            $scope.addAssociateToSelectedTeam(user.displayName, user.userPrincipalName.split("@")[0], $scope.selectedTeamtoAdd);
                                        }
                                    }]
                            });
                        }
                        else {
                            ionicToast.show("Associate exists", 'bottom', false, 3500);
                        }
                    });
            },
            function (error) {
                ionicToast.show(error, "bottom", false, 3500);
            }
        );
    }

    $scope.addAssociateToSelectedTeam = function (displayName, userId, team) {
        DashboardFactory.addAssociateToTeam(displayName, userId, team.id).then(
            function (success) {
                confirmPopUp.close();
                ionicToast.show("Associate has been added to the team " + team.name, 'bottom', false, 3500);
            },
            function (error) {
                ionicToast.show(error, "bottom", false, 3500);
            });
    };
    // Add Users to teams -- End


    //Get Principles and agile rewards graph

    $scope.getAgilePrinciplesByTeam = function (teamId) {
        $scope.Principles = [];

        DashboardFactory.getAgilePriciples()
            .then(function (success) {
                $scope.agilerewards = success.data;
                var principleData = [];
                DashboardFactory.getAssociateDetails(teamId).then(
                    function (success) {
                        success.data.forEach(function (element) {
                            $scope.memberID = element.id;
                            var current_month = (moment().format('YYYY-MM'))
                            DashboardFactory.getAssociateNameRewards($scope.memberID, current_month).then(
                                function (success) {
                                    var data = {
                                        associateName: null,
                                        associateReward: [],
                                    }
                                    success.data.forEach(function (element) {
                                        var name = element.toAssociate.name
                                        data.associateName = name;
                                        var reward = element.agileprinciple.agile_rewards
                                        data.associateReward.push(reward);
                                    });
                                    if (data.associateName != null) {
                                        principleData.push(data);
                                    }
                                });
                        });
                    });


                setTimeout(function () {
                    $scope.rewardMembers = []
                    $scope.Principles = [];
                    $scope.agilerewards.forEach(function (element) {
                        var eachDataset =
                        {
                            label: null,
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: '1',
                        }

                        eachDataset.label = element.agile_rewards;
                        principleData.forEach(function (element1, pos) {
                            element1.associateReward.forEach(function (element2) {
                                if (element.agile_rewards === element2) {
                                    for (var i = 0; i < principleData.length; i++) {
                                        if (i === pos) {
                                            eachDataset.data.push(1)
                                        } else {
                                            eachDataset.data.push(0)
                                        }
                                    }
                                }
                            })
                        });
                        $scope.Principles.push(eachDataset)
                    });
                    principleData.forEach(function (element1, pos) {
                         var x = element1.associateName;
                         var y = x.substr(x.indexOf(",") + 1);
                         var z = y.substr(0,y.indexOf(' '));
                         if (z!= ""){
                         $scope.rewardMembers.push(z);
                         }
                         else $scope.rewardMembers.push(y);
                    });
                    $scope.agileRewards.agilePrinciple = $scope.Principles;
                    $scope.loadRewardsGraph();
                }, 570);

            });
    };

    $scope.masterSelectRewardGraph = function (team) {
        // $scope.masterSelectedTeam = team
        if(team == null)
            $scope.getAgilePrinciplesByTeam(0);
        else
            $scope.getAgilePrinciplesByTeam(team.id);
    }

    $scope.masterSelectScrumGraph = function (team) {
        // $scope.masterSelectedScrumTeam = team
        if(team == null)
            $scope.loadScrumGraph(0);
        else
            $scope.loadScrumGraph($scope.teamAssociateDetails.teams.indexOf(team));
    }

    //admin pin generation module
    var myPopup = null;
    $scope.selectTeam = function () {
        $scope.data = {};
        $scope.getLoggedInMasterDetails();
        // Custom popup for team selection
        myPopup = $ionicPopup.show({
            template: '<div class="list"><div class="item"  ng-click="verifyPinGeneration(team)" ng-repeat="team in teamAssociateDetails.teams" "><span class="generatePinButton" ng-show="team.pin != -1">-</span><span class="generatePinButton" ng-show="team.pin == -1">+</span>{{team.name}} <span class="item-note" ng-show="team.pin != -1">{{team.pin}}</span> </div></div>',
            title: "Generate Pin",
            scope: $scope,

            buttons: [{ text: "Cancel", type: "button-positive" }]
        });
    }

    //pin generation confirmation 
    $scope.verifyPinGeneration = function (team) {
        $ionicPopup.show({
            title: "ARE YOU SURE",
            scope: $scope,
            buttons: [
                { text: "NO" },
                {
                    text: "<b>YES</b>",
                    type: "button-positive",
                    onTap: function (e) {
                        $scope.generateNumber(team)
                    }
                }]
        });
    };

    //pin generation method
    $scope.generateNumber = function (team) {
        if (team.pin != -1) {
            $scope.updatePin("-1", team);
            $scope.loadDashBoardScreen();
            $scope.randomNumber = null;
        } else {
            $scope.randomNumber = Math.floor(
                Math.random() * (99999 - 10000 + 1) + 10000
            );
            $scope.showPinPopup();
            $scope.updatePin($scope.randomNumber, team);
        }
    };

    //update pin in database
    $scope.updatePin = function (randomNumber, team) {
        DashboardFactory.updatePin(randomNumber, team).then(
            function (success) {
            },
            function (error) {
                ionicToast.show(error, "bottom", false, 3500);
            }
        );
    };

    //view pin on random pop up
    $scope.showPinPopup = function () {
        // An elaborate, custom popup
        $ionicPopup.show({
            template: '<p class="pin">{{randomNumber}}</p>',
            title: "Scrum PIN",
            scope: $scope,
            buttons: [{
                template: "",
                text: "<b>OK </b>",
                type: "button-positive",
                onTap: function () {
                    myPopup.close();
                }
            }]
        });
    };

    $scope.enterPinPopup = function () {
        $scope.enteredPin = {};
        $scope.getLoggedInUserDetails();


        //Custom popup to enter pin
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="enteredPin.pin">',
            title: "Enter PIN",
            scope: $scope,
            buttons: [
                { text: "Cancel" },
                {
                    text: "<b>Save</b>",
                    type: "button-positive",
                    onTap: function (e) {
                        if (($scope.loggedUserDetails.team.pin) === "-1") {
                            ionicToast.show("Invalid PIN", 'bottom', false, 3500);
                        }
                        else if (($scope.loggedUserDetails.team.pin) === ($scope.enteredPin.pin)) {
                            var currentTime = moment().local();
                            var minutesDiff = currentTime.diff(moment.utc($scope.loggedUserDetails.team.updated_at), 'minutes')
                            var scrumPoints = 0;
                            var id = $scope.loggedUserDetails.id;
                            console.log(minutesDiff);
                            if (minutesDiff <= 5) {
                                scrumPoints = 2;
                            }
                            else if (minutesDiff <= 10) {
                                scrumPoints = 1;
                            }
                            else {
                                ionicToast.show("PIN Expired", 'bottom', false, 3500);
                                return;
                            }

                            var today = moment().format('YYYY-MM-DD')

                            //check for todays updation on scrumpoints
                            DashboardFactory.checkForPoints(id, today).then(
                                function (success) {
                                    if (success.data.length === 0) {
                                        //update scrum points
                                        DashboardFactory.updatePoints(scrumPoints, id).then(
                                            function (success) {
                                                ionicToast.show("Thank You for attending Scrum", 'bottom', false, 3500);
                                                $scope.refresh();
                                            },
                                            function (error) {
                                                ionicToast.show(error, "bottom", false, 3500);
                                            }
                                        );
                                    }
                                    else {
                                        ionicToast.show("You have already submitted for today. Thank You", 'bottom', false, 3500);
                                    }
                                },
                                function (error) {
                                    ionicToast.show(error, "bottom", false, 3500);
                                }
                            );
                        }
                        else {
                            ionicToast.show("Invalid PIN", 'bottom', false, 3500);
                        }
                    }
                }
            ]
        });
        myPopup.then(function (res) {

        });
    };


    // Tab 1 : Dashboard

    $scope.loadScrumGraph = function (index) {
        setTimeout(function () {
            $scope.teamGraphAssociateName = [];
            $scope.teamGraphAssociatePoints = [];
            $scope.backgroundColors = [];
            $scope.teamAssociateDetails[index].associate.forEach(element => {
                $scope.teamGraphAssociateName.push(element.name);
                $scope.teamGraphAssociatePoints.push(element.points);
                $scope.backgroundColors.push($scope.getRandomColor());
            });
            var ctx = document.getElementById("teamChart");

            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: $scope.teamGraphAssociateName,
                    datasets: [{
                        data: $scope.teamGraphAssociatePoints,
                        backgroundColor: $scope.backgroundColors,
                        borderWidth: 1.5
                    }]
                },
                options: {
                     legend: {
                        labels: {
                            fontSize: 10
                        }
                    }
                }
            });

            if (!$scope.isMaster) {
                var ctx1 = document.getElementById("myChart1");
                new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        datasets: [{
                            data: $scope.userGraphData.data,
                            backgroundColor: $scope.userGraphData.colors,
                        }],

                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: $scope.userGraphData.labels

                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,

                                }
                            }]
                        },
                        legend: {
                            display: false
                        }
                    }
                });
            }
        }, 500);
    }

    $scope.loadRewardsGraph = function () {
        setTimeout(function () {
            var ctx2 = document.getElementById("myChart2");
  
            var rewardData = {
                labels: $scope.rewardMembers,
                datasets: $scope.Principles,

            };
            new Chart(ctx2, {
                type: 'bar',
                data: rewardData,
                options: {
                    scales: {

                        xAxes: [{
                            ticks: {
                                fontSize: 15
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                fontSize: 0
                            }
                        }]
                    },
                }
            });
            DashboardFactory.isRefreshing = false;
        }, 570);
    }

    $scope.getScrumPointsForMonth = function (month) {
        DashboardFactory.getScrumPointsByMonth($scope.loggedUserDetails.id, month).then(
            function (success) {
                var memberPoints = 0;
                success.data.forEach(function (element) {
                    memberPoints += parseInt(element.point)
                });
                $scope.userGraphData.labels.push(moment(month).format('MMMM'));
                $scope.userGraphData.data.push(memberPoints);
                $scope.userGraphData.colors.push($scope.getRandomColor());
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.getLoggedInUserPointsForGraph = function () {
        $scope.userGraphData = {
            labels: [],
            data: [],
            colors: []
        }
        $scope.historyFilter = [];
        var thisMonth = moment().format('YYYY-MM');
        //$scope.choice = this.Month;
        $scope.getScrumPointsForMonth(thisMonth);
        $scope.historyFilter.push(thisMonth);
        var previousMonth = moment().subtract(1, 'months').format('YYYY-MM');
        $scope.getScrumPointsForMonth(previousMonth);
        $scope.historyFilter.push(previousMonth);
        var previous2Month = moment().subtract(2, 'months').format('YYYY-MM');
        $scope.getScrumPointsForMonth(previous2Month);
        $scope.historyFilter.push(previous2Month);
    };

    //Check for availability of rewards
    $scope.checkAvailability = function (reward) {
        var val = false
        $scope.allAssociate.allRewards.forEach(function (element) {
            if (element === reward.principleId) {
                val = true;
            }
        });
        if (!val)
            return false;
        else
            return true;
    };

    //Select rewards from ionic pop up
    var agileRewardsPopUp = null;
    $scope.selectRewards = function (toUser) {
        // document.getElementsByClassName("rewardsList")[0].parentElement.parentElement.style.width = "300px"
        $scope.toAssociate = toUser
        $scope.data = {};
        
        agileRewardsPopUp = $ionicPopup.show({
            template: '<div class="list"> <div class="item" ng-repeat="rewards in agilerewards"  > <div ng-click="assignRewards(rewards.id,loggedUserDetails.id,toAssociate.id)" ng-class="{disabled: checkAvailability(rewards)}">{{rewards.principleId}}<span class="item-note rewardsPopUp">{{rewards.agile_rewards}}</span></div></div></div>',
            title: "Select Agile Rewards",
            scope: $scope,

            buttons: [{ text: "Cancel", type: "button-positive" }]
        });
    };

    //Assign Rewards for team associates
    $scope.assignRewards = function (agileprinciple, fromAssociate, toAssociate) {
        DashboardFactory.assignRewards(agileprinciple, fromAssociate, toAssociate).then(
            function (success) {
                agileRewardsPopUp.close();
                $scope.refresh();
                ionicToast.show("Success", 'bottom', false, 3500);
            },
            function (error) {
                ionicToast.show(error, "bottom", false, 3500);
            }
        );
    };



    // Tab 4: History
    $scope.showHistoryFilterIcon = false;
    $scope.getHistory = function () {
        DashboardFactory.getScrumPointsByMonth($scope.loggedUserDetails.id, moment().format('YYYY-MM')).then(
            function (success) {
                $scope.loggedInUserHistory = success.data;
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.showHistoryFilter = function () {
        $scope.showHistoryFilterIcon = true;
    }

    $scope.hideHistoryFilter = function () {
        $scope.showHistoryFilterIcon = false;
    }

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
    }).then(function (popover) {
        $scope.popover = popover;
    });

    $scope.closePopover = function () {
        $scope.popover.hide();
    };

    $scope.filterHistory = function (item) {
        DashboardFactory.getLoggedInUserDetails(loggedUserId).then(
            function (success) {
                DashboardFactory.getScrumPointsByMonth(success.data[0].id, item).then(
                    function (success) {
                        $scope.loggedInUserHistory = success.data;
                        $scope.closePopover();
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            },
            function (error) {
                console.log(error);
            }
        )
    }
    function ContentController($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };
    }

    //Random color generator for graphs
    $scope.getRandomColor = function () {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    //rewards view on badge click
    $scope.viewRewards = function (id) {
        for (var i = 0; i < $scope.agilerewards.length; i++) {
            if (id === $scope.agilerewards[i].principleId)
                ionicToast.show($scope.agilerewards[i].agile_rewards, "bottom", false, 3500);
        }
    };

    //refresh Screens
    $scope.refresh = function () {
        $scope.teamAssociateDetails = [];
        if (!DashboardFactory.isRefreshing)
            $scope.loadDashBoardScreen();
        DashboardFactory.isRefreshing = true;
    }

    $scope.show = function () {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>'
        });
    };

    $scope.hide = function () {
        $ionicLoading.hide();
    };

    //Initial service.
    $scope.loadDashBoardScreen();
});