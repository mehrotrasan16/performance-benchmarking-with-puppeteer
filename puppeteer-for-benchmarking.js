/*https://michaljanaszek.com/blog/test-website-performance-with-puppeteer/*/

const puppeteer = require('puppeteer');
const fs = require('fs')
const tracealyzer = require('tracealyzer');
const { performance, PerformanceObserver} = require('perf_hooks')

const tracepath = "./tracelyzer/";
const windowperfpath = "./window.performance.timing/";
const pagemetricspath = "./page.metrics/";
const perfgetmetricspath = "./performance.getmetrics/";
let filename = '1-state-metrics';
// var stream1 = fs.createWriteStream(tracepath+filename, {flags:'a'});
// var stream2 = fs.createWriteStream(windowperfpath+filename, {flags:'a'});
// var stream3 = fs.createWriteStream(pagemetricspath+filename, {flags:'a'});
// var stream4 = fs.createWriteStream(perfgetmetricspath+filename, {flags:'a'});

var i = 0;

(async () => {
        const browser = await puppeteer.launch();
        for(i = 0; i < 10;i++) {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();


            await page.tracing.start({path: './profile_' + i.toString() + '.json'});
            await page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/', {waitUntil: 'load', timeout: 0});
            // await page.goto('http://urban-sustain.org/aperture3/aperture-client/', {waitUntil: 'load', timeout: 0});
            // await page.waitFor(1000);

            // //Code to dig into the iframe and select a fire station checkbox
            // let myFrame;
            // try{
            //     for (const frame of page.mainFrame().childFrames()){
            //         // Here you can use few identifying methods like url(),name(),title()
            //         if (frame.url().includes('map2.html')){
            //             console.log('we found the map2 iframe')
            //             myFrame = frame
            //             // we assign this frame to myFrame to use it later
            //         }
            //     }
            //
            // } catch (error){
            //     console.log("iframe/element related error" + error.toString());
            // }

            await page.tracing.stop();
            await context.close();
            const metrics = tracealyzer('./profile_' + i.toString() + '.json');

            filename = filename + '_run_' + i.toString() + '.json';
            var stream1 = fs.createWriteStream(tracepath+filename, {flags:'a'});
            stream1.write(JSON.stringify(metrics));

            // console.log(metrics['profiling']['categories']);
            // console.log(metrics['profiling']['events']);
            // console.log(metrics['rendering']);
            // stream1.write(JSON.stringify(metrics['profiling']['categories']).toString());
            // stream1.write("\n");
            // stream1.write(JSON.stringify(metrics['profiling']['events']).toString());
            // stream1.write("\n");
            // stream1.write(JSON.stringify(metrics['rendering']).toString());
            // stream1.write("\n--------------------\n")
        }
        await browser.close();
    })();