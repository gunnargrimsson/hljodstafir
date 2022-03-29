import zipfile
import sys

def extract_epub(foldername):
  with zipfile.ZipFile('././public/uploads/{}.epub'.format(foldername, foldername), 'r') as zip_ref:
    zip_ref.extractall('././public/uploads/{}/'.format(foldername))

if "__main__" == __name__:
  extract_epub(sys.argv[1])