/**
 * Formatting Utilities
 * Consolidated formatting and masking functions
 */

/**
 * Removes all non-digit characters from a string.
 */
export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Format CPF (Cadastro de Pessoas Físicas - Brazilian ID)
 * Input: "12345678901"
 * Output: "123.456.789-01"
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Format CEP (Brazilian postal code) with a hyphen (e.g., 99999-999).
 */
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length === 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
};

/**
 * Add Phone Mask (9999-9999)
 */
export const maskPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 4) return cleanValue;
  return `${cleanValue.substring(0, 4)}-${cleanValue.substring(4, 8)}`;
};

/**
 * Add Date Mask (DD/MM/YYYY)
 */
export const maskDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 4) return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2)}`;
  return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}/${cleanValue.substring(4, 8)}`;
};
