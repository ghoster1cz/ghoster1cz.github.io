var audio_media = null;
var audio_analyzer = null;
var song_timestamp = 0;
var song_name = null;

export class AudioAnalyzer {
    audio_input;
    audio;
    audio_settings;
    audio_ctx;

    audio_analyzer;
    data_array;

    constructor(audio_input, audio, audio_settings, audio_ctx) {
        this.audio_input = audio_input;
        this.audio = audio;
        this.audio_settings = audio_settings;

        this.add_listener(audio_ctx);
    }

    add_listener(audio_ctx) {
        let call_back = this.setup_audio.call(this, audio_ctx);
        this.audio_input.onchange = call_back
    }

    setup_audio(audio_ctx) {
        let file = this.audio_input.files[0];
        this.audio.src = URL.createObjectURL(file);
        if(file.name == song_name){
            this.audio.currentTime = song_timestamp
        } else {
            song_timestamp = 0
            song_name = file.name
        }
        console.log(file.name)
        console.log(song_name)

        this.audio.pause();
        this.audio.play();

        if(!audio_media) {
            audio_media = audio_ctx.createMediaElementSource(this.audio);
            audio_analyzer = audio_ctx.createAnalyser();
            audio_analyzer.connect(audio_ctx.destination)
        }
        this.audio_analyzer = audio_analyzer

        audio_media.connect(this.audio_analyzer);

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

    set_auto_freq_interval(number_of_models){
        if(this.audio_settings.auto_freq){
            this.audio_settings.freq_interval =
                (Math.abs(this.audio_settings.max_freq - this.audio_settings.min_freq)
                    + (this.audio_settings.freq_blending*(number_of_models-1)))
                / number_of_models
        }
    }

    get_sum(iteration){
        let min_freq = this.audio_settings.min_freq + (iteration * this.audio_settings.freq_interval);
        if(min_freq > this.audio_settings.min_freq + this.audio_settings.freq_blending){
            min_freq -= this.audio_settings.freq_blending;
        }

        let max_freq = this.audio_settings.min_freq + ((iteration+1)*this.audio_settings.freq_interval);
        if(max_freq > this.audio_settings.min_freq + this.audio_settings.freq_blending){
            max_freq -= this.audio_settings.freq_blending
        }
        if(max_freq > this.audio_settings.max_freq){
            max_freq = this.audio_settings.max_freq;
        }

        min_freq = Math.round(min_freq)
        max_freq = Math.round(max_freq)

        if(this.audio_settings.sum_method === "true-sum"){
            return this.get_true_sum_between_range(min_freq, max_freq);
        } else if (this.audio_settings.sum_method === "altered-sum"){
            return this.get_altered_sum_between_range(min_freq, max_freq);
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
        min_freq = min_freq / 2;
        max_freq = max_freq / 2;
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

function getAudioAnalyzer(audio_settings, audio_ctx){
    let audio = document.querySelector("#audio");
    let audio_input = document.querySelector("#song-input");
    return new AudioAnalyzer(audio_input, audio, audio_settings, audio_ctx);
}

function save_song_time(analyzer){
    song_timestamp = analyzer.audio.currentTime
}

export {getAudioAnalyzer, save_song_time};