import io
import os
import sys
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch
import provision_pilot_instructor as provision

class InstructorProvisionTests(unittest.TestCase):
    def test_default_is_dry_run_and_never_calls_external_api(self):
        with patch.object(sys,'argv',['provision','--email','test@example.invalid']), \
             patch.object(provision,'request',side_effect=AssertionError('HTTP should not run')), \
             redirect_stdout(io.StringIO()) as output:
            provision.main()
        self.assertIn('DRY RUN',output.getvalue())

    def test_apply_requires_admin_key_before_password(self):
        with patch.object(sys,'argv',['provision','--email','test@example.invalid','--apply']), \
             patch.dict(os.environ,{'SUPABASE_SERVICE_ROLE_KEY':''}), \
             patch.object(provision.getpass,'getpass',side_effect=AssertionError('No password requested yet')):
            with self.assertRaisesRegex(RuntimeError,'Administrator key'):
                provision.main()

    def test_provision_scopes_instructor_to_requested_course(self):
        calls=[]
        def fake_request(path,data,url,key,prefer=None):
            calls.append((path,data))
            if path.endswith('/admin/users'):
                return {'id':'123e4567-e89b-12d3-a456-426614174000'}
            return {}
        with patch.object(sys,'argv',['provision','--email','test@example.invalid','--course','processus','--apply']), \
             patch.dict(os.environ,{'SUPABASE_SERVICE_ROLE_KEY':'unit-test-key','SUPABASE_URL':'https://example.invalid'}), \
             patch.object(provision.getpass,'getpass',return_value='test-password-1234'), \
             patch.object(provision,'request',side_effect=fake_request), \
             redirect_stdout(io.StringIO()):
            provision.main()
        self.assertEqual(len(calls),3)
        self.assertEqual(calls[2][1][0]['course_slug'],'processus')
        self.assertEqual(calls[1][1][0]['account_status'],'active')

if __name__=='__main__':
    unittest.main()
