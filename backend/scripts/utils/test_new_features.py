import unittest
try:
    import app
    from app import models
    from app.db import session as database
except ImportError:
    from . import app
    from . from app import models
    from . from app.db import session as database


class FeatureLogicTests(unittest.TestCase):
    def test_calculate_final_score_and_grade(self):
        result = app.calculate_final_score_and_grade(80, 70, 60)
        self.assertEqual(result["final_score"], 210)
        self.assertEqual(result["grade"], "B")

    def test_build_portfolio_payload(self):
        db = database.SessionLocal()
        try:
            user = models.User(
                name="Test Intern",
                email="testintern@example.com",
                hashed_password="x",
                role=models.UserRole.INTERN,
                college="Test College",
                progress_pct=50,
                attendance_pct=90,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            portfolio = app.build_portfolio_payload(user, db)
            self.assertEqual(portfolio["user_id"], user.id)
            self.assertEqual(portfolio["name"], "Test Intern")
            self.assertEqual(portfolio["college"], "Test College")
            self.assertEqual(portfolio["progress_pct"], 50)
            self.assertEqual(portfolio["attendance_pct"], 90)
        finally:
            db.query(models.User).filter(models.User.email == "testintern@example.com").delete()
            db.commit()
            db.close()


if __name__ == "__main__":
    unittest.main()
