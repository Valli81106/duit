export const getCurrentMonth = () => {
  const date = new Date();

  return date.toLocaleString("default", {
    month: "long",
  });
};
