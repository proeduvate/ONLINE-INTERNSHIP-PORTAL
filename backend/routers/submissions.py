from fastapi import APIRouter
from routers.tasks import get_submissions, create_submission, evaluate_submission

router = APIRouter()

router.add_api_route("", get_submissions, methods=["GET"])
router.add_api_route("/", get_submissions, methods=["GET"], include_in_schema=False)
router.add_api_route("", create_submission, methods=["POST"])
router.add_api_route("/", create_submission, methods=["POST"], include_in_schema=False)
router.add_api_route("/{submission_id}/evaluate", evaluate_submission, methods=["POST"])
