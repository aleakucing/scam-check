import unittest
from app.models.schemas import InterviewRequest
from app.services.exposure_evaluator import evaluate_exposure

class TestExposureEvaluator(unittest.TestCase):

    def test_initial_state(self):
        req = InterviewRequest(case_id="SC-TEST-001", opened_link=None)
        res = evaluate_exposure(req)
        self.assertEqual(res.user_exposure, 10)
        self.assertFalse(res.is_emergency)

    def test_link_opened(self):
        req = InterviewRequest(case_id="SC-TEST-002", opened_link=True, entered_credentials=False)
        res = evaluate_exposure(req)
        self.assertEqual(res.user_exposure, 35)
        self.assertFalse(res.is_emergency)

    def test_credentials_entered(self):
        req = InterviewRequest(case_id="SC-TEST-003", opened_link=True, entered_credentials=True, entered_otp=False)
        res = evaluate_exposure(req)
        self.assertEqual(res.user_exposure, 70)
        self.assertTrue(res.is_emergency)
        self.assertIn("Darurat", res.emergency_title)

    def test_otp_compromised_emergency(self):
        req = InterviewRequest(case_id="SC-TEST-004", opened_link=True, entered_credentials=True, entered_otp=True)
        res = evaluate_exposure(req)
        self.assertEqual(res.user_exposure, 90)
        self.assertTrue(res.is_emergency)
        self.assertIn("Darurat", res.emergency_title)
        # Check hotline presence in action steps
        actions_desc = " ".join([a.desc for a in res.actions])
        self.assertTrue("1500888" in actions_desc or "14017" in actions_desc or "14000" in actions_desc)

if __name__ == "__main__":
    unittest.main()
