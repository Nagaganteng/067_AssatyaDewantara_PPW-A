import re

from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import (
    StopWordRemoverFactory
)


# ==========================================
# INISIALISASI SASTRAWI
# ==========================================

stemmer_factory = StemmerFactory()
stemmer = stemmer_factory.create_stemmer()

stopword_factory = StopWordRemoverFactory()
stopwords = set(
    stopword_factory.get_stop_words()
)


# ==========================================
# CLEANING
# ==========================================

def cleaning(text):

    if text is None:
        return ""

    text = str(text)

    # Lowercase
    text = text.lower()

    # Hapus URL
    text = re.sub(
        r"http\S+|www\S+",
        " ",
        text
    )

    # Hapus HTML
    text = re.sub(
        r"<.*?>",
        " ",
        text
    )

    # Hanya menyisakan huruf
    text = re.sub(
        r"[^a-zA-Z\s]",
        " ",
        text
    )

    # Hapus spasi berlebih
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# ==========================================
# TOKENISASI
# ==========================================

def tokenize(text):

    return text.split()


# ==========================================
# STOPWORD REMOVAL
# ==========================================

def remove_stopwords(tokens):

    return [
        word
        for word in tokens
        if word not in stopwords
    ]


# ==========================================
# STEMMING
# ==========================================

def stemming(tokens):

    text = " ".join(tokens)

    hasil = stemmer.stem(text)

    return hasil.split()


# ==========================================
# PREPROCESSING LENGKAP
# ==========================================

def preprocess(text):

    cleaned = cleaning(text)

    tokens = tokenize(cleaned)

    tanpa_stopword = remove_stopwords(
        tokens
    )

    hasil_stemming = stemming(
        tanpa_stopword
    )

    return {
        "cleaning": cleaned,
        "tokenisasi": tokens,
        "stopword": tanpa_stopword,
        "stemming": hasil_stemming,
        "final": hasil_stemming
    }