from __future__ import annotations

from enum import Enum


class AppealToolError(Exception):
    """Base exception for user-facing failures."""


class UserInputError(AppealToolError):
    """The user supplied invalid or incomplete input."""


class DataErrorKind(str, Enum):
    UNKNOWN_DATASET = "unknown_dataset"
    TRANSIENT_HTTP = "transient_http"
    HTTP_ERROR = "http_error"
    INVALID_JSON = "invalid_json"
    INVALID_CACHE = "invalid_cache"
    NETWORK = "network"


class DataAccessError(AppealToolError):
    """A data source failed or returned unusable data."""

    def __init__(self, message: str, kind: DataErrorKind = DataErrorKind.NETWORK) -> None:
        super().__init__(message)
        self.kind = kind


class NotFoundError(AppealToolError):
    """The requested parcel or address was not found."""
