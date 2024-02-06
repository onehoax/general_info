export function reverseToken(token: string): string {
  let arr: string[] = token.split(".");
  arr = arr.reverse();
  return arr.join(".");
}
