// ======================================================
// VARIABEL GLOBAL
// ======================================================

let berita = [];
let evaluasi = {};
let matrixChart = null;


// ======================================================
// MEMBACA DATA JSON
// ======================================================

async function loadData() {

    try {

        console.log("Mulai membaca file JSON...");

        // Lokasi file sesuai struktur folder:
        // tugas_4/
        // ├── script.js
        // └── hasil/
        //     ├── hasil_klasifikasi.json
        //     └── hasil_evaluasi.json

        const [beritaResponse, evaluasiResponse] = await Promise.all([
            fetch("./hasil/hasil_klasifikasi.json"),
            fetch("./hasil/hasil_evaluasi.json")
        ]);


        // ==================================================
        // CEK FILE HASIL KLASIFIKASI
        // ==================================================

        if (!beritaResponse.ok) {
            throw new Error(
                "File hasil_klasifikasi.json tidak ditemukan. " +
                "Status: " + beritaResponse.status
            );
        }


        // ==================================================
        // CEK FILE HASIL EVALUASI
        // ==================================================

        if (!evaluasiResponse.ok) {
            throw new Error(
                "File hasil_evaluasi.json tidak ditemukan. " +
                "Status: " + evaluasiResponse.status
            );
        }


        // ==================================================
        // MEMBACA ISI JSON
        // ==================================================

        berita = await beritaResponse.json();
        evaluasi = await evaluasiResponse.json();


        console.log("Data berita berhasil dibaca:", berita);
        console.log("Data evaluasi berhasil dibaca:", evaluasi);


        // ==================================================
        // VALIDASI DATA
        // ==================================================

        if (!Array.isArray(berita)) {
            throw new Error(
                "Format hasil_klasifikasi.json tidak sesuai. " +
                "Data harus berupa array."
            );
        }


        if (!evaluasi || typeof evaluasi !== "object") {
            throw new Error(
                "Format hasil_evaluasi.json tidak sesuai."
            );
        }


        // ==================================================
        // TAMPILKAN DATA
        // ==================================================

        tampilkanDashboard();

        tampilkanEvaluasi();

        tampilkanBerita(berita);


    } catch (error) {

        console.error("ERROR:", error);

        const totalElement = document.getElementById("total");

        if (totalElement) {
            totalElement.textContent = "Error";
        }


        alert(
            "Gagal membaca hasil.\n\n" +
            error.message +
            "\n\n" +
            "Pastikan:\n" +
            "1. File JSON berada di folder hasil.\n" +
            "2. Nama file sudah benar.\n" +
            "3. Website dijalankan menggunakan Live Server."
        );
    }
}



// ======================================================
// DASHBOARD
// ======================================================

function tampilkanDashboard() {

    document.getElementById("total").textContent =
        evaluasi.total_data ?? "-";


    document.getElementById("training").textContent =
        evaluasi.data_training ?? "-";


    document.getElementById("testing").textContent =
        evaluasi.data_testing ?? "-";


    // Menampilkan akurasi
    if (evaluasi.akurasi !== undefined) {

        document.getElementById("akurasi").textContent =
            (Number(evaluasi.akurasi) * 100).toFixed(2) + "%";

    } else {

        document.getElementById("akurasi").textContent = "-";

    }


    // Menampilkan dimensi vektor
    document.getElementById("dimensi").textContent =
        "Dimensi vektor Skip-Gram: " +
        (evaluasi.dimensi_vektor ?? "-");
}



// ======================================================
// EVALUASI MODEL
// ======================================================

function tampilkanEvaluasi() {

    const report = document.getElementById("report");

    const labels = evaluasi.kategori || [];

    const dataReport =
        evaluasi.classification_report || {};


    // Bersihkan tabel
    report.innerHTML = "";


    // ==================================================
    // CLASSIFICATION REPORT
    // ==================================================

    labels.forEach(kategori => {

        const nilai = dataReport[kategori];

        if (!nilai) {
            return;
        }


        const row = document.createElement("tr");


        // Kategori
        const tdKategori = document.createElement("td");

        tdKategori.textContent = kategori;

        row.appendChild(tdKategori);


        // Precision
        const tdPrecision = document.createElement("td");

        tdPrecision.textContent =
            (Number(nilai.precision) * 100).toFixed(2) + "%";

        row.appendChild(tdPrecision);


        // Recall
        const tdRecall = document.createElement("td");

        tdRecall.textContent =
            (Number(nilai.recall) * 100).toFixed(2) + "%";

        row.appendChild(tdRecall);


        // F1 Score
        const tdF1 = document.createElement("td");

        tdF1.textContent =
            (Number(nilai["f1-score"]) * 100).toFixed(2) + "%";

        row.appendChild(tdF1);


        report.appendChild(row);

    });



    // ==================================================
    // CONFUSION MATRIX
    // ==================================================

    const matrix =
        evaluasi.confusion_matrix || [];


    const matrixTable =
        document.getElementById("matrixTable");


    let html = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Aktual / Prediksi</th>
    `;


    // Header kategori
    labels.forEach(label => {

        html += `
            <th>${escapeHTML(label)}</th>
        `;

    });


    html += `
                </tr>
            </thead>
            <tbody>
    `;


    // Isi confusion matrix
    matrix.forEach((row, i) => {

        html += `
            <tr>
                <th>${escapeHTML(labels[i] ?? "-")}</th>
        `;


        row.forEach(value => {

            html += `
                <td>${value}</td>
            `;

        });


        html += `
            </tr>
        `;

    });


    html += `
            </tbody>
            </table>
        </div>
    `;


    matrixTable.innerHTML = html;



    // ==================================================
    // GRAFIK CONFUSION MATRIX
    // ==================================================

    const canvas =
        document.getElementById("matrixChart");


    if (!canvas) {
        return;
    }


    const datasets = labels.map((label, j) => {

        return {

            label: label,

            data: matrix.map(row => row[j] ?? 0)

        };

    });


    // Jika chart sebelumnya sudah ada,
    // hapus terlebih dahulu
    if (matrixChart !== null) {

        matrixChart.destroy();

    }


    matrixChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: datasets

        },


        options: {

            responsive: true,

            maintainAspectRatio: true,


            plugins: {

                title: {

                    display: true,

                    text: "Hasil Confusion Matrix"

                },

                legend: {

                    display: true

                }

            },


            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}



// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value).replace(
        /[&<>"']/g,

        char => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        })[char]

    );

}



// ======================================================
// MENAMPILKAN HASIL KLASIFIKASI BERITA
// ======================================================

function tampilkanBerita(data) {

    const table =
        document.getElementById("newsTable");


    table.innerHTML = "";


    // Jika tidak ada data
    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Data tidak ditemukan.
                </td>
            </tr>
        `;

        document.getElementById("count").textContent =
            "Tidak ada data.";

        return;
    }


    // ==================================================
    // MEMBUAT BARIS DATA
    // ==================================================

    data.forEach((item, index) => {


        // Membandingkan kategori aktual
        // dengan kategori hasil prediksi

        const cocok =
            String(item.kategori_aktual) ===
            String(item.kategori_prediksi);


        const row =
            document.createElement("tr");


        // ==================================================
        // NOMOR
        // ==================================================

        const tdNo =
            document.createElement("td");

        tdNo.textContent =
            index + 1;

        row.appendChild(tdNo);


        // ==================================================
        // BERITA
        // ==================================================

        const tdBerita =
            document.createElement("td");

        tdBerita.textContent =
            item.berita ?? "-";

        row.appendChild(tdBerita);


        // ==================================================
        // KATEGORI AKTUAL
        // ==================================================

        const tdAktual =
            document.createElement("td");

        tdAktual.textContent =
            item.kategori_aktual ?? "-";

        row.appendChild(tdAktual);


        // ==================================================
        // KATEGORI PREDIKSI
        // ==================================================

        const tdPrediksi =
            document.createElement("td");

        tdPrediksi.textContent =
            item.kategori_prediksi ?? "-";

        row.appendChild(tdPrediksi);


        // ==================================================
        // STATUS
        // ==================================================

        const tdStatus =
            document.createElement("td");


        if (cocok) {

            tdStatus.textContent =
                "Sesuai";

            tdStatus.className =
                "result";

        } else {

            tdStatus.textContent =
                "Tidak Sesuai";

            tdStatus.className =
                "wrong";

        }


        row.appendChild(tdStatus);


        // Masukkan baris ke tabel
        table.appendChild(row);

    });


    // ==================================================
    // JUMLAH DATA
    // ==================================================

    document.getElementById("count").textContent =
        "Menampilkan " +
        data.length +
        " berita dari data testing.";

}



// ======================================================
// SEARCH / PENCARIAN BERITA
// ======================================================

const searchElement =
    document.getElementById("search");


if (searchElement) {

    searchElement.addEventListener(
        "input",
        function () {


            const keyword =
                this.value.toLowerCase().trim();


            // Jika kosong,
            // tampilkan semua data

            if (keyword === "") {

                tampilkanBerita(berita);

                return;

            }


            // Filter berita
            const filtered =
                berita.filter(item => {


                    const teksBerita =
                        String(item.berita ?? "")
                        .toLowerCase();


                    const kategoriAktual =
                        String(item.kategori_aktual ?? "")
                        .toLowerCase();


                    const kategoriPrediksi =
                        String(item.kategori_prediksi ?? "")
                        .toLowerCase();


                    return (
                        teksBerita.includes(keyword) ||
                        kategoriAktual.includes(keyword) ||
                        kategoriPrediksi.includes(keyword)
                    );

                });


            tampilkanBerita(filtered);

        }
    );

}



// ======================================================
// JALANKAN PROGRAM
// ======================================================

loadData();
