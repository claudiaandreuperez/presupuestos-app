export function escapeCsvField(value: string | number): string {
  const str = String(value);

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsvRow(fields: (string | number)[]): string {
  return fields.map(escapeCsvField).join(',');
}
