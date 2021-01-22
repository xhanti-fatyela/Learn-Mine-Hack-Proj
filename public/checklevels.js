// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/Yqd29C8IF/";
// const URL = "https://teachablemachine.withgoogle.com/models/O8VsZEwdW/"
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
/*

greet_in_sotho: 0.03
greet_in_venda: 0.00
greet_in_xhosa: 0.00
have_a_nice_day_sesotho: 0.86
have_a_nice_day_venda: 0.05
have_a_nice_day_xhosa: 0.01
how_are_you_sotho: 0.04
how_are_you_venda: 0.00
how_are_you_xhosa: 0.00

*/
const levelOne = {
    "greet_in_sotho": false,
    "greet_in_venda": false,
    "greet_in_xhosa": false
}

const levelTwo = {
    "have_a_nice_day_sesotho": false,
    "have_a_nice_day_venda": false,
    "have_a_nice_day_xhosa": false
};

const levelThree = {
    "how_are_you_sotho": false,
    "how_are_you_venda": false,
    "how_are_you_xhosa": false
};

const levelsList = [levelOne, levelTwo, levelThree];

let currentLevelIndex = 1;

let currentLevel = levelsList[currentLevelIndex - 1];

let currentScore = 0;

function nextLevel() {

    currentLevelIndex++;
    currentScore = 0;
    currentLevel = levelsList[currentLevelIndex - 1];
    showNextLevel();

}
async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    const scoreElement = document.querySelector(".counter");
    const errorElement = document.querySelector(".error");
    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(async result => {
        const scores = result.scores; // probability of prediction for each class

        const labelsWithScore = classLabels.map(function (className, index) {
            return {
                className,
                score: result.scores[index]
            }
        });

        console.log(labelsWithScore);

        const labelWithHighestScore = labelsWithScore.reduce(function (prev, current) {
            if (prev.score < current.score) {
                return current;
            }
            return prev;
        }, { className: "", score: 0 })

        console.log(labelWithHighestScore);

        if (labelWithHighestScore.score > 0.7 && currentLevel[labelWithHighestScore.className] !== undefined) {

            labelContainer.innerHTML = labelWithHighestScore.className;
            currentScore++;

            scoreElement.innerHTML = currentScore;
            var error = new Audio('/audio/sound.mp3');
            const success = new Audio('/audio/success.mp3');

            errorElement.innerHTML = "Correct!";
            errorElement.classList.add(".success");
            success.play();

            if (currentScore === 3) {
                errorElement.innerHTML = "Congratulations! You have completed this level";
            }

        } else if(labelWithHighestScore.className === "Background Noise" && currentScore < 3){
            errorElement.innerHTML = "Background Noise";
        } else {
            errorElement.innerHTML = "Not A Correct Word!";
        }
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });
    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 20000);
}

// DOM Code
const nextBtn = document.querySelector(".nextBtn");
const levels = document.querySelectorAll(".level");
// TO DO --- hide buttons on last page
// const hideOnlevelFour = document.querySelectorAll(".hideBtn");

var showCounter = 0;

function showNextLevel() {
    if (showCounter >= 4) {
        // TO DO --- hide buttons on last page
        // document.querySelectorAll(".hideBtn").style.display = "none";
        return;
    }

    if (showCounter > 0) {
        levels[showCounter - 1].classList.add("hidden");
    }

    levels[showCounter].classList.remove("hidden");
    showCounter++;
}

nextBtn.addEventListener("click", function () {

    showNextLevel();

});