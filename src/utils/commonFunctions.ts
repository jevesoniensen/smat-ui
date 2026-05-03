/**
 * Common Functions Utility
 * Maps from: Java Source/br/smat/util/FuncoesComuns.java
 * Provides common utility functions used throughout the application
 */
/**
 * Format CPF (Cadastro de Pessoas Físicas - Brazilian ID)
 * Input: "12345678901"
 * Output: "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
/**
 * Validate CPF
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cleaned[9]) === digit1 && parseInt(cleaned[10]) === digit2;
}
/**
 * Format CNPJ (Cadastro Nacional da Pessoa Jurídica - Brazilian business ID)
 * Input: "12345678901234"
 * Output: "12.345.678/9012-34"
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
/**
 * Validate CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  // Check if all digits are the same (invalid CNPJ)
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  // Validate first digit
  let sum = 0;
  const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multipliers1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  // Validate second digit
  sum = 0;
  const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * multipliers2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cleaned[12]) === digit1 && parseInt(cleaned[13]) === digit2;
}
/**
 * Format phone number
 * Input: "11999999999"
 * Output: "(11) 99999-9999"
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}
/**
 * Format ZIP code (CEP)
 * Input: "01234567"
 * Output: "01234-567"
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}
/**
 * Format currency to Brazilian Real
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}
/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}
/**
 * Parse date from DD/MM/YYYY to Date object
 */
export function parseDate(dateString: string): Date | null {
  const [day, month, year] = dateString.split('/');
  if (!day || !month || !year) return null;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return isNaN(date.getTime()) ? null : date;
}
/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}
/**
 * Clone object deeply
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Delay function (sleep)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Get URL query parameter
 */
export function getQueryParam(param: string): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}
/**
 * Set URL query parameter
 */
export function setQueryParam(param: string, value: string): void {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(param, value);
  window.history.replaceState({}, '', `?${searchParams.toString()}`);
}
