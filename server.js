'use strict';

var fs = require('fs');
var path = require("path");
var csv = require('csv-parser');
var express = require('express');
var ArgumentParser = require('argparse').ArgumentParser;

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
    this.app.use(express.static('app'));
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
    var folder = "data";
    var jsonArr = [];

    fs.readdir(folder, function (err, files) {
      if (err) {
        throw err;
      }

      files.map(function (file) {
        return path.join(folder, file);
      }).filter(function (file) {
        return fs.statSync(file).isFile();
      }).forEach(function (file) {
        fs.createReadStream(file)
          .pipe(csv())
          .on('data', function (rowData) {
            // Process row
            let processedDate = rowData.Datum.substring(0, 4) + '/' + rowData.Datum.substring(4, 6) + '/' + rowData.Datum.substring(6);
            let processedAmount = parseFloat(rowData["Bedrag (EUR)"].replace(',', '.'));
            let relevantData = {
              date: processedDate,
              isWithdrawal: rowData['Af Bij'] == 'Af',
              amount: processedAmount,
              mutation: rowData.Mededelingen,
              description: rowData['Naam / Omschrijving'],
              communication: rowData.Mededelingen
            };
            jsonArr.push(relevantData);
          })
          .on('end', function () {
            response.json(jsonArr);
            response.end();
          })
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
