#!/usr/bin/env python3
"""Create one pilot instructor in Supabase Auth (dry-run by default).
No credentials are committed, logged or accepted as command-line flags.
"""
import argparse
import getpass
import json
import os
import re
import sys
import urllib.error
import urllib.request

COURSES={'processus','automatisation','agents','sites-3d'}
DEFAULT_URL='https://daabfmdlgcwcykevvrcm.supabase.co'

def request(path,data,url,key,prefer=None):
    headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'}
    if prefer: headers['Prefer']=prefer
    req=urllib.request.Request(url+path,data=json.dumps(data).encode(),headers=headers,method='POST')
    try:
        with urllib.request.urlopen(req,timeout=15) as response:
            return json.loads(response.read() or '{}')
    except urllib.error.HTTPError as exc:
        raise RuntimeError('Supabase rejected provisioning (HTTP '+str(exc.code)+')') from None

def main():
    parser=argparse.ArgumentParser(description='IAgile Academy instructor onboarding')
    parser.add_argument('--email',required=True)
    parser.add_argument('--course',default='processus',choices=sorted(COURSES))
    parser.add_argument('--display-name',default='Formateur pilote')
    parser.add_argument('--apply',action='store_true',help='Create a real account (default is dry-run)')
    args=parser.parse_args()
    email=args.email.strip().lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email):parser.error('Invalid email')
    if not 2<=len(args.display_name.strip())<=80:parser.error('Invalid display name')
    print('Pilot instructor:',email,'course:',args.course)
    if not args.apply:
        print('DRY RUN — nothing created.')
        return
    key=os.environ.get('SUPABASE_SERVICE_ROLE_KEY','').strip()
    url=os.environ.get('SUPABASE_URL',DEFAULT_URL).strip().rstrip('/')
    if not key or not url.startswith('https://'):
        raise RuntimeError('Administrator key and HTTPS project URL required')
    password=getpass.getpass('New password (at least 12 characters): ')
    if len(password)<12:raise RuntimeError('Weak password')
    created=request('/auth/v1/admin/users',
        {'email':email,'password':password,'email_confirm':True},url,key)
    uid=created.get('id')
    if not isinstance(uid,str) or not re.fullmatch(r'[0-9a-fA-F-]{36}',uid):
        raise RuntimeError('Invalid user ID returned by Auth')
    try:
        request('/rest/v1/academy_profiles?on_conflict=user_id',
            [{'user_id':uid,'display_name':args.display_name.strip(),'account_status':'active'}],
            url,key,'resolution=merge-duplicates,return=minimal')
        request('/rest/v1/academy_instructor_courses?on_conflict=instructor_id,course_slug',
            [{'instructor_id':uid,'course_slug':args.course}],
            url,key,'resolution=ignore-duplicates,return=minimal')
    except RuntimeError:
        print('PARTIAL: Auth account exists; check its instructor assignment.',file=sys.stderr)
        raise
    print('PASS: instructor account created and assigned; courses remain unpublished.')

if __name__=='__main__':
    try:main()
    except RuntimeError as exc:
        print('ERROR:',exc,file=sys.stderr)
        raise SystemExit(1)
