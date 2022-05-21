import re
import os
from bs4 import BeautifulSoup
from scripts.logger import Logger

def clean(foldername, location, text_files, logger: Logger):
    """Cleans the text files for aeneas to correctly force align text and audio."""
    # Encode each segment with xml so that non ascii characters won't get distorted
    encoding = '<?xml version="1.0" encoding="UTF-8"?>\n'

    def is_sentence_or_h1(css_class):
            # If the sentence has the class="ignore" then it will not be included (only needed when some text is not read)
            return (css_class is None or css_class == "sentence" or css_class == "title" or css_class == "page-normal") and css_class != "ignore"

    def has_id_or_not(css_id):
        pattern = re.compile("h[0-9]_[0-9]|hix[0-9]+|[a-z]+_[0-9]+|page-[0-9]+")
        return css_id is None or bool(pattern.match(str(css_id)))

    try:
        for id, text_file in enumerate(text_files):
            current_text_file = text_file
            with open('././public/uploads/{}/{}{}'.format(foldername, location, text_file), 'r', encoding='utf8') as f:
                text = f.read()
                soup = BeautifulSoup(text, 'html5lib')

                h = soup.find_all(re.compile('h1|h2|h3|h4|h5|span'), id=has_id_or_not, class_=is_sentence_or_h1, lang=None, style=None, rel=None, recursive=True)

                # make a directory
                if not os.path.exists('././public/uploads/{}/{}clean'.format(foldername, location)):
                    os.makedirs('././public/uploads/{}/{}clean'.format(foldername, location))

                with open('././public/uploads/{}/{}clean/{}'.format(foldername, location, text_file), 'w+', encoding='utf8') as f:
                    f.write(encoding)
                    for i in h:
                        if i.text is not None:
                            f.write(str(i))
    except Exception as e:
        logger.print_and_flush('ERROR: Cleaning file {} failed with error: {}'.format(current_text_file, e))
        return False