const timeline = require('chrome-timeline').timeline;

timeline(async (runner) => {
    // load something in chromium
    await runner.page.goto('http://localhost:63342/win_BD_experiment/clean-leaflet/');
    // start a timeline profiling
    await runner.tracingStart('profile');
    // do something in the remote page
    await runner.remote((done, window) => {
        // // this is within remote browser context
        // some_heavy_stuff_to_be_measured();
        // // call done when finished (sync variant)
        // done();
        // // or async example with setTimeout
        // setTimeout(done, 10000);
    });
    // stop the profiling
    await runner.tracingStop();
});

