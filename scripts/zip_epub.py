import os
import shutil
import sys

def zip_epub(foldername):
  epub_exists = 0
  # check if any zip file with foldername exist
  for file in os.listdir('./public/output/'):
    if file.endswith('.epub'):
      if file.startswith(foldername):
        epub_exists += 1
  # conditionally add (x) to the filename if x epub files exist with the same name
  epub_exists_condition = "({})".format(epub_exists) if epub_exists > 0 else ""
  # check if file exists with foldername
  if os.path.exists('./public/output/{}{}.epub'.format(foldername, epub_exists_condition)):
    # add (x) to the foldername
    epub_exists_condition = epub_exists_condition + '{}'.format(epub_exists_condition)
  # zip up contents of one folder uncompressed
  shutil.make_archive('././public/uploads/{}{}'.format(foldername, epub_exists_condition), 'zip', '././public/uploads/{}'.format(foldername))
  # rename the zip file to the original epub file name and move the file to the output folder
  os.rename('././public/uploads/{}{}.zip'.format(foldername, epub_exists_condition), '././public/output/{}{}.epub'.format(foldername, epub_exists_condition))

if __name__ == '__main__':
  zip_epub(sys.argv[1])
