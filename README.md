# KoboldTrader
### Let LLMs trade stocks!

*I am not liable for anything you do with this repo.*\
*This was a very unserious project, and it's far from perfect. Expect bugs.*

Use the KoboldAI/KoboldCPP API and Alpaca (which supports paper trading) to let an AI language model interface with the stock market.\
Provides a list of basic information plus some news articles to the LLM and has it make decisions based off that. As with everything AI, **YMMV**, especially depending on the quality of the model you're using.\
Requires a running KoboldAI instance (port 5001) and an Alpaca account. Insert the API keys in `index.js` as needed.

Running `index.js` will make the LLM try to trade once. It will keep making requests until either the AI makes a valid move or the script crashes. It's possible for it to get stuck in a loop, so use with caution.
For truely autonamous trading, create a bash script to run `index.js` every hour or so during trading hours :)

*Note: Some bits in index.js (line 54, 111) were dependent on my own goals, you may want to change those a bit.*

**PLEASE don't actually trade real money with this**
