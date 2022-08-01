from os import listdir, remove
from os.path import isfile, join
import shutil

def remove_extra_files(foldername, bookname):
  smil_files = [f for f in listdir("././public/uploads/{}/EPUB/Content/".format(foldername)) if isfile(join("././public/uploads/{}/EPUB/Content/".format(foldername), f)) and f.endswith(".smil") and not 'master' in f]  

  # remove all smil files found
  for smil_file in smil_files:
    remove(join("././public/uploads/{}/EPUB/Content/".format(foldername), smil_file))

  # delete the 'segments' folder
  shutil.rmtree(join("././public/uploads/{}/EPUB/Content/segments".format(foldername)))
  
  # delete the 'clean' xhtml file
  remove(join("././public/uploads/{}/EPUB/Content/{}_clean.xhtml".format(foldername, bookname)))