from os import listdir
from os.path import isfile, join
import sys
from bs4 import BeautifulSoup

ignore_file_list = ['toc.xhtml', 'nav.xhtml']


def get_files_from_package_opf(package_opf: str, file_type: str):
    """
      Returns the list of files of a specified type from the package.opf file.\n
      If the file type is xhtml it will make sure that it has media-overlay (smil).
    """
    package_soup = BeautifulSoup(package_opf, 'html.parser')
    package_manifest = package_soup.find('manifest')
    package_manifest_items = package_manifest.find_all('item')
    if (file_type == 'application/xhtml+xml'):
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and 'smil' in str(item) and str(item.get('href')).lower() not in ignore_file_list]
    if (file_type == 'application/smil+xml'):
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and str(item.get('href')).lower() not in ignore_file_list]
    else:
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and str(item.get('href')).lower() not in ignore_file_list]
    return package_manifest_files


if __name__ == '__main__':
    get_files_from_package_opf(sys.argv[1], sys.argv[2])
