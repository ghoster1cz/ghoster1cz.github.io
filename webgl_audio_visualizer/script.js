import {DrawParams, setup_draw, setup_shader, draw} from "./canvas.js";


// Get canvas and call setup_draw
import {getAudioAnalyzer} from "./audio.js";

function main(){
    let canvas = document.querySelector("#main-canvas");
    let ctx = canvas.getContext("webgl2", {depth: true, antialias: true, premultipliedAlpha: false});

    let analyzer = getAudioAnalyzer();
    let vao_data;
    let draw_params = new DrawParams();
    setup_shader(ctx).then(program => {
        [program, vao_data] = setup_draw(ctx, program, draw_params);
        draw(ctx, program, vao_data, analyzer)
    });
}

main();