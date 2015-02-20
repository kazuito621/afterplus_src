#!/bin/sh
#

if [ "$1" == "" ] || [ ! -e $1 ];then
	ME=`basename $0`
	[ ! -e $1 ] && echo "Directory does not exist";
	echo "Usage: $ME path/to/build-directory"
	echo "   ie. $ME builds/build-12345"
	exit 255
fi

## Get directories

NEXTBUILDDIR=$1
THISDIR=$PWD

cd `dirname $0`
BASEDIR=$PWD
cd ../php/public
PHPPUBDIR=$PWD

## Setup links
cd $THISDIR
cd $NEXTBUILDDIR
HARDBUILDDIR=$PWD
echo "Setting next build public:"
echo $HARDBUILDDIR

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
[ -e public ] && [ "$(readlink public)" != "$NEXTBUILDDIR" ] \
	&& mv -f public lastPublicBuild && echo "Backedup last build: lastPublicDir --> $(readlink lastPublicDir)"

## Set as live dir
ln -sf $HARDBUILDDIR public

## Check that it all worked
[ ! -e public/favicon.ico ] ||  [ ! -e public/index.html ] \
	&& echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: api" && exit 1
[ ! -e public/api/apptop.php ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: api" && exit 1
[ ! -e public/go/tpl ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e public/import/tmp ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT:" && exit 1
[ ! -e public/tree_images/default.jpg ] && echo "FATAL - BAD BUILD! - SYMLINK DIDNT SET RIGHT: tree_images" && exit 1
echo "Set public successfully and verified"

exit 0





