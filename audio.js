export class AudioAnalyzer {
    audio_input;
    audio;

    audio_analyzer;
    data_array;

    constructor(audio_input, audio) {
        this.audio_input = audio_input;
        this.audio = audio;

        this.add_listener();
    }

    add_listener() {
        let call_back = this.setup_audio.bind(this);
        this.audio_input.addEventListener("change", call_back)
    }

    setup_audio() {
        console.log(this)
        console.log(this.audio_input);
        let file = this.audio_input.files[0];
        this.audio.src = URL.createObjectURL(file);
        this.audio_input.hidden = true;
        let audio_ctx = new window.AudioContext();
        this.audio.play();

        let audio_media = audio_ctx.createMediaElementSource(this.audio);
        this.audio_analyzer = audio_ctx.createAnalyser();

        audio_media.connect(this.audio_analyzer);
        this.audio_analyzer.connect(audio_ctx.destination);

        this.audio_analyzer.fftSize = 32768;
        this.data_array = new Uint8Array(this.audio_analyzer.frequencyBinCount);
    }

    get_audio_data() {
        if(this.audio_analyzer !== undefined) {
            this.audio_analyzer.getByteFrequencyData(this.data_array);
            return this.data_array;
        } else {
            return undefined;
        }
    }

    get_sum_between_range(min_freq, max_freq) {
        let data = this.get_audio_data();
        if(data !== undefined) {
            data.slice(min_freq, max_freq);
            let sum = data.reduce((partial, a) => partial + a, 0)

            sum /= 1000
            return sum;
        }

        return data;
    }

}

function getAudioAnalyzer(){
    let audio = document.querySelector("#audio");
    let audio_input = document.querySelector("#song-input");
    return new AudioAnalyzer(audio_input, audio);
}

export {getAudioAnalyzer};