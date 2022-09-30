from scripts.logger import Logger
from config import Config

def add_parent_highlighting(foldername: str, location: str, text_files: list, logger: Logger):
    """Add parental highlighting script and css to all xhtml files in book."""
    # get the css file and javascript files in /utilities
    css = open('./utilities/highlightObserver.css',
               'r', encoding='utf8').read()
    js = open('./utilities/highlightObserver.js', 'r', encoding='utf8').read()
    # write css and js file to the root of the book
    with open(f'{Config.upload_folder}{foldername}/{location}/highlightObserver.js', 'w', encoding='utf8') as f:
        f.write(js)
    with open(f'{Config.upload_folder}{foldername}/{location}/highlightObserver.css', 'w', encoding='utf8') as f:
        f.write(css)
    # add the css and js files to each xhtml text file
    for file in text_files:
        with open(f'{Config.upload_folder}{foldername}/{location}/{file}', 'r', encoding='utf8') as f:
            text = f.read()
        with open(f'{Config.upload_folder}{foldername}/{location}/{file}', 'w', encoding='utf8') as f:
            f.write(text.replace(
                '</head>', '<link href="highlightObserver.css" rel="stylesheet" type="text/css" />\n</head>').replace(
                '</body>', '<script src="highlightObserver.js"></script>\n</body>'))
    # Add the references to package.opf
    with open(f'{Config.upload_folder}{foldername}/{location}/package.opf', 'r', encoding='utf8') as f:
        text = f.read()
    with open(f'{Config.upload_folder}{foldername}/{location}/package.opf', 'w', encoding='utf8') as f:
        f.write(text.replace(
            '</manifest>', '<item href="highlightObserver.css" id="highlightObserver.css" media-type="text/css"/>\n<item href="highlightObserver.js" id="highlightObserver.js" media-type="application/javascript"/>\n</manifest>'))
    logger.print_and_flush('Added parental highlighting to book.')
