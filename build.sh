set -x
rm -rf build www/app.js www/app.js.map
tsc
rollup -c
sorcery -i www/app.js
../luvit.exe server.lua