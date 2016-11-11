// 1. background
// 2. text colour
// 3. 

var phatStack = [];
var f = function () {
    console.log('inspecting');

    //
    // INIT
    //
    // We need global persistence, so we use `window` for now.
    //
    if (!window.playout) {
        // Based off of https://gist.github.com/luqmaan/4169492

        // var modCol = function (col) {
        //     var rgb = 
        // }

        window.playout = true;
        var menu = $('<div>&nbsp;</div>').css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '200px',
            'padding': '1em',
            'border-radius': '3px',
            'background-color': '#eee',
        });
        $('body').append(menu);

        var enter = function (e) {
            // TODO How to prevent name collisions?
            var c = e.css("background-color");
            e.attr("background-color", c);
            e.css("background-color", "yellow");

            var offs = e.offset();
            menu.html(
                '<div style="display: inline-block; width: 50px;">'
                    +e.prop('nodeName')+'</div>'+
                // '<div style="display: inline-block; width: 150px;">'
                //     +c+'</div>'+
                '<input id="custom" type="input" />'+
                ''
            ).css({
                'top': (offs.top+e.outerHeight(true)-$(window).scrollTop()+10)+'px',
                'left': offs.left+'px',
            });

            $('#custom').spectrum({
                color: c,
                move: function (colour) {
                    e.css('background-color', colour.toHexString());
                },
            });
        };
        var leave = function (e) {
            e.css("background-color", e.attr("background-color"));
        };

        $(document).on('mouseenter', '*', 0, function (e) {
            if (!inspecting) {
                return;
            }

            var i = typeof(e.result) === 'undefined' ? 0 : e.result;

            if (i === 0) {
                enter($(this));
                phatStack.forEach(leave);
            }
            phatStack.splice(phatStack.length-i, 0, $(this));

            return i+1;

        }).on('mouseleave', '*', 0, function (e) {
            if (!inspecting) {
                return;
            }

            leave(phatStack.pop());
            if (phatStack.length > 0) {
                enter(phatStack[phatStack.length-1]);
            }
        }).on('click', '*', function (e) {
            inspecting = false;

            e.preventDefault()
            e.stopPropagation()
        });
    }
    inspecting = true;
};
