# meteor-http-browserify-repro
Meteor reproduce node-stubs issue

This repo contains minimal code to reproduce an issue with meteor-node-stubs which uses browserify modules to stub node modules on the client.
The code in the repo shows how the use of `req.setTimeout` and `req.abort` do not work as expected.

The real kicker is that if I use browserify on the library from which this http code comes from the library operates properly in the browser.
What is different between meteor-node-stubs and browserify?
