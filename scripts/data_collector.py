import requests
import sqlite3
import time
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv("API_KEY")


Region = "europe"
Username_Input = "Hisslyn"
Region_Input = "EUNE"

BASE_URL = f"https://{Region}.api.riotgames.com"  # Replace <REGION> with your target region


PUUID_OBJECT = requests.get(f"https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{Username_Input}/{Region_Input}?api_key={API_KEY}")

PUUID_STRING = PUUID_OBJECT.content.decode()


PUUID_DICT = json.loads(PUUID_STRING)
puuid = PUUID_DICT["puuid"]
summoner_name = PUUID_DICT["gameName"]
summoner_region = PUUID_DICT["tagLine"]

SECOND_REQUEST = requests.get(f"https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={API_KEY}")


SUMMONER_STRING = SECOND_REQUEST.content.decode()

SUMMONER_DICT = json.loads(SUMMONER_STRING)

id = SUMMONER_DICT["id"]
accoundId = SUMMONER_DICT["accountId"]
curr_puuid = SUMMONER_DICT["puuid"]
profileIconId = SUMMONER_DICT["profileIconId"]
revisionDate = SUMMONER_DICT["revisionDate"]
summonerLevel = SUMMONER_DICT["summonerLevel"]

print(summonerLevel)
print(puuid)

startTime = "" #
endTime = ""
queue = ""
type = ""
start = 0 # default is 0 btw
count = 10

THIRD_REQUEST = requests.get(f"https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/OHilX7IM5u82IuPdlQRc8vsxmyoc-8zDcOsENQsdfe2fXxXn5xYRshutNYUNCI_2MoXriozEwBDpwA/ids?start={start}&count={count}&api_key=RGAPI-2fbebada-a586-4401-82fd-734ceb1478a7")

MATCH_ARRAY_STR = THIRD_REQUEST.content.decode()

MATCH_ARRAY = json.loads(MATCH_ARRAY_STR)

print(MATCH_ARRAY)