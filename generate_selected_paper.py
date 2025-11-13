#!/usr/bin/env python3
# usage: python generate_selected_papers.py
# Requires: pip install pybtex pyyaml

from pybtex.database import parse_file
import yaml
import re
import sys
from pathlib import Path

# Adjust this path to your .bib file location
BIBFILE = "_bibliography/papers.bib"   # <-- change if your .bib has a different name/path
OUTFILE = "_data/selected_papers.yml"

if not Path(BIBFILE).exists():
    print(f"Bib file not found: {BIBFILE}")
    sys.exit(1)

bib = parse_file(BIBFILE)
selected = []

def cleanup_title(t):
    # remove surrounding braces used in BibTeX
    return re.sub(r'^\{|\}$', '', t).replace('\n', ' ').strip()

for key, entry in bib.entries.items():
    print("Processing entry:", key)
    sel_field = entry.fields.get('selected', '').strip().lower()
    print(" selected field:", sel_field)
    if sel_field not in ('true', '1', 'yes'):
        continue

    # authors: join "Last, First" or available names
    authors = []
    for person in entry.persons.get('author', []):
        parts = []
        # pybtex Person API: persons have first_names, last_names
        if person.last_names:
            parts.append(' '.join(person.last_names))
        if person.first_names:
            parts.append(' '.join(person.first_names))
        authors.append(', '.join(parts))
    author_str = '; '.join(authors) if authors else entry.fields.get('author', '')

    selected.append({
        'title': cleanup_title(entry.fields.get('title', '')),
        'author': author_str,
        'journal': entry.fields.get('journal', ''),
        'year': entry.fields.get('year', ''),
        'volume': entry.fields.get('volume', ''),
        'pages': entry.fields.get('pages', ''),
        'url': entry.fields.get('url', ''),
        'abstract': entry.fields.get('abstract', ''),
        'bibkey': key
    })
print(selected)
# write YAML
Path("_data").mkdir(parents=True, exist_ok=True)
with open(OUTFILE, 'w', encoding='utf-8') as f:
    yaml.safe_dump(selected, f, allow_unicode=True, sort_keys=False)

print(f"Wrote {OUTFILE} with {len(selected)} entries")