import os
import shutil
from scripts.logger import Logger

CANT_FIND_FILE = "The system cannot find the file specified"

def remove_files(foldername, finalname, logger: Logger):
  """Removes the files in the uploads folder."""
  # Remove all uploaded/processing files in the folder
  try:
    shutil.rmtree("./public/uploads/{}".format(foldername))
  except Exception as e:
    if (CANT_FIND_FILE not in str(e)):
      logger.print_and_flush("ERROR: Could not remove files in {}".format(foldername))
  try:
    os.remove("./public/uploads/{}.epub".format(foldername))
  except Exception as e:
    if (CANT_FIND_FILE not in str(e)):
      logger.print_and_flush("ERROR: Could not remove the uploaded version of {}.epub".format(foldername))
  try:
    os.remove("./public/uploads/{}.zip".format(finalname))
  except Exception as e:
    if (CANT_FIND_FILE not in str(e)):
      logger.print_and_flush("ERROR: Could not remove {}.zip".format(finalname))

if __name__ == "__main__":
  remove_files()