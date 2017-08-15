import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

var http = require('http');

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
	// counter starts at 0
	this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
	counter() {
		return Template.instance().counter.get();
	},
});

Template.hello.events({
	'click button'(event, instance) {
		// increment the counter when button is clicked
		instance.counter.set(instance.counter.get() + 1);

		let cmd = { name: 'device-id' };

		var opts = {
			method: 'GET',
			path: '/' + cmd.name,
			hostname: '192.168.1.1',
			port: '80',
			protocol: 'http:'
		};

		if ((cmd.body) && typeof cmd.body === 'object') {
			payload = JSON.stringify(cmd.body);
			// NOTE: 'Content-Type' is set here to make this a "simple" cross-site
			// request, as per the HTTP CORS docs:
			//   https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
			// According to the spec, this means that POST can be made directly
			// without an OPTIONS request being made first.
			opts.headers = {
				'Content-Length': payload.length,
				'Content-Type': 'application/x-www-form-urlencoded'
			};
			opts.method = 'POST';
		}

		var req = http.request(opts);
		req.setTimeout(this.timeout); //@@@@ This doesn't seem to work in the Meteor browserify world

		var to = setTimeout(function socketTimedOut() {
			req.abort();			  //@@@@ Also this does not work.
			cb(new Error('HTTP timed out'));
		}, this.timeout);

		req.on('response', function responseHandler(res) {
			var results = '';
			res.on('data', function dataHandler(chunk) {
				if (chunk) {
					results += chunk.toString();
				}
			});
			res.once('end', function httpEnd() {
				clearTimeout(to);

				var json;
				try {
					json = JSON.parse(results.toString());
				} catch (e) {
					return cb(new Error('Invalid JSON received from device.'));
				}
				cb(null, json);
			});
		});

		req.once('error', function httpError(err) {
			clearTimeout(to);
			cb(err);
		});

		if (payload) {
			req.write(payload);
		}
		req.end();
	},
});
