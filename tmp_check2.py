import urllib.request

req = urllib.request.Request(
    "https://aic-maamani-api.onrender.com/api/admin/login",
    method="OPTIONS",
    headers={
        "Origin": "https://aic-maamani.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    },
)
with urllib.request.urlopen(req, timeout=20) as r:
    print('STATUS', r.status)
    print(dict(r.getheaders()))
