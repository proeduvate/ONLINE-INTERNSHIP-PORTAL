import unittest
try:
    from app import execute_code_submission
    from app import models, database
except ImportError:
    from .app import execute_code_submission
    from . from app import models, database

class SandboxRunnerTest(unittest.TestCase):
    def test_simple_print(self):
        # Create a fake task-like object for test cases
        class T:
            test_cases = None

        code = "print('hello world')"
        res = execute_code_submission(code, T())
        self.assertIn('syntax_valid', res)
        self.assertTrue(res['syntax_valid'])
        self.assertIn('runtime_score', res)
        # If no test cases provided, runner should still run and return successful status boolean
        self.assertIn('successful', res)

if __name__ == '__main__':
    unittest.main()
