import { Request, Response } from "express";

export function logout() {
  return (request: Request, response: Response): void => {
    if (request.session) {
      request.session.destroy(() => response.redirect("http://localhost:8080/"));
    } else {
      response.redirect("/");
    }
  };
}
