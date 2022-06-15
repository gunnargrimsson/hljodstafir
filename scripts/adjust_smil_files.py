from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from scripts.logger import Logger


def adjust_smil_files(smil_files: list, foldername: str, location: str, logger: Logger, adjustment: int = 100):
    """
            Adjusts the smil files based on some threshold that can be set by the user, defaults to 100ms.
            <audio src="audio/Stefnumotun_2022_2025-008-chapter.mp3" clipBegin="00:00:00.000" clipEnd="00:00:00.720"/>
    """
    for smil_file in smil_files:
        # read smil file
        with open('././public/uploads/{}/{}{}'.format(foldername, location, smil_file), 'r') as f:
            smil = f.read()
            # turn to soup
            soup = BeautifulSoup(smil, 'xml')
            # get all audio tags
            audio_tags = soup.find_all('audio')
            for index, audio in enumerate(audio_tags):
                # get clipBegin and clipEnd
                clipBegin = audio.get('clipBegin')
                clipEnd = audio.get('clipEnd')
                if clipBegin and clipEnd:
                    # convert timestamp to number
                    clipBeginAsTime = datetime.strptime(
                        clipBegin, '%H:%M:%S.%f')
                    clipEndAsTime = datetime.strptime(clipEnd, '%H:%M:%S.%f')
                    zeroAsTime = datetime.strptime(
                        '00:00:00.000', '%H:%M:%S.%f')
                    if (clipBeginAsTime == zeroAsTime and index == 0):
                        # only hurry the clipEnd 00:00:00.000
                        newClipEndAsTime = clipEndAsTime - \
                            timedelta(milliseconds=adjustment)
                        newClipEnd = newClipEndAsTime.strftime('%H:%M:%S.%f')[
                            :-3]
                        audio.attrs['clipEnd'] = newClipEnd
                        continue
                    # move forward clipBegin and clipEnd by 100ms
                    newClipBeginAsTime = (
                        clipBeginAsTime - timedelta(milliseconds=adjustment)).time()
                    newClipEndAsTime = (
                        clipEndAsTime - timedelta(milliseconds=adjustment)).time()
                    # convert back to string
                    newClipBegin = newClipBeginAsTime.strftime('%H:%M:%S.%f')[
                        :-3]
                    newClipEnd = newClipEndAsTime.strftime('%H:%M:%S.%f')[:-3]
                    # set the new clipBegin and clipEnd attributes
                    audio.attrs['clipBegin'] = newClipBegin
                    audio.attrs['clipEnd'] = newClipEnd

            # remove colon from top of file
            smil_tag = soup.find('smil')
            smil_tag.attrs['xmlns'] = smil_tag.attrs['xmlns:']
            del smil_tag.attrs['xmlns:']
            # remove xml header
            soup.is_xml = False
            # write the new smil file
            with open('././public/uploads/{}/{}{}'.format(foldername, location, smil_file), 'w', encoding='utf8') as newf:
                newf.write(soup.decode('utf8'))
                logger.print_and_flush(
                    'Adjusted highlighting for smil file: {} by {} ms'.format(smil_file, adjustment))

    # TODO: Adjust the package.opf file as well where it lists the length of each smil file
