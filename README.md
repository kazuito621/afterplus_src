arborplus_angular
=================
Angular/JS/Frontend repo for arbor app


Installation
============

After cloning this repository onto your local machine:

 - Install NodeJS
 - http://nodejs.org/download/
 - cd into the working directory of the project
 - sudo npm -g install grunt-cli karma bower
 - npm install
 - bower install
 - grunt build
 - grunt serve

Goto browser: http://localhost:9000

Use this test account: 
   user: timhon@gmail.com
   pass: asdf



Contributing
============
Please create a new branch for each new feature you are working on.
Branch names should follow this pattern:
      <yourName>/##_<featureName>

For example:

      tim/01_adding_invite_button
	  tim/02_bugfix_image_rotation

*When a feature is completed:*
  - Create a pull request
  - Note the branch name in the Trello card related to the bug/feature
  - Move the trello car to the "done" list
  - Note the hours it took to complete at the bottom of the Trello card description
 


Entities
========
  This project is now able to be "white-labeled", so that multiple companies can use it as their tree management service.
  This is controlled by "entities". Each company is an entity, that is listed in the entity database table.
  Some things are currently being hardcoded for now.

How to add an entity
--------------------
  - Add to entity table
  - Add to /etc/httpd/conf/httpd.conf file (ServerAlias)
  - Add to js/config.js



History
========
This project was broken up from a larger repository, and now only contains the javascript/html frontend portion of the project.

