#!/bin/bash

(
  cd $(dirname "$0")

  copyFromApp () {
    dst=$1
    src=$2

    mkdir -p "./${dst}"

    rm -rf "./${dst}/${src}"
    cp -R "./app/${src}" "./${dst}/${src}"
  }

  copyFromApp core src
  copyFromApp core babel.config.js
  copyFromApp core webpack.config.js

  copyFromApp runtime env
  copyFromApp runtime server.js

  echo "$(node -p 'const pkg=require("./app/package.json"); Object.assign(pkg.dependencies, pkg.devDependencies); JSON.stringify(Object.assign(pkg, {name:"@composition/core",devDependencies:undefined}),null,2)')" > ./core/package.json
  echo "$(node -p 'const pkg=require("./app/package.json"); JSON.stringify(Object.assign(pkg, {name:"@composition/runtime",devDependencies:undefined,bin:{composition:"./bin/cli.js"}}),null,2)')" > ./runtime/package.json
)
