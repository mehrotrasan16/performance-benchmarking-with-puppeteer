/*https://michaljanaszek.com/blog/test-website-performance-with-puppeteer/*/

const puppeteer = require('puppeteer');
const fs = require('fs')
const tracealyzer = require('tracealyzer');
const { performance, PerformanceObserver} = require('perf_hooks')

var stream = fs.createWriteStream("./tracealyzer-metrics.txt", {flags:'a'});
stream.write("This is the metrics file for the first four states census tract information. over 10 runs.\n");
var i = 0;

(async () => {
    const browser = await puppeteer.launch();
    for(i = 0; i < 10;i++) {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        await page.tracing.start({path: './profile_' + i.toString() + '.json'});
        await page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/', {waitUntil: 'load', timeout: 0});


        const performanceTiming = JSON.parse(
            await page.evaluate(() => JSON.stringify(window.performance.timing))
        );
        // stream.write(JSON.stringify(performanceTiming));
        // stream.write("\n\n\n")
        // console.log(performanceTiming);

        // let
            dns  = performanceTiming.domainLookupEnd - performanceTiming.domainLookupStart,
            tcp  = performanceTiming.connectEnd - performanceTiming.connectStart,
            ssl = performanceTiming.requestStart - performanceTiming.secureConnectionStart,
            waitingTime = performanceTiming.responseStart - performanceTiming.requestStart,
            contentTime = performanceTiming.responseEnd - performanceTiming.responseStart,
                requestTime = performanceTiming.responseEnd - performanceTiming.requestStart,
            networkTime = (dns + tcp + waitingTime + contentTime),
            pageloadTime = performanceTiming.loadEventStart - performanceTiming.navigationStart;
        //
        // console.log("\n\n");
        // console.log("DNS Lookup time: " + dns.toString());
        // console.log("TCP Handshake time: " + tcp.toString());
        // console.log("SSL Handshake time: " + ssl.toString());
        // console.log("Page Load time: " + pageloadTime.toString());

        await page._client.send('Performance.enable');
        const performanceMetrics = await page._client.send('Performance.getMetrics');
        // const performanceMetrics = JSON.parse(
        //     await page.evaluate(() => JSON.stringify(performance.get))
        // );
        // console.log("\n\n\n");
        // console.log(performanceMetrics);
        // performanceMetrics['metrics'].forEach((m) => {
        //     stream.write(m.toString());
        // })
        // stream.write("\n\n\n")

        const perf = await page.metrics();
        // console.log(JSON.parse(JSON.stringify(perf)));
        // stream.write(JSON.stringify(perf));
        // stream.write("\n\n\n\n\n")

        await page.tracing.stop();
        await context.close();

        const metrics = tracealyzer('./profile_' + i.toString() + '.json');
        console.log(metrics['profiling']['categories']);
        stream.write(JSON.stringify(metrics['profiling']['categories']).toString());
    }
    await browser.close();

})();