import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRounds() {
  let rounds = 1;
  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }
  return rounds;
}

async function compare(providePassword, storedPassword) {
  return await bcryptjs.compare(providePassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
