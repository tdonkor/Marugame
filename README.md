# DCI Teams - GIT Fork Workflow

This document provides basic information regarding the use of Acreburger boilerplate application and GIT fork workflow. This is the first draft and the document may suffer modifications.


## How to fork a new project

To fork a project from Git Lab:

 1. Go to the repository that you want to fork from and press the fork button.
 2. You cannot fork a project in the same namespace. Thus, you will need to select a different group. Choose your own namespace if you plan to move the repository afterwards.
 3. Git Lab forks the repository with the same name. To change the name of the repository go to **Settings** and change **Project name** field.
 4. To change URL of repository go to **Advanced** and change **acreburger** to your desired name.
 5. To transfer the project to a different namespace/group, go to **Advanced** and select a new namespace/group from **Transfer project section**.


## How to update forked project

To be able to pull modifications from the main source, **first you need to add the source repository to your remote**.

    git remote add acreburger https://gitrepo.acrelec.com/dci/acreburger.git

To **pull** modifications from the **Acreburger** repository you need to fetch those changes.

    git fetch acreburger

Checkout to your desired branch (develop or feature).

To **merge** modifications from **Acreburger** master or other branch to your current branch:

    git merge acreburger/master

Change master to desired branch name or commit ID.

## How to remove fork connection

Go to your project **Settings**, in the **Remove fork relationship** section and press the button.
