import urllib.request, urllib.error, json

# Perform login and follow with /me using returned cookie
login_url = 'https://aic-maamani-api.onrender.com/api/admin/login'
me_url = 'https://aic-maamani-api.onrender.com/api/admin/me'
login_data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
login_req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json', 'Origin': 'https://aic-maamani.vercel.app'}, method='POST')
with urllib.request.urlopen(login_req, timeout=20) as r:
    print('LOGIN STATUS', r.status)
    headers = dict(r.getheaders())
    print(headers)
    print(r.read().decode('utf-8', errors='replace'))
    cookie = headers.get('Set-Cookie')
    print('COOKIE', cookie)

if not cookie:
    raise SystemExit('No cookie returned')

# send /me with cookie
me_req = urllib.request.Request(me_url, headers={'Origin': 'https://aic-maamani.vercel.app', 'Cookie': cookie}, method='GET')
with urllib.request.urlopen(me_req, timeout=20) as r:
    print('ME STATUS', r.status)
    print(dict(r.getheaders()))
    print(r.read().decode('utf-8', errors='replace'))
