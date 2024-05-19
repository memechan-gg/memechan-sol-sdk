export const isSorted = <T>(array: T[], attribute: keyof T, order: "asc" | "desc" = "asc"): boolean => {
  if (array.length <= 1) {
    return true;
  }

  for (let i = 1; i < array.length; i++) {
    if (order === "asc" && array[i][attribute] < array[i - 1][attribute]) {
      return false;
    } else if (order === "desc" && array[i][attribute] > array[i - 1][attribute]) {
      return false;
    }
  }

  return true;
};

export const BE_URL = "https://14r6b4r6kf.execute-api.us-east-1.amazonaws.com/prod";
