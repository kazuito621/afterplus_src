#!/bin/sh
#

PUBDIR=public
DISTDIR=dist
[ "$1" == "" ] && NEXTBUILDDIR="dist" || NEXTBUILDDIR=$1


if [ ! -e $NEXTBUILDDIR ];then
	ME=`basename $0`
	[ ! -e $1 ] && echo "Directory does not exist";
	echo "Usage: $ME path/to/build-directory"
	echo "Usage: $ME dist   -- will copy dist over to build-<timestamp> and make it public"
	echo "   ie. $ME builds/build-12345"
	exit 255
fi


## if it's "dist" then copy it over
if [ "$NEXTBUILDDIR" == "$DISTDIR" ];then
	tstamp=`date +%s`;
	NEXTBUILDDIR="builds/build-$tstamp";
	echo "Copying $DISTDIR to $NEXTBUILDDIR"
	mkdir -p $NEXTBUILDDIR 2>/dev/null
	cp -a $DISTDIR/* $NEXTBUILDDIR/
fi




cd `dirname $0`
[ ! -d $NEXTBUILDDIR ] && echo "Cant find $NEXTBUILDDIR. Must be relative path to this script" && exit 1;

BASEDIR=$PWD		## base dir of where script is located
cd ../php/public
PHPPUBDIR=$PWD		## php public dir

## Setup links
cd $BASEDIR
cd $NEXTBUILDDIR

## Make sure js and css files exists
[ ! -e js/*.vendor.js ] && echo "Missing vendor.js file!" && exit 1;
[ ! -e js/*.scripts.js ] && echo "Missing scripts.js file!" && exit 1;
[ ! -e css/*.main.css ] && echo "Missing main.css file!" && exit 1;
[ ! -e css/*.vendor.css ] && echo "Missing vendor.css file!" && exit 1;

echo "Setting next build public:"
echo $NEXTBUILDDIR

ln -sf $PHPPUBDIR/api
ln -sf $PHPPUBDIR/go
ln -sf $PHPPUBDIR/import
ln -sf $BASEDIR/tree_images

## Check that it all worked
[ ! -e api/apptop.php ] && echo "ERROR - SYMLINK DIDNT SET RIGHT: api" && exit 1
[ ! -e go/tpl ] && echo "ERROR - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e import/tmp ] && echo "ERROR - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e tree_images/default.jpg ] && echo "ERROR - SYMLINK DIDNT SET RIGHT: tree_images" && exit 1
echo "Symlinks verified"

## Backup last build dir, if the next build dir is not the same as current public
cd $BASEDIR
if [ -e $PUBDIR ] && [ "$(readlink public)" != "$NEXTBUILDDIR" ]; then
	unlink lastPublicBuild
	mv -f $PUBDIR lastPublicBuild 
	echo "Backedup last build: lastPublicDir --> $(readlink lastPublicDir)"
fi

## Set as live dir
ln -sf $NEXTBUILDDIR $PUBDIR

## Check that it all worked
[ ! -e $PUBDIR/favicon.ico ] ||  [ ! -e $PUBDIR/index.html ] \
	&& echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: api" && exit 1
[ ! -e $PUBDIR/api/apptop.php ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: api" && exit 1
[ ! -e $PUBDIR/go/tpl ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e $PUBDIR/import/tmp ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e $PUBDIR/tree_images/default.jpg ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: tree_images" && exit 1
echo "Set public successfully and verified"


## Now create old symlinks for the hashed files, ie xxxxx.script.js, xxxxxx.vendor.js, etc
# usage: makeSym <dir> <filename> <lastPubDir>
makeSym () {
	dir=$1; fn=$2; lastPub=$3;
	newFile=`ls $dir | grep ".\.$fn"`
	oldFile=`ls $lastPub/$dir | grep ".\.$fn"`
	if [ "$newFile" != "" ] && [ "$oldFile" != "" ] \
		&& [ "$newFile" != "$oldFile" ];then
			cd $dir
			ln -s $newFile $oldFile
			echo "$oldFile --> $newFile"
			cd - >/dev/null
	fi
}

cd lastPublicBuild
LPB=$PWD
cd ..
cd $PUBDIR
makeSym js vendor.js $LPB 
makeSym js scripts.js $LPB
makeSym css vendor.css $LPB
makeSym css main.css $LPB



exit 0





