// =====================================================
// PPW NEWS ANALYSIS
// DATA FINANCE + SPORT
// =====================================================


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    if (text === null || text === undefined) {
        return "-";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// MENCARI NILAI KOLOM
// =====================================================

function getValue(row, names) {

    for (var i = 0; i < names.length; i++) {

        if (
            row[names[i]] !== undefined &&
            row[names[i]] !== null
        ) {

            return row[names[i]];

        }

    }

    return "";
}


// =====================================================
// MENAMPILKAN ERROR TABEL
// =====================================================

function showTableError(bodyId, message) {

    var tbody =
        document.getElementById(bodyId);

    if (!tbody) {
        return;
    }

    tbody.innerHTML =
        "<tr>" +

        "<td colspan='5' " +
        "style='text-align:center; padding:30px; color:#dc2626;'>" +

        escapeHTML(message) +

        "</td>" +

        "</tr>";
}


// =====================================================
// LOAD PREPROCESSING
// =====================================================

function loadPreprocessing(
    file,
    bodyId
) {

    console.log(
        "Memuat preprocessing:",
        file
    );


    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " +
                    file
                );

            }

            return response.json();

        })


        .then(function(data) {

            console.log(
                "Data preprocessing berhasil:",
                data
            );


            // =============================================
            // CEK FORMAT DATA
            // =============================================

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format JSON preprocessing harus berupa array."
                );

            }


            // =============================================
            // CARI TABEL
            // =============================================

            var tbody =
                document.getElementById(bodyId);


            if (!tbody) {

                throw new Error(
                    "Element HTML tidak ditemukan: " +
                    bodyId
                );

            }


            // =============================================
            // JUMLAH ARTIKEL
            // =============================================

            var jumlahArtikel =
                data.length;


            // =============================================
            // HITUNG KATEGORI
            // =============================================

            var kategoriSet =
                new Set();


            data.forEach(function(row) {

                var kategori =
                    getValue(
                        row,
                        [
                            "kategori",
                            "Kategori",
                            "category",
                            "Category"
                        ]
                    );


                if (kategori) {

                    kategoriSet.add(
                        String(kategori).trim()
                    );

                }

            });


            var daftarKategori =
                Array.from(kategoriSet);


            // =============================================
            // UPDATE DATASET BERITA
            // =============================================

            var datasetArtikel =
                document.getElementById(
                    "datasetArtikel"
                );


            if (datasetArtikel) {

                datasetArtikel.textContent =
                    jumlahArtikel;

            } else {

                console.warn(
                    "ID datasetArtikel tidak ditemukan."
                );

            }


            // =============================================
            // UPDATE KATEGORI DATASET
            // =============================================

            var datasetKategori =
                document.getElementById(
                    "datasetKategori"
                );


            if (datasetKategori) {

                if (daftarKategori.length > 0) {

                    datasetKategori.textContent =
                        daftarKategori.join(" + ");

                } else {

                    datasetKategori.textContent =
                        "-";

                }

            } else {

                console.warn(
                    "ID datasetKategori tidak ditemukan."
                );

            }


            // =============================================
            // UPDATE TOTAL PREPROCESSING
            // =============================================

            var preprocessingTotal =
                document.getElementById(
                    "preprocessingTotal"
                );


            if (preprocessingTotal) {

                preprocessingTotal.textContent =
                    jumlahArtikel;

            } else {

                console.warn(
                    "ID preprocessingTotal tidak ditemukan."
                );

            }


            // =============================================
            // KOSONGKAN TABEL
            // =============================================

            tbody.innerHTML = "";


            // =============================================
            // JIKA DATA KOSONG
            // =============================================

            if (data.length === 0) {

                tbody.innerHTML =

                    "<tr>" +

                    "<td colspan='5' " +
                    "style='text-align:center; padding:30px;'>" +

                    "Data tidak tersedia." +

                    "</td>" +

                    "</tr>";

                return;

            }


            // =============================================
            // TAMPILKAN DATA
            // =============================================

            data.forEach(function(row, index) {


                // -----------------------------------------
                // KATEGORI
                // -----------------------------------------

                var kategori =
                    getValue(
                        row,
                        [
                            "kategori",
                            "Kategori",
                            "category",
                            "Category"
                        ]
                    );


                // -----------------------------------------
                // JUDUL
                // -----------------------------------------

                var judul =
                    getValue(
                        row,
                        [
                            "judul",
                            "Judul",
                            "title",
                            "Title"
                        ]
                    );


                // -----------------------------------------
                // ISI ARTIKEL
                // -----------------------------------------

                var isi =
                    getValue(
                        row,
                        [
                            "isi",
                            "Isi",
                            "teks",
                            "text",
                            "body"
                        ]
                    );


                // -----------------------------------------
                // HASIL PREPROCESSING
                // -----------------------------------------

                var preprocessing =
                    getValue(
                        row,
                        [
                            "teks_preprocessing",
                            "hasil_preprocessing",
                            "preprocessing",
                            "text_preprocessing"
                        ]
                    );


                // -----------------------------------------
                // BUAT BARIS
                // -----------------------------------------

                var tr =
                    document.createElement("tr");


                tr.innerHTML =

                    "<td>" +
                    (index + 1) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        kategori || "-"
                    ) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        judul || "-"
                    ) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        isi || "-"
                    ) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        preprocessing || "-"
                    ) +
                    "</td>";


                tbody.appendChild(tr);

            });


            // =============================================
            // LOG
            // =============================================

            console.log(
                "===================================="
            );

            console.log(
                "PREPROCESSING BERHASIL"
            );

            console.log(
                "Jumlah artikel:",
                jumlahArtikel
            );

            console.log(
                "Kategori:",
                daftarKategori
            );

            console.log(
                "===================================="
            );

        })


        .catch(function(error) {

            console.error(
                "ERROR PREPROCESSING:",
                error
            );


            showTableError(
                bodyId,
                "Gagal memuat data: " +
                error.message
            );

        });

}


// =====================================================
// JALANKAN PREPROCESSING
// =====================================================

loadPreprocessing(
    "data/hasil_preprocessing_detik_finance_sport.json",
    "preprocessingBody"
);



// =====================================================
// LOAD TF-IDF
// =====================================================

function loadTfidf(
    file,
    jumlahArtikelId,
    jumlahKataId,
    dimensiId,
    bodyId
) {

    console.log(
        "Memuat TF-IDF:",
        file
    );


    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " +
                    file
                );

            }

            return response.json();

        })


        .then(function(data) {

            console.log(
                "Data TF-IDF berhasil:",
                data
            );


            // =============================================
            // CEK FORMAT
            // =============================================

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format JSON TF-IDF harus berupa array."
                );

            }


            if (data.length === 0) {

                throw new Error(
                    "Data TF-IDF kosong."
                );

            }


            // =============================================
            // AMBIL SEMUA KOLOM
            // =============================================

            var semuaKolom =
                Object.keys(data[0]);


            console.log(
                "Kolom TF-IDF:",
                semuaKolom
            );


            // =============================================
            // KOLOM YANG BUKAN TF-IDF
            // =============================================

            var kolomNonTfidf = [

                "judul",
                "Judul",

                "url",
                "URL",

                "kategori",
                "Kategori",

                "category",
                "Category",

                "id",
                "ID",

                "no",
                "No",

                "index",

                "isi",
                "Isi",

                "teks_preprocessing",
                "hasil_preprocessing",
                "preprocessing",

                "text_preprocessing"

            ];


            // =============================================
            // AMBIL KOLOM TF-IDF
            // =============================================

            var kataKolom =
                semuaKolom.filter(
                    function(kolom) {

                        return !kolomNonTfidf.includes(
                            kolom
                        );

                    }
                );


            // =============================================
            // STATISTIK
            // =============================================

            var jumlahArtikel =
                data.length;


            var jumlahKata =
                kataKolom.length;


            // =============================================
            // ELEMENT HTML
            // =============================================

            var artikelElement =
                document.getElementById(
                    jumlahArtikelId
                );


            var kataElement =
                document.getElementById(
                    jumlahKataId
                );


            var dimensiElement =
                document.getElementById(
                    dimensiId
                );


            // =============================================
            // JUMLAH ARTIKEL
            // =============================================

            if (artikelElement) {

                artikelElement.textContent =
                    jumlahArtikel;

            }


            // =============================================
            // JUMLAH KATA
            // =============================================

            if (kataElement) {

                kataElement.textContent =
                    jumlahKata;

            }


            // =============================================
            // DIMENSI
            // =============================================

            if (dimensiElement) {

                dimensiElement.textContent =
                    jumlahArtikel +
                    " × " +
                    jumlahKata;

            }


            // =============================================
            // CARI NILAI TF-IDF TERTINGGI
            // =============================================

            var daftarKata = [];


            kataKolom.forEach(
                function(kata) {

                    var nilaiMaksimum = 0;


                    data.forEach(
                        function(row) {

                            var nilai =
                                Number(
                                    row[kata]
                                );


                            if (
                                Number.isFinite(nilai) &&
                                nilai > nilaiMaksimum
                            ) {

                                nilaiMaksimum =
                                    nilai;

                            }

                        }
                    );


                    if (nilaiMaksimum > 0) {

                        daftarKata.push({

                            kata: kata,

                            nilai: nilaiMaksimum

                        });

                    }

                }
            );


            // =============================================
            // URUTKAN
            // =============================================

            daftarKata.sort(
                function(a, b) {

                    return b.nilai - a.nilai;

                }
            );


            // =============================================
            // AMBIL 30 KATA TERATAS
            // =============================================

            var topKata =
                daftarKata.slice(
                    0,
                    30
                );


            // =============================================
            // TABEL
            // =============================================

            var tbody =
                document.getElementById(
                    bodyId
                );


            if (!tbody) {

                throw new Error(
                    "Element HTML tidak ditemukan: " +
                    bodyId
                );

            }


            tbody.innerHTML = "";


            // =============================================
            // TAMPILKAN
            // =============================================

            topKata.forEach(
                function(item, index) {

                    var tr =
                        document.createElement(
                            "tr"
                        );


                    tr.innerHTML =

                        "<td>" +
                        (index + 1) +
                        "</td>" +

                        "<td>" +
                        escapeHTML(
                            item.kata
                        ) +
                        "</td>" +

                        "<td>" +
                        item.nilai.toFixed(4) +
                        "</td>";


                    tbody.appendChild(tr);

                }
            );


            // =============================================
            // TIDAK ADA KATA
            // =============================================

            if (topKata.length === 0) {

                tbody.innerHTML =

                    "<tr>" +

                    "<td colspan='3' " +
                    "style='text-align:center; padding:30px;'>" +

                    "Tidak ditemukan nilai TF-IDF." +

                    "</td>" +

                    "</tr>";

            }


            console.log(
                "===================================="
            );

            console.log(
                "TF-IDF BERHASIL"
            );

            console.log(
                "Jumlah artikel:",
                jumlahArtikel
            );

            console.log(
                "Jumlah kata:",
                jumlahKata
            );

            console.log(
                "Dimensi:",
                jumlahArtikel +
                " × " +
                jumlahKata
            );

            console.log(
                "===================================="
            );

        })


        .catch(function(error) {

            console.error(
                "ERROR TF-IDF:",
                error
            );


            var tbody =
                document.getElementById(
                    bodyId
                );


            if (tbody) {

                tbody.innerHTML =

                    "<tr>" +

                    "<td colspan='3' " +
                    "style='text-align:center; padding:30px; color:#dc2626;'>" +

                    "Gagal memuat TF-IDF:<br>" +

                    escapeHTML(
                        error.message
                    ) +

                    "</td>" +

                    "</tr>";

            }

        });

}


// =====================================================
// JALANKAN TF-IDF
// =====================================================

loadTfidf(
    "data/hasil_tfidf_detik_finance_sport.json",
    "jumlahArtikel",
    "jumlahKata",
    "dimensiTfidf",
    "tfidfBody"
);



// =====================================================
// LOAD PCA
// =====================================================

function loadPca(
    file,
    chartId,
    dimensiId
) {

    console.log(
        "Memuat PCA:",
        file
    );


    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " +
                    file
                );

            }

            return response.json();

        })


        .then(function(data) {

            console.log(
                "Data PCA berhasil:",
                data
            );


            // =============================================
            // CEK FORMAT
            // =============================================

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format JSON PCA harus berupa array."
                );

            }


            if (data.length === 0) {

                throw new Error(
                    "Data PCA kosong."
                );

            }


            console.log(
                "Kolom PCA:",
                Object.keys(data[0])
            );


            // =============================================
            // DATA TITIK PCA
            // =============================================

            var titik = [];


            data.forEach(
                function(row, index) {

                    var pc1 =
                        Number(
                            getValue(
                                row,
                                [
                                    "PC1",
                                    "pc1",
                                    "PCA1",
                                    "pca1",
                                    "principal_component_1"
                                ]
                            )
                        );


                    var pc2 =
                        Number(
                            getValue(
                                row,
                                [
                                    "PC2",
                                    "pc2",
                                    "PCA2",
                                    "pca2",
                                    "principal_component_2"
                                ]
                            )
                        );


                    if (
                        Number.isFinite(pc1) &&
                        Number.isFinite(pc2)
                    ) {

                        titik.push({

                            index:
                                index + 1,

                            pc1:
                                pc1,

                            pc2:
                                pc2,

                            judul:
                                getValue(
                                    row,
                                    [
                                        "judul",
                                        "Judul",
                                        "title",
                                        "Title"
                                    ]
                                ) ||
                                "Artikel " +
                                (index + 1),

                            kategori:
                                getValue(
                                    row,
                                    [
                                        "kategori",
                                        "Kategori",
                                        "category",
                                        "Category"
                                    ]
                                ) ||
                                "Tidak diketahui",

                            url:
                                getValue(
                                    row,
                                    [
                                        "url",
                                        "URL",
                                        "link"
                                    ]
                                ) ||
                                "#"

                        });

                    }

                }
            );


            console.log(
                "Jumlah titik PCA valid:",
                titik.length
            );


            // =============================================
            // DIMENSI PCA
            // =============================================

            var dimensiAwal =
                document.getElementById(
                    dimensiId
                );


            if (dimensiAwal) {

                dimensiAwal.textContent =
                    data.length +
                    " × " +
                    Object.keys(
                        data[0]
                    ).length;

            }


            // =============================================
            // CHART
            // =============================================

            var chartArea =
                document.getElementById(
                    chartId
                );


            if (!chartArea) {

                throw new Error(
                    "Chart tidak ditemukan: " +
                    chartId
                );

            }


            chartArea.innerHTML = "";


            // =============================================
            // DATA PCA TIDAK VALID
            // =============================================

            if (titik.length === 0) {

                chartArea.innerHTML =

                    "<div class='pca-error'>" +

                    "<strong>" +
                    "Data PCA tidak dapat ditampilkan." +
                    "</strong>" +

                    "<br><br>" +

                    "Kolom PC1 dan PC2 tidak ditemukan." +

                    "<br><br>" +

                    "Kolom yang tersedia: " +

                    escapeHTML(
                        Object.keys(
                            data[0]
                        ).join(", ")
                    ) +

                    "</div>";

                return;

            }


            // =============================================
            // MIN / MAX
            // =============================================

            var nilaiPC1 =
                titik.map(
                    function(item) {

                        return item.pc1;

                    }
                );


            var nilaiPC2 =
                titik.map(
                    function(item) {

                        return item.pc2;

                    }
                );


            var minX =
                Math.min.apply(
                    null,
                    nilaiPC1
                );


            var maxX =
                Math.max.apply(
                    null,
                    nilaiPC1
                );


            var minY =
                Math.min.apply(
                    null,
                    nilaiPC2
                );


            var maxY =
                Math.max.apply(
                    null,
                    nilaiPC2
                );


            if (minX === maxX) {

                minX -= 1;
                maxX += 1;

            }


            if (minY === maxY) {

                minY -= 1;
                maxY += 1;

            }


            // =============================================
            // WARNA KATEGORI
            // =============================================

            var warnaKategori = {

                "Finance":
                    "#2563eb",

                "Sport":
                    "#dc2626"

            };


            // =============================================
            // BUAT TITIK PCA
            // =============================================

            titik.forEach(
                function(item) {

                    var x =

                        5 +

                        (
                            (
                                item.pc1 -
                                minX
                            ) /
                            (
                                maxX -
                                minX
                            )
                        ) *
                        90;


                    var y =

                        95 -

                        (
                            (
                                item.pc2 -
                                minY
                            ) /
                            (
                                maxY -
                                minY
                            )
                        ) *
                        90;


                    var point =
                        document.createElement(
                            "div"
                        );


                    point.className =
                        "pca-point";


                    // =====================================
                    // KATEGORI
                    // =====================================

                    var kategori =
                        String(
                            item.kategori
                        ).trim();


                    var warna =
                        warnaKategori[
                            kategori
                        ];


                    if (!warna) {

                        warna =
                            "#64748b";

                    }


                    point.style.background =
                        warna;


                    // =====================================
                    // POSISI
                    // =====================================

                    point.style.left =
                        x + "%";


                    point.style.top =
                        y + "%";


                    // =====================================
                    // TOOLTIP
                    // =====================================

                    point.title =

                        item.judul +

                        "\n\nKategori: " +

                        item.kategori +

                        "\nPC1: " +

                        item.pc1.toFixed(4) +

                        "\nPC2: " +

                        item.pc2.toFixed(4);


                    // =====================================
                    // KLIK ARTIKEL
                    // =====================================

                    point.addEventListener(
                        "click",
                        function() {

                            if (
                                item.url &&
                                item.url !== "#"
                            ) {

                                window.open(
                                    item.url,
                                    "_blank"
                                );

                            }

                        }
                    );


                    chartArea.appendChild(
                        point
                    );

                }
            );


            // =============================================
            // JUMLAH TITIK
            // =============================================

            var jumlahTitik =
                document.createElement(
                    "div"
                );


            jumlahTitik.className =
                "chart-count";


            jumlahTitik.textContent =
                titik.length +
                " artikel";


            chartArea.appendChild(
                jumlahTitik
            );


            // =============================================
            // LEGEND
            // =============================================

            var legend =
                document.getElementById(
                    "pcaLegend"
                );


            if (legend) {

                legend.innerHTML = "";


                Object.keys(
                    warnaKategori
                ).forEach(
                    function(kategori) {

                        var span =
                            document.createElement(
                                "span"
                            );


                        var dot =
                            document.createElement(
                                "i"
                            );


                        dot.className =
                            "dot";


                        dot.style.background =
                            warnaKategori[
                                kategori
                            ];


                        span.appendChild(
                            dot
                        );


                        span.appendChild(
                            document.createTextNode(
                                kategori
                            )
                        );


                        legend.appendChild(
                            span
                        );

                    }
                );

            }


            console.log(
                "===================================="
            );

            console.log(
                "PCA BERHASIL"
            );

            console.log(
                "Jumlah titik:",
                titik.length
            );

            console.log(
                "===================================="
            );

        })


        .catch(function(error) {

            console.error(
                "ERROR PCA:",
                error
            );


            var chartArea =
                document.getElementById(
                    chartId
                );


            if (chartArea) {

                chartArea.innerHTML =

                    "<div class='pca-error'>" +

                    "<strong>" +
                    "Gagal memuat data PCA." +
                    "</strong>" +

                    "<br><br>" +

                    escapeHTML(
                        error.message
                    ) +

                    "</div>";

            }

        });

}


// =====================================================
// JALANKAN PCA
// =====================================================

loadPca(
    "data/hasil_pca_detik_finance_sport.json",
    "pcaChartArea",
    "pcaDimensiAwal"
);



// =====================================================
// INFORMASI DATASET
// =====================================================

console.log(
    "======================================"
);

console.log(
    "PPW NEWS ANALYSIS"
);

console.log(
    "Dataset: Detik Finance + Detik Sport"
);

console.log(
    "Target: 200 artikel"
);

console.log(
    "======================================"
);