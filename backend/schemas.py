from pydantic import BaseModel
from typing import List, Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user" 

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    tasks: List[TaskResponse] = []

    class Config:
        orm_mode = True
        
class Token(BaseModel):
    access_token: str
    token_type: str