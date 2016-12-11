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


  google.charts.load('current', {'packages': ['corechart']});
  google.charts.setOnLoadCallback(() => {
    drawAllLineChart(transactionArr);
    drawLastMonthLineChart(transactionArr);
    drawCurrentMonthLineChart(transactionArr);
    // drawAllPieChart(transactionArr);
  });
}

function createLineChartDataTable() {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('date', 'Date'); // Date of transaction
  dataTable.addColumn('number', 'Balance'); // Balance after transaction occurred
  dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
  return dataTable;
}

function createCustomTooltip(transaction) {
  // let relevantData = {
  //   date: processedDate,
  //   isWithdrawal: rowData['Af Bij'] == 'Af',
  //   amount: processedAmount,
  //   mutation: rowData.Mededelingen,
  //   description: rowData['Naam / Omschrijving'],
  //   communication: rowData.Mededelingen
  // };
  return `
            <div style="font-family: Verdana">
              <div>Date: <b>${transaction.date}</b></div>
              <div>Balance: <b>${transaction.balance}€</b></div>
              <div>Transaction value: ${transaction.amount}€</div>
              <div>Description: ${transaction.description}</div>
            </div>
  `;
}

function createLineChartOptions() {
  return {
    title: 'ING Account Balance',
    hAxis: {title: 'Date', titleTextStyle: {color: '#333'}},
    animation: {
      "startup": true,
      duration: 1000,
      easing: 'out',
    },
    vAxis: {minValue: 0},
    explorer: {
      maxZoomOut: 2,
      keepInBounds: true
    },
    tooltip: {isHtml: true}
  };
}

function drawAllLineChart(tArr) {
  var dataTable = createLineChartDataTable();
  var options = createLineChartOptions();

  var rowsToAdd = [];
  for (tr of tArr) {
    var currRow = [
      tr.date,
      tr.balance,
      createCustomTooltip(tr)
    ];
    rowsToAdd.push(currRow);
  }
  dataTable.addRows(rowsToAdd);

  var chart = new google.visualization.AreaChart(document.getElementById('allLineChart'));
  chart.draw(dataTable, options);
}

function drawLastMonthLineChart(tArr) {
  var dataTable = createLineChartDataTable();
  var options = createLineChartOptions();

  var date = new Date();
  var startDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  var finalDate = new Date(date.getFullYear(), date.getMonth(), 1);

  var rowsToAdd = [];
  for (tr of tArr) {
    if (!(tr.date >= startDate && tr.date < finalDate)) {
      continue
    }
    var currRow = [
      tr.date,
      tr.balance,
      createCustomTooltip(tr)
    ];
    rowsToAdd.push(currRow);
  }
  dataTable.addRows(rowsToAdd);

  var chart = new google.visualization.AreaChart(document.getElementById('lastMonthLineChart'));
  chart.draw(dataTable, options);
}

function drawCurrentMonthLineChart(tArr) {
  var dataTable = createLineChartDataTable();
  var options = createLineChartOptions();

  var date = new Date();
  var startDate = new Date(date.getFullYear(), date.getMonth(), 1);

  var rowsToAdd = [];
  for (tr of tArr) {
    if (tr.date < startDate) {
      continue;
    }
    var currRow = [
      tr.date,
      tr.balance,
      createCustomTooltip(tr)
    ];
    rowsToAdd.push(currRow);
  }
  dataTable.addRows(rowsToAdd);

  var chart = new google.visualization.AreaChart(document.getElementById('currentMonthLineChart'));
  chart.draw(dataTable, options);
}


function drawAllPieChart(tArr) {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string', 'Date'); // Date of transaction
  dataTable.addColumn('number', 'Balance'); // Balance after transaction occurred
  dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});

  var options = {
    title: 'ING Account Balance',
    animation: {
      "startup": true,
      duration: 1000,
      easing: 'out',
    },
    tooltip: {isHtml: true}
  };

  var rowsToAdd = [];
  for (tr of tArr) {
    var currRow = [
      tr.date.toString(),
      tr.balance,
      createCustomTooltip(tr)
    ];
    rowsToAdd.push(currRow);
  }
  dataTable.addRows(rowsToAdd);

  var chart = new google.visualization.PieChart(document.getElementById('allPieChart'));
  chart.draw(dataTable, options);
}
