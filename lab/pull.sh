DIR=$(pwd)
mv $1/index.html index.html.tmp
(
    cd ../../$1/skel
    make min && rm -rf $DIR/$1 && mv build/min $DIR/$1
)
mv index.html.tmp $1/index.html

# cp -r ../../$1/www/{audio,fonts,images} $1
# 
# case $1 in
#     bsher)
#         cat ../../$1/www/js/{about,boot,common,game,levels,load,phaser.min}.js \
#             > $1/min.js
#         ;;
#     *)
#         cat ../../$1/www/js/*.js > $1/min.js
#         ;;
# esac
# 
# uglifyjs $1/min.js -d -c -m -o $1/min.js_ && [ "$2" != 'd' ] && mv $1/min.js{_,}
