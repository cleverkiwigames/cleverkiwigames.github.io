//
// FACEBOOK
//

var fbCbs = [];
var withFB = function (f) {
    fbCbs.push(f);
};
window.fbAsyncInit = function() {
    FB.init({
        appId      : '1658577094353856',
        xfbml      : true,
        version    : 'v2.8'
    });
    FB.AppEvents.logPageView();

    fbCbs.forEach(function (f) {
        f(FB);
    });
    withFB = function (f) {
        f(FB);
    };
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.com/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//
// FIREBASE
//

var config = {
    apiKey: "AIzaSyAqf9GMkeCgGMh8TCdBEneCmcC0LScJq0U",
    authDomain: "noveltee-ded5e.firebaseapp.com",
    databaseURL: "https://noveltee-ded5e.firebaseio.com",
    storageBucket: "noveltee-ded5e.appspot.com",
    messagingSenderId: "214733632476"
};
firebase.initializeApp(config);

//
// THIRD-PARTY
//

// http://stackoverflow.com/a/11582513/497142
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

//
// CUSTOM
//

$(function () {
    $('body').html(
        '<div id="wrapper">'+
            '<img id="logo" src="imgs/logo.png" alt="Noveltee logo" />'+
            '<div id="menu">'+
                '<a id="home" href="index.html"><img src="imgs/home.png" alt="Go to home" /></a>'+
                '<div id="user-menu"></div>'+
            '</div>'+
            '<div class="clear"></div>'+
            '<div id="err"></div>'+
            '<div id="main"></div>'+
        '</div>'+
        ''
    );

    var prov = new firebase.auth.FacebookAuthProvider();
    prov.addScope('user_friends');

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $('#err').html('');
            $('#main').html('');

            var logOut = function (errMsg) {
                firebase.auth().signOut().then(function (result) {
                    localStorage['fbToken'] = null;
                }).catch(function (err) {
                    $('#err').html(err.message);
                });
            };

            var fbToken = localStorage['fbToken'];
            if (!fbToken) {
                logOut();
            }

            var a = $('<a id="logOut" href="#"><img src="imgs/log_out.png" alt="Log out" /></a>').click(function(e) {
                e.preventDefault();
                logOut();
            });
            $('#user-menu')
                .html('<span class="name">'+user.displayName+'</span>')
                .append(a);

            firebase.database().ref('users/'+user.uid+'/fbId').once('value', function (snap) {
                if (snap.val() !== null) {
                    return;
                }

                FB.api("/me?fields=id&access_token="+fbToken, function (resp) {
                    if (resp.error) {
                        var err = resp.error;
                        if (err.type == 'OAuthException' && err.code == 190) {
                            if (err.error_subcode == 458) {
                                $('#err').html('You gotta authorise the Noveltee app on Facebook before you can use it!');
                            } else {
                                $('#err').html(err.message);
                            }
                        } else {
                            $('#err').html(err.message)
                        }
                        return;
                    }
                    var fbId = resp.id;

                    // We update `fbIds` before we move the stories from
                    // `pre-users` to `users` so that any new stories will be
                    // sent to the users and not the `pre-user`.
                    var updates = {};
                    updates[fbId] = user.uid;
                    firebase.database().ref('fbIds').update(updates);

                    firebase.database().ref('pre-users/'+fbId).once('value', function (snap) {
                        var stories = snap.val();
                        var updates = {};
                        if (stories != null) {
                            forEach(stories, function (k) {
                                updates['users/'+user.uid+'/stories/'+k] = true;
                            });
                            updates['pre-users/'+fbId] = null;
                        }
                        updates['users/'+user.uid+'/fbId'] = fbId;
                        firebase.database().ref('/').update(updates);
                    });
                });
            });

            onAuthd(user, fbToken);
        } else {
            $('#user-menu').html('<span id="logged-out">Not logged in<span>');
            $('#err').html('');
            $('#main').html('');

            if (typeof(noRedirect) == 'undefined' || !noRedirect) {
                window.location='index.html';
            } else if (onDeAuthd) {
                onDeAuthd(prov);
            }
        }
    });
});

function forEach(obj, f) {
    for (var prop in obj) {
        f(prop);
    }
}

//
// GOOGLE ANALYTICS
//

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-73817716-1', 'auto');
ga('send', 'pageview');
