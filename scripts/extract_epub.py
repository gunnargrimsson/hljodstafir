import zipfile
import sys


def extract_epub(foldername):
    """Extracts the epub file to a folder to be worked on."""
    with zipfile.ZipFile('././public/uploads/{}.epub'.format(foldername), 'r') as zip_ref:
        zip_ref.extractall('././public/uploads/{}/'.format(foldername))


if "__main__" == __name__:
    extract_epub(sys.argv[1])
