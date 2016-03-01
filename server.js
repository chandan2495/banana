var express = require('express');
var session = require('express-session');
var app = express();
var request = require('request');
var path = require('path');
var app_config = require('./app_config');
var sess;
// app.use(express.cookieParser());
app.use(session({
    secret: 'thisisasecret'
}));
var solrUrl = app_config.WEBCONSOLE_URL + '/api/dcube/search/';
var redirectUrl = app_config.WEBCONSOLE_URL + '/cvAccountsSingleSignOn.do?callBackUrl=';
var systemUrl = 'http://' + app_config.SYSTEM_IP_ADDRESS + ':' + app_config.PORT;

app.use("/styles", express.static(__dirname + '/src/css'));
app.use("/scripts", express.static(__dirname + '/src'));
app.use("/font", express.static(__dirname + '/src'));
app.use("/images", express.static(__dirname + '/src/img'));

app.get('/solr/admin/cores*', function(req, resps) {
	console.log('requesting  '+ app_config.WEBCONSOLE_URL +'/api/dcube/GetBasicDataSourcesInfo');
	var options = {
	    url: app_config.WEBCONSOLE_URL + '/api/dcube/GetBasicDataSourcesInfo',
	    headers: {
	        'authToken': decodeURIComponent(sess.samlToken)
	    }
	};	
	request(options, function(err, resp, body) {	
		if(resp){        
	        if (!err && resp.statusCode == 200) {
	            console.log('resp ' + JSON.parse(body));
	            var response = JSON.parse(body);
	            var collections = {	                
	                    status: {}                
	            };
	            var source = 0;
	            if(response && response.datasources) {
		            var dataSourceLen = response.datasources.length;
		            for (source = 0; source < dataSourceLen; source++){		                
		                var sourcename=response.datasources[source].dataSourceName;	                
		                collections.status[sourcename]=response.datasources[source].dataSourceId;
		            }
	        	}
	            resps.send(collections);
			} 
			else {
			console.log('err ' + err);
			}
		} else {
			resps.send(body);
		}
	});
});

app.get('/solr/*', function(req, resps) {
    var query = req.originalUrl.split('/');
    var modified = solrUrl + query.slice(2).join('/');    
    var options = {
        url: solrUrl + query.slice(2).join('/'),
        headers: {
            'authToken': decodeURIComponent(sess.samlToken)
        }
    };
    if(sess.samlToken) { 
	    request(options, function(err, resp, body) {
	    	console.log('url ' + options.url);
	    	if(resp){
	        	console.log('statusCode ' + resp.statusCode);	    	
		        if (!err && resp.statusCode == 200) {
		            console.log('resp ' + JSON.parse(body));
		            resps.send(JSON.parse(body));
		        } else if(!err && resp.statusCode == 401) {
		        	sess.samlToken=null;
		        	resps.redirect(systemUrl);
		        } else {
		            console.log('err ' + err);
		        }
	    	} else {
	    		resps.send(body);
	    	}
	    });
	} else {
		resps.redirect(systemUrl);
	}
});
app.get('/src/index.html*', function(req, resp) {
    console.log('original - ' + req.originalUrl);
    console.log('params : ' + req.params);

    if (req.param('samlToken')){
        sess.samlToken = req.param('samlToken');
        resp.redirect(systemUrl + '/src/index.html');
    }    
    else
    	resp.sendFile(path.join(__dirname + '/src/index.html'));
});
app.get('/src/*', function(req, resp) {
    resp.sendFile(path.join(__dirname + req.path));
});
app.get('*', function(req, resp) {
    sess = req.session;    
    console.log('url : '+ req.originalUrl);		
    var r = redirectUrl + encodeURIComponent(systemUrl + '/src/index.html') + '&sTkValidity=' + app_config.VALIDITY_TIME;    
    if (!sess.samlToken) {
        console.log("Redirecting to " + r);
        resp.redirect(r);        
    }    
});

app.listen(app_config.PORT, function() {
    console.log('Listening on port : ' + app_config.PORT);
});
