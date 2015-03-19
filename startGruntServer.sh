#!/bin/bash
cd `dirname $0`




GRUNT=`which grunt`

case "$1" in
         ""|start)
         echo "Starting grunt..."
         if [ -f ./.grunt.pid ]
                then
                echo "Sorry, but grunt is already running here..."
                exit 1
         fi
         nohup $GRUNT serve > /dev/null 2>/dev/null &
         echo $! > ./.grunt.pid
         echo "Done."
         ;;

        stop)
         echo "Stopping grunt..."
         if [ -f ./.grunt.pid ]
                then
                xargs kill -9 < ./.grunt.pid
                rm ./.grunt.pid
                echo "Done."
                exit 0
         fi
         echo "Sorry, but grunt is not running here..."
         exit 1
         ;;

        *)
         echo "Usage: startGruntServer {start|stop}"
         exit 1
         ;;
esac

exit 0

