import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { createUserSession, register } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fields?: { email?: string; password?: string; username?: string };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const username = form.get("username")?.toString();
  const fields = { email, password, username };

  if (!email || !password || !username) {
    return badRequest({ fields, formError: "missing fields" });
  }

  const userExists = await db.user.findFirst({ where: { email } });
  if (userExists) {
    return badRequest({
      fields,
      formError: `User with username ${username} already exists`,
    });
  }

  const user = await register({ email, password, username });

  return createUserSession(user.id, "/bikes");
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <h1>Register</h1>
      <form method="post">
        <label>Email</label>
        <input
          type="email"
          name="email"
          defaultValue={actionData?.fields?.email}
        />
        <label>Username</label>
        <input
          type="text"
          name="username"
          defaultValue={actionData?.fields?.username}
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          defaultValue={actionData?.fields?.password}
        />
        <button type="submit">Register</button>

        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
        </div>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </>
  );
}
