import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta

import models
import schemas
import crud
import security
from database import engine, get_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("app_backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Primetrade Backend Internship Task", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login")

@app.post("/api/v1/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Attempting to register user: {user.username}")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        logger.warning(f"Registration failed: Username {user.username} already exists")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    return crud.create_user(db=db, user=user)


@app.post("/api/v1/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login request received for user: {form_data.username}")
    user = crud.get_user_by_username(db, username=form_data.username)
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        logger.error(f"Authentication failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username, "id": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except security.JWTError:
        raise credentials_exception
        
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user


@app.post("/api/v1/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.info(f"User {current_user.username} is creating a new task")
    return crud.create_user_task(db=db, task=task, user_id=current_user.id)


@app.get("/api/v1/tasks/", response_model=list[schemas.TaskResponse])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.info(f"User {current_user.username} is fetching tasks")
    if current_user.role == "admin":
        tasks = crud.get_tasks(db, skip=skip, limit=limit)
    else:
        tasks = crud.get_tasks_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return tasks


@app.put("/api/v1/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_endpoint(task_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
         raise HTTPException(status_code=404, detail="Task not found")
         
    if current_user.role != "admin" and db_task.owner_id != current_user.id:
        logger.warning(f"User {current_user.username} tried to edit task {task_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions to edit this task")
        
    logger.info(f"User {current_user.username} successfully updated task {task_id}")
    return crud.update_task(db, task_id, task)


@app.delete("/api/v1/tasks/{task_id}")
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
         raise HTTPException(status_code=404, detail="Task not found")
         
    if current_user.role != "admin" and db_task.owner_id != current_user.id:
        logger.warning(f"User {current_user.username} tried to delete task {task_id} without permission")
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this task")
        
    logger.info(f"User {current_user.username} successfully deleted task {task_id}")
    crud.delete_task(db, task_id)
    return {"message": "Task deleted successfully"}