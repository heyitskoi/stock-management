from fastapi import FastAPI

app = FastAPI(title="Stock Management System")


@app.get("/")
def read_root():
    return {"message": "Stock Management API"}
