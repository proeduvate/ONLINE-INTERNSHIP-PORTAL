import os

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "from '../api'" in content:
                content = content.replace("from '../api'", "from '../api/axios'")
            if "from '../../api'" in content:
                content = content.replace("from '../../api'", "from '../../api/axios'")

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
