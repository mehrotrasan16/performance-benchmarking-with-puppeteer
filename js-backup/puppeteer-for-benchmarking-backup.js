/*https://michaljanaszek.com/blog/test-website-performance-with-puppeteer/*/

const puppeteer = require('puppeteer');
const fs = require('fs')
const tracealyzer = require('tracealyzer');
const { performance, PerformanceObserver} = require('perf_hooks')

var stream = fs.createWriteStream("./metrics.txt", {flags:'a'});
var i = 0;

(async () => {
        const browser = await puppeteer.launch();
        for(i = 0; i < 5;i++) {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();


            await page.tracing.start({path: './profile_' + i.toString() + '.json'});
            // await page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/', {waitUntil: 'load', timeout: 0});
            await page.goto('http://urban-sustain.org/aperture3/aperture-client/', {waitUntil: 'load', timeout: 0});

            //Code to check if we can find an element by its selector
            // try {
            //     await page.waitForSelector('#sidebar > div.sidebar-tabs > ul > li > a')
            // } catch (error) {
            //     console.log("The element didn't appear.")
            // }
            //Code to dig into the iframe and select a fire station checkbox
            try{
                var iframe = document.querySelectorAll("iframe");
                //look for #fire_station_layer_selector
                // await page.waitForSelector('#fire_station_layer_selector').then(() => {
                //     console.log('found fire station');
                //     // page.$('#fire_station_layer_selector').checked = true
                // });
            } catch (error){
                console.log("iframe/element related error")
            }
            //Code to open the menu and select a layer checkbox - e.g. the Fire Station checkboxes.
            // await page.evaluate(() => {
            //     var el = document.querySelectorAll("a[href='#home']");
            //     console.log(el);
            //     el.click();
            //     var el = document.getElementById('fire_station_layer_selector');
            //     el.checked = true;
            // });

            const performanceTiming = JSON.parse(
                await page.evaluate(() => JSON.stringify(window.performance.timing))
            );
            stream.write(JSON.stringify(performanceTiming));
            stream.write("\n")
            // console.log(performanceTiming);

            let
                dns  = performanceTiming.domainLookupEnd - performanceTiming.domainLookupStart,
                tcp  = performanceTiming.connectEnd - performanceTiming.connectStart,
                // ssl = performanceTiming.requestStart - performanceTiming.secureConnectionStart,
                waitingTime = performanceTiming.responseStart - performanceTiming.requestStart,
                contentTime = performanceTiming.responseEnd - performanceTiming.responseStart,
                networkTime = (dns + tcp + waitingTime + contentTime),
                pageloadTime = performanceTiming.loadEventStart - performanceTiming.navigationStart;

            // console.log("\n\n");
            // console.log("DNS Lookup time: " + dns.toString());
            // console.log("TCP Handshake time: " + tcp.toString());
            // console.log("Network Handshake time: " + networkTime.toString());
            // console.log("Page Load time: " + pageloadTime.toString());

            await page._client.send('Performance.enable');
            const performanceMetrics = await page._client.send('Performance.getMetrics');
            // console.log("\n\n\n");
            // console.log(performanceMetrics);
            // performanceMetrics['metrics'].forEach((m) => {
            //     stream.write(JSON.stringify(m).toString());
            // })
            stream.write(JSON.stringify(performanceMetrics['metrics']));
            stream.write("\n")

            const perf = await page.metrics();
            // console.log(JSON.parse(JSON.stringify(perf)));
            stream.write(JSON.stringify(perf));
            stream.write("\n")

            await page.tracing.stop();
            await context.close();
            const metrics = tracealyzer('./profile_' + i.toString() + '.json');
            // console.log(metrics['profiling']['categories']);
            // console.log(metrics['profiling']['events']);
            // console.log(metrics['rendering']);
            stream.write(JSON.stringify(metrics['profiling']['categories']).toString());
            stream.write("\n");
            stream.write(JSON.stringify(metrics['profiling']['events']).toString());
            stream.write("\n");
            stream.write(JSON.stringify(metrics['rendering']).toString());
            // stream.write(JSON.stringify(metrics['profiling']['functions']).toString());
            // stream.write(JSON.stringify(metrics['profiling']['userFunctions']).toString());
            stream.write("\n\n\n\n\n")

            // await context.close();
        }
        await browser.close();
    })();

// stream.close();