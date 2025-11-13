
import scholarly
import argparse
from pathlib import Path
import sys
from datetime import datetime
import time


def fetch_and_convert_scholar_to_bibtex(scholar_id, output_file="_bibliography/papers.bib"):
    """
    Fetch publications from Google Scholar and convert to BibTeX format.
    
    Args:
        scholar_id: Your Google Scholar ID (from your profile URL)
        output_file: Output path for the .bib file
    """
    
    print(f"Fetching publications for Scholar ID: {scholar_id}")
    print(f"URL: https://scholar.google.com/citations?user={scholar_id}")
    
    try:
        # Construct the scholar URL
        author_url = f"https://scholar.google.com/citations?user={scholar_id}"
        
        # Search for author by name or try direct URL approach
        # Use the public profile search
        search_query = scholarly.search_author_by_scholar_id(scholar_id)
        author = scholarly.fill(search_query)
        
    except AttributeError:
        # Fallback method if the method doesn't exist
        print("Trying alternative method...")
        try:
            # Try using requests directly to get the profile page
            import requests
            from bs4 import BeautifulSoup
            
            url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract author name
            name_element = soup.find('div', {'id': 'gsc_name'})
            author_name = name_element.text if name_element else "Unknown Author"
            
            print(f"Found author: {author_name}")
            
            # Try with scholarly library after getting the page
            author_search = scholarly.search_author(author_name)
            author = next(author_search)
            author = scholarly.fill(author)
            
        except Exception as e2:
            print(f"Both methods failed. Error: {str(e2)}")
            return False
    
    except Exception as e:
        print(f"Error fetching from Google Scholar: {str(e)}")
        return False
    
    try:
        print(f"Found author: {author.get('name', 'Unknown')}")
        print(f"Citation count: {author.get('citedby', 'N/A')}")
        
        # Get all publications
        publications = author.get('publications', [])
        
        if not publications:
            print("No publications found!")
            return False
        
        print(f"Fetching {len(publications)} publications...")
        
        bibtex_entries = []
        
        for idx, pub in enumerate(publications, 1):
            try:
                pub_title = pub.get('bib', {}).get('title', f'Publication {idx}')[:50]
                print(f"  [{idx}/{len(publications)}] Processing: {pub_title}...")
                
                # Try to fill in publication details
                try:
                    pub_filled = scholarly.fill(pub)
                except:
                    pub_filled = pub
                
                bib_data = pub_filled.get('bib', {})
                
                title = bib_data.get('title', 'Unknown')
                authors = bib_data.get('author', '')
                year = bib_data.get('year', '')
                venue = bib_data.get('venue', '')
                
                # Generate citation key
                if authors:
                    first_author_last = authors.split()[0].lower()
                else:
                    first_author_last = "unknown"
                
                if year:
                    citation_key = f"{first_author_last}{year}"
                else:
                    citation_key = f"{first_author_last}{idx}"
                
                # Create BibTeX entry using string concatenation (avoid f-string issues)
                bibtex_entry = "@article{" + citation_key + ",\n"
                bibtex_entry += "  title = {" + title + "},\n"
                bibtex_entry += "  author = {" + authors + "},\n"
                bibtex_entry += "  journal = {" + venue + "},\n"
                bibtex_entry += "  year = {" + year + "}"
                
                # Add optional fields
                if pub_filled.get('pub_url'):
                    bibtex_entry += ",\n  url = {" + pub_filled.get('pub_url') + "}"
                
                if bib_data.get('number'):
                    bibtex_entry += ",\n  number = {" + bib_data.get('number') + "}"
                
                if bib_data.get('pages'):
                    bibtex_entry += ",\n  pages = {" + bib_data.get('pages') + "}"
                
                if bib_data.get('volume'):
                    bibtex_entry += ",\n  volume = {" + bib_data.get('volume') + "}"
                
                bibtex_entry += "\n}\n"
                bibtex_entries.append(bibtex_entry)
                
                # Add delay to avoid rate limiting
                time.sleep(0.5)
            
            except Exception as e:
                print(f"    Warning: Could not process publication {idx}: {str(e)}")
                continue
        
        # Write to file
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("% Auto-generated from Google Scholar\n")
            f.write(f"% Fetched on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"% Google Scholar ID: {scholar_id}\n")
            f.write("% Note: Please manually add 'selected = {1}' to entries you want highlighted\n\n")
            f.writelines(bibtex_entries)
        
        print(f"\n✓ Successfully wrote {len(bibtex_entries)} publications to {output_file}")
        print("Next steps:")
        print("  1. Edit the file and add 'selected = {1}' to entries you want highlighted")
        print("  2. Run: python generate_papers.py --selected")
        return True
    
    except Exception as e:
        print(f"Error processing publications: {str(e)}")
        return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Fetch publications from Google Scholar and export to BibTeX',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python fetch_google_scholar.py --scholar-id iXfwdp4AAAAJ
  python fetch_google_scholar.py --scholar-id iXfwdp4AAAAJ --output custom_path.bib
        '''
    )
    
    parser.add_argument(
        '--scholar-id',
        required=True,
        help='Your Google Scholar ID (found in your profile URL)'
    )
    
    parser.add_argument(
        '--output',
        default='_bibliography/papers.bib',
        help='Output file path for BibTeX (default: _bibliography/papers.bib)'
    )
    
    args = parser.parse_args()
    
    success = fetch_and_convert_scholar_to_bibtex(args.scholar_id, args.output)
    sys.exit(0 if success else 1)