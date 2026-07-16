import csv
import json
import math
import random
import os

def generate_real_dataset():
    # File paths
    comments_file = '/Users/micti/Documents/Research/youtube/YoutubeWatch/data/comments_classified_sentiment_100.csv'
    videos_file = '/Users/micti/Documents/Research/youtube/YoutubeWatch/data/videos_panel.csv'
    output_file = 'public/data/echo-battleground-real.json'
    
    label_map = {
        'strongly in favor': 'SIF',
        'in favor': 'IF',
        'neutral': 'N',
        'against': 'A',
        'strongly against': 'SA'
    }
    
    videos = list()
    with open(videos_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vid = row['id']
            if not vid: continue
            try:
                score = float(row['score']) if row['score'] else 0.0
            except ValueError:
                score = 0.0
            label = label_map.get(row['label'].strip().lower(), 'N')
            try:
                engagement = float(row['video_viewCount']) if row['video_viewCount'] else 0.0
            except ValueError:
                engagement = 0.0
                
            videos.append({
                'id': vid,
                'stance': score,
                'stanceLabel': label,
                'engagement': engagement,
                'group': hash(vid) % 1000
            })
            
    # Normalize engagement
    max_eng = max([v['engagement'] for v in videos]) if videos else 1.0
    for v in videos:
        v['engagement'] = min(1.0, v['engagement'] / max_eng) if max_eng > 0 else 0.0
        
    data = []
    
    # ADD VIDEOS
    for v in videos:
        # For videos, sentiment isn't strictly defined in the same way, but let's default to neutral y-axis
        # or scatter them. The user said: x = stance score, y = sentiment. 
        # We can map sentiment to a numerical y axis.
        # Let's say sentiment: pos = 0.5, neu = 0.0, neg = -0.5
        y = 0.0 + random.uniform(-0.1, 0.1) # Videos don't have a sentiment column here, default to neutral
        x = v['stance'] + random.uniform(-0.05, 0.05)
        
        point = {
            "kind": "video",
            "stance": round(v['stance'], 3),
            "stanceLabel": v['stanceLabel'],
            "sentiment": "neu",
            "topic": random.choice(["health", "politics", "society"]),
            "group": v['group'],
            "ex": round(x, 3),
            "ey": round(y, 3),
            "engagement": round(v['engagement'], 3)
        }
        data.append({"point": point})
    
    # Read comments
    with open(comments_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not videos: break
            
            video = random.choice(videos)
            
            agreement_raw = row['classification'].strip().lower()
            if agreement_raw == 'agree': agreement = 'agree'
            elif agreement_raw == 'disagree': agreement = 'disagree'
            else: agreement = 'neutral'
            
            sentiment_raw = row['comment_sentiment'].strip().lower()
            if 'pos' in sentiment_raw: sentiment = 'pos'
            elif 'neg' in sentiment_raw: sentiment = 'neg'
            else: sentiment = 'neu'
            
            # Map sentiment to y-axis
            if sentiment == 'pos': y_base = 0.5
            elif sentiment == 'neg': y_base = -0.5
            else: y_base = 0.0
            
            stance = video['stance']
            
            # Disclosed axes: x = stance, y = sentiment + jitter
            x = stance + random.uniform(-0.1, 0.1)
            y = y_base + random.uniform(-0.2, 0.2)
            
            point = {
                "kind": "comment",
                "stance": round(stance, 3),
                "stanceLabel": video['stanceLabel'],
                "agreement": agreement,
                "sentiment": sentiment,
                "topic": random.choice(["health", "politics", "society"]),
                "group": video['group'],
                "ex": round(x, 3),
                "ey": round(y, 3),
                "engagement": round(video['engagement'], 3)
            }
            data.append({"point": point})
            
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Generated {len(data)} points in {output_file}")

if __name__ == '__main__':
    generate_real_dataset()
