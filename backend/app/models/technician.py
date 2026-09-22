from pydantic import BaseModel, Field


class TechnicianBase(BaseModel):
    name: str
    email: str
    phone: str
    avatar: str = ""
    avatarColor: str = "bg-blue-600"
    specialization: list[str] = Field(default_factory=list)
    experience: str = ""
    currentJobs: int = 0
    completedJobs: int = 0
    efficiency: int = Field(default=0, ge=0, le=100)
    availability: str = "Available"
    rating: float = Field(default=0, ge=0, le=5)
    skills: list[str] = Field(default_factory=list)
    shift: str = ""
    joinDate: str = ""
    certifications: list[str] = Field(default_factory=list)


class TechnicianCreate(TechnicianBase):
    pass


class TechnicianUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    specialization: list[str] | None = None
    experience: str | None = None
    currentJobs: int | None = None
    completedJobs: int | None = None
    efficiency: int | None = Field(default=None, ge=0, le=100)
    availability: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    skills: list[str] | None = None
    shift: str | None = None
    certifications: list[str] | None = None


class Technician(TechnicianBase):
    id: str
