var SKEL = {
    sprites: [
        "travel",
        "family",
        "health",
        "fun",
        "food",
        "fashion",
        "exercise",
        "art",
        "art_small",
    ],
    fonts: [
    ],
    audo: [
    ],
    states: {
        "game": gameState,
        "menu": menuState,
    },
    extra: { // files
    },
    startState: "game",
    dims: {
        w: 640,
        h: 920,
    },
};

var DBG_CONFIG = {
    fakePlatform: 'android', // null for web
    mockIapSvcs: false,
    mockGameSvcs: false, // Needs to be `true` for web.
    fakeCantPurch: false,
    fakePurchPerst: false,
    failLogin: false,
    cancelLogin: false,
    submitScoreError: false,
    showLdbdsError: false,
    submitAchvError: false,
    showAchvsError: false,
    resetAchvsError: false,
    iosGameLoggedIn: true,
    svcLatency: 1000,
};

var CONFIG = {
    adIds: {
        ios: {
            banner: "3de1cd4c5ac64b6a808edffa822f8567",
            interstitial: "e1681d122d7e4f959815c907ca8db541"
        },
        android: {
            banner: "3de1cd4c5ac64b6a808edffa822f8567",
            interstitial: "e1681d122d7e4f959815c907ca8db541"
        }
    },
    testDeviceIds: {
        "EF675248-1BB1-4C1D-BB37-BD75A4945F6B": true, // iPhone
        "F8E53637-5D67-4423-8261-48A3A9B8DB29": true, // iPad
        "941aa3573ab4e6b": true, // HTC
    },
    iaps: {
        ios: {
            rmAds: "",
        },
        andr: {
            rmAds: "",
        },
    },
    achvs: {
        ios: {
        },
        andr: {
        },
    },
    ldbds: {
        ios: {
            default: "",
        },
        andr: {
            default: "",
        },
    },
    // Banner types - both, banner, interst, none
    // Banner config - e.g. position (top, bottom, none), size, etc.
};
