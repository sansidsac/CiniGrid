// This file contains a mix of correct code and intentional errors for PR review testing.

// Correct: simple add
export function add(a: number, b: number): number {
  return a + b;
}

// Intentional syntax error: missing closing brace
export function brokenSyntax(a: number, b: number): number {
  return a + b

// Intentional type error: assigning number to string
export const wrongType: string = 42;

// Correct: a small utility
export const greet = (name: string) => `Hello, ${name}`;

// Intentional runtime error: referencing undefined variable
export function runtimeError() {
  // @ts-ignore - we want a runtime issue
  return doesNotExist + 1;
}
