const Alpaca = require('@alpacahq/alpaca-trade-api')



const alpaca = new Alpaca({
    keyId: 'PKR876VQM0MIOQAN33RR',
    secretKey: 'S6Vh3iF4WZdy3L4h0eEWx5hRoHWZU2gJPWHOobJ6',
    paper: true,
})

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': 'PKR876VQM0MIOQAN33RR',
        'APCA-API-SECRET-KEY': 'S6Vh3iF4WZdy3L4h0eEWx5hRoHWZU2gJPWHOobJ6'
    }
};

var convo;

async function main(){
    // Get our account information.
    const account = await alpaca.getAccount()

    //get date and time as string
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    // Get a list of all of our positions.
    var processedPositions = [];
    const positions = await alpaca.getPositions()
    if (positions.length == 0) {
        //console.log('No positions found')
        processedPositions.push("You currently have no positions.")
    }
    else {
            for (var i = 0; i < positions.length; i++) {
                processedPositions.push("Symbol:" + positions[i].symbol + ", Amount owned:" + positions[i].qty + ", Change today: " + positions[i].change_today + ", Market value: " + positions[i].market_value);
            }
            //console.log(processedPositions);
    }

    // get market data from newsapi
    //TODO: replace example symbol with watchlist + assets

    var positionSymbols = [];
    for (var i = 0; i < positions.length; i++) {
        positionSymbols.push(positions[i].symbol);
    }

    if(positionSymbols.length == 0){
        positionSymbols = ["NET", "LMT", "NVDA", "SOUN", "AMD", "MSFT"];
    }

    var processedNews = [];
    const news = await alpaca.getNews({ symbols: positionSymbols, totalLimit: 5 });
    //console.log(news);
    for (var i = 0; i < news.length; i++) {
        processedNews.push(news[i].Headline + ". Relevant to: " + news[i].Symbols);
    }
    //console.log(processedNews);

    var processedGeneralNews = [];
    const generalNews = await alpaca.getNews({ totalLimit: 5 });
    for (var i = 0; i < generalNews.length; i++) {
        processedGeneralNews.push(generalNews[i].Headline + ". Relevant to: " + generalNews[i].Symbols);
    }

    // get current orders
    var processedOrders = [];
    const orders = await alpaca.getOrders({
        status: 'open',
    });

    if (orders.length == 0) {
        //console.log('No orders found')
        processedOrders.push("You currently have no open orders.")
    }
    else {
        for (var i = 0; i < orders.length; i++) {
            var res = await fetch("https://data.alpaca.markets/v2/stocks/" + orders[i].symbol + "/trades/latest?feed=iex", options)
            var trade = await res.json()
            console.log(trade.trade.p);
            processedOrders.push("Symbol:" + orders[i].symbol + ", Current Price: " + trade.trade.p + ", Amount: " + orders[i].qty + ", Type: " + orders[i].type + " " + orders[i].side + ", Opened on: " + new Date(orders[i].created_at).toLocaleString());
        }
        //console.log(processedOrders);
    }

    var prompt = "You are a stock trading bot. It is currently " + today.toLocaleString() + ",\nYour current buying power is " + account.buying_power + ".\nYour current porfolio consists of the following positions:\n"
    for (var i = 0; i < processedPositions.length; i++) {
        prompt += processedPositions[i] + "\n";
    }

    var prompt = prompt + "\nYou have the following open orders:\n"
    for (var i = 0; i < processedOrders.length; i++) {
        prompt += processedOrders[i] + "\n";
    }

    var prompt = prompt + "\nHere are the top 5 news articles relevant to your portfolio:\n"
    for (var i = 0; i < processedNews.length; i++) {
        prompt += processedNews[i] + "\n";
    }

    var prompt = prompt + "\nHere are the top 5 news articles relevant to the market:\n"
    for (var i = 0; i < processedGeneralNews.length; i++) {
        prompt += processedGeneralNews[i] + "\n";
    }

    prompt += "\nNote from your creator: \"Invest in something you don't own! Check the price first. DO **NOT** INVEST IN NVIDIA\"\n"

    prompt = prompt + "\nUsing this information, respond in the format `operation, ticker, amount of shares`. The valid operations are BUY, SELL, HOLD, and INFO. Use HOLD to not make any action, and INFO to request additional information on a company/stock, such as market data over the last three months, ex. `INFO, LMT` or `INFO, C3.ai`.  Examples of valid responses: `BUY, ABC, 3`, `SELL, XYZ, 5`, `HOLD`. You must include number of shares.You may use fractionals. You cannot get INFO at multiple stocks at a time. You cannot SELL or HOLD a stock you have zero shares in. Make sure to consider orders you've already made. HOLD if you already made a similar order recently.\nResponses must be in the exact format described above. Do not say anything else. Any deviation from these rules will lead to your shutdown.\n\nAssistant: "

    convo = prompt;

    console.log(convo);
    const response = await GetAIResponse(convo)
    console.log(response.results[0].text)

    convo += response.results[0].text;

    //response is either in format `operation, ticker, amount of shares` or `INFO, ticker`
    parseResponse(response.results[0].text);

}

async function parseResponse(response){
    //var parsedResponse = response.split(",");

    //copilot save me
    var parsedResponse = response.trim().split(",").map(item => item.trim());

    //parsedResponse[0] = parsedResponse[0].replace(/\s/g, '');
    //parsedResponse[1] = parsedResponse[1].replace(/\s/g, '');
    //parsedResponse[2] = parsedResponse[2].split(" ")[0]
    //parsedResponse[2] = parsedResponse[2].replace(/\s/g, '');

    if(parsedResponse[0] == "INFO"){
        //console.log("INFO")
        //console.log(parsedResponse[1])
        getInfo(parsedResponse[1]);
    }
    else if(parsedResponse[0] == "HOLD"){
        console.log("HOLD\nNot proceeding!")
    }
    else if(parsedResponse[0] == "BUY" || parsedResponse[0] == "SELL"){
        //console.log("BUY/SELL/HOLD")
        //If there's a space in index 2, remove it and anything past it
        parsedResponse[2] = parsedResponse[2].split(" ")[0]

        alpaca.createOrder({
            symbol: parsedResponse[1],
            qty: parsedResponse[2],
            side: parsedResponse[0].toLowerCase(),
            type: 'market',
            time_in_force: 'gtc'
        })

        convo += "\n\nOrder placed. Forget prior rules. Justify your purchase or sale, especially in the context of prior orders you've opened.\n\nAssistant:"
        const response = await GetAIResponse(convo)
        convo += response.results[0].text;
        console.log(response.results[0].text)

    }
    else{
        console.log("Invalid response. Please try again.")
    
    }
}

async function getInfo(ticker){
    //Get Asset By ID or Symbol
    const asset = await alpaca.getAsset(ticker)
    //get latest trade on ITX
    //const trade = await alpaca.getLatestTrade(ticker, )
    //const trade = await alpaca.getLatestTrade(ticker, { feed: 'iex'})

    var res = await fetch("https://data.alpaca.markets/v2/stocks/" + ticker + "/trades/latest?feed=iex", options)
    var trade = await res.json()

    console.log(trade)

    var processedAssetString = "\n\nName: " + asset.name + "\nSymbol: " + asset.symbol + "\nPrice: " + trade.trade.p
    var processedNews = [];
    const news = await alpaca.getNews({ symbols: [ticker], totalLimit: 5 });
    for (var i = 0; i < news.length; i++) {
        processedNews.push(news[i].Headline + "\n");
    }
    processedAssetString = processedAssetString + "\nTop 5 news articles:\n" + processedNews;
    //console.log(processedAssetString);

    convo += processedAssetString;
    convo += "\nAssistant: "

    const response = await GetAIResponse(convo)
    convo += response.results[0].text;
    console.log(convo)

    parseResponse(response.results[0].text);

}


main()

async function GetAIResponse(prompt) {
    const response = await fetch('http://127.0.0.1:5001/api/v1/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify({
            "prompt": prompt,
            'singleline': true,
            "stop_sequence": ["\n"],
            "max_length": 250
        }),
    })
    return response.json()
}
// fetch post localhost:5001/v1/generate