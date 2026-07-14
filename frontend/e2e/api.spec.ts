import { test, expect } from "@playwright/test";

test.describe("API Health", () => {
  test("backend health endpoint returns healthy", async ({ request }) => {
    const resp = await request.get("http://localhost:8001/api/health");
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.status).toBe("healthy");
    expect(body.database).toBe("connected");
  });

  test("books endpoint returns 40 books", async ({ request }) => {
    const resp = await request.get("http://localhost:8001/api/books");
    expect(resp.ok()).toBeTruthy();
    const books = await resp.json();
    expect(books.length).toBe(40);
  });

  test("categories endpoint returns data", async ({ request }) => {
    const resp = await request.get("http://localhost:8001/api/categories");
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.categories.length).toBeGreaterThan(0);
  });
});
