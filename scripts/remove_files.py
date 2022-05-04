import os
import shutil

from scripts.print_and_flush import print_and_flush

def remove_files(foldername):
  # Remove all uploaded/processing files in the folder
  try:
    shutil.rmtree("./public/uploads/{}".format(foldername))
  except Exception:
    print_and_flush("ERROR: Could not remove files in {}".format(foldername))
  try:
    os.remove("./public/uploads/{}.epub".format(foldername))
  except Exception:
    print_and_flush("ERROR: Could not remove the uploaded version of {}.epub".format(foldername))

if __name__ == "__main__":
  remove_files()