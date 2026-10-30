import database from "@/infra/database";
import password from "@/models/password";
import { NotFoundError, ValidationError } from "@/infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM 
          users
        WHERE 
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "O username informado não existe",
        action: "Verifique se o username informado está correto",
      });
    }

    return result.rows[0] || null;
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3) 
        RETURNING 
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `
        UPDATE 
          users
        SET 
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('utc', now())
        WHERE 
          id = $4
        RETURNING 
          *
        ;`,
      values: [
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.id,
      ],
    });

    return result.rows[0];
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `
        SELECT EXISTS(
          SELECT 1
          FROM 
            users 
          WHERE 
            LOWER(username) = LOWER($1)
        );
`,
    values: [username],
  });

  if (result.rows[0].exists) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado",
      action: "Utilize outro username para realizar esta operação",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
        SELECT EXISTS(
          SELECT 1
          FROM 
            users 
          WHERE 
            LOWER(email) = LOWER($1)
        );
      `,
    values: [email],
  });

  if (result.rows[0].exists) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado",
      action: "Utilize outro email para realizar esta operação",
    });
  }
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
