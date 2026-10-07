
/*to be added for future use
- the now has ut-vt generator features only maybe adding aut report also 
- the abilty to upload an excel file and generate the report from it
- screens to generate the report from the excel file
-----*/

const DEFAULT_JOINTS = 2;

let jointCounter = 0;



const jointsContainer =
    document.getElementById("jointsContainer");


const addJointBtn =
    document.getElementById("addJointBtn");

const jointCount =
    document.getElementById("jointCount");

const summaryJoints =
    document.getElementById("summaryJoints");

const summaryAccepted =
    document.getElementById("summaryAccepted");

const summaryRejected =
    document.getElementById("summaryRejected");


const generateBtn =
    document.getElementById("generateBtn");

const clearBtn =
    document.getElementById("clearBtn");


function createJoint() {

    jointCounter++;

    const card = document.createElement("div");

    card.className = "joint-card";

    card.dataset.jointId = jointCounter;


    card.innerHTML = `

        <div class="joint-card-header">

            <div class="joint-title">

                <span class="joint-index">
                    ${jointCounter.toString().padStart(2, "0")}
                </span>

                <strong>
                    Joint Inspection
                </strong>

            </div>


            <button
                type="button"
                class="remove-joint"
                title="Remove joint"
            >
                ×
            </button>

        </div>


        <div class="joint-fields">


            <!-- JOINT NUMBER -->

            <div class="joint-field">

                <label>Joint N°</label>

                <input
                    class="joint-input joint-number"
                    type="text"
                    placeholder="J-001"
                >

            </div>


            <!-- LENGTH -->

            <div class="joint-field">

                <label>Length</label>

                <input
                    class="joint-input length"
                    type="number"
                    step="0.01"
                    placeholder="mm"
                >

            </div>


            <!-- DEPTH -->

            <div class="joint-field">

                <label>Depth</label>

                <input
                    class="joint-input depth"
                    type="number"
                    step="0.01"
                    placeholder="mm"
                >

            </div>

            <!-- RESULT -->

            <div class="joint-field">

                <label>Result</label>

                <select class="joint-input result result-select">

                    <option value="C">
                        Accepted
                    </option>

                    <option value="NC">
                        Rejected
                    </option>

                </select>

            </div>

        </div>
    `;


    /* Add card */

    jointsContainer.appendChild(card);


    /* Remove button */

    const removeButton =
        card.querySelector(".remove-joint");

    removeButton.addEventListener(
        "click",
        () => removeJoint(card)
    );


    /* Automatically update data */

    card.querySelectorAll("input, select")
        .forEach(input => {

            input.addEventListener(
                "input",
                updateEverything
            );

            input.addEventListener(
                "change",
                updateEverything
            );

        });


    updateEverything();
}



function removeJoint(card) {

    const cards =
        jointsContainer.querySelectorAll(".joint-card");

    if (cards.length <= 1) {

        alert("At least one joint is required.");

        return;
    }


    card.remove();


    renumberJoints();

    updateEverything();
}


/* =========================================================
   RENUMBER JOINTS
========================================================= */

function renumberJoints() {

    const cards =
        jointsContainer.querySelectorAll(".joint-card");


    cards.forEach((card, index) => {

        const number =
            index + 1;

        card.querySelector(".joint-index")
            .textContent =
            number.toString().padStart(2, "0");

    });

}


/* =========================================================
   GET JOINT DATA
========================================================= */

function getJointData(card,index) {
    
    const jointph=`{{joint${index+1}}}`;
    const lenghtph=`{{l${index+1}}}`;
    const depthph=`{{d${index+1}}}`;
    const resultph=`{{r${index+1}}}`;

    return {

        
        [jointph]:
            card.querySelector(".joint-number").value.trim(),


        [lenghtph]:
            card.querySelector(".length").value!==""?card.querySelector(".length").value:"-",

        [depthph]:
            card.querySelector(".depth").value!==""?card.querySelector(".depth").value:"-",

        [resultph]:
            card.querySelector(".result").value

    };

}


//GET COMPLETE REPORT DATA
   

function getReportData() {

    const cards =
        jointsContainer.querySelectorAll(".joint-card");


    const joints = [];


    cards.forEach((card, index) => {

        joints.push(
            getJointData(card, index)
        );

    });


    const report = {

            '{{utreportn°}}':
                document
                    .getElementById("utReportNumber")
                    .value.trim(),
            '{{vtreportn°}}':
                document
                    .getElementById("vtReportNumber")
                    .value.trim(),
            '{{date}}':
                document
                    .getElementById("reportDate")
                    .value,

            '{{utinspector}}':
                document
                    .getElementById("utinspector")
                    .value,
            '{{vtinspector}}':
                document
                    .getElementById("vtinspector")
                    .value,

            '{{stamp}}':
                document
                    .getElementById("stamp")
                    .value,
     

        };

    return  Object.assign({}, report, ...joints);
    };



function updateSummary() {

    const cards =
        jointsContainer.querySelectorAll(".joint-card");


    let accepted = 0;
    let rejected = 0;



    cards.forEach(card => {

        const result =
            card.querySelector(".result").value;

        if (result === "C") {
            accepted++;
        }

        if (result === "NC") {
            rejected++;
        }

    });


    const total = cards.length;


    jointCount.textContent = total;

    summaryJoints.textContent = total;

    summaryAccepted.textContent = accepted;

    summaryRejected.textContent = rejected;

}



/* == UPDATE EVERYTHING == */

function updateEverything() {

    updateSummary();

}

/* == ADD JOINT BUTTON == */

addJointBtn.addEventListener(
    "click",
    createJoint
);


/* ==REPORT INFO LISTENERS== */

document
    .querySelectorAll(
        "#report-info input, #report-info select"
    )
    .forEach(input => {

        input.addEventListener(
            "input",
            updateEverything
        );

        input.addEventListener(
            "change",
            updateEverything
        );

    });

/* =========================================================
   GENERATE REPORT
========================================================= */

const API_URL = "https://abdelazizelasri.pythonanywhere.com";

generateBtn.addEventListener("click", async () => {

    const jointInputs = jointsContainer.querySelectorAll(".joint-number");

    for (const joint of jointInputs) {
    if (joint.value.trim() === "") {
        alert("Please fill in all joint numbers before generating the report.");
        joint.focus(); // Focuses the empty input field for the user
        return; // Stops execution of the outer function
    }
    }
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span>Generating...</span>`;

    const utoutput = document.getElementById("utReportNumber").value;

    const vtoutput = document.getElementById("vtReportNumber").value;

    try {
        const data = getReportData();
        const outputnames = [`${vtoutput}.docx`, `${utoutput}.docx`];
        const count=Number(jointCounter);
        const response = await fetch( `${API_URL}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, count, outputnames })
        });

        if (!response.ok) {
            let errorMessage = "Generation failed. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (_) {}
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = "reports.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        alert(error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<span>Generate Report</span> <span class="arrow">→</span>`;
    }
});

/* at startup */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        for ( let i = 0; i < DEFAULT_JOINTS; i++ ) { createJoint();}

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        document
            .getElementById("reportDate")
            .value = today;


        updateEverything();

    }
);


// check connection status

async function checkBackend() {
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");

    try {
        const response = await fetch(`${API_URL}/`);
        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const data = await response.json();

        // Check payload content
        if (data.status === "ok" || data.status === "Backend is running!") {
            statusDot.style.backgroundColor = "#77ffeb"; // Green
            if (statusText) statusText.textContent = "connected";
        } else {
            throw new Error("Unexpected response content");
        }

    } catch (error) {
        statusDot.style.backgroundColor = "#ff0000"; // Red
        if (statusText) statusText.textContent = "Server not connected";
        console.error("Health check failed:", error.message);

    }
}

setInterval(checkBackend, 1000);
