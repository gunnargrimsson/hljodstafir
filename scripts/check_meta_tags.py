from scripts.logger import Logger
from bs4 import BeautifulSoup

def check_meta_tags(package_opf: str, logger: Logger):
    """
    Check if package.opf has meta properties that break the book
    for example:
      <meta property="rendition:layout">pre-paginated</meta>
      <meta property="rendition:orientation">auto</meta>
      <meta property="rendition:spread">landscape</meta>
    """
    soup = BeautifulSoup(package_opf, 'html.parser')
    # tags that the user needs to be warned about
    warning_tags = ["rendition:layout", "rendition:orientation", "rendition:spread"]
    # tags that will end the process
    error_tags = []
    for tag in warning_tags:
        if soup.find(property=tag):
            logger.print_and_flush(
                "WARNING: {} tag found in package.opf".format(tag))
    for tag in error_tags:
        if soup.find(property=tag):
            logger.print_and_flush(
                "ERROR: {} tag found in package.opf".format(tag))
            raise Exception("ERROR: {} tag found in package.opf".format(tag))