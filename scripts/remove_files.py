import os
import shutil
from scripts.logger import Logger
from config import Config

CANT_FIND_FILE = "The system cannot find the file specified"

def remove_files(logger: Logger, log: bool = True):
  """Removes the files in the uploads folder."""
  # Remove all uploaded/processing files in the folder
  try:
    shutil.rmtree(f"{Config.upload_folder}{Config.folder_name}")
  except Exception as e:
    if (CANT_FIND_FILE not in str(e) and log):
      logger.print_and_flush(f"ERROR: Could not remove files in {Config.folder_name}")
  try:
    os.remove(f"{Config.upload_folder}{Config.folder_name}.epub")
  except Exception as e:
    if (CANT_FIND_FILE not in str(e) and log):
      logger.print_and_flush(f"ERROR: Could not remove the uploaded version of {Config.folder_name}.epub")
  try:
    os.remove(f"{Config.upload_folder}{Config.final_name}.zip")
  except Exception as e:
    if (CANT_FIND_FILE not in str(e) and log):
      logger.print_and_flush(f"ERROR: Could not remove {Config.final_name}.zip")

if __name__ == "__main__":
  remove_files()