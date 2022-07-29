from bs4 import BeautifulSoup
import re
import random
import math
import warnings
import sys
from scripts.logger import Logger

# Ignore URL warnings
warnings.filterwarnings("ignore", category=UserWarning, module='bs4')

# Global Variables
# Having fun with the prefix, names of co-workers
prefix = ['marin', 'alfred', 'gunnar', 'hafthor', 'hulda', 'sigrun', 'einar']
r_prefix = random.choice(prefix)
tags_to_look_out_for = 'h1|h2|h3|h4|h5|p|li|td|th|dt|dd|blockquote'

def write_to_soup(p, sentences, n_suffix, z_fill_len, soup):
    """Returns a list of BeautifulSoup tags to insert into the soup."""
    rtn_arr = []
    # Valid URL characters A-Z, a-z, 0-9, -, ., _, ~, :, /, ?, #, [, ], @, !, $, &, ', (, ), *, +, ,, ;, %, and =.
    contains_links = re.findall(
        r'(<a href\=\"[\w\d\W]+\">[\w\d\W]+</a>)', sentences)
    # Generate a list of sentences using regex string
    sentences = re.split(
        r'([^\.\?\!]+[<\/\w+>]*[\w\s]*[\.\,\w\%\:\;\?\!\(\)\-\"\/]+\s*(\/\w+)*[\/>]*)', sentences)
    # Remove all empty elements in array
    sentences = list(filter(None, sentences))
    # ! print(sentences)
    # Links have numerous '.' inside of them but we shouldn't split them up, so here we are putting them back together.
    for link in contains_links:
        a_opening_index = None
        a_closing_index = None
        # Join the sentences which have links in them to protect them
        for s_index, sentence in enumerate(sentences):
            if a_opening_index == None:
                if '<a href' in sentence:
                    a_opening_index = s_index
            if '</a>' in sentence:
                a_closing_index = s_index
        if a_closing_index != None and a_opening_index != None:
            sentences[a_opening_index:a_closing_index +
                      1] = [''.join(sentences[a_opening_index:a_closing_index+1])]
    # For each sentence create a new span with a unique id and class="sentence" and reinsert it into p
    for s_index, sentence in enumerate(sentences):
        if sentence != '\n' and sentence != '':
            new_tag = soup.new_tag('span')
            new_tag.attrs['id'] = r_prefix + '_' + \
                str(n_suffix).zfill(z_fill_len)
            n_suffix += 1
            new_tag.attrs['class'] = 'sentence'
            new_tag.insert(s_index, BeautifulSoup(
                str(sentence), 'html.parser'))
            rtn_arr.append((s_index, new_tag))
    return rtn_arr


def valid_id(css_id):
    """Returns true if the css_id is valid."""
    # All valid ids start with hix (generated by Hindenburg)
    # d[0-9]+e[0-9]+ pattern is for books made by the danish library (mix of hix and dxxxexx pattern) 
    # block_[0-9]+ was present in one of the icelandic children books
    #? might need to rethink for what pattern to look for or just to grab all tags with ids
    pattern = re.compile('hix[0-9]+|d[0-9]+e[0-9]+|block_[0-9]+')
    return bool(pattern.match(str(css_id)))


def markup(foldername: str, location: str, text_files: list, ignore_aside: bool, logger: Logger):
    """Adds span for each sentence it detects in the paragraph and outputs the file."""
    # Open each text file and mark it up
    current_text_file = None
    try:
        for text_file in text_files:
            current_text_file = text_file
            with open('././public/uploads/{}/{}{}'.format(foldername, location, text_file), 'r', encoding='utf8') as f:
                text = f.read()

            # Turn it into soup
            soup = BeautifulSoup(text, 'html.parser')

            # Check for rerun
            rerun = soup.find(re.compile(
                'span'), class_='sentence', id=re.compile('[a-z]+_[0-9]+'))

            if not rerun:
                # Get all the paragraphs with valid id
                if ignore_aside:
                    paragraphs = [tag for tag in soup.find_all(re.compile(
                        tags_to_look_out_for), id=valid_id) if tag.parent.name != 'aside']
                else:
                    paragraphs = soup.find_all(re.compile(
                        tags_to_look_out_for), id=valid_id)
                # To ensure that a long book with many paragraphs will always have an identifier that fits
                z_fill_len = int(math.log10(
                    1 if len(paragraphs) <= 0 else len(paragraphs)) + 1) + 1
                n_suffix = 1

                for p_index, p in enumerate(paragraphs):
                    # Check for subparagraphs (Evil thing)
                    subparagraphs = BeautifulSoup(str(p.contents), 'html.parser').find_all(
                        re.compile('p|li|td|th|dt|dd'), id=valid_id)
                    sentences = ''
                    if subparagraphs:
                        # Find all links in the subparagraphs
                        sublink = p.select('a[href]')
                        # For each link found, protect them and reinsert them into p at the end
                        for sl_index, sl in enumerate(sublink):
                            sentences = ''.join([str(t) for t in sl.contents])
                            sl.clear()
                            new_tag = soup.new_tag('span')
                            new_tag.attrs['id'] = r_prefix + \
                                '_' + str(n_suffix).zfill(z_fill_len)
                            n_suffix += 1
                            new_tag.attrs['class'] = 'sentence'
                            new_tag.insert(0, BeautifulSoup(
                                str(sentences), 'html.parser'))
                            sl.insert(0, new_tag)
                            break
                    else:
                        sentences = ''.join([str(t) for t in p.contents])
                        # Clear the paragraph of content
                        p.clear()
                        for s_index, new_tag in write_to_soup(p, sentences, n_suffix, z_fill_len, soup):
                            p.insert(s_index, new_tag)
                            n_suffix += 1

                # Write out processed text
                with open('././public/uploads/{}/{}{}'.format(foldername, location, text_file), 'w', encoding='utf8') as f:
                    f.write(soup.decode("utf8"))
    except Exception as e:
        logger.print_and_flush(
            'ERROR: Processing file {} failed with error: {}'.format(current_text_file, e))
        return False
