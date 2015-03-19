Running ArborPlus Backend Locally
=================================
Normally you can run the app using our remote API server (dev.arborplus.com).
In special cases you can be granted permission to install the backend code locally.


Backend Installation
--------------------
 - Checkout the code from github
 - Follow the installation instructions in the README.md in that project
 - Make user your hosts file has `arborplus.dev` pointing at your local backend project
 - Create a new file:

     // create file: src/js/config.js, add one line:
     window.cfg.devServer='http://arborplus.dev';


 - Now, run the app:

     sh startGruntServer.sh
     // or for windows, just run "grunt serve"

 - You should be able to login with this credential:

     email: admin@arborplus.com
     pass:  pass






