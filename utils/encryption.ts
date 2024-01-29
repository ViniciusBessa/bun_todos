const encryptPassword = async (password: string): Promise<string> => {
  const encryptedPassword = await Bun.password.hash(password, 'bcrypt');
  return encryptedPassword;
};

const comparePassword = async (
  password: string,
  comparedString: string
): Promise<boolean> => {
  return await Bun.password.verify(comparedString, password, 'bcrypt');
};

export { encryptPassword, comparePassword };
