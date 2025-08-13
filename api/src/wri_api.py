import sys, requests

WRI_API_ORIGIN="https://api.resourcewatch.org"

def get_user(token):

  response = requests.get(
    WRI_API_ORIGIN + "/v2/user",
    headers = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  )

  print(response.json(), file=sys.stderr)

