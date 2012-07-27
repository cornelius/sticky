# Sticky

This is a little bit of experimental code I wrote during the SUSE Hackweek VIII
to learn some more about node.js. It became a mixture of node.js, Redis, HTML,
CSS, and jQuery.

The app does not much more than creating sticky notes on a canvas when you click
it.

## Setup

* Make sure node is installed (for openSUSE go to http://software.opensuse.org)
* Make sure Redis is installed (for openSUSE http://software.opensuse.org again)
* Run "npm i redis" to install the Redis driver for node
* Start Redis (on openSUSE do "sudo /usr/sbin/rcredis start")
* Run server with "node sticky_server.js"
* Point your browser to http://localhost:8000
* Click
