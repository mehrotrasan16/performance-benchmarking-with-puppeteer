const puppeteer = require('puppeteer');

let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('http://urban-sustain.org/aperture3/aperture-client/',{waitUntil: 'load', timeout: 0});
    await page.waitFor(1000);
    const result = await page.evaluate(() => {
        let subels = []
        let allels = document.getElementsByTagName("*");//
        // let v = document.querySelectorAll("#mMap2")
        if(allels.length > 0) {
            for (i = 0; i < allels.length; i++) {
                subels.push(
                    {
                        'id' : allels[i].id, //titles[i].textContent,
                        'element': allels[i]
                    })
            }
        }

        return subels

    });
    browser.close();
    return result;
}

scrape().then((value) => {
    console.log(value);
});
