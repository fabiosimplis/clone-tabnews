import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, NotFoundError } from "infra/errors.js";

async function getAuthenticatedUser(provideEmail, providePassword) {
  try {
    const storedUser = await findByEmail(provideEmail);
    await validatePassword(providePassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
    throw error;
  }

  async function findByEmail(provideEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(provideEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email errado",
          action: "Verifique se este dado está correto.",
        });
      }
      throw error;
    }
    return storedUser;
  }

  async function validatePassword(providePassword, storedPassword) {
    const correctpasswordMatch = await password.compare(
      providePassword,
      storedPassword,
    );

    if (!correctpasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha errada",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
