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
        this.audio_analyzer.getByteTimeDomainData(this.data_array);
    }

    get_audio_data() {
        if(this.audio_analyzer !== undefined) {
            this.audio_analyzer.getByteFrequencyData(this.data_array);
            return this.data_array;
        } else {
            return undefined;
        }
    }

    get_true_sum_between_range(min_freq, max_freq) {
        let data = this.get_audio_data();
        if(data !== undefined) {
            data = data.slice(min_freq, max_freq);
            let sum = data.reduce((partial, a) => partial + a, 0)

            sum /= (max_freq - min_freq)
            return sum;
        }

        return data;
    }

    get_altered_sum_between_range(min_freq, max_freq) {
        let data = this.get_audio_data();
        if(data !== undefined) {
            data = data.slice(min_freq, max_freq).filter((value, i, j) => {return value !== 0});
            let sum = data.reduce((partial, a) => partial + a, 0)

            if(data.length !== 0) {
                sum /= data.length;
                sum += (50 * (sum / 255))
            } else {
                sum = 0;
            }
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