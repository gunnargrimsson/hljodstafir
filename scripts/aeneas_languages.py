import json

languages_json = open('constants/languages.json', 'r')
json_content = languages_json.read()
LANGUAGE_CODE_TO_HUMAN = json.loads(json_content)