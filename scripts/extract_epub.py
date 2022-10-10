import zipfile
import sys
from config import Config

def extract_epub():
    """Extracts the epub file to a folder to be worked on."""
    with zipfile.ZipFile(f'./{Config.upload_folder}{Config.folder_name}.epub', 'r') as zip_ref:
        zip_ref.extractall(f'./{Config.upload_folder}{Config.folder_name}/')


if "__main__" == __name__:
    extract_epub(sys.argv[1])
