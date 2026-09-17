// =====================================================
// PPW NEWS ANALYSIS
// SCRIPT DATA SPORT & FINANCE
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
// MENCARI NILAI DARI BEBERAPA KEMUNGKINAN NAMA KOLOM
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
// MENAMPILKAN PESAN ERROR DI TABEL
// =====================================================

function showTableError(bodyId, message) {

    var tbody = document.getElementById(bodyId);

    if (!tbody) {
        return;
    }

    tbody.innerHTML =
        "<tr>" +
        "<td colspan='4' style='text-align:center; padding:30px; color:#dc2626;'>" +
        escapeHTML(message) +
        "</td>" +
        "</tr>";
}


// =====================================================
// LOAD PREPROCESSING
// =====================================================

function loadPreprocessing(file, bodyId, artikelId, kategoriId) {

    console.log("Memuat preprocessing:", file);

    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " + file
                );

            }

            return response.json();

        })

        .then(function(data) {

            console.log(
                "Data preprocessing berhasil:",
                file,
                data
            );

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format JSON preprocessing harus berupa array."
                );

            }

            var tbody =
                document.getElementById(bodyId);

            if (!tbody) {

                throw new Error(
                    "Element HTML tidak ditemukan: " +
                    bodyId
                );

            }

            tbody.innerHTML = "";


            // =============================================
            // JIKA DATA KOSONG
            // =============================================

            if (data.length === 0) {

                tbody.innerHTML =
                    "<tr>" +
                    "<td colspan='4' style='text-align:center; padding:30px;'>" +
                    "Data tidak tersedia." +
                    "</td>" +
                    "</tr>";

                return;

            }


            // =============================================
            // TAMPILKAN DATA
            // =============================================

            data.forEach(function(row, index) {

                var judul = getValue(
                    row,
                    [
                        "judul",
                        "Judul",
                        "title",
                        "Title"
                    ]
                );

                var isi = getValue(
                    row,
                    [
                        "isi",
                        "Isi",
                        "teks",
                        "text",
                        "body"
                    ]
                );

                var preprocessing = getValue(
                    row,
                    [
                        "teks_preprocessing",
                        "hasil_preprocessing",
                        "preprocessing",
                        "text_preprocessing"
                    ]
                );


                var tr =
                    document.createElement("tr");


                tr.innerHTML =

                    "<td>" +
                    (index + 1) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(judul || "-") +
                    "</td>" +

                    "<td>" +
                    escapeHTML(isi || "-") +
                    "</td>" +

                    "<td>" +
                    escapeHTML(preprocessing || "-") +
                    "</td>";


                tbody.appendChild(tr);

            });


            // =============================================
            // JUMLAH ARTIKEL
            // =============================================

            var artikel =
                document.getElementById(artikelId);

            if (artikel) {

                artikel.textContent =
                    data.length;

            }


            // =============================================
            // JUMLAH KATEGORI
            // =============================================

            if (kategoriId) {

                var kategoriElement =
                    document.getElementById(kategoriId);

                if (kategoriElement) {

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
                                String(kategori)
                            );

                        }

                    });


                    if (kategoriSet.size > 0) {

                        kategoriElement.textContent =
                            kategoriSet.size;

                    } else {

                        kategoriElement.textContent =
                            "-";

                    }

                }

            }

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
// PREPROCESSING SPORT
// =====================================================

loadPreprocessing(
    "data/hasil_preprocessing_detik_sport.json",
    "sportPreprocessingBody",
    "sportDatasetArtikel",
    "sportDatasetKategori"
);


// =====================================================
// PREPROCESSING FINANCE
// =====================================================

loadPreprocessing(
    "data/hasil_preprocessing_detik_finance.json",
    "financePreprocessingBody",
    "financeDatasetArtikel",
    "financeDatasetKategori"
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

    console.log("Memuat TF-IDF:", file);


    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " + file
                );

            }

            return response.json();

        })

        .then(function(data) {

            console.log(
                "Data TF-IDF berhasil:",
                file,
                data
            );


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
            // DAFTAR KOLOM
            // =============================================

            var semuaKolom =
                Object.keys(data[0]);

            console.log(
                "Kolom TF-IDF:",
                semuaKolom
            );


            // =============================================
            // BUANG KOLOM NON-TFIDF
            // =============================================

            var kataKolom =
                semuaKolom.filter(function(kolom) {

                    var nama =
                        String(kolom).toLowerCase();

                    return (
                        nama !== "judul" &&
                        nama !== "url" &&
                        nama !== "kategori" &&
                        nama !== "category" &&
                        nama !== "id" &&
                        nama !== "no" &&
                        nama !== "index"
                    );

                });


            // =============================================
            // STATISTIK
            // =============================================

            var jumlahArtikel =
                data.length;

            var jumlahKata =
                kataKolom.length;


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


            if (artikelElement) {

                artikelElement.textContent =
                    jumlahArtikel;

            }


            if (kataElement) {

                kataElement.textContent =
                    jumlahKata;

            }


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


            kataKolom.forEach(function(kata) {

                var nilaiMaksimum = 0;


                data.forEach(function(row) {

                    var nilai =
                        Number(row[kata]);


                    if (
                        Number.isFinite(nilai) &&
                        nilai > nilaiMaksimum
                    ) {

                        nilaiMaksimum =
                            nilai;

                    }

                });


                if (nilaiMaksimum > 0) {

                    daftarKata.push({

                        kata: kata,

                        nilai: nilaiMaksimum

                    });

                }

            });


            // =============================================
            // URUTKAN DARI TERBESAR
            // =============================================

            daftarKata.sort(
                function(a, b) {

                    return b.nilai - a.nilai;

                }
            );


            // =============================================
            // AMBIL 30 KATA
            // =============================================

            var topKata =
                daftarKata.slice(0, 30);


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
            // TAMPILKAN TF-IDF
            // =============================================

            topKata.forEach(
                function(item, index) {

                    var tr =
                        document.createElement("tr");


                    tr.innerHTML =

                        "<td>" +
                        (index + 1) +
                        "</td>" +

                        "<td>" +
                        escapeHTML(item.kata) +
                        "</td>" +

                        "<td>" +
                        item.nilai.toFixed(4) +
                        "</td>";


                    tbody.appendChild(tr);

                }
            );


            if (topKata.length === 0) {

                tbody.innerHTML =
                    "<tr>" +
                    "<td colspan='3' style='text-align:center; padding:30px;'>" +
                    "Tidak ditemukan nilai TF-IDF." +
                    "</td>" +
                    "</tr>";

            }

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

                    "<td colspan='3' style='text-align:center; padding:30px; color:#dc2626;'>" +

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
// TF-IDF SPORT
// =====================================================

loadTfidf(
    "data/hasil_tfidf_detik_sport.json",
    "sportJumlahArtikel",
    "sportJumlahKata",
    "sportDimensiTfidf",
    "sportTfidfBody"
);


// =====================================================
// TF-IDF FINANCE
// =====================================================

loadTfidf(
    "data/hasil_tfidf_detik_finance.json",
    "financeJumlahArtikel",
    "financeJumlahKata",
    "financeDimensiTfidf",
    "financeTfidfBody"
);


// =====================================================
// LOAD PCA
// =====================================================

function loadPca(
    file,
    chartId,
    dimensiId,
    mode
) {

    console.log("Memuat PCA:", file);


    fetch(file)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "File tidak ditemukan: " + file
                );

            }

            return response.json();

        })

        .then(function(data) {

            console.log(
                "Data PCA berhasil:",
                file,
                data
            );


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


            var titik = [];


            // =============================================
            // BACA DATA PCA
            // =============================================

            data.forEach(function(row, index) {

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
                            "-",

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

            });


            console.log(
                "Jumlah titik PCA valid:",
                titik.length
            );


            // =============================================
            // DIMENSI AWAL
            // =============================================

            var dimensiAwal =
                document.getElementById(
                    dimensiId
                );


            if (dimensiAwal) {

                dimensiAwal.textContent =
                    data.length +
                    " × " +
                    Object.keys(data[0]).length;

            }


            // =============================================
            // CHART AREA
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

                    "<strong>Data PCA tidak dapat ditampilkan.</strong>" +

                    "<br><br>" +

                    "Kolom PC1 dan PC2 tidak ditemukan." +

                    "<br><br>" +

                    "Kolom yang tersedia: " +

                    escapeHTML(
                        Object.keys(data[0]).join(", ")
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
            // WARNA
            // =============================================

            var warna = [

                "#2563eb",
                "#dc2626",
                "#16a34a",
                "#9333ea",
                "#ea580c",
                "#0891b2",
                "#ca8a04",
                "#db2777"

            ];


            var warnaKategori = {};

            var warnaIndex = 0;


            // =============================================
            // BUAT TITIK
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


                    var kategori =
                        String(
                            item.kategori
                        );


                    var kategoriLower =
                        kategori.toLowerCase();


                    // =====================================
                    // WARNA SPORT
                    // =====================================

                    if (
                        mode === "sport" &&
                        kategoriLower.includes(
                            "inggris"
                        )
                    ) {

                        point.classList.add(
                            "point-inggris"
                        );

                    }

                    else if (
                        mode === "sport" &&
                        kategoriLower.includes(
                            "italia"
                        )
                    ) {

                        point.classList.add(
                            "point-italia"
                        );

                    }

                    else {

                        if (
                            !warnaKategori[
                                kategori
                            ]
                        ) {

                            warnaKategori[
                                kategori
                            ] =
                                warna[
                                    warnaIndex %
                                    warna.length
                                ];

                            warnaIndex++;

                        }


                        point.style.background =
                            warnaKategori[
                                kategori
                            ];

                    }


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
                    // KLIK
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
            // JUMLAH ARTIKEL
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
            // LEGEND FINANCE
            // =============================================

            if (
                mode === "finance"
            ) {

                var legend =
                    document.getElementById(
                        "financeLegend"
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

            }


            console.log(
                "PCA berhasil ditampilkan:",
                titik.length,
                "titik"
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

                    "<strong>Gagal memuat data PCA.</strong>" +

                    "<br><br>" +

                    escapeHTML(
                        error.message
                    ) +

                    "</div>";

            }

        });

}


// =====================================================
// PCA SPORT
// =====================================================

loadPca(
    "data/hasil_pca_detik_sport.json",
    "sportChartArea",
    "sportDimensiAwal",
    "sport"
);


// =====================================================
// PCA FINANCE
// =====================================================

loadPca(
    "data/hasil_pca_detik_finance.json",
    "financeChartArea",
    "financeDimensiAwal",
    "finance"
);