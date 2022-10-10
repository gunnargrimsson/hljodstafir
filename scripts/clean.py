import re
import os
from bs4 import BeautifulSoup
from scripts.logger import Logger
from config import Config

def clean(foldername, location, text_files, logger: Logger):
    """Cleans the text files for aeneas to correctly force align text and audio."""
    # Encode each segment with xml so that non ascii characters won't get distorted
    encoding = '<?xml version="1.0" encoding="UTF-8"?>\n'
    errors = []
    current_text_file = None

    def is_sentence_or_h1(css_class):
            # If the sentence has the class="ignore" then it will not be included (only needed when some text is not read)
            return (css_class is None or css_class == "sentence" or css_class == "title" or css_class == "page-normal") and css_class != "ignore"

    def has_id_or_not(css_id):
        pattern = re.compile("h[0-9]_[0-9]|hix[0-9]+|[a-z]+_[0-9]+|page-[0-9]+")
        return css_id is None or bool(pattern.match(str(css_id)))
    
    def check_for_text_outside_markup(text_file: str, text: str, logger: Logger):
        """
        Deletes from body all tags and its contents and checks if soup is empty,
        if its not empty then it means that there is text outside the markup.
        Throw a warning to the user about this to be fixed.
        """
        # make a temporary soup
        temp_soup = BeautifulSoup(text, 'html.parser')
        soup_body = temp_soup.body
        # delete all tags and their contents from soup body
        for tag in soup_body.find_all():
            tag.decompose()
        # check if soup body is empty
        remaining_text = soup_body.text.strip()
        if soup_body.text.strip() != "":
            lines = remaining_text.splitlines()
            # clean the lines
            lines = [line.strip() for line in lines if line.strip() != '']
            # format lines a string to be printed
            lines = '\n'.join(lines)
            logger.print_and_flush(
                f"ERROR: Text outside markup in {text_file}")
            logger.print_and_flush(f"ERROR (Problem text):\n{lines}")
            errors.append({
                "error": "Text outside markup",
                "text": lines,
                "file": text_file
            })

    try:
        for id, text_file in enumerate(text_files):
            current_text_file = text_file
            with open(f'./{Config.upload_folder}{foldername}/{location}{text_file}', 'r', encoding='utf8') as f:
                text = f.read()
                soup = BeautifulSoup(text, 'html5lib')
                # Check if there is text outside of the markup (in body, i.e not inside of a p tag or h1 tag)
                check_for_text_outside_markup(text_file, text, logger)
                h = soup.find_all(re.compile('h1|h2|h3|h4|h5|span'), id=has_id_or_not, class_=is_sentence_or_h1, lang=None, style=None, rel=None, recursive=True)
                # make a directory
                if not os.path.exists(f'./{Config.upload_folder}{foldername}/{location}clean'):
                    os.makedirs(f'./{Config.upload_folder}{foldername}/{location}clean')

                with open(f'./{Config.upload_folder}{foldername}/{location}clean/{text_file}', 'w+', encoding='utf8') as f:
                    f.write(encoding)
                    for i in h:
                        if i.text is not None:
                            f.write(str(i))
        if (len(errors) > 0):
            return False
        return True
    except Exception as e:
        logger.print_and_flush(f'ERROR: Cleaning file {current_text_file} failed with error: {e}')
        return False