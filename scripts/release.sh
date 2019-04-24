set -e

branch=$(git symbolic-ref --short HEAD)
tagname="release-$(date +%Y-%m-%d-%H.%M/%z)"
tagnameSed="release-$(date +%Y-%m-%d-%H.%M\\/%z)"
echo $tagnameSed
sed -i -e "s/#ASTERICS_GRID_VERSION#/$tagnameSed/g" src/js/mainScript.js

echo "building..."
npm run build
echo "commiting bundles and manifest..."
git add package/static/build
git add package/static/build_legacy
git add package/static/manifest.appcache
git commit -m "added bundles and appcache for release $tagname"
git push origin HEAD
git checkout src/js/mainScript.js
echo "creating tag '$tagname'..."
git tag -a $tagname -m $tagname
git push origin $tagname
if git diff-index --quiet HEAD --; then
    # No changes
    echo "no local changes, apply release to gh-pages..."
    git checkout gh-pages
    git reset --hard $tagname
    git push origin gh-pages
    git checkout $branch
else
    # Changes
    echo "detected local changes, doing git stash..."
    git stash
    echo "apply release to gh-pages..."
    git checkout gh-pages
    git reset --hard $tagname
    git push origin gh-pages
    git checkout $branch
    git stash pop
fi
echo "$tagname successfully released!"


