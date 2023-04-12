function setup_audio(audio_input, audio) {
    audio_input.addEventListener("change", (e) => {
        let file = e.target.files[0];
        audio.src = URL.createObjectURL(file);
        audio_input.hidden = true;
        let audio_ctx = new window.AudioContext();
        audio.play();

        let audio_media = audio_ctx.createMediaElementSource(audio);
        var audio_analyzer = audio_ctx.createAnalyser();

        audio_media.connect(audio_analyzer);
        audio_analyzer.connect(audio_ctx.destination);

        audio_analyzer.fftSize = 32768;
        var data_array = new Uint8Array(audio_analyzer.frequencyBinCount);

        return [audio_analyzer, data_array]
    })
}

let audio_analyzer, data_array;
let audio = document.querySelector("#audio");
let audio_input = document.querySelector("#song-input");

let returns = setup_audio(audio_input, audio)