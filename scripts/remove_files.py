import os
import shutil
from scripts.logger import Logger

def remove_files(foldername, logger: Logger):
  """Removes the files in the uploads folder."""
  # Remove all uploaded/processing files in the folder
  try:
    shutil.rmtree("./public/uploads/{}".format(foldername))
  except Exception:
    logger.print_and_flush("ERROR: Could not remove files in {}".format(foldername))
  try:
    os.remove("./public/uploads/{}.epub".format(foldername))
  except Exception:
    logger.print_and_flush("ERROR: Could not remove the uploaded version of {}.epub".format(foldername))

if __name__ == "__main__":
  remove_files()