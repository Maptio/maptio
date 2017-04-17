- add notification of saving document
- when switchin between circle and tree, the container changes size
- auomated save
-track memeory leak ?


1. Start a new branch `xxxx`
    `git branch` to list all branches present on your local repo   

    Make sure that the `*` is in front of master. If not enter `git checkout master`

    `git pull` to make sure you are starting from the latest version of master (i.e. sync with my changes and yours)

    Create new branch with `git checkout -b feature/xxxx` (`xxxx` should be a Git compliant, use `-` for spaces e.g. `ux-improvements` or `i-am-playing-around`)

    `git branch` to make sure the `*` is now in front of `feature/xxxx`

    `git push` to setup the upstream link (so that GitHub knows about your new branch)

    Check at https://github.com/Safiyya/maptio/branches that your branch is visible

    You are now setup to make changes in your new branch.

2. Make changes

    `git add .` to stage **all** modifications 
     or 
     `git add <path>` for individual files e.g. `git add src/app/app.component.css`
     
     `git commit -m "A clear commit message"` to commit all staged files 

     `git push` to push all commits to the branch

3. Create a pull request to trigger automated testing/quality checks

    Go to https://github.com/Safiyya/maptio/branches and create a pull request for `feature/xxxx` 

    You should be able to see **Travis CI** and **Code Climate** checks runs for everything single commit 

    N.B. 
     1. I usually create a pull request after my **first** commit. 
     2. At any given time, all pull requests are listed here https://github.com/Safiyya/maptio/pulls

4. Automated builds (Travis CI ) and quality checks (Code Climate)

    If all check pass, you an carry on commiting to the branch.

    - Try to fix quality issues detected by CodeClimate as soon as you see then (Broken window theory)
    - Apply the Boy Scout rule : we should strive to make the code base  better/cleaner at all times. Fix as many open issues as you can

5. When you are ready to merge to master

    Make sure that your latest commit passes all checks

    Click on "Merge pull request" in https://github.com/Safiyya/maptio/pull/feature/xxxx
   
    Check on slack that these steps are logged : 
    Github --> Travis CI --> (optional) Code climate --> Heroku

    Check that your changes have deployed to http://maptio.herokuapp.com 

6. Clean up to start from (fresh) master again

    `git checkout master` then `git pull` to get sync with master which has of all your latest changes (yours and mine)

    Delete branch `feature/xxxx` in https://github.com/Safiyya/maptio/branches 
    
    `git branch -d feature/xxxx` to delete the local reference to that branch (which should be dead at this point)

    `git branch` should only display master

    Go back to 1 and do it all over again :) 



    






How to get to Eli :
The rocket bus , #192
Kipling station

Subway to Ossington

Ossington bu going north until St Clare

4 Blocks west


Address
156 Glenholme Av
Toronto

