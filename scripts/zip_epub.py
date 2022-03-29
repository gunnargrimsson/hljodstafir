import os
import shutil
import sys

def zip_epub(foldername):
  # zip up contents of one folder uncompressed
  shutil.make_archive('././public/uploads/{}'.format(foldername), 'zip', '././public/uploads/{}/'.format(foldername))
  # rename the zip file to the original epub file name
  os.rename('././public/uploads/{}.zip'.format(foldername), '././public/output/{}_final.epub'.format(foldername))

if __name__ == '__main__':
  zip_epub(sys.argv[1])
