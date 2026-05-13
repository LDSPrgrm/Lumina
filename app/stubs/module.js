export const createRequire = () => {
  return () => {
    throw new Error('createRequire is not supported in the browser');
  };
};

export default {
  createRequire
};
