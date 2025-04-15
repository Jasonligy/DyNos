import pandas as pd
from datetime import timedelta

df = pd.read_csv("/Users/liguangyu/Desktop/tue/fyp/dynos-webgl/data/Rugby_tweets/pro12_mentions.csv", parse_dates=["date"])

# Normalize team matchups (sort team1 and team2)
df["matchup"] = df.apply(lambda row: "_vs_".join(sorted([row["tweeting_user"], row["mentioned_user"]])), axis=1)

# Sort by timestamp
# df = df.sort_values("timestamp")

# Deduplicate within 7-day windows
seen = {}
filtered_rows = []

for _, row in df.iterrows():
    ts = row["date"]
    matchup = row["matchup"]
    last_seen = seen.get(matchup)
    if not last_seen or (ts - last_seen > timedelta(days=1)):
        filtered_rows.append(row)
        seen[matchup] = ts

filtered_df = pd.DataFrame(filtered_rows)
# print(filtered_df[["date", "tweeting_user", "mentioned_user"]])
game_counts = pd.concat([
    filtered_df["tweeting_user"],
    filtered_df["mentioned_user"]
]).value_counts()

# Convert to DataFrame for nicer formatting
team_game_counts = game_counts.rename_axis("team").reset_index(name="games_played")

print(team_game_counts)