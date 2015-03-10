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
 - At the beginning of each task, make sure you are working in a new branch labeled:
```
       yourname/XX_task_name
        
       // for example:
       tim/01_fix_email_bug
       tim/02_new_popup_for_user_edit
```
 - Be sure to merge from `master` or create branch from `master` so you are working off the latest code
 - If the work is very small, you do not need to create a new branch, you can keep your own separate `dev` branch for small bugs/features.
```
       tim/dev
       // remember to merge from master each time so you have the latest code
```

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






  








