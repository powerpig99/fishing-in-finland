import urllib.request
import json

candidates = {
    "siianonginta": ["8c4LTuBbnpc", "tOO34l58hTA", "e61LcTPdwas", "pZL9zzd72Cs"],
    "jigaus": ["REsf5QnOHE0", "yHBpzqrep5o", "KIk-weKfMhg", "0BUhF-YTKAg"],
    "silakka": ["8hMqwaqMi6s", "pADe12v3fMY", "XmPNPsNn2K0", "Yws4vNC7ToY"],
    "pilkinta": ["2XFPn9XKnPU", "-IDvDU_gitw", "jqkjIp3gPmM", "NIYtvAbiUbQ"],
    "solmut": ["mxrqIiZ3DOA", "SCa7ZupW8Q0", "VPPtP97gnrE", "lCs0GIK_F6Q"],
    "fileointi": ["YrfpQjGJcY4", "0bZFo8zYVtg", "u-6RpnbNrXc", "WpnUYt451B4"],
    "lohikeitto": ["6JJQUHIWnUQ", "B6r_L3sY-xg", "O8oIyvQowcg", "69D3EYPf2ZU"]
}

verified = {}

for cat, vids in candidates.items():
    verified[cat] = []
    for vid in vids:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(oembed_url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    title = data.get("title", "")
                    author = data.get("author_name", "")
                    verified[cat].append({
                        "id": vid,
                        "title": title,
                        "author": author
                    })
                    print(f"[{cat}] VALID: {vid} - {title} by {author}")
        except Exception as e:
            print(f"[{cat}] INVALID: {vid} ({e})")

with open("verified_videos.json", "w") as f:
    json.dump(verified, f, indent=2)
print("Saved verified_videos.json")
