from os import listdir
from os.path import isfile, join
import sys

def get_package_opf(foldername: str):
  possible_locations = ['EPUB/', 'EPUB/Content/', 'OEBPS/', 'GoogleDoc/']
  opf_files = None
  found_location = None
  for location in possible_locations:
    try:
      opf_files = [f for f in listdir("./public/uploads/{}/{}".format(foldername, location)) if isfile(join("./public/uploads/{}/{}".format(foldername, location), f)) and f == 'package.opf']
      if opf_files:
        found_location = location
        break
      if not opf_files:
        continue
    except:
      pass
  
  if not found_location:
    print("Could not find package.opf")
    return False

  with open('././public/uploads/{}/{}/package.opf'.format(foldername, found_location), 'r', encoding='utf8') as f:
    opf_file = f.read()
  
  return opf_file, found_location

if __name__ == '__main__':
  get_package_opf(sys.argv[1])
