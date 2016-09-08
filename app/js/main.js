var request = new XMLHttpRequest();
request.open('GET', '/getData', true);

request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    var monez = JSON.parse(request.responseText);
    monez.sort(function (a, b) {
      return a.Datum > b.Datum
    });
    console.log(monez);
  } else {
    // We reached our target server, but it returned an error
  }

  var total = 0;
  for (let transaction of monez) {
    // "Bij" = add
    // "Af" = subtract
    // Af Bij
    let currVal = parseFloat(transaction['Bedrag (EUR)']);
    let moneyOut = transaction['Af Bij'] == 'Af';
    total = moneyOut ? total - currVal : total + currVal;
  }
  console.log(total);
};

request.onerror = function () {
  // There was a connection error of some sort
};

request.send();
