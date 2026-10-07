import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

from gensim.models import Word2Vec

from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from preprocessing.text_processor import preprocess


# ============================================================
# KONFIGURASI
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = (
    BASE_DIR
    / "data"
    / "hasil_scraping_detik.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "model"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# PARAMETER WORD2VEC SKIP-GRAM
# ============================================================

VECTOR_SIZE = 100
WINDOW = 5
MIN_COUNT = 1
WORKERS = 4
SG = 1
EPOCHS = 20
SEED = 42


# ============================================================
# DOCUMENT VECTOR
# ============================================================

def document_vector(model, tokens):

    vectors = []

    for word in tokens:

        if word in model.wv:

            vectors.append(
                model.wv[word]
            )

    if not vectors:

        return np.zeros(
            model.vector_size
        )

    return np.mean(
        vectors,
        axis=0
    )


# ============================================================
# MENENTUKAN KATEGORI
# ============================================================

def tentukan_kategori(row):

    # Jika sudah ada kategori
    if "kategori" in row.index:

        kategori = str(
            row["kategori"]
        ).strip().lower()

        if kategori in [
            "sport",
            "finance"
        ]:

            return kategori

    # Jika kategori tidak ada,
    # tentukan dari URL

    url = str(
        row.get("url", "")
    ).lower()

    if "sport.detik.com" in url:

        return "sport"

    if "finance.detik.com" in url:

        return "finance"

    return ""


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("TRAINING WORD2VEC SKIP-GRAM + NAIVE BAYES")
    print("=" * 70)

    # ========================================================
    # 1. BACA DATASET
    # ========================================================

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"\nFile tidak ditemukan:\n"
            f"{DATASET_PATH}"
        )

    df = pd.read_csv(
        DATASET_PATH,
        encoding="utf-8-sig"
    )

    print("\nDataset berhasil dibaca.")

    print(
        f"Jumlah data awal: {len(df)}"
    )

    print(
        "\nKolom dataset:"
    )

    print(
        df.columns.tolist()
    )

    # ========================================================
    # 2. CEK KOLOM ISI
    # ========================================================

    if "isi" not in df.columns:

        raise ValueError(
            "\nKolom 'isi' tidak ditemukan.\n"
            "Pastikan CSV memiliki kolom isi berita."
        )

    # ========================================================
    # 3. TENTUKAN KATEGORI
    # ========================================================

    df["kategori"] = df.apply(
        tentukan_kategori,
        axis=1
    )

    # Buang data yang kategorinya tidak diketahui

    df = df[
        df["kategori"].isin(
            ["sport", "finance"]
        )
    ].copy()

    df = df.reset_index(
        drop=True
    )

    print(
        f"\nJumlah data setelah "
        f"penentuan kategori: {len(df)}"
    )

    print(
        "\nDistribusi kategori:"
    )

    print(
        df["kategori"].value_counts()
    )

    # ========================================================
    # CEK JUMLAH KATEGORI
    # ========================================================

    if df["kategori"].nunique() < 2:

        raise ValueError(
            "\nDataset hanya memiliki satu kategori.\n"
            "Naive Bayes membutuhkan minimal dua kategori "
            "untuk klasifikasi."
        )

    # ========================================================
    # 4. PREPROCESSING
    # ========================================================

    print("\n" + "=" * 70)
    print("PREPROCESSING SASTRAWI")
    print("=" * 70)

    tokenized_documents = []

    for i, text in enumerate(
        df["isi"].fillna("")
    ):

        hasil = preprocess(
            text
        )

        tokens = hasil["final"]

        tokenized_documents.append(
            tokens
        )

        if (i + 1) % 25 == 0:

            print(
                f"Preprocessing "
                f"{i + 1}/{len(df)}"
            )

    # ========================================================
    # 5. HAPUS DATA KOSONG
    # ========================================================

    valid_indices = [
        i
        for i, tokens
        in enumerate(tokenized_documents)
        if len(tokens) > 0
    ]

    df = df.iloc[
        valid_indices
    ].reset_index(
        drop=True
    )

    tokenized_documents = [
        tokenized_documents[i]
        for i in valid_indices
    ]

    print(
        f"\nData setelah preprocessing: "
        f"{len(df)}"
    )

    # ========================================================
    # 6. LABEL ENCODING
    # ========================================================

    label_encoder = LabelEncoder()

    y = label_encoder.fit_transform(
        df["kategori"]
    )

    print(
        "\nLabel:"
    )

    for i, label in enumerate(
        label_encoder.classes_
    ):

        print(
            f"{i} = {label}"
        )

    # ========================================================
    # 7. TRAINING DAN TESTING
    # ========================================================

    indices = np.arange(
        len(df)
    )

    train_indices, test_indices = train_test_split(
        indices,
        test_size=0.2,
        random_state=SEED,
        stratify=y
    )

    token_train = [
        tokenized_documents[i]
        for i in train_indices
    ]

    token_test = [
        tokenized_documents[i]
        for i in test_indices
    ]

    y_train = y[
        train_indices
    ]

    y_test = y[
        test_indices
    ]

    print(
        f"\nData training : "
        f"{len(train_indices)}"
    )

    print(
        f"Data testing  : "
        f"{len(test_indices)}"
    )

    # ========================================================
    # 8. WORD2VEC SKIP-GRAM
    # ========================================================

    print("\n" + "=" * 70)
    print("WORD2VEC SKIP-GRAM")
    print("=" * 70)

    word2vec_model = Word2Vec(

        sentences=token_train,

        vector_size=VECTOR_SIZE,

        window=WINDOW,

        min_count=MIN_COUNT,

        workers=WORKERS,

        sg=SG,

        epochs=EPOCHS,

        seed=SEED
    )

    print(
        "\nWord2Vec selesai."
    )

    print(
        f"Jumlah vocabulary: "
        f"{len(word2vec_model.wv)}"
    )

    # ========================================================
    # 9. DOCUMENT VECTOR
    # ========================================================

    print("\n" + "=" * 70)
    print("DOCUMENT VECTOR")
    print("=" * 70)

    X_train = np.array([
        document_vector(
            word2vec_model,
            tokens
        )
        for tokens in token_train
    ])

    X_test = np.array([
        document_vector(
            word2vec_model,
            tokens
        )
        for tokens in token_test
    ])

    print(
        f"\nX_train: "
        f"{X_train.shape}"
    )

    print(
        f"X_test : "
        f"{X_test.shape}"
    )

    # ========================================================
    # 10. NAIVE BAYES
    # ========================================================

    print("\n" + "=" * 70)
    print("NAIVE BAYES")
    print("=" * 70)

    naive_bayes = GaussianNB()

    naive_bayes.fit(
        X_train,
        y_train
    )

    print(
        "\nNaive Bayes selesai."
    )

    # ========================================================
    # 11. PREDIKSI
    # ========================================================

    y_pred = naive_bayes.predict(
        X_test
    )

    # ========================================================
    # 12. EVALUASI
    # ========================================================

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    report = classification_report(
        y_test,
        y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0
    )

    matrix = confusion_matrix(
        y_test,
        y_pred
    )

    print("\n" + "=" * 70)
    print("HASIL EVALUASI")
    print("=" * 70)

    print(
        f"\nAccuracy: "
        f"{accuracy:.4f}"
    )

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
            y_pred,
            target_names=label_encoder.classes_,
            zero_division=0
        )
    )

    print(
        "Confusion Matrix:"
    )

    print(matrix)

    # ========================================================
    # 13. SIMPAN WORD2VEC
    # ========================================================

    word2vec_model.save(
        str(
            MODEL_DIR
            / "word2vec.model"
        )
    )

    # ========================================================
    # 14. SIMPAN NAIVE BAYES
    # ========================================================

    with open(
        MODEL_DIR / "naive_bayes.pkl",
        "wb"
    ) as file:

        pickle.dump(
            naive_bayes,
            file
        )

    # ========================================================
    # 15. SIMPAN LABEL ENCODER
    # ========================================================

    with open(
        MODEL_DIR / "label_encoder.pkl",
        "wb"
    ) as file:

        pickle.dump(
            label_encoder,
            file
        )

    # ========================================================
    # 16. SIMPAN EVALUASI
    # ========================================================

    evaluation = {

        "accuracy": float(
            accuracy
        ),

        "total_data": int(
            len(df)
        ),

        "training_data": int(
            len(train_indices)
        ),

        "testing_data": int(
            len(test_indices)
        ),

        "classes": (
            label_encoder
            .classes_
            .tolist()
        ),

        "word2vec": {

            "vector_size": VECTOR_SIZE,

            "window": WINDOW,

            "min_count": MIN_COUNT,

            "workers": WORKERS,

            "sg": SG,

            "epochs": EPOCHS,

            "seed": SEED
        },

        "classification_report": report,

        "confusion_matrix": (
            matrix.tolist()
        )
    }

    with open(
        MODEL_DIR / "evaluation.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            evaluation,
            file,
            indent=4,
            ensure_ascii=False
        )

    # ========================================================
    # SELESAI
    # ========================================================

    print("\n" + "=" * 70)
    print("TRAINING SELESAI")
    print("=" * 70)

    print(
        "\nModel tersimpan di:"
    )

    print(
        MODEL_DIR
    )

    print(
        "\nFile:"
    )

    print(
        "- word2vec.model"
    )

    print(
        "- naive_bayes.pkl"
    )

    print(
        "- label_encoder.pkl"
    )

    print(
        "- evaluation.json"
    )


if __name__ == "__main__":
    main()