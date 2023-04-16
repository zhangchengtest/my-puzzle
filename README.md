npm run build
git add --all
git commit -a -m "update"
git push origin main

ssh root@172.31.21.3

cd /ROOT/my-puzzle
git pull