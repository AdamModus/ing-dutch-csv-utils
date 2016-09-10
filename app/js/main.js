var request = new XMLHttpRequest();
request.open('GET', '/getData', true);

request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    let response = JSON.parse(request.responseText);
    processTransactions(response);
  } else {
    // We reached our target server, but it returned an error
  }
};

request.onerror = function () {
  // There was a connection error of some sort
};

request.send();


function processTransactions(transactionArr) {

  // let relevantData = {
  //   date: processedDate,
  //   isWithdrawal: rowData['Af Bij'] == 'Af',
  //   amount: processedAmount,
  //   mutation: rowData.Mededelingen,
  //   description: rowData['Naam / Omschrijving'],
  //   communication: rowData.Mededelingen
  // };

  for (let transaction of transactionArr) {
    transaction.date = new Date(transaction.date);
  }
  transactionArr.sort(function (a, b) {
    return a.date - b.date;
  });

  var total = 0;
  var chartData = [['Date', 'Balance']];
  for (let transaction of transactionArr) {
    total = transaction.isWithdrawal ? total - transaction.amount : total + transaction.amount;

    chartData.push([
      new Date(transaction.date),
      total
    ]);
  }


  google.charts.load('current', {'packages': ['corechart']});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    var data = google.visualization.arrayToDataTable(chartData);

    var options = {
      title: 'ING Account Balance',
      hAxis: {title: 'Date', titleTextStyle: {color: '#333'}},
      animation: {
        duration: 1000,
        easing: 'out',
      },
      vAxis: {minValue: 0},
      explorer: {
        maxZoomOut: 2,
        keepInBounds: true
      }
    };

    var chart = new google.visualization.AreaChart(document.getElementById('chartHolder'));
    chart.draw(data, options);
  }
}