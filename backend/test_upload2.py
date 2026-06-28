import asyncio
import httpx
import uuid

async def main():
    async with httpx.AsyncClient() as client:
        # Register user
        email = f"test_{uuid.uuid4()}@example.com"
        r = await client.post("http://localhost:8000/api/v1/auth/register", json={
            "email": email, 
            "password": "password123",
            "full_name": "Test Promoter",
            "role": "PROMOTER"
        })
        if r.status_code != 201:
            print("Register failed:", r.json())
            return
            
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test upload
        files = {"file": ("test.png", b"test content", "image/png")}
        r = await client.post("http://localhost:8000/api/v1/upload/avatar", files=files, headers=headers)
        print("Upload Response:", r.status_code, r.text)
        
        if r.status_code == 200:
            url = r.json().get("data", {}).get("url")
            print("URL:", url)
            
            # Test update profile
            r2 = await client.put("http://localhost:8000/api/v1/promoter/profile", json={"avatar_url": url}, headers=headers)
            print("Update Profile Response:", r2.status_code, r2.text)

asyncio.run(main())
