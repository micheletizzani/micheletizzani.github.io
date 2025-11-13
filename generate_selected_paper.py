#!/usr/bin/env python3
# usage: 
#   python generate_papers.py                              # Generate from default papers.bib
#   python generate_papers.py --bib papers_with_abstract.bib
#   python generate_papers.py --bib papers.bib --selected
#   python generate_papers.py --bib papers_with_abstract.bib --all
#   python generate_papers.py --bib papers.bib --selected --output-prefix scholar
# Requires: pip install pybtex pyyaml

from pybtex.database import parse_file
import yaml
import re
import sys
from pathlib import Path
import argparse


# Default paths
DEFAULT_BIBFILE = "_bibliography/papers.bib"
OUTDIR = "_data"
DEFAULT_SELECTED_OUTFILE = "_data/selected_papers.yml"
DEFAULT_ALL_OUTFILE = "_data/all_papers.yml"


def cleanup_title(t):
    """Remove surrounding braces used in BibTeX."""
    return re.sub(r'^\{|\}$', '', t).replace('\n', ' ').strip()


def get_paper_url(entry):
    """
    Extract URL for the paper, prioritizing:
    1. Direct URL field
    2. DOI (converted to DOI link)
    """
    # Check for direct URL first
    url = entry.fields.get('url', '').strip()
    if url:
        return url
    
    # If no URL, check for DOI
    doi = entry.fields.get('doi', '').strip()
    if doi:
        # Clean up DOI if it already has https://doi.org/ prefix
        if doi.startswith('http'):
            return doi
        else:
            return f"https://doi.org/{doi}"
    
    return None


def extract_paper_data(entry, key):
    """Extract publication data from a BibTeX entry."""
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

    # Get paper URL (prioritize URL over DOI)
    paper_url = get_paper_url(entry)

    return {
        'title': cleanup_title(entry.fields.get('title', '')),
        'author': author_str,
        'journal': entry.fields.get('journal', ''),
        'year': entry.fields.get('year', ''),
        'volume': entry.fields.get('volume', ''),
        'pages': entry.fields.get('pages', ''),
        'url': paper_url,  # URL or DOI link
        'doi': entry.fields.get('doi', ''),
        'abstract': entry.fields.get('abstract', ''),
        'bibkey': key
    }


def generate_papers(bibfile, generate_selected=True, generate_all=True, output_prefix=''):
    """Generate YAML files with paper data from specified BibTeX file."""
    
    if not Path(bibfile).exists():
        print(f"Error: Bib file not found: {bibfile}")
        sys.exit(1)

    # Determine output filenames based on prefix
    if output_prefix:
        selected_outfile = f"{OUTDIR}/{output_prefix}_selected_papers.yml"
        all_outfile = f"{OUTDIR}/{output_prefix}_all_papers.yml"
    else:
        selected_outfile = DEFAULT_SELECTED_OUTFILE
        all_outfile = DEFAULT_ALL_OUTFILE

    print(f"Reading from: {bibfile}")
    print(f"Output prefix: {output_prefix if output_prefix else '(default)'}")

    bib = parse_file(bibfile)
    selected_papers = []
    all_papers = []

    for key, entry in bib.entries.items():
        paper_data = extract_paper_data(entry, key)
        
        # Check if paper is marked as selected
        sel_field = entry.fields.get('selected', '').strip().lower()
        is_selected = sel_field in ('true', '1', 'yes')

        if generate_all:
            all_papers.append(paper_data)
        
        if generate_selected and is_selected:
            selected_papers.append(paper_data)

    # Create output directory
    Path(OUTDIR).mkdir(parents=True, exist_ok=True)

    # Write selected papers YAML
    if generate_selected:
        with open(selected_outfile, 'w', encoding='utf-8') as f:
            yaml.safe_dump(selected_papers, f, allow_unicode=True, sort_keys=False)
        print(f"✓ Wrote {selected_outfile} with {len(selected_papers)} entries")

    # Write all papers YAML
    if generate_all:
        with open(all_outfile, 'w', encoding='utf-8') as f:
            yaml.safe_dump(all_papers, f, allow_unicode=True, sort_keys=False)
        print(f"✓ Wrote {all_outfile} with {len(all_papers)} entries")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Generate YAML files from BibTeX bibliography.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Use default papers.bib
  python generate_papers.py
  python generate_papers.py --selected
  python generate_papers.py --all
  
  # Use specific .bib file
  python generate_papers.py --bib _bibliography/papers_with_abstract.bib
  python generate_papers.py --bib _bibliography/papers_with_abstract.bib --selected
  
  # Use specific .bib file with custom output prefix
  python generate_papers.py --bib _bibliography/papers.bib --output-prefix scholar
  python generate_papers.py --bib _bibliography/papers_with_abstract.bib --output-prefix detailed
  
  # This will generate:
  # _data/scholar_selected_papers.yml
  # _data/scholar_all_papers.yml
  # _data/detailed_selected_papers.yml
  # _data/detailed_all_papers.yml
        '''
    )
    
    parser.add_argument(
        '--bib',
        default=DEFAULT_BIBFILE,
        help=f'Path to BibTeX file (default: {DEFAULT_BIBFILE})'
    )
    
    parser.add_argument(
        '--selected',
        action='store_true',
        help='Generate only selected papers (marked with selected=1 in .bib)'
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate only all papers'
    )

    parser.add_argument(
        '--output-prefix',
        default='',
        help='Prefix for output filenames (e.g., "scholar" produces scholar_selected_papers.yml)'
    )

    args = parser.parse_args()

    # Default: generate both if no arguments specified
    if not args.selected and not args.all:
        generate_papers(
            args.bib,
            generate_selected=True,
            generate_all=True,
            output_prefix=args.output_prefix
        )
    else:
        generate_papers(
            args.bib,
            generate_selected=args.selected,
            generate_all=args.all,
            output_prefix=args.output_prefix
        )