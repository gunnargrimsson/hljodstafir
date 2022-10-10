from fileinput import filename
import os
import shutil
import sys

from scripts.logger import Logger
from config import Config


def check_epub_exists():
    """Checks if the epub file exists already in the uploads folder and outputs a name that won't conflict."""
    try:
        epub_exists = 0
        # check if any zip file with Config.folder_name exist
        for file in os.listdir(Config.output_folder):
            if file.endswith('.epub'):
                if file.startswith(Config.folder_name):
                    epub_exists += 1
        # conditionally add (x) to the filename if x epub files exist with the same name
        epub_exists_condition = f"({epub_exists})" if epub_exists > 0 else ""
        # check if file exists with Config.folder_name
        if os.path.exists(f'{Config.output_folder}{Config.folder_name}{epub_exists_condition}.epub'):
            # add (x) to the Config.folder_name
            epub_exists_condition = epub_exists_condition + \
                f'{epub_exists_condition}'
        return f'{Config.folder_name}{epub_exists_condition}'.split('_remove-timestamp_')[1]
    except Exception as e:
        raise e


def zip_epub(logger: Logger):
    """Zips the epub file and moves it to the output folder."""
    try:
        shutil.make_archive(f'{Config.upload_folder}{Config.final_name}',
                            'zip', f'{Config.upload_folder}{Config.folder_name}')
        # rename the zip file to the original epub file name and move the file to the output folder
        os.rename(f'{Config.upload_folder}{Config.final_name}.zip',
                  f'{Config.output_folder}{Config.final_name}.epub')
    except Exception as e:
        logger.print_and_flush(f"ERROR: {e}")


if __name__ == '__main__':
    zip_epub(sys.argv[1])
