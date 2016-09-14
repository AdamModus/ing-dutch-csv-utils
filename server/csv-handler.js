module.exports = {
  handleRow: function (rowData) {
    let processedDate = new Date(rowData.Datum.substring(0, 4) + '/' + rowData.Datum.substring(4, 6) + '/' + rowData.Datum.substring(6));
    let processedAmount = parseFloat(rowData["Bedrag (EUR)"].replace(',', '.'));
    let relevantData = {
      date: processedDate,
      isWithdrawal: rowData['Af Bij'] == 'Af',
      amount: processedAmount,
      mutation: rowData.Mededelingen,
      description: rowData['Naam / Omschrijving'],
      communication: rowData.Mededelingen
    };
    return relevantData;
  },

  handleData: function (jsonArr) {
    jsonArr.sort(function (a, b) {
      return a.date - b.date;
    });

    var currBalance = 0;
    for (let transaction of jsonArr) {
      currBalance = transaction.isWithdrawal ? currBalance - transaction.amount : currBalance + transaction.amount;
      transaction.balance = parseFloat(currBalance.toFixed(2));
    }

    return jsonArr;
  }

};