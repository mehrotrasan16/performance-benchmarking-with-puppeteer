/*https://michaljanaszek.com/blog/test-website-performance-with-puppeteer/*/

const puppeteer = require('puppeteer');
const fs = require('fs')
const { performance, PerformanceObserver} = require('perf_hooks')

var stream = fs.createWriteStream("./metrics.txt", {flags:'a'});
stream.write("This is the metrics file for the first four states census tract information. over 10 runs.\n");
var i = 0;

(async () => {
    const browser = await puppeteer.launch();
    for(i = 0; i < 1;i++) {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        await page.tracing.start({path: './profile_' + i.toString() + '.json'});
        await page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/', {waitUntil: 'load', timeout: 0});

        const obs = new PerformanceObserver((items) => {

            items.getEntries().forEach((item) => {
                console.log(item.name, + ' ' + item.duration)
                console.log("Here")
            })
        })
        obs.observe({entryTypes: ['measure']})


        await page.tracing.stop();
        await context.close();
    }
    await browser.close();
})();