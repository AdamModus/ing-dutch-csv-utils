'use strict';

var fs = require('fs');
var path = require("path");
var csv = require('csv-parser');
var express = require('express');
var ArgumentParser = require('argparse').ArgumentParser;
var csvHandler = require('./csv-handler');

class INGCSVUtilServer {
  /**
   * Creates an argument parser with:
   * - Description
   * - Help argument
   * - Port argument
   */
  initArgumentParser() {
    // Create an argument parser
    this.argParser = new ArgumentParser(
      {
        version: '0.0.1',
        addHelp: true,
        description: 'Dutch ING CSV Utils NodeJS server.'
      }
    );
    // Define the port argument
    this.argParser.addArgument(['-p', '--port'], {
      help: 'Port on where to run the server.',
      type: 'int',
      defaultValue: '8181'
    });
    // Get the arguments
    this.arguments = this.argParser.parseArgs();
  }

  /**
   * Creates the Express app and sets up the middleware to:
   * - Log the requests in the terminal.
   * - Serve the static files located in "../app"
   */
  createApp() {
    // Create a new express app
    this.app = express();
    // Log the requests
    this.app.use(function logger(req, res, next) {
      console.log('serving ' + req.url);
      next(); // Passing the request to the next handler in the stack.
    });
    // Configure the static files
    this.app.use(express.static('../app'));
    // registering rest API
    this.app.get('/getData', this.restGetData);
  }

  /**
   * Starts a http server in the port specified in the arguments or 8888
   */
  startServing() {
    let serverPort = this.arguments.port;
    // Listen on the current port
    this.app.listen(serverPort, function () {
      console.log('Server listening on port: ', serverPort);
    })
  }

  restGetData(request, response) {
    var folder = "../data";
    var jsonArr = [];
    var fileCounter = 0;

    fs.readdir(folder, function (err, files) {
      if (err) {
        throw err;
      }

      var filteredFiles = files.map(function (file) {
        return path.join(folder, file);
      }).filter(function (file) {
        return fs.statSync(file).isFile() && file.endsWith('.csv');
      })

      filteredFiles.forEach(function (file) {
        fs.createReadStream(file)
          .pipe(csv())
          .on('data', function (rowData) {
            // Process row
            let processedRow = csvHandler.handleRow(rowData);
            jsonArr.push(processedRow);
          })
          .on('end', function () {
            fileCounter++;
            if (fileCounter >= filteredFiles.length) {
              let processedData = csvHandler.handleData(jsonArr);
              response.json(processedData);
              response.end();
            }
          });
      });
    });
  }

  constructor() {
    this.initArgumentParser();
    this.createApp();
    this.startServing();
  }
}

var server = new INGCSVUtilServer();
