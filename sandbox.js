const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': 'PKR876VQM0MIOQAN33RR',
        'APCA-API-SECRET-KEY': 'S6Vh3iF4WZdy3L4h0eEWx5hRoHWZU2gJPWHOobJ6'
    }
};
async function main() {
    var trade = await fetch("https://data.alpaca.markets/v2/stocks/" + "NVDA" + "/trades/latest?feed=iex", options)
    trade = await response.json()
    console.log(trade)
}
main();

