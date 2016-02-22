for f in *.wav ; do
    sox $f $f.ogg
done
