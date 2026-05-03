/**
 * Form Validation Utilities
 * Migrated from br.smat.util.ValidacoesFormulario.java
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Removes all non-digit characters from a string.
 */
export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formats a phone number with a hyphen (e.g., 9999-9999 or 99999-9999).
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = removeNonDigits(value);
  if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{4})(\d{0,4})/, '$1-$2');
  }
  return cleaned.replace(/(\d{5})(\d{4})/, '$1-$2');
};

/**
 * Formats a CEP (Brazilian postal code) with a hyphen (e.g., 99999-999).
 */
export const formatCEP = (value: string): string => {
  const cleaned = removeNonDigits(value);
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Unformats a CEP by removing the hyphen.
 */
export const unformatCEP = (value: string): string => {
  return value.replace('-', '');
};

/**
 * Validate required field
 */
export const isRequired = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return value.trim().length > 0;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Brazilian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\(\d{2}\)|\d{2})\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate CPF (Brazilian tax ID)
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = removeNonDigits(cpf);

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11), 10)) return false;

  return true;
};

/**
 * Validate CNPJ (Brazilian business tax ID)
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = removeNonDigits(cnpj);

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) return false;

  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) return false;

  return true;
};

/**
 * Validate date format (DD/MM/YYYY or YYYY-MM-DD)
 */
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2})$/;
  if (!dateRegex.test(date)) return false;

  const dateParts = date.includes('/')
    ? date.split('/')
    : date.split('-').reverse();
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const year = parseInt(dateParts[2], 10);

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};

/**
 * Validate accident form data
 */
export const validateAcidenteForm = (
  formData: Record<string, any>
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Add specific validation rules as needed
  if (!isRequired(formData.descricao)) {
    errors.push({
      field: 'descricao',
      message: 'Descrição é obrigatória',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all accident form fields
 */
export const validateAllFields = (
  formData: Record<string, any>,
  requiredFields: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  requiredFields.forEach((field) => {
    if (!isRequired(formData[field])) {
      errors.push({
        field,
        message: `${field} é obrigatório`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
