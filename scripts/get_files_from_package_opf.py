from bs4 import BeautifulSoup
from config import Config

ignore_file_list = ['toc.xhtml', 'nav.xhtml']


def get_files_from_package_opf(package_opf: str, file_type: str):
    """
      Returns the list of files of a specified type from the package.opf file.\n
      If the file type is xhtml it will make sure that it has media-overlay (smil).
    """
    package_manifest_items = get_all_items_from_package_opf(package_opf)
    package_manifest_files = None
    if (file_type == 'application/xhtml+xml'):
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and 'smil' in str(item.get('media-overlay')) and str(item.get('href')).lower() not in ignore_file_list]
    if (file_type == 'application/smil+xml'):
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and str(item.get('href')).lower() not in ignore_file_list]
    if (file_type == 'audio/mpeg'):
        package_manifest_files = [item.get('href') for item in package_manifest_items if item.get(
            'media-type') == file_type and str(item.get('href')).lower() not in ignore_file_list]
    return package_manifest_files


def get_all_items_from_package_opf(package_opf: str):
    """
      Returns the list of all items from the package.opf file.
    """
    package_soup = BeautifulSoup(package_opf, 'html.parser')
    package_manifest = package_soup.find('manifest')
    package_manifest_items = package_manifest.find_all('item')
    return package_manifest_items


def check_toc_nav(package_opf: str, foldername: str, location: str):
    """
      Checks if the toc.xhtml and nav.xhtml files exist in the package.opf file.
      And whether they are empty or not.
      Throw exception if empty.
    """
    package_manifest_items = get_all_items_from_package_opf(package_opf)
    toc_nav_files = [item.get('href') for item in package_manifest_items if item.get(
        'href').lower() in ignore_file_list]
    for toc_nav_file in toc_nav_files:
        if toc_nav_file == 'toc.xhtml':
            toc_nav_file_content = get_file_content(toc_nav_file, foldername, location)
            if len(toc_nav_file_content) == 0:
                raise Exception(
                    """
                        TOC file is empty.\n
                        Please fix, refresh and try again.
                    """
                )
        if toc_nav_file == 'nav.xhtml':
            toc_nav_file_content = get_file_content(toc_nav_file, foldername, location)
            if len(toc_nav_file_content) == 0:
                raise Exception(
                    """
                        NAV file is empty.\n
                        Please fix, refresh and try again.
                    """
                )


def get_file_content(file_name: str, foldername: str, location: str):
    """
      Returns the content of a file.
    """
    with open(f"./{Config.upload_folder}{foldername}/{location}/{file_name}", 'r', encoding='utf8') as file:
        file_content = file.read()
    return file_content