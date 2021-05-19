#!/bin/sh

# Suppose you want to do blind reviewing of code (eg for job interview
# purposes). Unfortunately, the candidates' names and email addresses are
# stored on every commit! You probably want to assess each candidate's version
# control practices, so just `rm -rf .git` throws away too much information.
# Here's what you can do instead.

# Rewrite all commits to hide the author's name and email
for branch in `ls .git/refs/heads`; do
    # We may be doing multiple rewrites, so we must force subsequent ones.
    # We're throwing away the backups anyway.
    git filter-branch -f --env-filter '
        export GIT_AUTHOR_NAME="GSVE Anon"
        export GIT_AUTHOR_EMAIL="anon@gassave.org"' $branch
done

# Delete the old commits
rm -rf .git/refs/original/

# Delete remotes, which might point to the old commits
for r in `git remote`; do git remote rm $r; done

# Your old commits will now no longer show up in GitK, `git log` or `git
# reflog`, but can still be found using `git show $commit-id`.
