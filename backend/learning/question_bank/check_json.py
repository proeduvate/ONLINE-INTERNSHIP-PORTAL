import json
import glob

for f in glob.glob('*.json'):
    try:
        json.load(open(f, encoding='utf-8'))
    except Exception as e:
        print(f'Error in {f}: {e}')
