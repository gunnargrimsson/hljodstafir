import shutil
from scripts.logger import Logger

CANT_FIND_FILE = "The system cannot find the file specified"

def remove_clean_files(foldername, location, logger: Logger):
    """Removes the clean files from the uploads folder."""
    try:
        shutil.rmtree(
            "./public/uploads/{}/{}clean".format(foldername, location))
    except Exception as e:
        if (CANT_FIND_FILE not in str(e)):
            logger.print_and_flush(
                "ERROR: Could not remove files in {}/{}clean".format(foldername, location))
