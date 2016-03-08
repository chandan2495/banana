# Banana

##Instructions to get banana working with Data Cube

1.       Install [Nodejs](https://nodejs.org/)
2.       git clone https://github.com/chandan2495/banana or download zip and extract.
3.       Install project dependencies using 
	```npm install```
(Note: ignore the error if it is failing for bower install)
4.       Change app_config.js file and provide datacube_url, listening port for server, current system ip address, and samlToken validity time.
5.       ```node server.js``` (to start the server) 
6.       In browser, [http://localhost:3000](http://localhost:3000)  ( 3000 is default port if not changed in app_config.js).
