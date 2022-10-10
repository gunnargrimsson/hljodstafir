from os import listdir
from os.path import isfile, join
import sys
from scripts.logger import Logger

from config import Config


def get_package_opf(logger: Logger):
    """Gets the package.opf file from the epub file and its location."""
    possible_locations = ['EPUB/', 'EPUB/Content/', 'OEBPS/', 'GoogleDoc/']
    opf_files = None
    found_location = None
    for location in possible_locations:
        try:
            opf_files = [f for f in listdir(f"{Config.upload_folder}{Config.folder_name}/{location}") if isfile(
                join(f"{Config.upload_folder}{Config.folder_name}/{location}", f)) and f == 'package.opf']
            if opf_files:
                found_location = location
                break
            if not opf_files:
                continue
        except:
            pass

    if not found_location:
        logger.print_and_flush(
            f"ERROR: No package.opf found in {Config.folder_name}")
        return False

    with open(f'./{Config.upload_folder}{Config.folder_name}/{found_location}/package.opf', 'r', encoding='utf8') as f:
        opf_file = f.read()

    return opf_file, found_location


if __name__ == '__main__':
    get_package_opf(sys.argv[1])
