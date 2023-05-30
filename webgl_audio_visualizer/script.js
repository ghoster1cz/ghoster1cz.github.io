import {DrawParams, setup_draw, setup_shader, draw} from "./canvas.js";


// Get canvas and call setup_draw
import {getAudioAnalyzer, save_song_time} from "./audio.js";

class CanvasRenderSettings {
    model;
    number_of_model;
    loud_color;
    silent_color;

    constructor(model, number_of_model, l_c_r, l_c_g, l_c_b, l_c_a, s_c_r, s_c_g, s_c_b, s_c_a) {
        this.model = model;
        this.number_of_model = number_of_model;
        this.loud_color = [l_c_r, l_c_g, l_c_b, l_c_a].map((e) => parseFloat(e))
        this.silent_color = [s_c_r, s_c_g, s_c_b, s_c_a].map((e) => parseFloat(e))
    }
}
class AudioSettings {
    min_freq;
    max_freq;
    freq_interval;
    auto_freq;
    freq_blending;
    sum_method;


    constructor(min_freq, max_freq, freq_interval, auto_freq, freq_blending, sum_method) {
        this.min_freq = parseInt(min_freq);
        this.max_freq = parseInt(max_freq);
        this.freq_interval = parseInt(freq_interval);
        this.auto_freq = auto_freq;
        this.freq_blending = parseInt(freq_blending);
        this.sum_method = sum_method;
    }
}
class CameraSettings {
    camera_pos;
    look_at_pos;
    up_vector;

    constructor(c_p_x, c_p_y, c_p_z, l_p_x, l_p_y, l_p_z, u_v_x, u_v_y, u_v_z) {
        this.camera_pos = [c_p_x, c_p_y, c_p_z]
        this.look_at_pos = [l_p_x, l_p_y, l_p_z]
        this.up_vector = [u_v_x, u_v_y, u_v_z]
    }
}

function get_elem_value(query){
    return document.querySelector(query).value;
}

function load_values_from_input() {
    let model = 1;
    document.getElementsByName("render-model").forEach(e => {if(e.checked){model = e.value}})

    let number_of_models = get_elem_value("#number-of-models")

    let l_c_r = get_elem_value("#loud-color-r")
    let l_c_g = get_elem_value("#loud-color-g")
    let l_c_b = get_elem_value("#loud-color-b")
    let l_c_a = get_elem_value("#loud-color-a")

    let s_c_r = get_elem_value("#silence-color-r")
    let s_c_g = get_elem_value("#silence-color-g")
    let s_c_b = get_elem_value("#silence-color-b")
    let s_c_a = get_elem_value("#silence-color-a")

    let canvas_render_settings = new CanvasRenderSettings(model, number_of_models, l_c_r, l_c_g, l_c_b, l_c_a, s_c_r, s_c_g, s_c_b, s_c_a)

    let min_freq = get_elem_value("#freq-range-min")
    let max_freq = get_elem_value("#freq-range-max")

    let freq_interval = get_elem_value("#freq-interval")
    let auto_freq = document.querySelector("#auto-freq-range").checked

    let freq_blending = get_elem_value("#freq-blending")

    let sum_method = null
    document.getElementsByName("sum-method").forEach(e => {if(e.checked){sum_method = e.value}})

    let audio_settings = new AudioSettings(min_freq, max_freq, freq_interval, auto_freq, freq_blending, sum_method)

    let c_p_x = get_elem_value("#camera-pos-x")
    let c_p_y = get_elem_value("#camera-pos-y")
    let c_p_z = get_elem_value("#camera-pos-z")

    let l_p_x = get_elem_value("#camera-look-x")
    let l_p_y = get_elem_value("#camera-look-y")
    let l_p_z = get_elem_value("#camera-look-z")

    let u_v_x = get_elem_value("#up-vector-x")
    let u_v_y = get_elem_value("#up-vector-y")
    let u_v_z = get_elem_value("#up-vector-z")

    let camera_settings = new CameraSettings(c_p_x, c_p_y, c_p_z, l_p_x, l_p_y, l_p_z, u_v_x, u_v_y, u_v_z)

    return [audio_settings, canvas_render_settings, camera_settings]
}

function main(){
    for (const setting of document.querySelectorAll(".render-settings > p")) {
        setting.addEventListener("click", e => {
            e.target.parentElement.classList.toggle("checked-settings")
        })
    }

    let canvas = document.querySelector("#main-canvas");
    let ctx = canvas.getContext("webgl2", {depth: true, antialias: true, premultipliedAlpha: false});

    let settings = null;
    let analyzer = null;
    let vao_data = null;
    let animation_id = [0]

    var audio_ctx = null;


    let apply_settings = document.querySelector("#apply-settings")
    apply_settings.addEventListener("click", function (){
        if(!audio_ctx) {
            audio_ctx = new window.AudioContext();
        }
        window.cancelAnimationFrame(animation_id[0]);

        settings = load_values_from_input()

        if(analyzer){
            save_song_time(analyzer)
        }

        analyzer = getAudioAnalyzer(settings[0], audio_ctx);
        analyzer.set_auto_freq_interval(settings[1].number_of_model)
        setup_shader(ctx).then(program => {
            [program, vao_data] = setup_draw(ctx, program, settings[1], settings[2]);
            draw(ctx, program, vao_data, analyzer, animation_id)
        });
    })
}

window.addEventListener("DOMContentLoaded", function() {
    main()
})