const constants = require('../services/constants');

module.exports = function(app){

    var Person = app.models.person;

    var controller = {};

    controller.getAllReports = function(req, res){
        var resource;

        Person.find({infected: false}).lean().exec(function(err, survivors){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            var survivorsCount = survivors.length;
            var totalInfected = 0;
            var totalNonInfected = 0;
            var resourcesPointsLost = 0;

            var resourceCount = {};
            for (resource in constants.resourcePoints){
                if (constants.resourcePoints.hasOwnProperty(resource)){
                    resourceCount[resource] = 0;
                }
            }

            survivors.forEach(function(survivor){
                if (survivor.infected){
                    totalInfected++;
                }
                else{
                    totalNonInfected++;
                }

                for (resource in resourceCount){
                    if (resourceCount.hasOwnProperty(resource) && survivor.inventory[resource]){
                        resourceCount[resource] += survivor.inventory[resource];

                        if (survivor.infected && survivor.inventory[resource]){
                            resourcesPointsLost += survivor.inventory[resource] *
                                constants.resourcePoints[resource];
                        }
                    }


                }
            });

            var infected = (totalInfected * 100) / survivorsCount;
            var nonInfected = (totalNonInfected * 100) / survivorsCount;

            res.send({survivorsCount, resourceCount, resourcesPointsLost, infected, nonInfected})
        });

        Person.count({}, function countingAllPeople(err, totalPeople){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            Person.count({infected: true}, function countingInfectedPeople(err, infectedPeople){
                if (err){
                    res.status(503);
                    return res.send("databaseConnection");
                }

                var infected = (infectedPeople * 100) / totalPeople;
                var nonInfected = ((totalPeople - infectedPeople) * 100) / totalPeople;

                res.send({infected, nonInfected})
            })
        });
    };

    controller.getInfectedReport = function(req, res){
        Person.count({}, function countingAllPeople(err, totalPeople){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            Person.count({infected: true}, function countingInfectedPeople(err, infectedPeople){
                if (err){
                    res.status(503);
                    return res.send("databaseConnection");
                }

                var percentage = (infectedPeople * 100) / totalPeople;

                res.send({infected: percentage})
            })
        });
    };

    controller.getNonInfectedReport = function(req, res){
        Person.count({}, function countingAllPeople(err, totalPeople){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            Person.count({infected: false}, function countingNonInfectedPeople(err, nonInfectedPeople){
                if (err){
                    res.status(503);
                    return res.send("databaseConnection");
                }

                var percentage = (nonInfectedPeople * 100) / totalPeople;

                res.send({nonInfected: percentage})
            })
        });
    };

    controller.getResourcesReport = function(req, res){
        var resource;

        Person.find({infected: false}).lean().exec(function(err, survivors){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            var resourceCount = {};
            for (resource in constants.resourcePoints){
                if (constants.resourcePoints.hasOwnProperty(resource)){
                    resourceCount[resource] = 0;
                }
            }

            survivors.forEach(function(survivor){
                for (resource in resourceCount){
                    if (resourceCount.hasOwnProperty(resource) && survivor.inventory[resource]){
                        resourceCount[resource] += survivor.inventory[resource];
                    }
                }
            });

            res.send({survivorsCount: survivors.length, resourceCount})
        });
    };

    controller.getLostResourcesReport = function(req, res){
        var resource;

        Person.find({infected: true}).lean().exec(function(err, infected){
            if (err){
                res.status(503);
                return res.send("databaseConnection");
            }

            var resourcesPointsLost = 0;

            infected.forEach(function(infectedPerson){
                for (resource in constants.resourcePoints){
                    if (constants.resourcePoints.hasOwnProperty(resource) && infectedPerson.inventory[resource]){
                        resourcesPointsLost += infectedPerson.inventory[resource] *
                                                constants.resourcePoints[resource];
                    }
                }
            });

            res.send({resourcesPointsLost})
        });
    };

    return controller;
};