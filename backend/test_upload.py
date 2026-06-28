import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # We need a token first
        r = await client.post("http://localhost:8000/api/v1/auth/login", json={"email": "promoter@example.com", "password": "password123"})
        if r.status_code != 200:
            print("Login failed:", r.json())
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
