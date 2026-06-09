import urllib.request, json
url = 'https://aic-maamani-api.onrender.com/api/admin/login'
data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'Origin': 'https://aic-maamani.vercel.app'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        print('STATUS', r.status)
        print(dict(r.getheaders()))
        print(r.read().decode('utf-8', errors='replace'))
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(dict(e.headers))
    print(e.read().decode('utf-8', errors='replace'))
except Exception as e:
    print(type(e).__name__, e, str(e))
