let currentMode = "url";


// ============================================================
// GANTI MODE
// ============================================================

function setMode(mode) {

    currentMode = mode;

    const urlInput =
        document.getElementById("urlInput");

    const textInput =
        document.getElementById("textInput");

    const urlModeBtn =
        document.getElementById("urlModeBtn");

    const textModeBtn =
        document.getElementById("textModeBtn");


    if (mode === "url") {

        urlInput.classList.remove("hidden");

        textInput.classList.add("hidden");

        urlModeBtn.classList.add("active");

        textModeBtn.classList.remove("active");

    } else {

        urlInput.classList.add("hidden");

        textInput.classList.remove("hidden");

        urlModeBtn.classList.remove("active");

        textModeBtn.classList.add("active");
    }
}


// ============================================================
// KLASIFIKASI
// ============================================================

async function classifyNews() {

    const loading =
        document.getElementById("loading");

    const result =
        document.getElementById("result");


    loading.classList.remove("hidden");

    result.classList.add("hidden");


    let requestData = {

        mode: currentMode
    };


    if (currentMode === "url") {

        const url =
            document
                .getElementById("url")
                .value
                .trim();


        if (!url) {

            alert(
                "Masukkan URL berita terlebih dahulu."
            );

            loading.classList.add("hidden");

            return;
        }


        requestData.url = url;

    } else {

        const text =
            document
                .getElementById("text")
                .value
                .trim();


        if (!text) {

            alert(
                "Masukkan teks berita terlebih dahulu."
            );

            loading.classList.add("hidden");

            return;
        }


        requestData.text = text;
    }


    try {

        const response =
            await fetch(
                "/api/classify",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        requestData
                    )
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Terjadi kesalahan."
            );
        }


        tampilkanHasil(data);


    } catch (error) {

        result.classList.remove(
            "hidden"
        );

        result.innerHTML = `
            <div class="card">
                <div class="error">
                    ${escapeHtml(
                        error.message
                    )}
                </div>
            </div>
        `;

    } finally {

        loading.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// TAMPILKAN HASIL
// ============================================================

function tampilkanHasil(data) {

    const result =
        document.getElementById("result");

    result.classList.remove(
        "hidden"
    );


    const berita =
        data.berita;

    const hasil =
        data.hasil;


    // ========================================================
    // PREDIKSI
    // ========================================================

    document.getElementById(
        "prediction"
    ).innerHTML = `
        Kategori Terprediksi:
        <br>
        ${escapeHtml(
            hasil.kategori.toUpperCase()
        )}
    `;


    // ========================================================
    // CONFIDENCE
    // ========================================================

    let confidenceHTML = "";


    for (
        const [kategori, nilai]
        of Object.entries(
            hasil.confidence
        )
    ) {

        confidenceHTML += `

            <div class="confidence-item">

                <div class="confidence-label">

                    <strong>
                        ${escapeHtml(
                            kategori
                        )}
                    </strong>

                    <span>
                        ${nilai}%
                    </span>

                </div>

                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width: ${nilai}%"
                    ></div>

                </div>

            </div>
        `;
    }


    document.getElementById(
        "confidence"
    ).innerHTML = confidenceHTML;


    // ========================================================
    // INFORMASI BERITA
    // ========================================================

    document.getElementById(
        "articleInfo"
    ).innerHTML = `

        <div class="info-row">
            <strong>Judul</strong>
            <span>
                ${escapeHtml(
                    berita.judul
                )}
            </span>
        </div>

        <div class="info-row">
            <strong>Tanggal</strong>
            <span>
                ${escapeHtml(
                    berita.tanggal
                )}
            </span>
        </div>

        <div class="info-row">
            <strong>Penulis</strong>
            <span>
                ${escapeHtml(
                    berita.penulis
                )}
            </span>
        </div>

        <div class="info-row">
            <strong>Tautan Asli</strong>
            <span>
                ${
                    berita.url !== "-"
                    ?
                    `<a
                        href="${escapeAttribute(
                            berita.url
                        )}"
                        target="_blank"
                    >
                        ${escapeHtml(
                            berita.url
                        )}
                    </a>`
                    :
                    "-"
                }
            </span>
        </div>

    `;


    // ========================================================
    // KONTEN
    // ========================================================

    document.getElementById(
        "wordCount"
    ).textContent =
        berita.jumlah_kata;


    document.getElementById(
        "content"
    ).textContent =
        berita.isi;


    // ========================================================
    // SASTRAWI
    // ========================================================

    document.getElementById(
        "cleaning"
    ).textContent =
        hasil.preprocessing.cleaning;


    document.getElementById(
        "tokenisasi"
    ).textContent =
        hasil.preprocessing.tokenisasi.join(
            " "
        );


    document.getElementById(
        "stopword"
    ).textContent =
        hasil.preprocessing.stopword.join(
            " "
        );


    document.getElementById(
        "stemming"
    ).textContent =
        hasil.preprocessing.stemming.join(
            " "
        );


    // ========================================================
    // WORD2VEC
    // ========================================================

    const embedding =
        hasil.embedding;


    document.getElementById(
        "embeddingInfo"
    ).innerHTML = `

        <div class="embedding-info">

            <div class="embedding-item">
                <strong>Vector Size</strong>
                <br>
                ${embedding.vector_size}
            </div>

            <div class="embedding-item">
                <strong>Window</strong>
                <br>
                ${embedding.window}
            </div>

            <div class="embedding-item">
                <strong>Min Count</strong>
                <br>
                ${embedding.min_count}
            </div>

            <div class="embedding-item">
                <strong>SG</strong>
                <br>
                ${embedding.sg}
                (Skip-Gram)
            </div>

            <div class="embedding-item">
                <strong>Epochs</strong>
                <br>
                ${embedding.epochs}
            </div>

            <div class="embedding-item">
                <strong>Jumlah Token</strong>
                <br>
                ${embedding.jumlah_token}
            </div>

        </div>
    `;


    // ========================================================
    // TABEL EMBEDDING
    // ========================================================

    let tableHTML = `

        <div class="embedding-table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>Kata</th>
                        <th>Vektor</th>
                    </tr>

                </thead>

                <tbody>
    `;


    for (
        const item
        of embedding.detail
    ) {

        tableHTML += `

            <tr>

                <td>
                    ${escapeHtml(
                        item.kata
                    )}
                </td>

                <td>
                    [
                    ${item.vektor.join(
                        ", "
                    )}
                    ]
                </td>

            </tr>
        `;
    }


    tableHTML += `

                </tbody>

            </table>

        </div>
    `;


    document.getElementById(
        "embeddingTable"
    ).innerHTML =
        tableHTML;


    // ========================================================
    // SCROLL KE HASIL
    // ========================================================

    result.scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return String(value)
        .replaceAll('"', "&quot;")
        .replaceAll("<", "%3C")
        .replaceAll(">", "%3E");
}