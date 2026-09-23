let allData = [];
let chart;


/* =========================================
   LOAD DATA JSON
========================================= */

fetch("data/hasil_perbandingan_model.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("File JSON tidak ditemukan");
        }

        return response.json();
    })

    .then(data => {

        console.log("Data JSON:", data);

        allData = data;

        updateSummary();
        displayTable(allData);
        createChart(allData);

    })

    .catch(error => {

        console.error(error);

        document.getElementById("comparisonTable").innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    Gagal memuat data JSON.
                </td>
            </tr>
        `;

    });


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

    // Jumlah eksperimen
    document.getElementById("totalExperiment").textContent =
        allData.length;


    // Jumlah model
    const models = new Set(
        allData.map(item => item["Model"])
    );

    document.getElementById("totalModel").textContent =
        models.size;


    // Jumlah metode
    const metode = new Set(
        allData.map(item => item["PCA"])
    );

    document.getElementById("totalMethod").textContent =
        metode.size;
}


/* =========================================
   FORMAT METRIK
========================================= */

function formatMetric(value) {

    return (Number(value) * 100).toFixed(2) + "%";

}


/* =========================================
   FORMAT WAKTU
========================================= */

function formatTime(value) {

    return Number(value).toFixed(2) + " detik";

}


/* =========================================
   TAMPILKAN TABEL
========================================= */

function displayTable(data) {

    const table =
        document.getElementById("comparisonTable");

    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    Tidak ada data.
                </td>
            </tr>
        `;

        return;
    }


    data.forEach((item, index) => {

        const model = item["Model"];
        const pca = item["PCA"];
        const fitur = item["Fitur"];

        const accuracy = item["Accuracy"];
        const precision = item["Precision"];
        const recall = item["Recall"];
        const f1 = item["F1-Score"];

        const trainingTime =
            item["Waktu Training (detik)"];


        // Class badge model
        let badgeClass = "cnn";

        if (
            model.toLowerCase()
                .includes("random")
        ) {
            badgeClass = "rf";
        }


        // Class PCA
        let pcaClass = "";

        if (pca === "Dengan PCA") {
            pcaClass = "pca";
        }


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <span class="model-badge ${badgeClass}">
                    ${model}
                </span>
            </td>

            <td class="${pcaClass}">
                ${pca}
            </td>

            <td>
                ${formatMetric(accuracy)}
            </td>

            <td>
                ${formatMetric(precision)}
            </td>

            <td>
                ${formatMetric(recall)}
            </td>

            <td>
                ${formatMetric(f1)}
            </td>

            <td>
                ${formatTime(trainingTime)}
            </td>

            <td>
                ${fitur}
            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================
   CHART
========================================= */

function createChart(data) {

    const ctx = document
        .getElementById("performanceChart")
        .getContext("2d");


    const labels = data.map(item => {

        return `${item["Model"]} - ${item["PCA"]}`;

    });


    const accuracy = data.map(item => {

        return item["Accuracy"] * 100;

    });


    const precision = data.map(item => {

        return item["Precision"] * 100;

    });


    const recall = data.map(item => {

        return item["Recall"] * 100;

    });


    const f1 = data.map(item => {

        return item["F1-Score"] * 100;

    });


    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Accuracy",
                    data: accuracy
                },

                {
                    label: "Precision",
                    data: precision
                },

                {
                    label: "Recall",
                    data: recall
                },

                {
                    label: "F1-Score",
                    data: f1
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100,

                    title: {
                        display: true,
                        text: "Nilai (%)"
                    }

                }

            },

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    });

}


/* =========================================
   FILTER MODEL
========================================= */

document
    .getElementById("modelFilter")
    .addEventListener("change", function () {

        const selected = this.value;


        if (selected === "all") {

            displayTable(allData);

            return;

        }


        const filtered = allData.filter(item => {

            return item["Model"] === selected;

        });


        displayTable(filtered);

    });
