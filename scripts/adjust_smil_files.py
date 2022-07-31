from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from scripts.logger import Logger

def adjust_package_opf_smil_durations(foldername: str, location: str, smil_file_end_durations: list):
    """
        Adjusts the package.opf file to match the new smil file durations.
    """
    # read package.opf file
    with open('./public/uploads/{}/{}package.opf'.format(foldername, location), 'r', encoding='utf8') as f:
        package_opf = f.read()
        # turn to soup
        soup = BeautifulSoup(package_opf, 'xml')
        # get all smil tags
        meta_tags = soup.find_all('meta', attrs={'property': 'media:duration'})
        total_duration_str = "00:00:00.000"
        # total duration str to datetime
        total_duration = datetime.strptime(total_duration_str, '%H:%M:%S.%f')
        for index, smil_duration in enumerate(smil_file_end_durations):
            # split smil duration into hours, minutes, seconds, milliseconds
            smil_duration_split = smil_duration.split(':')
            # split seconds into seconds and milliseconds
            hours, minutes = smil_duration_split[0], smil_duration_split[1]
            seconds, milliseconds = smil_duration_split[2].split('.')
            # convert to int
            hours, minutes, seconds, milliseconds = int(hours), int(
                minutes), int(seconds), int(milliseconds)
            # add timedelta of smil duration to total duration
            total_duration += timedelta(hours=hours, minutes=minutes,
                                        seconds=seconds, milliseconds=milliseconds)
            meta_content_replacement = smil_duration.replace('00:', '')
            # get the duration from inner text
            meta_tags[index].string.replace_with(meta_content_replacement)
        # convert total duration to string
        total_duration_str = total_duration.strftime('%H:%M:%S.%f')[:-3]
        # replace total duration in package.opf
        meta_tags[-1].string.replace_with(total_duration_str.strip())
        remove_extra_colon(soup, 'package')
        # write the new package.opf file
        with open('./public/uploads/{}/{}package.opf'.format(foldername, location), 'w', encoding='utf8') as newf:
            newf.write(str(soup))


def adjust_smil_file(smil_file: str, foldername: str, location: str, logger: Logger, adjustment: int = 100):
    """
        Adjusts the smil file based on some threshold that can be set by the user, defaults to 100ms.
    """
    newClipEnd = '00:00:00.000'
    with open('././public/uploads/{}/{}{}'.format(foldername, location, smil_file), 'r', encoding='utf8') as f:
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
                try:
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
                except Exception as e:
                    logger.print_and_flush(
                        'WARNING: adjusting smil file exception: {}'.format(e))
                    continue

        # remove colon from top of file
        remove_extra_colon(soup, 'smil')
        # remove xml header
        soup.is_xml = False
        # write the new smil file
        with open('././public/uploads/{}/{}{}'.format(foldername, location, smil_file), 'w', encoding='utf8') as newf:
            newf.write(soup.decode('utf8'))
    return newClipEnd


def adjust_smil_files(smil_files: list, foldername: str, location: str, logger: Logger, adjustment: int = 100):
    """
        Adjusts the smil files based on some threshold that can be set by the user, defaults to 100ms.
        Then adjusts the package.opf file to match the new smil file durations.
    """
    smil_file_end_durations = []
    for smil_file in smil_files:
        end_duration = adjust_smil_file(
            smil_file, foldername, location, logger, adjustment)
        smil_file_end_durations.append(end_duration)
    adjust_package_opf_smil_durations(
        foldername, location, smil_file_end_durations)
    logger.print_and_flush('Adjusted highlighting by {} ms.'.format(adjustment))


def remove_extra_colon(soup: BeautifulSoup, find_tag: str):
    # remove colon from top of file
    tag = soup.find(find_tag)
    if (tag.has_attr('xmlns:')):
        tag.attrs['xmlns'] = tag.attrs['xmlns:']
        del tag.attrs['xmlns:']