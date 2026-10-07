from pathlib import Path
import pickle

import numpy as np

from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from gensim.models import Word2Vec

from crawler.scraper import scrape_news
from preprocessing.text_processor import preprocess


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)


BASE_DIR = Path(
    __file__
).resolve().parent


MODEL_DIR = (
    BASE_DIR / "model"
)


# ============================================================
# LOAD MODEL
# ============================================================

word2vec_model = Word2Vec.load(
    str(
        MODEL_DIR
        / "word2vec.model"
    )
)


with open(
    MODEL_DIR / "naive_bayes.pkl",
    "rb"
) as file:

    naive_bayes = pickle.load(
        file
    )


with open(
    MODEL_DIR / "label_encoder.pkl",
    "rb"
) as file:

    label_encoder = pickle.load(
        file
    )


# ============================================================
# DOCUMENT VECTOR
# ============================================================

def document_vector(tokens):

    vectors = []

    for word in tokens:

        if word in word2vec_model.wv:

            vectors.append(
                word2vec_model.wv[word]
            )

    if not vectors:

        return np.zeros(
            word2vec_model.vector_size
        )

    return np.mean(
        vectors,
        axis=0
    )


# ============================================================
# KLASIFIKASI
# ============================================================

def classify_text(text):

    preprocessing_result = preprocess(
        text
    )

    tokens = preprocessing_result[
        "final"
    ]

    vector = document_vector(
        tokens
    )

    X = np.array([
        vector
    ])

    prediction = naive_bayes.predict(
        X
    )[0]

    probabilities = (
        naive_bayes.predict_proba(
            X
        )[0]
    )

    kategori = label_encoder.inverse_transform(
        [prediction]
    )[0]

    confidence = {}

    for label, probability in zip(
        label_encoder.classes_,
        probabilities
    ):

        confidence[label] = round(
            float(probability) * 100,
            2
        )

    # Detail embedding
    embedding_detail = []

    for word in tokens[:30]:

        if word in word2vec_model.wv:

            embedding_detail.append({

                "kata": word,

                "vektor": (
                    word2vec_model
                    .wv[word]
                    .round(6)
                    .tolist()
                )
            })

    return {

        "kategori": kategori,

        "confidence": confidence,

        "preprocessing": preprocessing_result,

        "embedding": {

            "vector_size":
                word2vec_model.vector_size,

            "window": 5,

            "min_count": 1,

            "sg": 1,

            "epochs": 20,

            "jumlah_token":
                len(tokens),

            "detail": embedding_detail
        }
    }


# ============================================================
# HALAMAN UTAMA
# ============================================================

@app.route("/")
def index():

    return render_template(
        "index.html"
    )


# ============================================================
# API KLASIFIKASI
# ============================================================

@app.route(
    "/api/classify",
    methods=["POST"]
)
def classify():

    try:

        data = request.get_json()

        mode = data.get(
            "mode",
            ""
        )

        # ====================================================
        # MODE URL
        # ====================================================

        if mode == "url":

            url = data.get(
                "url",
                ""
            ).strip()

            if not url:

                return jsonify({

                    "success": False,

                    "message":
                        "URL belum diisi."
                }), 400

            # Crawling
            berita = scrape_news(
                url
            )

            isi = berita[
                "isi"
            ]

            if not isi:

                return jsonify({

                    "success": False,

                    "message":
                        "Konten berita tidak berhasil "
                        "diekstraksi dari URL."
                }), 400

            # Klasifikasi
            hasil = classify_text(
                isi
            )

            return jsonify({

                "success": True,

                "mode": "url",

                "berita": {

                    "judul":
                        berita["judul"],

                    "tanggal":
                        berita["tanggal"],

                    "penulis":
                        berita["penulis"],

                    "url":
                        berita["url"],

                    "domain":
                        berita["domain"],

                    "isi":
                        berita["isi"],

                    "jumlah_kata":
                        berita["jumlah_kata"]
                },

                "hasil": hasil
            })

        # ====================================================
        # MODE TEXT
        # ====================================================

        elif mode == "text":

            text = data.get(
                "text",
                ""
            ).strip()

            if not text:

                return jsonify({

                    "success": False,

                    "message":
                        "Teks belum diisi."
                }), 400

            hasil = classify_text(
                text
            )

            return jsonify({

                "success": True,

                "mode": "text",

                "berita": {

                    "judul": "Teks Input",

                    "tanggal": "-",

                    "penulis": "-",

                    "url": "-",

                    "domain": "-",

                    "isi": text,

                    "jumlah_kata":
                        len(text.split())
                },

                "hasil": hasil
            })

        else:

            return jsonify({

                "success": False,

                "message":
                    "Mode tidak valid."
            }), 400

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)
        }), 500


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )