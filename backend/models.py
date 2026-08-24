from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base


class SecurityLog(Base):

    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)

    message = Column(String)

    score = Column(Integer)

    decision = Column(String)

    categories = Column(String)

    owasp = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )