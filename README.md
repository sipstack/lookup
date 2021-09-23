# lookup

NPA NXX Lookup scraper specifically for [Local Calling Guide](https://localcallingguide.com/) site. While their website already contains many useful API's to request call data, this lookup tool is useful for generating large CSV format files correlating the data for offline / local use.

## Installing
```
git clone https://github.com/sipstack/lookup
cd lookup
npm i
```
_Some parameters may vary depending on your system._

## Getting started
### Scrape exchanges:
```
cd src 
node exchange.js
```

### Scrape ocn:
```
cd src 
node ocn.js
```
