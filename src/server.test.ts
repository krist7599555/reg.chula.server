import * as request from "supertest";
import app from "./app";

test("API", async () => {
  const response = await request(app.callback()).get("/api");
  expect(response.status).toBe(200);
});
test("Login", async () => {
  const response = await request(app.callback()).get("/api/auth/sso");
  expect(response.status).toBe(200);
});
