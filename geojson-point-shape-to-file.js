var random = require("geojson-random");
var fs = require('fs')
function get_points(num_points){
    let geojson_fc = random.point(num_points,[-60.95, 25.84 , -130.67, 49.38]); //WSEN
    return geojson_fc;
}

function get_lines(num_lines){
    let geojson_fc = random.lineString(num_lines,10,0.001,Math.PI/8,[-60.95, 25.84 , -130.67, 49.38]); //WSEN
    return geojson_fc;
}

function get_shapes(num_shapes){
    let geojson_fc = random.polygon(num_shapes,5,10,[-60.95, 25.84 , -130.67, 49.38]); //WSEN
    return geojson_fc;
}


for(i = 0; i < 50; i++){
    // let run = (i < 10)? '0'+i.toString():i.toString();
    const major_filename = "./point-shapes/pentagons";
    let points_geojson = get_shapes(1000);
    const filename = major_filename + '_run_' + i.toString() + '.json';
    var stream1 = fs.createWriteStream(filename, {flags:'a'});
    stream1.write(JSON.stringify(points_geojson));
    stream1.close();
}

