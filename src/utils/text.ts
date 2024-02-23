export const capitalize = (input: string) => input.charAt(0).toUpperCase() + input.slice(1);

export const joinAsSentence = (items: string[]) => {
  switch (items.length) {
    case 0:
      return '';
    case 1:
      return items[0];
    default:
      const last = items[items.length - 1];
      const rest = items.slice(0, items.length - 1);
      return [rest.join(', '), last].join(' and ');
  }
};

/**
 * Function that takes a string and returns a string only 30 characters long and ... characters
 * @param input string containing
 * @param limit number of characters to show
 * @returns  string containing
 */
export const truncate = (input: string, limit: number = 40): string => {
  if (input.length <= limit) {
    return input;
  }

  let inputSliced = input.slice(0, limit);

  if (input[limit] !== ' ' && input[limit - 1] !== ' ') {
    let indiceUltimoEspacio = inputSliced.lastIndexOf(' ');

    if (indiceUltimoEspacio !== -1) {
      inputSliced = inputSliced.slice(0, indiceUltimoEspacio);
    }
  }

  return `${inputSliced.trim()} ...`;
};
