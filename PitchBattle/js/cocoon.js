function validateConfig(config) {
    for (var sect in {iaps: 0, achvs: 0, ldbds: 0}) {
        for (var plat in config[sect]) {
            for (var plat_ in config[sect]) {
                if (plat == plat_) {
                    continue;
                }
                for (var iap in config[sect][plat]) {
                    if (!inArray(iap, Object.keys(config[sect][plat_]))) {
                        console.error('"' + iap + '" on "' + plat + '" but not on "' + plat_ + '"');
                    }
                }
            }
        }
    }
}

var loadCocoonApi = function (config, dbgConfig, dims, cocoon) {
    var delayed = function (f, thisArg) {
        if (typeof(dbgConfig.svcLatency) == 'undefined') {
            f.apply(thisArg);
        } else {
            setTimeout(function () {
                f.apply(thisArg);
            }, dbgConfig.svcLatency);
        }
    };

    var fadeG;

    var refreshFade = function (g) {
        fadeG.clear();
        fadeG.beginFill(0);
        fadeG.drawRect(0, 0, dims.game.outer.width, dims.game.outer.height);
        fadeG.endFill();
        fadeG.visible = false;
    }

    var initAds = function (game) {
        fadeG = game.add.graphics(0, 0);
        refreshFade(fadeG, dims);
    };
    var refreshAds = function () {
        refreshFade(fadeG, dims);
    };

    // Platform can be `null` (web), 'android', 'ios'
    var platform = null;
    if (typeof(cocoon) !== 'undefined') {
        platform = cocoon.getPlatform();
    }

    var dvcPluginEnabled = typeof(device) !== 'undefined';
    if (platform && dvcPluginEnabled) {
        console.log("Device UUID: "+device.uuid);
    }

    var screenHeightDp = DIMS.screen.height/window.devicePixelRatio;
    var adHeight = 90;
    if (screenHeightDp <= 400) {
        adHeight = 32;
    } else if (screenHeightDp <= 720) {
        adHeight = 50;
    }
    adHeight *= window.devicePixelRatio;

    var updateAds = function () {};

    var achvs = inArray('ios', [platform, dbgConfig.fakePlatform]) ? config.achvs.ios : config.achvs.andr;
    var ldbds = inArray('ios', [platform, dbgConfig.fakePlatform]) ? config.ldbds.ios : config.ldbds.andr;

    // The following pseudocode highlights the relative priorities of the
    // different criteria for enabling ads:
    //
    //     if debugging:
    //         if platform:
    //             fake ads
    //         else:
    //             if fakePlatform:
    //                 fake ads
    //             else:
    //                 no ads
    //     else:
    //         if platform:
    //             if dvcPluginEnabled:
    //                 if testDevice:
    //                     fake ads
    //                 else:
    //                     real ads
    //             else:
    //                 no ads
    //         else:
    //             no ads
    //
    // Which simplifies to the following:
    //
    //     if !debugging && platform && dvcPluginEnabled && !testDevice:
    //         real ads
    //     if (debugging && (platform || fakePlatform)) || (!debugging && platform && dvcPluginEnabled && testDevice):
    //         fake ads
    //     if (debugging && !platform && !fakePlatform) || (!debugging && ((platform && !dvcPluginEnabled) || !platform)):
    //         no ads
    var banner = {
        on: function () {},
        load: function () {},
        hide: function () {},
        show: function () {},
    };
    var interst = {
        on: function () {},
        load: function () {},
        isReady: function () { return false; },
        show: function () {},
    };
    if (!DEBUGGING && platform && dvcPluginEnabled && !config.testDeviceIds[device.uuid]) {
        Cocoon.Ad.configure(config.adIds);

        banner = cocoon.Ad.createBanner();
        interst = cocoon.Ad.createInterstitial();
    } else if ((DEBUGGING && (platform || dbgConfig.fakePlatform)) || (!DEBUGGING && platform && dvcPluginEnabled && testDevice)) {
        var bannerG, bannerVis, interstGrp, interstG;

        var refreshBanner = function (g) {
            g.clear();
            g.beginFill(0xffffff);
            var h = adHeight/dims.ratio;
            g.drawRect(0, dims.game.outer.height-h, dims.game.outer.width, h);
            g.endFill();
        };

        var interstExit;
        var interstText;

        var refreshInterst = function (g) {
            g.clear();
            g.beginFill(0xffffff);
            g.drawRect(0, 0, dims.game.outer.width, dims.game.outer.height);
            g.endFill();

            interstExit.x = dims.game.outer.width-50;
            interstExit.y = 50;

            interstText.x = dims.game.outer.width/2;
            interstText.y = dims.game.outer.height/2;
        };

        var bannerVis = false;
        var interstEvts = {};
        var initAds_ = initAds;
        initAds = function (game) {
            bannerG = game.add.graphics(0, 0);
            bannerG.visible = bannerVis;
            refreshBanner(bannerG);

            interstGrp = game.add.group();
            interstGrp.visible = false;

            interstG = game.add.graphics(0, 0);
            interstGrp.add(interstG);

            interstExit = game.add.text(dims.game.outer.width-50, 50, 'X', {
                font: '50px Arial',
                fill: '#000000',
            }, interstGrp);
            interstExit.anchor.setTo(1, 0);
            interstExit.inputEnabled = true;
            interstExit.events.onInputDown.add(function () {
                interstGrp.visible = false;
                if (interstEvts.dismiss) {
                    interstEvts.dismiss();
                }
            });

            interstText = game.add.text(dims.game.outer.width/2, dims.game.outer.height/2, 'INTERSTITIAL', {
                font: '50px Arial',
                fill: '#000000',
            }, interstGrp);
            interstText.anchor.setTo(0.5);
            refreshInterst(interstG);

            // At the end so that fade created in `initAds_` is on top of all
            // other elements.
            initAds_(game);
        };

        var refreshAds_ = refreshAds;
        refreshAds = function () {
            refreshAds_();
            refreshBanner(bannerG);
            refreshInterst(interstG);
        };

        var bannerEvts = {};
        banner = {
            on: function (e, f) {
                bannerEvts[e] = f;
            },
            load: function () {
                if (bannerEvts.load) {
                    bannerEvts.load();
                }
            },
            hide: function () {
                this.change(false);
                if (bannerEvts.dismiss) {
                    bannerEvts.dismiss();
                }
            },
            show: function () {
                this.change(true);
                if (bannerEvts.show) {
                    bannerEvts.show();
                }
            },
            change: function (visible) {
                bannerVis = visible;
                if (bannerG) {
                    bannerG.visible = bannerVis;
                }
                if (typeof(onResize) !== 'undefined') {
                    onResize();
                }
            },
        };

        var interstDelay = -1;
        updateAds = function () {
            if (interstDelay > 0) {
                interstDelay--;
                if (interstDelay == 0 && interstEvts.load) {
                    interstEvts.load();
                }
            }
        };
        interst = {
            on: function (e, f) {
                interstEvts[e] = f;
            },
            load: function () {
                interstDelay = 300;
                if (DEBUGGING) {
                    console.log("interstitial loading...");
                }
            },
            isReady: function () {
                return interstDelay == 0;
            },
            show: function () {
                if (interstDelay == 0) {
                    interstGrp.visible = true;
                    interstDelay = -1;
                    if (interstEvts.show) {
                        interstEvts.show();
                    }
                } else if (interstEvts.fail) {
                    interstEvts.fail({code: 0, message: "not ready"});
                }
            },
        };
    }

    banner.on("fail", function(e){
        if (DEBUGGING) {
            console.error("banner failure: " + JSON.stringify(e.message));
        }
    });
    ["load", "show", "dismiss", "click"].forEach(function (e) {
        banner.on(e, function(){
            if (e == "load") {
                banner.show();
            }
            if (e == "show") {
                dims.updateScreenAdHeight(adHeight);
            }
            if (e == "dismiss") {
                dims.updateScreenAdHeight(0);
            }
            if (DEBUGGING) {
                console.log("banner: "+e);
            }
        });
    });
    ["load", "show", "dismiss", "click"].forEach(function (e) {
        interst.on(e, function(){
            if (DEBUGGING) {
                console.log("interstitial: "+e);
            }
        });
    });
    interst.on("fail", function(e){
        if (DEBUGGING) {
            console.error("interstitial failure: "+JSON.stringify(e.message));
        }
    });

    // The following pseudocode highlights the relative priorities of the
    // different criteria for enabling IAPs:
    //
    //     if debugging:
    //         if platform:
    //             if mockSvcs:
    //                 mock game
    //             else:
    //                 real game
    //         else:
    //             if fakePlatform:
    //                 if mockSvcs:
    //                     mock game
    //                 else:
    //                     disabled game
    //             else:
    //                 disabled game
    //     else:
    //         if platform:
    //             real game
    //         else:
    //             disabled game
    //
    // Which simplifies to the following:
    //
    //     if debugging && ((platform && mockSvcs) || (!platform && fakePlatform && mockSvcs)):
    //         mock game
    //     else if platform && ((debugging && !mockSvcs) || !debugging):
    //         real game
    //     else:
    //         disabled game
    var ldbds = inArray('ios', [platform, dbgConfig.fakePlatform]) ? config.ldbds.ios : config.ldbds.andr;
    var achvs = inArray('ios', [platform, dbgConfig.fakePlatform]) ? config.achvs.ios : config.achvs.andr;
    var gameSvc = {};
    // TODO Disabled game
    var gameSvcsEnabled = function () { return false; };

    if (DEBUGGING && ((platform && dbgConfig.mockGameSvcs) || (!platform && dbgConfig.fakePlatform && dbgConfig.mockGameSvcs))) {
        var loggedIn = inArray('ios', [platform, dbgConfig.fakePlatform]) && dbgConfig.iosGameLoggedIn;
        var fakeAchvs = {};
        for (var achv in achvs) {
            fakeAchvs[achvs[achv]] = false
        }
        var fakeLdbds = {};
        for (var ldbd in ldbds) {
            fakeLdbds[ldbds[ldbd]] = {};
        }
        gameSvc = {
            isLoggedIn: function () {
                return loggedIn ? null : false;
            },
            login: function (cb) {
                delayed(function () {
                    if (!cb) {
                        cb = function () {};
                    }

                    if (dbgConfig.failLogin) {
                        cb(false, {code: 0, message: "couldn't log in"});
                    } else if (dbgConfig.cancelLogin) {
                        cb(false);
                    } else {
                        loggedIn = true;
                        cb(true);
                    }
                }, this);
            },
            logout: function (cb) {
                delayed(function () {
                    loggedIn = false;
                    if (cb) {
                        cb();
                    }
                }, this);
            },
            submitScore: function (score, cb, params) {
                delayed(function () {
                    if (!params || typeof(params.leaderboardID) === 'undefined') {
                        if (cb) {
                            cb({code: 0, message: "no leaderboardID provided"});
                        }
                        return;
                    }
                    var ldbdId = params.leaderboardID;
                    if (typeof(fakeLdbds[ldbdId]) === 'undefined') {
                        if (cb) {
                            cb({code: 0, message: "'"+ldbdId+"' is not a valid leaderboardID"});
                        }
                        return;
                    }
                    if (!loggedIn) {
                        if (cb) {
                            // TODO Check structure.
                            cb({code: 0, message: "not logged in"});
                        }
                        return;
                    }
                    if (dbgConfig.submitScoreError) {
                        if (cb) {
                            cb({code: 0, message: "couldn't submit score"});
                        }
                        return;
                    }
                    fakeLdbds[ldbdId]["john"] = score;
                    if (cb) {
                        cb();
                    }
                }, this);
            },
            showLeaderboard: function (cb) {
                delayed(function () {
                    if (!loggedIn) {
                        if (cb) {
                            // TODO Check structure.
                            cb({code: 0, message: "not logged in"});
                        }
                        return;
                    }
                    if (dbgConfig.showLdbdsError) {
                        if (cb) {
                            cb({code: 0, message: "couldn't show leaderboard"});
                        }
                        return;
                    }
                    if (DEBUGGING) {
                        console.log(JSON.stringify(fakeLdbds));
                    }
                }, this);
            },
            submitAchievement: function (achvId, cb) {
                delayed(function () {
                    if (typeof(fakeAchvs[achvId]) === 'undefined') {
                        if (cb) {
                            cb({code: 0, message: "'"+achvId+"' is not a valid achievement"});
                        }
                        return;
                    }
                    if (!loggedIn) {
                        if (cb) {
                            // TODO Check structure.
                            cb({code: 0, message: "not logged in"});
                        }
                        return;
                    }
                    if (dbgConfig.submitAchvError) {
                        if (cb) {
                            cb({code: 0, message: "couldn't submit achievement"});
                        }
                        return;
                    }
                    fakeAchvs[achvId] = true;
                    if (cb) {
                        cb();
                    }
                }, this);
            },
            showAchievements: function (cb) {
                delayed(function () {
                    if (!loggedIn) {
                        if (cb) {
                            // TODO Check structure.
                            cb({code: 0, message: "not logged in"});
                        }
                        return;
                    }
                    if (dbgConfig.showAchvsError) {
                        if (cb) {
                            cb({code: 0, message: "couldn't show achievements"});
                        }
                        return;
                    }
                    if (DEBUGGING) {
                        console.log(JSON.stringify(fakeAchvs));
                    }
                }, this);
            },
            resetAchievements: function (cb) {
                delayed(function () {
                    if (!loggedIn) {
                        if (cb) {
                            // TODO Check structure.
                            cb({code: 0, message: "not logged in"});
                        }
                        return;
                    }
                    if (dbgConfig.resetAchvsError) {
                        if (cb) {
                            cb({code: 0, message: "couldn't reset achievements"});
                        }
                        return;
                    }
                    for (var achvId in fakeAchvs) {
                        fakeAchvs[achvId] = false;
                    }
                    if (cb) {
                        cb();
                    }
                }, this);
            },
        };
        gameSvcsEnabled = function () { return true; };
    } else if (platform && ((DEBUGGING && !dbgConfig.mockGameSvcs) || !DEBUGGING)) {
        if (platform === 'android') {
            cocoon.Social.GooglePlayGames.init(
                {
                    defaultLeaderboard: ldbds.default,
                },
                function() {
                    console.log('GooglePlayGames initialised');
                }
            );
            gameSvc = cocoon.Social.GooglePlayGames.getSocialInterface();
            gameSvcsEnabled = function () { return true; };
        } else if (platform === 'ios') {
            gameSvc = cocoon.Social.GameCenter.getSocialInterface();
            gameSvcsEnabled = function () { return true; };
        } // else game disabled
    }

    var isLoggedIn_ = gameSvc.isLoggedIn;
    gameSvc.isLoggedIn = function () { return isLoggedIn_.apply(gameSvc) !== false; };

    // The following pseudocode highlights the relative priorities of the
    // different criteria for enabling IAPs:
    //
    //     if debugging:
    //         if platform:
    //             if mockSvcs:
    //                 mock svcs
    //             else:
    //                 real iaps
    //         else:
    //             if fakePlatform:
    //                 mock svcs
    //             else:
    //                 disabled iaps
    //     else:
    //         if platform:
    //             if canPurchase:
    //                 real iaps
    //             else:
    //                 disabled iaps
    //         else:
    //             disabled iaps
    //
    // When using mock services:
    //
    //     if fakeCantPurch:
    //         disabled iaps
    //     else:
    //         mock iaps
    //
    // Which simplifies to the following:
    //
    //     if debugging && ((platform && mockSvcs) || (!platform && fakePlatform)):
    //         mock iaps
    //     else if platform && ((debugging && !mockSvcs) || (!debugging && canPurchase)):
    //         real iaps
    //     else:
    //         disabled iaps
    var iaps = inArray('ios', [platform, dbgConfig.fakePlatform]) ? config.iaps.ios : config.iaps.andr;
    var cbs = {};
    var iapSvc = {
        initialize: function (opts, cb) {},
        on: function (evt, cbs_) {
            cbs = cbs_;
        },
        fetchProducts: function (prodIds, cb) {
            cb([], "can't make purchases on this device");
        },
        canPurchase: function () {
            return false;
        },
        purchase: function (prodId, num, cb) {
            if (cbs.error) {
                // TODO Get structure.
                cbs.error(prodId, {code: 102, error: "can't make purchases on this device"});
            }
            cb("can't make purchases on this device");
        },
        isPurchased: function (prodId) {
            return false;
        },
        restorePurchases: function (cb) {
            cb("can't restore purchases on this device");
        },
    };
    if (DEBUGGING && ((platform && dbgConfig.mockIapSvcs) || (!platform && dbgConfig.fakePlatform))) {
        if (!dbgConfig.fakeCantPurch) {
            var autofinish = false;
            var cbs = {};
            var purchd = {};
            if (dbgConfig.fakePurchPerst) {
                purchd = load('FAKE_PURCH_PERST') || {};
            } else {
                localStorage.removeItem('FAKE_PURCH_PERST');
            }
            var randInt = function (n) {
                return Math.floor(Math.random()*n);
            };
            var finish = function (prodId, num) {
                purchd[prodId] = num;
                if (dbgConfig.fakePurchPerst) {
                    save('FAKE_PURCH_PERST', purchd);
                }
                if (cbs.complete) {
                    var result = {
                        productId: prodId,
                        purchaseDate: 1459859261561,
                    };
                    if (inArray('ios', [platform, dbgConfig.fakePlatform])) {
                        result['quantity'] = num;
                        result['transactionId'] = "1000000204377850";
                    } else {
                        result['quantity'] = 1; // Only tested with non-consumable.
                        result['transactionId'] = "GPA.1313-9459-0606-56090";
                    }
                    cbs.complete(result);
                }
            };
            iapSvc = {
                initialize: function (opts, cb) {
                    delayed(function () {
                        autofinish = !!opts.autofinish;
                        cb();
                    }, this);
                },
                on: function (evt, cbs_) {
                    cbs = cbs_;
                },
                fetchProducts: function (prodIds, cb) {
                    delayed(function () {
                        var prods = [];
                        var err = undefined;
                        for (var i = 0; i < prodIds.length; i++) {
                            var exists = false;
                            for (var iap in iaps) {
                                exists = exists || prodIds[i] === iaps[iap];
                            }
                            if (!exists) {
                                if (err) {
                                    err.message += prodIds[i] + ',';
                                } else {
                                    err = {code: 0, message: "Invalid products: "+prodIds[i]+","};
                                }
                            }
                            prods.push("€$£"[randInt(3)]+randInt(99)+'.'+randInt(10)+''+randInt(10));
                        }
                        cb(prods, err);
                    }, this);
                },
                canPurchase: function () {
                    return true;
                },
                purchase: function (prodId, num, cb) {
                    delayed(function () {
                        if (cbs.start) {
                            cbs.start(prodId);
                        }
                        if (dbgConfig.fakeCantPurch) {
                            if (cbs.error) {
                                // TODO Get structure.
                                cbs.error(prodId, {code: 101, error: 'FAKE_PURCH_ERR'});
                            }
                            cb("FAKE_PURCH_ERR");
                            return;
                        }
                        if (autofinish) {
                            finish(prodId, num);
                            if (cb) {
                                cb();
                            }
                        }
                    }, this);
                },
                isPurchased: function (prodId) {
                    return !!purchd[prodId];
                },
                restorePurchases: function (cb) {
                    delayed(function () {
                        for (var iap in iaps) {
                            finish(iaps[iap], purchd[iaps[iap]] ? purchd[iaps[iap]] : 1);
                        }
                        if (cb) {
                            cb();
                        }
                    }, this);
                },
            };
        }
    } else if (
            platform &&
            typeof(Cocoon.InApp) !== 'undefined' &&
            ((DEBUGGING && !dbgConfig.mockIapSvcs) || (!DEBUGGING && Cocoon.InApp.canPurchase()))
    ) {
        iapSvc = Cocoon.InApp;
    }
    var onPurchase = [];
    iapSvc.on("purchase", {
        start: function (prodId) {
            if (DEBUGGING) {
                console.log("purchase started for '"+prodId+"'");
            }
        },
        error: function (prodId, err) {
            if (DEBUGGING) {
                console.error("purchase failed for '"+prodId+"': "+JSON.stringify(err));
            }
        },
        complete: function (purch) {
            if (DEBUGGING) {
                console.log("purchase completed: "+JSON.stringify(purch));
            }
            if (purch.productId == iaps.rmAds) {
                removeAds();
            }
            if (onPurchase[purch.productId]) {
                onPurchase[purch.productId](qty);
            }
        },
    });
    iapSvc.initialize({
        autofinish: true,
    }, function (err) {
        if (err) {
            if (DEBUGGING) {
                console.error("couldn't initialise IAPs: "+JSON.stringify(err));
            }
            return;
        }
    });

    var adsEnabled = !iapSvc.isPurchased(iaps.rmAds);
    var whyAds = function () {
        console.log(
                'ads <' + (adsEnabled ? 'enabled' : 'disabled') +
                '> because `iapSvc.isPurchased(iaps.rmAds) = ' +
                iapSvc.isPurchased(iaps.rmAds) + '`'
        );
    };

    var removeAds = function () {
        adsEnabled = false;
        banner.hide();
        banner = {
            on: function () {},
            load: function () {},
            hide: function () {},
            show: function () {},
        };
        interst = {
            on: function () {},
            load: function () {},
            isReady: function () { return false; },
            show: function () {},
        };
    };

    if (adsEnabled) {
        banner.load();
        interst.load();
    } else {
        removeAds(dims);
    }

    var fadeDuration = 20;
    var fade = 0;
    var showInterst = interst.show;
    interst.show = function () {
        if (!adsEnabled) {
            return;
        }

        if (interst.isReady()) {
            fade = fadeDuration;
        } else if (DEBUGGING) {
            console.log("interstitial not ready");
        }
    };

    return {
        platform: function () {
            if (platform) {
                return platform;
            } else if (DEBUGGING) {
                return dbgConfig.fakePlatform;
            }
            return null;
        },
        ads: {
            refresh: refreshAds,
            update: function () {
                updateAds();
                if (fade > 0) {
                    fadeG.visible = true;
                    fadeG.alpha = 1 - (fade/fadeDuration);
                    fade--;
                    if (fade == 3) {
                        showInterst();
                        interst.load();
                    }
                    if (fade == 0) {
                        fadeG.visible = false;
                    }
                }
            },
            remove: removeAds,
            enabled: function () {
                return adsEnabled;
            },
            why: whyAds,
        },
        initState: function (game) {
            initAds(game);
        },
        gameSvc: gameSvc,
        gameSvcsEnabled: gameSvcsEnabled,
        interst: interst,
        iapSvc: iapSvc,
        iaps: iaps,
        onPurchase: function (prodId, f) {
            onPurchase[prodId] = f;
        },
        achvs: achvs,
        ldbds: ldbds,
        isMobile: function () {
            return !!platform || !!dbgConfig.fakePlatform;
        },
    };
};

function initCocoonApi(dims) {
    var cbs = [];
    var api = {
        value: null,
        ready: false,
        setReady: function () {
            this.ready = true;
            cbs.forEach(function (cb) {
                cb.cb.apply(cb.thisVar);
            });
        },
        whenReady: function (cb, thisVar) {
            if (this.ready) {
                cb.apply(thisVar);
            } else {
                cbs.push({cb: cb, thisVar: thisVar});
            }
        },
    };

    if (!!window.cordova) {
        document.addEventListener("deviceready", function() {
            api.value = loadCocoonApi(CONFIG, DBG_CONFIG, dims, Cocoon);
            api.setReady();
        });
    } else {
        if (DBG_CONFIG.fakePlatform) {
            // Use dummy impl from above
            // impl dummy game, purchase
            // TODO Check if purchased.
            api.value = loadCocoonApi(CONFIG, DBG_CONFIG, dims);
        } else {
            api.value = {
                isMobile: function () { return false; },
                initState: function () {},
                ads: {
                    update: function () {},
                    refresh: function () {},
                }
            };
        }
        api.setReady();
    }
    return api;
}
