import re
from bs4 import BeautifulSoup
from os import listdir
from os.path import isfile, join
import sys

xml = '<?xml version="1.0" encoding="utf-8"?>'
top = '<smil xmlns="http://www.w3.org/ns/SMIL" xmlns:epub="http://www.idpf.org/2007/ops" version="3.0">\n<body>'
bottom = '</body>\n</smil>'


def combine_smil_files(foldername):
    smil_files = [f for f in listdir("././public/uploads/{}/EPUB/Content/".format(foldername)) if isfile(join(
        "././public/uploads/{}/EPUB/Content/".format(foldername), f)) and f.endswith(".smil") and not 'master' in f]
    smil_files.sort()

    combinedSoup = BeautifulSoup(xml + top + bottom, 'html.parser')
    combinedSoupBody = combinedSoup.find(re.compile('body'))

    if (len(smil_files) == 0):
        print("No smil files found in {}".format(foldername))
        sys.stdout.flush()
        return

    if (len(smil_files) == 1):
        print("Only one smil file found in {}".format(foldername))
        sys.stdout.flush()
        return

    for index, smil_file in enumerate(smil_files):
        with open('././public/uploads/{}/EPUB/Content/{}'.format(foldername, smil_file), 'r', encoding='utf8') as f:
            smil = f.read()

        # Turn it into soup
        smilSoup = BeautifulSoup(smil, 'xml')
        smilSoupSeq = smilSoup.find(re.compile('seq'))
        smilSoupSeq.attrs['id'] = 'seq_{}'.format(index + 1)
        combinedSoupBody.append('\n')
        combinedSoupBody.append(smilSoupSeq)
    combinedSoupBody.append('\n')

    print("Combined {} smil files into one".format(len(smil_files)))
    sys.stdout.flush()

    # Find the smil file reference in package.opf or create if it doesn't exist
    with open('././public/uploads/{}/EPUB/package.opf'.format(foldername), 'r', encoding='utf8') as f:
        packageOPF = f.read()

    packageOPFSoup = BeautifulSoup(packageOPF, 'xml')
    packageOPFSoupManifest = packageOPFSoup.find(re.compile('manifest'))
    test = packageOPFSoupManifest.find(
        'item', {'media-type': 'application/smil+xml'})
    test['href'] = 'Content/master.smil'

    # Fix package opf extra colon ':' in 'package' tag (Very strange bug or side effect of using beautifulsoup)
    packageOPFSoup.package.attrs['xmlns'] = 'http://www.idpf.org/2007/opf'
    # Remove offending tag and attribute
    del packageOPFSoup.package['xmlns:']

    # Write the new package.opf
    with open('././public/uploads/{}/EPUB/package.opf'.format(foldername), 'w', encoding='utf8') as f:
        f.write(str(packageOPFSoup))
    
    # Write the new master.smil
    with open('././public/uploads/{}/EPUB/Content/master.smil'.format(foldername), 'w', encoding='utf8') as f:
        f.write(str(combinedSoup))


if __name__ == '__main__':
    combine_smil_files(sys.argv[1])
