import os
from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from os import listdir
from os.path import isfile, join
from datetime import datetime
from scripts.markup import markup
from scripts.generate_ids import generate_id
from scripts.clean import clean
from scripts.print_and_flush import print_and_flush
from scripts.remove_files import remove_files
from scripts.segment import segment
from scripts.prefix import get_smil_prefix
# from scripts.smil_process import process_smil_files
from scripts.combine import combine_smil_files
from scripts.remove_extra import remove_extra_files
from scripts.extract_epub import extract_epub
from scripts.zip_epub import zip_epub
from scripts.get_package_opf import get_package_opf
from scripts.get_files_from_package_opf import get_files_from_package_opf
from scripts.aeneas_languages import LANGUAGE_CODE_TO_HUMAN as languages
import sys

# ! Changing to epub only scripts will not support daisy books anymore ?
# ? Do I need to support both daisy books and epub books ?

if __name__ == "__main__":
    try:
        language_code = sys.argv[3] if len(sys.argv) >= 3 else 'isl'
        print_and_flush("Language: {}".format(languages[language_code.upper()]))
        foldername = sys.argv[1]

        extract_epub(foldername)

        package_opf, location = get_package_opf(foldername)
        if not package_opf:
            raise Exception(
                "Could not find package.opf, Not a valid EPUB File.\nPlease fix, refresh and try again.")

        audio_files = get_files_from_package_opf(package_opf, 'audio/mpeg')
        text_files = get_files_from_package_opf(
            package_opf, 'application/xhtml+xml')

        print_and_flush("Audio Files: {}".format(len(audio_files)))
        print_and_flush("Text Files: {}".format(len(text_files)), 0.1)

        segmentation_correct = len(audio_files) == len(text_files)
        if not segmentation_correct:
            print("ERROR: Number of mp3 files and number of segments do not match.\nPlease fix, refresh and try again.")
            raise Exception(
                "Number of mp3 files and number of segments do not match.\nPlease fix, refresh and try again.")

        markup(foldername, location, text_files)
        # ? generate_id(foldername)
        # ? clean(foldername)

        for i, mp3 in enumerate(audio_files):
            # Setup config string & absolute file path for audio/text/syncfile
            config_string = "task_language={}|is_text_type=unparsed|os_task_file_format=smil|os_task_file_smil_audio_ref={}|os_task_file_smil_page_ref={}".format(
                language_code, mp3, text_files[i])
            # Create Task
            task = Task(config_string=config_string)
            task.audio_file_path_absolute = "./public/uploads/{}/{}{}".format(
                foldername, location, mp3)
            task.text_file_path_absolute = "./public/uploads/{}/{}{}".format(
                foldername, location, text_files[i])
            # Each smil file is named the expected smil_prefix + number with leading zeros (3 or 4)
            task.sync_map_file_path_absolute = "./public/uploads/{}/{}{}.smil".format(
                foldername, location, text_files[i].split('.')[0])

            # stdout.flush forces the progress print to be relayed to the server in real time
            print_and_flush("Processing.. {}/{}".format(i+1, len(audio_files)))

            # Execute Task to output path
            ExecuteTask(task).execute()
            task.output_sync_map_file()

        zip_epub(foldername)
        print_and_flush("DONE")
        remove_files(foldername)
        exit()
        # ? Steps needed for epub:
        #     ? 0. Find package.opf
        #     ? 1. Read package.opf
        #     ? 2. Get the location of all the files in the epub, mainly the xhtml and mp3 files
        #     ? 3. Markup each xhtml file with sentence level markup instead of paragraph and send them through Aeneas
        #     ? 4. Replace all the smil references with the new smil references? Same number of smil files as hindenburg puts into package.opf (if same name then not needed?)
        # ! Steps no longer necessary
        #     ! 1. process smil
        #     ! 2. clean?
        #     ! 3. segment?
        #     ! 4. combine smil files?

        # ? Do we need a folder structure / tree check, or should we just assume that the folder structure is correct ?
        # ? examples of different folder structures:
        #     ? 1. EPUB/Content/ (all the files under that directory) (this is the default folder structure for daisy books converted to epub?)
        #     ? 2. EPUB/ (audio/images/files) (this is the default folder structure for epub books straight out of hindenburg?)
        #     ? 3. GoogleDoc/ (all the files under that directory) (this is the default folder structure for google docs converted to epub?)
        # Only include the mp3 files and sort for linux env
        # ! ↓ Old code ↓ currently being skipped (will be removed later)
        mp3files = [f for f in listdir("./public/uploads/{}/EPUB/audio/".format(foldername)) if isfile(
            join("./public/uploads/{}/EPUB/audio/".format(foldername), f)) and f.endswith(".mp3")]
        mp3files.sort()

        # Copy original to output before working on it
        # shutil.copytree("./public/uploads/{}/".format(foldername), "./public/output/{}/".format(foldername))

        # Generate markup, takes all paragraphs and turns them into sentences
        # replacing publisher, will NOT run if publisher has already generated the sentences
        markup(foldername, bookname)

        # Makes sure that all spans with class="sentence" have some ID
        generate_id(foldername, bookname)

        # Clean the book before segmenting
        # Combs the book for headers and sentences
        clean(foldername, bookname)

        # Segment the book
        # Outputs the segments to a seperate folder located in ./output/bookname/
        segment(foldername, bookname)

        # Only include the text files that end in html
        segments = [f for f in listdir("./public/uploads/{}/EPUB/Content/segments/".format(foldername)) if isfile(
            join("./public/uploads/{}/EPUB/Content/segments/".format(foldername), f)) and f.endswith(".xhtml")]
        segments.sort()

        # There needs to be the same number of mp3 files as there are segment files. 1 to 1 ratio!
        print("{} - Number of mp3 files: {}".format(
            datetime.now().time().strftime("%H:%M:%S"), len(mp3files)))
        print("{} - Number of segments: {}".format(
            datetime.now().time().strftime("%H:%M:%S"), len(segments)))
        # Clear buffer
        sys.stdout.flush()

        segmentation_correct = len(mp3files) == len(segments)

        if segmentation_correct:
            # smil_prefix, smil_num_len = get_smil_prefix(foldername)

            # Run through each mp3 file and book segment
            for i, mp3 in enumerate(mp3files):
                # Setup config string & absolute file path for audio/text/syncfile
                config_string = "task_language={}|is_text_type=unparsed|os_task_file_format=smil|os_task_file_smil_audio_ref={}|os_task_file_smil_page_ref={}.xhtml".format(
                    language, mp3, bookname)
                # Create Task
                task = Task(config_string=config_string)
                task.audio_file_path_absolute = "./public/uploads/{}/EPUB/Content/{}".format(
                    foldername, mp3)
                task.text_file_path_absolute = "./public/uploads/{}/EPUB/Content/segments/b{}.xhtml".format(
                    foldername, i+1)
                # Each smil file is named the expected smil_prefix + number with leading zeros (3 or 4)
                task.sync_map_file_path_absolute = "./public/uploads/{}/EPUB/Content/{}{}.smil".format(
                    foldername, 's_', str(i+1).zfill(4))

                # stdout.flush forces the progress print to be relayed to the server in real time
                print(
                    "{} - {}/{}".format(datetime.now().time().strftime("%H:%M:%S"), i+1, len(mp3files)))
                # Clear buffer
                sys.stdout.flush()

                # Execute Task to output path
                ExecuteTask(task).execute()
                task.output_sync_map_file()
            jobDone = True
        else:
            # Raise the exception if segmented files dont match mp3 files (equal number of files)
            raise Exception(
                "The number of segmentation files and mp3 files does not match.\nPlease fix, refresh and try again.")
        if jobDone:
            print("{} - Job done!".format(datetime.now().time().strftime("%H:%M:%S")))
            # Process the smil files, converting from smil v3 (aeneas) to smil v1 which most daisy readers use
            # ! Smil Files need to be v3 for EPUB not v1 like daisy
            # process_smil_files(foldername)
            combine_smil_files(foldername)
            remove_extra_files(foldername, bookname)
            zip_epub(foldername)
            # shutil.make_archive("./public/output/{}".format(foldername), 'zip', "./public/output/{}".format(foldername))
            # This "Done" print statement is used by the server to detect when the program finishes running. (Websocket is listening for it)
            print("Done")

    except Exception as e:
        print("ERROR: ", e)
        raise
    # Delete output/bookname/ folder and files when aeneas is done processing
    # shutil.rmtree("./public/output/{}".format(foldername))
    # Delete uploads/bookname/ folder and files when aeneas is done processing
    # shutil.rmtree("./public/uploads/{}".format(foldername))
