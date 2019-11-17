#!/usr/bin/env bash

node ./http-backend-server.js &
server_pid=$!
mocha ./http-backend-client.js
kill -KILL $server_pid
wait
