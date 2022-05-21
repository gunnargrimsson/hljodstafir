from fileinput import filename
import os
import shutil
import sys

from scripts.logger import Logger


def check_epub_exists(foldername):
    """Checks if the epub file exists already in the uploads folder and outputs a name that won't conflict."""
    epub_exists = 0
    # check if any zip file with foldername exist
    for file in os.listdir('./public/output/'):
        if file.endswith('.epub'):
            if file.startswith(foldername):
                epub_exists += 1
    # conditionally add (x) to the filename if x epub files exist with the same name
    epub_exists_condition = "({})".format(
        epub_exists) if epub_exists > 0 else ""
    # check if file exists with foldername
    if os.path.exists('./public/output/{}{}.epub'.format(foldername, epub_exists_condition)):
        # add (x) to the foldername
        epub_exists_condition = epub_exists_condition + \
            '{}'.format(epub_exists_condition)
    return '{}{}'.format(foldername, epub_exists_condition)


def zip_epub(foldername, finalname, logger: Logger):
    """Zips the epub file and moves it to the output folder."""
    try:
        shutil.make_archive('./public/uploads/{}'.format(finalname),
                            'zip', './public/uploads/{}'.format(foldername))
        # rename the zip file to the original epub file name and move the file to the output folder
        os.rename('./public/uploads/{}.zip'.format(finalname),
                  './public/output/{}.epub'.format(finalname))
    except Exception as e:
        logger.print_and_flush("ERROR: {}".format(e))


if __name__ == '__main__':
    zip_epub(sys.argv[1])
