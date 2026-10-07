import requests

from bs4 import BeautifulSoup

from urllib.parse import urlparse


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/154.0.0.0 Safari/537.36"
    )
}


def scrape_news(url):

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=20
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )


    # ==========================================
    # JUDUL
    # ==========================================

    judul = ""

    h1 = soup.find("h1")

    if h1:

        judul = h1.get_text(
            " ",
            strip=True
        )


    # ==========================================
    # TANGGAL
    # ==========================================

    tanggal = ""

    time_tag = soup.find("time")

    if time_tag:

        tanggal = time_tag.get_text(
            " ",
            strip=True
        )

        if not tanggal:

            tanggal = time_tag.get(
                "datetime",
                ""
            )


    # ==========================================
    # PENULIS / REDAKSI
    # ==========================================

    penulis = ""

    # Beberapa kemungkinan class
    author_selectors = [
        ".detail__author",
        ".author",
        ".author-name",
        ".writer",
        ".detail__author-name"
    ]

    for selector in author_selectors:

        element = soup.select_one(
            selector
        )

        if element:

            penulis = element.get_text(
                " ",
                strip=True
            )

            break


    # ==========================================
    # KONTEN BERITA
    # ==========================================

    content_selectors = [

        "div.detail__body-text",

        "div.detail__body",

        "article",

        "div.article-content",

        "div.content"

    ]

    paragraphs = []


    for selector in content_selectors:

        containers = soup.select(
            selector
        )

        if not containers:
            continue


        for container in containers:

            for paragraph in container.find_all(
                "p"
            ):

                text = paragraph.get_text(
                    " ",
                    strip=True
                )

                if text:

                    paragraphs.append(
                        text
                    )


        if paragraphs:
            break


    # ==========================================
    # FALLBACK
    # ==========================================

    if not paragraphs:

        for paragraph in soup.find_all(
            "p"
        ):

            text = paragraph.get_text(
                " ",
                strip=True
            )

            if text:

                paragraphs.append(
                    text
                )


    # ==========================================
    # GABUNGKAN KONTEN
    # ==========================================

    isi = " ".join(
        paragraphs
    )


    # ==========================================
    # JUMLAH KATA
    # ==========================================

    jumlah_kata = len(
        isi.split()
    )


    # ==========================================
    # DOMAIN
    # ==========================================

    domain = urlparse(
        url
    ).netloc


    return {

        "judul": judul,

        "tanggal": tanggal,

        "penulis": penulis,

        "url": url,

        "domain": domain,

        "isi": isi,

        "jumlah_kata": jumlah_kata

    }