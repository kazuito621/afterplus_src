arborplus_angular
=================
AngulariJS/Frontend repo for the ArborPlus product


Installation
============

 - Prerequistes:
   - for Apple Mac/OSX
     - Install [XCode](https://developer.apple.com/xcode/downloads/)
     - ...including Command Line Tools:
       - XCode Preferences
       - Downloads Tab
       - click "Install" icon next to Command Line Tools
   - for Windows

After cloning this repository onto your local machine:

 - Install NodeJS
 - http://nodejs.org/download/
 - cd into the working directory of the project
 - sudo npm -g install grunt-cli karma bower
 - npm install
 - bower install
 - grunt build
 - grunt test  (make sure tests run ok)
 - grunt serve

Goto browser: http://localhost:9000

Use this test account: 
   user: timhon@gmail.com
   pass: asdf


Developer Contribution Guidelines
==============

Please follow these guidelines strictly.

Git Branching
---------

 - **Proper Naming** - At the beginning of each task, create a new branch from master named:
   
       yourname/XX_task_name
        
       // for example:
       tim/01_fix_email_bug
       tim/02_new_popup_for_user_edit

 - **Minimize Conflicts** - If your task takes more than a few days, be sure to merge from `master` often so that you're branch doesn't diverge to much.
 - **Dev Branch for small changes** - If the task is very small, like only a few lines of code, you do not need to create a new branch, you can keep your own separate `dev` branch for small bugs/features.

      tim/dev

 - **Keep your dev branch up to date** - Before starting any work in your dev branch be sure to merge from `master` to keep it up to date


Task Completion
----------
When you're done with a task:

 - Create a Pull Request 
   - https://help.github.com/articles/creating-a-pull-request/

 - If you're linked into the Trello task tracking system, then:
   - Drag the trello card to DONE
   - Write the `git branch` and `hours worked` at the bottom of the task description:
     
      Branch: tim/03_tree_edit_bug
      Hours: 5




