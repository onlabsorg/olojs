#!/usr/bin/env bash

node ./http-store-server.js &
server_pid=$!
mocha ./http-store-client.js
kill -KILL $server_pid
wait
