// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/O8VsZEwdW/";

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}

const keepPropability = [];
// console.log(keepPropability);
const checkScore = async () => {
    // TO DO --- stop keepPropability from taking duplicates
    
    if (keepPropability.length === 3) {
        return "done with this level";
    } else {
        return "Opps try again!!!";
    }
}

async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    var final = document.querySelector(".level");

    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(async result => {
        const scores = result.scores; // probability of prediction for each class

        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            var classNames = classLabels[i];
            // console.log(classNames);
            var classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);

            // console.log(d === 'Background Noise' && result.scores[i].toFixed(2) > 0.7)

            labelContainer.childNodes[i].innerHTML = classPrediction;
            if (classNames === "greet_in_sotho" && result.scores[i].toFixed(2) > 0.7) {
                keepPropability.push(result.scores[i].toFixed(2));
            } else if (classNames === "greet_in_xhosa" && result.scores[i].toFixed(2) > 0.7) {
                keepPropability.push(result.scores[i].toFixed(2));
            } else if (classNames === "greet_in_venda" && result.scores[i].toFixed(2) > 0.7) {
                keepPropability.push(result.scores[i].toFixed(2));
            }
        }
        
       const checkScores = await checkScore();

        // if (keep.includes(classNames)) {
        //     return "already exists"
        // }
        // else {
        // }
        final.innerHTML = checkScores;

    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });


    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 20000);
}