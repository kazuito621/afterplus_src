ArborPlus Developers Guide
==========================

Coding Style
------------
 - Please follow the coding style that is already in this project
 - Simplicity OVER cleverness! 
   - Always ask yourself: If I have to work on this code in 5 years, will it be simple to understand what is happening?
   - When in doubt explain and diagram any complexities!
 - Create tests for everything you build, please be thorough
 - When completing a task, please note which tests to run so I can easily check your work
 - Run the unit tests before commiting
 - Take pride in your work, write beautiful code!



Commenting
----------
Good naming conventions make some commenting unnecessary.
Where I expect a lot of commenting is when you make decisions on 
HOW you do something. 

 - Why did you pick a particular approach?
 - What other options were there, and why didn't you choose them?
 - If it's complex, then diagram it with [asciiflow.com](http://asciiflow.com)
  - See an example of a good diagram at the top of [models/Tree.php](src/models/Tree.php)


Git Branching
-------------
 - **Naming** - Branch from `master` and name it like so:
```
       yourname/XX_task_name
        
       // for example:
       tim/01_fix_email_bug
       tim/02_new_popup_for_user_edit
```
 - **Minimize Conflicts** - If your task takes more than a few days, be sure to merge from `master` often so that you're branch doesn't diverge much.
 - **Dev Branch for small changes** - If the task is very small, like only a few lines of code, you do not need to create a new branch, you can keep your own separate `dev` branch for small bugs/features.
```
      tim/dev
```
 - **Keep your dev branch up to date** - Before starting any work in your dev branch be sure to merge from `master` to keep it up to date
 
 




When you are done with a task
-----------------------------
   - Create a pull request in github
   - If you are working in our Trello task manager:
     - Drag the trello card to DONE so that Tim will get a notificaiton
     - Record the git branch and hours worked on that task (which you are billing for) at the bottom of the description of the card.
```     
        Branch: tim/03_tree_edit_bug
        Hours: 5
```






  








