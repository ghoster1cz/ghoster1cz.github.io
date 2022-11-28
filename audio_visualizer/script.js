let window_width = window.innerWidth;
let window_height = window.innerHeight;

const bar_max_freq = 8000;
const bar_count = 40;
const bar_space = 0;
const bar_left_offset = 500;
const bar_average = bar_max_freq / bar_count;
const bar_size_multiplayer = bar_average * 0.7;

const bass_radius_min = 0
const bass_radius_max = 200
const bass_min_sum = 5000
const bass_max_sum = 25000
const bass_min_grow_sum = 10000

const snare_radius_min = 100
const snare_radius_max = 300
const snare_min_sum = 6000
const snare_max_sum = 130000
const snare_min_grow_sum = 100000

const mid_low_min_sum = 100000
const mid_low_max_sum = 150000
const mid_bass_radius_offset = 50
const mid_low_fadeout_factor = 5000


let bar_width = Math.floor((window_width - (bar_left_offset*2)) / (bar_count + (bar_count*bar_space)));

function setup_resize(){
    window.onresize = function () {
        window_width = window.innerWidth;
        window_height = window.innerHeight;

        background.width = window_width;
        background.height = window_height;

        foreground.width = window_width;
        foreground.height = window_height;

    }
}

function setup_audio(){
    audio_input.addEventListener("change", function (e){
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio_input.hidden = true;
        audio_ctx = new window.AudioContext();
        audio.muted = false;
        audio.play();


        audio_media = audio_ctx.createMediaElementSource(audio)
        audio_analyzer = audio_ctx.createAnalyser()

        audio_media.connect(audio_analyzer)
        audio_analyzer.connect(audio_ctx.destination)

        audio_analyzer.fftSize = 32768;
        bufferLength = audio_analyzer.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        draw();
    })
}

function setup_canvas(){
    background.width = window_width;
    background.height = window_height;

    foreground.width = window_width;
    foreground.height = window_height;
}

function draw(){
    audio_analyzer.getByteFrequencyData(dataArray);
    clear_ctx();
    draw_bass();
    draw_snares();
    draw_low_mid();
    //draw_bars();

    requestAnimationFrame(draw);
}

function clear_ctx(){
    b_ctx.clearRect(0, 0, window_width, window_height);
    f_ctx.clearRect(0, 0, window_width, window_height);
}

function draw_bass(){
    let sum = 0;
    let blur = 50;
    bass_radius = 0;
    for (let freq = 0; freq < 100; freq++) {
        sum += dataArray[freq];
    }
    if(sum < bass_min_sum){return;}
    if(sum > bass_max_sum){sum = bass_max_sum;}

    if(sum > bass_min_grow_sum) {
        bass_radius = ((sum - bass_min_grow_sum)/(bass_max_sum - bass_min_grow_sum)*bass_radius_max)
    }

    sum = Math.floor(((sum - bass_min_sum)/(bass_max_sum - bass_min_sum))*255)

    blur -= Math.floor((((bass_radius-bass_radius_min)/(bass_radius_max-bass_radius_min))*40)/(40)*40)

    b_ctx.filter = "blur("+blur+"px)";
    b_ctx.beginPath()
    b_ctx.fillStyle = "rgb(0, 0, "+sum+")"
    b_ctx.arc(window_width/2, window_height/2, bass_radius, 0, Math.PI*2)
    b_ctx.fill()

}

function draw_snares(){
    let sum = 0;
    let snare_radius = snare_radius_min;

    for (let freq = 9000; freq < 10000; freq++){
        sum += dataArray[freq];
    }

    if (sum < snare_min_sum) {return;}
    if (sum > snare_max_sum) {sum = snare_max_sum;}

    if(sum > snare_min_grow_sum) {
        snare_radius *= ((sum - snare_min_grow_sum)/(snare_max_sum - snare_min_grow_sum)+1);
    }

    sum = Math.floor(((sum - snare_min_sum)/(snare_max_sum-snare_min_sum))*255);

    b_ctx.filter = "blur(50px)";
    b_ctx.fillStyle = "rgb("+sum+", "+sum+", "+sum+")";

    sum /= 5

    b_ctx.fillRect(0, 0, window_width, sum)
    b_ctx.fillRect(0, 0, sum, window_height)
    b_ctx.fillRect(0, window_height-sum, window_width, sum)
    b_ctx.fillRect(window_width-sum, 0, sum, window_height)


}

function draw_low_mid(){
    b_ctx.filter = "blur(0px)";

    for (let i = 0; i < 8; i++) {
        let sum = 0;
        let blur = 10;
        let red = 0;
        let last_width = 0;
        let ring_mid_low_min_sum = mid_low_min_sum - (mid_low_fadeout_factor * i);
        let ring_mid_low_max_sum = mid_low_max_sum - (mid_low_fadeout_factor * i);

        for (let freq = 100+(900*i); freq < 1000+(900*i); freq++) {
            sum += dataArray[freq];
        }

        if (sum < ring_mid_low_min_sum) {
            continue
        }
        if (sum > ring_mid_low_max_sum) {
            sum = ring_mid_low_max_sum;
        }

        sum = Math.floor(((sum - ring_mid_low_min_sum) / (ring_mid_low_max_sum - ring_mid_low_min_sum))*255)

        blur = 0

        red = (sum/25*i)*i

        b_ctx.strokeStyle = "rgb("+red+", 0, "+sum+")";

        last_width = Math.floor(sum/10)
        b_ctx.lineWidth = last_width

        b_ctx.beginPath();
        b_ctx.arc(window_width / 2, window_height / 2, bass_radius + mid_bass_radius_offset + (mid_bass_radius_offset*i), 0, Math.PI * 2);
        b_ctx.stroke()
    }




}

function draw_bars(){
    let average;
    for (let i = 0; i < bar_count; i++) {
        f_ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        average = 0;
        for (let j = 0; j < bar_average; j++) {
            average += dataArray[(bar_average*i)+j];
            average = average/(bar_average/bar_size_multiplayer)
        }
        f_ctx.fillRect((window_width/2) + (((bar_width + bar_space) * i)) - Math.floor(bar_width/2), (window_height/2)-average, bar_width, average*2)
        if(i!=0) {
            f_ctx.fillRect((window_width / 2) - (((bar_width + bar_space) * i)) - Math.floor(bar_width/2), (window_height / 2) - average, bar_width, average * 2)
        }
        //f_ctx.fillStyle = "black";
        //f_ctx.fillRect(0, (window_height/2)-1, window_width, 2)
    }
}

const background = document.getElementById("canvas_background");
const foreground = document.getElementById("canvas_foreground");

const b_ctx = background.getContext("2d");
const f_ctx = foreground.getContext("2d");

const audio_input = document.getElementById("song_input");
const audio = document.getElementById("audio");

let audio_ctx;
let audio_media;
let audio_analyzer;
let bufferLength;
let dataArray;

let bass_radius;

setup_resize();
setup_canvas();
setup_audio();

