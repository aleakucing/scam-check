import unittest
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run():
    print("=" * 70)
    print("      SCAMGUARD AI - AUTOMATED TEST SUITE & VERIFICATION GATE")
    print("=" * 70)
    
    loader = unittest.TestLoader()
    suite = loader.discover("tests", pattern="test_*.py")
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print(f"[SUCCESS] ALL {result.testsRun} TESTS PASSED! (0 Failures, 0 Errors)")
        print("=" * 70)
        return 0
    else:
        print(f"[FAILURE] TEST SUITE FAILED: {len(result.failures)} Failures, {len(result.errors)} Errors")
        print("=" * 70)
        return 1

if __name__ == "__main__":
    sys.exit(run())
