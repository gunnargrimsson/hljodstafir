import shutil
from scripts.logger import Logger

def remove_clean_files(foldername, location, logger: Logger):
    # Remove clean files
    try:
        shutil.rmtree(
            "./public/uploads/{}/{}clean".format(foldername, location))
    except Exception:
        logger.print_and_flush(
            "ERROR: Could not remove files in {}/{}clean".format(foldername, location))
