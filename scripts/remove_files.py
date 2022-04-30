import os
import shutil

def remove_files(foldername):
  # Remove all uploaded/processing files in the folder
  try:
    shutil.rmtree("./public/uploads/{}".format(foldername))
  except Exception:
    print('Could not remove processing folder or one of its children: {}'.format(foldername))
  try:
    os.remove("./public/uploads/{}.epub".format(foldername))
  except Exception:
    print('Could not remove uploaded epub file: {}.epub'.format(foldername))

if __name__ == "__main__":
  remove_files()