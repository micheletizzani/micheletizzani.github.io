#!/usr/bin/env python3
# Wrapper to fetch publications using scholar.py

import subprocess
import sys
from pathlib import Path


def fetch_publications(author_name, output_file="_bibliography/papers.bib"):
    """Fetch publications from Google Scholar using scholar.py"""
    
    print(f"Fetching publications for: {author_name}")
    
    try:
        # Run scholar.py with BibTeX output
        result = subprocess.run(
            [sys.executable, 'scholar.py', '--author', author_name, '--citation', 'bt'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        
        # Write to file
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result.stdout)
        
        print(f"✓ Successfully wrote publications to {output_file}")
        print("\nNext steps:")
        print("  1. Edit the file and add 'selected = {1}' to entries you want highlighted")
        print("  2. Run: python generate_papers.py --selected")
        return True
        
    except subprocess.TimeoutExpired:
        print("Error: Request timed out (Google Scholar may be blocking)")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Fetch publications from Google Scholar using scholar.py'
    )
    
    parser.add_argument(
        '--author',
        default='Michele Tizzani',
        help='Author name to search for (default: Michele Tizzani)'
    )
    
    parser.add_argument(
        '--output',
        default='_bibliography/papers.bib',
        help='Output file path'
    )
    
    args = parser.parse_args()
    
    success = fetch_publications(args.author, args.output)
    sys.exit(0 if success else 1)
