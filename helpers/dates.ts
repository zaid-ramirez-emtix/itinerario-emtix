export const createLocalDate = (dateString: string) => {
  const dateParts = dateString.split('T')[0].split('-');
  return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
};
