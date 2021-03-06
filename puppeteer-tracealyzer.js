/*https://michaljanaszek.com/blog/test-website-performance-with-puppeteer/*/

const puppeteer = require('puppeteer');
const fs = require('fs')
const tracealyzer = require('tracealyzer');
const { performance, PerformanceObserver} = require('perf_hooks')
var mergeJSON = require("merge-json") ;


let starttime = Date.now()
console.log(starttime);


const tracepath = "./tracelyzer/";
const windowperfpath = "./window.performance.timing/";
const pagemetricspath = "./page.metrics/";
const perfgetmetricspath = "./performance.getmetrics/";

// var stream1 = fs.createWriteStream(tracepath+filename, {flags:'a'});
// var stream2 = fs.createWriteStream(windowperfpath+major_filename+".json", {flags:'a'});
// var stream3 = fs.createWriteStream(pagemetricspath+filename, {flags:'a'});
// var stream4 = fs.createWriteStream(perfgetmetricspath+filename, {flags:'a'});

var i = 0;

(async () => {
    const browser = await puppeteer.launch({headless: false});
    for(i = 0; i < 10;i++) {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        await page.tracing.start({path: './profile_' + i.toString() + '.json'});
        await page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/', {waitUntil: 'load', timeout: 0});
        // await page.goto('http://urban-sustain.org/aperture3/aperture-client/', {waitUntil: 'load', timeout: 0});
        // await page.waitFor(1000);
        let x = await page.evaluate((i) =>{
                getLoadPoints(4);
            },i
        );

        // //Code to dig into the iframe and select a fire station checkbox
        // let myFrame;
        // try{
        //     for (const frame of page.mainFrame().childFrames()){
        //         // Here you can use few identifying methods like url(),name(),title()
        //         if (frame.url().includes ('map2.html')){
        //             console.log('we found the map2 iframe')
        //             myFrame = frame
        //             // we assign this frame to myFrame to use it later
        //         }
        //     }
        //
        // } catch (error){
        //     console.log("iframe/element related error" + error.toString());
        // }

        await page._client.send('Performance.enable');
        const performanceMetrics = await page._client.send('Performance.getMetrics');
        console.log(performanceMetrics.metrics)

        // const performanceTiming = JSON.parse(
        //     await page.evaluate(() => JSON.stringify(window.performance.timing))
        // );
        const performanceTiming = await page.evaluate(() => JSON.stringify(window.performance.timing));
        let perfvar = {}
        perfvar.performanceTiming = performanceTiming
        let perfJSON = JSON.parse(JSON.stringify(perfvar));

        await page.tracing.stop();

        let shapecount = await page.evaluate(() => {
            var x = document.getElementsByClassName("legend");
            shapecount = x[0].innerHTML.split(",")[0].split('>')[3];
            return shapecount;
        });
        console.log( "Shape count: ", shapecount);
        const major_filename = shapecount == ""?'loadsof':shapecount.toString() + '-state-metrics';
        await context.close();

        const metrics = tracealyzer('./profile_' + i.toString() + '.json');

        const filename = major_filename + '_run_' + i.toString() + '.json';
        var stream1 = fs.createWriteStream(tracepath+filename, {flags:'a'});
        var result = mergeJSON.merge(metrics,performanceMetrics)
        var result = mergeJSON.merge(result,perfJSON)
        stream1.write(JSON.stringify(result));
        stream1.close();

        console.log("Time Taken for " + i.toString() + "th run for "+ shapecount +": ", Date.now() - starttime)
    }
    await browser.close();
})();


//https://stackoverflow.com/questions/25460574/find-files-by-extension-html-under-a-folder-in-nodejs
var path = require('path');

function fromDir(startPath,filter,callback){

    // console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};



fromDir('./',/profile\_/,function(filename){
    console.log('-- found: ',filename);
    fs.unlink(filename, (err) => {
        if (err) {
            console.error(err)
            fs.unlinkSync(filename)
            return
        }//file removed
    })
});